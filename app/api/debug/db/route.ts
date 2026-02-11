import { NextResponse } from 'next/server'
import { prisma, getInitError, getMaskedUrl } from '@/lib/prisma'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V28-BRUTE-FORCE",
        status: "TESTING",
        initError: getInitError(),
        urlInfo: getMaskedUrl(),
        pgEnv: {
            HOST: !!process.env.PGHOST,
            USER: !!process.env.PGUSER,
            DB: !!process.env.PGDATABASE
        },
        driver: "PENDING",
        prisma: "PENDING"
    }

    const url = process.env.DATABASE_URL;

    try {
        if (!url) {
            diagnostic.driver = "FAIL: No URL";
        } else {
            const sql = neon(url);
            await sql`SELECT 1`;
            diagnostic.driver = "SUCCESS";
        }
    } catch (e: any) {
        diagnostic.driver = "ERROR: " + e.message;
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
