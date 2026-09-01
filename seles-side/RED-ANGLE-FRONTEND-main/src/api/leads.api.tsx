// src/api/leads.api.tsx
import { api } from "./axios";

export interface Lead {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}


export interface PartnerAssignedTask {
  taskId: number;
  taskName?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  assignedBy?: {
    userId: number;
    email?: string;
    role?: string;
  };
  lead?: {
    leadId: number;
    leadName?: string;
    email?: string;
    contactNumber?: string;
    budget?: string;
    currentStage?: string;
    status?: string;
    createdAt?: string;
  };
}


export interface PartnerAssignedLead {
  leadId: number;
  leadName: string;
  source?: string;
  status?: string;
  tasks?: PartnerAssignedTask[];
}


export const LeadsAPI = {
  getLeads: (page = 1, limit = 10, search = "") =>
    api.get("/leads", {
      params: { page, limit, search },
    }),

  getAllLeads: (search = "") =>
    api.get("/leads/all", {
      params: { search },
    }),

  getLeadById: (leadId: number) => api.get(`/leads/${leadId}`),

  createLead: (data: any) => api.post("/leads", data),

  updateLead: (leadId: number, data: any, updatedBy: number) =>
    api.put(`/leads/${leadId}`, {
      ...data,
      updatedBy
    }),

  deleteLead: (leadId: number) => api.delete(`/leads/${leadId}`),
  deleteLeadPermanently: (leadId: number) => api.delete(`/leads/${leadId}/permanent`),

  assignEmployee: (data: any) => api.post("/leads/assign-employee", data),

  getEmployeeLeads: (employeeId: number) =>
    api.get(`/leads/employee/${employeeId}`),

  updateAssignEmployee: (leadId: number, employeeId: number) =>
    api.put("/leads/update-assign-employee", {
      leadId,
      employeeId,
    }),

  getPartnerAssignedLeads: () =>
    api.get<{ data: PartnerAssignedLead[] }>(
      "/leads/partner/assigned-leads"
    ),



  bulkCreate: (leads: any[]) => api.post("/leads/bulk", { leads }),
};
