import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma/index.js';
import { persistInventoryMutation } from '../lib/inventory';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeIntegration = testDatabaseUrl ? describe : describe.skip;

describeIntegration('mutasi stok PostgreSQL', () => {
  let pool: Pool;
  let prisma: PrismaClient;
  const sku = `TEST-MUTATION-${Date.now()}`;
  let itemId = 0;
  let testUser: { id: number };

  beforeAll(async () => {
    pool = new Pool({ connectionString: testDatabaseUrl });
    prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as never);
    await prisma.$connect();

    testUser = await prisma.user.upsert({
      where: { email: 'test-runner@gudang.local' },
      create: { name: 'Test Runner', email: 'test-runner@gudang.local', role: 'admin' },
      update: {},
      select: { id: true },
    });
  });

  afterAll(async () => {
    if (!prisma) return;

    if (itemId) {
      await prisma.stockMovement.deleteMany({ where: { itemId } });
      await prisma.stockBalance.deleteMany({ where: { itemId } });
      await prisma.item.delete({ where: { id: itemId } });
    }
    if (testUser?.id) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
    await pool.end();
  });

  it('menolak stok negatif saat dua mutasi keluar berjalan bersamaan', async () => {
    const incoming = await persistInventoryMutation(prisma, {
      sku,
      name: 'Barang test mutasi',
      unit: 'pcs',
      quantity: 10,
      type: 'IN',
      locationCode: 'A-01',
      createdById: testUser.id,
    });
    expect(incoming.success).toBe(true);
    if (!incoming.success) return;
    itemId = incoming.itemId;

    const [firstOut, secondOut] = await Promise.all([
      persistInventoryMutation(prisma, {
        sku,
        name: '',
        unit: '',
        quantity: 6,
        type: 'OUT',
        locationCode: 'A-01',
        createdById: testUser.id,
      }),
      persistInventoryMutation(prisma, {
        sku,
        name: '',
        unit: '',
        quantity: 6,
        type: 'OUT',
        locationCode: 'A-01',
        createdById: testUser.id,
      }),
    ]);

    expect([firstOut.success, secondOut.success].filter(Boolean)).toHaveLength(1);

    const sourceBalance = await prisma.stockBalance.findFirst({
      where: { itemId, location: { code: 'A-01' } },
      select: { quantity: true },
    });
    expect(sourceBalance?.quantity).toBe(4);

    const transfer = await persistInventoryMutation(prisma, {
      sku,
      name: '',
      unit: '',
      quantity: 3,
      type: 'TRANSFER',
      locationCode: 'A-01',
      destinationLocationCode: 'B-01',
      createdById: testUser.id,
    });
    expect(transfer.success).toBe(true);

    const balances = await prisma.stockBalance.findMany({
      where: { itemId },
      include: { location: { select: { code: true } } },
    });
    expect(balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ quantity: 1, location: { code: 'A-01' } }),
        expect.objectContaining({ quantity: 3, location: { code: 'B-01' } }),
      ]),
    );
  });
});
