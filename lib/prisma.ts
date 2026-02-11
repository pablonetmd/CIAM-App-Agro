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
    // Guardamos una versión enmascarada para diagnóstico
    globalForPrisma.maskedUrl = cleanUrl.substring(0, 10) + "..." + cleanUrl.substring(cleanUrl.length - 5);

    return cleanUrl;
}

const createClient = () => {
    const url = getSanitizedUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "URL no encontrada en el sistema.";
        return null;
    }

    try {
        // Forzamos la variable de entorno para que el motor interno de Prisma la vea
        process.env.DATABASE_URL = url;

        // V22: La configuración más limpia posible para Prisma 7 + Neon HTTP
        const sql = neon(url);
        const adapter = new PrismaNeon(sql as any);

        // NO pasamos datasourceUrl ni datasources, ya que el constructor de Prisma 7
        // con adaptador parece rechazarlos o ignorarlos. 
        // El motor leerá DATABASE_URL del entorno.
        const client = new PrismaClient({ adapter });

        globalForPrisma.prismaInitError = null;
        return client;
    } catch (e: any) {
        globalForPrisma.prismaInitError = e.message;
        console.error('[PRISMA FATAL V22]', e.message);
        return null;
    }
}

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() || (undefined as any);
}

export const prisma = globalForPrisma.prisma;
export const getInitError = () => globalForPrisma.prismaInitError;
export const getMaskedUrl = () => globalForPrisma.maskedUrl;