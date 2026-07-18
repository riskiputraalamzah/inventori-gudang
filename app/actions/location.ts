'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';

const locationSchema = z.object({
  code: z
    .string()
    .min(2, 'Kode minimal 2 karakter')
    .max(20, 'Kode maksimal 20 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode hanya boleh huruf besar, angka, dash, dan underscore')
    .transform((val) => val.toUpperCase()),
  name: z.string().min(1, 'Nama lokasi wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  xPercent: z.number().min(0, 'Minimal 0').max(100, 'Maksimal 100').optional().nullable(),
  yPercent: z.number().min(0, 'Minimal 0').max(100, 'Maksimal 100').optional().nullable(),
});

export type LocationActionResult =
  | { success: true; locationId?: number }
  | { success: false; error: string };

export async function saveLocation(formData: FormData): Promise<LocationActionResult> {
  try {
    const session = await requireSession();
    if (session.role !== 'admin') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang diizinkan.' };
    }

    const code = formData.get('code')?.toString().trim().toUpperCase() ?? '';
    const name = formData.get('name')?.toString().trim() ?? '';
    const xRaw = formData.get('xPercent')?.toString().trim();
    const yRaw = formData.get('yPercent')?.toString().trim();

    const xPercent = xRaw ? Number(xRaw) : null;
    const yPercent = yRaw ? Number(yRaw) : null;

    const validated = locationSchema.parse({ code, name, xPercent, yPercent });

    const existing = await prisma.warehouseLocation.findUnique({
      where: { code: validated.code },
    });

    if (existing) {
      return { success: false, error: `Kode lokasi ${validated.code} sudah dipakai.` };
    }

    const location = await prisma.warehouseLocation.create({
      data: {
        code: validated.code,
        name: validated.name,
        xPercent: validated.xPercent,
        yPercent: validated.yPercent,
        isActive: true,
      },
    });

    revalidatePath('/locations');
    revalidatePath('/items/new');

    return { success: true, locationId: location.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? 'Data tidak valid.' };
    }
    return { success: false, error: 'Gagal menyimpan lokasi.' };
  }
}

export async function updateLocation(
  id: number,
  formData: FormData,
): Promise<LocationActionResult> {
  try {
    const session = await requireSession();
    if (session.role !== 'admin') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang diizinkan.' };
    }

    const name = formData.get('name')?.toString().trim() ?? '';
    const xRaw = formData.get('xPercent')?.toString().trim();
    const yRaw = formData.get('yPercent')?.toString().trim();
    const activeRaw = formData.get('isActive')?.toString();

    const xPercent = xRaw ? Number(xRaw) : null;
    const yPercent = yRaw ? Number(yRaw) : null;
    const isActive = activeRaw === 'true';

    // Code is immutable, only name, coordinates, and status are updated
    if (!name) {
      return { success: false, error: 'Nama lokasi wajib diisi.' };
    }

    if (xPercent !== null && (xPercent < 0 || xPercent > 100)) {
      return { success: false, error: 'Koordinat X harus antara 0 dan 100.' };
    }
    if (yPercent !== null && (yPercent < 0 || yPercent > 100)) {
      return { success: false, error: 'Koordinat Y harus antara 0 dan 100.' };
    }

    await prisma.warehouseLocation.update({
      where: { id },
      data: {
        name,
        xPercent,
        yPercent,
        isActive,
      },
    });

    revalidatePath('/locations');
    revalidatePath('/items/new');

    return { success: true };
  } catch {
    return { success: false, error: 'Gagal memperbarui lokasi.' };
  }
}

export async function toggleLocationStatus(
  id: number,
  isActive: boolean,
): Promise<LocationActionResult> {
  try {
    const session = await requireSession();
    if (session.role !== 'admin') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang diizinkan.' };
    }

    await prisma.warehouseLocation.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath('/locations');
    revalidatePath('/items/new');

    return { success: true };
  } catch {
    return { success: false, error: 'Gagal mengubah status lokasi.' };
  }
}

export async function deleteLocation(id: number): Promise<LocationActionResult> {
  try {
    const session = await requireSession();
    if (session.role !== 'admin') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang diizinkan.' };
    }

    const location = await prisma.warehouseLocation.findUnique({
      where: { id },
      select: { code: true },
    });

    if (!location) {
      return { success: false, error: 'Lokasi tidak ditemukan.' };
    }

    // Cek foreign key: balance dan movements
    const stockCount = await prisma.stockBalance.count({
      where: { locationId: id, quantity: { gt: 0 } },
    });

    if (stockCount > 0) {
      return {
        success: false,
        error: `Tidak dapat menghapus lokasi ${location.code}. Masih ada barang yang disimpan di lokasi ini.`,
      };
    }

    const movementCount = await prisma.stockMovement.count({
      where: {
        OR: [{ sourceLocationId: id }, { destinationLocationId: id }],
      },
    });

    if (movementCount > 0) {
      return {
        success: false,
        error: `Tidak dapat menghapus lokasi ${location.code} karena memiliki histori mutasi stok. Nonaktifkan saja lokasi ini.`,
      };
    }

    await prisma.warehouseLocation.delete({
      where: { id },
    });

    revalidatePath('/locations');
    revalidatePath('/items/new');

    return { success: true };
  } catch {
    return { success: false, error: 'Gagal menghapus lokasi.' };
  }
}
