import { PrismaClient } from '@/app/generated/prisma/index.js';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

async function createClient(): Promise<PrismaClient> {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({} as any) as PrismaClient;
  }

  // Cloud Deployment (Neon Serverless/Vercel Postgres)
  if (url.includes('neon.tech')) {
    const { neon } = await import('@neondatabase/serverless') as any; /* eslint-disable-line @typescript-eslint/no-explicit-any */
    const { PrismaNeon } = await import('@prisma/adapter-neon') as any; /* eslint-disable-line @typescript-eslint/no-explicit-any */
    const sql = neon(url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter: new PrismaNeon(sql) } as any) as PrismaClient;
  }

  // Local Development (PostgreSQL lokal via pg adapter)
  const { Pool } = await import('pg') as any; /* eslint-disable-line @typescript-eslint/no-explicit-any */
  const { PrismaPg } = await import('@prisma/adapter-pg') as any; /* eslint-disable-line @typescript-eslint/no-explicit-any */
  const pool = new Pool({ connectionString: url });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter: new PrismaPg(pool) } as any) as PrismaClient;
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
