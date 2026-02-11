import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

// Configuración obligatoria para WebSockets en Node.js
if (typeof window === 'undefined') {
    neonConfig.webSocketConstructor = ws
}

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

    return cleanUrl;
}

const createClient = () => {
    const url = getSanitizedUrl();
    if (!url) {
        globalForPrisma.prismaInitError = "DATABASE_URL no encontrada.";
        return null;
    }

    try {
        // V23: El "Puente Estándar". 
        // Usamos Pool de Neon pero con el adaptador de PG estándar.
        // Esto suele ser mucho más estable que el adaptador HTTP específico.
        const pool = new Pool({ connectionString: url });
        const adapter = new PrismaPg(pool);

        // Sincronizamos el entorno por si el motor interno lo requiere para el chequeo de Host.
        process.env.DATABASE_URL = url;

        return new PrismaClient({ adapter });
    } catch (e: any) {
        globalForPrisma.prismaInitError = e.message;
        console.error('[PRISMA FATAL V23]', e.message);
        return null;
    }
}

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() || (undefined as any);
}

export const prisma = globalForPrisma.prisma;
export const getInitError = () => globalForPrisma.prismaInitError;
export const getMaskedUrl = () => globalForPrisma.maskedUrl;