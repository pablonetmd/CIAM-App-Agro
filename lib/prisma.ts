import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

// Configuración de WebSocket para entornos Serverless
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaInitError: string | null
}

const getSanitizedUrl = () => {
    let url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    if (!url || url === 'undefined' || url.trim() === '') return null;

    // Limpieza agresiva de URL
    if (url.includes("'")) url = url.split("'")[1] || url;
    if (url.startsWith("psql ")) url = url.replace("psql ", "");

    return url.trim();
}

const createClient = () => {
    const url = getSanitizedUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "URL no encontrada en ninguna variable de entorno.";
        return null;
    }

    try {
        // V15: Redundancia de entorno. 
        // Forzamos la URL en todas las variables que Prisma suele mirar.
        process.env.DATABASE_URL = url;
        process.env.POSTGRES_URL = url;
        process.env.DATABASE_PRISMA_URL = url;
        process.env.POSTGRES_PRISMA_URL = url;

        // Versión Pool (WebSockets). A veces es más compatible con Prisma 7 que HTTP Directo.
        const pool = new Pool({ connectionString: url });
        const adapter = new PrismaNeon(pool as any);

        // Constructor estándar de Prisma 7 con adaptador.
        const client = new PrismaClient({ adapter });

        globalForPrisma.prismaInitError = null;
        return client;
    } catch (e: any) {
        globalForPrisma.prismaInitError = e.message;
        console.error('[PRISMA FATAL V15]', e.message);
        return null;
    }
}

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() || (undefined as any);
}

export const prisma = globalForPrisma.prisma;
export const getInitError = () => globalForPrisma.prismaInitError;