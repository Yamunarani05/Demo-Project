const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deliveries = await prisma.clientDelivery.findMany({
        where: { leadId: 3 }
    });
    console.log(JSON.stringify(deliveries, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
