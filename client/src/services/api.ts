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
  getMasterNotifications: () => fetchJson<{ success: boolean; data: any[] }>('/master/notifications'),
  markMasterNotificationRead: (id: string) => fetchJson<{ success: boolean }>(`/master/notifications/${id}/read`, { method: 'PUT' }),
  markAllMasterNotificationsRead: () => fetchJson<{ success: boolean }>('/master/notifications/read-all', { method: 'PUT' }),
  clearMasterNotifications: () => fetchJson<{ success: boolean }>('/master/notifications', { method: 'DELETE' }),
};
