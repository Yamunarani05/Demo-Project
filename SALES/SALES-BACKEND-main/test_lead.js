const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const lead = await prisma.leadsDetail.findUnique({ where: { leadId: 9 } });
  console.log(lead);
}
main().catch(console.error).finally(() => prisma.$disconnect());
