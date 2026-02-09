import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: './dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding ...')

    const professionals = [
        {
            nombre: 'Lucas Nicolas Rios',
            matricula: '95045402',
            estado: 'HABILITADO',
            telefono: '2612733722',
        },
        {
            nombre: 'Maria Gomez',
            matricula: '12345678',
            estado: 'HABILITADO',
            telefono: '2615550123',
        },
        {
            nombre: 'Juan Perez',
            matricula: '87654321',
            estado: 'RECOMENDADOR',
            telefono: '2615550987',
        },
        {
            nombre: 'Pedro Inactivo',
            matricula: '00000000',
            estado: 'INACTIVO',
            telefono: '2615550000',
        },
    ]

    for (const p of professionals) {
        const user = await prisma.professional.upsert({
            where: { matricula: p.matricula },
            update: {},
            create: p,
        })
        console.log(`Created professional with id: ${user.id}`)
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
