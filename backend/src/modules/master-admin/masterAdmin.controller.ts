import { Request, Response, NextFunction } from 'express';
import { memoryStore } from '../../models/db';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { isDbConnected, query } from '../../config/database';

export const masterAdminController = {
  // Studio & Company Health Overview
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const studios = memoryStore.studios;
      const clients = memoryStore.clients;
      const shoots = memoryStore.shoots;
      const leads = memoryStore.leads;

      const totalRevenue = studios.reduce((acc, s) => acc + (s.totalRevenue || 0), 0);
      const activeShoots = shoots.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length;
      const completedShoots = shoots.filter(s => s.status === 'COMPLETED').length;

      const dashboardData = {
        companyHealth: {
          totalStudios: studios.length,
          activeStudios: studios.filter(s => s.status === 'active').length,
          pendingApprovals: studios.filter(s => s.status === 'pending').length,
          totalRevenue,
          activeShoots,
          completedShoots,
          totalClients: clients.length,
          totalLeads: leads.length,
        },
        financialSnapshot: {
          totalBilled: totalRevenue + 850000,
          totalCollected: totalRevenue,
          outstandingBalance: 850000,
          collectionRate: '82.4%',
          monthlyTarget: 5000000,
          achievedPercent: 68,
        },
        teamPerformance: {
          totalEmployees: 18,
          presentToday: 17,
          onLeaveToday: 1,
          avgProductivity: '92.6%',
          activeTasks: 34,
        },
        recentClients: clients.slice(0, 10),
        performanceTrends: [
          { month: 'May 2026', revenue: 1850000, shoots: 24, leads: 32 },
          { month: 'Jun 2026', revenue: 2400000, shoots: 31, leads: 40 },
          { month: 'Jul 2026', revenue: 3100000, shoots: 38, leads: 45 },
          { month: 'Aug 2026', revenue: 4200000, shoots: 52, leads: 62 },
          { month: 'Sept 2026', revenue: 2850000, shoots: 36, leads: 48 },
        ],
      };

      return sendSuccess(res, dashboardData, 'Master admin dashboard fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  // Cross-Studio Client Directory
  async getClients(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, flowType } = req.query;
      let list = memoryStore.clients;

      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(c => 
          c.name.toLowerCase().includes(q) || 
          (c.coupleName && c.coupleName.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
        );
      }

      if (status) {
        list = list.filter(c => c.status === status);
      }

      return sendSuccess(res, list, 'Master admin clients fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  // Detailed Single Client Profile with Workflow Milestones
  async getClientDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const client = memoryStore.clients.find(c => c.id === req.params.id);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found' });
      }

      const clientShoots = memoryStore.shoots.filter(s => s.clientId === client.id);
      const clientInvoices = memoryStore.payments.filter(p => p.clientId === client.id);

      return sendSuccess(res, {
        client,
        shoots: clientShoots,
        payments: clientInvoices,
        timeline: [
          { stage: 'Lead Captured', date: client.created_at, completed: true },
          { stage: 'Quotation Sent & Accepted', date: '2026-08-20', completed: true },
          { stage: 'Advance Payment Received', date: '2026-08-22', completed: true },
          { stage: 'Pre-Production Consultation', date: '2026-08-28', completed: true },
          { stage: 'Production Shoot Day', date: client.eventDate, completed: false },
          { stage: 'Post-Production Retouching', date: 'Upcoming', completed: false },
          { stage: 'Final Delivery', date: 'Upcoming', completed: false },
        ]
      });
    } catch (err) {
      next(err);
    }
  },

  // Employee Workload and Team Monitoring
  async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const photographers = memoryStore.photographers;
      const employees = photographers.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        role: p.specialization.join(', '),
        rating: p.rating,
        experience: p.experience,
        availability: p.availabilityStatus,
        assignedShoots: p.assignedShootsCount,
        completedShoots: p.completedShootsCount,
        profileImage: p.profileImage,
      }));

      return sendSuccess(res, employees, 'Employees fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  // Team Attendance Overview
  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const records = [
        { id: 'att_1', employeeId: 'EMP-001', employee: 'Karthik Rajan', role: 'Lead Photographer', date: '2026-09-08', checkIn: '06:00 AM', checkOut: '07:30 PM', status: 'Present' },
        { id: 'att_2', employeeId: 'EMP-002', employee: 'Vijay Anand', role: 'Videographer & Drone', date: '2026-09-08', checkIn: '06:00 AM', checkOut: '07:30 PM', status: 'Present' },
        { id: 'att_3', employeeId: 'EMP-003', employee: 'Ramesh Krishnan', role: 'Retouch Editor', date: '2026-09-08', checkIn: '09:00 AM', checkOut: '06:30 PM', status: 'Present' },
        { id: 'att_4', employeeId: 'EMP-004', employee: 'Pooja Hegde', role: 'Pre-production CRM', date: '2026-09-08', checkIn: '09:30 AM', checkOut: '06:00 PM', status: 'Present' },
        { id: 'att_5', employeeId: 'EMP-005', employee: 'Suresh Kumar', role: 'Data Manager', date: '2026-09-08', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present' },
      ];
      return sendSuccess(res, records, 'Attendance records fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  // Operational Activity Logs
  async getActivityLogs(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, memoryStore.activityLogs.slice(0, 50), 'Activity logs fetched successfully');
    } catch (err) {
      next(err);
    }
  }
};
