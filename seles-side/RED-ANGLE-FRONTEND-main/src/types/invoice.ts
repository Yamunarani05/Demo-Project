// src/types/invoice.ts

export interface PackageItem {
  id: number;
  packageTitle: string;
  packageType: string;
  price: string;
}

export interface PackageInvoiceItem {
  unit: number;
  package: {
    id?: number;
    packageTitle: string;
    packageType: string;
    price: string; // backend returns string price
  };
}

export interface LeadAddonItem {
  addonServiceId: number;
  quantity: number;
  price?: string;
  total?: string;
  addonService?: {
    name: string;
  };
}

export interface InvoiceDetail {
  invoiceId: number;
  token: string;
  totalPrice?: number;
  paid?: number;

  discount?: number;
  billingDate: string;
  status: string;
  plan: string;
  billNo?: string;
  totalAmount?: number;

  lead?: {
    leadId: number;
    firstName: string;
    lastName: string;
    contactNumber: string;
    email?: string;
    eventType?: string;
    eventDate?: string;
  };

  packageInvoices?: PackageInvoiceItem[];

  // ✅ ADD THESE TWO
  leadAddons?: LeadAddonItem[];
  addons?: LeadAddonItem[];

  itemsByCategory?: Record<
    string,
    {
      id?: number;
      name: string;
      quantity: number;
    }[]
  >;
}


export interface InvoiceLeadRow {
  leadId: number;
  firstName: string;
  lastName: string;
  contactNumber: string;
  currentStage: string;
  eventType?: string;
  leadEmployee: {
    taskName?: string;
    employee: { firstName: string; lastName: string };
  }[];
  invoices: {
    invoiceId: number;
    billingDate: string;
    plan: string;
    status: string;
  }[];
}
