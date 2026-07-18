'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';

const categorySchema = z.object({
  code: z
    .string()
    .min(2, 'Kode minimal 2 karakter')
    .max(10, 'Kode maksimal 10 karakter')
    .regex(/^[A-Z0-9]+$/, 'Kode hanya boleh huruf besar dan angka')
    .transform((val) => val.toUpperCase()),
  name: z.string().min(1, 'Nama kategori wajib diisi').max(100, 'Nama maksimal 100 karakter'),
});

export type CategoryActionResult =
  | { success: true; categoryId?: number }
  | { success: false; error: string };

export async function saveCategory(formData: FormData): Promise<CategoryActionResult> {
  try {
    const session = await requireSession();
    if (session.role !== 'admin') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang diizinkan.' };
    }

    const code = formData.get('code')?.toString().trim().toUpperCase() ?? '';
    const name = formData.get('name')?.toString().trim() ?? '';

    const validated = categorySchema.parse({ code, name });

    const existing = await prisma.itemCategory.findUnique({
      where: { code: validated.code },
    });

    if (existing) {
      return { success: false, error: `Kode kategori ${validated.code} sudah dipakai.` };
    }

    const category = await prisma.itemCategory.create({
      data: validated,
    });

    revalidatePath('/categories');
    revalidatePath('/items/new');

    return { success: true, categoryId: category.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? 'Data tidak valid.' };
    }
    return { success: false, error: 'Gagal menyimpan kategori.' };
  }
}

export async function toggleCategoryStatus(
  id: number,
  isActive: boolean,
): Promise<CategoryActionResult> {
  try {
    const session = await requireSession();
    if (session.role !== 'admin') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang diizinkan.' };
    }

    await prisma.itemCategory.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath('/categories');
    revalidatePath('/items/new');

    return { success: true };
  } catch {
    return { success: false, error: 'Gagal mengubah status kategori.' };
  }
}

export async function deleteCategory(id: number): Promise<CategoryActionResult> {
  try {
    const session = await requireSession();
    if (session.role !== 'admin') {
      return { success: false, error: 'Akses ditolak. Hanya Administrator yang diizinkan.' };
    }

    const category = await prisma.itemCategory.findUnique({
      where: { id },
      select: { code: true },
    });

    if (!category) {
      return { success: false, error: 'Kategori tidak ditemukan.' };
    }

    const itemsWithCategory = await prisma.item.count({
      where: { sku: { startsWith: `${category.code}-` } },
    });

    if (itemsWithCategory > 0) {
      return {
        success: false,
        error: `Tidak dapat menghapus kategori ${category.code}. Masih ada ${itemsWithCategory} barang yang memakai kategori ini.`,
      };
    }

    await prisma.itemCategory.delete({
      where: { id },
    });

    revalidatePath('/categories');
    revalidatePath('/items/new');

    return { success: true };
  } catch {
    return { success: false, error: 'Gagal menghapus kategori.' };
  }
}
