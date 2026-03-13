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

// Fungsi untuk mendapatkan informasi browser dan perangkat (LAMA & MODERN)
function getBaseBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Browser";
    let device = "Desktop";
    let brand = "";
    let model = "";
    let os = "OS";

    // 1. Deteksi OS dasar
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Macintosh")) os = "macOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";

    // 2. Deteksi Browser
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Edge")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    // 3. Deteksi Tipe Perangkat
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        device = "Mobile";
    }
    if (/iPad|tablet/i.test(ua)) {
        device = "Tablet";
    }

    // 4. Deteksi Merek & Model (Parsing Teks)
    if (os === "iOS") {
        brand = "Apple";
        model = ua.includes("iPhone") ? "iPhone" : "iPad";
    } else if (os === "Android") {
        // Ekstraksi model dari Android UA: (Linux; Android 10; SM-G960F)
        const match = ua.match(/Android\s+[^;]+;\s+([^;)]+)/);
        if (match) {
            model = match[1].split('Build')[0].trim();
            if (/SM-|GT-|SHV-/i.test(model)) brand = "Samsung";
            else if (/Mi |Redmi/i.test(model)) brand = "Xiaomi";
            else if (/CPH|PCH|PB|PA/i.test(model)) brand = "Oppo";
            else if (/V20|V21|V19/i.test(model)) brand = "Vivo";
            else if (/RMX/i.test(model)) brand = "Realme";
        }
    } else {
        brand = os; // Desktop menggunakan OS sebagai merek
        model = os;
    }

    return { browser, device, brand, model, os };
}

// Fungsi pembungkus (Async) untuk mendapatkan data lebih akurat jika browser mendukung
async function getEnhancedInfo() {
    let info = getBaseBrowserInfo();

    // Gunakan modern User-Agent Client Hints jika tersedia (lebih akurat)
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            const hints = await navigator.userAgentData.getHighEntropyValues(['model', 'platform', 'platformVersion']);
            if (hints.model) info.model = hints.model;
            if (hints.platform) info.os = hints.platform;
        } catch (e) {}
    }
    
    console.log("Full Deteksi:", info);
    return info;
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

        const info = await getEnhancedInfo();
        const location = await getLocation();

        myPresenceRef = push(activeRef);
        onDisconnect(myPresenceRef).remove();
        
        set(myPresenceRef, {
            last_online: serverTimestamp(),
            device: info.device,
            brand: info.brand,
            model: info.model,
            os: info.os,
            browser: info.browser,
            location: location
        });

        onValue(activeRef, (snapshot) => {
            const data = snapshot.val() || {};
            const devices = Object.values(data);
            updateCounterUI(devices.length, devices);
        });

    } catch (error) {
        console.error("FIREBASE ERROR:", error);
        simulateLiveCounter();
    }
}

function updateCounterUI(count, devices = []) {
    let countEl = document.getElementById('active-devices');
    
    if (!countEl) {
        injectCounterWidget();
        countEl = document.getElementById('active-devices');
    }

    if (countEl) {
        countEl.innerText = count;
        countEl.style.transform = "scale(1.2)";
        setTimeout(() => countEl.style.transform = "scale(1)", 300);
    }

    // Update Daftar Detail
    let listEl = document.getElementById('device-list');
    if (!listEl && countEl) {
        listEl = document.createElement('div');
        listEl.id = 'device-list';
        listEl.style.borderTop = "1px solid rgba(0,0,0,0.1)";
        listEl.style.marginTop = "10px";
        listEl.style.paddingTop = "10px";
        listEl.style.width = "100%";
        
        const parent = countEl.closest('.live-card') || countEl.parentElement.parentElement;
        parent.style.flexWrap = "wrap"; 
        parent.appendChild(listEl);
    }

    if (listEl) {
        if (devices.length > 0) {
            listEl.innerHTML = `<strong>Rincian Perangkat:</strong><ul style="list-style:none; padding:0; margin:10px 0 0 0;">` +
                devices.map(d => `
                    <li style="margin-bottom:8px; padding:10px; background:rgba(0,0,0,0.03); border-radius:8px; font-size:11px; border:1px solid rgba(0,0,0,0.05); color: #2c3e50;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong>${d.brand || ''} ${d.model || d.device || 'Perangkat Online'}</strong>
                            <span style="font-size:9px; background:#3498db; color:white; padding:2px 8px; border-radius:10px;">${d.browser || 'Browser'}</span>
                        </div>
                        <div style="color:#7f8c8d; margin-top:4px;">📍 ${d.location || 'Lokasi Tersembunyi'}</div>
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
        ">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:10px; height:10px; background:#2ecc71; border-radius:50%; box-shadow:0 0 5px #2ecc71;"></div>
                    <span style="font-size:10px; font-weight:bold; color:#7f8c8d; text-transform:uppercase; letter-spacing:1px;">Aktivitas Real-time</span>
                </div>
                <div>
                    <span id="active-devices" style="font-size:20px; font-weight:bold; color:#2c3e50;">1</span>
                    <span style="font-size:12px; color:#95a5a6; margin-left:5px;">Online</span>
                </div>
            </div>
            <div id="device-list" style="border-top:1px solid #eee; paddingTop:10px; display:none;"></div>
        </div>
    `;

    const container = document.querySelector('.main-content') || document.querySelector('.container') || document.body;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = widgetHTML;
    
    if (container.firstChild) {
        container.insertBefore(wrapper.firstElementChild, container.firstChild);
    } else {
        container.appendChild(wrapper.firstElementChild);
    }
}

function simulateLiveCounter() {
    console.log("Menjalankan mode simulasi Live Counter...");
    updateCounterUI(1, [{ device: "Desktop", browser: "Chrome", location: "Demo City, Indonesia" }]);
}

document.addEventListener('DOMContentLoaded', initCounter);
