import { NextResponse } from 'next/server'
import { Pool } from '@neondatabase/serverless'
import { prisma, getInitError, getSanitizedUrlExport } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V10-ENV-INJECTION",
        status: "TESTING",
        initError: getInitError(),
        urlInfo: {
            sanitized: !!getSanitizedUrlExport(),
            envMatches: process.env.DATABASE_URL === getSanitizedUrlExport()
        },
        directDriver: "PENDING",
        prismaStatus: "PENDING"
    }

    // Test 1: Driver Directo
    try {
        const url = getSanitizedUrlExport();
        if (url) {
            const pool = new Pool({ connectionString: url })
            const client = await pool.connect()
            await client.query('SELECT 1')
            client.release()
            diagnostic.directDriver = "OK";
        } else {
            diagnostic.directDriver = "SKIP: NO URL";
        }
    } catch (e: any) {
        diagnostic.directDriver = "ERROR: " + e.message;
    }

    // Test 2: Prisma
    try {
        if (!prisma) {
            diagnostic.prismaStatus = "NULL_OR_UNDEFINED";
        } else {
            const count = await (prisma as any).professional.count()
            diagnostic.prismaStatus = "OK (" + count + ")";
            diagnostic.status = "SUCCESS";
        }
    } catch (e: any) {
        diagnostic.prismaStatus = "RUNTIME_ERROR: " + e.message;
        diagnostic.status = "RUNTIME_FAILED";
    }

    return NextResponse.json(diagnostic)
}
