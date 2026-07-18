# Panduan Kerja dengan AI Agent

## Tujuan

AI agent dapat mempercepat eksplorasi, implementasi, test, dan dokumentasi. AI tidak menggantikan keputusan produk, review data, atau tanggung jawab manusia atas perubahan.

Dokumen ini memberi konteks minimum agar hasil kerja AI konsisten dan aman.

## Konteks wajib sebelum memberi tugas

Berikan empat hal berikut:

1. **Tujuan:** masalah pengguna yang ingin diselesaikan.
2. **Batas:** file/fitur yang boleh diubah dan yang tidak boleh disentuh.
3. **Referensi:** tautan ke `docs/audit.md`, PRD, design, atau sprint relevan.
4. **Verifikasi:** perintah test/build atau perilaku yang harus dibuktikan.

Contoh tugas baik:

```text
Kerjakan Sprint 0 item README setup.
Jangan ubah schema atau migrasi.
Tambahkan .env.example tanpa nilai rahasia dan dokumentasikan npm ci,
prisma generate, serta langkah migrasi aman.
Verifikasi isi dokumentasi dan jangan menjalankan migrasi pada database nyata.
```

Contoh tugas terlalu kabur:

```text
Tolong rapikan semua proyek.
```

## Aturan kerja

- Baca `AGENTS.md` dan dokumentasi relevan sebelum mengubah file.
- Audit kondisi sekarang sebelum mengusulkan arsitektur baru.
- Pisahkan perubahan fondasi, model data, dan UI. Jangan gabungkan semua dalam satu perubahan besar.
- Jangan mengubah atau menghapus migrasi yang mungkin sudah dijalankan tanpa backup dan keputusan eksplisit.
- Jangan menulis password, token, URL database asli, atau data pribadi dalam commit maupun docs.
- Jangan menjalankan auto-fix dependency atau migrasi destruktif tanpa meninjau diff dan dampak versi.
- Tambahkan test atau langkah verifikasi untuk bug yang diperbaiki.
- Perbarui dokumen bila keputusan produk atau desain berubah.

## Protokol perubahan database

Sebelum meminta AI mengubah Prisma:

1. Sebutkan apakah database lokal masih kosong, berisi data contoh, atau berisi data penting.
2. Minta AI membaca schema dan semua migration SQL yang ada.
3. Minta rencana migration dan rollback sebelum menjalankan perintah database.
4. Backup database bila data penting.
5. Uji pada database salinan atau development terlebih dahulu.

## Format handoff AI yang diharapkan

Setelah pekerjaan selesai, minta laporan singkat berisi:

- file yang diubah;
- masalah yang diselesaikan;
- keputusan penting dan alasannya;
- perintah verifikasi beserta hasil;
- risiko atau pekerjaan lanjutan;
- perubahan dokumentasi yang dilakukan.

## Checklist review manusia

- Apakah perubahan memenuhi PRD, bukan hanya terlihat bagus?
- Apakah aturan stok dan data tetap benar saat request gagal atau bersamaan?
- Apakah rahasia tidak masuk repository?
- Apakah migration aman untuk data lama?
- Apakah lint, typecheck, test, dan build sudah dijalankan sesuai batas tugas?
- Apakah docs masih cocok dengan kode?

## Kapan AI harus berhenti dan bertanya

AI harus meminta keputusan manusia bila:

- SKU, satuan, atau aturan stok belum jelas;
- ada pilihan yang dapat menghapus/mengubah data lama;
- kredensial atau akses production dibutuhkan;
- requirement bertentangan dengan PRD atau design;
- scope perubahan melebar jauh dari sprint aktif.
