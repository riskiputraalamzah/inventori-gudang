# Panduan Deploy Production (Vercel + Neon)

## Checklist Pre-Deploy

### 1. Setup Database Neon

1. Buat database di [Neon Console](https://console.neon.tech)
2. **PENTING**: Salin connection string dengan endpoint **POOLED** (`-pooler`)
   ```
   ✅ BENAR: postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   ❌ SALAH: postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/dbname
   ```

3. **Hapus parameter `channel_binding`** jika ada:
   ```
   ❌ SALAH: ?sslmode=require&channel_binding=require
   ✅ BENAR: ?sslmode=require
   ```

### 2. Setup Environment Variables di Vercel

Buka Vercel Dashboard → Project Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
SESSION_SECRET=your-random-32-character-secret-key-here
NODE_ENV=production
```

**Tips:**
- Generate `SESSION_SECRET` dengan: `openssl rand -base64 32`
- Pastikan environment diterapkan untuk **Production**, **Preview**, dan **Development**

### 3. Jalankan Migration di Production

**Cara 1: Via Vercel CLI (Recommended)**
```bash
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed  # opsional, jika butuh data awal
```

**Cara 2: Via Neon SQL Editor**
- Buka Neon Console → SQL Editor
- Jalankan migration script secara manual

### 4. Update Build Command di Vercel (Opsional)

Jika ingin migration otomatis saat deploy, ubah build command:

**File: `package.json`**
```json
{
  "scripts": {
    "vercel-build": "prisma migrate deploy && prisma generate && next build"
  }
}
```

Lalu di Vercel Project Settings → Build & Development Settings:
- **Build Command**: `npm run vercel-build`

## Troubleshooting Login Error

### Error: `[object ErrorEvent]`

**Penyebab:**
- WebSocket connection gagal ke Neon
- `channel_binding=require` dalam connection string
- Endpoint bukan `-pooler`

**Solusi:**
1. Cek `DATABASE_URL` di Vercel environment variables
2. Pastikan formatnya: `postgresql://...@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require`
3. Hapus `&channel_binding=require` jika ada
4. Redeploy: `vercel --prod`

### Error: `relation "User" does not exist`

**Penyebab:** Migration belum dijalankan

**Solusi:**
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Error: `password authentication failed`

**Penyebab:** Password salah atau user belum di-seed

**Solusi:**
```bash
npm run db:seed
```

Default credentials:
- Admin: `admin@gudang.com` / `admin123`
- Petugas: `petugas@gudang.com` / `petugas123`

### Melihat Logs Runtime di Vercel

1. Buka Vercel Dashboard → Project → Deployments
2. Klik deployment terakhir
3. Pilih tab **Functions** (bukan Runtime Logs)
4. Klik function yang error → lihat **Real-time Logs**

**Catatan:** Jika "No logs found", berarti error terjadi sebelum function execute (kemungkinan di Prisma initialization).

## Verifikasi Deployment Berhasil

### 1. Cek Database Connection
```bash
# Di local, dengan .env.production
npx prisma db pull
```

### 2. Test Login di Production
- Buka `https://your-app.vercel.app/login`
- Login dengan: `admin@gudang.com` / `admin123`
- Jika berhasil, akan redirect ke dashboard

### 3. Cek Function Logs
- Vercel Dashboard → Deployment → Functions
- Pastikan tidak ada error WebSocket atau Prisma

## Best Practices

1. **Jangan hardcode secrets** di kode
2. **Gunakan Neon Branching** untuk staging environment
3. **Backup database** sebelum migration besar:
   ```bash
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```
4. **Monitor Prisma Connection Pool** di Neon dashboard
5. **Set connection timeout** jika perlu:
   ```env
   DATABASE_URL="...?connection_limit=10&pool_timeout=20"
   ```

## Rollback Plan

Jika deployment gagal:

1. **Revert ke deployment sebelumnya** di Vercel Dashboard
2. **Rollback migration:**
   ```bash
   npx prisma migrate resolve --rolled-back <migration-name>
   ```
3. **Restore database dari backup:**
   ```bash
   psql $DATABASE_URL < backup-YYYYMMDD.sql
   ```

## Contact & Support

- Vercel Status: https://vercel-status.com
- Neon Status: https://neonstatus.com
- Prisma Docs: https://www.prisma.io/docs
