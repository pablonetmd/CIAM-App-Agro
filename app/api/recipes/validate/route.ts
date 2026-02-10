import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { codigoActivacion } = body

        if (!codigoActivacion) {
            return NextResponse.json(
                { error: 'Código de activación requerido' },
                { status: 400 }
            )
        }

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
