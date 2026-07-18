-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_code_key" ON "ItemCategory"("code");

-- Seed default categories
INSERT INTO "ItemCategory" ("code", "name", "isActive") VALUES
  ('KRS', 'Kursi', true),
  ('MJA', 'Meja', true),
  ('LMP', 'Lampu', true),
  ('RAK', 'Rak Penyimpanan', true),
  ('ALT', 'Alat Kantor', true),
  ('ELK', 'Elektronik', true),
  ('KMP', 'Komputer & Aksesoris', true),
  ('ATK', 'Alat Tulis Kantor', true);
