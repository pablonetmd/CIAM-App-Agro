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

        const recipe = await prisma.recipe.findUnique({
            where: { codigoActivacion: codigoActivacion.toUpperCase() },
            include: {
                profesional: true,
            },
        })

        if (!recipe) {
            return NextResponse.json(
                { error: 'Código de activación inválido', valid: false },
                { status: 404 }
            )
        }

        return NextResponse.json({
            valid: true,
            recipe,
        })
    } catch (error) {
        console.error('Error validating recipe:', error)
        return NextResponse.json(
            { error: 'Error al validar receta' },
            { status: 500 }
        )
    }
}
