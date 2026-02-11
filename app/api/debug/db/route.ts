import { NextResponse } from 'next/server'
import { prisma, getInitError } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V17-EDGE-WASM",
        status: "TESTING",
        initError: getInitError(),
        environment: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            PHASE: process.env.NEXT_PHASE || 'runtime'
        },
        prisma: "PENDING"
    }

    try {
        if (!prisma) {
            diagnostic.prisma = "CLIENT_NULL";
        } else {
            // Intentamos una consulta real
            const count = await (prisma as any).professional.count()
            diagnostic.prisma = "READY (" + count + ")";
            diagnostic.status = "SUCCESS";
        }
    } catch (e: any) {
        diagnostic.prisma = "ERROR: " + e.message;
        diagnostic.status = "FAILED";
    }

    return NextResponse.json(diagnostic)
}
