import { pool } from "../config/db";
import { getMasterAdminClientReport } from "./masterAdmin.service";
import { getMyWorkQuery } from "../queries/employee.queries";

const getDateFilterClause = (dateFilter: string, column: string = 'updated_at') => {
  if (dateFilter === 'today') return `DATE(${column}) = CURRENT_DATE`;
  if (dateFilter === 'week') return `DATE(${column}) >= date_trunc('week', CURRENT_DATE)`;
  if (dateFilter === 'month') return `DATE(${column}) >= date_trunc('month', CURRENT_DATE)`;
  if (dateFilter === 'year') return `DATE(${column}) >= date_trunc('year', CURRENT_DATE)`;
  
  // Custom month like '07-2026'
  if (dateFilter && dateFilter.includes('-')) {
    const [month, year] = dateFilter.split('-');
    if (month && year) {
      return `EXTRACT(MONTH FROM ${column}) = ${parseInt(month)} AND EXTRACT(YEAR FROM ${column}) = ${parseInt(year)}`;
    }
  }
  return `1=1`; // all time if not matched
};

export const getPhaseCompletedClients = async (phase: string, dateFilter: string) => {
  let phaseCondition = "1=0";
  if (phase === 'preproduction') {
      phaseCondition = "current_phase IN ('event', 'post_production', 'completed') OR status = 'completed'";
  } else if (phase === 'event') {
      phaseCondition = "current_phase IN ('post_production', 'completed') OR status = 'completed'";
  } else if (phase === 'post_production') {
      phaseCondition = "current_phase = 'completed' OR status = 'completed'";
  }

  const dateClause = getDateFilterClause(dateFilter, 'updated_at');

  const query = `
    SELECT 
        external_id, lead_serial_number, lead_name, email, phone, event_type, event_date, location, 
        current_phase, status, created_at, updated_at
    FROM external_leads 
    WHERE (${phaseCondition}) AND (${dateClause})
    ORDER BY updated_at DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

export const getAllClientDetails = async () => {
  const query = `
    SELECT *
    FROM external_leads 
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getAllEmployees = async () => {
  const query = `
    SELECT employee_id, first_name, last_name, role 
    FROM employees
    ORDER BY first_name ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getEmployeeAttendanceReport = async () => {
  const query = `
    SELECT 
      ea.attendance_id,
      ea.employee_id,
      ea.date,
      ea.check_in,
      ea.check_out,
      ea.status,
      e.first_name,
      e.last_name,
      e.role
    FROM employees_attendance ea
    LEFT JOIN employees e ON ea.employee_id = CAST(REPLACE(e.employee_id, 'EMP-', '') AS INTEGER)
    ORDER BY ea.date DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getEmployeeLeaveReport = async () => {
  const query = `
    SELECT 
      el.leave_request_id,
      el.employee_id,
      el.leave_type,
      el.from_date,
      el.to_date,
      el.no_of_days,
      el.status,
      el.reason,
      el.created_at,
      e.first_name,
      e.last_name,
      e.role
    FROM employee_leave_requests el
    LEFT JOIN employees e ON e.employee_id = el.employee_id
    ORDER BY el.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getEmployeeWorkReport = async () => {
  // Since lead_employee doesn't exist in this DB, we aggregate tasks for all employees
  const employeesQuery = `SELECT employee_id, first_name, last_name, role FROM employees`;
  const employeesRes = await pool.query(employeesQuery);
  const employees = employeesRes.rows;

  let allWork: any[] = [];

  for (const emp of employees) {
    const tasks = await getMyWorkQuery(emp.employee_id);
    const empTasks = tasks.map(t => ({
      lead_employee_id: t.lead_employee_id,
      lead_id: t.lead_id,
      lead_name: t.client || t.lead_name || t.lead_code,
      employee_id: emp.employee_id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      role: emp.role,
      task_name: t.name || t.task_name,
      status: t.status || 'Pending',
      priority: t.priority || '-',
      deadline: t.deadline,
      created_at: t.created_at
    }));
    allWork = [...allWork, ...empTasks];

    // Also fetch Post-production tasks from assigned_projects
    const { getAssignedProjectsByEmployeeQuery } = require('../queries/project.query');
    const postProdProjects = await getAssignedProjectsByEmployeeQuery(emp.employee_id);
    const postProdTasks = postProdProjects.map((p: any) => ({
      lead_employee_id: `${emp.employee_id}-${p.project_type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      lead_id: p.project_id,
      lead_name: p.project_name,
      employee_id: emp.employee_id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      role: emp.role,
      task_name: p.project_type,
      status: p.status,
      priority: p.priority_level,
      deadline: p.created_at,
      created_at: p.created_at,
      task_count: p.task_count
    }));
    allWork = [...allWork, ...postProdTasks];
  }

  // Sort by newest assigned first
  allWork.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return allWork;
};

export const getSingleClientReport = async (clientId: string) => {
  const report = await getMasterAdminClientReport(clientId);
  return report;
};

export const getSingleEmployeeReport = async (employeeId: string) => {
  const empNumeric = employeeId.replace('EMP-', '');

  const queryEmp = `SELECT * FROM employees WHERE employee_id = $1 OR employee_id = $2`;
  const empRes = await pool.query(queryEmp, [employeeId, `EMP-${empNumeric}`]);
  const employee = empRes.rows[0];

  let tasks = await getMyWorkQuery(employeeId);

  if (tasks.length === 0 && employee) {
    if (employee.role === 'Data Manager') {
      const { getIncomingDataQuery } = require('../queries/dataManager.query');
      const incomingLeads = await getIncomingDataQuery();
      tasks = incomingLeads.map((lead: any) => ({
        lead_code: lead.id,
        client: lead.client,
        type: lead.type,
        task_name: 'Incoming Data Verification',
        flow_stage: 'Event',
        status: lead.status || 'Pending Verification',
        deadline: lead.event_date
      }));
    } else if (employee.role === 'Operational Manager') {
      const result = await pool.query(`SELECT external_id, lead_serial_number, lead_name, event_type, event_date, phase_status FROM external_leads WHERE current_phase = 'post_production'`);
      tasks = result.rows.map((lead: any) => ({
        lead_code: lead.lead_serial_number || lead.external_id,
        client: lead.lead_name,
        type: lead.event_type,
        task_name: 'Post-production Management',
        flow_stage: 'Post-production',
        status: lead.phase_status || 'In Progress',
        deadline: lead.event_date
      }));
    } else if (employee.role === 'Post-production CRM' || employee.role === 'CRM') {
      const result = await pool.query(`SELECT external_id, lead_serial_number, lead_name, event_type, event_date, phase_status FROM external_leads WHERE assigned_post_prod_crm_id = $1 OR assigned_post_prod_crm_id = $2`, [employeeId, empNumeric]);
      tasks = result.rows.map((lead: any) => ({
        lead_code: lead.lead_serial_number || lead.external_id,
        client: lead.lead_name,
        type: lead.event_type,
        task_name: 'CRM Management',
        flow_stage: 'Post-production',
        status: lead.phase_status || 'Assigned',
        deadline: lead.event_date
      }));
    }
  }

  // Fetch Post-production projects from assigned_projects table for editors
  const { getAssignedProjectsByEmployeeQuery } = require('../queries/project.query');
  const postProdProjects = await getAssignedProjectsByEmployeeQuery(employeeId);
  const mappedPostProdTasks = postProdProjects.map((p: any) => ({
    lead_code: p.project_id,
    client: p.project_name,
    type: p.event_type,
    flow_stage: 'Post-production',
    task_name: p.project_type,
    priority: p.priority_level,
    status: p.status,
    deadline: p.created_at,
    description: '-',
    admin_notes: p.admin_notes,
    upload_link: p.upload_link,
    task_count: p.task_count
  }));
  
  tasks = [...tasks, ...mappedPostProdTasks];

  const queryAttendance = `
    SELECT * FROM employees_attendance 
    WHERE employee_id = $1
    ORDER BY date DESC
  `;
  const attendance = await pool.query(queryAttendance, [parseInt(empNumeric) || 0]);

  const queryLeaves = `
    SELECT * FROM employee_leave_requests
    WHERE employee_id = $1 OR employee_id = $2
    ORDER BY created_at DESC
  `;
  const leaves = await pool.query(queryLeaves, [employeeId, `EMP-${empNumeric}`]);

  return {
    employee,
    tasks,
    attendance: attendance.rows,
    leaves: leaves.rows
  };
};
