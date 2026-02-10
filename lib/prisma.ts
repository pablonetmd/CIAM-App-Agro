import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

// Configuración para permitir WebSockets en ambientes serverless
neonConfig.webSocketConstructor = ws

const prismaClientSingleton = () => {
    // Obtenemos la URL de forma segura
    const url = process.env.DATABASE_URL;

    // Log de diagnóstico crítico para Vercel (no muestra la URL completa por seguridad)
    const urlInfo = url ? `Exist (Length: ${url.length}, Protocol: ${url.split(':')[0]})` : 'MISSING';
    console.log(`[PRISMA INIT] DATABASE_URL: ${urlInfo}`);

    // Durante el build de Vercel, si no hay URL, evitamos instanciar
    if (process.env.NEXT_PHASE === 'phase-production-build' && !url) {
        return null as unknown as PrismaClient
    }

    // Si no hay URL en runtime, devolvemos null para que el API devuelva 503 y no un crash
    if (!url || url.trim() === '') {
        console.error('[PRISMA ERROR] DATABASE_URL is empty or missing at runtime');
        return null as unknown as PrismaClient
    }

    try {
        const pool = new Pool({ connectionString: url })

        // Listener de errores para el pool
        pool.on('error', (err: any) => {
            console.error('[PRISMA POOL ERROR]', err.message);
        });

        const adapter = new PrismaNeon(pool as any)
        const client = new PrismaClient({ adapter })

        return client
    } catch (error: any) {
        console.error('[PRISMA ERROR] Constructor failed:', error.message);
        return null as unknown as PrismaClient
    }
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Inyectamos el singleton
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production' && prisma) {
    globalForPrisma.prisma = prisma
}