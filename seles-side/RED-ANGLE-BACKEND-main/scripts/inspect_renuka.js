const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const invoice = await prisma.invoices.findUnique({
    where: { invoiceId: 69 },
    include: {
      lead: true,
      payments: true,
      packageInvoices: { include: { package: true } },
      invoiceItems: true,
      addons: true,
    },
  });

  console.log("INVOICE 69:", JSON.stringify(invoice, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
