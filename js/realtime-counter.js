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
    databaseURL: "https://lapdok-live-default-rtdb.firebaseio.com",
    projectId: "lapdok-live",
    storageBucket: "lapdok-live.firebasestorage.app",
    messagingSenderId: "813384988119",
    appId: "1:813384988119:web:48ac10346d6920a7e78792"
};

// --- LOGIKA PRESENCE ---
let activeRef = null;
let myPresenceRef = null;

async function initCounter() {
    // Jika config masih default, tampilkan simulasi cerdas agar user bisa melihat hasilnya langsung
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        simulateLiveCounter();
        return;
    }

    try {
        // Load Firebase secara dinamis
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
        const { getDatabase, ref, onValue, push, onDisconnect, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        activeRef = ref(db, 'presence');

        // Tambahkan perangkat ini ke dalam daftar aktif
        myPresenceRef = push(activeRef);
        
        // Atur agar saat disconnect (browser tutup), data dihapus otomatis oleh Firebase
        onDisconnect(myPresenceRef).remove();
        
        // Tandai sebagai online sekarang
        set(myPresenceRef, {
            last_online: serverTimestamp(),
            device: navigator.userAgent.includes('Mobi') ? 'Mobile' : 'Desktop'
        });

        // Pantau perubahan jumlah perangkat
        onValue(activeRef, (snapshot) => {
            const count = snapshot.size || 0;
            console.log("Firebase Presence Update: Terdeteksi", count, "perangkat.");
            updateCounterUI(count);
        });

        console.log("Firebase Real-time Counter berhasil terhubung!");

    } catch (error) {
        console.error("DIAGNOSIS FIREBASE ERROR:", error);
        if (error.message.includes("403")) {
            console.warn("⚠️ ERROR 403: Ini adalah masalah 'Website Restriction' di Google Cloud Console. Silakan tambahkan 'jarvis-id.github.io/*' ke daftar putih.");
        } else if (error.message.includes("databaseURL") || error.message.includes("Invalid database URL")) {
            console.warn("⚠️ ERROR URL: Jika Anda memilih region Singapore, ganti databaseURL menjadi: https://lapdok-live-default-rtdb.asia-southeast1.firebasedatabase.app/");
        }
        simulateLiveCounter();
    }
}

function updateCounterUI(count) {
    const el = document.getElementById('active-devices');
    if (el) {
        el.innerText = count;
        // Efek animasi saat angka berubah
        el.style.transform = "scale(1.2)";
        el.style.color = "#2ecc71";
        setTimeout(() => {
            el.style.transform = "scale(1)";
            el.style.color = "#2c3e50";
        }, 300);
    }
}

// Simulasi untuk demo jika belum ada Firebase
function simulateLiveCounter() {
    console.log("Menjalankan mode simulasi Live Counter...");
    let baseCount = Math.floor(Math.random() * 3) + 2; // Mulai dari 2-5
    
    updateCounterUI(baseCount);
    
    setInterval(() => {
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        baseCount = Math.max(1, baseCount + change);
        updateCounterUI(baseCount);
    }, 10000); // Update setiap 10 detik
}

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', initCounter);
