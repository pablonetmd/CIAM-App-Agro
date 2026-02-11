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
        // 1. Preparamos el entorno para el motor interno
        process.env.DATABASE_URL = url;

        // 2. Preparamos el adaptador HTTP (V12 exitosa)
        const sql = neon(url);
        const adapter = new PrismaNeon(sql as any);

        // 3. Instanciamos con Triple Escudo (Adaptador + Datasources Explícitos)
        // Esto soluciona los errores de "No host" en Vercel.
        return new PrismaClient({
            adapter,
            // @ts-ignore - Prisma 7 es estricto en tipos pero acepta este override
            datasources: {
                db: {
                    url: url
                }
            }
        });
    } catch (e: any) {
        globalForPrisma.prismaInitError = e.message;
        return null;
    }
}

// Inicialización global (Singleton)
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() || (undefined as any);
}

export const prisma = globalForPrisma.prisma;
export const getInitError = () => globalForPrisma.prismaInitError;
export const getSanitizedUrlExport = getSanitizedUrl;