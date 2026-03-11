// jarvis.js
const Jarvis = {
    isMuted: false,
    synth: window.speechSynthesis,

    say: function(text) {
        if (this.isMuted) return;

        // Hentikan suara yang sedang berjalan agar tidak menumpuk/gema
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID'; // Bahasa Indonesia
        utterance.rate = 1;       // Kecepatan normal
        utterance.pitch = 1;      // Nada normal

        this.synth.speak(utterance);
    },

    toggleMute: function() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('btn-mute-toggle');
        if (btn) {
            btn.innerHTML = this.isMuted ? "🔊 Nyalakan Suara" : "🔇 Matikan Suara";
            btn.style.background = this.isMuted ? "#27ae60" : "#e74c3c";
        }
    },

    // Fungsi aktivasi (untuk mematuhi aturan autoplay browser)
    activate: function() {
        // SpeechSynthesis memerlukan interaksi pengguna (sudah dipenuhi klik tombol)
        this.isMuted = false;
        
        // Bicara sapaan awal
        this.say("Halo tuan, saya Jarvis. Silahkan isi form berikut. Saya akan memandu Anda langkah demi langkah.");
        
        // Tampilkan tombol toggle
        const btn = document.getElementById('btn-mute-toggle');
        if (btn) btn.style.display = 'block';
    },

    pandu: function(tahap) {
        const pesan = {
            'tanggal': "Silahkan pilih tanggal pekerjaan.",
            'lokasi': "Tentukan lokasi pekerjaan.",
            'foto_sebelum': "Upload foto sebelum.",
            'foto_proses': "Upload foto proses.",
            'foto_sesudah': "Upload foto sesudah.",
            'keterangan': "Masukkan detail keterangan pekerjaan di kolom yang tersedia.",
            'selesai': "Semua selesai, silahkan simpan ke riwayat.",
        };
        if (pesan[tahap]) this.say(pesan[tahap]);
    }
};
