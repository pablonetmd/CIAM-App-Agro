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

    // Inyectamos GLOBALMENTE para el motor de Prisma.
    // Aunque usemos Wasm, a veces el motor sigue buscando esta variable.
    process.env.DATABASE_URL = cleanUrl;
    return cleanUrl;
}

const createClient = () => {
    const url = getSanitizedUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "URL no encontrada en el sistema.";
        return null;
    }

    try {
        // V26: Wasm Engine + Neon HTTP.
        // Hemos forzado engineType = "wasm" en schema.prisma.
        // El motor Wasm NO busca un host local, confía plenamente en el adaptador.
        const sql = neon(url);
        const adapter = new PrismaNeon(sql);

        return new PrismaClient({ adapter });
    } catch (e: any) {
        globalForPrisma.prismaInitError = e.message;
        console.error('[PRISMA FATAL V26]', e.message);
        return null;
    }
}

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() || (undefined as any);
}

export const prisma = globalForPrisma.prisma;
export const getInitError = () => globalForPrisma.prismaInitError;
export const getMaskedUrl = () => globalForPrisma.maskedUrl;