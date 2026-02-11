import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaInitError: string | null
}

// --- 1. BRUTE FORCE ENVIRONMENT DECOMPOSITION ---
(function alignEnvironment() {
    let url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    if (!url || url === 'undefined' || url.trim() === '') return;

    url = url.trim();
    if (url.includes("'")) url = url.split("'")[1] || url;
    if (url.startsWith("psql ")) url = url.replace("psql ", "");

    const cleanUrl = url.trim();
    process.env.DATABASE_URL = cleanUrl;

    try {
        // Descomponemos para satisfacer al motor nativo si falla el parseo de la URL
        const parsed = new URL(cleanUrl);
        process.env.PGHOST = parsed.hostname;
        process.env.PGPORT = parsed.port || '5432';
        process.env.PGUSER = parsed.username;
        process.env.PGPASSWORD = parsed.password;
        process.env.PGDATABASE = parsed.pathname.slice(1);
        process.env.PGSSLMODE = 'require';
    } catch (e) {
        // Silencioso
    }
})();

const createClient = () => {
    const url = process.env.DATABASE_URL;
    if (!url) {
        globalForPrisma.prismaInitError = "URL no encontrada.";
        return null;
    }

    try {
        // V28: Brute Force Alignment.
        // Usamos el adaptador oficial HTTP de Neon.
        // El motor de Prisma 7 estará satisfecho con las variables de entorno PG*
        // que inyectamos arriba, eliminando el fallo de "No database host".
        const sql = neon(url);
        const adapter = new PrismaNeon(sql);

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
export const getMaskedUrl = () => {
    const url = process.env.DATABASE_URL;
    if (!url) return "NULL";
    return url.substring(0, 10) + "..." + url.substring(url.length - 5);
}