import { Router, Request, Response } from 'express';
import { memoryStore, DeliverableRecord } from '../db';

const router = Router();

// GET /api/deliverables - Get deliverables by shoot or studio
router.get('/', (req: Request, res: Response) => {
  const { shootId, studioId } = req.query;

  let deliverables = [...memoryStore.deliverables];

  if (shootId) {
    deliverables = deliverables.filter(d => d.shootId === shootId);
  } else if (studioId && studioId !== 'all') {
    deliverables = deliverables.filter(d => d.studioId === studioId);
  }

  // Populate shoot info
  const populated = deliverables.map(d => {
    const shoot = memoryStore.shoots.find(s => s.id === d.shootId);
    return {
      ...d,
      shootTitle: shoot?.title || 'Photography Shoot',
      shootType: shoot?.type || 'Pre-Wedding',
    };
  });

  res.json({
    success: true,
    data: populated,
    total: populated.length,
  });
});

// POST /api/deliverables - Create new deliverable
router.post('/', (req: Request, res: Response) => {
  const { shootId, studioId, title, type, downloadUrl, previewUrl, fileSize, status } = req.body;

  if (!shootId || !title || !downloadUrl) {
    return res.status(400).json({ success: false, message: 'shootId, title, and downloadUrl are required' });
  }

  const shoot = memoryStore.shoots.find(s => s.id === shootId);

  const newDeliverable: DeliverableRecord = {
    id: `deliv_${Date.now()}`,
    shootId,
    studioId: studioId || shoot?.studioId || 'studio_1',
    title,
    type: type || 'high_res_album',
    downloadUrl,
    previewUrl,
    fileSize: fileSize || '1.2 GB',
    status: status || 'ready',
    deliveredAt: status === 'delivered' ? new Date().toISOString() : undefined,
    created_at: new Date().toISOString(),
  };

  memoryStore.deliverables.push(newDeliverable);

  res.status(201).json({
    success: true,
    data: newDeliverable,
    message: 'Deliverable added successfully',
  });
});

// PUT /api/deliverables/:id/status - Update deliverable status
router.put('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const deliverable = memoryStore.deliverables.find(d => d.id === id);
  if (!deliverable) {
    return res.status(404).json({ success: false, message: 'Deliverable not found' });
  }

  deliverable.status = status;
  if (status === 'delivered') {
    deliverable.deliveredAt = new Date().toISOString();
  }

  res.json({
    success: true,
    data: deliverable,
    message: `Deliverable status updated to ${status}`,
  });
});

export default router;
