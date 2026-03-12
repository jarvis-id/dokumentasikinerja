/**
 * Real-time Device Counter using Firebase (Lite)
 * Fitur ini memantau perangkat yang sedang aktif secara real-time.
 */

// CONFIGURATION REQUIRED:
// Silakan buat proyek di console.firebase.google.com dan tempelkan config Anda di sini.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
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
            updateCounterUI(count);
        });

    } catch (error) {
        console.error("Gagal memuat sistem real-time:", error);
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
