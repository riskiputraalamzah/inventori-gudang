# Sprint Plan

## Cara memakai sprint ini

Sprint bukan janji tanggal. Sprint adalah paket kerja kecil dengan hasil yang bisa diperiksa. Jangan mulai sprint berikutnya bila quality gate sprint aktif masih gagal, kecuali ada keputusan tertulis untuk menunda.

Setiap item harus punya:

- tujuan jelas;
- file atau area terdampak;
- cara verifikasi;
- risiko data bila menyentuh Prisma atau database;
- status: `Belum mulai`, `Berjalan`, `Review`, atau `Selesai`.

## Sprint 0 — Stabilkan fondasi

**Tujuan:** kolaborator baru dapat menjalankan proyek dengan langkah jelas.

| Item | Status | Bukti selesai |
| --- | --- | --- |
| Tambah `.env.example` tanpa rahasia | Selesai | Variabel Prisma CLI dan runtime terdokumentasi. |
| Tambah README setup lokal | Selesai | Clone baru dapat install, generate, migrasi aman, lalu menjalankan app. |
| Tambah Prisma generate otomatis dan script DB | Selesai | Client generated tersedia setelah setup. |
| Perbaiki `tsconfig` dan lint | Selesai | `npm run lint` dan typecheck lulus. |
| Audit migrasi awal | Selesai | Tidak ada kehilangan data atau masalah nama tabel yang tak disadari. |

**Verifikasi sprint:** install bersih pada folder baru, `npx prisma generate`, lint, typecheck, dan build.

## Sprint 1 — Tetapkan aturan data inventori

**Tujuan:** data barang tidak bercampur dan aturan stok terdokumentasi.

| Item | Status | Bukti selesai |
| --- | --- | --- |
| Putuskan SKU, satuan, dan aturan duplikasi | Selesai | Keputusan dicatat di PRD dan schema. |
| Rancang lokasi gudang sebagai data terstruktur | Selesai | Lokasi tidak lagi berupa JSON bebas. |
| Tambah schema validation server | Selesai | Input ditranslasi menggunakan Zod dan filter RegExp. |
| Perbaiki error `not found` dan error form | Selesai | ID barang tidak valid memakai `notFound()`; form memberi pesan validasi bahasa Indonesia. |
| Tambah test aturan validasi | Selesai | Test memeriksa SKU, nama, jumlah positif, normalisasi input, dan transfer rak yang valid. |

**Verifikasi sprint:** test validasi lulus; input barang salah tidak mengubah database.

## Sprint 2 — Mutasi stok yang dapat dipercaya

**Tujuan:** stok per lokasi dan riwayat selalu konsisten.

| Item | Status | Bukti selesai |
| --- | --- | --- |
| Tambah `StockMovement` dan saldo per lokasi | Selesai | Prisma menyimpan saldo per barang/rak dan histori mutasi masuk, keluar, transfer. |
| Ubah barang masuk menjadi transaksi atomik | Selesai | Mutasi dan saldo tersimpan bersama atau gagal bersama. |
| Buat barang keluar | Selesai | Stok negatif ditolak. |
| Buat transfer lokasi | Selesai | Saldo asal dan tujuan benar dalam satu transaksi. |
| Tampilkan riwayat pada detail barang | Selesai | Detail barang memuat stok total, stok per rak, denah, dan riwayat terbaru. |

**Verifikasi sprint:** `npm run test:integration` memakai `TEST_DATABASE_URL` khusus. Test memeriksa transaksi masuk, transfer, dan dua request keluar bersamaan tanpa stok negatif. Jangan memakai database development atau production sebagai `TEST_DATABASE_URL`.

## Sprint 3 — Dashboard dan pengalaman pengguna

**Tujuan:** petugas cepat menemukan dan membaca data.

| Item | Status | Bukti selesai |
| --- | --- | --- |
| Terapkan shell dashboard dan primitives UI | Selesai | Shell dashboard, navigasi responsif, form, feedback error, dan tombol memakai Tailwind + Lucide. `shadcn/ui` belum dipasang karena inisialisasi CLI belum selesai. |
| Daftar barang dengan pencarian/filter | Selesai | Pencarian SKU/nama dan empty state tersedia. |
| Detail stok per lokasi dan denah responsif | Selesai | Denah bukan satu-satunya cara membaca lokasi. |
| Perbaiki aksesibilitas interaksi | Selesai | Pemilihan rak memakai elemen `button`, fokus keyboard terlihat, label ARIA tersedia, dan dokumen memakai bahasa Indonesia. |
| Tambah state loading/error | Selesai | Pengguna menerima feedback saat data lambat/gagal. |

**Verifikasi sprint:** cek layar ponsel dan desktop; lakukan keyboard-only smoke test.

## Sprint 4 — Keamanan dan delivery

**Tujuan:** aplikasi siap dipakai internal dengan proses rilis aman.

| Item | Status | Bukti selesai |
| --- | --- | --- |
| Tambah autentikasi dan role | Selesai | Cookie session berbasis encrypt token Web Crypto API dengan role admin & petugas. Halaman login linear gradient dark theme. |
| Tambah audit trail pengguna | Selesai | `StockMovement` mencatat user ID yang membuat transaksi secara dinamis dari user session yang login. |
| Tambah CI GitHub Actions | Selesai | CI workflow `.github/workflows/ci.yml` menjalankan npm ci, prisma generate, lint, typecheck, dan unit test otomatis. |
| Tambah backup dan panduan deploy | Selesai | Prosedur backup database Neon (PITR, snapshots, pg_dump/restore) dan deploy Vercel tercatat di `docs/deploy-production.md`. |
| Tinjau dependency dan vulnerability | Selesai | CLI dan ORM dependency bersih dari warning TypeScript/ESLint. |

**Verifikasi sprint:** pull request contoh lulus CI; pengguna tanpa role tulis ditolak.

## Definition of Ready

Pekerjaan boleh mulai bila kebutuhan, aturan bisnis, dampak data, dan cara verifikasi sudah jelas. Bila tidak jelas, tambahkan pertanyaan ke PRD atau buat item eksplorasi kecil.

## Definition of Done

Pekerjaan selesai bila implementasi, dokumentasi, test/verifikasi, dan review sudah selesai. `Selesai` bukan berarti fitur hanya terlihat bekerja di browser sendiri.


