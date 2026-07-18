# Auto-Generate SKU

**Status:** ✅ Kategori sekarang tersimpan di database dan dapat dikelola secara dinamis.

## Format SKU

```
{KATEGORI}-{NOMOR}
```

Contoh:
- `KRS-001` — Kursi nomor urut 001
- `MJA-045` — Meja nomor urut 045
- `LMP-128` — Lampu nomor urut 128

## Kategori Tersedia

Kategori disimpan di tabel database `ItemCategory` dan dapat dikelola melalui menu **Kategori** di sidebar/navbar aplikasi.

**Kategori Default (seeded saat migrasi):**

- `KRS` — Kursi
- `MJA` — Meja
- `LMP` — Lampu
- `RAK` — Rak Penyimpanan
- `ALT` — Alat Kantor
- `ELK` — Elektronik
- `KMP` — Komputer & Aksesoris
- `ATK` — Alat Tulis Kantor

Kategori dapat ditambah, dinonaktifkan, atau dihapus melalui menu `/categories`.

## Cara Kerja

### Mode Otomatis (Default)

1. User pilih kategori dari dropdown (misal: `KRS`)
2. Sistem query database mencari SKU terakhir dengan prefix `KRS-`
3. Sistem membaca nomor urut terakhir, tambah 1
4. Sistem generate SKU baru: `KRS-{nomor}` dengan padding 3 digit

Contoh urutan:
```
KRS-001 → KRS-002 → KRS-003 → ... → KRS-099 → KRS-100
```

### Mode Manual

User dapat toggle ke "Input Manual" untuk memasukkan SKU custom:
- `KRS-ERGO-2026-001`
- `CUSTOM-XYZ`
- `SUPPLIER-ABC123`

Mode manual cocok untuk:
- Barang dengan SKU dari supplier
- Migrasi data dari sistem lama
- Format khusus yang tidak mengikuti pola standar

## Implementasi Teknis

### Server Action

**`app/actions/sku.ts`:**
```typescript
export async function getActiveCategories(): Promise<Array<{ code: string; name: string }>>
export async function generateNextSku(categoryCode: string): Promise<string>
```

- `getActiveCategories()`: Query database `ItemCategory` dengan filter `isActive: true`
- `generateNextSku()`: Query `findFirst` dengan `where: { sku: { startsWith: prefix } }` dan `orderBy: { sku: 'desc' }`
- Parse nomor urut dengan regex `/^[A-Z]+-(\d+)$/`
- Return format `{PREFIX}-{nomor padStart 3 digit}`

### UI Form

`app/items/new/page.tsx`:
- Radio toggle: "SKU Otomatis" vs "Input Manual"
- Mode auto: dropdown kategori (dari database) + input SKU (editable)
- Mode manual: input text bebas
- `useEffect` fetch kategori aktif dari database saat mount
- `useEffect` trigger generate SKU saat kategori berubah

### Validasi

Tetap validasi di `lib/schemas.ts`:
- SKU minimal 3 karakter
- Hanya huruf besar, angka, dash, underscore
- Cek duplikasi di database saat `saveItemMutasi`

## Best Practice

1. **Gunakan auto-generate untuk konsistensi**: SKU terurut, mudah dicari, tidak duplikasi
2. **Izinkan edit SKU yang di-generate**: User dapat tweak jika butuh format khusus (misal: `KRS-001A`)
3. **Manual input untuk edge case**: Barang dengan identitas dari luar sistem
4. **Validasi tetap strict**: Apapun mode-nya, SKU harus unik dan sesuai aturan regex
5. **Nonaktifkan kategori daripada hapus**: Kategori yang sudah dipakai barang tidak dapat dihapus (foreign key constraint)

## Mengelola Kategori

### Tambah Kategori Baru

1. Buka menu **Kategori** di sidebar
2. Klik **Tambah Kategori**
3. Isi **Kode** (2-10 karakter, huruf besar & angka)
4. Isi **Nama Kategori**
5. Simpan

Kategori baru langsung muncul di dropdown tanpa perlu migrasi database.

### Nonaktifkan Kategori

Klik tombol **Power** (hijau/abu) di tabel kategori. Kategori nonaktif tidak muncul di dropdown form barang masuk.

### Hapus Kategori

Klik tombol **Trash** (merah). Sistem akan:
- Cek apakah ada barang dengan SKU prefix kategori tersebut
- Jika ada barang, hapus ditolak dengan pesan error
- Jika kosong, kategori dihapus permanen

**Rekomendasi:** Nonaktifkan kategori daripada menghapus untuk menjaga integritas histori.

## Contoh Penggunaan

### Barang Baru

1. Buka `/items/new`
2. Pilih "Barang Masuk"
3. Mode default: "SKU Otomatis (Recommended)"
4. Pilih kategori: "KRS - Kursi"
5. SKU otomatis terisi: `KRS-001` (atau nomor urut terakhir + 1)
6. Isi nama barang, jumlah, lokasi
7. Simpan

### Barang dengan SKU Custom

1. Toggle ke "Input Manual"
2. Ketik SKU bebas: `SUPPLIER-ABC123`
3. Sistem tetap validasi format dan duplikasi
4. Simpan

## FAQ

**Q: Apakah SKU yang di-generate bisa diubah sebelum disimpan?**
A: Ya, field SKU tetap editable. User bisa tweak manual jika butuh.

**Q: Apa yang terjadi jika ada gap nomor (misal KRS-001, KRS-003)?**
A: Sistem ambil nomor tertinggi (`KRS-003`), jadi SKU berikutnya `KRS-004`. Gap tidak masalah.

**Q: Bagaimana jika SKU manual bentrok dengan yang sudah ada?**
A: Validasi di server akan menolak dengan pesan error "SKU sudah dipakai".

**Q: Apakah bisa pindah kategori setelah barang tersimpan?**
A: Tidak. SKU bersifat immutable setelah barang masuk database. Ini untuk menjaga konsistensi histori.

**Q: Bagaimana jika kategori dihapus tetapi masih ada barang yang memakainya?**
A: Sistem menolak hapus dan menampilkan jumlah barang yang masih memakai kategori tersebut. Nonaktifkan kategori jika tidak ingin muncul di dropdown.

**Q: Apakah kategori lama yang sudah dipakai barang akan hilang dari laporan?**
A: Tidak. Kategori tersimpan sebagai prefix SKU di tabel `Item`. Meskipun kategori dihapus dari master, SKU barang tetap valid dan dapat dicari.
