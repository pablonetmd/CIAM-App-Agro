import { NextResponse } from 'next/server'
import { Pool } from '@neondatabase/serverless'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || 'MISSING';

    const diagnostic = {
        version: "v-nuclear-diag-20260211", // Marcador para saber si Vercel se actualizó
        timestamp: new Date().toISOString(),
        env: {
            DATABASE_URL_PRESENT: !!process.env.DATABASE_URL,
            DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
            POSTGRES_URL_PRESENT: !!process.env.POSTGRES_URL,
            NODE_ENV: process.env.NODE_ENV,
        },
        connectionTest: {} as any
    }

    try {
        if (url === 'MISSING') {
            throw new Error("No database URL found in any environment variable");
        }

        const pool = new Pool({ connectionString: url })
        const client = await pool.connect()
        const result = await client.query('SELECT NOW() as now')
        client.release()

        diagnostic.connectionTest = {
            status: 'ok',
            time: result.rows[0].now
        }
    } catch (e: any) {
        diagnostic.connectionTest = {
            status: 'error',
            message: e.message,
            code: e.code
        }
    }

    try {
        const count = await (prisma as any).professional.count()
        diagnostic.prismaTest = {
            status: 'ok',
            count
        }
    } catch (e: any) {
        diagnostic.prismaTest = {
            status: 'error',
            message: e.message
        }
    }

    return NextResponse.json(diagnostic)
}
