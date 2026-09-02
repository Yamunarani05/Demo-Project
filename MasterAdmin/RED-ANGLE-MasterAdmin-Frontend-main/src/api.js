import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011/api'

const client = axios.create({ baseURL: API_URL })

client.interceptors.request.use(config => {
  const token = localStorage.getItem('master_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('master_admin_token')
      localStorage.removeItem('master_admin_user')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const params = filters => {
  const search = new URLSearchParams()
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value && value !== 'all') search.set(key, value)
  })
  return search.toString()
}

const get = async (path, filters) => {
  const query = params(filters)
  const response = await client.get(`${path}${query ? `?${query}` : ''}`)
  return response.data.data
}

const expandInvoices = (clients) => {
  if (!Array.isArray(clients)) return clients;
  return clients.flatMap(client => {
    let parsed = [];
    try {
      parsed = typeof client.invoiceData === 'string' ? JSON.parse(client.invoiceData || '[]') : (client.invoiceData || []);
    } catch(e) { parsed = []; }
    if (!Array.isArray(parsed)) parsed = [parsed];
    if (parsed.length === 0) return [client];

    return parsed.map(inv => ({
      ...client,
      invoiceId: inv.invoiceId || client.invoiceId,
      total: inv.totalAmount || 0,
      paid: inv.paid || 0,
      balance: inv.balance || 0,
      status: (inv.balance <= 0 && inv.totalAmount > 0) ? 'Paid' : (inv.paid > 0 ? 'Partial' : 'Pending'),
      invoiceData: JSON.stringify(inv)
    }));
  });
};

export const api = {
  login: body => client.post('/auth/login', body).then(res => res.data.data),
  verify: () => client.get('/auth/verify').then(res => res.data.data),
  dashboard: () => get('/master-admin/sales/dashboard'),
  clients: filters => get('/master-admin/sales/clients', filters),
  client: id => get(`/master-admin/sales/clients/${id}`),
  employees: filters => get('/master-admin/sales/employees', filters),
  employee: id => get(`/master-admin/sales/employees/${id}`),
  updateEmployee: (id, body) => client.put(`/master-admin/sales/employees/${id}`, body).then(res => res.data.data),
  deleteEmployee: id => client.delete(`/master-admin/sales/employees/${id}`).then(res => res.data.data),
  workTracker: filters => get('/master-admin/sales/work-tracker', filters),
  invoices: filters => get('/master-admin/sales/invoices', filters).then(expandInvoices),
  attendance: filters => get('/master-admin/sales/attendance', filters),
  reports: filters => get('/master-admin/sales/reports', filters),
  clientEmployees: id => get(`/master-admin/sales/clients/${id}/employees`),
  clientWorkTracker: id => get(`/master-admin/sales/clients/${id}/work-tracker`),
  clientInvoice: id => get(`/master-admin/sales/clients/${id}/invoice`).then(expandInvoices),
  clientInvoiceDetail: id => get(`/master-admin/sales/clients/${id}/invoice-detail`),
  clientAttendance: id => get(`/master-admin/sales/clients/${id}/attendance`),
  clientReport: id => get(`/master-admin/sales/clients/${id}/report`),
  notifications: () => get('/master-admin/sales/notifications'),
  markNotificationRead: (id) => client.put(`/master-admin/sales/notifications/${id}/read`).then(res => res.data),
  markAllNotificationsRead: () => client.put('/master-admin/sales/notifications/read-all').then(res => res.data),
  clearNotifications: () => client.delete('/master-admin/sales/notifications').then(res => res.data),
}
