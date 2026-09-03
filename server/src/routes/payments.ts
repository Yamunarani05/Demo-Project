import { Router, Request, Response } from 'express';
import { memoryStore, PaymentRecord } from '../db';

const router = Router();

// GET /api/payments - Invoices and payments with studio isolation
router.get('/', (req: Request, res: Response) => {
  const { studioId, clientId, status } = req.query;

  let payments = [...memoryStore.payments];

  if (studioId && studioId !== 'all') {
    payments = payments.filter(p => p.studioId === studioId);
  }

  if (clientId) {
    payments = payments.filter(p => p.clientId === clientId);
  }

  if (status && status !== 'all') {
    payments = payments.filter(p => p.status === status);
  }

  // Populate client & shoot
  const populated = payments.map(p => {
    const client = memoryStore.clients.find(c => c.id === p.clientId);
    const shoot = memoryStore.shoots.find(s => s.id === p.shootId);
    return {
      ...p,
      clientName: client?.name || client?.coupleName || 'Client',
      shootTitle: shoot?.title || 'Shoot Project',
    };
  });

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
  const pendingRevenue = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);

  res.json({
    success: true,
    data: populated,
    summary: {
      totalInvoices: payments.length,
      paidAmount: totalRevenue,
      pendingAmount: pendingRevenue,
    },
  });
});

// POST /api/payments - Generate Invoice / Record Payment
router.post('/', (req: Request, res: Response) => {
  const { studioId, clientId, shootId, amount, status, paymentMethod, date, dueDate, notes } = req.body;

  if (!studioId || !clientId || !amount) {
    return res.status(400).json({ success: false, message: 'studioId, clientId, and amount are required' });
  }

  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  const newPayment: PaymentRecord = {
    id: `pay_${Date.now()}`,
    studioId,
    clientId,
    shootId,
    invoiceNumber,
    amount: Number(amount),
    status: status || 'pending',
    paymentMethod: paymentMethod || 'UPI',
    date: date || new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    notes,
  };

  memoryStore.payments.unshift(newPayment);

  // Update shoot paid amount if marked paid
  if (newPayment.status === 'paid' && shootId) {
    const shoot = memoryStore.shoots.find(s => s.id === shootId);
    if (shoot) {
      shoot.paidAmount = (shoot.paidAmount || 0) + newPayment.amount;
    }
  }

  res.status(201).json({
    success: true,
    data: newPayment,
    message: 'Invoice created successfully',
  });
});

export default router;
