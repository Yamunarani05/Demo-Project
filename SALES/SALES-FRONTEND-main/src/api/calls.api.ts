import api from "../api/api";

export interface CallRequirement {
  id: number;
  leadId: number;
  notes?: string | null;
  callTime: string;
  createdAt?: string;
}

export const CallsAPI = {
  async getLatestRequirementForLead(leadId: number) {
    const res = await api.get(
      `/calls/lead/${leadId}/latest-requirement`
    );

    const raw = res.data?.data ?? [];
    return raw.length ? raw[0] : null;
  },
};
