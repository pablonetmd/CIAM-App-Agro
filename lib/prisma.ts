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

    // Limpieza de artefactos de copy-paste (MUY IMPORTANTE para Vercel)
    if (url.includes("'")) url = url.split("'")[1] || url;
    if (url.startsWith("psql ")) url = url.replace("psql ", "");

    return url.trim();
}

const createClient = () => {
    const url = getSanitizedUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "URL no encontrada en el sistema.";
        return null;
    }

    try {
        // 1. Sincronizamos el entorno para evitar que el motor de Prisma se queje de falta de Host
        process.env.DATABASE_URL = url;

        // 2. Usamos el adaptador HTTP de Neon (el más estable en Vercel)
        const sql = neon(url);
        const adapter = new PrismaNeon(sql as any);

        // 3. Constructor minimalista (Prisma 7 estándar)
        // No pasamos datasources ni datasourceUrl, solo el adaptador.
        return new PrismaClient({ adapter });
    } catch (e: any) {
        globalForPrisma.prismaInitError = e.message;
        console.error('[PRISMA FATAL]', e.message);
        return null;
    }
}

// Inicialización controlada
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() || (undefined as any);
}

export const prisma = globalForPrisma.prisma;
export const getInitError = () => globalForPrisma.prismaInitError;