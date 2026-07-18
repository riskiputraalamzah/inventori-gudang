# Manage Lokasi Gudang

## Konsep

Lokasi gudang adalah **rak fisik** tempat barang disimpan. Setiap lokasi memiliki:
- **Kode unik** (misal: `A-01`, `B-04`, `RAK-UTARA`)
- **Nama** deskriptif
- **Koordinat denah** (opsional) untuk visualisasi peta gudang
- **Status aktif/nonaktif**

## Tabel Database

```prisma
model WarehouseLocation {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  name      String
  xPercent  Float?
  yPercent  Float?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  stockBalancesHere         StockBalance[]
  stockMovementsSource      StockMovement[] @relation("MovementSource")
  stockMovementsDestination StockMovement[] @relation("MovementDestination")
}
```

## CRUD Lokasi

### Tambah Lokasi Baru

**Endpoint:** `/locations/new`

**Field:**
- **Kode** (wajib): 2-20 karakter, huruf besar, angka, dash, underscore
- **Nama** (wajib): Deskripsi lokasi
- **Koordinat X** (opsional): 0-100% untuk denah horizontal
- **Koordinat Y** (opsional): 0-100% untuk denah vertikal

**Validasi:**
- Kode unik (cek duplikasi)
- Format kode: `/^[A-Z0-9_-]+$/`
- Koordinat dalam range 0-100

### Edit Lokasi

**Endpoint:** `/locations/[id]/edit`

**Yang dapat diubah:**
- Nama lokasi
- Koordinat denah
- Status aktif/nonaktif

**Yang TIDAK dapat diubah:**
- Kode lokasi (immutable, untuk menjaga konsistensi referensi)

### Nonaktifkan Lokasi

Toggle status aktif/nonaktif. Lokasi nonaktif:
- Tidak muncul di dropdown form barang masuk
- Tidak muncul di peta denah
- Tetap terlihat di histori mutasi lama

### Hapus Lokasi

**Validasi ketat:**
```typescript
const hasStock = await prisma.stockBalance.count({
  where: { locationId: id, quantity: { gt: 0 } }
});

const hasHistory = await prisma.stockMovement.count({
  where: {
    OR: [
      { sourceLocationId: id },
      { destinationLocationId: id }
    ]
  }
});

if (hasStock > 0 || hasHistory > 0) {
  return { success: false, error: "Lokasi tidak dapat dihapus..." };
}
```

Lokasi hanya dapat dihapus jika:
1. ✅ Tidak ada stok barang di lokasi tersebut
2. ✅ Tidak ada histori mutasi yang mereferensi lokasi (IN/OUT/TRANSFER)

**Best Practice:** Nonaktifkan lokasi daripada menghapus untuk menjaga audit trail.

## Lokasi Default (Seed)

File `lib/warehouse.ts` berisi lokasi default yang di-seed saat setup:

```typescript
export const warehouseRacks = [
  { code: "A-01", name: "Rak A-01", xPercent: 17, yPercent: 12.5 },
  { code: "A-02", name: "Rak A-02", xPercent: 17, yPercent: 37.5 },
  // ... 12 rak total (A-01 sampai C-04)
] as const;
```

Lokasi ini:
- Sudah memiliki koordinat denah (grid 3 kolom × 4 baris)
- Dapat diedit atau dihapus seperti lokasi lain
- Bukan hardcoded, hanya default seed

## Peta Denah Gudang

**Endpoint:** `/locations`

## FAQ

**Q: Apakah lokasi dapat diganti namanya setelah ada stok?**
A: Ya, nama dapat diubah kapan saja. Hanya kode yang immutable.