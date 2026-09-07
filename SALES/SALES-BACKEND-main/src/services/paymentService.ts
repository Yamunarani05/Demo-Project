import { PrismaClient, PaymentStatus ,Prisma} from "@prisma/client";

const prisma = new PrismaClient();
// export const createPayment = async (data: {
//   leadId: number;
//   invoiceId: number;
//   paid: number;
//   paymentType: string;
//   proofUrl?: string;
//   notes?: string;
// }) => {
//   if (!data.invoiceId) throw new Error("Invoice ID is required");

//   return prisma.$transaction(async (tx) => {
//     const invoice = await tx.invoices.findUnique({
//       where: { invoiceId: data.invoiceId },
//       include: {
//         packageInvoices: {
//           include: { package: true },
//         },
//       },
//     });

//     if (!invoice) throw new Error("Invoice not found");

//     const totalAmount = invoice.packageInvoices.reduce(
//       (sum, item) =>
//         sum + Number(item.unit) * Number(item.package.price),
//       0
//     );

//     const paidAgg = await tx.payments.aggregate({
//       where: { invoiceId: data.invoiceId },
//       _sum: { paid: true },
//     });

//     const totalPaidSoFar = Number(paidAgg._sum.paid ?? 0);
//     const newTotalPaid = totalPaidSoFar + Number(data.paid);
//     const balance = totalAmount - newTotalPaid;

//     const payment = await tx.payments.create({
//       data: {
//         leadId: data.leadId,
//         invoiceId: data.invoiceId,
//         amount: totalAmount,
//         paid: Number(data.paid),
//         balance,
//         paymentType: data.paymentType,
//         proofUrl: data.proofUrl,
//         notes: data.notes,
//         paymentDate: new Date(),
//         status: PaymentStatus.VERIFIED,
//       },
//     });

//     await tx.invoices.update({
//       where: { invoiceId: data.invoiceId },
//       data: {
//         status: balance <= 0 ? "Paid" : "Partial",
//       },
//     });

//     // ✅ CORRECT RETURN
//     return {
//       payment,
//       invoiceSummary: {
//         totalAmount,
//         totalPaid: newTotalPaid,
//         balance,
//         status: balance <= 0 ? "PAID" : "PARTIAL",
//       },
//     };
//   });
// };
export const createPayment = async (data: {
  leadId: number;
  invoiceId: number;
  paid: number;
  paymentType: string;
  proofUrl?: string;
  notes?: string;
}) => {
  if (!data.invoiceId) throw new Error("Invoice ID is required");

  return prisma.$transaction(async (tx) => {
    // 1️⃣ Fetch invoice and package totals
    const invoice = await tx.invoices.findUnique({
      where: { invoiceId: data.invoiceId },
      include: {
        packageInvoices: { include: { package: true } },
      },
    });

    if (!invoice) throw new Error("Invoice not found");

    // 2️⃣ Fetch lead addons for this lead
    const leadAddons = await tx.leadAddon.findMany({
      where: { leadId: data.leadId },
      select: {
        total: true,
      },
    });

    const addonTotal = leadAddons.reduce(
      (sum, addon) => sum + Number(addon.total ?? 0),
      0
    );

    // 3️⃣ Compute total invoice amount (packages + addons)
    const totalAmount =
      invoice.packageInvoices.reduce(
        (sum, item) => sum + Number(item.unit) * Number(item.package.price),
        0
      ) + addonTotal;

    // 4️⃣ Sum all VERIFIED payments so far
    const paidAgg = await tx.payments.aggregate({
      where: { invoiceId: data.invoiceId, status: PaymentStatus.VERIFIED },
      _sum: { paid: true },
    });

    const totalPaidSoFar = Number(paidAgg._sum.paid ?? 0);
    const newTotalPaid = totalPaidSoFar + Number(data.paid);

    const discount = Number(invoice.discount ?? 0);
    const overallBudget = totalAmount - discount;
    const balance = overallBudget - newTotalPaid;

    // 5️⃣ Create payment record
    const payment = await tx.payments.create({
      data: {
        leadId: data.leadId,
        invoiceId: data.invoiceId,
        amount: totalAmount,
        paid: Number(data.paid),
        balance,
        paymentType: data.paymentType,
        proofUrl: data.proofUrl,
        notes: data.notes,
        paymentDate: new Date(),
        status: PaymentStatus.VERIFIED,
      },
    });

    // 6️⃣ Update invoice status
    await tx.invoices.update({
      where: { invoiceId: data.invoiceId },
      data: { status: balance <= 0 ? "Paid" : "Partial" },
    });

    return {
      payment,
      invoiceSummary: {
        totalAmount,
        totalPaid: newTotalPaid,
        balance,
        status: balance <= 0 ? "PAID" : "PARTIAL",
      },
    };
  });
};


export const verifyPayment = async (
  paymentId: number,
  status: PaymentStatus,
  adminId: number
) => {
  if (
    status !== PaymentStatus.VERIFIED &&
    status !== PaymentStatus.REJECTED
  ) {
    throw new Error("Invalid status");
  }

  return prisma.$transaction(async (tx) => {
    // 1️⃣ Update payment
    const payment = await tx.payments.update({
      where: { paymentId },
      data: {
        status,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
    });

    // 2️⃣ Only proceed if VERIFIED
    if (status !== PaymentStatus.VERIFIED || !payment.invoiceId) {
      return payment;
    }

    // 3️⃣ Calculate total invoice amount
    const invoice = await tx.invoices.findUnique({
      where: { invoiceId: payment.invoiceId },
      include: {
        packageInvoices: {
          include: { package: true },
        },
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

   // 2️⃣ Calculate TOTAL invoice amount (packages + addons)
const leadAddons = await prisma.leadAddon.findMany({
  where: { leadId: invoice.leadId },
  select: { total: true },
});

const addonTotal = leadAddons.reduce(
  (sum, addon) => sum + Number(addon.total ?? 0),
  0
);

const packageTotal = invoice.packageInvoices.reduce(
  (sum, item) =>
    sum + Number(item.unit || 0) * Number(item.package?.price || 0),
  0
);

const totalAmount = packageTotal + addonTotal;


    // 4️⃣ Sum all VERIFIED payments
    const paidAgg = await tx.payments.aggregate({
      where: {
        invoiceId: payment.invoiceId,
        status: PaymentStatus.VERIFIED,
      },
      _sum: { paid: true },
    });

    const totalPaid = Number(paidAgg._sum.paid ?? 0);
    const discount = Number(invoice.discount ?? 0);
    const balance = (totalAmount - discount) - totalPaid;

    // 5️⃣ Update invoice ONLY if fully paid
    if (balance <= 0) {
      await tx.invoices.update({
        where: { invoiceId: payment.invoiceId },
        data: { status: "Paid" },
      });
    }

    return payment;
  });
};

export const getPaymentsByInvoice = async (invoiceId: number) => {
  return prisma.payments.findMany({
    where: {
      invoiceId,
    },
    orderBy: { paymentDate: "asc" },
  });
};

/**
 * Fetch total payments made for an invoice
 */
// export const getInvoicePaymentSummary = async (invoiceId: number) => {
//   const paymentsAgg = await prisma.payments.aggregate({
//     where: {
//       invoiceId,
//       status: PaymentStatus.VERIFIED, // Only verified payments
//     },
//     _sum: {
//       amount: true,
//       paid: true,
//       balance: true,
//     },
//   });

//   return {
//     totalAmount: Number(paymentsAgg._sum.amount ?? 0),
//     totalPaid: Number(paymentsAgg._sum.paid ?? 0),
//     totalBalance: Number(paymentsAgg._sum.balance ?? 0),
//   };
// };


export const getInvoiceAmountSummary = async (invoiceId: number) => {
  // 1️⃣ Fetch invoice with packages
  const invoice = await prisma.invoices.findUnique({
    where: { invoiceId },
    include: {
      packageInvoices: {
        include: { package: true },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // 2️⃣ Calculate TOTAL invoice amount
  const totalAmount = invoice.packageInvoices.reduce(
    (sum, item) =>
      sum +
      Number(item.unit || 0) *
      Number(item.package?.price || 0),
    0
  );

  // 3️⃣ Sum VERIFIED payments
  const paidAgg = await prisma.payments.aggregate({
    where: {
      invoiceId,
      status: PaymentStatus.VERIFIED,
    },
    _sum: {
      paid: true,
    },
  });

  const totalPaid = Number(paidAgg._sum.paid ?? 0);
  const discount = Number(invoice.discount ?? 0);
  const overallBudget = totalAmount - discount;
  const balance = overallBudget - totalPaid;

  // 4️⃣ Decide invoice status
  let status: "PAID" | "PARTIAL" | "UNPAID" = "UNPAID";

  if (totalPaid === 0) status = "UNPAID";
  else if (balance > 0) status = "PARTIAL";
  else status = "PAID";

  return {
    invoiceId,
    totalAmount,
    discount,
    overallBudget,
    totalPaid,
    balance,
    status,
  };
};


export const fetchMonthlyEarnings = async () => {
  const earnings = await prisma.$queryRaw<
    { year: number; month: number; totalEarned: number }[]
  >(Prisma.sql`
    SELECT 
      EXTRACT(YEAR FROM "payment_date")::int AS year,
      EXTRACT(MONTH FROM "payment_date")::int AS month,
      SUM("paid") AS "totalEarned"
    FROM "payments"
    WHERE "status" = 'VERIFIED'
    GROUP BY year, month
    ORDER BY year DESC, month DESC
  `);

  return earnings;
};

/**
 * Fetch all payments in a specific month
 */
export const fetchPaymentsByMonth = async (year: number, month: number) => {
  return prisma.payments.findMany({
    where: {
      status: PaymentStatus.VERIFIED,
      paymentDate: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
    orderBy: { paymentDate: "asc" },
  });
};

/**
 * Fetch payment details with invoice and lead info
 */
export const fetchPaymentDetails = async (paymentId: number) => {
  return prisma.payments.findUnique({
    where: { paymentId },
    include: {
      invoice: {
        include: {
          lead: true,
          packageInvoices: {
            include: { package: true },
          },
        },
      },
    },
  });
};