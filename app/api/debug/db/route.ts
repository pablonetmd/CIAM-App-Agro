import { NextResponse } from 'next/server'
import { Pool } from '@neondatabase/serverless'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const sanitize = (url: string | undefined): string | null => {
    if (!url) return null;
    let clean = url;
    if (clean.includes("'")) clean = clean.split("'")[1] || clean;
    if (clean.startsWith("psql ")) clean = clean.replace("psql ", "");
    return clean.trim();
}

export async function GET() {
    const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    const cleanUrl = sanitize(rawUrl);

    const diagnostic = {
        label: "CIAM-DIAGNOSTIC-V7-CLEANER",
        status: "TESTING_SANITIZER",
        urlAnalysis: {
            rawProtocol: rawUrl?.split(':')[0] || 'none',
            isCleaned: rawUrl !== cleanUrl,
            cleanProtocol: cleanUrl?.split(':')[0] || 'none',
            cleanLength: cleanUrl?.length || 0
        },
        directDriverTest: {} as any,
        prismaTest: {} as any
    }

    if (cleanUrl) {
        try {
            const pool = new Pool({ connectionString: cleanUrl, ssl: true })
            const client = await pool.connect()
            const res = await client.query('SELECT 1 as result')
            client.release()
            diagnostic.directDriverTest = { status: "OK", result: res.rows[0].result }
            diagnostic.status = "DRIVER_CONNECTED";
        } catch (e: any) {
            diagnostic.directDriverTest = { status: "ERROR", message: e.message };
        }
    }

    try {
        if (!(prisma as any).professional) {
            diagnostic.prismaTest = { status: "NOT_INITIALIZED" };
        } else {
            const count = await (prisma as any).professional.count()
            diagnostic.prismaTest = { status: "OK", count };
            if (diagnostic.status === "DRIVER_CONNECTED") diagnostic.status = "FULLY_READY";
        }
    } catch (e: any) {
        diagnostic.prismaTest = { status: "ERROR", message: e.message };
    }

    return NextResponse.json(diagnostic)
}
