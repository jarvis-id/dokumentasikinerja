# 📑 Dokumentasi Proyek: Dokumentasi Kinerja (LapDok)

Proyek ini adalah aplikasi web statis satu halaman (**Single Page Application**) berbasis PWA yang dirancang untuk dokumentasi laporan pekerjaan lapangan. Aplikasi ini dioptimalkan untuk penggunaan mobile dan memiliki fitur utama **Print-to-PDF** yang presisi untuk laporan formal.

## 🚀 Arsitektur & Teknologi
*   **Bahasa Utama:** Vanilla JavaScript (ES6+), HTML5, CSS3.
*   **Pemetaan (Maps):** [Leaflet.js](https://leafletjs.org/) dengan Tile Google Hybrid (Satelit).
*   **Geocoding:** ESRI World Geocoding (Pencarian Lokasi) & Nominatim API (Reverse Geocoding Alamat).
*   **Penyimpanan:** `localStorage` dengan sistem **Kompresi Gambar Otomatis** (JPEG 0.7) untuk efisiensi ruang browser.
*   **PWA:** Support Manifest & Service Worker untuk instalasi di Android/iOS (Add to Home Screen).

## 📂 Struktur File
- `index.html` : Halaman input data utama, sistem pemetaan modal, dan manajemen draft.
- `tampildata.html` : Halaman manajemen riwayat, filter data berjenjang, dan engine cetak detail masal.
- `manifest.json` : Konfigurasi identitas aplikasi PWA.
- `sw.js` : Service worker minimal untuk fungsionalitas aplikasi offline/instalasi.

## 🛠 Aturan Pengembangan (System Instructions)
Jika proyek ini dilanjutkan kembali di masa depan (oleh manusia atau AI), instruksi teknis berikut **wajib** dipatuhi:

1.  **Tanpa Framework:** Dilarang menambah library/framework berat (React, Vue, jQuery). Tetap gunakan Vanilla JS untuk performa maksimal.
2.  **Integritas Cetak (PDF):**
    *   Gunakan unit `mm` (milimeter) pada CSS `@media print` untuk akurasi kertas A4.
    *   **Aturan Chunking:** Setiap halaman cetak wajib berisi maksimal **3 Item Pekerjaan**.
    *   Setiap halaman wajib memiliki **Header Statis** di atas dan **Nomor Halaman** di sudut kiri bawah.
    *   Gunakan `object-fit: contain` pada foto agar tidak terjadi distorsi (memanjang/melebar).
3.  **Optimalisasi Storage:** Fungsi `compressImage` harus selalu dipanggil sebelum menyimpan data Base64 ke `localStorage`.
4.  **Filter Berjenjang:** Logika filter pada `tampildata.html` harus mendukung Tahun -> Bulan -> Tanggal Spesifik/Semua Tanggal.

## 🌟 Fitur Unggulan Terpasang
*   ✅ **Auto-Save Draft:** Data input tidak hilang saat halaman di-refresh.
*   ✅ **Mapping Pintar:** Penentuan titik via peta satelit dan link otomatis ke Google Maps.
*   ✅ **Cetak Masal Detail:** Menghasilkan PDF rapi yang berisi detail foto (Sebelum, Proses, Sesudah), Alamat, Koordinat, dan Keterangan.
*   ✅ **Pagination Engine:** Penomoran halaman otomatis (Halaman X dari Y) pada hasil cetak.

## 📝 Instruksi Melanjutkan Proyek (Untuk AI)
Gunakan prompt berikut jika ingin melanjutkan pengembangan dengan asisten AI:
> "Saya ingin melanjutkan proyek 'Dokumentasi Kinerja'. Aplikasi ini menggunakan Vanilla JS, Leaflet.js, dan sistem storage localStorage. Fokus utama aplikasi adalah cetak PDF A4 dengan aturan 3 item per halaman. Sistem sudah memiliki fitur kompresi gambar dan filter riwayat. Saya akan memberikan kode `index.html` dan `tampildata.html`. Tolong bantu saya untuk [Sebutkan Fitur Baru] dengan tetap mempertahankan struktur koding dan aturan media print yang sudah ada."

## 📈 Rencana Pengembangan (Roadmap)
- [ ] Integrasi Cloud Database (Supabase/Firebase) untuk sinkronisasi antar perangkat.
- [ ] Fitur Watermark otomatis (GPS & Timestamp) langsung di dalam file gambar.
- [ ] Ekspor data riwayat ke format Excel (.xlsx) atau CSV.
- [ ] Fitur tanda tangan digital pada akhir laporan.

---
**Dibuat oleh:** Senior Full-stack Web Developer Specialist.
**Update Terakhir:** Layout Cetak Optimal (3 Item/Page + Pagination).
