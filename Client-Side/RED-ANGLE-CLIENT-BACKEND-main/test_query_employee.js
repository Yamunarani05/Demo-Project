const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({
    where: {
      email: { contains: 'deepancrr', mode: 'insensitive' }
    }
  });
  console.log("Employees found:", employees.map(e => e.email));
}

main().catch(console.error).finally(() => prisma.$disconnect());
