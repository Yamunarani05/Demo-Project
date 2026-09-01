// Services/LeadService.ts
export interface Lead {
  leadId: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  eventType?: string | null;
  leadSource?: string | null;
  priority?: string | null;
  budget?: string | null;
  eventDate?: string | null;
  description?: string | null;
  status?: string | null;
  currentStage?: string | null;
}

export interface MonthWiseLeads {
  month: string;           // "2025-01"
  totalLeads: number;
  finalizedLeads: number;
}

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;

  console.log(`🌐 API Request to port 9000: ${options.method || 'GET'} ${url}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(typeof options.headers === 'object' && options.headers !== null && !Array.isArray(options.headers) ? (options.headers as Record<string, string>) : {}),
  };


  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Using token from localStorage');
  } else {
    console.warn('⚠️ No token found in localStorage');
  }

  try {
    const response = await fetch(url, { ...options, headers });

    console.log(`📥 Response from port 9000: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    console.log('✅ Response data received from port 9000');
    return data;

  } catch (error: any) {
    console.error('❌ API Error connecting to port 9000:', error);

    if (error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to backend at http://localhost:9000. Please ensure backend is running on port 9000.`);
    }

    throw error;
  }
}

export interface PaginatedLeadsResult {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
}

export async function listLeadsPaginated({ 
  page = 1,
  limit = 10,
  search = ''
} = {}): Promise<PaginatedLeadsResult> {
  console.log('📊 Fetching leads from port 9000:', { page, limit, search });

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search
  });

  try {
    const response = await request(`/api/leads?${params.toString()}`);

    console.log('📦 Raw response from backend (port 9000):', response);

    // IMPORTANT: Your backend returns { success: true, data: [...] }
    // Extract items from response.data
    const items = response.data || response.items || [];
    const total = response.total || items.length;

    return {
      items,
      total,
      page: response.page || page,
      limit: response.limit || limit,
    };

  } catch (error) {
    console.error('❌ Error fetching from port 9000:', error);
    throw error;
  }
}

// Partner – get leads created by partner AND assigned by admin

// Partner – get leads created by partner AND assigned by admin
export async function getPartnerAssignedLeads() {
  console.log('👤 Partner: fetching assigned leads from port 9000');

  try {
    const response = await request('/api/leads/partner/assigned-leads');

    // backend returns: { success: true, data: [...] }
    return response;
  } catch (error) {
    console.error('❌ Error fetching partner assigned leads:', error);
    throw error;
  }
}


export async function createLead(data: Partial<Lead>) {
  console.log('➕ Creating lead on port 9000:', data);
  return request('/api/leads', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// 📈 Month-wise leads for dashboard graph
export async function getMonthWiseLeads(startDate?: string, endDate?: string): Promise<MonthWiseLeads[]> {
  console.log('📈 Fetching month-wise leads for graph from port 9000');

  try {
    // Build URL with optional query params
    let url = '/api/leads/channel/me/month-wise';
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    if (Object.keys(params).length > 0) {
      url += '?' + new URLSearchParams(params).toString();
    }

    const response = await request(url);

    // backend returns: { success: true, data: [...] }
    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching month-wise leads:', error);
    throw error;
  }
}

export async function updateLead(id: string | number, data: Partial<Lead>) {
  console.log(`✏️ Updating lead ${id} on port 9000:`, data);
  return request(`/api/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

// Test backend connection
export async function testBackendConnection() {
  console.log('🧪 Testing backend connection to port 9000...');
  try {
    const response = await fetch('http://localhost:9000', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  request,
  listLeadsPaginated,
  getMonthWiseLeads,
  createLead,
  updateLead,
  testBackendConnection,
};

