# Changelog

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
