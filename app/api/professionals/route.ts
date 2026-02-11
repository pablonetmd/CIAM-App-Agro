import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    // Bypass solo durante la fase de build de Vercel (pre-renderizado)
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return NextResponse.json({ bypass: true });
    }

    try {
        const searchParams = request.nextUrl.searchParams
        const matricula = searchParams.get('matricula')

        if (!matricula) {
            return NextResponse.json({ error: 'Matrícula requerida' }, { status: 400 })
        }


        const professional = await prisma.professional.findUnique({
            where: { matricula },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Profesional no encontrado' },
                { status: 404 }
            )
        }

        // Admitir tanto HABILITADO (code) como ACTIVO (db manual)
        const isHabilitado = professional.estado === 'HABILITADO' || professional.estado === 'ACTIVO';

        return NextResponse.json({
            ...professional,
            isHabilitado // Flag auxiliar para el frontend
        })
    } catch (error: any) {
        console.error('Error fetching professional:', error)
        return NextResponse.json(
            { error: 'Error al buscar profesional', details: error.message },
            { status: 500 }
        )
    }
}