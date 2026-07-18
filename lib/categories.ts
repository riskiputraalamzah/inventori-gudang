export const itemCategories = [
  { code: 'KRS', name: 'Kursi' },
  { code: 'MJA', name: 'Meja' },
  { code: 'LMP', name: 'Lampu' },
  { code: 'RAK', name: 'Rak Penyimpanan' },
  { code: 'ALT', name: 'Alat Kantor' },
  { code: 'ELK', name: 'Elektronik' },
  { code: 'KMP', name: 'Komputer & Aksesoris' },
  { code: 'ATK', name: 'Alat Tulis Kantor' },
] as const;

export type ItemCategory = (typeof itemCategories)[number];

export function getItemCategory(code: string): ItemCategory | undefined {
  return itemCategories.find((cat) => cat.code === code);
}
