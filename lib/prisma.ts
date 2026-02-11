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

    // Limpieza de artefactos de copy-paste
    if (url.includes("'")) url = url.split("'")[1] || url;
    if (url.startsWith("psql ")) url = url.replace("psql ", "");

    return url.trim();
}

const createClient = () => {
    const url = getSanitizedUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "URL no encontrada en el entorno.";
        return null;
    }

    try {
        // CRÍTICO: Sobrescribimos la variable de entorno para que el motor
        // interno de Prisma (Rust/Wasm) también vea la URL limpia.
        process.env.DATABASE_URL = url;

        const pool = new Pool({ connectionString: url })
        const adapter = new PrismaNeon(pool as any)

        // En Prisma 7, si usamos adaptador, la URL del motor se sincroniza
        // con la que pusimos en process.env.DATABASE_URL.
        const client = new PrismaClient({ adapter });

        globalForPrisma.prismaInitError = null;
        return client;
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