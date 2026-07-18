# Dokumentasi Inventori Gudang

Folder ini adalah konteks proyek. Baca sebelum mengubah fitur, skema database, atau konfigurasi.

## Urutan baca

1. [Audit awal](./audit.md) — kondisi kode saat audit pertama, risiko, dan urutan perbaikan.
2. [PRD](./best-practice/prd.md) — masalah bisnis, pengguna, alur, dan kebutuhan fitur.
3. [Design](./best-practice/design.md) — keputusan arsitektur dan rancangan teknis target.
4. [Sprint](./best-practice/sprint.md) — urutan kerja kecil yang dapat selesai dan diuji.
5. [Panduan AI agent](./best-practice/ai-agent-guide.md) — konteks dan aturan saat bekerja bersama AI.
6. [Auto-generate SKU](./sku-auto-generate.md) — auto-generate SKU berdasarkan kategori barang.
7. [Manage Lokasi](./manage-lokasi.md) — kelola lokasi penyimpanan (rak) dinamis dan denah.
8. [Deploy & Backup](./deploy-production.md) — panduan deploy Vercel + Neon, backup restore, dan akun default.

## Status dokumentasi

- Aplikasi saat ini: prototipe belajar Next.js + Prisma untuk mencatat barang dan lokasi gudang.
- Dokumen ini: target perbaikan. Dokumen bukan bukti bahwa semua target sudah diterapkan.
- Kode sumber: tetap menjadi sumber fakta untuk perilaku aplikasi yang sudah berjalan.

## Cara memakai

- Perubahan kecil: baca `audit.md`, pilih item sprint terkait, lalu kerjakan dan perbarui statusnya.
- Fitur baru: perbarui PRD terlebih dahulu bila alur atau aturan bisnis berubah.
- Perubahan teknis besar: perbarui `design.md` sebelum mengubah struktur folder atau database.
- Kerja dengan AI agent: berikan tautan dokumen relevan, batas pekerjaan, dan perintah verifikasi.
