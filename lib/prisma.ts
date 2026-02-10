import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | null
}

const createPrismaClient = (): PrismaClient | null => {
    const url = process.env.DATABASE_URL;
    if (!url || url.trim() === '' || url === 'undefined') return null;

    try {
        const pool = new Pool({ connectionString: url })
        const adapter = new PrismaNeon(pool as any)
        return new PrismaClient({ adapter })
    } catch (e) {
        return null;
    }
}

// Proxy transparente que actúa como PrismaClient pero se inicializa bajo demanda
export const prisma = new Proxy({} as PrismaClient & { $isReady: boolean }, {
    get: (target, prop) => {
        // Propiedad especial para chequear estado sin disparar errores
        if (prop === '$isReady') {
            if (globalForPrisma.prisma) return true;
            const test = createPrismaClient();
            if (test) {
                globalForPrisma.prisma = test;
                return true;
            }
            return false;
        }

        if (globalForPrisma.prisma) {
            const val = (globalForPrisma.prisma as any)[prop];
            return typeof val === 'function' ? val.bind(globalForPrisma.prisma) : val;
        }

        const newClient = createPrismaClient();
        if (!newClient) {
            // Mock para build
            if (process.env.NEXT_PHASE === 'phase-production-build') return (target as any)[prop];
            throw new Error('DATABASE_INITIALIZATION_FAILED');
        }

        globalForPrisma.prisma = newClient;
        const val = (newClient as any)[prop];
        return typeof val === 'function' ? val.bind(newClient) : val;
    }
})