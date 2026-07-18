# Inventori Gudang v2

Aplikasi pencatatan barang dan lokasi gudang versi optimal. Dibuat menggunakan arsitektur modular Next.js 16 (App Router) dan teroptimasi untuk deployment ke Vercel dengan database Postgres (Neon/Vercel Postgres serverless).

## Perbaikan dari Versi Awal

- **Optimasi Vercel Postgres:** Menggunakan `@neondatabase/serverless` dan `@prisma/adapter-neon` untuk connection pooling yang andal saat serverless scale.
- **Model Data Target:** Struktur database lengkap dengan model `User`, `Item` (SKU unik), `WarehouseLocation`, `StockBalance` (saldo per lokasi), dan `StockMovement` (riwayat mutasi).
- **Validasi Zod:** Schema validation ketat untuk SKU, nama, lokasi, dan mutasi stok di `lib/schemas.ts`.
- **Quality Gate:** Lint dan Typecheck dikonfigurasi untuk lolos build otomatis di CI/CD.
- **Prisma Generate Otomatis:** Script `postinstall` untuk menjamin client selalu ter-generate otomatis saat deploy.

## Setup Lokal

### Prasyarat

- Node.js 20+
- Database PostgreSQL lokal atau cloud (misal Neon.tech)
- Git

### Langkah Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup environment**

   Salin `.env.example` ke `.env` dan sesuaikan URL koneksi database:

   ```bash
   cp .env.example .env
   ```

   Ubah isi `.env` sesuai database kamu:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/inventori_gudang?sslmode=require"
   ```

3. **Generate Prisma Client**

   ```bash
   npm run db:generate
   ```

4. **Jalankan migrasi pertama**

   ```bash
   npm run db:migrate
   ```

5. **Jalankan development server**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Dokumentasi Proyek

Panduan arsitektur, PRD, dan panduan AI agent tersedia di folder `docs/`:

- [docs/audit.md](docs/audit.md) — audit kode proyek awal
- [docs/best-practice/prd.md](docs/best-practice/prd.md) — Product Requirement Document (PRD)
- [docs/best-practice/design.md](docs/best-practice/design.md) — dokumen desain teknis dan target arsitektur
- [docs/best-practice/sprint.md](docs/best-practice/sprint.md) — status sprint dan rencana pekerjaan
- [docs/best-practice/ai-agent-guide.md](docs/best-practice/ai-agent-guide.md) — panduan kolaborasi menggunakan AI Agent

## Kontribusi & Pekerjaan Lanjutan

Pekerjaan saat ini telah menyelesaikan **Sprint 0** (stabilisasi fondasi dan setup) dan memulai **Sprint 1** (Zod validation schemas). Rencana kerja berikutnya:
1. Hubungkan schema Zod ke Server Action untuk mutasi masuk.
2. Tambahkan test unit untuk validasi barang.
3. Impor/migrasikan data lama secara aman ke model baru.
