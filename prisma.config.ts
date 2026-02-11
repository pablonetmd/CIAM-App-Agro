import "dotenv/config";
import { defineConfig } from "prisma/config";

const getSanitizedUrl = () => {
    let url = process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_PRISMA_URL;

    if (!url || url === 'undefined' || url.trim() === '') return "postgresql://ghost:ghost@localhost:5432/ghost";

    url = url.trim();
    if (url.includes("'")) url = url.split("'")[1] || url;
    if (url.startsWith("psql ")) url = url.replace("psql ", "");
    return url;
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: getSanitizedUrl(),
    },
});
