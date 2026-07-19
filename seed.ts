import 'dotenv/config';
import { PrismaClient } from './app/generated/prisma/index.js';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from './lib/auth';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL tidak ditemukan di environment variable.');
  }

  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: url });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  await prisma.$connect();

  // 1. Seed Categories
  console.log('Seeding categories...');
  const categories = [
    { code: 'KRS', name: 'Kursi' },
    { code: 'MJA', name: 'Meja' },
    { code: 'LMP', name: 'Lampu' },
    { code: 'RAK', name: 'Rak Penyimpanan' },
    { code: 'ALT', name: 'Alat Kantor' },
    { code: 'ELK', name: 'Elektronik' },
    { code: 'KMP', name: 'Komputer & Aksesoris' },
    { code: 'ATK', name: 'Alat Tulis Kantor' },
  ];

  for (const cat of categories) {
    await prisma.itemCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name },
      create: { ...cat, isActive: true },
    });
  }

  // 2. Seed Locations
  console.log('Seeding locations...');
  const locations = [
    { code: 'A-01', name: 'Rak A-01', xPercent: 17, yPercent: 12.5 },
    { code: 'A-02', name: 'Rak A-02', xPercent: 17, yPercent: 37.5 },
    { code: 'A-03', name: 'Rak A-03', xPercent: 17, yPercent: 62.5 },
    { code: 'A-04', name: 'Rak A-04', xPercent: 17, yPercent: 87.5 },
    { code: 'B-01', name: 'Rak B-01', xPercent: 50, yPercent: 12.5 },
    { code: 'B-02', name: 'Rak B-02', xPercent: 50, yPercent: 37.5 },
    { code: 'B-03', name: 'Rak B-03', xPercent: 50, yPercent: 62.5 },
    { code: 'B-04', name: 'Rak B-04', xPercent: 50, yPercent: 87.5 },
    { code: 'C-01', name: 'Rak C-01', xPercent: 83, yPercent: 12.5 },
    { code: 'C-02', name: 'Rak C-02', xPercent: 83, yPercent: 37.5 },
    { code: 'C-03', name: 'Rak C-03', xPercent: 83, yPercent: 62.5 },
    { code: 'C-04', name: 'Rak C-04', xPercent: 83, yPercent: 87.5 },
  ];

  for (const loc of locations) {
    await prisma.warehouseLocation.upsert({
      where: { code: loc.code },
      update: {
        xPercent: loc.xPercent,
        yPercent: loc.yPercent,
      },
      create: { ...loc, isActive: true },
    });
  }

  // 3. Seed Users
  console.log('Seeding users...');
  const users = [
    {
      name: 'Administrator Utama',
      email: 'admin@gudang.com',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
    },
    {
      name: 'Petugas Lapangan',
      email: 'petugas@gudang.com',
      passwordHash: hashPassword('petugas123'),
      role: 'petugas',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash: u.passwordHash,
        role: u.role,
      },
      create: u,
    });
  }

  await prisma.$disconnect();
  await pool.end();
  console.log('✅ Database seeding completed successfully.');
}

main().catch((e) => {
  console.error('❌ Database seeding failed:', e);
  process.exit(1);
});