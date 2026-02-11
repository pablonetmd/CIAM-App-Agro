import { NextResponse } from 'next/server'
import { Pool } from '@neondatabase/serverless'
import { prisma, getInitError, getSanitizedUrlExport } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V11-MANUAL-PARAMS",
        status: "TESTING",
        initError: getInitError(),
        environment: {
            URL_MATCH: process.env.DATABASE_URL === getSanitizedUrlExport()
        },
        directDriver: "PENDING",
        prismaStatus: "PENDING"
    }

    // Test Driver
    try {
        const url = getSanitizedUrlExport();
        if (url) {
            const dbUrl = new URL(url);
            const pool = new Pool({
                host: dbUrl.hostname,
                user: dbUrl.username,
                password: decodeURIComponent(dbUrl.password),
                database: dbUrl.pathname.slice(1),
                ssl: true
            });
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            diagnostic.directDriver = "OK";
        }
    } catch (e: any) {
        diagnostic.directDriver = "ERROR: " + e.message;
    }

    // Test Prisma
    try {
        if (!prisma) {
            diagnostic.prismaStatus = "OFFLINE";
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
