# Jekyll Studio CLI 🚀

[](https://www.google.com/search?q=https://www.npmjs.com/package/jekyll-studio-cli)
[](https://www.google.com/search?q=https://github.com/daffadevhosting/jekyll-studio-cli/blob/main/LICENSE)

**Jekyll Studio CLI** adalah Command Line Interface (CLI) untuk berinteraksi dengan [Jekyll Studio API](https://www.google.com/search?q=https://github.com/daffadevhosting/jekyll-studio-api). Buat, kelola, dan bangun situs Jekyll langsung dari terminal dengan kekuatan AI.

Ucapkan selamat tinggal pada `jekyll new` manual. **Sekarang**. Cukup tuliskan idemu, dan biarkan AI yang membangun fondasi situsmu dalam hitungan detik.

## ✨ Fitur Utama

  * **Buat Situs dengan AI**: Generate seluruh struktur situs Jekyll, lengkap dengan konten contoh dan layout, hanya dari sebuah *prompt* teks.
  * **Manajemen Situs**: Lihat daftar, dapatkan detail, dan hapus situs Jekyll-mu dengan mudah.
  * **Build & Preview**: Jalankan proses build atau server pengembangan langsung dari terminal.
  * **Interaktif**: Antarmuka baris perintah yang mudah digunakan dan informatif.

## ⚙️ Prasyarat

Sebelum menggunakan CLI ini, pastikan kamu sudah memenuhi syarat berikut:

1.  **Node.js**: Versi 18.x atau yang lebih baru.
2.  **Jekyll Studio API**: Pastikan backend **[Jekyll Studio API](https://www.google.com/search?q=https://github.com/daffadevhosting/jekyll-studio-api)** sudah berjalan, karena CLI ini berkomunikasi langsung dengannya.

## 📦 Instalasi

Install CLI ini secara global menggunakan npm agar bisa diakses dari mana saja di terminalmu.

```bash
npm install -g jekyll-studio-cli
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

```bash
# Membuat situs portofolio dengan nama direktori otomatis
jekyll-studio create "Buatkan website portofolio untuk seorang fotografer dengan galeri dan halaman kontak"

# Membuat blog dengan nama direktori spesifik 'blog-kopi'
jekyll-studio create "Blog minimalis tentang review biji kopi" --name blog-kopi

# [NEXT UPDATE] Membuat Toko Online dari NOL **(ONDEV)**
jekyll-studio create "Buatkan saya toko online untuk menjual biji kopi. Gunakan Snipcart untuk keranjang belanja. Harus ada halaman untuk setiap produk kopi, halaman 'Tentang Kami', dan halaman kontak." --name "kedai-kopi-static"
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

Proyek ini dilisensikan di bawah Lisensi CC0 1.0 Universal.