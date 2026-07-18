'use server';

import { prisma } from '@/lib/prisma';

export async function getActiveCategories(): Promise<Array<{ code: string; name: string }>> {
  try {
    return await prisma.itemCategory.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      select: { code: true, name: true },
    });
  } catch {
    // Fallback static jika db offline
    return [
      { code: 'KRS', name: 'Kursi' },
      { code: 'MJA', name: 'Meja' },
      { code: 'LMP', name: 'Lampu' },
      { code: 'ALT', name: 'Alat Kantor' },
    ];
  }
}

export async function getActiveLocations(): Promise<
  Array<{ code: string; name: string; xPercent: number | null; yPercent: number | null; isActive: boolean }>
> {
  try {
    return await prisma.warehouseLocation.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      select: { code: true, name: true, xPercent: true, yPercent: true, isActive: true },
    });
  } catch {
    // Fallback static jika db offline (A-01 sampai C-04)
    return [
      { code: 'A-01', name: 'Rak A-01', xPercent: 17, yPercent: 12.5, isActive: true },
      { code: 'A-02', name: 'Rak A-02', xPercent: 17, yPercent: 37.5, isActive: true },
      { code: 'A-03', name: 'Rak A-03', xPercent: 17, yPercent: 62.5, isActive: true },
      { code: 'A-04', name: 'Rak A-04', xPercent: 17, yPercent: 87.5, isActive: true },
      { code: 'B-01', name: 'Rak B-01', xPercent: 50, yPercent: 12.5, isActive: true },
      { code: 'B-02', name: 'Rak B-02', xPercent: 50, yPercent: 37.5, isActive: true },
      { code: 'B-03', name: 'Rak B-03', xPercent: 50, yPercent: 62.5, isActive: true },
      { code: 'B-04', name: 'Rak B-04', xPercent: 50, yPercent: 87.5, isActive: true },
      { code: 'C-01', name: 'Rak C-01', xPercent: 83, yPercent: 12.5, isActive: true },
      { code: 'C-02', name: 'Rak C-02', xPercent: 83, yPercent: 37.5, isActive: true },
      { code: 'C-03', name: 'Rak C-03', xPercent: 83, yPercent: 62.5, isActive: true },
      { code: 'C-04', name: 'Rak C-04', xPercent: 83, yPercent: 87.5, isActive: true },
    ];
  }
}

export async function generateNextSku(categoryCode: string): Promise<string> {
  try {
    const prefix = categoryCode.toUpperCase();
    const lastItem = await prisma.item.findFirst({
      where: { sku: { startsWith: prefix + '-' } },
      orderBy: { sku: 'desc' },
      select: { sku: true },
    });

    if (!lastItem) {
      return `${prefix}-001`;
    }

    const match = lastItem.sku.match(/^[A-Z]+-(\d+)$/);
    if (!match) {
      return `${prefix}-001`;
    }

    const nextNumber = parseInt(match[1], 10) + 1;
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  } catch {
    return `${categoryCode.toUpperCase()}-001`;
  }
}
