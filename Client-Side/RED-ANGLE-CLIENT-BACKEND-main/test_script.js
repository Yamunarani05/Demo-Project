const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deliveries = await prisma.clientDelivery.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log("=== RECENT DELIVERIES ===");
    console.dir(deliveries, { depth: null });
}

main().finally(() => prisma.$disconnect());
