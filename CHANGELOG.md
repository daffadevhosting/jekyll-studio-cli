# Changelog

## [1.3.8] - 2025-08-28

### Added/Change

1. **Extend Interface JekyllSiteStructure**:
   - Menambahkan properti opsional `collections` untuk mendukung koleksi custom seperti **"products"**. Ini memungkinkan **AI generate item produk dengan front matter** tambahan (misalnya price, image).

2. **Modifikasi Prompt di generateSiteStructure**:
   - Menambahkan aturan baru di `initialPrompt` untuk mendeteksi prompt e-commerce (misalnya **"toko online", "online store", "snipcart"**) dan include "**collections**" di JSON schema.
   - Ini membuat AI otomatis `generate` struktur e-commerce jika prompt sesuai.
   - Menambahkan handling Snipcart di method ini: Jika prompt menyebut "snipcart", AI akan menambahkan script dan CSS Snipcart ke layouts, serta api_key ke config.

3. **Update generateComponent**:
   - Menambahkan type `collection_item` untuk generate item koleksi (misalnya produk) dengan front matter khusus **e-commerce**.

4. **Enhance validateAndCleanStructure**:
   - Mendeteksi jika prompt adalah **e-commerce**.
   - Menambahkan config `collections` jika belum ada.
   - Menambahkan layout `product.html` dengan integrasi Snipcart dan Tailwind jika relevan.
   - Menambahkan contoh produk default jika `collections`.products kosong.
   - Menambahkan halaman shop (`/products`) jika belum ada.
   - Update default layout dan includes untuk mendukung navigasi toko.

### Penjelasan Tambahan:
- **Deteksi E-commerce**: Menggunakan string matching sederhana pada prompt untuk fleksibilitas.
- **Integrasi Snipcart**: Script dan CSS ditambahkan secara kondisional. Pastikan user ganti `<your_snipcart_api_key>` dengan key asli dari Snipcart.
- **Tailwind CSS**: Sudah ditangani seperti sebelumnya, tapi diintegrasikan ke layout e-commerce.
- **Penggunaan**: Saat panggil `generateSiteStructure("Buat situs Jekyll untuk toko online dengan Snipcart dan Tailwind CSS")`, script akan generate struktur lengkap dengan produk, shop page, dll.
- **Best Practices**: Kode ini tetap modular, mudah di-maintain, dan mengikuti pola Jekyll (collections untuk produk dinamis). Jika deploy, gunakan hosting seperti Netlify untuk Jekyll build.

## [1.3.7] - 2025-08-28

### Fixed
- Mengatasi `TypeError` pada beberapa perintah (`doctor`, `create`, `serve`, `build`) yang disebabkan oleh konteks `this` yang salah.
- Memperbaiki mekanisme notifikasi update dengan menggunakan `update-notifier` standar.
- Sinkronisasi versi CLI yang ditampilkan (`--version`) dengan versi di `package.json`.

## [1.3.0] - 2025-08-27

### Added
- Perintah `doctor` untuk memeriksa environment dan dependencies
- Deteksi otomatis Docker dan Jekyll lokal
- Konfirmasi interaktif saat overwrite direktori
- Support custom port untuk server development
- Deteksi otomatis Tailwind CSS dari prompt
- File README.md dan template untuk setiap proyek
- Health check koneksi API

### Improved
- Penanganan error yang lebih informatif
- File extension handling yang lebih baik
- Logging yang lebih berwarna dan informatif
- Dokumentasi yang lebih komprehensif
- Validasi environment sebelum menjalankan perintah

## [1.3.0] - 2025-08-27

### Fixed
- Masalah escaping quotes pada respons AI
- Masalah parsing JSON dari respons Gemini
- Penanganan file yang sudah ada
- Kompatibilitas across platform

## [1.1.1] - 2025-08-26
- Rilis awal dengan fitur dasar create, serve, build
