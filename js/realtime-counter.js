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
    const countEl = document.getElementById('active-devices');
    if (countEl) {
        countEl.innerText = count;
        countEl.style.transform = "scale(1.2)";
        setTimeout(() => countEl.style.transform = "scale(1)", 300);
    }

    // Update Daftar Detail
    let listEl = document.getElementById('device-list');
    if (!listEl) {
        // Buat elemen list jika belum ada
        const container = document.querySelector('.card') || document.body;
        listEl = document.createElement('div');
        listEl.id = 'device-list';
        listEl.style.marginTop = "20px";
        listEl.style.fontSize = "0.85em";
        listEl.style.textAlign = "left";
        listEl.style.borderTop = "1px solid #eee";
        listEl.style.paddingTop = "10px";
        container.appendChild(listEl);
    }

    if (devices.length > 0) {
        listEl.innerHTML = `<strong>Rincian Perangkat:</strong><ul style="list-style:none; padding:0; margin:5px 0 0 0;">` +
            devices.map(d => `
                <li style="margin-bottom:5px; padding:5px; background:#f9f9f9; border-radius:4px;">
                    <span style="color:#2ecc71;">●</span> 
                    <strong>${d.device}</strong> (${d.browser}) 
                    <br><span style="color:#7f8c8d; font-size:0.9em; margin-left:15px;">📍 ${d.location || 'Unknown'}</span>
                </li>
            `).join('') + `</ul>`;
    } else {
        listEl.innerHTML = "";
    }
}

function simulateLiveCounter() {
    console.log("Menjalankan mode simulasi Live Counter...");
    updateCounterUI(1, [{ device: "Desktop", browser: "Chrome", location: "Demo City, Demo Country" }]);
}

document.addEventListener('DOMContentLoaded', initCounter);
