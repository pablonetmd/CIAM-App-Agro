// --- 1. ENVIRONMENT INJECTION ---
(function () {
    let url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    if (url && url !== 'undefined' && url.trim() !== '') {
        url = url.trim();
        if (url.includes("'")) url = url.split("'")[1] || url;
        if (url.startsWith("psql ")) url = url.replace("psql ", "");
        process.env.DATABASE_URL = url.trim();
    }
})();

// --- 2. IMPORTS ---
import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaInitError: string | null
}

const createClient = () => {
    const url = process.env.DATABASE_URL;
    if (!url) {
        globalForPrisma.prismaInitError = "URL no detectada.";
        return null;
    }

    try {
        const sql = neon(url);
        const adapter = new PrismaNeon(sql as any);

        // V19: Usamos el cliente estándar. 
        // Junto con 'serverExternalPackages' en next.config.ts, 
        // esto debería resolver los problemas de empaquetado y host.
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