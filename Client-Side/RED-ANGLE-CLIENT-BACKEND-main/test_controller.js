const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const leadId = 3;
    const projectType = 'Event Deliverables';

    let dType = 'RAW_DATA';
    if (projectType === 'Event Deliverables') dType = 'EVENT_RAW_DATA';

    console.log("dType:", dType);

    let delivery = await prisma.clientDelivery.findFirst({
        where: { 
            leadId: Number(leadId), 
            deliveryType: dType
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log("found EVENT_RAW_DATA delivery?", !!delivery);

    if (!delivery && dType === 'EVENT_RAW_DATA') {
        delivery = await prisma.clientDelivery.findFirst({
            where: { 
                leadId: Number(leadId), 
                deliveryType: 'RAW_DATA'
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log("found RAW_DATA delivery?", !!delivery);
    }

    if (!delivery) {
        console.log("Creating new delivery...");
        delivery = await prisma.clientDelivery.create({
            data: {
                leadId: Number(leadId),
                deliveryType: dType,
                notes: '',
                status: 'pending'
            }
        });
    }

    if (delivery) {
        let notes = delivery.notes || '';
        console.log("current notes:", notes);
        const flag = `[${projectType}_Approved]`;
        console.log("flag:", flag);
        
        if (!notes.includes(flag)) {
            notes = notes ? `${notes} ${flag}` : flag;
            console.log("updating notes to:", notes);
            const res = await prisma.clientDelivery.update({
                where: { id: delivery.id },
                data: { notes }
            });
            console.log("update result:", res.notes);
        } else {
            console.log("already includes flag");
        }
    }
}

main().finally(() => prisma.$disconnect());
