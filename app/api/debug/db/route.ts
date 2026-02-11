import { NextResponse } from 'next/server'
import { Pool } from '@neondatabase/serverless'
import { prisma, getInitError } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V9-ERROR-CAPTURE",
        status: "TESTING",
        initError: getInitError(),
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
            diagnostic.prismaStatus = "NULL_OR_UNDEFINED";
        } else {
            // Intentamos una mini consulta para forzar la conexión
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
