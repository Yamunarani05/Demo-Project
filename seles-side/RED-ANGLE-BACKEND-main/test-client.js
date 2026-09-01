const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.client.findFirst({where: {name: 'Suryaa M'}, include: {Invoice: true, Lead: true}}).then(c => {
  console.log(JSON.stringify(c, null, 2));
  prisma.$disconnect();
});
