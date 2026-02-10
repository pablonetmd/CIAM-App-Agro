import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

// Configuración para permitir WebSockets en ambientes serverless
neonConfig.webSocketConstructor = ws

const prismaClientSingleton = () => {
    const url = process.env.DATABASE_URL;

    // Logs de diagnóstico básicos y seguros
    console.log('[PRISMA] Initializing... URL vorhanden:', !!url);

    // Durante el build de Vercel, si no hay URL, evitamos instanciar
    if (process.env.NEXT_PHASE === 'phase-production-build' && !url) {
        return null as unknown as PrismaClient
    }

    if (!url) {
        return null as unknown as PrismaClient
    }

    try {
        const pool = new Pool({ connectionString: url })
        const adapter = new PrismaNeon(pool as any)
        return new PrismaClient({ adapter })
    } catch (error: any) {
        console.error('[PRISMA ERROR] Initialization failed:', error.message);
        return null as unknown as PrismaClient
    }
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production' && prisma) {
    globalForPrisma.prisma = prisma
}