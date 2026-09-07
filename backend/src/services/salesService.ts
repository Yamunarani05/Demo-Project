import { query, transaction, isDbConnected } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { memoryStore, LeadRecord, QuotationRecord, PackageRecord, FollowUpRecord } from '../models/db';

export const salesService = {
  // 1. Dashboard Overview Metrics
  async getOverview(studioId = 'studio_1') {
    if (isDbConnected) {
      const leadsCount = await query('SELECT COUNT(*) FROM leads WHERE studio_id = $1', [studioId]);
      const convertedCount = await query("SELECT COUNT(*) FROM leads WHERE studio_id = $1 AND status = 'Done'", [studioId]);
      const newEnquiries = await query("SELECT COUNT(*) FROM leads WHERE studio_id = $1 AND status = 'To Do'", [studioId]);
      const inReview = await query("SELECT COUNT(*) FROM leads WHERE studio_id = $1 AND status = 'In Review'", [studioId]);
      const pendingFollowups = await query("SELECT COUNT(*) FROM sales_followups WHERE studio_id = $1 AND status = 'PENDING'", [studioId]);
      
      const revenueRes = await query(
        "SELECT COALESCE(SUM(paid_amount), 0) as total_revenue, COALESCE(SUM(total_amount), 0) as total_sales FROM invoices WHERE studio_id = $1",
        [studioId]
      );
      
      const pipelineRes = await query(
        "SELECT COALESCE(SUM(estimated_budget), 0) as pipeline_value FROM leads WHERE studio_id = $1 AND status != 'Done'",
        [studioId]
      );

      const totalLeads = parseInt(leadsCount.rows[0].count, 10);
      const totalConverted = parseInt(convertedCount.rows[0].count, 10);
      const conversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;

      return {
        totalLeads,
        newEnquiries: parseInt(newEnquiries.rows[0].count, 10),
        inReview: parseInt(inReview.rows[0].count, 10),
        convertedClients: totalConverted,
        pendingFollowups: parseInt(pendingFollowups.rows[0].count, 10),
        totalSales: parseFloat(revenueRes.rows[0].total_sales),
        revenue: parseFloat(revenueRes.rows[0].total_revenue),
        conversionRate,
        pipelineValue: parseFloat(pipelineRes.rows[0].pipeline_value),
        stages: {
          toDo: parseInt(newEnquiries.rows[0].count, 10),
          inReview: parseInt(inReview.rows[0].count, 10),
          done: totalConverted,
        }
      };
    } else {
      const leads = memoryStore.leads.filter(l => l.studioId === studioId);
      const totalLeads = leads.length;
      const converted = leads.filter(l => l.status === 'CONVERTED' || (l as any).status === 'Done').length;
      const toDo = leads.filter(l => (l as any).status === 'To Do' || l.status === 'NEW').length;
      const inReview = leads.filter(l => (l as any).status === 'In Review' || l.status === 'QUALIFIED').length;
      const pendingFollowups = memoryStore.followUps.filter(f => f.studioId === studioId && f.status === 'PENDING').length;

      return {
        totalLeads,
        newEnquiries: toDo || 8,
        inReview: inReview || 4,
        convertedClients: converted || 12,
        pendingFollowups: pendingFollowups || 3,
        totalSales: 850000,
        revenue: 620000,
        conversionRate: totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 68,
        pipelineValue: 1450000,
        stages: { toDo: toDo || 8, inReview: inReview || 4, done: converted || 12 }
      };
    }
  },

  // 2. Leads Management
  async getLeads(params: { studioId?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const offset = (page - 1) * limit;

    if (isDbConnected) {
      const conditions: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (params.studioId && params.studioId !== 'all') {
        conditions.push(`studio_id = $${idx++}`);
        values.push(params.studioId);
      }
      if (params.status && params.status !== 'all') {
        conditions.push(`status = $${idx++}`);
        values.push(params.status);
      }
      if (params.search) {
        conditions.push(`(LOWER(client_name) LIKE $${idx} OR LOWER(email) LIKE $${idx} OR phone LIKE $${idx} OR lead_code LIKE $${idx})`);
        values.push(`%${params.search.toLowerCase()}%`);
        idx++;
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const countRes = await query(`SELECT COUNT(*) FROM leads ${where}`, values);
      const total = parseInt(countRes.rows[0].count, 10);

      values.push(limit, offset);
      const res = await query(
        `SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
        values
      );

      return { data: res.rows, total, page, limit };
    } else {
      let filtered = [...memoryStore.leads];
      if (params.studioId && params.studioId !== 'all') filtered = filtered.filter(l => l.studioId === params.studioId);
      if (params.status && params.status !== 'all') filtered = filtered.filter(l => (l as any).status === params.status);
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(l => l.clientName.toLowerCase().includes(q) || l.leadCode.toLowerCase().includes(q));
      }
      const total = filtered.length;
      return { data: filtered.slice(offset, offset + limit), total, page, limit };
    }
  },

  async getLeadById(id: string) {
    if (isDbConnected) {
      const leadRes = await query('SELECT * FROM leads WHERE id = $1', [id]);
      if (leadRes.rows.length === 0) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');

      const quotations = await query('SELECT * FROM quotations WHERE lead_id = $1', [id]);
      const followUps = await query('SELECT * FROM sales_followups WHERE lead_id = $1 ORDER BY follow_up_date DESC', [id]);

      return {
        ...leadRes.rows[0],
        quotations: quotations.rows,
        followUps: followUps.rows,
      };
    } else {
      const lead = memoryStore.leads.find(l => l.id === id);
      if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      const quotations = memoryStore.quotations.filter(q => q.leadId === id);
      const followUps = memoryStore.followUps.filter(f => f.leadId === id);
      return { ...lead, quotations, followUps };
    }
  },

  async createLead(data: any) {
    const id = data.id || `lead_${Date.now()}`;
    const studioId = data.studioId || data.studio_id || 'studio_1';
    const leadCode = data.leadCode || data.lead_code || `LD-${String(Math.floor(Math.random() * 90) + 10)}`;

    if (isDbConnected) {
      const res = await query(
        `INSERT INTO leads (
           id, lead_code, studio_id, client_name, phone, email, event_type, event_date,
           location, source, estimated_budget, interested_package, status, priority, assigned_sales_person, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          id, leadCode, studioId, data.clientName || data.client_name, data.phone || '',
          data.email || '', data.eventType || data.event_type || 'Wedding',
          data.eventDate || data.event_date || new Date().toISOString().split('T')[0],
          data.location || '', data.source || 'Direct Website', Number(data.estimatedBudget || data.budget) || 100000,
          data.interestedPackage || '', data.status || 'To Do', data.priority || 'Medium',
          data.assignedSalesPerson || 'Not Assigned', data.notes || ''
        ]
      );
      return res.rows[0];
    } else {
      const newLead: LeadRecord = {
        id,
        leadCode,
        studioId,
        clientName: data.clientName || data.client_name,
        phone: data.phone || '',
        email: data.email || '',
        eventType: data.eventType || 'Wedding',
        eventDate: data.eventDate || new Date().toISOString().split('T')[0],
        location: data.location || 'Bangalore',
        source: data.source || 'Website',
        estimatedBudget: Number(data.estimatedBudget) || 100000,
        interestedPackage: data.interestedPackage || 'Standard',
        status: (data.status as any) || 'To Do',
        assignedSalesPerson: data.assignedSalesPerson || 'Not Assigned',
        lastContacted: new Date().toISOString(),
        nextFollowUp: new Date(Date.now() + 3 * 86400000).toISOString(),
        notes: data.notes || '',
        created_at: new Date().toISOString(),
      };
      memoryStore.leads.unshift(newLead);
      return newLead;
    }
  },

  async updateLead(id: string, data: any) {
    if (isDbConnected) {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const allowed = ['client_name', 'phone', 'email', 'event_type', 'event_date', 'location', 'source', 'estimated_budget', 'interested_package', 'status', 'priority', 'assigned_sales_person', 'notes'];
      for (const [key, val] of Object.entries(data)) {
        const col = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (allowed.includes(col)) {
          fields.push(`${col} = $${idx++}`);
          values.push(val);
        }
      }

      if (fields.length === 0) return this.getLeadById(id);

      values.push(id);
      const sql = `UPDATE leads SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
      const res = await query(sql, values);
      if (res.rows.length === 0) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      return res.rows[0];
    } else {
      const idx = memoryStore.leads.findIndex(l => l.id === id);
      if (idx === -1) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      memoryStore.leads[idx] = { ...memoryStore.leads[idx], ...data };
      return memoryStore.leads[idx];
    }
  },

  async convertLead(id: string, customData?: any) {
    if (isDbConnected) {
      return await transaction(async (client) => {
        const leadRes = await client.query('SELECT * FROM leads WHERE id = $1', [id]);
        if (leadRes.rows.length === 0) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
        const lead = leadRes.rows[0];

        // 1. Create client
        const clientId = `client_${Date.now()}`;
        const clientRes = await client.query(
          `INSERT INTO clients (id, studio_id, serial_number, name, couple_name, email, phone, location, event_type, budget, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
           RETURNING *`,
          [
            clientId, lead.studio_id, `CL-${lead.lead_code}`, lead.client_name, lead.client_name,
            lead.email, lead.phone, lead.location, lead.event_type, lead.estimated_budget
          ]
        );

        // 2. Create project
        const projectId = `proj_${Date.now()}`;
        const projectRes = await client.query(
          `INSERT INTO projects (id, studio_id, client_id, project_name, project_type, event_date, location, status, budget)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONFIRMED', $8)
           RETURNING *`,
          [
            projectId, lead.studio_id, clientId, `${lead.client_name} — Confirmed Project`,
            lead.event_type, lead.event_date || new Date().toISOString().split('T')[0],
            lead.location, lead.estimated_budget
          ]
        );

        // 3. Mark lead converted
        await client.query(
          `UPDATE leads SET status = 'Done', converted_client_id = $1, converted_project_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
          [clientId, projectId, id]
        );

        return { client: clientRes.rows[0], project: projectRes.rows[0] };
      });
    } else {
      const lead = memoryStore.leads.find(l => l.id === id);
      if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      lead.status = 'CONVERTED';
      return {
        client: { id: `client_${Date.now()}`, name: lead.clientName, email: lead.email },
        project: { id: `proj_${Date.now()}`, title: `${lead.clientName} Project` }
      };
    }
  },

  // 3. Follow-Ups
  async getFollowUps(params: { studioId?: string; status?: string }) {
    if (isDbConnected) {
      const studioId = params.studioId || 'studio_1';
      const statusCondition = params.status && params.status !== 'all' ? 'AND status = $2' : '';
      const values = statusCondition ? [studioId, params.status] : [studioId];

      const res = await query(
        `SELECT * FROM sales_followups WHERE studio_id = $1 ${statusCondition} ORDER BY follow_up_date ASC`,
        values
      );
      return res.rows;
    } else {
      return memoryStore.followUps;
    }
  },

  // 4. Packages
  async getPackages(studioId = 'studio_1') {
    if (isDbConnected) {
      const res = await query('SELECT * FROM packages WHERE studio_id = $1 ORDER BY price ASC', [studioId]);
      return res.rows;
    } else {
      return memoryStore.packages;
    }
  },

  // 5. Quotations
  async getQuotations(studioId = 'studio_1') {
    if (isDbConnected) {
      const res = await query('SELECT * FROM quotations WHERE studio_id = $1 ORDER BY created_at DESC', [studioId]);
      return res.rows;
    } else {
      return memoryStore.quotations;
    }
  },

  async createQuotation(data: any) {
    const id = data.id || `quot_${Date.now()}`;
    const studioId = data.studioId || 'studio_1';
    const quotationNumber = data.quotationNumber || `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;

    const packagePrice = Number(data.packagePrice) || 0;
    const addonsPrice = Array.isArray(data.addons) ? data.addons.reduce((acc: number, item: any) => acc + (Number(item.price) || 0), 0) : 0;
    const subtotal = packagePrice + addonsPrice;
    const discountPercent = Number(data.discountPercent) || 0;
    const discountAmount = Number(data.discountAmount) || (subtotal * discountPercent) / 100;
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxPercent = 18.00;
    const taxAmount = (taxable * taxPercent) / 100;
    const finalAmount = Math.round(taxable + taxAmount);

    if (isDbConnected) {
      const res = await query(
        `INSERT INTO quotations (
           id, quotation_number, studio_id, lead_id, client_name, client_contact, client_email,
           event_type, event_date, location, package_name, package_price, addons,
           discount_percent, discount_amount, tax_percent, tax_amount, final_amount, valid_until, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'DRAFT')
         RETURNING *`,
        [
          id, quotationNumber, studioId, data.leadId || null, data.clientName, data.clientContact || '',
          data.clientEmail || '', data.eventType || 'Wedding', data.eventDate || null, data.location || '',
          data.packageName || 'Custom Package', packagePrice, JSON.stringify(data.addons || []),
          discountPercent, discountAmount, taxPercent, taxAmount, finalAmount,
          data.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
        ]
      );
      return res.rows[0];
    } else {
      const newQuot: QuotationRecord = {
        id,
        quotationNumber,
        studioId,
        clientName: data.clientName,
        clientContact: data.clientContact || '',
        clientEmail: data.clientEmail || '',
        eventType: data.eventType || 'Wedding',
        eventDate: data.eventDate || '',
        location: data.location || '',
        packageId: data.packageId || 'pkg_1',
        packageName: data.packageName || 'Custom',
        packagePrice,
        addons: data.addons || [],
        discountPercent,
        discountAmount,
        taxAmount,
        finalAmount,
        validUntil: data.validUntil || '',
        notes: data.notes || '',
        status: 'DRAFT',
        created_at: new Date().toISOString(),
      };
      memoryStore.quotations.unshift(newQuot);
      return newQuot;
    }
  },

  // 6. Invoices (Powers SalesInvoice page)
  async getInvoices(studioId = 'studio_1') {
    if (isDbConnected) {
      const res = await query('SELECT * FROM invoices WHERE studio_id = $1 ORDER BY billing_date DESC NULLS LAST', [studioId]);
      return res.rows;
    } else {
      return [
        {
          id: '1',
          leadId: 'LD-07',
          leadName: 'Hems S',
          contactId: '1234568761',
          invoiceId: '—',
          billingDate: '—',
          assignedInitials: 'N',
          assignedColor: 'bg-purple-100 text-purple-700',
          employeeAssigned: 'Not Assigned',
          plan: '—',
          payment: '—',
          status: 'Not Approved',
          amount: 35000,
        },
        {
          id: '2',
          leadId: 'LD-06',
          leadName: 'Mohan S',
          contactId: '9361880503',
          invoiceId: 'INV166',
          billingDate: '8/24/2026',
          assignedInitials: 'K',
          assignedColor: 'bg-purple-600 text-white',
          employeeAssigned: 'Krishna S',
          plan: 'Basic',
          payment: 'Paid',
          status: 'Approved',
          amount: 65000,
        },
        {
          id: '3',
          leadId: 'LD-06',
          leadName: 'Mohan S',
          contactId: '9361880503',
          invoiceId: 'INV165',
          billingDate: '8/24/2026',
          assignedInitials: 'K',
          assignedColor: 'bg-purple-600 text-white',
          employeeAssigned: 'Krishna S',
          plan: 'Premium',
          payment: 'Paid',
          status: 'Approved',
          amount: 145000,
        },
        {
          id: '4',
          leadId: 'LD-06',
          leadName: 'Mohan S',
          contactId: '9361880503',
          invoiceId: '—',
          billingDate: '—',
          assignedInitials: 'K',
          assignedColor: 'bg-purple-600 text-white',
          employeeAssigned: 'Krishna S',
          plan: '—',
          payment: '—',
          status: 'Not Approved',
          amount: 50000,
        },
        {
          id: '5',
          leadId: 'RAS-03',
          leadName: 'Kavitha S',
          contactId: '9790123456',
          invoiceId: 'INV144',
          billingDate: '7/18/2026',
          assignedInitials: 'e',
          assignedColor: 'bg-purple-600 text-white',
          employeeAssigned: 'emp p',
          plan: 'Gold Tier',
          payment: 'Partial Payment',
          status: 'Approved',
          amount: 120000,
        }
      ];
    }
  },

  // 7. Attendance
  async getAttendance(studioId = 'studio_1') {
    if (isDbConnected) {
      const res = await query('SELECT * FROM employee_attendances WHERE studio_id = $1 ORDER BY date DESC', [studioId]);
      return res.rows;
    } else {
      return [
        { id: '1', employeeName: 'Krishna S', role: 'Lead Manager', date: '05/09/2026', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'Present' },
        { id: '2', employeeName: 'emp p', role: 'Sales Executive', date: '05/09/2026', checkIn: '09:45 AM', checkOut: '06:45 PM', status: 'Late' },
        { id: '3', employeeName: 'Priya Sharma', role: 'Senior Client Associate', date: '05/09/2026', checkIn: '09:05 AM', checkOut: '06:15 PM', status: 'Present' },
        { id: '4', employeeName: 'Arjun Reddy', role: 'Cinematography Consultant', date: '05/09/2026', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present' },
        { id: '5', employeeName: 'Rahul Mehta', role: 'Field Account Manager', date: '05/09/2026', checkIn: '—', checkOut: '—', status: 'Absent' },
      ];
    }
  },

  // 8. Approvals
  async getApprovals(studioId = 'studio_1') {
    if (isDbConnected) {
      const res = await query('SELECT * FROM sales_approvals WHERE studio_id = $1 ORDER BY date DESC', [studioId]);
      return res.rows;
    } else {
      return [
        { id: '1', leadCode: 'LD-07', clientName: 'Hems S', requestedBy: 'Unassigned', type: 'Special 10% Discount Request', amount: 35000, date: '04/09/2026', status: 'Pending' },
        { id: '2', leadCode: 'LD-06', clientName: 'Mohan S', requestedBy: 'Krishna S', type: 'Complimentary Photobook Add-on', amount: 65000, date: '24/08/2026', status: 'Approved' },
        { id: '3', leadCode: 'RAS-03', clientName: 'Kavitha S', requestedBy: 'emp p', type: 'Invoice Split Milestone (40/60)', amount: 120000, date: '22/08/2026', status: 'Approved' },
      ];
    }
  },

  async updateApprovalStatus(id: string, status: 'Approved' | 'Rejected') {
    if (isDbConnected) {
      const res = await query('UPDATE sales_approvals SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
      if (res.rows.length === 0) throw new AppError('Approval request not found', 404, 'NOT_FOUND');
      return res.rows[0];
    } else {
      return { id, status };
    }
  }
};
