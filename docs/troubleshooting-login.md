# 🔧 Troubleshooting: Login Error di Vercel

## Masalah: Login gagal dengan error `[object ErrorEvent]`

### Gejala
- Login di local **berhasil** ✅
- Login di Vercel production **gagal** ❌
- Status HTTP: **200 OK** tapi error message: `Login gagal: [object ErrorEvent]`
- Error menampilkan URL database dengan `channel_binding=require`

### Akar Masalah

**Error `[object ErrorEvent]` terjadi karena:**
1. ❌ Connection string mengandung `channel_binding=require` 
2. ❌ `@neondatabase/serverless` tidak mendukung `channel_binding` via WebSocket
3. ❌ WebSocket connection gagal saat inisialisasi Prisma Client

### Solusi (Sudah Diperbaiki)

#### 1. ✅ Update `lib/prisma.ts`
File sudah diperbaiki untuk:
- Otomatis menghapus `channel_binding` dari URL
- Konfigurasi `neonConfig.webSocketConstructor` yang benar
- Menggunakan connection string langsung ke Pool (lebih simple)

#### 2. ✅ Update `app/actions/auth.ts`
Error handling diperbaiki:
- Log detail ke server console (tidak ke frontend)
- Return pesan error yang aman ke user
- Tambah `console.dir()` untuk debugging

#### 3. ✅ Update `.env.example`
Dokumentasi yang jelas tentang:
- Format URL yang benar
- Pentingnya endpoint `-pooler`
- Larangan `channel_binding=require`

---

## Langkah Perbaikan di Vercel

### Step 1: Update Environment Variable

1. Buka **Vercel Dashboard** → Project → **Settings** → **Environment Variables**

2. Edit `DATABASE_URL` dan pastikan formatnya:
   ```
   postgresql://neondb_owner:PASSWORD@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **PENTING:** Hapus `&channel_binding=require` jika ada

4. Contoh yang benar:
   ```
   ✅ BENAR:
   postgresql://user:pass@ep-cold-fog-pooler.ap-southeast-1.aws.neon.tech/db?sslmode=require
   
   ❌ SALAH:
   postgresql://user:pass@ep-cold-fog-pooler.ap-southeast-1.aws.neon.tech/db?sslmode=require&channel_binding=require
   ```

### Step 2: Redeploy

Setelah update environment variable:

```bash
# Commit perubahan kode
git add .
git commit -m "fix: perbaiki Neon connection untuk Vercel deployment"
git push

# Atau trigger manual redeploy di Vercel Dashboard
```

### Step 3: Verifikasi

1. **Tunggu deployment selesai** (2-3 menit)

2. **Buka production URL:** `https://your-app.vercel.app/login`

3. **Test login dengan:**
   - Email: `admin@gudang.com`
   - Password: `admin123`

4. **Jika berhasil:** Akan redirect ke dashboard ✅

5. **Jika masih error:** Lanjut ke Step 4

### Step 4: Cek Logs di Vercel

1. Buka **Vercel Dashboard** → **Deployments** → klik deployment terakhir

2. Pilih tab **Functions** (bukan Runtime Logs)

3. Klik function yang handle `/login` 

4. Lihat **Real-time Logs** atau **Invocations**

5. Cari log dengan prefix `LOGIN_ERROR_DETAIL:` untuk detail error

### Step 5: Verifikasi Database Connection

```bash
# Pull environment variables dari Vercel
vercel env pull .env.production

# Test koneksi database
npx prisma db pull

# Jika berhasil, artinya connection string sudah benar
```

---

## Kemungkinan Error Lain & Solusi

### Error: `relation "User" does not exist`

**Artinya:** Tabel belum ada di database

**Solusi:**
```bash
vercel env pull .env.production
npx prisma migrate deploy
npm run db:seed
```

### Error: `password authentication failed`

**Artinya:** Credentials salah atau user belum di-seed

**Solusi:**
```bash
npm run db:seed
```

Default user yang akan dibuat:
- `admin@gudang.com` / `admin123` (role: admin)
- `petugas@gudang.com` / `petugas123` (role: petugas)

### Error: `Can't reach database server`

**Artinya:** Endpoint salah atau network issue

**Solusi:**
1. Pastikan endpoint menggunakan `-pooler`
2. Cek Neon database status di https://console.neon.tech
3. Verifikasi IP whitelist (jika ada)

### Logs: "No logs found for this request"

**Artinya:** Error terjadi di edge runtime sebelum function execute

**Solusi:**
1. Pastikan `lib/prisma.ts` sudah terupdate dengan kode baru
2. Redeploy dengan clear cache:
   ```bash
   vercel --prod --force
   ```

---

## Quick Fix Checklist

Jika login masih error, cek satu per satu:

- [ ] `DATABASE_URL` di Vercel **tidak** mengandung `channel_binding=require`
- [ ] Endpoint database menggunakan `-pooler` (contoh: `ep-xxx-pooler.region.aws.neon.tech`)
- [ ] `lib/prisma.ts` sudah terupdate dengan kode terbaru
- [ ] `app/actions/auth.ts` sudah terupdate dengan error handling baru
- [ ] Migration sudah dijalankan: `npx prisma migrate deploy`
- [ ] Seed data sudah dijalankan: `npm run db:seed`
- [ ] Deployment sudah di-redeploy setelah perubahan
- [ ] Logs di Vercel Functions menunjukkan detail error yang jelas

---

## Kontak Bantuan

Jika masih error setelah mengikuti semua langkah:

1. **Screenshot error message** di browser
2. **Export logs** dari Vercel Functions tab
3. **Salin output** dari `vercel logs <deployment-url>`
4. Share ke tim development dengan informasi di atas

---

## Perubahan yang Sudah Dilakukan

✅ **File yang diperbaiki:**
1. `lib/prisma.ts` - Konfigurasi Neon WebSocket yang benar
2. `app/actions/auth.ts` - Error handling yang lebih baik
3. `.env.example` - Dokumentasi format URL
4. `docs/deploy-production.md` - Panduan deployment lengkap
5. `docs/troubleshooting-login.md` - Panduan troubleshooting ini

✅ **Masalah yang diselesaikan:**
- ❌ `channel_binding=require` dihapus otomatis
- ❌ `[object ErrorEvent]` tidak akan muncul lagi
- ❌ Database URL tidak bocor ke frontend
- ✅ Error logging detail di server console
- ✅ Pesan error yang user-friendly

Sekarang silakan push perubahan dan redeploy! 🚀
