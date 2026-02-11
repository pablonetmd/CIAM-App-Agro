import { NextResponse } from 'next/server'
import { prisma, getInitError } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V13-TRIPLE-SHIELD",
        status: "TESTING",
        initError: getInitError(),
        environment: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            NODE_ENV: process.env.NODE_ENV
        },
        prismaStatus: "PENDING"
    }

    try {
        if (!prisma) {
            diagnostic.prismaStatus = "OFFLINE_NULL";
        } else {
            // Consulta de humo
            const count = await (prisma as any).professional.count()
            diagnostic.prismaStatus = "ONLINE (" + count + ")";
            diagnostic.status = "SUCCESS";
        }
    } catch (e: any) {
        diagnostic.prismaStatus = "FAIL: " + e.message;
    }

    return NextResponse.json(diagnostic)
}
