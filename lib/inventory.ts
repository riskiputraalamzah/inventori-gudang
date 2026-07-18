import { Prisma, type PrismaClient } from '../app/generated/prisma/index.js';
import { itemSchema } from './schemas';
import { getWarehouseRack } from './warehouse';
import { z } from 'zod';

const movementTypeSchema = z.enum(['IN', 'OUT', 'TRANSFER']);

type InventoryFailure = { success: false; error: string };

export type InventoryActionResult = { success: true; itemId: number } | InventoryFailure;

type ParsedInventoryMutation = { success: true; input: InventoryMutationInput } | InventoryFailure;

export type InventoryMutationInput = {
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  note?: string;
  type: z.infer<typeof movementTypeSchema>;
  locationCode: string;
  destinationLocationCode?: string;
  createdById: number;
};

function failure(error: string): InventoryFailure {
  return { success: false, error };
}

function getFormValue(formData: FormData, key: string): string {
  return formData.get(key)?.toString().trim() ?? '';
}

export function parseInventoryMutationForm(
  formData: FormData,
): ParsedInventoryMutation {
  const sku = getFormValue(formData, 'sku').toUpperCase();
  const name = getFormValue(formData, 'name');
  const unit = getFormValue(formData, 'unit');
  const quantityRaw = getFormValue(formData, 'qty');
  const note = getFormValue(formData, 'note');
  const typeResult = movementTypeSchema.safeParse(getFormValue(formData, 'type') || 'IN');
  const locationCode = getFormValue(formData, 'location').toUpperCase();
  const destinationLocationCode = getFormValue(formData, 'destLocation').toUpperCase();

  if (!sku || !quantityRaw) {
    return failure('SKU dan jumlah wajib diisi.');
  }

  if (!typeResult.success) {
    return failure('Jenis mutasi tidak valid.');
  }

  if (!/^\d+$/.test(quantityRaw)) {
    return failure('Jumlah harus berupa bilangan bulat positif.');
  }

  const quantity = Number(quantityRaw);
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return failure('Jumlah harus berupa bilangan bulat positif.');
  }

  if (!locationCode) {
    return failure('Pilih lokasi asal atau lokasi penyimpanan terlebih dahulu.');
  }

  if (note.length > 500) {
    return failure('Catatan maksimal 500 karakter.');
  }

  if (typeResult.data === 'IN') {
    const itemResult = itemSchema.safeParse({ sku, name, unit, isActive: true });
    if (!itemResult.success) {
      return failure(itemResult.error.issues[0]?.message ?? 'Data barang tidak valid.');
    }
  }

  if (typeResult.data === 'TRANSFER') {
    if (!destinationLocationCode) {
      return failure('Pilih lokasi tujuan pemindahan barang.');
    }

    if (locationCode === destinationLocationCode) {
      return failure('Lokasi asal dan lokasi tujuan tidak boleh sama.');
    }
  }

  return {
    success: true,
    input: {
      sku,
      name,
      unit,
      quantity,
      note: note || undefined,
      type: typeResult.data,
      locationCode,
      destinationLocationCode: destinationLocationCode || undefined,
      createdById: 0, // placeholder, will be replaced with user session ID at the actions layer
    },
  };
}

export function hasSufficientStock(availableQuantity: number | undefined, requestedQuantity: number): boolean {
  return (availableQuantity ?? 0) >= requestedQuantity;
}

async function getLocation(
  tx: Prisma.TransactionClient,
  code: string,
): Promise<{ id: number } | null> {
  const rack = getWarehouseRack(code);
  if (!rack) return null;

  return tx.warehouseLocation.upsert({
    where: { code: rack.code },
    create: rack,
    update: {},
    select: { id: true },
  });
}

async function executeInventoryMutation(
  tx: Prisma.TransactionClient,
  input: InventoryMutationInput,
): Promise<InventoryActionResult> {
  const existingItem = await tx.item.findUnique({
    where: { sku: input.sku },
    select: { id: true, name: true, unit: true },
  });

  let itemId: number;
  if (input.type === 'IN') {
    if (existingItem) {
      if (existingItem.name !== input.name || existingItem.unit !== input.unit) {
        return failure(
          `SKU ${input.sku} sudah dipakai oleh ${existingItem.name} (${existingItem.unit}). Gunakan data master yang sama.`,
        );
      }
      itemId = existingItem.id;
    } else {
      const item = await tx.item.create({
        data: { sku: input.sku, name: input.name, unit: input.unit },
        select: { id: true },
      });
      itemId = item.id;
    }
  } else {
    if (!existingItem) {
      return failure(`Barang dengan SKU ${input.sku} belum terdaftar.`);
    }
    itemId = existingItem.id;
  }

  const sourceLocation = await getLocation(tx, input.locationCode);
  if (!sourceLocation) {
    return failure(`Lokasi ${input.locationCode} tidak terdaftar pada denah gudang.`);
  }

  if (input.type === 'IN') {
    await tx.stockBalance.upsert({
      where: { itemId_locationId: { itemId, locationId: sourceLocation.id } },
      create: { itemId, locationId: sourceLocation.id, quantity: input.quantity },
      update: { quantity: { increment: input.quantity } },
    });
    await tx.stockMovement.create({
      data: {
        itemId,
        type: 'IN',
        quantity: input.quantity,
        destinationLocationId: sourceLocation.id,
        note: input.note ?? 'Barang masuk',
        createdById: input.createdById,
      },
    });

    return { success: true, itemId };
  }

  const reducedBalance = await tx.stockBalance.updateMany({
    where: {
      itemId,
      locationId: sourceLocation.id,
      quantity: { gte: input.quantity },
    },
    data: { quantity: { decrement: input.quantity } },
  });

  if (reducedBalance.count !== 1) {
    const balance = await tx.stockBalance.findUnique({
      where: { itemId_locationId: { itemId, locationId: sourceLocation.id } },
      select: { quantity: true },
    });
    return failure(
      `Stok di Rak ${input.locationCode} tidak cukup. Tersedia: ${balance?.quantity ?? 0}.`,
    );
  }

  if (input.type === 'OUT') {
    await tx.stockMovement.create({
      data: {
        itemId,
        type: 'OUT',
        quantity: input.quantity,
        sourceLocationId: sourceLocation.id,
        note: input.note ?? 'Barang keluar',
        createdById: input.createdById,
      },
    });

    return { success: true, itemId };
  }

  const destinationLocation = await getLocation(tx, input.destinationLocationCode ?? '');
  if (!destinationLocation) {
    throw new Error('Lokasi tujuan tidak valid setelah validasi transaksi.');
  }

  await tx.stockBalance.upsert({
    where: { itemId_locationId: { itemId, locationId: destinationLocation.id } },
    create: { itemId, locationId: destinationLocation.id, quantity: input.quantity },
    update: { quantity: { increment: input.quantity } },
  });
  await tx.stockMovement.create({
    data: {
      itemId,
      type: 'TRANSFER',
      quantity: input.quantity,
      sourceLocationId: sourceLocation.id,
      destinationLocationId: destinationLocation.id,
      note: input.note ?? 'Transfer lokasi',
      createdById: input.createdById,
    },
  });

  return { success: true, itemId };
}

function isRetryableTransactionError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
}

export async function persistInventoryMutation(
  db: PrismaClient,
  input: InventoryMutationInput,
): Promise<InventoryActionResult> {
  const attempts = 3;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await db.$transaction(
        (tx) => executeInventoryMutation(tx, input),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5_000,
          timeout: 10_000,
        },
      );
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt === attempts - 1) {
        throw error;
      }
    }
  }

  return failure('Transaksi tidak dapat disimpan. Coba lagi.');
}
