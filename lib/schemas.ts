import { z } from 'zod';

export const itemSchema = z.object({
  sku: z
    .string()
    .min(3, 'SKU minimal 3 karakter')
    .max(50, 'SKU maksimal 50 karakter')
    .regex(/^[A-Za-z0-9_-]+$/, 'SKU hanya boleh huruf, angka, dash, dan underscore'),
  name: z.string().min(1, 'Nama barang tidak boleh kosong').max(255, 'Nama barang terlalu panjang'),
  unit: z.string().min(1, 'Satuan barang tidak boleh kosong').max(50, 'Satuan terlalu panjang'),
  isActive: z.boolean().default(true),
});

export const locationSchema = z.object({
  code: z
    .string()
    .min(2, 'Kode lokasi minimal 2 karakter')
    .max(50, 'Kode lokasi maksimal 50 karakter')
    .regex(/^[A-Za-z0-9_-]+$/, 'Kode lokasi hanya boleh huruf, angka, dash, dan underscore'),
  name: z.string().min(1, 'Nama lokasi tidak boleh kosong').max(255, 'Nama lokasi terlalu panjang'),
  xPercent: z.number().min(0).max(100).optional(),
  yPercent: z.number().min(0).max(100).optional(),
  isActive: z.boolean().default(true),
});

export const stockMovementSchema = z.object({
  itemId: z.number().int().positive('ID barang harus valid'),
  type: z.enum(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT']),
  quantity: z.number().int().positive('Kuantitas harus berupa angka positif lebih dari nol'),
  sourceLocationId: z.number().int().positive().optional(),
  destinationLocationId: z.number().int().positive().optional(),
  note: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
  createdById: z.number().int().positive('ID pembuat harus valid'),
});