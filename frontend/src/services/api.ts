// Great Master API Client with resilient local fallback

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export interface DemoRequestPayload {
  name: string;
  email: string;
  company?: string;
  team_size?: string;
  plan_interest?: string;
  notes?: string;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('demo_auth_token') : null;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `API error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`API call to ${endpoint} failed:`, err?.message || err);
    throw err;
  }
}

export const api = {
  // Auth
  getPersonas: () => fetchJson<{ success: boolean; data: any[] }>('/auth/personas'),
  registerStudio: (data: any) => fetchJson<{ success: boolean; token: string; user: any; studio: any; message: string }>('/auth/register-studio', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data: any) => fetchJson<{ success: boolean; token: string; user: any; studio?: any; client?: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: (params?: { role?: string; studioId?: string; clientId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; user: any; studio?: any; client?: any }>(`/auth/me?${query}`);
  },

  // Studios
  getStudios: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/studios?${query}`);
  },
  getStudio: (id: string) => fetchJson<{ success: boolean; data: any }>(`/studios/${id}`),
  createStudio: (data: any) => fetchJson<{ success: boolean; data: any; message: string }>('/studios', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStudioStatus: (id: string, status: string, reason?: string) => fetchJson<{ success: boolean; data: any; message: string; emailSent?: boolean }>(`/studios/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason }),
  }),

  // Clients
  getClients: (params?: { studioId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/clients?${query}`);
  },
  getClient: (id: string) => fetchJson<{ success: boolean; data: any }>(`/clients/${id}`),
  createClient: (data: any) => fetchJson<{ success: boolean; data: any; message: string }>('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateClient: (id: string, data: any) => fetchJson<{ success: boolean; data: any; message: string }>(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Shoots & 14-Stage Workflow
  getShoots: (params?: { studioId?: string; status?: string; type?: string; photographerId?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/shoots?${query}`);
  },
  getShoot: (id: string) => fetchJson<{ success: boolean; data: any }>(`/shoots/${id}`),
  createShoot: (data: any) => fetchJson<{ success: boolean; data: any; message: string }>('/shoots', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateShootStatus: (id: string, data: { status: string; notes?: string; actorName?: string; actorRole?: string }) =>
    fetchJson<{ success: boolean; data: any; message: string }>(`/shoots/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateShoot: (id: string, data: any) => fetchJson<{ success: boolean; data: any; message: string }>(`/shoots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  sendShootForReview: (id: string) => fetchJson<{ success: boolean; data: any; message: string }>(`/shoots/${id}/send-review`, {
    method: 'POST',
  }),
  approveShoot: (id: string) => fetchJson<{ success: boolean; data: any; message: string }>(`/shoots/${id}/approve`, {
    method: 'POST',
  }),

  // Photographers & Scheduling
  getPhotographers: (params?: { studioId?: string; availability?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/photographers?${query}`);
  },
  getPhotographer: (id: string) => fetchJson<{ success: boolean; data: any }>(`/photographers/${id}`),
  checkPhotographerAvailability: (photographerId: string, shootDate: string, currentShootId?: string) =>
    fetchJson<{ success: boolean; isAvailable: boolean; conflictingShoots: any[]; message: string }>('/photographers/check-availability', {
      method: 'POST',
      body: JSON.stringify({ photographerId, shootDate, currentShootId }),
    }),
  createPhotographer: (data: any) => fetchJson<{ success: boolean; data: any; message: string }>('/photographers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePhotographer: (id: string, data: any) => fetchJson<{ success: boolean; data: any; message: string }>(`/photographers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Galleries & Photos
  getShootGallery: (shootId: string, params?: { category?: string; filter?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; shoot: any; data: any[]; summary: any }>(`/galleries/shoot/${shootId}?${query}`);
  },
  uploadPhoto: (data: any) => fetchJson<{ success: boolean; data: any; message: string }>('/galleries/photos', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  togglePhotoFavorite: (photoId: string) => fetchJson<{ success: boolean; isFavorite: boolean; message: string }>(`/galleries/photos/${photoId}/favorite`, {
    method: 'PUT',
  }),
  togglePhotoSelection: (photoId: string) => fetchJson<{ success: boolean; isSelected: boolean; selectedCount: number; message: string }>(`/galleries/photos/${photoId}/select`, {
    method: 'PUT',
  }),
  addPhotoComment: (photoId: string, data: { text: string; authorName?: string; authorRole?: string }) =>
    fetchJson<{ success: boolean; data: any; message: string }>(`/galleries/photos/${photoId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Deliverables
  getDeliverables: (params?: { shootId?: string; studioId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/deliverables?${query}`);
  },
  createDeliverable: (data: any) => fetchJson<{ success: boolean; data: any; message: string }>('/deliverables', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateDeliverableStatus: (id: string, status: string) => fetchJson<{ success: boolean; data: any; message: string }>(`/deliverables/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  // Payments & Invoices
  getPayments: (params?: { studioId?: string; clientId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; summary: any }>(`/payments?${query}`);
  },
  createPayment: (data: any) => fetchJson<{ success: boolean; data: any; message: string }>('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Dashboards
  getSuperAdminDashboard: () => fetchJson<{ success: boolean; data: any }>('/dashboard/super-admin'),
  getStudioDashboard: (studioId: string) => fetchJson<{ success: boolean; data: any }>(`/dashboard/studio/${studioId}`),
  getClientDashboard: (clientId: string) => fetchJson<{ success: boolean; data: any }>(`/dashboard/client/${clientId}`),

  // Calendar
  getCalendarEvents: (params?: { studioId?: string; photographerId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/calendar?${query}`);
  },

  // Notifications
  getNotifications: (params?: { studioId?: string; role?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; unreadCount: number }>(`/notifications?${query}`);
  },
  markNotificationRead: (id: string) => fetchJson<{ success: boolean; message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => fetchJson<{ success: boolean; message: string }>('/notifications/read-all', { method: 'PUT' }),

  // Global Search
  search: (q: string, studioId?: string) => {
    const params: any = { q };
    if (studioId && studioId !== 'all') params.studioId = studioId;
    const query = new URLSearchParams(params).toString();
    return fetchJson<{ success: boolean; query: string; totalCount: number; data: any }>(`/search?${query}`);
  },

  // Activity Logs
  getActivityLogs: (params?: { studioId?: string; shootId?: string; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/activity-logs?${query}`);
  },

  // Landing Page Forms
  submitContact: (data: ContactPayload) => fetchJson<{ success: boolean; message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  submitDemoRequest: (data: DemoRequestPayload) => fetchJson<{ success: boolean; message: string }>('/demo-request', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  subscribeNewsletter: (email: string) => fetchJson<{ success: boolean; message: string }>('/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  // Master Admin (Unified Great Master Platform)
  getMasterDashboard: () => fetchJson<{ success: boolean; data: any }>('/master/dashboard'),
  getMasterClients: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/master/clients${query ? `?${query}` : ''}`);
  },
  getMasterPreproduction: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/master/preproduction${query ? `?${query}` : ''}`);
  },
  getMasterClient: (id: string) => fetchJson<{ success: boolean; data: any }>(`/master/clients/${id}`),
  getMasterClientEmployees: (id: string) => fetchJson<{ success: boolean; data: any[] }>(`/master/clients/${id}/employees`),
  getMasterClientWorkTracker: (id: string) => fetchJson<{ success: boolean; data: any[] }>(`/master/clients/${id}/work-tracker`),
  getMasterClientInvoices: (id: string) => fetchJson<{ success: boolean; data: any[] }>(`/master/clients/${id}/invoice`),
  getMasterClientAttendance: (id: string) => fetchJson<{ success: boolean; data: any[] }>(`/master/clients/${id}/attendance`),
  getMasterClientReport: (id: string) => fetchJson<{ success: boolean; data: any }>(`/master/clients/${id}/report`),
  getMasterEmployees: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/master/employees${query ? `?${query}` : ''}`);
  },
  getMasterEmployee: (id: string) => fetchJson<{ success: boolean; data: any }>(`/master/employees/${id}`),
  updateMasterEmployee: (id: string, data: any) => fetchJson<{ success: boolean; data: any }>(`/master/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteMasterEmployee: (id: string) => fetchJson<{ success: boolean; data: any }>(`/master/employees/${id}`, {
    method: 'DELETE',
  }),
  getMasterWorkTracker: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/master/work-tracker${query ? `?${query}` : ''}`);
  },
  getMasterInvoices: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/master/invoices${query ? `?${query}` : ''}`);
  },
  getMasterAttendance: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/master/attendance${query ? `?${query}` : ''}`);
  },
  getMasterReports: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchJson<{ success: boolean; data: any }>(`/master/reports${query ? `?${query}` : ''}`);
  },
  getMasterActivity: (params?: { studioId?: string; type?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/master/activity${query ? `?${query}` : ''}`);
  },
  // Master Admin Request Approval / Rejection / Payment Requests
  approveMasterRequest: (studioId: string) =>
    fetchJson<{ success: boolean; message: string; emailSent?: boolean; data: any }>(`/master/requests/${studioId}/approve`, {
      method: 'PUT',
    }),
  rejectMasterRequest: (studioId: string, reason?: string) =>
    fetchJson<{ success: boolean; message: string; emailSent?: boolean; data: any }>(`/master/requests/${studioId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),
  requestPayment: (studioId: string) =>
    fetchJson<{ success: boolean; message: string; emailSent?: boolean; data: any }>(`/master/requests/${studioId}/request-payment`, {
      method: 'POST',
    }),
  getEmailHistory: (studioId?: string) => {
    const endpoint = studioId ? `/master/email-history/${studioId}` : '/master/email-history';
    return fetchJson<{ success: boolean; data: any[]; total: number }>(endpoint);
  },

  // Razorpay Payments
  createRazorpayOrder: (data: { studioId: string; amount?: number; planName?: string }) =>
    fetchJson<{ success: boolean; keyId: string; orderId: string; amount: number; amountInPaise: number; currency: string; studioName: string; planName: string }>('/payments/create-razorpay-order', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyRazorpayPayment: (data: { studioId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature?: string }) =>
    fetchJson<{ success: boolean; message: string; emailSent?: boolean; transaction: any; studio: any }>('/payments/verify-razorpay-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ==========================================
  // SALES & CLIENT WORKSPACE ENDPOINTS
  // ==========================================
  getSalesOverview: (params?: { studioId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any }>(`/sales/overview${query ? `?${query}` : ''}`);
  },
  getSalesLeads: (params?: { studioId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number; summary: any }>(`/sales/leads${query ? `?${query}` : ''}`);
  },
  getSalesLead: (id: string) => fetchJson<{ success: boolean; data: any; quotations: any[]; followUps: any[] }>(`/sales/leads/${id}`),
  createSalesLead: (data: any) =>
    fetchJson<{ success: boolean; data: any; message: string }>('/sales/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  bulkCreateSalesLeads: (leads: any[]) =>
    fetchJson<{ success: boolean; data: any; message: string }>('/sales/leads/bulk', {
      method: 'POST',
      body: JSON.stringify({ leads }),
    }),
  updateSalesLead: (id: string, data: any) =>
    fetchJson<{ success: boolean; data: any; message: string }>(`/sales/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  convertSalesLead: (id: string, data?: any) =>
    fetchJson<{ success: boolean; client: any; shoot: any; message: string }>(`/sales/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  getSalesFollowUps: (params?: { studioId?: string; status?: string; filter?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number; dueTodayCount: number }>(`/sales/follow-ups${query ? `?${query}` : ''}`);
  },
  createSalesFollowUp: (data: any) =>
    fetchJson<{ success: boolean; data: any; message: string }>('/sales/follow-ups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSalesFollowUp: (id: string, data: any) =>
    fetchJson<{ success: boolean; data: any; message: string }>(`/sales/follow-ups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getSalesQuotations: (params?: { studioId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/sales/quotations${query ? `?${query}` : ''}`);
  },
  getSalesQuotation: (id: string) => fetchJson<{ success: boolean; data: any }>(`/sales/quotations/${id}`),
  createSalesQuotation: (data: any) =>
    fetchJson<{ success: boolean; data: any; message: string }>('/sales/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSalesQuotation: (id: string, data: any) =>
    fetchJson<{ success: boolean; data: any; message: string }>(`/sales/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateQuotationStatus: (id: string, status: string, notes?: string) =>
    fetchJson<{ success: boolean; data: any; message: string; clientCreated?: any; shootCreated?: any }>(`/sales/quotations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
  getSalesPackages: (params?: { studioId?: string; category?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/sales/packages${query ? `?${query}` : ''}`);
  },
  getSalesClients: (params?: { studioId?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[]; total: number }>(`/sales/clients${query ? `?${query}` : ''}`);
  },
  getSalesActivities: (params?: { studioId?: string; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/sales/activities${query ? `?${query}` : ''}`);
  },
  getSalesReports: (params?: { studioId?: string; period?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any }>(`/sales/reports${query ? `?${query}` : ''}`);
  },
  getSalesInvoices: (params?: { studioId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/sales/invoices${query ? `?${query}` : ''}`);
  },
  getSalesAttendance: (params?: { studioId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/sales/attendance${query ? `?${query}` : ''}`);
  },
  getSalesApprovals: (params?: { studioId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; data: any[] }>(`/sales/approvals${query ? `?${query}` : ''}`);
  },
  updateSalesApprovalStatus: (id: string, status: string) =>
    fetchJson<{ success: boolean; data: any; message: string }>(`/sales/approvals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateSalesInvoiceStatus: (id: string, approvalStatus: string) =>
    fetchJson<{ success: boolean; data: any; message: string }>(`/sales/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ approvalStatus }),
    }),
};
