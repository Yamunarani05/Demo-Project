import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { hashPassword } from "../src/util/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists. Skipping seed.");
      return;
    }

    // Create default admin user
    console.log("👤 Creating admin user...");
    const adminPassword = await hashPassword("Admin@123");
    
    const admin = await prisma.user.create({
      data: {
        uniqueId: "ADMIN-001",
        email: "admin@redangle.com",
        passwordHash: adminPassword,
        role: "admin",
      },
    });

    console.log(`   ✅ Admin created: ${admin.email} (ID: ${admin.userId})`);

    // Create default partner user
    console.log("👤 Creating partner user...");
    const partnerPassword = await hashPassword("Partner@123");
    
    const partner = await prisma.user.create({
      data: {
        uniqueId: "PARTNER-001",
        email: "partner@redangle.com",
        passwordHash: partnerPassword,
        role: "partner",
      },
    });

    console.log(`   ✅ Partner created: ${partner.email} (ID: ${partner.userId})`);

    // Create default employee user with associated employee details
    console.log("👤 Creating employee user...");
    const employeePassword = await hashPassword("Employee@123");
    
    const employee = await prisma.user.create({
      data: {
        uniqueId: "EMP-001",
        email: "employee@redangle.com",
        passwordHash: employeePassword,
        role: "employee",
        employeesDetail: {
          create: {
            firstName: "John",
            lastName: "Doe",
            contactNumber: "9876543210",
            workLocation: "Head Office",
            salesType: "Field",
            experience: 2,
          },
        },
      },
      include: { employeesDetail: true },
    });

    console.log(`   ✅ Employee created: ${employee.email} (ID: ${employee.userId})`);

    console.log("\n📊 Seed Summary:");
    console.log("   - Admin User: admin@redangle.com (Password: Admin@123)");
    console.log("   - Partner User: partner@redangle.com (Password: Partner@123)");
    console.log("   - Employee User: employee@redangle.com (Password: Employee@123)");
    console.log("\n✨ Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Seed error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
