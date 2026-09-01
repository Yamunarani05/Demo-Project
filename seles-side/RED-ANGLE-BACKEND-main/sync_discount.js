const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ql = await prisma.quotationLead.findFirst({ where: { leadId: 4 } });
  if (ql && ql.discount > 0) {
    await prisma.invoices.updateMany({
      where: { leadId: 4 },
      data: { discount: ql.discount },
    });
    console.log('Updated invoice discount for LD-04 to', ql.discount);
  } else {
    console.log('No discount found to sync.');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
