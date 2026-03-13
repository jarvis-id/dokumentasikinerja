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

/// Fungsi untuk mendapatkan informasi browser dan perangkat
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

    // Deteksi yang lebih akurat untuk perangkat mobile
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) device = "Mobile";
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
    
    if (!countEl) {
        injectCounterWidget();
        countEl = document.getElementById('active-devices');
    }

    if (countEl) {
        countEl.innerText = count;
        countEl.style.transform = "scale(1.3)";
        setTimeout(() => countEl.style.transform = "scale(1)", 300);
    }

    const listEl = document.getElementById('device-list');
    if (listEl) {
        if (devices.length > 0) {
            listEl.innerHTML = devices.map(d => `
                <div style="margin-bottom:10px; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:11px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#fff;">${d.device}</strong>
                        <span style="font-size:9px; background:#3498db; color:white; padding:1px 6px; border-radius:10px;">${d.browser}</span>
                    </div>
                    <div style="color:#bdc3c7; margin-top:3px; font-size:10px;">📍 ${d.location || 'Unknown'}</div>
                </div>
            `).join('');
            listEl.style.display = "block";
        } else {
            listEl.style.display = "none";
        }
    }
}

function injectCounterWidget() {
    const isMobile = window.innerWidth <= 768;
    
    const style = document.createElement('style');
    style.innerHTML = `
        .counter-widget {
            background: rgba(44, 62, 80, 0.95);
            backdrop-filter: blur(10px);
            color: white;
            padding: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            font-family: 'Segoe UI', sans-serif;
            border: 1px solid rgba(255,255,255,0.1);
            z-index: 9999;
        }
        @media (min-width: 769px) {
            .counter-widget {
                position: fixed;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                width: 260px;
                border-radius: 16px;
                animation: slideInRight 0.5s ease;
            }
        }
        @media (max-width: 768px) {
            .counter-widget {
                position: relative;
                width: 100%;
                max-width: 450px;
                margin: 20px auto;
                border-radius: 12px;
                box-sizing: border-box;
            }
        }
        @keyframes slideInRight { from { transform: translate(100%, -50%); opacity:0; } to { transform: translate(0, -50%); opacity:1; } }
        .presence-dot { width: 10px; height: 10px; border-radius: 50%; background: #2ecc71; box-shadow: 0 0 8px #2ecc71; }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.className = 'counter-widget';
    widget.id = 'live-traffic-widget';
    widget.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="presence-dot"></div>
                <span style="font-size:10px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#bdc3c7;">Aktivitas Real-time</span>
            </div>
            <div>
                <span id="active-devices" style="font-size:20px; font-weight:bold; color:#fff;">1</span>
                <span style="font-size:10px; color:#bdc3c7; margin-left:3px;">Online</span>
            </div>
        </div>
        <div id="device-list" style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px; display:none;"></div>
    `;

    // LOGIKA PENEMPATAN
    if (!isMobile) {
        // Desktop: Append ke body sebagai fixed sidebar
        document.body.appendChild(widget);
    } else {
        // Mobile: Cari elemen navigasi cepat/tombol untuk ditaruh di bawahnya
        const quickNav = document.querySelector('.quick-nav') || document.querySelector('.actions') || document.querySelector('.main-content');
        if (quickNav) {
            quickNav.parentNode.insertBefore(widget, quickNav.nextSibling);
        } else {
            document.body.appendChild(widget);
        }
    }
    
    const existing = document.querySelector('.live-card');
    if (existing) existing.style.display = 'none';
}

function simulateLiveCounter() {
    console.log("Menjalankan mode simulasi Live Counter...");
    updateCounterUI(1, [{ device: "Desktop", browser: "Chrome", location: "Demo City, Indonesia" }]);
}

document.addEventListener('DOMContentLoaded', initCounter);
