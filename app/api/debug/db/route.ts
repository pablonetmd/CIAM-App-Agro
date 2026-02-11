import { NextResponse } from 'next/server'
import { Pool } from '@neondatabase/serverless'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V6",
        status: "INVESTIGATING",
        environment: {
            DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
            DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
            DATABASE_URL_PROTOCOL: process.env.DATABASE_URL?.split(':')[0] || 'none',
            NODE_ENV: process.env.NODE_ENV,
        },
        directDriverTest: {} as any,
        prismaTest: {} as any
    }

    // 1. Probar el driver Neon directamente
    if (url) {
        try {
            const pool = new Pool({ connectionString: url })
            const client = await pool.connect()
            const res = await client.query('SELECT 1 as result')
            client.release()
            diagnostic.directDriverTest = { status: "OK", result: res.rows[0].result }
        } catch (e: any) {
            diagnostic.directDriverTest = { status: "ERROR", message: e.message };
        }
    } else {
        diagnostic.directDriverTest = { status: "SKIP", message: "No URL found" };
    }

    // 2. Probar Prisma
    try {
        if (!(prisma as any).professional) {
            diagnostic.prismaTest = { status: "NOT_INITIALIZED" };
        } else {
            const count = await (prisma as any).professional.count()
            diagnostic.prismaTest = { status: "OK", count };
            diagnostic.status = "SUCCESS";
        }
    } catch (e: any) {
        diagnostic.prismaTest = { status: "ERROR", message: e.message };
    }

    // Si ambos fallan con el mismo error, el problema es la URL de Vercel
    return NextResponse.json(diagnostic)
}
