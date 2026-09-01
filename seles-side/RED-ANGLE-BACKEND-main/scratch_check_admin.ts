import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { userId: true, email: true, role: true, passwordHash: true }
  });
  
  for (const u of users) {
    const isMatchAdmin123 = await bcrypt.compare('Admin@123', u.passwordHash);
    const isMatchPartner123 = await bcrypt.compare('Partner@123', u.passwordHash);
    const isMatchEmployee123 = await bcrypt.compare('Employee@123', u.passwordHash);
    console.log(`User: ${u.email} (${u.role}) -> Admin@123: ${isMatchAdmin123}, Partner@123: ${isMatchPartner123}, Employee@123: ${isMatchEmployee123}`);
  }
}

main().finally(() => prisma.$disconnect());
