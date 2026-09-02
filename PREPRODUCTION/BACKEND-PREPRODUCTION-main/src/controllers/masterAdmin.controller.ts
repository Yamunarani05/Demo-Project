import { Request, Response } from "express";
import {
  getMasterAdminAttendance,
  getMasterAdminClient,
  getMasterAdminClientEmployees,
  getMasterAdminClientReport,
  getMasterAdminClients,
  getMasterAdminDashboard,
  getMasterAdminEmployees,
  getMasterAdminInvoices,
  getMasterAdminReports,
  getMasterAdminWorkTracker,
} from "../services/masterAdmin.service";
import { pool, salesPool } from "../config/db";

const filtersFromRequest = (req: Request) => ({
  flowType: req.query.flowType as any,
  phase: req.query.phase as any,
  status: req.query.status as string | undefined,
  fromDate: req.query.fromDate as string | undefined,
  toDate: req.query.toDate as string | undefined,
  search: req.query.search as string | undefined,
});

const sendData = (res: Response, data: unknown) => res.json({ success: true, data });
const paramValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : String(value || "");

const handle = async (res: Response, action: () => Promise<unknown>) => {
  try {
    const data = await action();
    if (!res.headersSent) sendData(res, data);
  } catch (error: any) {
    console.error("MASTER ADMIN ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Master Admin request failed" });
  }
};

export const masterAdminDashboard = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminDashboard());

export const masterAdminClients = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminClients(filtersFromRequest(req)));

export const masterAdminClient = (req: Request, res: Response) =>
  handle(res, async () => {
    const client = await getMasterAdminClient(paramValue(req.params.clientId));
    if (!client) {
      res.status(404).json({ success: false, message: "Client not found" });
      return undefined;
    }
    return client;
  });

export const masterAdminEmployees = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminEmployees(filtersFromRequest(req)));

export const masterAdminWorkTracker = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminWorkTracker(filtersFromRequest(req)));

export const masterAdminInvoices = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminInvoices(filtersFromRequest(req)));

export const masterAdminAttendance = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminAttendance(filtersFromRequest(req)));

export const masterAdminReports = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminReports(filtersFromRequest(req)));

export const masterAdminClientEmployees = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminClientEmployees(paramValue(req.params.clientId)));

export const masterAdminClientWorkTracker = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminWorkTracker({}, paramValue(req.params.clientId)));

export const masterAdminClientInvoice = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminInvoices({}, paramValue(req.params.clientId)));

export const masterAdminClientAttendance = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminAttendance({}, paramValue(req.params.clientId)));

export const masterAdminClientReport = (req: Request, res: Response) =>
  handle(res, () => getMasterAdminClientReport(paramValue(req.params.clientId)));

export const masterAdminClientTrackerData = async (req: Request, res: Response) => {
  try {
    const clientId = paramValue(req.params.clientId);
    const assignments = await pool.query(`SELECT * FROM lead_employee WHERE lead_id::text = $1`, [clientId]);
    
    const eventsQuery = await pool.query(`SELECT * FROM event_details WHERE external_lead_id = $1`, [clientId]);
    const ppsQuery = await pool.query(`SELECT * FROM pre_production_shoots WHERE external_lead_id = $1`, [clientId]);
    
    const events = {
        rows: [
            ...eventsQuery.rows.map(e => ({ ...e, event_name: e.event_type || e.event_name, status: e.event_status || e.status })),
            ...ppsQuery.rows.map(p => ({ ...p, event_name: 'Pre-production', status: p.media_status === 'Verified' ? 'completed' : (p.media_status || 'in_progress') }))
        ]
    };
    
    // Fetch Pixoffice and Pixstudio
    const pixoffice = await pool.query(`SELECT * FROM pixoffice_entries WHERE external_lead_id::text = $1`, [clientId]);
    const pixstudio = await pool.query(`SELECT * FROM pixstudio_entries WHERE external_lead_id::text = $1`, [clientId]);

    const externalLeadQuery = await pool.query(`SELECT assigned_post_prod_crm_id FROM external_leads WHERE external_id = $1 OR lead_serial_number = $1 LIMIT 1`, [clientId]);
    const assignedPostProdCrmId = externalLeadQuery.rows.length > 0 ? externalLeadQuery.rows[0].assigned_post_prod_crm_id : null;
    
    let assignedPostProdCrm = null;
    if (assignedPostProdCrmId) {
       try {
           const empRes = await pool.query(`SELECT first_name, last_name, role FROM employees WHERE employee_id = $1`, [assignedPostProdCrmId]);
           if (empRes.rows.length > 0) assignedPostProdCrm = empRes.rows[0];
       } catch (e) {
           console.error("Failed to fetch assigned post prod CRM", e);
       }
    }

    // Fetch Sales Executive from Sales DB
    let salesExecutive = null;
    let quotations = [];
    try {
      const salesQuery = `
        SELECT e.first_name, e.last_name 
        FROM lead_employee le
        JOIN employees_detail e ON le.employee_id = e.employee_id
        JOIN leads_detail ld ON le.lead_id = ld.lead_id
        WHERE ld.lead_serial_number = $1
        LIMIT 1
      `;
      const salesRes = await salesPool.query(salesQuery, [clientId]);
      if (salesRes.rows.length > 0) {
        const emp = salesRes.rows[0];
        salesExecutive = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
      }

      const qQuery = `
        SELECT q.status 
        FROM quotation_lead q
        JOIN leads_detail ld ON q.lead_id = ld.lead_id
        WHERE ld.lead_serial_number = $1
      `;
      const qRes = await salesPool.query(qQuery, [clientId]);
      quotations = qRes.rows;
      } catch (err) {
        console.error("Failed to fetch sales executive or quotations:", err);
      }

      let assignedProjects = [];
      try {
        const assignedProjectsRes = await pool.query(`
          SELECT ap.project_id, ap.project_type, ap.employee_id, ap.status, ap.updated_at, ap.created_at, e.first_name, e.last_name, e.role
          FROM assigned_projects ap
          LEFT JOIN employees e ON ap.employee_id = e.employee_id
          WHERE ap.project_id = $1 OR ap.project_id = $2
        `, [`CRM-${clientId}`, clientId]);
        assignedProjects = assignedProjectsRes.rows;
      } catch (err) {
        console.error("Failed to fetch assigned projects:", err);
      }
  
      res.json({ 
          success: true, 
          data: { 
              assignments: assignments.rows, 
              events: events.rows,
              pixoffice: pixoffice.rows,
              pixstudio: pixstudio.rows,
              salesExecutive,
              quotations,
              assignedPostProdCrm,
              assignedProjects
          } 
      });
    } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
