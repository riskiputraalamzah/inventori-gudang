# Panduan Deploy & Backup Production

## 1. Rencana Deploy ke Vercel

Proyek `inventori-gudang-v2` dirancang agar kompatibel penuh dengan deploy Vercel + Neon Serverless PostgreSQL.

### Langkah-Langkah Deploy

1. **Buat Database Neon:**
   - Masuk ke dashboard [Neon.tech](https://neon.tech)
   - Buat project baru dan pilih Region terdekat (misal: Singapore)
   - Salin connection string PostgreSQL yang diberikan (format: `postgresql://user:password@host/neondb?sslmode=require`)

2. **Hubungkan Repository ke Vercel:**
   - Hubungkan akun GitHub Anda ke [Vercel](https://vercel.com)
   - Klik **Add New Project** dan pilih repository `inventori-gudang-v2`
   - Pilih Framework Preset: **Next.js**
   - Buka bagian **Environment Variables** dan tambahkan:
     - `DATABASE_URL`: Isi dengan connection string Neon Anda
     - `SESSION_SECRET`: Kunci enkripsi session acak (minimal 32 karakter)

3. **Deploy & Migrasi Otomatis:**
   - Klik **Deploy**
   - Vercel akan otomatis build project, menjalankan generate client, dan deploy.
   - Karena file database Neon adalah cloud, jalankan migrasi schema dan seed data secara bersamaan sekali saja melalui console lokal Anda:
     ```powershell
     $env:DATABASE_URL = "connection-string-neon-anda"
     npx prisma db push
     npm run db:seed
     ```

## 2. Strategi Backup & Restore Database (Neon)

Neon menyediakan fitur backup bawaan yang sangat andal bernama **Point-in-Time Recovery (PITR)** dan **Snapshots**.

### Fitur Backup Neon
- **Automatic Backups:** Neon secara otomatis mem-backup data Anda secara real-time. Anda dapat me-restore database ke titik waktu mana pun (hingga menit) dalam jangka waktu tertentu (tergantung tier).
- **Manual Snapshots:** Anda dapat membuat snapshot database secara manual sebelum melakukan migrasi besar.

### Prosedur Manual Backup (pg_dump)

Jika Anda ingin menyimpan salinan backup fisik di penyimpanan lokal/awan pribadi:

**Backup (Dump):**
```powershell
pg_dump "postgresql://user:password@host/neondb?sslmode=require" -F c -b -v -f "gudang_backup_2026-07-19.dump"
```

**Restore:**
```powershell
pg_restore -d "postgresql://user:password@host/neondb?sslmode=require" -v "gudang_backup_2026-07-19.dump"
```

## 3. Akun Kredensial Default

Setelah database di-seed (`npm run db:seed`), akun berikut siap digunakan untuk login awal:

| Peran | Email | Password | Hak Akses |
| --- | --- | --- | --- |
| **Admin** | `admin@gudang.com` | `admin123` | Mutasi stok, Denah, Kelola Kategori, Kelola Lokasi |
| **Petugas** | `petugas@gudang.com` | `petugas123` | Catat mutasi stok |

Ganti password default setelah login pertama demi keamanan.
