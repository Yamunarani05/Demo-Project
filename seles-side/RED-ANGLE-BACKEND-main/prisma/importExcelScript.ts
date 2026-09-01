import { PrismaClient, LeadStage } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const stageMap: Record<string, LeadStage> = {
  'lead': LeadStage.Lead,
  'quotation': LeadStage.Quotation,
  'confirmation': LeadStage.Confirmation,
  'finalize': LeadStage.Finalised,
  'finalised': LeadStage.Finalised,
  'callup': LeadStage.callUp,
};

const kanbanMap: Record<LeadStage, string> = {
  [LeadStage.Lead]: 'To Do',
  [LeadStage.callUp]: 'In Progress',
  [LeadStage.Quotation]: 'In Progress',
  [LeadStage.Confirmation]: 'In Review',
  [LeadStage.Finalised]: 'Done',
};

async function main() {
  console.log('🚀 Starting Excel data import into Database...');

  const jsonPath = path.join(__dirname, '../excel_data.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Data file not found at ${jsonPath}`);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const rows = JSON.parse(rawData);

  console.log(`Found ${rows.length} rows to import/update.`);

  // Get a default admin user for createdBy
  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' },
  });

  const createdById = adminUser ? adminUser.userId : 1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const leadSerial = row['Lead ID'] ? String(row['Lead ID']).trim() : `LD-${i + 1}`;
    const contact = row['Contact'] ? String(row['Contact']).trim() : '';
    const fullName = row['Client Name'] ? String(row['Client Name']).trim() : 'Unknown Client';
    const email = row['Email ID'] ? String(row['Email ID']).trim() : `client${i + 1}@example.com`;
    const eventName = row['Event Name'] ? String(row['Event Name']).trim() : 'Event';
    const location = row['Location'] ? String(row['Location']).trim() : '';

    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || '';

    const rawStage = row['Stage'] ? String(row['Stage']).trim().toLowerCase() : 'lead';
    const currentStage = stageMap[rawStage] || LeadStage.Lead;
    const status = kanbanMap[currentStage] || 'To Do';

    const overallBudget = row['Overall Budget'] ? parseFloat(String(row['Overall Budget'])) : 0;
    const advancePaid = row['Advance Paid'] ? parseFloat(String(row['Advance Paid'])) : 0;
    const salesPaid = row['Sales Paid'] ? parseFloat(String(row['Sales Paid'])) : advancePaid;
    const discount = row['Discount'] ? parseFloat(String(row['Discount'])) : 0;

    const leadType = leadSerial.includes('-') ? leadSerial.split('-')[0] : 'LD';

    console.log(`Processing ${leadSerial} - ${fullName}...`);

    // Upsert Lead
    const existingLead = await prisma.leadsDetail.findFirst({
      where: { leadSerialNumber: leadSerial, isDeleted: false },
    });

    let lead;
    if (existingLead) {
      lead = await prisma.leadsDetail.update({
        where: { leadId: existingLead.leadId },
        data: {
          firstName,
          lastName,
          contactNumber: contact,
          email,
          eventType: eventName,
          address: location,
          budget: overallBudget,
          paidAmount: salesPaid,
          discount: discount,
          currentStage,
          status,
          updatedAt: new Date(),
        },
      });
      console.log(`  ✅ Updated existing Lead #${lead.leadId} (${leadSerial})`);
    } else {
      lead = await prisma.leadsDetail.create({
        data: {
          leadSerialNumber: leadSerial,
          leadType: leadType,
          firstName,
          lastName,
          contactNumber: contact,
          email,
          eventType: eventName,
          address: location,
          budget: overallBudget,
          paidAmount: salesPaid,
          discount: discount,
          currentStage,
          status,
          createdBy: createdById,
        },
      });
      console.log(`  ✨ Created new Lead #${lead.leadId} (${leadSerial})`);
    }

    // Process Invoice if present
    const invoiceId = row['Invoice ID'] ? String(row['Invoice ID']).trim() : null;
    if (invoiceId) {
      const plan = row['Plan'] ? String(row['Plan']).trim() : 'Standard';
      const invStatus = row['Status'] ? String(row['Status']).trim() : 'Approved';
      const totalAmount = row['Total Amount'] ? parseFloat(String(row['Total Amount'])) : overallBudget;

      const existingInvoice = await prisma.invoices.findFirst({
        where: { billNo: invoiceId },
      });

      if (existingInvoice) {
        await prisma.invoices.update({
          where: { invoiceId: existingInvoice.invoiceId },
          data: {
            leadId: lead.leadId,
            plan,
            status: invStatus === 'Approved' ? 'Paid' : invStatus,
            totalAmount,
            paid: salesPaid,
            discount,
            updatedAt: new Date(),
          },
        });
        console.log(`  📄 Updated Invoice ${invoiceId}`);
      } else {
        await prisma.invoices.create({
          data: {
            leadId: lead.leadId,
            billNo: invoiceId,
            billingDate: new Date(),
            plan,
            status: invStatus === 'Approved' ? 'Paid' : invStatus,
            totalAmount,
            paid: salesPaid,
            discount,
            createdBy: createdById,
          },
        });
        console.log(`  📄 Created Invoice ${invoiceId}`);
      }
    }
  }

  console.log('🎉 Successfully imported all Excel data into Dashboard database!');
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
