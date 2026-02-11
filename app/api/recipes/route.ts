import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return NextResponse.json({ bypass: true });
    }

    try {
        if (!prisma) {
            return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
        }
        const recipes = await prisma.recipe.findMany({
            include: { profesional: true },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(recipes)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching recipes' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return NextResponse.json({ bypass: true });
    }

    try {
        const body = await request.json()
        const { profesionalId, cultivo, insumos, dosis } = body

        if (!profesionalId || !cultivo || !insumos || !dosis) {
            return NextResponse.json(
                { error: 'Todos los campos son obligatorios' },
                { status: 400 }
            )
        }

        if (!(prisma as any).professional) {
            console.error('[API ERROR] Prisma client failed to initialize');
            return NextResponse.json(
                { error: 'Base de datos no disponible temporalmente (Prisma Init Failed)' },
                { status: 503 }
            )
        }

        // Verificar profesional
        const professional = await prisma.professional.findUnique({
            where: { id: profesionalId },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Profesional no encontrado' },
                { status: 404 }
            )
        }

        // Admitir tanto HABILITADO como ACTIVO
        const isHabilitado = professional.estado === 'HABILITADO' || professional.estado === 'ACTIVO';
        if (!isHabilitado) {
            return NextResponse.json(
                { error: 'Profesional no habilitado para generar recetas' },
                { status: 403 }
            )
        }

        // Generar código de activación único (vibrant code)
        const codigoActivacion = Math.random().toString(36).substring(2, 8).toUpperCase()

        const recipe = await prisma.recipe.create({
            data: {
                profesionalId,
                cultivo,
                insumos,
                dosis,
                codigoActivacion,
            },
            include: {
                profesional: true,
            },
        })

        return NextResponse.json(recipe)
    } catch (error: any) {
        console.error('Error creating recipe:', error)
        return NextResponse.json(
            { error: 'Error al crear receta', details: error.message },
            { status: 500 }
        )
    }
}