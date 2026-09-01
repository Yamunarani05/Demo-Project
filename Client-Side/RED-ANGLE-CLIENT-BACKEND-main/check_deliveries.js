const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const deliveries = await prisma.clientDelivery.findMany({ where: { leadId: 1 } });
  console.log(JSON.stringify(deliveries, null, 2));
  await prisma.$disconnect();
}

check();
