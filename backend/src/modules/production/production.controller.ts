import { Request, Response, NextFunction } from 'express';
import { memoryStore } from '../../models/db';
import { sendSuccess } from '../../utils/response';
import { validateRequired } from '../../validations';

// In-memory event runtime status store
const eventRuntimeStore: Record<string, {
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  startedBy?: string;
  elapsedSeconds: number;
}> = {};

export const productionController = {
  // 1. Production Shoots
  async getShoots(req: Request, res: Response, next: NextFunction) {
    try {
      const shoots = memoryStore.shoots.filter(s => 
        ['PHOTOGRAPHER_ASSIGNED', 'SHOOTING', 'SHOOT_COMPLETED', 'CONFIRMED', 'PLANNED'].includes(s.status)
      );
      return sendSuccess(res, shoots, 'Production shoots fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getShootById(req: Request, res: Response, next: NextFunction) {
    try {
      const shoot = memoryStore.shoots.find(s => s.id === req.params.id);
      if (!shoot) return res.status(404).json({ success: false, message: 'Shoot not found' });
      return sendSuccess(res, shoot);
    } catch (err) {
      next(err);
    }
  },

  // 2. Role-Based Shoot Schedules (Photographer, Videographer, Drone)
  async getSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, staffId } = req.query;
      let shoots = memoryStore.shoots;

      if (staffId) {
        shoots = shoots.filter(s => s.photographerId === staffId || s.cinematographerId === staffId);
      }

      const schedules = shoots.map(s => ({
        shootId: s.id,
        clientName: s.title,
        eventType: s.type,
        date: s.shootDate,
        location: s.location,
        leadPhotographer: s.photographerName || 'Karthik Rajan',
        cinematographer: s.cinematographerName || 'Vijay Anand',
        dronePilot: s.dronePilot || 'Vijay Anand',
        callTime: '05:30 AM',
        status: s.status,
        shotListCount: 24,
        completedShotsCount: s.status === 'SHOOT_COMPLETED' ? 24 : 12,
      }));

      return sendSuccess(res, schedules, 'Shoot schedules fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  // 3. Live Event Runtime Status & Shoot Timer
  async getEventRuntimeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const shootId = req.params.shootId;
      const state = eventRuntimeStore[shootId] || {
        status: 'not_started',
        elapsedSeconds: 0,
      };
      return sendSuccess(res, state);
    } catch (err) {
      next(err);
    }
  },

  async startEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const shootId = req.params.shootId;
      const now = new Date().toISOString();
      eventRuntimeStore[shootId] = {
        status: 'in_progress',
        startedAt: now,
        startedBy: req.body.startedBy || 'Lead Photographer',
        elapsedSeconds: eventRuntimeStore[shootId]?.elapsedSeconds || 0,
      };

      const shoot = memoryStore.shoots.find(s => s.id === shootId);
      if (shoot) shoot.status = 'SHOOTING';

      return sendSuccess(res, eventRuntimeStore[shootId], 'Shoot event started');
    } catch (err) {
      next(err);
    }
  },

  async pauseEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const shootId = req.params.shootId;
      const state = eventRuntimeStore[shootId] || { status: 'not_started', elapsedSeconds: 0 };
      state.status = 'paused';
      state.pausedAt = new Date().toISOString();
      eventRuntimeStore[shootId] = state;

      return sendSuccess(res, state, 'Shoot event paused');
    } catch (err) {
      next(err);
    }
  },

  async endEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const shootId = req.params.shootId;
      const state = eventRuntimeStore[shootId] || { status: 'not_started', elapsedSeconds: 0 };
      state.status = 'completed';
      state.completedAt = new Date().toISOString();
      eventRuntimeStore[shootId] = state;

      const shoot = memoryStore.shoots.find(s => s.id === shootId);
      if (shoot) {
        shoot.status = 'SHOOT_COMPLETED';
        shoot.progressPercent = 50;
      }

      return sendSuccess(res, state, 'Shoot event marked completed, ready for RAW ingest');
    } catch (err) {
      next(err);
    }
  },

  // 4. Raw Storage Card Check-in
  async checkInMediaCards(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, {
        shootId: req.params.shootId,
        cardsReceived: req.body.cardsCount || 4,
        totalGigabytes: req.body.totalGigabytes || 256,
        handedOverBy: req.body.handedOverBy || 'Lead Photographer',
        receivedBy: req.body.receivedBy || 'Data Manager',
        timestamp: new Date().toISOString(),
      }, 'Media cards checked in successfully');
    } catch (err) {
      next(err);
    }
  }
};
