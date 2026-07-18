# Design Teknis Target

## 1. Prinsip

- Jaga aplikasi kecil, tetapi pisahkan tanggung jawabnya.
- Validasi input di server. Validasi browser hanya membantu pengguna.
- Semua perubahan stok berjalan dalam transaksi database.
- Gunakan satu identitas barang yang stabil: SKU.
- Generated code, environment, dan database tidak menjadi sumber kebingungan bagi kolaborator baru.
- Tidak ada migrasi destruktif tanpa backup, review, dan rencana rollback.

## 2. Stack yang disarankan

| Area | Pilihan target | Alasan |
| --- | --- | --- |
| Framework | Next.js App Router + TypeScript strict | Sesuai proyek sekarang dan kuat untuk server-rendering. |
| Database | PostgreSQL + Prisma (Neon/Vercel Postgres) | Kompatibilitas optimal dengan cloud deploy, serverless adapter, dan row-level locking. |
| UI | Tailwind CSS + shadcn/ui | Komponen form, dialog, tabel, toast, dan aksesibilitas lebih konsisten. |
| Form/validasi | React Hook Form + Zod | State form jelas dan validasi dapat dipakai ulang di client/server. |
| Data tabel | TanStack Table bila daftar mulai kompleks | Sorting, filter, pagination, dan kolom lebih terstruktur. |
| Test | Vitest untuk unit; test integrasi Prisma pada database test | Melindungi aturan stok dan transaksi. |
| CI | GitHub Actions | Menjalankan generate, lint, typecheck, test, dan build pada pull request. |

## 2.1. Model Keamanan (Autentikasi)

- **Enkripsi Token:** Session disimpan dalam cookie HTTP-only `session` yang terenkripsi menggunakan Web Crypto API (XOR Base64 token) agar kompatibel dengan Vercel Edge.
- **Hashing Password:** Password di-hash menggunakan SHA-256 bawaan Node.js `crypto` pada database layer.
- **Peran Pengguna (Role-based Access):**
  - `admin`: Memiliki akses CRUD ke master kategori (`/categories`) dan lokasi (`/locations`), serta mencatat mutasi.
  - `petugas`: Hanya memiliki akses mencatat mutasi barang (`/items/new`) dan melihat daftar/denah.

Pilihan ini adalah target. Jangan menambah semua dependency sekaligus. Tambah saat sprint terkait dimulai.

## 3. Struktur folder target

```text
app/
  (dashboard)/
    items/
    locations/
    stock-movements/
  api/                       # Hanya bila API eksternal dibutuhkan
  layout.tsx
components/
  ui/                        # Komponen shadcn/ui
  shared/                    # Header, empty state, page header
features/
  inventory/
    actions.ts
    schemas.ts
    service.ts
    components/
  locations/
lib/
  prisma.ts
  env.ts
  auth.ts
prisma/
  schema.prisma
  migrations/
  seed.ts
docs/
tests/
```

Aturan singkat:

- `app/` mengatur route dan komposisi halaman.
- `features/` menyimpan aturan bisnis per domain, bukan file acak berdasarkan jenis teknis.
- `lib/` menyimpan infrastruktur lintas fitur.
- `components/ui/` menyimpan primitive UI, bukan logika inventori.
- Server Action memanggil service; halaman tidak menulis query stok kompleks sendiri.

## 4. Rancangan model data

```text
User
  id, name, email, role

Item
  id, sku (unique), name, unit, isActive

WarehouseLocation
  id, code (unique), name, xPercent, yPercent, isActive

StockBalance
  itemId, locationId, quantity
  unique(itemId, locationId)

StockMovement
  id, itemId, type, quantity
  sourceLocationId?, destinationLocationId?
  note, createdById, createdAt
```

`StockMovement` adalah riwayat sumber kebenaran perubahan. `StockBalance` adalah saldo per lokasi yang diperbarui dalam transaksi sama agar pembacaan cepat.

Jenis mutasi awal:

- `IN` — barang masuk ke lokasi tujuan.
- `OUT` — barang keluar dari lokasi asal.
- `TRANSFER` — perpindahan dari asal ke tujuan.
- `ADJUSTMENT` — koreksi dengan alasan wajib.

## 5. Alur simpan yang aman

```text
Request form
  -> validasi Zod di server
  -> cek otorisasi
  -> Prisma transaction
      -> cek saldo dan aturan bisnis
      -> tulis StockMovement
      -> update StockBalance
  -> revalidate data terkait
  -> respons sukses atau error aman
```

Tidak gunakan pola baca `qty`, lalu tambah di JavaScript tanpa perlindungan transaksi. Dua petugas dapat menyimpan bersamaan dan menyebabkan saldo salah.

## 6. Konfigurasi dan setup

- Sediakan `.env.example`, tidak pernah `.env` asli.
- Tentukan satu sumber konfigurasi database. Saat adapter MariaDB membutuhkan detail koneksi, parsing dan validasi harus berada di satu module env, bukan tersebar di halaman dan config.
- Tambahkan script minimal: `dev`, `lint`, `typecheck`, `test`, `build`, `db:generate`, `db:migrate`, dan `db:seed` saat seed tersedia.
- Jalankan Prisma generate otomatis setelah install atau sebelum build.
- Generated Prisma Client tidak diedit manual.

## 7. Error, aksesibilitas, dan UI

- Gunakan `notFound()` untuk ID tidak ada, bukan error umum.
- Tambahkan `loading.tsx`, `error.tsx`, empty state, dan pesan validasi berbahasa Indonesia.
- Gunakan `Link` untuk navigasi kartu; elemen interaktif harus dapat dipakai keyboard.
- Simpan marker denah dalam state React. Jangan mencari elemen global memakai `document.getElementById` bila tidak perlu.
- Sediakan tampilan tabel/list sebagai alternatif denah untuk layar kecil dan pembaca layar.

## 8. Data dan migrasi

1. Backup database sebelum `migrate dev` atau `migrate deploy` yang mengubah tabel berisi data.
2. Review SQL hasil Prisma, terutama `DROP COLUMN`, `DROP TABLE`, rename tabel, dan perubahan tipe.
3. Untuk perubahan data lama, buat migrasi bertahap: tambah struktur baru, salin/backfill data, validasi, baru hapus struktur lama pada rilis berikutnya.
4. Uji migrasi pada database salinan sebelum production.

## 9. Quality gate

Setiap pull request harus lulus:

```text
npm ci
npx prisma generate
npm run lint
npm run typecheck
npm test
npm run build
```

Perintah `typecheck` dan `test` ditambahkan ketika script-nya sudah dibuat. Sampai saat itu, jangan mengklaim quality gate sudah aktif.
