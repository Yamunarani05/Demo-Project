// src/Services/dashboardService.ts
import api from './apiClient';

export interface ChartData {
  month: string;    // e.g. "Dec 2025"
  achieved: number; // completed leads for that month
  target: number;   // total leads for that month
}

export interface DashboardSummary {
  totalEmployees: number;
  totalLeads: number;
  pendingLeads: number;
  totalInvoices: number;      // created invoices (Sent/Done/Paid/Approved)
  pendingInvoices: number;    // pending invoices (Pending/Inprogress)
  allLeads: any[];
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const readTotal = (payload: any, collectionKey?: string) => {
      const container = collectionKey ? payload?.[collectionKey] : payload;
      return (
        payload?.pagination?.total ??
        payload?.total ??
        container?.pagination?.total ??
        container?.total
      );
    };

    // EMPLOYEES
    const empRes = await api.get('/employees', { params: { page: 1, limit: 1 } });
    const empPayload = empRes.data;

    // Expected shape: { success, employees: { employees: [...], total: number } }
    const empContainer = empPayload.employees ?? {};
    const totalEmployees =
      readTotal(empPayload, 'employees') ??
      (Array.isArray(empContainer.employees) ? empContainer.employees.length : 0);

    // LEADS
    const leadsRes = await api.get('/leads', {
      params: { page: 1, limit: 1000, sort: 'createdAt:desc' },
    });
    const leadsPayload = leadsRes.data;
    const allLeads = leadsPayload.data ?? [];
    const totalLeads = readTotal(leadsPayload) ?? allLeads.length;

    const getStatusFromStage = (
      stageRaw: any,
    ): 'In Progress' | 'Complete' | 'Approved' | 'Pending' => {
      const stage = (stageRaw ?? '').toLowerCase();
      if (stage.includes('progress') || stage.includes('follow')) {
        return 'In Progress';
      }
      if (stage.includes('final') || stage.includes('won') || stage.includes('converted')) {
        return 'Complete';
      }
      if (stage.includes('approved')) {
        return 'Approved';
      }
      return 'Pending';
    };

    const pendingLeads = allLeads.filter(
      (l: any) => getStatusFromStage(l.currentStage) === 'Pending',
    ).length;

    // INVOICES – load actual rows so we can classify by status
    const invRes = await api.get('/invoices', {
      params: { page: 1, limit: 1000, sort: 'createdAt:desc' },
    });
    const invPayload = invRes.data;
    const invoiceRows: any[] = invPayload.data ?? invPayload.invoices ?? [];

    const isPendingInvoice = (statusRaw: any) => {
      const s = String(statusRaw ?? '').toLowerCase();
      return s === 'pending' || s === 'inprogress' || s === 'in progress';
    };

    const isCreatedInvoice = (statusRaw: any) => {
      const s = String(statusRaw ?? '').toLowerCase();
      return (
        s === 'sent' ||
        s === 'approved' ||
        s === 'done' ||
        s === 'paid'
      );
    };

    const pendingInvoices = invoiceRows.filter((inv) =>
      isPendingInvoice(inv.status),
    ).length;

    const createdInvoices = invoiceRows.filter((inv) =>
      isCreatedInvoice(inv.status),
    ).length;

    // If backend already sends totals, prefer them as fallback
    const totalInvoices =
      readTotal(invPayload) ??
      createdInvoices;

    return {
      totalEmployees,
      totalLeads,
      pendingLeads,
      totalInvoices,
      pendingInvoices,
      allLeads, // used by dashboard to build 5‑month graph
    };
  },

  async getRecentLeads() {
    const res = await api.get('/leads', {
      params: { page: 1, limit: 6, sort: 'createdAt:desc' },
    });
    const payload = res.data;
    return payload.data ?? [];
  },
};

/**
 * Build 5 consecutive months (endMonth inclusive).
 * For each month:
 *  - target = total leads created in that month
 *  - achieved = leads with status "Complete" in that month
 */
export function buildFiveMonthPerformance(
  allLeads: any[],
  endMonth: Date,
): ChartData[] {
  const end = new Date(endMonth.getFullYear(), endMonth.getMonth(), 1);

  // Generate 5 months: end-4, ..., end
  const months: { key: string; label: string; year: number; monthIndex: number }[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    const year = d.getFullYear();
    const mIndex = d.getMonth();
    const ymKey = `${year}-${String(mIndex + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric',
    });
    months.push({ key: ymKey, label, year, monthIndex: mIndex });
  }

  const getStatusFromStage = (
    stageRaw: any,
  ): 'In Progress' | 'Complete' | 'Approved' | 'Pending' => {
    const stage = (stageRaw ?? '').toLowerCase();
    if (stage.includes('progress') || stage.includes('follow')) {
      return 'In Progress';
    }
    if (stage.includes('final') || stage.includes('won') || stage.includes('converted')) {
      return 'Complete';
    }
    if (stage.includes('approved')) {
      return 'Approved';
    }
    return 'Pending';
  };

  const buckets = new Map<
    string,
    { target: number; achieved: number; label: string }
  >();
  months.forEach((m) => {
    buckets.set(m.key, { target: 0, achieved: 0, label: m.label });
  });

  for (const lead of allLeads) {
    const created = lead.createdAt ?? lead.createdTime;
    if (!created) continue;
    const d = new Date(created);
    if (Number.isNaN(d.getTime())) continue;

    const year = d.getFullYear();
    const mIndex = d.getMonth();
    const ymKey = `${year}-${String(mIndex + 1).padStart(2, '0')}`;

    if (!buckets.has(ymKey)) continue;

    const bucket = buckets.get(ymKey)!;
    bucket.target += 1;

    const status = getStatusFromStage(lead.currentStage);
    if (status === 'Complete') {
      bucket.achieved += 1;
    }
  }

  return months.map((m) => {
    const bucket = buckets.get(m.key)!;
    return {
      month: bucket.label,
      achieved: bucket.achieved,
      target: bucket.target,
    };
  });
}
