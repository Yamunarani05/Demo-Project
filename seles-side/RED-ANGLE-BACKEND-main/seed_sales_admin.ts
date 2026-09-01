import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      passwordHash,
      role: 'admin',
    },
    create: {
      uniqueId: 'ADMIN-001',
      email: 'admin@gmail.com',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('Admin user seeded:', admin.email, admin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
