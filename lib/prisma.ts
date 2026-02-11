import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const getDatabaseUrl = () => {
    return process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.DATABASE_PRISMA_URL;
}

const createClient = () => {
    const url = getDatabaseUrl();

    // Log diagnóstico para Vercel
    console.log('[PRISMA DEBUG] Probando DATABASE_URL...');
    if (!url) {
        console.error('[PRISMA DEBUG] DATABASE_URL no encontrada en process.env');
        return null;
    }

    console.log(`[PRISMA DEBUG] URL encontrada. Longitud: ${url.length}. Preview: ${url.substring(0, 10)}...`);

    if (url.trim() === '' || url === 'undefined') {
        console.error('[PRISMA DEBUG] URL es un string vacío o literal "undefined"');
        return null;
    }

    try {
        const pool = new Pool({ connectionString: url })
        const adapter = new PrismaNeon(pool as any)
        const client = new PrismaClient({ adapter })
        return client;
    } catch (e: any) {
        console.error('[PRISMA DEBUG] Error al crear cliente:', e.message);
        return null;
    }
}

// Singleton más simple y directo
export const prisma = globalForPrisma.prisma || createClient() || ({} as PrismaClient);

// Agregamos una propiedad de ayuda para chequear estado
(prisma as any).$isReady = !!globalForPrisma.prisma || (!!getDatabaseUrl() && getDatabaseUrl() !== 'undefined');

if (process.env.NODE_ENV !== 'production') {
    if (!globalForPrisma.prisma && (prisma as any).$isReady) {
        globalForPrisma.prisma = prisma;
    }
}

// Si estamos en producción, queremos forzar la reinicialización si no está listo
if (process.env.NODE_ENV === 'production') {
    if (!globalForPrisma.prisma && (prisma as any).$isReady) {
        globalForPrisma.prisma = prisma;
    }
}