# 📑 Dokumentasi Proyek: Dokumentasi Kinerja (LapDok)

Proyek ini adalah aplikasi web statis satu halaman (**Single Page Application**) berbasis PWA yang dirancang untuk dokumentasi laporan pekerjaan lapangan secara profesional. Aplikasi ini dioptimalkan sepenuhnya untuk penggunaan smartphone dan memiliki fitur utama **Engine Print-to-PDF Presisi** yang menjamin hasil laporan rapi tanpa gangguan tata letak.

## 🚀 Arsitektur & Teknologi
*   **Bahasa Utama:** Vanilla JavaScript (ES6+), HTML5, CSS3.
*   **Pemetaan (Maps):** [Leaflet.js](https://leafletjs.org/) dengan Tile Google Hybrid (Satelit).
*   **GPS Hardware:** Geolocation API dengan *High Accuracy* mode untuk akurasi koordinat maksimal.
*   **Geocoding:** ESRI World Geocoding (Pencarian) & Nominatim API (Reverse Alamat otomatis).
*   **Penyimpanan:** `localStorage` dengan sistem **Kompresi Gambar Otomatis** (JPEG 0.7) untuk efisiensi penyimpanan browser.
*   **PWA:** Mendukung Manifest & Service Worker untuk instalasi mandiri di Android/iOS (Add to Home Screen).

## 📂 Struktur File
- `index.html` : Halaman input utama, sistem manajemen draft, dan pengambilan koordinat GPS.
- `tampildata.html` : Engine riwayat laporan, filter arsip, dan generator cetak detail PDF masal.
- `manifest.json` : Konfigurasi identitas aplikasi (Ikon, Warna, Start URL).
- `sw.js` : Service worker untuk mendukung fungsionalitas PWA.

## 🛠 Aturan Pengembangan & Integritas Cetak (System Instructions)
Jika proyek ini dilanjutkan, pengembang wajib mematuhi parameter teknis yang telah disempurnakan berikut:

1.  **Strict Print Engine:**
    *   Gunakan unit `mm` (milimeter) pada CSS `@media print` untuk akurasi kertas A4 (210x297mm).
    *   **Aturan 3-Item:** Setiap halaman fisik A4 wajib berisi tepat **3 Item Pekerjaan**.
    *   **Anti-Blank Page:** Gunakan `break-after: page` dan batasi tinggi kontainer halaman pada `296mm` (buffer 1mm) untuk mencegah kemunculan halaman kosong di tengah dokumen.
    *   **Pagination:** Nomor halaman wajib berada di sudut **kiri bawah** setiap lembar.
    *   **Header Statis:** Judul "DOKUMENTASI LAPORAN KINERJA" wajib muncul di setiap halaman PDF.
2.  **Image Handling:** Foto wajib diproses dengan `object-fit: contain` di dalam box berukuran tetap (`38mm - 40mm`) untuk menghindari distorsi visual (melar/gepeng).
3.  **No Frameworks:** Tetap gunakan Vanilla JS untuk menjaga kecepatan *load* aplikasi di area dengan sinyal lemah.

## 🌟 Fitur Unggulan Terpasang
*   ✅ **High-Accuracy GPS:** Pencarian lokasi dengan penanganan error jika izin lokasi ditolak atau sinyal lemah.
*   ✅ **Auto-Save Draft:** Sistem otomatis menyimpan progres ketikan; data tidak hilang jika tab tertutup atau di-refresh.
*   ✅ **Archive & Restore:** Laporan yang sudah disimpan dapat dibuka kembali ke halaman utama untuk diedit atau diperbarui.
*   ✅ **Print Detail Masal:** Generator PDF yang cerdas; menggabungkan banyak laporan dalam satu urutan cetak yang rapi dan terstruktur (Pekerjaan ke-1, ke-2, dst).
*   ✅ **Responsive Mapping:** Integrasi peta satelit yang secara otomatis menyesuaikan ukuran (*invalidateSize*) saat dibuka di perangkat mobile.

## 📝 Instruksi Melanjutkan Proyek (Untuk AI)
Gunakan prompt berikut untuk konteks pemulihan pengembangan:
> "Saya ingin melanjutkan pengembangan proyek 'LapDok'. Aplikasi ini menggunakan Vanilla JS dan memiliki engine cetak PDF yang sangat spesifik (3 item per halaman A4, header di tiap lembar, nomor halaman di kiri bawah). Sistem menggunakan localStorage dengan kompresi gambar. Saya akan memberikan kode `index.html` dan `tampildata.html`. Tolong pertahankan aturan `296mm page-height` dan `break-after` agar hasil cetak tidak melompat atau menghasilkan halaman kosong."

## 📈 Rencana Pengembangan (Roadmap)
- [ ] Integrasi Database Cloud (Supabase/Firebase) untuk penyimpanan lintas perangkat.
- [ ] Fitur Watermark (GPS, Tanggal, Jam) yang tertanam langsung pada file gambar.
- [ ] Fitur Ekspor Riwayat ke format Excel (.xlsx).
- [ ] Mode pemetaan offline menggunakan peta yang tersimpan di cache.

---
**Status Proyek:** 🟢 Stabil & Sempurna (Print Engine Optimized).
**Dibuat oleh:** Senior Full-stack Web Developer Specialist.
