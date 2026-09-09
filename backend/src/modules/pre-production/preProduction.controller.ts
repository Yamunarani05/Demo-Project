import { Request, Response, NextFunction } from 'express';
import { preProductionService } from '../../services/preProductionService';
import { memoryStore } from '../../models/db';
import { sendSuccess } from '../../utils/response';
import { validateRequired } from '../../validations';

export const preProductionController = {
  // 1. Projects in Pre-production
  async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = String(req.query.studioId || 'studio_1');
      const projects = await preProductionService.getProjects(studioId);
      return sendSuccess(res, projects, 'Pre-production projects fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  // 2. Initial Call & Requirements
  async getCallDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = {
        projectId: req.params.projectId,
        callDate: '2026-09-05',
        clientNotes: 'Couple requested vintage outdoor sunrise shoot with traditional silk outfits and candid golden hour session.',
        discussedPackages: ['Premium Royal Pre-Wedding'],
        preferredLocations: ['Ooty Tea Gardens', 'Avalanche Lake', 'Pine Forest'],
        budgetConfirmed: true,
        specialRequests: 'Drone aerial establishing shots and 60-second Instagram cinematic reel.',
      };
      return sendSuccess(res, details);
    } catch (err) {
      next(err);
    }
  },

  async updateCallDetails(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, { projectId: req.params.projectId, ...req.body }, 'Call details saved successfully');
    } catch (err) {
      next(err);
    }
  },

  // 3. Creative Planning & Moodboard
  async getCreativePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = {
        projectId: req.params.projectId,
        theme: 'Ethereal Romance & Natural Light',
        colorPalette: ['Emerald Green', 'Deep Crimson', 'Warm Gold', 'Ivory'],
        moodboardUrls: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80',
        ],
        shotList: [
          { id: 'shot_1', title: 'Misty sunrise hill silhouette', location: 'Nandi Hills', plannedTime: '06:15 AM' },
          { id: 'shot_2', title: 'Candid walking among tea bushes', location: 'Estate Section B', plannedTime: '08:30 AM' },
          { id: 'shot_3', title: 'Traditional attire temple courtyard portrait', location: 'Heritage Temple', plannedTime: '11:00 AM' },
          { id: 'shot_4', title: 'Sunset boat reflection sequence', location: 'Lake Shore', plannedTime: '05:45 PM' },
        ],
        equipmentRecommendations: ['Sony A7 IV', 'Sony FX3', 'DJI Mavic 3 Pro', '85mm f/1.4 GM'],
      };
      return sendSuccess(res, plan);
    } catch (err) {
      next(err);
    }
  },

  async updateCreativePlan(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, { projectId: req.params.projectId, ...req.body }, 'Creative plan updated successfully');
    } catch (err) {
      next(err);
    }
  },

  // 4. Creative Confirmation & Client Sign-off
  async confirmCreativePlan(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, {
        projectId: req.params.projectId,
        confirmedBy: req.body.confirmedBy || 'Client',
        confirmedAt: new Date().toISOString(),
        status: 'CONFIRMED',
      }, 'Creative plan confirmed successfully');
    } catch (err) {
      next(err);
    }
  },

  // 5. Shoot Team Assignment
  async assignTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await preProductionService.assignTeam(req.params.projectId, req.body);
      return sendSuccess(res, updated, 'Team assigned successfully for pre-production');
    } catch (err) {
      next(err);
    }
  },

  // 6. Milestone Transition to Production
  async advanceToProduction(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await preProductionService.advanceToProduction(req.params.projectId);
      return sendSuccess(res, updated, 'Project transitioned to Production phase');
    } catch (err) {
      next(err);
    }
  }
};
