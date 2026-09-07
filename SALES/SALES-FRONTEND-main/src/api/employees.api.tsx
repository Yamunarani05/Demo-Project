import { api } from "./axios";

export const EmployeeAPI = {
  getEmployees: (page = 0, limit = 10, search = "") =>
    api.get("/employees", { params: { page, limit, search } }),

  getEmployeeById: (id: number) =>
    api.get(`/employees/${id}`),

  getLeaveRequests: (page = 0, limit = 10, search = "") =>
    api.get("/employees/leave", {
      params: { page, limit, search },
    }),

  approveLeave: (leaveRequestId: number) =>
    api.put(`/employees/leave/approval/${leaveRequestId}`, {
      status: "Approved",
    }),

  rejectLeave: (leaveRequestId: number) =>
    api.put(`/employees/leave/approval/${leaveRequestId}`, {
      status: "Rejected",
    }),

createEmployee: (data: FormData) =>
  api.post("/employees", data),


  deleteEmployee(employeeId: number) {
  return api.delete(`/admin/employees/${employeeId}`);
},

// src/api/employees.api.ts
updateEmployee(
  employeeId: number,
  data: {
    firstName: string;
    lastName: string;
    contactNumber: string;
    position: string;
    commission: string;
    workLocation: string;
  }
) {
  return api.put(`/admin/employees/${employeeId}`, data);
}


};
