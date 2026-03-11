// jarvis.js (Tambahkan fungsi toggleMute)
const Jarvis = {
    isInitialized: false,
    isMuted: false, // Status awal: suara menyala

    say: function(text) {
        if (this.isMuted) return; 
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        audio.play().catch(e => console.log("Audio diblokir"));
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

    init: function() {
        if (this.isInitialized) return;
        const triggerSapaan = () => {
            if (this.isInitialized) return;
            this.say("Halo tuan, silahkan isi form berikut. Setelah anda mengisinya saya akan lanjut memandu kembali di form berikutnya.");
            this.isInitialized = true;
            document.removeEventListener('click', triggerSapaan);
        };
        document.addEventListener('click', triggerSapaan);
    },

    pandu: function(tahap) {
        const pesan = {
            'tanggal': "Silahkan pilih tanggal pekerjaan.",
            'lokasi': "Tentukan lokasi pekerjaan.",
            'foto_sebelum': "Upload foto sebelum.",
            'foto_proses': "Upload foto proses.",
            'foto_sesudah': "Upload foto sesudah.",
            'keterangan': "Masukkan detail keterangan pekerjaan di kolom yang tersedia.",
            'selesai': "Silahkan simpan ke riwayat.",
        };
        if (pesan[tahap]) this.say(pesan[tahap]);
    }
};
Jarvis.init();