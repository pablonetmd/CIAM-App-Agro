import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const getDatabaseUrl = () => {
    let url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    if (!url || url === 'undefined' || url.trim() === '') return null;

    // Limpieza de seguridad
    if (url.includes("'")) url = url.split("'")[1] || url;
    if (url.startsWith("psql ")) url = url.replace("psql ", "");

    return url.trim();
}

const createClient = () => {
    const url = getDatabaseUrl();

    if (!url) return null;

    try {
        // 1. Configuramos el Pool para el Adaptador Neon
        const pool = new Pool({ connectionString: url })
        const adapter = new PrismaNeon(pool as any)

        // 2. Creamos el cliente pasando el adaptador Y la URL explícitamente.
        // En Vercel, a veces el motor interno de Prisma no "ve" las env vars de Node,
        // pasarla aquí fuerza la configuración.
        return new PrismaClient({
            adapter,
            // @ts-ignore - Prisma 7 maneja esto internamente pero a veces el tipo se queja
            datasourceUrl: url
        })
    } catch (e: any) {
        console.error('[PRISMA FATAL]', e.message);
        return null;
    }
}

export const prisma = globalForPrisma.prisma || createClient() || (null as unknown as PrismaClient);

if (process.env.NODE_ENV !== 'production' && prisma) {
    globalForPrisma.prisma = prisma;
}