# Inventori Gudang v2

> 🌐 **Live Demo:** [https://inventori-gudang.vercel.app/](https://inventori-gudang.vercel.app/)

Aplikasi pencatatan barang dan lokasi gudang versi optimal. Dibuat menggunakan arsitektur modular Next.js 16 (App Router) dan teroptimasi untuk deployment ke Vercel dengan database Postgres (Neon/Vercel Postgres serverless).

## Screenshots

### Halaman Login
<table>
<tr>
<td width="60%">
<img src="public/image/login.png" alt="Login Desktop"/>
</td>
<td width="40%">
<img src="public/image/login-mobile.png" alt="Login Mobile"/>
</td>
</tr>
<tr>
<td align="center"><b>Desktop View</b></td>
<td align="center"><b>Mobile View</b></td>
</tr>
</table>

*Halaman login dengan tema dark modern dan gradient accent*

### Dashboard Admin
<table>
<tr>
<td width="60%">
<img src="public/image/admin.png" alt="Admin Dashboard Desktop"/>
</td>
<td width="40%">
<img src="public/image/admin-mobile.png" alt="Admin Dashboard Mobile"/>
</td>
</tr>
<tr>
<td align="center"><b>Desktop View</b></td>
<td align="center"><b>Mobile View</b></td>
</tr>
</table>

*Dashboard admin dengan akses penuh ke manajemen kategori, lokasi, dan mutasi stok*

### Dashboard Petugas
<table>
<tr>
<td width="60%">
<img src="public/image/petugas.png" alt="Petugas Dashboard Desktop"/>
</td>
<td width="40%">
<img src="public/image/petugas-mobile.png" alt="Petugas Dashboard Mobile"/>
</td>
</tr>
<tr>
<td align="center"><b>Desktop View</b></td>
<td align="center"><b>Mobile View</b></td>
</tr>
</table>

*Dashboard petugas dengan fokus pada pencatatan mutasi barang dan monitoring stok*

## Perbaikan dari Versi Awal

- **Optimasi Vercel Postgres:** Menggunakan `@neondatabase/serverless` dan `@prisma/adapter-neon` untuk connection pooling yang andal saat serverless scale.
- **Model Data Target:** Struktur database lengkap dengan model `User`, `Item` (SKU unik), `WarehouseLocation`, `StockBalance` (saldo per lokasi), dan `StockMovement` (riwayat mutasi).
- **Validasi Zod:** Schema validation ketat untuk SKU, nama, lokasi, dan mutasi stok di `lib/schemas.ts`.
- **Quality Gate:** Lint dan Typecheck dikonfigurasi untuk lolos build otomatis di CI/CD.
- **Prisma Generate Otomatis:** Script `postinstall` untuk menjamin client selalu ter-generate otomatis saat deploy.
- **Role-Based Access Control:** Sistem autentikasi dengan role admin dan petugas untuk keamanan akses.
- **Real-time Warehouse Map:** Denah gudang interaktif dengan visualisasi stok per lokasi.

## Fitur Utama

- ✅ **Autentikasi & Authorization** - Role-based access (admin/petugas)
- ✅ **Manajemen Barang** - CRUD barang dengan SKU unik dan validasi
- ✅ **Mutasi Stok** - Barang masuk (IN), keluar (OUT), dan transfer antar rak
- ✅ **Denah Gudang Interaktif** - Visualisasi lokasi dengan koordinat X/Y
- ✅ **Audit Trail** - Riwayat lengkap setiap perubahan stok dengan user tracking
- ✅ **Responsive Design** - Optimized untuk desktop dan mobile
- ✅ **Dark Theme** - UI modern dengan gradient accent
- ✅ **Health Check Endpoint** - `/api/health` untuk monitoring database

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
   SESSION_SECRET="your-random-secret-key-here"
   ```

3. **Generate Prisma Client**

   ```bash
   npm run db:generate
   ```

4. **Jalankan migrasi pertama**

   ```bash
   npm run db:migrate
   ```

5. **Seed database dengan data awal**

   ```bash
   npm run db:seed
   ```

   Default users yang dibuat:
   - **Admin**: `admin@gudang.com` / `admin123`
   - **Petugas**: `petugas@gudang.com` / `petugas123`

6. **Jalankan development server**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Deployment ke Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/inventori-gudang-v2)

### Manual Setup

1. **Push ke GitHub repository**

2. **Import project ke Vercel**
   - Buka [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import dari GitHub

3. **Setup Environment Variables**
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require
   SESSION_SECRET=your-production-secret-key
   ```

   ⚠️ **PENTING**: 
   - Gunakan endpoint **pooled** (`-pooler`) dari Neon
   - **JANGAN** tambahkan `&channel_binding=require` pada URL

4. **Deploy**

   Vercel akan otomatis:
   - Install dependencies
   - Generate Prisma Client
   - Build aplikasi
   - Deploy ke production

5. **Run migrations di production**
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   npm run db:seed
   ```

Untuk panduan lengkap deployment dan troubleshooting, lihat:
- [docs/deploy-production.md](docs/deploy-production.md)
- [docs/troubleshooting-login.md](docs/troubleshooting-login.md)

## Dokumentasi Proyek

Panduan arsitektur, PRD, dan panduan AI agent tersedia di folder `docs/`:

- [docs/audit.md](docs/audit.md) — audit kode proyek awal
- [docs/best-practice/prd.md](docs/best-practice/prd.md) — Product Requirement Document (PRD)
- [docs/best-practice/design.md](docs/best-practice/design.md) — dokumen desain teknis dan target arsitektur
- [docs/best-practice/sprint.md](docs/best-practice/sprint.md) — status sprint dan rencana pekerjaan
- [docs/best-practice/ai-agent-guide.md](docs/best-practice/ai-agent-guide.md) — panduan kolaborasi menggunakan AI Agent
- [docs/deploy-production.md](docs/deploy-production.md) — panduan deployment production
- [docs/troubleshooting-login.md](docs/troubleshooting-login.md) — troubleshooting login issues

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: PostgreSQL (Neon/Vercel Postgres)
- **ORM**: Prisma 7.8 with Neon adapter
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **Icons**: Lucide React
- **Authentication**: Custom session-based auth with encrypted cookies
- **Deployment**: Vercel (optimized for Edge Runtime)

## Struktur Database

```
User - Pengguna sistem (admin/petugas)
  ├── id, name, email, passwordHash, role

ItemCategory - Kategori barang untuk auto-generate SKU
  ├── id, code, name, isActive

Item - Master data barang
  ├── id, sku (unique), name, unit, isActive

WarehouseLocation - Lokasi rak gudang
  ├── id, code (unique), name, xPercent, yPercent, isActive

StockBalance - Saldo stok per item per lokasi
  ├── itemId, locationId, quantity
  └── unique(itemId, locationId)

StockMovement - Audit trail mutasi stok
  ├── id, itemId, type (IN/OUT/TRANSFER)
  ├── quantity, sourceLocationId, destinationLocationId
  └── note, createdById, createdAt
```

## Kontribusi & Pekerjaan Lanjutan

Pekerjaan saat ini telah menyelesaikan:
- ✅ **Sprint 0** - Stabilisasi fondasi dan setup
- ✅ **Sprint 1** - Zod validation schemas
- ✅ **Sprint 2** - Mutasi stok atomik dengan audit trail
- ✅ **Sprint 3** - Dashboard dan UX responsif
- ✅ **Sprint 4** - Autentikasi, CI/CD, dan deployment docs

Semua fitur MVP sudah complete dan production-ready!

## License

MIT License - lihat [LICENSE](LICENSE) untuk detail.

## Support

Jika ada pertanyaan atau issue:
1. Check [docs/troubleshooting-login.md](docs/troubleshooting-login.md)
2. Open GitHub issue
3. Contact maintainer

---

**Built with ❤️ using Next.js + Prisma + Neon**


