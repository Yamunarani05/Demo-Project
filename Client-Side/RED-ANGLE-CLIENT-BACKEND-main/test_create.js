const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const leadId = 3;
        const dType = 'EVENT_RAW_DATA';
        const delivery = await prisma.clientDelivery.create({
            data: {
                leadId: Number(leadId),
                deliveryType: dType,
                notes: 'test',
                status: 'pending'
            }
        });
        console.log("Created successfully:", delivery.id);
    } catch (e) {
        console.error("Create failed:", e);
    }
}

main().finally(() => prisma.$disconnect());
