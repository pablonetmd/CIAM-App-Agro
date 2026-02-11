import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaInitError: string | null
}

const getSanitizedUrl = () => {
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
    const url = getSanitizedUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "URL no encontrada.";
        return null;
    }

    try {
        // ACTUALIZACIÓN V12: Usamos el driver HTTP de Neon. 
        // Es mucho más estable en Vercel que el Pool de WebSockets/Pg.
        const sql = neon(url);

        // El adaptador de Prisma acepta el cliente HTTP directamente.
        const adapter = new PrismaNeon(sql as any);

        // Sincronizamos la variable por si acaso el motor interno la busca
        process.env.DATABASE_URL = url;

        return new PrismaClient({ adapter });
    } catch (e: any) {
        console.error('[PRISMA FATAL]', e.message);
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