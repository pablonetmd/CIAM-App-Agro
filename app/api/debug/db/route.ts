import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        timestamp: new Date().toISOString(),
        env: {
            NEXT_PHASE: process.env.NEXT_PHASE || 'not_set',
            NODE_ENV: process.env.NODE_ENV,
            DB_URL_STATUS: !!process.env.DATABASE_URL ? 'PRESENT' : 'MISSING',
            DB_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
            DB_URL_PROTOCOL: process.env.DATABASE_URL?.split(':')[0] || 'none',
        },
        database: {} as any
    }

    try {
        // Intentamos una operación básica
        const count = await prisma.professional.count()
        diagnostic.database = {
            status: 'ok',
            professionalCount: count
        }
    } catch (error: any) {
        diagnostic.database = {
            status: 'error',
            error: error.message,
            stack_hint: error.stack?.split('\n')[0]
        }
    }

    return NextResponse.json(diagnostic)
}
