import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@gmail.com' }
  });
  console.log('User:', user);
  
  if (user) {
    const isMatch = await bcrypt.compare('Admin@123', user.passwordHash);
    console.log('Password match:', isMatch);
  }
}

main().finally(() => prisma.$disconnect());
