import { PrismaClient } from '@prisma/client';
import "dotenv/config";

async function main() {
  console.log("URL from env:", process.env.DATABASE_URL?.length);
  const prisma = new PrismaClient();
  try {
    const profs = await prisma.professional.findMany();
    console.log("Success! Found", profs.length, "professionals");
  } catch (e) {
    console.error("Failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
