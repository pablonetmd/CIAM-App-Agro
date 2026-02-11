import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaInitError: string | null
    maskedUrl: string | null
}

const getSanitizedUrl = () => {
    let url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    if (!url || url === 'undefined' || url.trim() === '') return null;
    url = url.trim();
    if (url.includes("'")) url = url.split("'")[1] || url;
    if (url.startsWith("psql ")) url = url.replace("psql ", "");

    const cleanUrl = url.trim();
    globalForPrisma.maskedUrl = cleanUrl.substring(0, 10) + "..." + cleanUrl.substring(cleanUrl.length - 5);

    // Inyectamos GLOBALMENTE para el motor de Prisma
    process.env.DATABASE_URL = cleanUrl;
    return cleanUrl;
}

const createClient = () => {
    const url = getSanitizedUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "DATABASE_URL no encontrada en el sistema.";
        return null;
    }

    try {
        // V24: Neon Pulse (Official HTTP Adapter)
        const sql = neon(url);
        const adapter = new PrismaNeon(sql);

        // Constructor minimalista oficial de Prisma 7
        return new PrismaClient({ adapter });
    } catch (e: any) {
        globalForPrisma.prismaInitError = e.message;
        console.error('[PRISMA FATAL V24]', e.message);
        return null;
    }
}

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() || (undefined as any);
}

export const prisma = globalForPrisma.prisma;
export const getInitError = () => globalForPrisma.prismaInitError;
export const getMaskedUrl = () => globalForPrisma.maskedUrl;