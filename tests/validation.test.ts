import { describe, it, expect } from 'vitest';
import { hasSufficientStock, parseInventoryMutationForm } from '../lib/inventory';
import { itemSchema, stockMovementSchema } from '../lib/schemas';
import { getItemCategory } from '../lib/categories';

function createFormData(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe('Validation Schemas', () => {
  describe('itemSchema', () => {
    it('should validate correct SKU and name', () => {
      const res = itemSchema.safeParse({ sku: 'KRS-A12', name: 'Kursi', unit: 'pcs' });
      expect(res.success).toBe(true);
    });

    it('should reject invalid SKU character', () => {
      const res = itemSchema.safeParse({ sku: 'KRS A12!', name: 'Kursi', unit: 'pcs' });
      expect(res.success).toBe(false);
    });

    it('should reject empty item name', () => {
      const res = itemSchema.safeParse({ sku: 'KRS-A12', name: '', unit: 'pcs' });
      expect(res.success).toBe(false);
    });
  });

  describe('stockMovementSchema', () => {
    it('should reject zero or negative quantity', () => {
      const res = stockMovementSchema.safeParse({
        itemId: 1,
        type: 'IN',
        quantity: 0,
        createdById: 1,
      });
      expect(res.success).toBe(false);
    });

    it('should accept valid quantity and type', () => {
      const res = stockMovementSchema.safeParse({
        itemId: 1,
        type: 'TRANSFER',
        quantity: 50,
        createdById: 1,
      });
      expect(res.success).toBe(true);
    });
  });

  describe('mutasi persediaan', () => {
    it('normalisasi SKU, lokasi, dan catatan mutasi masuk', () => {
      const result = parseInventoryMutationForm(
        createFormData({
          sku: '  krs-a12 ',
          name: 'Kursi',
          unit: 'pcs',
          qty: '10',
          location: ' a-01 ',
          type: 'IN',
          note: '  Penerimaan supplier  ',
        }),
      );

      expect(result).toEqual({
        success: true,
        input: {
          sku: 'KRS-A12',
          name: 'Kursi',
          unit: 'pcs',
          quantity: 10,
          locationCode: 'A-01',
          type: 'IN',
          note: 'Penerimaan supplier',
          destinationLocationCode: undefined,
          createdById: 0,
        },
      });
    });

    it('menolak jumlah pecahan dan transfer ke rak sama', () => {
      const decimalResult = parseInventoryMutationForm(
        createFormData({ sku: 'KRS-A12', qty: '1.5', location: 'A-01', type: 'OUT' }),
      );
      const sameRackResult = parseInventoryMutationForm(
        createFormData({
          sku: 'KRS-A12',
          qty: '1',
          location: 'A-01',
          destLocation: 'A-01',
          type: 'TRANSFER',
        }),
      );

      expect(decimalResult).toEqual({
        success: false,
        error: 'Jumlah harus berupa bilangan bulat positif.',
      });
      expect(sameRackResult).toEqual({
        success: false,
        error: 'Lokasi asal dan lokasi tujuan tidak boleh sama.',
      });
    });

    it('memastikan stok sumber cukup sebelum mutasi keluar', () => {
      expect(hasSufficientStock(10, 10)).toBe(true);
      expect(hasSufficientStock(9, 10)).toBe(false);
      expect(hasSufficientStock(undefined, 1)).toBe(false);
    });
  });

  describe('kategori barang', () => {
    it('mengenali kode kategori valid', () => {
      expect(getItemCategory('KRS')).toEqual({ code: 'KRS', name: 'Kursi' });
      expect(getItemCategory('MJA')).toEqual({ code: 'MJA', name: 'Meja' });
      expect(getItemCategory('INVALID')).toBeUndefined();
    });
  });
});
