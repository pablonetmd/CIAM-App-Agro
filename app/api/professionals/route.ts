import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    // 1. SI ESTAMOS EN EL BUILD, SALTAMOS LA CONEXIÓN
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return NextResponse.json({ message: "Bypass build" });
    }

    try {
        const searchParams = request.nextUrl.searchParams
        const matricula = searchParams.get('matricula')

        if (!matricula) {
            return NextResponse.json({ error: 'Matrícula requerida' }, { status: 400 })
        }

        // Solo llega aquí cuando la web ya está online
        const professional = await prisma.professional.findUnique({
            where: { matricula },
        })

        try {
            const searchParams = request.nextUrl.searchParams
            const matricula = searchParams.get('matricula')



            const professional = await prisma.professional.findUnique({
                where: { matricula },
            })

            if (!professional) {
                return NextResponse.json(
                    { error: 'Profesional no encontrado' },
                    { status: 404 }
                )
            }

            return NextResponse.json(professional)
        } catch (error: any) {
            console.error('Error fetching professional:', error)
            return NextResponse.json(
                { error: 'Error al buscar profesional', details: error.message },
                { status: 500 }
            )
        }
    }
