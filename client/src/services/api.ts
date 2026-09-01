// Client API Service for Demo Project Backend

const API_BASE = '/api';

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

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export const api = {
  async submitContact(payload: ContactPayload): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit contact request');
      }
      return data;
    } catch (err: any) {
      console.error('Contact API error:', err);
      throw err;
    }
  },

  async submitDemoRequest(payload: DemoRequestPayload): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/demo-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit demo request');
      }
      return data;
    } catch (err: any) {
      console.error('Demo request API error:', err);
      throw err;
    }
  },

  async subscribeNewsletter(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }
      return data;
    } catch (err: any) {
      console.error('Newsletter API error:', err);
      throw err;
    }
  },

  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      return await response.json();
    } catch (err) {
      return { status: 'offline', error: err };
    }
  },
};
