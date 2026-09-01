const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.clientDelivery.deleteMany({
        where: { id: 6 }
    });
    console.log("Deleted id: 6");
}

main().finally(() => prisma.$disconnect());
