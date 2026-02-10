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

            // Generate unique activation code
            function generateActivationCode(): string {
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
                let code = ''
                for (let i = 0; i < 8; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length))
                }
                return code
            }

      
                    )
        }

                // Verify professional exists and is HABILITADO
                const professional = await prisma.professional.findUnique({
            where: { id: profesionalId },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Profesional no encontrado' },
                { status: 404 }
            )
        }

        if (professional.estado !== 'HABILITADO') {
            return NextResponse.json(
                { error: 'Solo profesionales habilitados pueden generar recetas' },
                { status: 403 }
            )
        }

        // Generate unique activation code
        let codigoActivacion = generateActivationCode()
        let isUnique = false

        while (!isUnique) {
            const existing = await prisma.recipe.findUnique({
                where: { codigoActivacion },
            })
            if (!existing) {
                isUnique = true
            } else {
                codigoActivacion = generateActivationCode()
            }
        }

        // Create recipe
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

        return NextResponse.json(recipe, { status: 201 })
    } catch (error) {
        console.error('Error creating recipe:', error)
        return NextResponse.json(
            { error: 'Error al crear receta' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const profesionalId = searchParams.get('profesionalId')

        if (!profesionalId) {
            return NextResponse.json(
                { error: 'ID de profesional requerido' },
                { status: 400 }
            )
        }

        const recipes = await prisma.recipe.findMany({
            where: { profesionalId },
            include: {
                profesional: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(recipes)
    } catch (error) {
        console.error('Error fetching recipes:', error)
        return NextResponse.json(
            { error: 'Error al obtener recetas' },
            { status: 500 }
        )
    }
}
