# 📑 Dokumentasi Proyek: Dokumentasi Kinerja (LapDok)

Proyek ini adalah aplikasi web statis satu halaman (**Single Page Application**) berbasis PWA yang dirancang untuk dokumentasi laporan pekerjaan lapangan secara profesional. Aplikasi ini dioptimalkan sepenuhnya untuk penggunaan smartphone dan memiliki fitur utama **Engine Print-to-PDF Presisi** yang menjamin hasil laporan rapi tanpa gangguan tata letak, serta pemandu suara pintar (Jarvis) untuk efisiensi di lapangan.

## 🚀 Arsitektur & Teknologi
*   **Bahasa Utama:** Vanilla JavaScript (ES6+), HTML5, CSS3.
*   **Pemetaan (Maps):** [Leaflet.js](https://leafletjs.org/) dengan Tile Google Hybrid (Satelit) & data poligon wilayah Kabupaten Toraja Utara (GeoJSON dari OpenStreetMap).
*   **Asisten Suara:** Web Speech API (`window.speechSynthesis`) untuk modul Jarvis yang interaktif.
*   **Pemrosesan Gambar:** HTML5 Canvas API untuk kompresi, resizing cerdas (aspect-ratio preservation), dan penanaman **watermark** (koordinat, waktu, lokasi) langsung ke piksel gambar.
*   **Geocoding & GPS:** Geolocation API (High Accuracy), ESRI World Geocoding, & Nominatim API (Reverse Alamat otomatis).
*   **Ekspor Dokumen:** `html2pdf.js` untuk konversi HTML ke dokumen PDF skala A4 secara client-side.
*   **Penyimpanan:** `localStorage` dengan manajemen draft dan riwayat JSON.
*   **PWA:** Mendukung Manifest & Service Worker minimalis (Add to Home Screen).

## 📂 Struktur File
- `index.html` : Halaman input utama, sistem manajemen draft, antarmuka kamera (canvas), dan pemetaan GPS.
- `tampildata.html` : Engine riwayat laporan, filter arsip, dan generator konversi/unduh PDF.
- `jarvis.js` : Modul asisten suara yang memandu setiap tahap input form pengguna.
- `manifest.json` : Konfigurasi identitas aplikasi (Ikon, Warna, Start URL).
- `sw.js` : Service worker dasar untuk memenuhi fungsionalitas PWA.
- `icon-512.png` : Ikon aplikasi web untuk Home Screen.

## 🛠 Aturan Pengembangan & Integritas Cetak (System Instructions)
Jika proyek ini dilanjutkan, pengembang wajib mematuhi parameter teknis yang telah disempurnakan berikut:

1.  **Strict Print Engine:**
    *   Menggunakan library `html2pdf.js` dengan opsi format `a4`, orientasi `portrait`, dan margin `0`.
    *   **Aturan 3-Item:** Setiap halaman fisik A4 dari PDF wajib berisi tepat **3 Item Pekerjaan**.
    *   Gunakan `page-break-after: always` pada kelas `.page-container` dan batasi min-height pada `296mm` untuk formasi grid lembar cetak yang konstan.
    *   Header "DOKUMENTASI LAPORAN KINERJA" dan Meta Footer "Halaman X dari Y" harus dirender secara terprogram di memori sebelum dibungkus ke dalam file PDF.
2.  **Image Handling & Canvas:** 
    *   Foto via kamera ditarik dalam resolusi *native sensor* dan dibatasi sisi terpanjang di `1200px` (atau `800px` untuk rute galeri).
    *   Semua "Stempel" (Jam Besar, Hari, Tanggal, Koordinat GPS, dan Alamat) digambar langsung dengan rendering raster pada context 2D Canvas dengan shadow/bayangan teks agar kontras.
    *   Preview foto pada HTML menggunakan `object-fit: contain` tanpa distorsi proporsi dimensi aslinya.
3.  **No Full-Stack Frameworks:** Tetap gunakan susunan Vanilla JS murni. Aplikasi harus dapat dimuat di daerah terpencil secepat mungkin.

## 🌟 Fitur Unggulan Terpasang
*   ✅ **Asisten Suara (Jarvis):** Panduan interaktif berbasis Text-to-Speech pada setiap langkah (pemilihan tanggal, foto tahap sebelum/proses/sesudah, dan pencetakan) dengan kontrol aktif/nonaktif.
*   ✅ **Auto-Watermark (Timestamp & GPS):** Info seperti Tanggal, Waktu saat dijepret (HH:MM digambar besar ala UI modern), koordinat presisi, dan nama jalan akan langsung ter-stempel (*hardcoded*) pada piksel foto sebelum disimpan.
*   ✅ **Smart Print to PDF:** Generator PDF `html2pdf` memfasilitasi pembuatan file hasil inspeksi yang multi-halaman dengan tatanan grid presisi yang cerdas (otomatis membagi setiap 3 item menjadi 1 halaman A4 PDF independen).
*   ✅ **High-Accuracy Mapping & GIS Polygon:** Melacak lokasi pengguna di atas base peta satelit Google dengan overlay garis pemetaan poligon batas wilayah Kabupaten Toraja Utara.
*   ✅ **Auto-Save Draft & Mode Edit:** Sistem otomatis menyimpan progres data ketikan sementara; data tidak hilang jika tab tidak sengaja tertutup. Item dari riwayat *(Archive)* dapat ditarik kembali ke tab *Editor*.

## 📝 Instruksi Melanjutkan Proyek (Untuk AI)
Gunakan prompt berikut untuk konteks referensi pemulihan proyek:
> "Saya ingin melanjutkan pengembangan proyek 'LapDok'. Aplikasi ini berjalan tanpa framework (Vanilla JS) dengan engine cetak PDF presisi menggunakan `html2pdf.js` berserta pengamanan layout 3-box per halaman A4. Ada fitur asisten suara Text-to-Speech `jarvis.js` dan rendering stempel/watermark gambar di tingkat kanvas HMTL5. Penyimpanan mengandalkan `localStorage` Base64 kompresi 0.8. Tolong pertahankan logika `html2pdf`, integrasi Web Speech API, dan cara kerja `applyWatermarkToCanvas` saat memperbaiki atau menambah fungsi baru."

## 📈 Rencana Pengembangan (Roadmap)
- [x] Fitur Watermark (GPS, Tanggal, Jam) yang tertanam langsung pada file gambar. *(Selesai)*
- [x] Fitur Asisten Suara Pemandu / Voice Guide (Jarvis). *(Selesai)*
- [ ] Integrasi Database Cloud (Supabase/Firebase) untuk sinkronisasi arsip antar perangkat.
- [ ] Opsi filter ekspor Riwayat khusus ke format Excel (.xlsx).
- [ ] Mode *Offline First* PWA penuh: Caching aset peta (Tile) ke memori perangkat (IndexedDB) agar peta satelit bisa terlihat saat hilang sinyal internet.

---
**Status Proyek:** 🟢 Stabil & Kaya Fitur (Advanced Canvas & Audio AI Integration).
**Dibuat oleh:** Senior Full-stack Web Developer Specialist.
