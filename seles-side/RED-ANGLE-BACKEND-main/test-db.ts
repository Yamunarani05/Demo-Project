import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const invoiceItems = await prisma.invoiceItem.findMany({
    where: { name: { contains: "ITEM" } }
  });
  console.log("INVOICE ITEMS:", invoiceItems);

  const packageItems = await prisma.packageItem.findMany({
    where: { name: { contains: "ITEM" } }
  });
  console.log("PACKAGE ITEMS:", packageItems);
}
main().catch(console.error).finally(() => prisma.$disconnect());
