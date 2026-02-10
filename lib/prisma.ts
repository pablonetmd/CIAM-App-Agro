import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Durante el build de Vercel, si no hay URL, evitamos instanciar
    if (process.env.NEXT_PHASE === 'phase-production-build' && !process.env.DATABASE_URL) {
        return null as unknown as PrismaClient
    }

    const connectionString = process.env.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production' && prisma) {
    globalForPrisma.prisma = prisma
}