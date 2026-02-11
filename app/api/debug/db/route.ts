import { NextResponse } from 'next/server'
import { prisma, getInitError } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V16-LIBRARY-ENGINE",
        status: "TESTING",
        initError: getInitError(),
        prisma: "PENDING"
    }

    try {
        if (!prisma) {
            diagnostic.prisma = "CLIENT_NULL";
        } else {
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
