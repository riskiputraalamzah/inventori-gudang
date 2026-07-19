import { PrismaClient } from '@/app/generated/prisma/index.js';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

async function createClient(): Promise<PrismaClient> {
  if (process.env.NODE_ENV !== 'production') {
    try {
      await import('dotenv/config');
    } catch {}
  }

  let url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (!url) {
    throw new Error('DATABASE_URL, POSTGRES_PRISMA_URL, atau POSTGRES_URL belum dikonfigurasi di environment variable.');
  }

  url = url.trim();

  const isLocal = url.includes('localhost') || url.includes('127.0.0.1');

  if (!isLocal) {
    // Cloud Deployment (Neon Serverless / Vercel Postgres)
    const { Pool } = await import('@neondatabase/serverless') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { PrismaNeon } = await import('@prisma/adapter-neon');
    const pool = new Pool({ connectionString: url });
    return new PrismaClient({ adapter: new PrismaNeon(pool) } as never) as PrismaClient;
  }

  // Local Development (PostgreSQL lokal via pg pool adapter)
  const { Pool } = await import('pg');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const pool = new Pool({ connectionString: url });
  return new PrismaClient({ adapter: new PrismaPg(pool) } as never) as PrismaClient;
}

// Defer initialization to runtime so client bundler doesn\t load database modules
let clientPromise: Promise<PrismaClient> | null = null;
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    if (!globalForPrisma.prisma) {
      if (!clientPromise) {
        clientPromise = createClient().then((c) => {
          globalForPrisma.prisma = c;
          return c;
        });
      }

      // Return a function wrapper or client delegate
      const delegate: Record<string, unknown> = {};
      return new Proxy(delegate as never, {
        get(_, modelProp) {
          // Handlers for model method calls (e.g. prisma.itemCategory.findMany(...))
          return (...args: unknown[]) => {
            return clientPromise!.then((c) => {
              const model = (c as unknown as Record<string, Record<string, (...a: unknown[]) => unknown>>)[prop as string];
              if (!model) return undefined;
              const fn = model[modelProp as string];
              return typeof fn === 'function' ? fn.bind(model)(...args) : fn;
            });
          };
        },
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const member = (globalForPrisma.prisma as any)[prop];
    return typeof member === 'function' ? member.bind(globalForPrisma.prisma) : member;
  },
});
