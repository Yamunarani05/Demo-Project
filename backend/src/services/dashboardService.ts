import { query, isDbConnected } from '../config/database';
import { memoryStore } from '../models/db';

export const dashboardService = {
  async getStats(studioId?: string) {
    if (isDbConnected) {
      const studioFilter = studioId && studioId !== 'all' ? 'WHERE studio_id = $1' : '';
      const params = studioId && studioId !== 'all' ? [studioId] : [];

      const clientsCount = await query(`SELECT COUNT(*) FROM clients ${studioFilter}`, params);
      const totalProjects = await query(`SELECT COUNT(*) FROM projects ${studioFilter}`, params);
      const activeProjects = await query(
        `SELECT COUNT(*) FROM projects ${studioFilter ? studioFilter + ' AND' : 'WHERE'} status NOT IN ('COMPLETED', 'CANCELLED')`,
        params
      );
      const completedProjects = await query(
        `SELECT COUNT(*) FROM projects ${studioFilter ? studioFilter + ' AND' : 'WHERE'} status = 'COMPLETED'`,
        params
      );
      const pendingProjects = await query(
        `SELECT COUNT(*) FROM projects ${studioFilter ? studioFilter + ' AND' : 'WHERE'} status IN ('LEAD', 'CONFIRMED', 'PLANNING')`,
        params
      );

      const revenueRes = await query(
        `SELECT COALESCE(SUM(paid_amount), 0) as total_revenue, COALESCE(SUM(total_amount), 0) as total_sales,
                COALESCE(SUM(balance_amount), 0) as pending_payments
         FROM invoices ${studioFilter}`,
        params
      );

      const leadsCount = await query(`SELECT COUNT(*) FROM leads ${studioFilter}`, params);
      const convertedLeads = await query(
        `SELECT COUNT(*) FROM leads ${studioFilter ? studioFilter + ' AND' : 'WHERE'} status = 'Done'`,
        params
      );

      const totalClients = parseInt(clientsCount.rows[0].count, 10);
      const totalLeads = parseInt(leadsCount.rows[0].count, 10);
      const converted = parseInt(convertedLeads.rows[0].count, 10);
      const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

      return {
        totalClients,
        totalProjects: parseInt(totalProjects.rows[0].count, 10),
        activeProjects: parseInt(activeProjects.rows[0].count, 10),
        completedProjects: parseInt(completedProjects.rows[0].count, 10),
        pendingProjects: parseInt(pendingProjects.rows[0].count, 10),
        totalSales: parseFloat(revenueRes.rows[0].total_sales),
        totalRevenue: parseFloat(revenueRes.rows[0].total_revenue),
        pendingPayments: parseFloat(revenueRes.rows[0].pending_payments),
        newLeads: totalLeads,
        conversionRate,
      };
    } else {
      const clients = studioId && studioId !== 'all' ? memoryStore.clients.filter(c => c.studioId === studioId) : memoryStore.clients;
      const shoots = studioId && studioId !== 'all' ? memoryStore.shoots.filter(s => s.studioId === studioId) : memoryStore.shoots;
      const leads = studioId && studioId !== 'all' ? memoryStore.leads.filter(l => l.studioId === studioId) : memoryStore.leads;

      const activeProjects = shoots.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length;
      const completedProjects = shoots.filter(s => s.status === 'COMPLETED').length;
      const pendingProjects = shoots.filter(s => s.status === 'LEAD' || s.status === 'CONFIRMED' || s.status === 'PLANNED' || (s.status as any) === 'PLANNING').length;

      return {
        totalClients: clients.length || 18,
        totalProjects: shoots.length || 24,
        activeProjects: activeProjects || 14,
        completedProjects: completedProjects || 10,
        pendingProjects: pendingProjects || 5,
        totalSales: 3450000,
        totalRevenue: 2480000,
        pendingPayments: 970000,
        newLeads: leads.length || 12,
        conversionRate: 72,
      };
    }
  },

  async getRevenueData(studioId?: string) {
    return {
      monthly: [
        { month: 'Jan', revenue: 240000, target: 200000 },
        { month: 'Feb', revenue: 320000, target: 250000 },
        { month: 'Mar', revenue: 410000, target: 300000 },
        { month: 'Apr', revenue: 380000, target: 350000 },
        { month: 'May', revenue: 490000, target: 400000 },
        { month: 'Jun', revenue: 640000, target: 500000 },
      ],
      breakdown: {
        weddings: 65,
        preWedding: 20,
        corporate: 10,
        maternity: 5,
      }
    };
  }
};
