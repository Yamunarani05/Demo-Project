import { PrismaClient } from '@prisma/client';

async function testPrisma() {
  const prisma = new PrismaClient();
  const rawData = await prisma.clientDelivery.findFirst({
      where: { 
          leadId: 2, 
          deliveryType: { in: ['RAW_DATA', 'EVENT_RAW_DATA'] } 
      },
      orderBy: { createdAt: 'desc' }
  });
  console.log("rawData for lead 2:", rawData);
  await prisma.$disconnect();
}
testPrisma().catch(e => console.error(e));
