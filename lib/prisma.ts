import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaInitError: string | null
}

const getDatabaseUrl = () => {
    let url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    if (!url || url === 'undefined' || url.trim() === '') return null;
    if (url.includes("'")) url = url.split("'")[1] || url;
    if (url.startsWith("psql ")) url = url.replace("psql ", "");
    return url.trim();
}

const createClient = () => {
    const url = getDatabaseUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "No URL found in environment";
        return null;
    }

    try {
        const pool = new Pool({ connectionString: url })
        const adapter = new PrismaNeon(pool as any)

        // Intentamos instanciar. Si falla, capturamos el por qué.
        const client = new PrismaClient({
            adapter,
            // @ts-ignore
            datasourceUrl: url
        });

        globalForPrisma.prismaInitError = null;
        return client;
    } catch (e: any) {
        console.error('[PRISMA FATAL]', e.message);
        globalForPrisma.prismaInitError = e.message;
        return null;
    }
}

// Inicialización
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() || (undefined as any);
}

export const prisma = globalForPrisma.prisma;
export const getInitError = () => globalForPrisma.prismaInitError;