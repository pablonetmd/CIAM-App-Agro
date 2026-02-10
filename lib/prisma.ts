import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Prevent instantiation if DATABASE_URL is missing (e.g., during build phase)
    if (!process.env.DATABASE_URL) {
        return null as unknown as PrismaClient
    }

    try {
        return new PrismaClient()
    } catch (error) {
        console.error('Failed to initialize PrismaClient:', error)
        return null as unknown as PrismaClient
    }
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production' && prisma) {
    globalForPrisma.prisma = prisma
}