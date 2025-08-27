# Jekyll Studio CLI 🚀

[![npm version](https://img.shields.io/npm/v/jekyll-studio.svg)](https://www.npmjs.com/package/jekyll-studio)
[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://creativecommons.org/publicdomain/zero/1.0/)

**Jekyll Studio CLI** adalah Command Line Interface (CLI) untuk berinteraksi dengan [Jekyll Studio API](https://github.com/daffadevhosting/jekyll-studio-api). Buat, kelola, dan bangun situs Jekyll langsung dari terminal dengan kekuatan AI.

Ucapkan selamat tinggal pada `jekyll new` manual. **Sekarang**. Cukup tuliskan idemu, dan biarkan AI yang membangun fondasi situsmu dalam hitungan detik.

## ✨ Fitur Utama

* **🤖 AI-Powered Generation**: Buat seluruh struktur situs Jekyll dari prompt teks
* **🐳 Docker Support**: Jalankan Jekyll dengan Docker tanpa install dependencies
* **📝 Content Management**: Tambahkan postingan blog dengan AI
* **🚀 Live Reload**: Server development dengan livereload otomatis
* **🏥 Health Check**: Periksa environment dengan perintah `doctor`
* **🎨 Tailwind CSS Support**: Generate situs dengan Tailwind CSS

## ⚙️ Prasyarat

1. **Node.js** 18.x atau lebih baru
2. **Jekyll Studio API** - Pastikan backend API sudah berjalan
3. **(Opsional)** Docker - Untuk menjalankan Jekyll tanpa install Ruby
4. **(Opsional)** Ruby & Jekyll - Untuk menjalankan secara native

## 📦 Instalasi

```bash
npm install -g jekyll-studio
```

## 🚀 Quick Start

1. Jalankan API (di terminal terpisah):
```bash
git clone https://github.com/daffadevhosting/jekyll-studio-api
cd jekyll-studio-api
npm install
npm run dev
```

2. Buat situs pertama:
```bash
jekyll-studio create "Portfolio website untuk photographer dengan gallery dan contact form"
```

3. Jalankan server
```bash
cd nama-situs
jekyll-studio serve
```

## 🛠️ Penggunaan

Gunakan perintah `jekyll-studio` diikuti dengan sub-perintah yang tersedia.

```bash
jekyll-studio [perintah] [argumen] [opsi]
```

### Perintah Utama

#### `create`

Membuat situs Jekyll baru menggunakan prompt AI.

**Sintaks:**

```bash
jekyll-studio create <prompt> [opsi]
```

**Argumen:**

  * `<prompt>`: (Wajib) Deskripsi situs yang ingin kamu buat, tulis dalam tanda kutip.

**Opsi:**

  * `-n, --name <namaSitus>`: (Opsional) Menentukan nama direktori untuk situs. Jika tidak diisi, nama akan dibuat otomatis oleh AI.

**Contoh:**

- Membuat situs baru.
```bash
# Membuat situs portofolio dengan nama direktori otomatis
jekyll-studio create "Buatkan website portofolio untuk seorang fotografer dengan galeri dan halaman kontak"

# Membuat blog dengan nama direktori spesifik 'blog-masakan'
jekyll-studio create "Blog tentang resep masakan Indonesia" --name blog-masakan

# [NEXT UPDATE] Membuat Toko Online dari NOL **(ONDEV)**
jekyll-studio create "Buatkan saya toko online untuk menjual biji kopi. Gunakan Snipcart untuk keranjang belanja. Harus ada halaman untuk setiap produk kopi, halaman 'Tentang Kami', dan halaman kontak." --name "kedai-kopi-static"
```

- Menambahkan Postingan blog.
```bash
jekyll-studio add post "Cara Membuat Rendang yang Enak" --tags "masakan,indonesia" --categories "resep"
```

-----

#### `list`

Menampilkan semua situs yang sudah dibuat.

**Sintaks:**

```bash
jekyll-studio list
```

#### `build`

Menjalankan proses build untuk situs tertentu.

**Sintaks:**

```bash
jekyll-studio build <id_situs_atau_nama>
```

#### `serve`

Menjalankan server pengembangan untuk situs tertentu.

**Sintaks:**

```bash
jekyll-studio serve <id_situs_atau_nama> [opsi]
```

**Opsi:**

  * `-p, --port <nomorPort>`: (Opsional) Menentukan port untuk server.

**Jalankan Server**
```bash
# Dengan Docker (default)
jekyll-studio serve

# Dengan Jekyll lokal
jekyll-studio serve --no-docker

# Port custom
jekyll-studio serve --port 8080
```

**Health Check**
```bash
jekyll-studio doctor
```

## 🐛 Troubleshooting

**Cannot connect to API**
* Pastikan Jekyll Studio API sudah berjalan di http://localhost:3000

**Docker not found**
* Install Docker atau gunakan --no-docker flag

**Jekyll not found**
* Install Jekyll atau gunakan Docker

## 🤝 Berkontribusi

1. Fork repository

2. Buat feature branch

3. Commit changes

4. Push ke branch

5. Buat Pull Request

-----

## 🔧 Pengembangan Lokal

Ingin berkontribusi atau mengembangkan CLI ini?

1.  **Clone repositori:**
    ```bash
    git clone https://github.com/daffadevhosting/jekyll-studio-cli.git
    cd jekyll-studio-cli
    ```
2.  **Install dependensi:**
    ```bash
    npm run jekyll-studio
    ```
    Sekarang kamu bisa menjalankan perintah `jekyll-studio` di terminalmu yang akan langsung menggunakan kode dari folder lokal ini.

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).

## 🙏 Acknowledgments

[Jekyll](https://jekyllrb.com/) - Static site generator

[Google Gemini](https://deepmind.google/technologies/gemini/) - AI model

[Commander.js](https://github.com/tj/commander.js) - CLI framework

## 🎯 **Fitur Baru yang Ditambahkan:**

1. **`doctor` command** - Memeriksa environment dan dependencies
2. **Docker detection** - Otomatis mendeteksi apakah Docker tersedia
3. **Interactive prompts** - Konfirmasi overwrite directory
4. **Better error handling** - Penanganan error yang lebih informatif
5. **Health check** - Memeriksa koneksi ke API
6. **Enhanced logging** - Output yang lebih informatif dan berwarna
7. **Template files** - README.md dan .gitkeep untuk images
8. **Port configuration** - Support custom port untuk server
9. **Tailwind detection** - Otomatis detect prompt Tailwind

## 🔧 **Perbaikan Utama:**

1. **File extension handling** - Memastikan file memiliki extension yang benar
2. **Directory existence check** - Mencegah overwrite tanpa konfirmasi
3. **Better API error messages** - Informasi error yang lebih jelas
4. **Improved Docker commands** - Command yang lebih robust