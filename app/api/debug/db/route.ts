import { NextResponse } from 'next/server'
import { Pool } from '@neondatabase/serverless'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V8-DOUBLE-LINK",
        status: "TESTING",
        environment: {
            DATABASE_URL_READY: !!process.env.DATABASE_URL,
            PHASE: process.env.NEXT_PHASE || 'runtime'
        },
        directDriver: "PENDING",
        prismaStatus: "PENDING"
    }

    // Test 1: Driver Directo
    try {
        const url = process.env.DATABASE_URL;
        const pool = new Pool({ connectionString: url })
        const client = await pool.connect()
        await client.query('SELECT 1')
        client.release()
        diagnostic.directDriver = "OK";
    } catch (e: any) {
        diagnostic.directDriver = "ERROR: " + e.message;
    }

    // Test 2: Prisma
    try {
        if (!prisma) {
            diagnostic.prismaStatus = "NOT_INSTANTIATED";
        } else {
            const count = await (prisma as any).professional.count()
            diagnostic.prismaStatus = "OK (" + count + ")";
            diagnostic.status = "SUCCESS";
        }
    } catch (e: any) {
        diagnostic.prismaStatus = "ERROR: " + e.message;
    }

    return NextResponse.json(diagnostic)
}
