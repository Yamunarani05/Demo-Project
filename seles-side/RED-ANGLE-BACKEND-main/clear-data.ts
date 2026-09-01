import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllData() {
  try {
    console.log('🗑️  Starting data clearing process...\n');

    // Get all table names from Prisma schema (using actual PostgreSQL table names)
    const tables = [
      'invoice_issues',
      'invoice_items',
      'invoices',
      'payments',
      'quotation_package_services',
      'quotation_packages',
      'quotations',
      'package_services',
      'add_on_services',
      'package_categories',
      'packages',
      'leads_detail',
      'admin_attendance',
      'employee_leave_requests',
      'employees_detail',
      'notification',
      'users',
    ];

    for (const table of tables) {
      try {
        // Use raw query to delete all records from table
        const result = await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
        console.log(`✅ ${table}: ${result} records deleted`);
      } catch (error: any) {
        if (error.code === 'P3018') {
          console.log(`⏭️  ${table}: Table not found (skipped)`);
        } else {
          console.error(`❌ ${table}: Error -`, error.message);
        }
      }
    }

    // Reset auto-increment sequences for PostgreSQL
    console.log('\n🔄 Resetting auto-increment sequences...');
    const tableNames = [
      'users',
      'employees_detail',
      'admin_attendance',
      'employee_leave_requests',
      'leads_detail',
      'packages',
      'package_categories',
      'add_on_services',
      'quotations',
      'quotation_packages',
      'quotation_package_services',
      'package_services',
      'invoices',
      'invoice_items',
      'invoice_issues',
      'payments',
      'notification',
    ];

    for (const table of tableNames) {
      try {
        const sequenceName = `${table}_${table.split('_').pop()}_seq`;
        await prisma.$executeRawUnsafe(`ALTER SEQUENCE IF EXISTS "${sequenceName}" RESTART WITH 1`);
        console.log(`✅ Sequence reset: ${sequenceName}`);
      } catch (error: any) {
        console.log(`⏭️  ${table}: No sequence found (skipped)`);
      }
    }

    console.log('\n✨ All data cleared successfully!');
    console.log('📊 Database schema is intact, ready for fresh data.');

  } catch (error) {
    console.error('❌ Error during data clearing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();
