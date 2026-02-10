import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Función auxiliar para generar el código
function generateActivationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export async function POST(request: NextRequest) {
    // Bypass solo durante la fase de build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return NextResponse.json({ bypass: true });
    }

    try {
        const body = await request.json()
        const { profesionalId, cultivo, insumos, dosis } = body

        if (!profesionalId) {
            return NextResponse.json({ error: 'ID de profesional requerido' }, { status: 400 })
        }

        // Verificar profesional
        const professional = await prisma.professional.findUnique({
            where: { id: profesionalId },
        })

        if (!professional || professional.estado !== 'HABILITADO') {
            return NextResponse.json(
                { error: 'Profesional no encontrado o no habilitado' },
                { status: 403 }
            )
        }

        // Generar código único
        let codigoActivacion = generateActivationCode()
        let isUnique = false
        while (!isUnique) {
            const existing = await prisma.recipe.findUnique({ where: { codigoActivacion } })
            if (!existing) isUnique = true
            else codigoActivacion = generateActivationCode()
        }

        const recipe = await prisma.recipe.create({
            data: { profesionalId, cultivo, insumos, dosis, codigoActivacion },
            include: { profesional: true }
        })

        return NextResponse.json(recipe, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: 'Error al crear receta', details: error.message }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    // Bypass solo durante la fase de build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return NextResponse.json({ bypass: true });
    }

    try {
        const searchParams = request.nextUrl.searchParams
        const profesionalId = searchParams.get('profesionalId')

        if (!profesionalId) {
            return NextResponse.json({ error: 'ID de profesional requerido' }, { status: 400 })
        }

        const recipes = await prisma.recipe.findMany({
            where: { profesionalId },
            include: { profesional: true },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(recipes)
    } catch (error: any) {
        return NextResponse.json({ error: 'Error al obtener recetas' }, { status: 500 })
    }
}