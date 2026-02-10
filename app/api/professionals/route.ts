import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const matricula = searchParams.get('matricula')

        if (!matricula) {
            return NextResponse.json(
                { error: 'Matrícula requerida' },
                { status: 400 }
            )
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

        return NextResponse.json(professional)
    } catch (error: any) {
        console.error('Error fetching professional:', error)
        return NextResponse.json(
            { error: 'Error al buscar profesional', details: error.message },
            { status: 500 }
        )
    }
}
