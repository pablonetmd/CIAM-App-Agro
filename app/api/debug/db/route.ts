import { NextResponse } from 'next/server'
import { Pool } from '@neondatabase/serverless'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const url = process.env.DATABASE_URL;

    const diagnostic = {
        timestamp: new Date().toISOString(),
        env: {
            NEXT_PHASE: process.env.NEXT_PHASE || 'runtime',
            NODE_ENV: process.env.NODE_ENV,
            DATABASE_URL: url ? `Present (Length: ${url.length}, Start: ${url.substring(0, 15)}...)` : 'MISSING',
            // Buscar posibles duplicados o variantes
            ALL_DATABASE_KEYS: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('URL') || key.includes('POSTGRES'))
        },
        directPoolTest: {} as any,
        prismaTest: {} as any
    }

    // Probar conexión directa con Pool (sin Prisma)
    if (url) {
        try {
            const pool = new Pool({ connectionString: url })
            const client = await pool.connect()
            const result = await client.query('SELECT NOW()')
            client.release()
            diagnostic.directPoolTest = {
                status: 'ok',
                time: result.rows[0].now
            }
        } catch (e: any) {
            diagnostic.directPoolTest = {
                status: 'error',
                message: e.message,
                stack: e.stack?.split('\n')[0]
            }
        }
    }

    // Probar Prisma
    try {
        const count = await prisma.professional.count()
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
