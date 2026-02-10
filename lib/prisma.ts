import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Si no hay URL, devolvemos un objeto vacío o null para no romper el build
    if (!process.env.DATABASE_URL) {
        return null as unknown as PrismaClient
    }
    return new PrismaClient()
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma