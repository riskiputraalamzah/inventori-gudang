import { z } from "zod";

const envSchema = z
  .object({
    DATABASE_URL: z.string().url().optional(),
    POSTGRES_PRISMA_URL: z.string().url().optional(),
    POSTGRES_URL: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  })
  .refine(
    (val) =>
      Boolean(val.DATABASE_URL || val.POSTGRES_PRISMA_URL || val.POSTGRES_URL),
    {
      message:
        "Salah satu dari DATABASE_URL, POSTGRES_PRISMA_URL, atau POSTGRES_URL wajib diisi di environment variable.",
    },
  );

export const env = envSchema.parse(process.env);
