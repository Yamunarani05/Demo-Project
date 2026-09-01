const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.leadsDetail.findMany({
    where: {
      email: { contains: 'deepancrr', mode: 'insensitive' }
    }
  });
  console.log("Leads found:", leads.map(l => ({ email: l.email, hash: !!l.passwordHash, sn: l.leadSerialNumber })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
