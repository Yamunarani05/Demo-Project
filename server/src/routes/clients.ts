import { Router, Request, Response } from 'express';
import { memoryStore, ClientRecord } from '../db';

const router = Router();

// GET /api/clients - Tenant isolated client listing
router.get('/', (req: Request, res: Response) => {
  const { studioId, status, search } = req.query;

  let clients = [...memoryStore.clients];

  // Multi-tenant isolation
  if (studioId && studioId !== 'all') {
    clients = clients.filter(c => c.studioId === studioId);
  }

  if (status && status !== 'all') {
    clients = clients.filter(c => c.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    clients = clients.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.coupleName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }

  // Attach shoot data
  const clientsWithShoots = clients.map(client => {
    const shoots = memoryStore.shoots.filter(s => s.clientId === client.id);
    const activeShoot = shoots.find(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED') || shoots[0];
    return {
      ...client,
      shoots,
      activeShoot,
    };
  });

  res.json({
    success: true,
    data: clientsWithShoots,
    total: clientsWithShoots.length,
  });
});

// GET /api/clients/:id - Client details
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const client = memoryStore.clients.find(c => c.id === id);

  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  const shoots = memoryStore.shoots.filter(s => s.clientId === id);
  const payments = memoryStore.payments.filter(p => p.clientId === id);
  const studio = memoryStore.studios.find(s => s.id === client.studioId);

  res.json({
    success: true,
    data: {
      ...client,
      shoots,
      payments,
      studio,
    },
  });
});

// POST /api/clients - Create client
router.post('/', (req: Request, res: Response) => {
  const { studioId, name, coupleName, email, phone, eventDate, location, package: pkg, budget, notes } = req.body;

  if (!studioId || !name || !email) {
    return res.status(400).json({ success: false, message: 'studioId, name, and email are required' });
  }

  const newClient: ClientRecord = {
    id: `client_${Date.now()}`,
    studioId,
    name,
    coupleName: coupleName || name,
    email,
    phone: phone || '+91 90000 00000',
    eventDate: eventDate || new Date().toISOString().split('T')[0],
    location: location || 'Bangalore',
    package: pkg || 'Custom Photography Package',
    budget: Number(budget) || 150000,
    notes: notes || '',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  memoryStore.clients.unshift(newClient);

  // Auto-create initial shoot record
  const newShootId = `shoot_${Date.now()}`;
  memoryStore.shoots.unshift({
    id: newShootId,
    studioId,
    clientId: newClient.id,
    title: `${newClient.coupleName} — Photography Project`,
    type: 'Pre-Wedding',
    shootDate: newClient.eventDate,
    location: newClient.location,
    status: 'LEAD',
    progressPercent: 5,
    photoCount: 0,
    selectedPhotoCount: 0,
    editedPhotoCount: 0,
    packageAmount: newClient.budget,
    paidAmount: 0,
    notes: newClient.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  newClient.activeShootId = newShootId;

  // Notification and activity log
  memoryStore.notifications.unshift({
    id: `notif_${Date.now()}`,
    studioId,
    recipientRole: 'studio_admin',
    title: 'New Client Created',
    message: `Client ${newClient.coupleName} created with ${newClient.package}`,
    type: 'success',
    isRead: false,
    link: `/studio/clients/${newClient.id}`,
    created_at: 'Just now',
  });

  memoryStore.activityLogs.unshift({
    id: `act_${Date.now()}`,
    studioId,
    shootId: newShootId,
    actorName: 'Studio Admin',
    actorRole: 'Studio Admin',
    action: 'Created New Client & Project',
    details: `Added ${newClient.coupleName} for ${newClient.location}`,
    timestamp: 'Just now',
  });

  res.status(201).json({
    success: true,
    data: newClient,
    message: 'Client created successfully',
  });
});

// PUT /api/clients/:id - Update client
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const clientIndex = memoryStore.clients.findIndex(c => c.id === id);

  if (clientIndex === -1) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  memoryStore.clients[clientIndex] = {
    ...memoryStore.clients[clientIndex],
    ...req.body,
  };

  res.json({
    success: true,
    data: memoryStore.clients[clientIndex],
    message: 'Client updated successfully',
  });
});

export default router;
