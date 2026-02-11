import "dotenv/config";
import { defineConfig } from "prisma/config";

// En Vercel, DATABASE_URL no está disponible durante la fase de instalación (postinstall).
// Prisma 7 requiere una URL para validar la config incluso si solo generamos el cliente.
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        url: DATABASE_URL,
    },
});
