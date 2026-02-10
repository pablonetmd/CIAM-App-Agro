import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Only attempt to initialize if we have a DATABASE_URL
    // During build phase on Vercel, DATABASE_URL might be missing
    if (!process.env.DATABASE_URL && process.env.NEXT_PHASE === 'phase-production-build') {
        return null as unknown as PrismaClient
    }

    // If we're at runtime and DATABASE_URL is missing, we want to know
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
        console.warn('Warning: DATABASE_URL is missing in production environment');
    }

    try {
        return new PrismaClient()
    } catch (error) {
        if (process.env.NEXT_PHASE !== 'phase-production-build') {
            console.error('Failed to initialize PrismaClient:', error)
        }
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