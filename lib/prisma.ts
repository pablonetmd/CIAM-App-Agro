// CRÍTICO: Importar el cliente Edge para forzar el uso de Wasm y Adaptadores
import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client/edge'

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
        // En Vercel, forzamos la variable de entorno para el motor Wasm
        process.env.DATABASE_URL = url;

        // Usamos el adaptador HTTP (V12 OK)
        const sql = neon(url);
        const adapter = new PrismaNeon(sql as any);

        // Al usar /edge, Prisma ESTÁ OBLIGADO a usar el adaptador o Accelerate.
        // Esto evita el fallback al motor nativo que daba el error de "No host".
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