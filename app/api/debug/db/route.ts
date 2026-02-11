import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { prisma, getInitError, getSanitizedUrlExport } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V12-HTTP-ADAPTER",
        status: "TESTING",
        initError: getInitError(),
        environment: {
            DATABASE_URL: !!process.env.DATABASE_URL
        },
        httpDriver: "PENDING",
        prismaStatus: "PENDING"
    }

    // Test 1: Driver HTTP Directo
    try {
        const url = getSanitizedUrlExport();
        if (url) {
            const sql = neon(url);
            const result = await sql`SELECT 1 as connection_test`;
            diagnostic.httpDriver = "OK (" + result[0].connection_test + ")";
        } else {
            diagnostic.httpDriver = "SKIP: NO URL";
        }
    } catch (e: any) {
        diagnostic.httpDriver = "ERROR: " + e.message;
    }

    // Test 2: Prisma
    try {
        if (!prisma) {
            diagnostic.prismaStatus = "OFFLINE/NULL";
        } else {
            const count = await (prisma as any).professional.count()
            diagnostic.prismaStatus = "ONLINE (" + count + ")";
            diagnostic.status = "SUCCESS";
        }
    } catch (e: any) {
        diagnostic.prismaStatus = "FAIL: " + e.message;
    }

    return NextResponse.json(diagnostic)
}
