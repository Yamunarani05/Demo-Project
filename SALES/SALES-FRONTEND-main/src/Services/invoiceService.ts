  // src/Services/invoiceService.ts
  import api from "./apiClient";

  export const invoiceService = {
    getInvoices(params: { page: number; limit: number }) {
      return api.get("/invoices", { params });
    },

    getPackages() {
      return api.get("/invoices/packages");
    },

    getInvoiceByToken(token: string) {
    return api.get(`/invoices/public/${token}`);
  },

    getInvoiceById(id: number) {
      return api.get(`/invoices/${id}`);
    },

    createInvoice(payload: {
      leadId: number;
      billingDate: string;
      plan: string;
      status?: string;
      packages: { packageId: number; status: string; unit: number }[];
    }) {
      return api.post("/invoices", payload);
    },

    updateInvoice(id: number, payload: any) {
      return api.put(`/invoices/${id}`, payload);
    },

    // Uses backend route POST /invoices/:invoiceId/send
  async sendInvoiceById(invoiceId: number) {
    const res = await api.post(`/invoices/${invoiceId}/send`);
    return res.data.data;
  },
  };

  export default invoiceService;
