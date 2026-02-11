import { NextResponse } from 'next/server'
import { prisma, getInitError, getMaskedUrl } from '@/lib/prisma'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V23-DUAL-TEST",
        status: "TESTING",
        initError: getInitError(),
        urlInfo: getMaskedUrl(),
        driverStatus: "PENDING",
        prisma: "PENDING"
    }

    const url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    // --- TEST 1: Driver Directo (Neon HTTP) ---
    try {
        if (!url) {
            diagnostic.driverStatus = "FAIL: No URL";
        } else {
            const sql = neon(url);
            await sql('SELECT 1');
            diagnostic.driverStatus = "SUCCESS (Neon HTTP Connected)";
        }
    } catch (e: any) {
        diagnostic.driverStatus = "ERROR: " + e.message;
    }

    // --- TEST 2: Prisma (Con adaptador PG) ---
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
