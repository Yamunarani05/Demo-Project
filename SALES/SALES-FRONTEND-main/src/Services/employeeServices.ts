// src/Services/employeeServices.ts
import apiClient from './apiClient';

export const employeeServices = {
  // GET /api/employees?page=0&limit=8&search=...
  async fetchEmployees(page: number, limit: number, search: string) {
    const params: any = { page, limit };
    if (search && search.trim()) params.search = search.trim();

    const res = await apiClient.get('/employees', { params });

    // backend: { success, employees: { employees: [...], total } }
    const employeesData = res.data?.employees;
    const employeesArray = employeesData?.employees ?? [];
    const totalCount = employeesData?.total ?? 0;

    return {
      employees: employeesArray,
      total: totalCount,
    };
  },

  // POST /api/employees  (admin must be logged in, token in apiClient)
  async createEmployee(payload: any) {
    return apiClient.post('/employees', payload);
  },
};
