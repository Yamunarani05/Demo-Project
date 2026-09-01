const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.leadsDetail.findMany({
    include: {
      invoices: {
        where: {
          status: { notIn: ["Pending", "Inprogress", "Draft"] }
        }
      },
      quotationLeads: true
    }
  });

  for (const lead of leads) {
    const qCount = lead.quotationLeads.length;
    const invCount = lead.invoices.length;
    if (qCount > 1 || invCount > 1) {
      console.log(`Lead ID: ${lead.leadId} | Quotations: ${qCount} | Valid Invoices: ${invCount}`);
      console.log('Invoices:', lead.invoices.map(i => ({ id: i.invoiceId, status: i.status })));
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
