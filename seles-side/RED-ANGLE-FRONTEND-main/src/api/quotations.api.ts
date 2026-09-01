// src/api/quotations.api.ts
import api from "../api/api";

export interface QuotationPackage {
  id: number;
  leadId?: number;
  eventId?: number;
  serviceName: string;
  description?: string;
  price: number;
  serviceProvided?: string;
  quantity?: number;
  comboId?: number;
  terms?: number;
  imageUrl?: string;
  createdBy: number;   // ✅ FIXED (camelCase)
}



export interface CreateQuotationForm {
  packageId: number | null;      // selected invoice package id (frontend only)
  packageName: string;           // invoice package title -> maps to serviceName
  serviceProvided: string;
  email: string;
  quantity: string;
  contactNumber: string;
  address: string;
  eventType: string;
  paymentTerms: string;
  budget: string;
  eventDate: string;
  assignee: string;
  description: string;
}

export interface SendQuotationForm {
  leadId: number | "";
  eventId: number | "";
  status: "Pending" | "Approved" | "Rejected";
  notes: string;
  discount?: number | "";
  taskId?: number;
}

// /api/invoices/packages response
export interface InvoicePackage {
  id: number;
  packageTitle: string;
  packageType: string;
  price: number | string;
  imageUrl?: string | null;
  description?: string | null;
  items?: {
    id: number;
    name: string;
    category: string;
    quantity: number;
    price: number | string;
  }[];
}

export interface CreateInbuiltQuotationPayload {
  packageId: number;
  quantity?: number;
  description?: string;
  terms?: number;
  imageUrl?: string;
  items?: { name: string; category: string; quantity: number; price?: number | "" }[];
}


export const QuotationsAPI = {
  // GET /api/quotations?page=&limit=&combo=
  async getPackages(page: number, limit: number, comboId?: number) {
    const res = await api.get("/quotations", {
      params: {
        page,
        limit,
        combo: comboId,
      },
    });

    console.log("GET /quotations response", res.data);

    const raw = res.data?.data ?? res.data ?? [];
    const list = Array.isArray(raw) ? raw : [];

    return list as QuotationPackage[];
  },

  // GET /api/invoices/packages
  async getInvoicePackages() {
    const res = await api.get("/invoices/packages");
    console.log("GET /invoices/packages response", res.data);
    const raw = res.data?.data ?? res.data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list as InvoicePackage[];
  },

  // GET /api/quotations?leadId=
  async getQuotationsByLead(leadId: number) {
    const res = await api.get("/quotations", {
      params: {
        leadId,
        page: 1,
        limit: 100,
      },
    });

    const raw = res.data?.data ?? res.data ?? [];
    return Array.isArray(raw) ? raw : [];
  },



  // POST /api/quotations
  async createQuotation(
    payload: CreateInbuiltQuotationPayload
  ) {
    const res = await api.post("/quotations", payload);
    return res.data.data as QuotationPackage;
  },

  // POST /api/quotations/send
  async sendQuotation(form: SendQuotationForm, quotationId: number) {
    const payload = {
      leadId: form.leadId,
      quotationId,
      notes: form.notes,
      data: {
        notes: form.notes,
        status: form.status.toLowerCase(),
        discount: form.discount,
        taskId: form.taskId,
      },
    };
    const res = await api.post("/quotations/send", payload);
    return res.data.data;
  },

  // POST /api/quotations/upload-image
  async uploadQuotationImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await api.post(
      "/quotations/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.data.imageUrl as string;
  },

  // DELETE /api/quotations/:quotationId
  async deleteQuotation(quotationId: number) {
    const res = await api.delete(`/quotations/${quotationId}`);
    return res.data.data;
  },

  async getAdminQuotations(page = 1, limit = 100) {
    const res = await api.get("/quotations", {
      params: { page, limit },
    });

    const raw = res.data?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  },
  // CREATE PACKAGE
  async createPackage(payload: {
    packageTitle: string;
    packageType: string;
    price: number;
    imageFile?: File | null;
    items?: {
      name: string;
      category: string;
      quantity: number;
      price: number;
    }[];
  }) {
    const formData = new FormData();

    formData.append("packageTitle", payload.packageTitle);
    formData.append("packageType", payload.packageType);
    formData.append("price", payload.price.toString());

    if (payload.imageFile) {
      formData.append("image", payload.imageFile);
    }

    if (payload.items) {
      formData.append("items", JSON.stringify(payload.items));
    }

    const res = await api.post("/invoices/packages", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.data;
  },

  // UPDATE PACKAGE
  async updatePackage(
    packageId: number,
    payload: {
      packageTitle: string;
      packageType: string;
      price: number;
      description?: string;
      imageUrl?: string;
      imageFile?: File | null;
      items?: {
        name: string;
        category: string;
        quantity: number;
        price: number;
      }[];
    }
  ) {
    const formData = new FormData();

    formData.append("packageTitle", payload.packageTitle);
    formData.append("packageType", payload.packageType);
    formData.append("price", payload.price.toString());

    if (payload.imageUrl) {
      formData.append("imageUrl", payload.imageUrl);
    }

    if (payload.imageFile) {
      formData.append("image", payload.imageFile);
    }

    if (payload.items) {
      formData.append("items", JSON.stringify(payload.items));
    }

    const res = await api.put(`/invoices/packages/${packageId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.data;
  },

  // DELETE PACKAGE
  async deletePackage(packageId: number) {
    const res = await api.delete(`/invoices/packages/${packageId}`);
    return res.data;
  },



};