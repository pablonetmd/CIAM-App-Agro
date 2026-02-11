import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const createClient = () => {
    const url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    console.log(`[PRISMA INIT] DATABASE_URL found: ${!!url}, Length: ${url?.length || 0}`);

    if (!url || url === 'undefined' || url.trim() === '') {
        console.error('[PRISMA ERROR] DATABASE_URL is missing or empty at runtime');
        return null;
    }

    try {
        const pool = new Pool({ connectionString: url })
        const adapter = new PrismaNeon(pool as any)
        return new PrismaClient({ adapter })
    } catch (e: any) {
        console.error('[PRISMA] Failed to create client:', e.message);
        return null;
    }
}

// Singleton directo
export const prisma = globalForPrisma.prisma || createClient() || ({} as PrismaClient);

// Propiedad de estado interna
(prisma as any).$isReady = !!(prisma as any).professional;

if (process.env.NODE_ENV !== 'production' && (prisma as any).$isReady) {
    globalForPrisma.prisma = prisma;
}