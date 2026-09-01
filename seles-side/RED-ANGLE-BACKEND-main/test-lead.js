const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.leadsDetail.findFirst({where: {firstName: 'Suryaa', lastName: 'M'}, include: {invoices: {include: {packageInvoices: {include: {package: {include: {items: true}}}}, addons: {include: {addonService: true}}, invoiceItems: true}}}}).then(c => {
  console.log(JSON.stringify(c, null, 2));
  prisma.$disconnect();
});
