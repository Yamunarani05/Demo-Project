import { Request, Response, NextFunction } from 'express';
import { query, isDbConnected } from '../config/database';
import { sendSuccess } from '../utils/response';
import { memoryStore } from '../models/db';

export const notificationController = {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = req.query.studioId ? String(req.query.studioId) : undefined;
      if (isDbConnected) {
        const filter = studioId && studioId !== 'all' ? 'WHERE studio_id = $1 OR studio_id IS NULL' : '';
        const params = studioId && studioId !== 'all' ? [studioId] : [];
        const result = await query(`SELECT * FROM notifications ${filter} ORDER BY created_at DESC LIMIT 50`, params);
        const unread = result.rows.filter(n => !n.is_read).length;
        return sendSuccess(res, result.rows, 'Notifications fetched successfully', 200, { unreadCount: unread });
      } else {
        const list = memoryStore.notifications;
        const unread = list.filter(n => !n.isRead).length;
        return sendSuccess(res, list, 'Notifications fetched successfully', 200, { unreadCount: unread });
      }
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (isDbConnected) {
        await query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
      } else {
        const n = memoryStore.notifications.find(item => item.id === id);
        if (n) n.isRead = true;
      }
      return sendSuccess(res, { marked: true }, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (isDbConnected) {
        await query('UPDATE notifications SET is_read = TRUE');
      } else {
        memoryStore.notifications.forEach(n => { n.isRead = true; });
      }
      return sendSuccess(res, { markedAll: true }, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
};
