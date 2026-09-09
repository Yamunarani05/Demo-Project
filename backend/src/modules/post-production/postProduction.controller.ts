import { Request, Response, NextFunction } from 'express';
import { memoryStore } from '../../models/db';
import { sendSuccess } from '../../utils/response';
import { validateRequired } from '../../validations';

const postProdTasks = [
  {
    id: 'task_1',
    shootId: 'shoot_1',
    clientName: 'Arun & Priya',
    type: 'Photo Retouching',
    assignedTo: 'Ramesh Krishnan',
    role: 'Retouch Editor',
    dueDate: '2026-09-18',
    status: 'IN_PROGRESS',
    totalItems: 120,
    completedItems: 68,
    priority: 'High',
  },
  {
    id: 'task_2',
    shootId: 'shoot_1',
    clientName: 'Arun & Priya',
    type: 'Teaser Video (60s)',
    assignedTo: 'Vijay Anand',
    role: 'Candid Video Editor',
    dueDate: '2026-09-20',
    status: 'IN_PROGRESS',
    totalItems: 1,
    completedItems: 0,
    priority: 'High',
  },
  {
    id: 'task_3',
    shootId: 'shoot_2',
    clientName: 'Karthik & Divya',
    type: 'Traditional Video Film',
    assignedTo: 'Anita Sharma',
    role: 'Traditional Video Editor',
    dueDate: '2026-09-28',
    status: 'NOT_STARTED',
    totalItems: 3,
    completedItems: 0,
    priority: 'Medium',
  },
  {
    id: 'task_4',
    shootId: 'shoot_2',
    clientName: 'Karthik & Divya',
    type: 'Royal Wedding Album Design',
    assignedTo: 'Harika Naidu',
    role: 'Album Designer',
    dueDate: '2026-10-05',
    status: 'NOT_STARTED',
    totalItems: 40,
    completedItems: 0,
    priority: 'Medium',
  },
];

export const postProductionController = {
  // 1. Task Queue across 9 Editing Disciplines
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, status, shootId } = req.query;
      let list = postProdTasks;

      if (role) list = list.filter(t => t.role.toLowerCase().includes(String(role).toLowerCase()));
      if (status) list = list.filter(t => t.status === status);
      if (shootId) list = list.filter(t => t.shootId === shootId);

      return sendSuccess(res, list, 'Post-production tasks fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = postProdTasks.find(t => t.id === req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      return sendSuccess(res, task);
    } catch (err) {
      next(err);
    }
  },

  async updateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const task = postProdTasks.find(t => t.id === req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

      if (req.body.status) task.status = req.body.status;
      if (req.body.completedItems !== undefined) task.completedItems = req.body.completedItems;

      return sendSuccess(res, task, 'Task status updated successfully');
    } catch (err) {
      next(err);
    }
  },

  // 2. Data Manager & Raw Ingest (Pixstudio / Pixoffice)
  async getDataManagerDrives(req: Request, res: Response, next: NextFunction) {
    try {
      const drives = memoryStore.clients.map((c, i) => ({
        clientId: c.id,
        clientName: c.coupleName || c.name,
        rawFolderUrl: `https://drive.google.com/drive/folders/pixstudio-raw-${c.id}`,
        verifiedFolderUrl: `https://drive.google.com/drive/folders/pixoffice-verified-${c.id}`,
        storageStatus: i % 2 === 0 ? 'Verified & Backed Up' : 'Pending Verification',
        totalGb: (i + 1) * 64,
        verificationDate: '2026-09-04',
        dataManager: 'Suresh Kumar',
      }));
      return sendSuccess(res, drives, 'Data manager drive records fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateDriveLinks(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, { clientId: req.params.clientId, ...req.body }, 'Drive links updated successfully');
    } catch (err) {
      next(err);
    }
  },

  // 3. Quality Control (QC) Reviews
  async getQCReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const qcs = [
        {
          id: 'qc_1',
          shootId: 'shoot_1',
          clientName: 'Arun & Priya',
          deliverableTitle: 'Color Graded Candid Photos (Batch 1)',
          editor: 'Ramesh Krishnan',
          reviewer: 'Vikram Sundaram (Studio Admin)',
          status: 'PASSED',
          score: '9.5/10',
          comments: 'Tones match vintage luxury palette. Skin tones naturally preserved.',
        },
        {
          id: 'qc_2',
          shootId: 'shoot_2',
          clientName: 'Karthik & Divya',
          deliverableTitle: 'Teaser Video Draft 1',
          editor: 'Vijay Anand',
          reviewer: 'Priya Sharma',
          status: 'REVISION_REQUESTED',
          score: '7.0/10',
          comments: 'Audio mixing needs ducking during vow exchange; re-export in 4K DCI.',
        },
      ];
      return sendSuccess(res, qcs, 'QC review records fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async submitQCReview(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['status', 'reviewer']);
      return sendSuccess(res, {
        id: `qc_${Date.now()}`,
        ...req.body,
        reviewedAt: new Date().toISOString(),
      }, 'QC review saved successfully');
    } catch (err) {
      next(err);
    }
  }
};
