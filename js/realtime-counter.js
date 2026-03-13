/**
 * Real-time Device Counter using Firebase (Lite)
 * Fitur ini memantau perangkat yang sedang aktif secara real-time.
 */

// CONFIGURATION:
// Step 1: Login to console.firebase.google.com
// Step 2: Regenerate your API key if it was leaked.
// Step 3: RESTRICT your API key to your domain (jarvis-id.github.io/*) in Google Cloud Console.
const firebaseConfig = {
    apiKey: "AIzaSyCh9Rsoy_mLyKUqIZaQXcxow3Q79dv00ZE", // Kunci baru yang aman dan terbatas
    authDomain: "lapdok-live.firebaseapp.com",
    databaseURL: "https://lapdok-live-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "lapdok-live",
    storageBucket: "lapdok-live.firebasestorage.app",
    messagingSenderId: "813384988119",
    appId: "1:813384988119:web:48ac10346d6920a7e78792"
};

// --- LOGIKA PRESENCE ---
let activeRef = null;
let myPresenceRef = null;

// Fungsi untuk mendapatkan informasi browser dan perangkat
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let device = "Desktop";

    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Trident")) browser = "IE";
    else if (ua.includes("Edge")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    if (/Mobi|Android|iPhone/i.test(ua)) device = "Mobile";
    else if (/Tablet|iPad/i.test(ua)) device = "Tablet";

    return { browser, device };
}

// Fungsi untuk mendapatkan lokasi via IP API
async function getLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return `${data.city}, ${data.country_name}`;
    } catch (e) {
        return "Lokasi Tidak Diketahui";
    }
}

async function initCounter() {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        simulateLiveCounter();
        return;
    }

    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
        const { getDatabase, ref, onValue, push, onDisconnect, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        activeRef = ref(db, 'presence');

        // Ambil data detail
        const { browser, device } = getBrowserInfo();
        const location = await getLocation();

        myPresenceRef = push(activeRef);
        onDisconnect(myPresenceRef).remove();
        
        set(myPresenceRef, {
            last_online: serverTimestamp(),
            device: device,
            browser: browser,
            location: location
        });

        onValue(activeRef, (snapshot) => {
            const data = snapshot.val() || {};
            const devices = Object.values(data);
            updateCounterUI(devices.length, devices);
        });

        console.log("Firebase Real-time Counter berhasil terhubung!");

    } catch (error) {
        console.error("DIAGNOSIS FIREBASE ERROR:", error);
        simulateLiveCounter();
    }
}

function updateCounterUI(count, devices = []) {
    let countEl = document.getElementById('active-devices');
    
    // Jika elemen tidak ada, buat widget secara dinamis
    if (!countEl) {
        injectCounterWidget();
        countEl = document.getElementById('active-devices');
    }

    if (countEl) {
        countEl.innerText = count;
        countEl.style.transform = "scale(1.3)";
        setTimeout(() => countEl.style.transform = "scale(1)", 300);
    }

    // Update Daftar Detail
    let listEl = document.getElementById('device-list');
    if (!listEl && countEl) {
        // Jika list belum ada tapi counter ada (seperti di Home), sisipkan list di bawah parent counter
        listEl = document.createElement('div');
        listEl.id = 'device-list';
        listEl.style.borderTop = "1px solid #eee";
        listEl.style.marginTop = "10px";
        listEl.style.paddingTop = "10px";
        
        // Cari parent terdekat yang cocok (seperti live-card di Home atau dynamic widget)
        const parent = countEl.closest('.live-card') || countEl.parentElement.parentElement;
        parent.appendChild(listEl);
    }

    if (listEl) {
        if (devices.length > 0) {
            listEl.innerHTML = `<strong>Rincian Perangkat:</strong><ul style="list-style:none; padding:0; margin:8px 0 0 0;">` +
                devices.map(d => `
                    <li style="margin-bottom:8px; padding:8px; background:rgba(0,0,0,0.03); border-radius:6px; font-size:12px; border:1px solid rgba(0,0,0,0.05);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong>${d.device}</strong>
                            <span style="font-size:10px; background:#3498db; color:white; padding:2px 6px; border-radius:10px;">${d.browser}</span>
                        </div>
                        <div style="color:#7f8c8d; margin-top:3px;">📍 ${d.location || 'Unknown'}</div>
                    </li>
                `).join('') + `</ul>`;
            listEl.style.display = "block";
        } else {
            listEl.style.display = "none";
        }
    }
}

function injectCounterWidget() {
    const widgetHTML = `
        <div id="dynamic-live-counter" style="
            background: white;
            border-radius: 12px;
            padding: 15px;
            margin: 20px auto;
            max-width: 450px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            font-family: sans-serif;
            border: 1px solid #eee;
            position: relative;
            z-index: 9999;
        ">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:10px; height:10px; background:#2ecc71; border-radius:50%; box-shadow:0 0 5px #2ecc71;"></div>
                    <span style="font-size:10px; font-weight:bold; color:#7f8c8d; text-transform:uppercase; letter-spacing:1px;">Aktivitas Real-time</span>
                </div>
                <div>
                    <span id="active-devices" style="font-size:20px; font-weight:bold; color:#2c3e50;">1</span>
                    <span style="font-size:12px; color:#95a5a6; margin-left:5px;">Aktif</span>
                </div>
            </div>
            <div id="device-list" style="border-top:1px solid #eee; paddingTop:10px; display:none;"></div>
        </div>
    `;

    // Cari lokasi terbaik untuk menyisipkan widget
    const mainContent = document.querySelector('.main-content') || document.querySelector('.container') || document.body;
    
    // Sisipkan di bagian atas main content
    const wrapper = document.createElement('div');
    wrapper.innerHTML = widgetHTML;
    
    if (mainContent.firstChild) {
        mainContent.insertBefore(wrapper.firstElementChild, mainContent.firstChild);
    } else {
        mainContent.appendChild(wrapper.firstElementChild);
    }
}

function simulateLiveCounter() {
    console.log("Menjalankan mode simulasi Live Counter...");
    updateCounterUI(1, [{ device: "Desktop", browser: "Chrome", location: "Demo City, Demo Country" }]);
}

document.addEventListener('DOMContentLoaded', initCounter);
