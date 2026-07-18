'use server';

import {
  parseInventoryMutationForm,
  persistInventoryMutation,
  type InventoryActionResult,
} from '@/lib/inventory';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';

export async function saveItemMutasi(formData: FormData): Promise<InventoryActionResult> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };
  }

  const parsed = parseInventoryMutationForm(formData);
  if (!parsed.success) {
    return parsed;
  }

  try {
    const result = await persistInventoryMutation(prisma, {
      ...parsed.input,
      createdById: session.id,
    });
    if (result.success) {
      revalidatePath('/');
      revalidatePath('/items');
      revalidatePath('/locations');
      revalidatePath(`/items/${result.itemId}`);
    }
    return result;
  } catch {
    return {
      success: false,
      error: 'Transaksi gagal disimpan. Periksa koneksi database, lalu coba lagi.',
    };
  }
}
