import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

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
    if (url.includes("'")) url = url.split("'")[1] || url;
    if (url.startsWith("psql ")) url = url.replace("psql ", "");
    return url.trim();
}

const createClient = () => {
    const url = getSanitizedUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "URL no encontrada.";
        return null;
    }

    try {
        // Para que el motor interno de Prisma no se queje
        process.env.DATABASE_URL = url;

        // PARSEO MANUAL: Si el connectionString falla, pasamos los parámetros por separado.
        // Esto es mucho más robusto.
        const dbUrl = new URL(url);
        const poolConfig = {
            host: dbUrl.hostname,
            user: dbUrl.username,
            password: decodeURIComponent(dbUrl.password),
            database: dbUrl.pathname.slice(1),
            port: parseInt(dbUrl.port) || 5432,
            ssl: true,
            max: 1 // Muy importante en Serverless para no agotar conexiones
        };

        const pool = new Pool(poolConfig);
        const adapter = new PrismaNeon(pool as any);

        // En Prisma 7, pasamos el adaptador.
        return new PrismaClient({ adapter });
    } catch (e: any) {
        globalForPrisma.prismaInitError = e.message;
        return null;
    }
}

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() || (undefined as any);
}

export const prisma = globalForPrisma.prisma;
export const getInitError = () => globalForPrisma.prismaInitError;
export const getSanitizedUrlExport = getSanitizedUrl;