import "dotenv/config";
import { defineConfig } from "prisma/config";

// En Prisma 7, este archivo sustituye a la URL en el schema para migraciones.
export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
    },
});
