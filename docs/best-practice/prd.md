# PRD — Inventori Gudang

## 1. Ringkasan produk

Inventori Gudang adalah aplikasi internal untuk membantu petugas menemukan barang dan mengetahui stok serta lokasi barang di gudang.

Masalah awal: informasi barang berada di ingatan orang, catatan terpisah, atau sulit dilacak. Aplikasi menjadi satu sumber data yang dapat dicek bersama.

## 2. Tujuan

- Petugas dapat mencatat barang masuk dengan identitas dan lokasi yang jelas.
- Petugas dapat mencari barang lalu melihat stok dan posisi pada denah.
- Setiap perubahan stok dapat ditelusuri: siapa, kapan, jumlah berapa, dan alasan apa.
- Data tidak bercampur saat ada barang dengan nama mirip atau satuan berbeda.

## 3. Pengguna

| Peran | Kebutuhan utama |
| --- | --- |
| Petugas gudang | Mencatat barang masuk, keluar, dan perpindahan lokasi dengan cepat. |
| Admin gudang | Mengelola master barang, lokasi (CRUD), kategori barang (CRUD), pengguna, dan koreksi stok. |
| Pimpinan/pengecek | Melihat stok dan riwayat tanpa boleh mengubah data. |

Sistem mendukung dua peran terautentikasi: `admin` (akses penuh) dan `petugas` (mencatat mutasi).

## 4. Ruang lingkup MVP

### Termasuk

- Login pengguna internal.
- Master barang: SKU/kode barang, nama, satuan, status aktif.
- Master lokasi: kode lokasi, nama area, koordinat denah.
- Barang masuk dengan jumlah, lokasi, catatan, tanggal, dan pembuat catatan.
- Daftar dan pencarian barang.
- Detail barang: stok total, stok per lokasi, dan riwayat mutasi.
- Barang keluar dan transfer antar lokasi.
- Validasi, error yang jelas, serta jejak audit perubahan.

### Belum termasuk

- Integrasi pembelian, akuntansi, barcode scanner, atau ERP.
- Multi-gudang lintas perusahaan.
- Forecast kebutuhan barang.
- Aplikasi mobile native.

## 5. Aturan bisnis awal

1. `sku` adalah identitas unik barang. Nama bukan identitas unik.
2. Kuantitas adalah integer lebih dari nol untuk mutasi masuk, keluar, dan transfer.
3. Stok tidak boleh negatif.
4. Barang keluar mengurangi stok dari lokasi asal.
5. Transfer mengurangi stok lokasi asal dan menambah stok lokasi tujuan dalam satu transaksi.
6. Koreksi stok wajib menyimpan alasan dan pengguna pelaku.
7. Catatan lokasi harus tersambung dengan lokasi valid, bukan string JSON bebas.
8. Data mutasi tidak dihapus secara diam-diam. Koreksi dilakukan lewat mutasi pembalik atau mekanisme audit yang disetujui.
9. SKU barang dapat di-generate otomatis berdasarkan prefix kategori yang terdaftar dinamis di database.
10. Lokasi rak penyimpanan tidak dapat dihapus jika masih ada stok aktif atau memiliki histori transaksi.

## 6. Alur utama

### Barang masuk

```text
Petugas pilih/tambah barang
  -> pilih lokasi
  -> isi jumlah dan catatan
  -> sistem validasi
  -> sistem menyimpan mutasi masuk dan stok lokasi dalam satu transaksi
  -> sistem menampilkan sukses dan detail terbaru
```

### Pencarian barang

```text
Petugas masukkan SKU atau nama
  -> sistem menampilkan daftar cocok
  -> petugas membuka detail barang
  -> sistem menampilkan stok total, stok per lokasi, denah, dan riwayat
```

### Transfer lokasi

```text
Petugas pilih barang dan lokasi asal
  -> isi lokasi tujuan serta jumlah
  -> sistem memastikan stok asal cukup
  -> sistem menyimpan transfer secara atomik
  -> stok kedua lokasi dan riwayat diperbarui
```

## 7. Kebutuhan nonfungsional

- Bahasa antarmuka: Indonesia.
- Tampilan: nyaman di ponsel dan desktop.
- Akses: hanya pengguna internal terautentikasi untuk perubahan data.
- Keandalan: mutasi stok atomik; tidak ada stok setengah tersimpan.
- Kinerja: daftar dan pencarian berindeks pada `sku`, nama, dan lokasi.
- Keamanan: rahasia database hanya berada di environment variable.
- Observabilitas: error penting tercatat tanpa membocorkan rahasia.

## 8. Metrik keberhasilan MVP

- Barang dapat ditemukan berdasarkan SKU atau nama tanpa bertanya ke orang lain.
- Setiap stok memiliki lokasi dan riwayat mutasi yang bisa ditelusuri.
- Tidak ada transaksi yang membuat stok negatif atau data parsial.
- Validasi, lint, typecheck, test, dan build lulus pada branch utama.

## 9. Pertanyaan produk yang harus dijawab

- Apakah satu barang dapat memiliki lebih dari satu satuan? Jika ya, bagaimana konversinya?
- Apakah satu SKU boleh punya banyak lokasi? Ya untuk rancangan awal, tetapi perlu aturan stok per lokasi.
- Siapa yang boleh melakukan koreksi stok?
- Apakah barang boleh dihapus, atau hanya dinonaktifkan?
- Apakah denah satu gudang cukup, atau sejak awal perlu banyak gudang?

Jawaban pertanyaan ini harus dicatat sebelum perubahan model database besar.
