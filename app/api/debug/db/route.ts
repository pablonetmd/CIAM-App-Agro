import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V5",
        status: "CHECKING",
        environment: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            POSTGRES_URL: !!process.env.POSTGRES_URL,
            PHASE: process.env.NEXT_PHASE || 'runtime'
        },
        database: {} as any
    }

    try {
        if (!(prisma as any).professional) {
            diagnostic.status = "PRISMA_NOT_INITIALIZED";
        } else {
            const count = await (prisma as any).professional.count()
            diagnostic.status = "READY";
            diagnostic.database = { count };
        }
    } catch (e: any) {
        diagnostic.status = "ERROR";
        diagnostic.database = { error: e.message };
    }

    return NextResponse.json(diagnostic)
}
