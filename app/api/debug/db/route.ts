import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        if (!prisma) {
            return NextResponse.json({
                status: 'error',
                message: 'Prisma client is null',
                env: {
                    hasUrl: !!process.env.DATABASE_URL,
                    phase: process.env.NEXT_PHASE || 'unknown'
                }
            }, { status: 503 })
        }

        const count = await prisma.professional.count()
        return NextResponse.json({
            status: 'ok',
            professionalCount: count,
            message: 'Database connection successful'
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 3)
        }, { status: 500 })
    }
}
