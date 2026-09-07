const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lead = await prisma.leadsDetail.findFirst({ where: { leadId: 4 } });
  console.log('Lead:', lead?.leadId);
  const ql = await prisma.quotationLead.findFirst({ where: { leadId: 4 } });
  console.log('QuotationLead:', ql);
  const inv = await prisma.invoices.findFirst({ where: { leadId: 4 } });
  console.log('Invoice:', inv);
}
main().catch(console.error).finally(() => prisma.$disconnect());
