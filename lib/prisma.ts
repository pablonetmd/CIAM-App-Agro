import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const createClient = () => {
    // Intentamos obtener la URL de varias fuentes comunes en Vercel
    const url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    // Log de diagnóstico (visible en logs de Vercel)
    console.log(`[PRISMA INIT] Intentando conectar. URL presente: ${!!url}`);

    if (!url || url === 'undefined' || url.trim() === '') {
        console.error('[PRISMA ERROR] DATABASE_URL no está definida.');
        return null;
    }

    try {
        // Neon Serverless requiere que la URL tenga parámetros de SSL si no es local,
        // pero el Pool de pg a veces necesita ayuda extra
        const pool = new Pool({
            connectionString: url,
            ssl: true // Forzamos SSL para Neon
        })

        const adapter = new PrismaNeon(pool as any)
        const client = new PrismaClient({ adapter })

        console.log('[PRISMA SUCCESS] Cliente creado exitosamente.');
        return client;
    } catch (e: any) {
        console.error('[PRISMA FATAL] Error al instanciar el cliente:', e.message);
        return null;
    }
}

// Singleton: O devolvemos el existente, o creamos uno nuevo, o devolvemos null explícito
export const prisma = globalForPrisma.prisma || createClient() || (null as unknown as PrismaClient);

if (process.env.NODE_ENV !== 'production' && prisma) {
    globalForPrisma.prisma = prisma;
}