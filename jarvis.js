// jarvis.js
const Jarvis = {
    isInitialized: false,
    isMuted: false, // Status awal: suara menyala
    isReady: false, // Status untuk memastikan browser mengizinkan audio

    say: function(text) {
        // Jika dimute atau belum diaktivasi user, batalkan suara
        if (this.isMuted || !this.isReady) return; 
        
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        audio.play().catch(e => console.log("Audio diblokir oleh browser:", e));
    },

    // Fungsi untuk mengaktifkan sistem suara secara resmi setelah klik tombol
    activate: function() {
        this.isReady = true;
        this.isMuted = false;
        
        // Sapaan awal setelah tombol aktivasi diklik
        this.say("Halo tuan, silahkan isi form berikut.");
        
        // Tampilkan tombol mute jika ada
        const btn = document.getElementById('btn-mute-toggle');
        if (btn) {
            btn.style.display = 'block';
            btn.innerHTML = "🔇 Matikan Suara";
            btn.style.background = "#e74c3c";
        }
    },

    // Fungsi Toggle ON/OFF
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('btn-mute-toggle');
        if (btn) {
            btn.innerHTML = this.isMuted ? "🔊 Nyalakan Suara" : "🔇 Matikan Suara";
            btn.style.background = this.isMuted ? "#27ae60" : "#e74c3c";
        }
        return this.isMuted;
    },

    // Inisialisasi awal (tanpa trigger otomatis yang menyebabkan gema)
    init: function() {
        this.isInitialized = true;
    },

    pandu: function(tahap) {
        const pesan = {
            'tanggal': "Silahkan pilih tanggal pekerjaan.",
            'lokasi': "Tentukan lokasi pekerjaan.",
            'foto_sebelum': "Upload foto sebelum.",
            'foto_proses': "Upload foto proses.",
            'foto_sesudah': "Upload foto sesudah.",
            'keterangan': "Masukkan detail pekerjaan.",
            'selesai': "Silahkan simpan ke riwayat.",
        };
        if (pesan[tahap]) this.say(pesan[tahap]);
    }
};

// Inisialisasi sistem
Jarvis.init();
