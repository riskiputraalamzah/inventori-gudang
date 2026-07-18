# Audit Awal Kode

## Status perbaikan Sprint 1–3 — 18 Juli 2026

Audit ini adalah baseline sebelum perbaikan. Tabel berikut mencatat perubahan yang sudah diterapkan setelah audit awal.

| Area | Sebelum | Sesudah | Status |
| --- | --- | --- | --- |
| Validasi dan error form | Validasi mutasi tersebar; pesan gagal dapat memunculkan error database mentah. | Input dinormalisasi di `lib/inventory.ts`; SKU, jumlah, catatan, tipe mutasi, dan lokasi divalidasi sebelum query. | Selesai |
| Konsistensi stok | Pola baca lalu tulis berisiko saat dua request keluar berjalan bersamaan. | `updateMany` bersyarat mencegah saldo kurang dari nol; transaksi memakai isolasi `Serializable` dan retry konflik. | Selesai |
| Lokasi gudang | Lokasi dapat tercipta dengan koordinat generik tanpa denah konsisten. | Rak A-01 sampai C-04 memakai satu sumber koordinat di `lib/warehouse.ts`. | Selesai |
| Riwayat mutasi | Riwayat belum tersedia pada detail barang. | `StockMovement` dicatat untuk masuk, keluar, transfer; detail barang menampilkan histori. | Selesai |
| Validasi otomatis | Hanya ada test schema dasar. | Test unit memeriksa validasi form; test integrasi opt-in memeriksa transaksi paralel memakai `TEST_DATABASE_URL`. | Review |
| Aksesibilitas | Pemilihan rak dan target transfer memakai elemen non-semantik. | Pemilihan lokasi dan target transfer memakai tombol, label ARIA, serta fokus keyboard. | Selesai |

### Menjalankan test transaksi database

Gunakan database PostgreSQL kosong khusus test. Jangan pernah menunjuk `TEST_DATABASE_URL` ke database development atau production.

```powershell
$env:TEST_DATABASE_URL = "postgresql://user:password@localhost:5432/inventori_gudang_test"
$env:DATABASE_URL = $env:TEST_DATABASE_URL
npm run db:push
npm run test:integration
```

Test integrasi membuat data dengan SKU unik lalu membersihkan data barang, saldo, dan mutasi yang dibuatnya. Lokasi rak standar dapat tertinggal karena dipakai bersama oleh aplikasi.

## Tujuan file

File ini mencatat hasil audit pertama proyek `inventori-gudang`.

Tujuannya bukan menyalahkan kode awal. Proyek ini dibuat untuk belajar. Audit dipakai untuk memahami kondisi awal, menghindari bug data, dan memberi jalur naik menuju standar proyek tim.

## Ringkasan kondisi

| Area | Kondisi saat ini | Status |
| --- | --- | --- |
| Produk | Form barang masuk, daftar barang, detail lokasi di denah | Ada |
| Framework | Next.js App Router dan React | Ada |
| Database | Prisma + MySQL/MariaDB | Ada, setup belum lengkap |
| Prisma Client | Output client belum digenerate | Memblokir aplikasi |
| Dokumentasi setup | Hanya menjelaskan `npm run dev` | Belum cukup |
| Validasi kode | Lint dan TypeScript gagal | Perlu perbaikan |
| Test dan CI | Tidak ditemukan | Belum ada |

## Arsitektur saat ini

```text
Form barang masuk (Client Component)
  -> Server Action `saveItem`
  -> Prisma Client
  -> MariaDB/MySQL

Daftar barang (Server Component)
  -> Prisma Client
  -> MariaDB/MySQL

Detail barang
  -> Prisma Client
  -> data lokasi JSON
  -> penanda pada denah
```

Struktur ini cukup baik untuk prototipe kecil. Masalah utama ada pada proses setup, konsistensi data, dan batas tanggung jawab kode.

## Temuan dan arah perbaikan

### P0 — wajib sebelum dipakai bersama

| Sebelum | Risiko | Sesudah yang ditargetkan | Status |
| --- | --- | --- | --- |
| `app/lib/prisma.ts` mengimpor `app/generated/prisma/client`, tetapi output belum ada | `npm run dev` dan build gagal dengan `Module not found` | Tambah script `db:generate` dan `postinstall: prisma generate`; dokumentasikan setup | Belum dikerjakan |
| Tidak ada `.env.example`; Prisma CLI memakai `DATABASE_URL`, runtime memakai beberapa `DATABASE_*` | Kolaborator tidak tahu variabel wajib atau database mana yang dipakai | Satu template env tanpa rahasia, validasi env saat startup, README setup lengkap | Belum dikerjakan |
| Migrasi kedua menghapus kolom lama dan memakai `item` sementara migrasi awal membuat `Item` | Data dapat hilang; migrasi dapat gagal pada server Linux peka huruf besar-kecil | Backup database, perbaiki strategi migrasi, pindahkan data lama ke tabel detail sebelum kolom dihapus | Belum dikerjakan |
| Update stok dan pembuatan detail berjalan terpisah tanpa transaksi yang ditunggu | Stok dan lokasi dapat tidak sinkron bila salah satu query gagal | Validasi input, lalu jalankan perubahan dalam transaksi Prisma | Belum dikerjakan |
| Barang dicari hanya dari `name` | Nama sama dengan satuan atau identitas berbeda dapat tercampur | Gunakan kode barang/SKU sebagai identitas unik; definisikan aturan duplikasi di schema | Belum dikerjakan |

### P1 — penting untuk data dan pengalaman pengguna

| Sebelum | Risiko | Sesudah yang ditargetkan | Status |
| --- | --- | --- | --- |
| Kuantitas diproses dengan `parseInt` tanpa validasi server | Nilai invalid atau desimal dapat masuk sebagai data salah | Schema validation untuk string, integer positif, satuan, catatan, dan lokasi | Belum dikerjakan |
| Lokasi disimpan sebagai string JSON lalu di-`JSON.parse` saat render | Data lokasi rusak membuat halaman detail crash | Tipe lokasi tervalidasi; pakai kolom JSON atau nilai koordinat terpisah | Belum dikerjakan |
| Detail barang tidak ditemukan melempar error umum | Pengguna menerima halaman error 500 | Validasi ID dan tampilkan halaman `not found` | Belum dikerjakan |
| Klik kartu dan denah memakai manipulasi DOM langsung | Akses keyboard, state UI, dan maintenance lebih sulit | Gunakan state React, `Link`, label aksesibel, dan komponen kecil | Belum dikerjakan |
| Tidak ada autentikasi | Siapa pun yang mendapat akses aplikasi dapat mengubah stok | Tetapkan peran minimal admin dan petugas gudang sebelum deploy publik | Belum dikerjakan |

### P2 — kualitas proyek dan kesiapan tim

| Sebelum | Risiko | Sesudah yang ditargetkan | Status |
| --- | --- | --- | --- |
| `npm run lint` gagal 25 error dan 3 warning | Kualitas dasar tidak terjaga | Lint harus hijau sebelum merge | Belum dikerjakan |
| `tsconfig.json` memakai `ignoreDeprecations: "6.0"` yang ditolak TypeScript 5.9 | Type-check tidak dapat berjalan | Hapus atau perbaiki konfigurasi kompatibel | Belum dikerjakan |
| Tidak ada test | Bug stok dan migrasi sulit dideteksi | Tambah test unit untuk validasi dan test integrasi untuk transaksi stok | Belum dikerjakan |
| Tidak ada CI atau Definition of Done | Kode rusak dapat masuk branch utama | CI menjalankan generate, lint, typecheck, test, dan build | Belum dikerjakan |
| Ada dependency yang tidak dipakai untuk PostgreSQL | Beban dependency dan kebingungan stack | Hapus dependency yang tidak dipakai setelah keputusan database final | Belum dikerjakan |

## Hasil pemeriksaan awal

| Perintah | Hasil |
| --- | --- |
| `npx prisma validate` | Lulus. Schema valid secara sintaks. |
| `npm run lint` | Gagal: 25 error, 3 warning. |
| `npx tsc --noEmit` | Gagal: nilai `ignoreDeprecations` tidak valid. |
| `npm run build` | Gagal: Prisma Client output tidak ditemukan. |
| `npm audit --omit=dev` | Melaporkan 5 vulnerability moderate. Tinjau manual; jangan menjalankan auto-fix tanpa cek dampak versi. |

Database nyata tidak dimigrasikan atau diubah saat audit. Kredensial dan konteks database belum tersedia.

## Urutan perbaikan aman

1. Tambah `.env.example`, setup README, dan Prisma generate otomatis.
2. Perbaiki TypeScript dan lint sampai hijau.
3. Backup database pengembangan. Audit ulang kedua file migrasi sebelum menjalankannya pada database berisi data.
4. Tentukan identitas barang: minimal `sku`, nama, satuan, dan aturan duplikasi.
5. Ubah simpan barang menjadi tervalidasi dan transaksional.
6. Tambah test untuk validasi, transaksi stok, dan halaman detail tidak ditemukan.
7. Baru tambah fitur inventori lebih lengkap: barang keluar, transfer lokasi, dan histori.

## Definition of Done untuk item audit

Satu temuan dapat ditandai selesai bila:

- kode dan dokumentasi terkait sudah diperbarui;
- kasus gagal utama memiliki test atau langkah verifikasi tertulis;
- `npm run lint`, typecheck, dan build lulus;
- migrasi database memiliki backup dan rencana rollback bila menyentuh data;
- status tabel ini diperbarui dari `Belum dikerjakan` menjadi `Selesai` beserta referensi pull request atau commit.
