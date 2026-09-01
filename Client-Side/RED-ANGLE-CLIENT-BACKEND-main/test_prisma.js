const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const complaints = await prisma.clientComplaint.findMany({ include: { lead: true } });
    console.log("Complaints:", complaints.length);
  } catch(e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
