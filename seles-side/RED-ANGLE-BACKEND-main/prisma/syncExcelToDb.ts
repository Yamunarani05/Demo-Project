import { PrismaClient, LeadStage } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

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
  const filePath = '/Users/vennimalaimohans/Downloads/excel.xlsx';
  console.log(`🚀 Reading Excel from: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at ${filePath}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const rawRows: any[][] = [];
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
    rawRows.push(rowValues.map(v => v !== null && v !== undefined ? (typeof v === 'object' && 'text' in v ? (v as any).text : v) : ''));
  });
  console.log(`Total raw sheet rows: ${rawRows.length}`);

  // Find header row (row index with 'Lead ID' or 'Client Name')
  let headerRowIndex = 1;
  for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
    const rowStr = rawRows[i].map((c) => String(c).toLowerCase()).join(' ');
    if (rowStr.includes('lead id') || rowStr.includes('client name')) {
      headerRowIndex = i;
      break;
    }
  }

  const headerRow = rawRows[headerRowIndex];
  console.log(`Found headers at row index ${headerRowIndex}:`, headerRow.slice(0, 15));

  const rows: Record<string, any>[] = [];
  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const rowObj: Record<string, any> = {};
    for (let c = 0; c < headerRow.length; c++) {
      const h = String(headerRow[c] || '').trim();
      if (h) rowObj[h] = rawRows[r][c];
    }
    if (rowObj['Lead ID'] || rowObj['Client Name']) {
      rows.push(rowObj);
    }
  }

  console.log(`Parsed ${rows.length} valid data rows.`);

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
    const eventDate = row['Event Date'] ? new Date(row['Event Date']) : null;

    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || '';

    const rawStage = row['Stage'] ? String(row['Stage']).trim().toLowerCase() : 'finalised';
    const currentStage = stageMap[rawStage] || LeadStage.Finalised;
    const status = kanbanMap[currentStage] || 'Done';

    const overallBudget = row['Overall Budget'] ? parseFloat(String(row['Overall Budget'])) : 0;
    const advancePaid = row['Advance Paid'] ? parseFloat(String(row['Advance Paid'])) : 0;
    const received80 = row['80% Received'] ? parseFloat(String(row['80% Received'])) : 0;
    const discount = row['Discount'] ? parseFloat(String(row['Discount'])) : 0;
    const balance = row['Balance'] ? parseFloat(String(row['Balance'])) : (overallBudget - advancePaid - received80);

    const leadType = leadSerial.includes('-') ? leadSerial.split('-')[0] : 'LD';

    // Parse items into categories
    const parseList = (str: any) => {
      if (!str || str === '-' || str === 'None' || String(str).trim() === '') return [];
      return String(str)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, quantity: 1 }));
    };

    const previewItems: { category: string; items: { name: string; quantity: number }[] }[] = [];

    const wedServices = parseList(row['Wedding Services']);
    if (wedServices.length > 0) {
      previewItems.push({ category: 'WEDDING SERVICES', items: wedServices });
    }

    const deliverables = parseList(row['Deliverables']);
    if (deliverables.length > 0) {
      previewItems.push({ category: 'DELIVERABLES', items: deliverables });
    }

    const complementary = parseList(row['Complementary Items']);
    if (complementary.length > 0) {
      previewItems.push({ category: 'COMPLEMENTARY', items: complementary });
    }

    const addons = parseList(row['Add-ons']);
    if (addons.length > 0) {
      previewItems.push({ category: 'ADD-ONS', items: addons });
    }

    const engagement = String(row['Engagement'] || '-').trim();
    const wedding = String(row['Wedding'] || (eventDate ? eventDate.toLocaleDateString('en-GB') : '-')).trim();
    const reception = String(row['Reception'] || (eventDate ? eventDate.toLocaleDateString('en-GB') : '-')).trim();
    const rituals = String(row['Rituals'] || '-').trim();

    const previewEvents = [
      { title: 'EVENT NAME', value: eventName || 'Wedding' },
      { title: 'ENGAGEMENT', value: engagement },
      { title: 'WEDDING', value: wedding },
      { title: 'RECEPTION', value: reception },
      { title: 'RITUALS', value: rituals },
      { title: 'LOCATION', value: location || '-' },
    ];

    const qtyOverrides = {
      RECEIVED_80: received80,
      OVERALL_OVERRIDE: overallBudget,
      BALANCE_OVERRIDE: balance,
    };

    const plan = String(row['Plan'] || row['Package Details'] || 'Standard').trim();

    console.log(`Processing ${leadSerial} - ${fullName}: Budget=${overallBudget}, Adv=${advancePaid}, 80%=${received80}, Bal=${balance}, Categories=${previewItems.length}`);

    // Upsert Lead
    let lead = await prisma.leadsDetail.findFirst({
      where: { leadSerialNumber: leadSerial, isDeleted: false },
    });

    if (lead) {
      lead = await prisma.leadsDetail.update({
        where: { leadId: lead.leadId },
        data: {
          firstName,
          lastName,
          contactNumber: contact,
          email,
          eventType: eventName,
          address: location,
          budget: overallBudget,
          paidAmount: advancePaid,
          discount: discount,
          eventDate: eventDate || lead.eventDate,
          currentStage,
          status,
          updatedAt: new Date(),
        },
      });
      console.log(`  ✅ Updated Lead #${lead.leadId} (${leadSerial})`);
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
          paidAmount: advancePaid,
          discount: discount,
          eventDate: eventDate || new Date(),
          currentStage,
          status,
          createdBy: createdById,
        },
      });
      console.log(`  ✨ Created Lead #${lead.leadId} (${leadSerial})`);
    }

    // Upsert Invoice
    const invoiceId = row['Invoice ID'] ? String(row['Invoice ID']).trim() : `INV-${leadSerial}`;
    const existingInvoice = await prisma.invoices.findFirst({
      where: { leadId: lead.leadId },
    });

    const totalPaid = advancePaid + received80;
    const finalBalance = Math.max(0, overallBudget - discount - totalPaid);
    const finalStatus = (overallBudget > 0 && totalPaid >= overallBudget - discount) ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Pending');

    let savedInv;
    if (existingInvoice) {
      savedInv = await prisma.invoices.update({
        where: { invoiceId: existingInvoice.invoiceId },
        data: {
          billNo: invoiceId,
          plan,
          status: finalStatus,
          totalAmount: overallBudget,
          paid: advancePaid,
          discount,
          qtyOverrides: qtyOverrides,
          previewItems: previewItems,
          previewEvents: previewEvents,
          updatedAt: new Date(),
        },
      });
      console.log(`  📄 Updated Invoice #${existingInvoice.invoiceId} (${invoiceId})`);
    } else {
      savedInv = await prisma.invoices.create({
        data: {
          leadId: lead.leadId,
          billNo: invoiceId,
          billingDate: eventDate || new Date(),
          plan,
          status: finalStatus,
          totalAmount: overallBudget,
          paid: advancePaid,
          discount,
          qtyOverrides: qtyOverrides,
          previewItems: previewItems,
          previewEvents: previewEvents,
          createdBy: createdById,
        },
      });
      console.log(`  📄 Created Invoice #${savedInv.invoiceId} (${invoiceId})`);
    }

    // Record Advance and 80% Received as verified payments
    if (savedInv) {
      if (advancePaid > 0) {
        const existingAdv = await prisma.payments.findFirst({
          where: { invoiceId: savedInv.invoiceId, notes: 'Initial Advance Payment' }
        });
        if (!existingAdv) {
          await prisma.payments.create({
            data: {
              leadId: lead.leadId,
              invoiceId: savedInv.invoiceId,
              amount: overallBudget,
              paid: advancePaid,
              balance: Math.max(0, overallBudget - discount - advancePaid),
              paymentType: 'UPI',
              notes: 'Initial Advance Payment',
              paymentDate: eventDate || new Date(),
              status: 'VERIFIED' as any,
            }
          });
        }
      }

      if (received80 > 0) {
        const existing80 = await prisma.payments.findFirst({
          where: { invoiceId: savedInv.invoiceId, notes: '80% Payment Received' }
        });
        if (!existing80) {
          await prisma.payments.create({
            data: {
              leadId: lead.leadId,
              invoiceId: savedInv.invoiceId,
              amount: overallBudget,
              paid: received80,
              balance: finalBalance,
              paymentType: 'UPI',
              notes: '80% Payment Received',
              paymentDate: eventDate || new Date(),
              status: 'VERIFIED' as any,
            }
          });
        }
      }
    }
  }

  console.log('🎉 Successfully synced all Excel data with 80% received and full package descriptions into Database!');
}

main()
  .catch((e) => {
    console.error('❌ Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
