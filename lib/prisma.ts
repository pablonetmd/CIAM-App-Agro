import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.DATABASE_PRISMA_URL;

    if (!url || url === 'undefined' || url.trim() === '') return null;
    return url;
}

const createPrismaClient = () => {
    const url = getDatabaseUrl();

    if (!url) {
        console.error('[PRISMA] No database connection string found.');
        return null;
    }

    try {
        console.log(`[PRISMA] Creating client with URL length: ${url.length}`);
        const pool = new Pool({ connectionString: url })
        const adapter = new PrismaNeon(pool as any)
        return new PrismaClient({ adapter })
    } catch (error: any) {
        console.error('[PRISMA] Error creating client:', error.message);
        return null;
    }
}

// Singleton robusto y sencillo
export const prisma = globalForPrisma.prisma ?? createPrismaClient() ?? ({} as PrismaClient);

// Marcador de estado
(prisma as any).$isReady = !!(prisma as any).professional;

if (process.env.NODE_ENV !== 'production' && (prisma as any).$isReady) {
    globalForPrisma.prisma = prisma
}