# Panduan Memasang Google AdSense ke LapDok

Proyek LapDok (Dokumentasi Kinerja Lapangan) memiliki satu titik penempatan iklan (*Ad Space*) non-intrusif yang telah didesain khusus pada halaman utama (Home / Landing Page) agar Anda dapat memperoleh penghidupan (*monetize*) dari aplikasi yang banyak digunakan ini. 

Ikuti panduan ini langkah demi langkah untuk menyambungkan Google AdSense ke LapDok dengan benar.

---

## Prasyarat
Sebelum mengedit kode program Anda, pastikan kondisi berikut sudah terpenuhi:
1. Anda sudah memiliki akun Google/Gmail yang aktif.
2. Anda sudah mengunggah/deploy proyek ini ke internet (contoh domain: GitHub Pages `nama-anda.github.io/dokumentasi`, Vercel `lapdok.vercel.app`, atau menggunakan `.com`/`.id` berbayar pribadi). **Google AdSense tidak menyetujui alamat `localhost` atau alamat file di komputer Anda**. 

---

## Langkah 1: Mendaftar ke Google AdSense

1. Buka situs [Google AdSense](https://adsense.google.com/start/).
2. Klik tombol **"Mulai"**.
3. Saat diminta memasukkan **Situs Anda**, masukkan secara persis URL (alamat web) dari proyek LapDok yang sudah Anda publikasikan ke internet.
4. Setujui persyaratan dan kebijakan serta isi formulir identitas perbankan atau pembayaran.

---

## Langkah 2: Verifikasi Kepemilikan Situs (Tag Header)

Tim AdSense perlu membuktikan bahwa andalah *programmer* sekaligus pemilik sah dari alamat website LapDok tersebut.

1. Di Dasbor AdSense, pilih bagian **Situs (Sites)**.
2. Anda akan diberikan sepotong kode `<script>`. Salin kode tersebut (bisa dengan mengeklik tombol *Copy*).
3. Buka tiga file utama dari kode LapDok Anda di Code Editor (VSCode):
   - `index.html` (Halaman Home)
   - `form.html` (Halaman Form Input)
   - `tampildata.html` (Halaman Riwayat)
4. Tempel (*paste*) kode script Google tersebut persis sebelum tag `</head>`.  

**Contoh Penempatan:**
```html
<head>
    <meta charset="UTF-8">
    <title>LapDok</title>
    <!-- ... link css dan meta lainnya ... -->
    
    <!-- PASTE SCRIPT ADSENSE ANDA DI SINI -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890" crossorigin="anonymous"></script>

</head>
```
5. Simpan file (`Ctrl+S`), unggah ulang/commit ke hosting (GitHub), lalu kembali ke Dasbor AdSense dan klik konfirmasi "Minta Peninjauan" (Request Review). Tunggu beberapa hari hingga situs lolos kurasi.

---

## Langkah 3: Membuat Kode Unit Iklan Bergambar (Display Ad)

Bila status situs Anda sudah beralih dari "Sedang Disiapkan" menjadi "Siap" (Ready) atau Disetujui:

1. Di Dasbor AdSense, buka menu: **Iklan (Ads) -> Menurut unit iklan (By ad unit)**.
2. Pilih kotak **Iklan bergambar (Display ads)**.
3. Beri nama agar mudah diingat: `LapDok Home Page Ad`.
4. Untuk **Ukuran Iklan (Ad size)**, biarkan posisinya terpilih otomatis **Responsif (Responsive)**. Hal ini sangat penting agar Iklan tidak merusak ukuran kaca (*glassmorphism*) UI ponsel Anda.
5. Klik **Buat (Create)**.
6. Salin kode tag `<ins...` beserta `<script...` yang akan menampilkannya.

---

## Langkah 4: Menempel Iklan ke Titik Integrasi LapDok

Kini saatnya menaruhnya ke halaman utama (`index.html`) yang merupakan titik kumpulnya para pengguna LapDok.

1. Buka file `index.html` di komputer Anda.
2. Gulir ke bawah hingga Anda melihat baris komentar HTML berbunyi: `<!-- Google AdSense Placeholder (Responsive Display Ad) -->`
3. Hapus paragraf berbunyi `<p style="opacity: 0.5; font-size: 12px; margin-top: 15px;">Google Ads Space</p>` karena kita tidak lagi memerlukan *placeholder teks* tersebut.
4. **Paste kode unit iklan** yang telah Anda salin tadi persis ke dalam tag `<div class="ad-container">`.

**Contoh Hasil Akhir Penempatan (File `index.html` Anda):**
```html
<!-- Google AdSense Placeholder (Responsive Display Ad) -->
<div class="ad-container">
    
    <!-- Kode AdSense MILIK ANDA -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890" crossorigin="anonymous"></script>
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-1234567890"
         data-ad-slot="0987654321"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
    
</div>
```

5. Simpan file tersebut, dan publikasikan/upload kembali kode HTML baru ini ke domain hosting Anda.

---

Selesai! Google biasanya membutuhkan waktu beberapa jam sebelum menyiarkan iklan sungguhan ke dalam kotak transparan (glass) yang sudah saya posisikan tersebut. Setiap kali pengguna berkunjung dan mengeklik "Mulai Aplikasi", layar awal mereka akan diakumulasi statistiknya.
