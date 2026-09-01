import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export interface PublicQuotationResponse {
  quotation: {
    serviceName: string;
    description?: string;
    price: number;
    quantity?: number;
    imageUrl?: string;
  };
  lead: {
    leadId: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    eventType?: string;
  };
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface AddOnServiceResponse {
  id: number;
  name: string;
  unitLabel: string;
  defaultQty: number;
  price: string; // backend sends string
  isActive: boolean;
  createdAt: string;
}

export const QuotationPublicAPI = {
  // GET /quotations/view/:token
  viewQuotation(token: string) {
    return publicApi.get<{ data: PublicQuotationResponse }>(
      `/quotations/view/${token}`
    );
  },

  // GET /quotations/addons
  getAddOns() {
    return publicApi.get<{ data: AddOnServiceResponse[] }>(
      "/quotations/addons",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  },

  // POST /quotations/leads/:leadId/addons
addAddOnsToLead(
  leadId: number,
  payload: { addons: { addonServiceId: number; quantity?: number; category?: string }[] }
) {
  return publicApi.post(`/quotations/leads/${leadId}/addons`, payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
},

  // // POST /quotations/public/:token/addons
  // addAddOn(
  //   token: string,
  //   payload: {
  //     addonServiceId: number;
  //     quantity: number;
  //   }
  // ) {
  //   return publicApi.post(
  //     `/quotations/leads/${token}/addons`,
  //     payload
  //   );
  // },

  // PUT /quotations/:token/status
  updateStatus(token: string, status: "approved" | "rejected") {
    return publicApi.put(`/quotations/public/${token}/status`, { status });
  },

  // POST /quotation-issues/token/:token
  raiseIssue(
    token: string,
    payload: { issueTitle: string; description?: string }
  ) {
    return publicApi.post(
      `/quotation-issues/token/${token}`,
      payload
    );
  },
};
