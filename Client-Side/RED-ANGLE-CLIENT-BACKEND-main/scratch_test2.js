const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const recentLeads = await prisma.leadsDetail.findMany({
    orderBy: { leadId: 'desc' },
    take: 3,
    include: {
      quotations: true,
      invoices: true
    }
  });

  recentLeads.forEach(lead => {
    console.log(`\nLead ID: ${lead.leadId} - ${lead.firstName}`);
    console.log(`Quotations:`);
    lead.quotations.forEach(q => console.log(`  - Q_ID: ${q.id} Status: ${q.status}`));
    console.log(`Invoices:`);
    lead.invoices.forEach(i => console.log(`  - I_ID: ${i.invoiceId} Status: ${i.status} Plan: ${i.plan} Total: ${i.totalAmount}`));
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
