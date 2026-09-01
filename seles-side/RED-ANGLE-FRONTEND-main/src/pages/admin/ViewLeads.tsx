import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Upload, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import AddLeadModal from '../../components/AddLeadModal';
import ViewLeadModal from '../../components/ViewLeadModal';
import { LeadsAPI } from '../../api/leads.api';
import Papa from "papaparse";
import * as XLSX from "xlsx";
import toast from 'react-hot-toast';

export interface Lead {
  id: string;
  leadId: string;      // backend REAL ID
  leadCode: string;    // LD4 → display only
  leadName: string;
  contactNumber: string;
  createdTime: string;
  email: string;
  leadSource: {
    type: string;
    assignee?: string;
    avatar?: string;
  };
  status: 'Done' | 'In Progress' | 'To Do' | 'In Review';
  firstName?: string;
  lastName?: string;
  address?: string;
  budget?: string;
  priority?: number;
  eventType?: string;
  eventDate?: string;
  weddingDate?: string;
  receptionDate?: string;
  assignedEmployee?: {
    id: number;
    name: string;
    role?: string;
  } | null;
  currentStage?: string;
}

const getStatusFromStage = (currentStage?: string): Lead['status'] => {
  switch (currentStage) {
    case 'Lead':
      return 'To Do';
    case 'Quotation':
      return 'In Progress';
    case 'Confirmation':
      return 'In Review';
    case 'Finalised':
      return 'Done';
    default:
      return 'In Progress';
  }
};

const parseBudget = (value: any): number | undefined => {
  if (!value) return undefined;

  const v = String(value).toLowerCase();

  // Examples:
  // "53,999_to_1l"
  // "50k_to_1l"
  // "1l"
  // "75000"

  if (v.includes("to")) {
    const parts = v.split("to");

    const min = extractNumber(parts[0]);
    const max = extractNumber(parts[1]);

    if (max) return max;       // choose upper bound
    if (min) return min;
  }

  return extractNumber(v);
};


const extractNumber = (str: string): number | undefined => {
  if (!str) return undefined;

  const cleaned = str
    .replace(/,/g, "")
    .replace(/rs|₹/g, "")
    .trim();

  if (cleaned.includes("l")) {
    const num = parseFloat(cleaned.replace("l", ""));
    return isNaN(num) ? undefined : num * 100000;
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
};


const ViewLeads = () => {
  const [selectedLead, setSelectedLead] = useState<Number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    leadSource: '',
    dateRange: '',
    assignee: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);

  const normalizeRow = (row: any) => ({
    firstName: row["First Name"] || "",
    lastName: row["Last Name"] || "",
    email: row["Email"] || "",
    contactNumber: String(row["Contact Number"] || "").trim(),
    eventType: row["Event Type"] || "",
    eventDate: row["Event Date"] || "",
    budget: row["Budget"] || "",
    leadSource: row["Lead Source"] || "",
    priority: row["Priority"] || "",
    address: row["Address"] || "",
    leadSerialNumber: row["Lead ID"] || row["lead_id"] || row["leadSerialNumber"] || "",
  });

  // Safely converts Excel serial numbers or date strings to ISO-8601
  // Excel stores dates as days since Jan 0, 1900 (with a leap-year bug for 1900).
  // The correct formula: (serialNumber - 25569) * 86400 * 1000 gives ms since Unix epoch.
  const excelSerialToDate = (serial: number): Date | undefined => {
    // Excel serial 1 = Jan 1 1900, 25569 = Jan 1 1970 (Unix epoch)
    const msFromEpoch = (serial - 25569) * 86400 * 1000;
    const d = new Date(msFromEpoch);
    // Sanity check: only accept years between 1900 and 2100
    const year = d.getUTCFullYear();
    if (isNaN(d.getTime()) || year < 1900 || year > 2100) return undefined;
    return d;
  };

  // Normalises any date string into a JS Date.
  // Handles: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, MM/DD/YYYY
  const parseDateString = (value: string): Date | undefined => {
    const str = value.trim();

    // DD-MM-YYYY or DD/MM/YYYY  (e.g. "18-05-2026" or "18/05/2026")
    const ddmmyyyy = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (ddmmyyyy) {
      const [, dd, mm, yyyy] = ddmmyyyy;
      const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
      const year = d.getUTCFullYear();
      if (!isNaN(d.getTime()) && year >= 1900 && year <= 2100) return d;
      return undefined;
    }

    // YYYY-MM-DD or YYYY/MM/DD  (e.g. "2026-05-18")
    const yyyymmdd = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (yyyymmdd) {
      const [, yyyy, mm, dd] = yyyymmdd;
      const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
      const year = d.getUTCFullYear();
      if (!isNaN(d.getTime()) && year >= 1900 && year <= 2100) return d;
      return undefined;
    }

    // M/D/YYYY or MM/DD/YYYY — xlsx raw:false US-locale format (e.g. "5/18/2026")
    const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mdy) {
      const [, mm, dd, yyyy] = mdy;
      const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
      const year = d.getUTCFullYear();
      if (!isNaN(d.getTime()) && year >= 1900 && year <= 2100) return d;
      return undefined;
    }

    // Fallback to JS built-in (handles ISO strings)
    const d = new Date(str);
    const year = d.getUTCFullYear();
    if (!isNaN(d.getTime()) && year >= 1900 && year <= 2100) return d;
    return undefined;
  };

  const parseDate = (value: any): string | undefined => {
    if (!value) return undefined;
    if (typeof value === "number") {
      const d = excelSerialToDate(value);
      return d ? d.toISOString() : undefined;
    }
    const d = parseDateString(String(value));
    return d ? d.toISOString() : undefined;
  };

  const parseEventDate = (value: any): string | undefined => {
    if (!value) return undefined;

    // Excel serial number — use correct epoch-based formula
    if (typeof value === "number") {
      const d = excelSerialToDate(value);
      return d ? d.toISOString() : undefined;
    }

    // String date — handles DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY, etc.
    const d = parseDateString(String(value));
    return d ? d.toISOString() : undefined;
  };

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (results) => {
          const rows = (results.data as any[]).filter(
            (row) => Array.isArray(row) && row.some((cell) => String(cell ?? '').trim() !== '')
          );

          if (!rows.length) {
            resolve([]);
            return;
          }

          const headerIndex = rows.findIndex((row) =>
            Array.isArray(row) && row.some((cell) => {
              const value = String(cell ?? '').trim().toLowerCase();
              return (
                value.includes('lead id') ||
                value.includes('client name') ||
                value.includes('email') ||
                value.includes('contact') ||
                value.includes('event date') ||
                value.includes('full_name') ||
                value.includes('phone') ||
                value.includes('name')
              );
            })
          );

          const realRows = headerIndex >= 0 ? rows.slice(headerIndex) : rows;
          const headerRow = realRows[0] ?? [];

          const data = realRows.slice(1).map((row: any[]) => {
            const obj: any = {};
            headerRow.forEach((header: any, index: number) => {
              const key = String(header ?? '').trim();
              if (!key) return;
              obj[key] = row[index] ?? '';
            });
            return obj;
          });

          resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array", cellDates: false });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const rows = XLSX.utils.sheet_to_json(worksheet, {
            raw: true,
            defval: "",
            header: 1,
          }) as any[];

          const validRows = rows.filter(
            (row) => Array.isArray(row) && row.some((cell) => String(cell ?? '').trim() !== '')
          );

          if (!validRows.length) {
            resolve([]);
            return;
          }

          const headerIndex = validRows.findIndex((row) =>
            Array.isArray(row) && row.some((cell) => {
              const value = String(cell ?? '').trim().toLowerCase();
              return (
                value.includes('lead id') ||
                value.includes('client name') ||
                value.includes('email') ||
                value.includes('contact') ||
                value.includes('event date') ||
                value.includes('full_name') ||
                value.includes('phone') ||
                value.includes('name')
              );
            })
          );

          const realRows = headerIndex >= 0 ? validRows.slice(headerIndex) : validRows;
          const headerRow = realRows[0] ?? [];

          const jsonData = realRows.slice(1).map((row: any[]) => {
            const obj: any = {};
            headerRow.forEach((header: any, index: number) => {
              const key = String(header ?? '').trim();
              if (!key) return;
              obj[key] = row[index] ?? '';
            });
            return obj;
          });

          resolve(jsonData as any[]);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const normalizeHeaderKey = (value: any) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const getRowValue = (row: any, keys: string[]) => {
    if (!row || typeof row !== "object") return undefined;

    const lookup = new Map<string, any>();
    Object.keys(row).forEach((key) => {
      const normalized = normalizeHeaderKey(key);
      lookup.set(normalized, row[key]);

      if (normalized.includes("client") && normalized.includes("name")) {
        lookup.set("clientname", row[key]);
      }
      if (normalized.includes("email") && normalized.includes("id")) {
        lookup.set("emailid", row[key]);
      }
      if (normalized.includes("event") && normalized.includes("date")) {
        lookup.set("eventdate", row[key]);
      }
      if (normalized.includes("overall") && normalized.includes("budget")) {
        lookup.set("overallbudget", row[key]);
      }
      if (normalized.includes("assigned") && normalized.includes("name")) {
        lookup.set("assignedname", row[key]);
      }
    });

    for (const key of keys) {
      const normalized = normalizeHeaderKey(key);

      if (lookup.has(normalized)) {
        const val = lookup.get(normalized);
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          return val;
        }
      }
    }

    for (const key of keys) {
      const normalized = normalizeHeaderKey(key);

      for (const [rowKey, value] of lookup.entries()) {
        if (rowKey.includes(normalized) || normalized.includes(rowKey)) {
          if (value !== undefined && value !== null && String(value).trim() !== "") {
            return value;
          }
        }
      }
    }

    return undefined;
  };

  const handleBulkUpload = async (file: File) => {
    const toastId = toast.loading('Uploading leads...');

    try {
      let rows: any[] = [];

      if (file.name.endsWith('.csv')) {
        rows = await parseCSV(file);
      } else {
        rows = await parseExcel(file);
      }

      if (!rows.length) {
        toast.error('File is empty ❌', { id: toastId });
        return;
      }

      const leadsPayload: any[] = [];

      rows.forEach((row, index) => {
        const isRowEmpty = !Object.values(row).some(
          val => val !== null && val !== undefined && String(val).trim() !== ''
        );
        if (isRowEmpty) return;

        const rawFirstName = getRowValue(row, ['first_name', 'first name', 'firstname', 'First Name']);
        const rawLastName = getRowValue(row, ['last_name', 'last name', 'lastname', 'Last Name']);

        let firstName: string;
        let lastName: string | undefined;

        if (rawFirstName) {
          firstName = String(rawFirstName).trim();
          lastName = rawLastName ? String(rawLastName).trim() : undefined;
        } else {
          const fullName = String(
            getRowValue(row, [
              'full_name',
              'full name',
              'fullname',
              'name',
              'customer_name',
              'client_name',
              'Client Name',
              'client name',
            ]) || ''
          ).trim();
          const [fName, ...rest] = fullName.split(' ');
          firstName = fName;
          lastName = rest.join(' ') || undefined;
        }

        const rawPhone = getRowValue(row, [
          'Phone_number',
          'phone_number',
          'Phone Number',
          'phone',
          'Mobile',
          'mobile',
          'Contact Number',
          'contact_number',
          'contactnumber',
          'Contact',
          'contact',
        ]);
        const contactNumber =
          rawPhone !== undefined && rawPhone !== null
            ? String(rawPhone)
              .replace(/\.0$/, '')
              .replace(/E\+?11/i, '')
              .trim()
            : '';

        const email = String(
          getRowValue(row, [
            'E_mail',
            'e_mail',
            'email',
            'Email',
            'Email Address',
            'email_address',
            'Email ID',
            'email id',
          ]) || ''
        ).trim();

        const finalEmail = email || '';
        const finalContact = contactNumber || '';

        // Payload with essential & extra fields mapped from Excel
        const payload: any = {
          firstName: firstName || '',
          lastName,
          email: finalEmail,
          contactNumber: finalContact,
          stages: [],
        };

        // Extract Invoice ID / Bill No
        const invoiceId = getRowValue(row, ['Invoice ID', 'invoice_id', 'bill_no', 'Invoice', 'Bill No', 'billNo']);
        if (invoiceId) payload.invoiceId = String(invoiceId).trim();

        // Extract Plan
        const plan = getRowValue(row, ['Plan', 'plan', 'Package Plan', 'package_plan']);
        if (plan) payload.plan = String(plan).trim();

        // Extract Stage
        const stage = getRowValue(row, ['Stage', 'stage', 'Current Stage', 'current_stage', 'BC']);
        if (stage) payload.stage = String(stage).trim();

        // Extract Invoice Status / Approval
        const invoiceStatus = getRowValue(row, ['Status', 'status', 'Invoice Status', 'approval_status']);
        if (invoiceStatus) payload.invoiceStatus = String(invoiceStatus).trim();

        // Extract Sales Paid / Paid Amount (Advance Paid)
        const salesPaid = parseBudget(getRowValue(row, ['Advance Paid', 'Sales Paid', 'paid_amount', 'paidAmount']));
        if (salesPaid !== undefined && salesPaid !== null) payload.paidAmount = salesPaid;

        // Extract 80% Received
        const received80 = parseBudget(getRowValue(row, ['80% Received', '80% received', '80%_received', 'received_80', 'received80', '80% Amount Received']));
        if (received80 !== undefined && received80 !== null) payload.received80 = received80;

        // Extract Package Details & Breakdown
        const packageDetails = getRowValue(row, ['Package Details', 'package details', 'package_details', 'Package Description', 'package description']);
        if (packageDetails) payload.packageDetails = String(packageDetails).trim();

        const weddingServices = getRowValue(row, ['Wedding Services', 'wedding services', 'wedding_services', 'Services', 'services']);
        if (weddingServices) payload.weddingServices = String(weddingServices).trim();

        const deliverables = getRowValue(row, ['Deliverables', 'deliverables', 'Deliverable', 'deliverable']);
        if (deliverables) payload.deliverables = String(deliverables).trim();

        const complementaryItems = getRowValue(row, ['Complementary Items', 'complementary items', 'complementary_items', 'Complementary', 'complementary']);
        if (complementaryItems) payload.complementaryItems = String(complementaryItems).trim();

        const addOns = getRowValue(row, ['Add-ons', 'add-ons', 'addons', 'Addons', 'Add-on', 'add-on']);
        if (addOns) payload.addOns = String(addOns).trim();

        const engagementVal = getRowValue(row, ['Engagement', 'engagement']);
        if (engagementVal) payload.engagement = String(engagementVal).trim();

        const weddingVal = getRowValue(row, ['Wedding', 'wedding']);
        if (weddingVal) payload.wedding = String(weddingVal).trim();

        const receptionVal = getRowValue(row, ['Reception', 'reception']);
        if (receptionVal) payload.reception = String(receptionVal).trim();

        const ritualsVal = getRowValue(row, ['Rituals', 'rituals']);
        if (ritualsVal) payload.rituals = String(ritualsVal).trim();

        // Define the production stages to track
        const productionStages = [
          'CLIENT ONBOARDING',
          'PRE PRODUCTION',
          'PRE PRODUCTION DELIVERABLES',
          'ON SPOT - EVENT COORDINATOR',
          'POST PRODUCTION',
          'FINAL DELIVERY',
        ];

        // Extract stage status from Excel columns
        productionStages.forEach((stageName) => {
          const stageValue = getRowValue(row, [
            stageName.toLowerCase(),
            stageName.replace(/ /g, '_').toLowerCase(),
            stageName.replace(/ /g, '').toLowerCase(),
          ]);

          if (stageValue) {
            payload.stages.push({
              stageName,
              status: String(stageValue).toLowerCase().trim(),
            });
          }
        });

        // If no stages found, add a default lead stage
        if (payload.stages.length === 0) {
          payload.stages.push({
            stageName: 'Lead',
            status: 'pending',
          });
        }

        // Map all optional & specialized fields if available in Excel
        const eventType = getRowValue(row, [
          'what_type_of_your_wedding?',
          'what_type_of_your_wedding',
          'event_type',
          'eventtype',
          'wedding_type',
          'Event Name',
          'event name',
          'event_name',
          'Event Type',
        ]);
        if (eventType) payload.eventType = String(eventType).trim();

        const budget = parseBudget(
          getRowValue(row, [
            'choose_your_package?',
            'choose_your_package',
            'package',
            'budget',
            'Package',
            'Overall Budget',
            'overall budget',
            'Budget',
          ])
        );
        if (budget !== undefined && budget !== null) payload.budget = budget;

        const eventDate = parseEventDate(
          getRowValue(row, [
            'enter_event_date_&_month',
            'enter_event_date_month',
            'event_date',
            'date',
            'wedding_date',
            'Event Date',
            'event date',
            'Date',
          ])
        );
        if (eventDate) payload.eventDate = eventDate;

        const weddingDate = parseEventDate(
          getRowValue(row, [
            'wedding_date',
            'Wedding Date',
            'weddingdate',
            'date_of_wedding',
            'Date of Wedding',
            'Wedding_Date',
          ])
        );
        if (weddingDate) payload.weddingDate = weddingDate;

        const receptionDate = parseEventDate(
          getRowValue(row, [
            'reception_date',
            'Reception Date',
            'receptiondate',
            'date_of_reception',
            'Date of Reception',
            'Reception_Date',
          ])
        );
        if (receptionDate) payload.receptionDate = receptionDate;

        const address = getRowValue(row, [
          'enter_your_wedding_location',
          'address',
          'location',
          'wedding_location',
          'Address',
          'Location',
          'Venue',
        ]);
        if (address) payload.address = String(address).trim();

        const leadSource = getRowValue(row, [
          'lead_source',
          'lead source',
          'Lead Source',
          'source',
          'Source',
          'leadSource',
          'Lead_Source',
        ]);
        if (leadSource) payload.leadSource = String(leadSource).trim();

        const priority = getRowValue(row, ['priority', 'Priority']);
        if (priority) payload.priority = String(priority).trim();

        const description = getRowValue(row, ['description', 'Description', 'notes', 'Notes', 'comments', 'Comments']);
        if (description) payload.description = String(description).trim();

        const leadFollowedBy = getRowValue(row, [
          'assigned_name',
          'assigned name',
          'Assigned Name',
          'ASSIGNED NAME',
          'lead_followed_by',
          'lead followed by',
          'Lead Followed By',
          'followed_by',
          'Followed By',
          'assignee',
          'Assignee',
          'Assigned Employee',
          'assigned_employee',
          'assigned employee',
          'AssignedEmp',
        ]);
        if (leadFollowedBy) payload.leadFollowedBy = String(leadFollowedBy).trim();

        const leadSerialNumber = getRowValue(row, [
          'lead_id',
          'lead id',
          'Lead ID',
          'lead_serial_number',
          'lead serial number',
          'Lead Serial Number',
          'serial_number',
          'leadSerialNumber',
        ]);
        if (leadSerialNumber) payload.leadSerialNumber = String(leadSerialNumber).trim();

        const leadType = getRowValue(row, ['lead_type', 'lead type', 'Lead Type', 'leadType']);
        if (leadType) payload.leadType = String(leadType).trim();

        const status = getRowValue(row, [
          'status',
          'Status',
          'lead_status',
          'Lead Status',
          'approval_status',
          'Approval Status',
          'invoice_status',
          'Invoice Status',
          'current_status',
          'Current Status',
          'state',
          'State'
        ]);
        if (status && String(status).trim() !== '') {
          payload.status = String(status).trim();
        }

        leadsPayload.push(payload);
      });

      if (!leadsPayload.length) {
        const firstRow = rows[0] ?? {};
        console.error('Bulk upload debug: file rows received', rows.slice(0, 3));
        console.error('Bulk upload debug: first row keys', Object.keys(firstRow));
        throw new Error(
          `No valid leads found in file. First row columns: ${Object.keys(firstRow).slice(0, 10).join(', ') || 'none'}`
        );
      }

      const res = await LeadsAPI.bulkCreate(leadsPayload);
      if (res?.data?.partialSuccess || res?.data?.failedCount > 0) {
        toast.success(`Upload completed: ${res.data.count} leads added, ${res.data.failedCount} failed`, { id: toastId, duration: 6000 });
      } else {
        const count = res?.data?.count ?? leadsPayload.length;
        toast.success(`Bulk upload successful 🎉 (${count} leads added)`, { id: toastId });
      }
      setCurrentPage(1);
      setSearchQuery('');
      await fetchLeads();
    } catch (err: any) {
      console.error('❌ BULK UPLOAD ERROR:', err?.message || err);

      let errorMessage = 'Bulk upload failed ❌';

      const extractMsg = (obj: any): string | null => {
        if (!obj) return null;
        if (typeof obj === 'string') return obj;
        if (typeof obj.message === 'string' && obj.message) return obj.message;
        if (typeof obj.error === 'string' && obj.error) return obj.error;
        if (obj.data && typeof obj.data.message === 'string' && obj.data.message) return obj.data.message;
        return null;
      };

      const msg = extractMsg(err?.response?.data) || extractMsg(err);

      if (msg) {
        if (msg.includes('Network Error')) {
          errorMessage = '🌐 Network Error: Cannot connect to server. Please ensure backend server is running on port 9000.';
        } else {
          errorMessage = msg;
        }
      } else if (err?.response?.status === 500 || err?.status === 500) {
        errorMessage = `❌ Server Error: ${extractMsg(err?.response?.data) || 'Internal server error'}`;
      } else if (err?.response?.status === 400 || err?.status === 400) {
        errorMessage = `⚠️ Validation Error:\n${extractMsg(err?.response?.data) || 'Invalid data in file'}\n\nYour Excel must have:\n• full_name or name\n• E_mail or email\n• Phone_number or contact`;
      } else if (err?.response?.status === 401 || err?.status === 401) {
        errorMessage = '🔐 Authentication Error: Please login again';
      } else {
        try {
          errorMessage = `Bulk upload failed: ${JSON.stringify(err)}`;
        } catch {
          errorMessage = 'Bulk upload failed with an unknown error.';
        }
      }

      toast.error(errorMessage, {
        id: toastId,
        duration: 8000,
      });
    }
  };

  const fetchLeads = useCallback(async () => {
    const res = await LeadsAPI.getLeads(1, 1000, "");
    const backendLeads = res.data.data;
    setTotalLeads(res.data.total);

    const mapped = backendLeads.map((l: any) => {
      const employee = l.leadEmployee?.[0]?.employee;

      return {
        id: String(l.leadId),
        leadId: l.leadId,
        leadCode: l.leadSerialNumber || `LD${l.leadId}`,
        leadName: `${l.firstName} ${l.lastName ?? ""}`.trim(),
        contactNumber: l.contactNumber,
        createdTime: l.createdTime,
        email: l.email,
        address: l.address ?? '',
        eventDate: l.eventDate ?? '',
        budget: l.budget ?? '',
        eventType: l.eventType ?? '',
        priority: l.priority,
        firstName: l.firstName,
        lastName: l.lastName,
        assignedEmployee: employee
          ? {
            id: employee.employeeId,
            name: `${employee.firstName} ${employee.lastName}`,
            role: employee.user?.role,
          }
          : (l.leadFollowedBy || l.assignee ? {
            id: 0,
            name: l.leadFollowedBy || l.assignee,
            role: 'employee',
          } : null),
        leadSource: {
          type: l.leadSource,
          assignee: l.assignee ?? '',
          avatar: l.avatar ?? '',
        },
        currentStage: l.currentStage,
        status: getStatusFromStage(l.currentStage),
      };
    });

    setLeads(mapped);
  }, []);


  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter(lead => {
    const safeLeadName = lead.leadName ? String(lead.leadName).toLowerCase() : "";
    const safeLeadCode = lead.leadCode ? String(lead.leadCode).toLowerCase() : "";
    const safeEmail = lead.email ? String(lead.email).toLowerCase() : "";
    const safeContact = lead.contactNumber ? String(lead.contactNumber) : "";
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      safeLeadName.includes(searchLower) ||
      safeLeadCode.includes(searchLower) ||
      safeEmail.includes(searchLower) ||
      safeContact.includes(searchQuery);

    const matchesStatus = !filters.status || lead.status === filters.status;
    const matchesSource = !filters.leadSource || lead.leadSource.type === filters.leadSource;
    const matchesAssignee = !filters.assignee || lead.leadSource.assignee === filters.assignee;

    return matchesSearch && matchesStatus && matchesSource && matchesAssignee;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  const handleSelectLead = (leadId: Number) => {
    setSelectedLead(selectedLead === leadId ? null : leadId);
  };

  const handleViewLead = (lead: Lead) => {
    setViewingLead(lead);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await LeadsAPI.updateLead(
        parseInt(updatedLead.leadId),
        {
          firstName: updatedLead.firstName,
          lastName: updatedLead.lastName,
          email: updatedLead.email,
          contactNumber: updatedLead.contactNumber,
          address: updatedLead.address,
          eventType: updatedLead.eventType,
          budget: updatedLead.budget,
          eventDate: updatedLead.eventDate
            ? new Date(updatedLead.eventDate).toISOString()
            : undefined,
          leadSource: updatedLead.leadSource.type,
          assignee: updatedLead.leadSource.assignee,
        },
        user.userId
      );

      setLeads(prev =>
        prev.map(l =>
          l.leadId === updatedLead.leadId ? updatedLead : l
        )
      );

      toast.success('Lead updated successfully ✨');


      setViewingLead(null);
    } catch (err: any) {
      console.error("Bulk upload failed FULL ERROR 👉", err);

      if (err?.response) {
        console.error("STATUS:", err.response.status);
        console.error("DATA:", err.response.data);
        alert(
          err.response.data?.message ||
          JSON.stringify(err.response.data)
        );
      } else {
        alert(err.message || "Unknown error");
      }
    }

  };

  const handleDeleteLead = async (leadId: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-medium">Delete this lead?</span>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 text-xs bg-gray-200 rounded"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 text-xs bg-red-600 text-white rounded"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await LeadsAPI.deleteLead(leadId);
                setViewingLead(null);
                toast.success('Lead deleted successfully 🗑️');
                // Refresh from server so re-numbered serials are shown
                await fetchLeads();
              } catch (err) {
                console.error(err);
                toast.error('Failed to delete lead ❌');
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleSaveLead = async (formData: any) => {
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        leadType: formData.leadType,
        leadSerialNumber: formData.leadSerialNumber?.trim() || undefined,
        email: formData.email,
        contactNumber: formData.contactNumber,
        leadSource:
          typeof formData.leadSource === 'string'
            ? formData.leadSource
            : formData.leadSource?.type || '',
        eventType: formData.eventType,
        priority: formData.priority || '',
        budget: formData.budget,
        address: formData.address,
        eventDate: formData.eventDate
          ? new Date(formData.eventDate).toISOString()
          : undefined,
        weddingDate: formData.weddingDate
          ? new Date(formData.weddingDate).toISOString()
          : undefined,
        receptionDate: formData.receptionDate
          ? new Date(formData.receptionDate).toISOString()
          : undefined,
      };

      Object.keys(payload).forEach(
        key => payload[key] === undefined && delete payload[key]
      );

      await LeadsAPI.createLead(payload);

      toast.success('Lead created successfully 🎉');

      setCurrentPage(1);
      await fetchLeads();
    } catch (err) {
      console.error(err);
      toast.error((err as any)?.response?.data?.message || 'Failed to create lead');
      throw err;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'To Do':
        return 'bg-gray-100 text-gray-800';
      case 'In Review':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
          {/* Title and Action Buttons */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">VIEW LEADS</h1>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleBulkUpload(file);
                    e.target.value = ""; // reset input
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md font-medium hover:from-[#5a2dd4] hover:to-[#4a23c3] transition-all shadow-sm text-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Bulk Upload
              </button>
              <button
                onClick={() => setShowAddLeadModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md font-medium hover:from-[#5a2dd4] hover:to-[#4a23c3] transition-all shadow-sm text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Lead
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent text-xs"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg transition-colors ${showFilters || Object.values(filters).some(f => f !== '')
                ? 'bg-[#6938ef] text-white border-[#6938ef]'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setFilters({ status: '', leadSource: '', dateRange: '', assignee: '' })}
                  className="text-xs text-[#6938ef] hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                  >
                    <option value="">All Status</option>
                    <option value="Done">Done</option>
                    <option value="In Progress">In Progress</option>
                    <option value="To Do">To Do</option>
                    <option value="In Review">In Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Lead Source</label>
                  <select
                    value={filters.leadSource}
                    onChange={(e) => setFilters({ ...filters, leadSource: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                  >
                    <option value="">All Sources</option>
                    <option value="Assignee">Assignee</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
                {/* <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Assignee</label>
                  <select
                    value={filters.assignee}
                    onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                  >
                    <option value="">All Assignees</option>
                    {Array.from(new Set(leads.map(l => l.leadSource.assignee).filter(Boolean))).map((assignee) => (
                      <option key={assignee} value={assignee}>
                        {assignee}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200" style={{ backgroundColor: '#e6edf5' }}>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="radio"
                        checked={false}
                        onChange={() => { }}
                        className="w-4 h-4 text-[#6938ef] border-gray-300 focus:ring-[#6938ef]"
                        disabled
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">Lead ID</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">Lead Name</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">Assigned Employee</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">Contact Number</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">Created time</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">Lead source</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">View</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeads.map((lead, index) => (
                    <tr
                      key={lead.leadId}
                      className={`hover:bg-gray-50 transition-colors ${selectedLead === parseInt(lead.leadId) ? 'bg-purple-50' : ''
                        }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="radio"
                          name="lead-selection"
                          checked={selectedLead === parseInt(lead.leadId)}
                          onChange={() => handleSelectLead(parseInt(lead.leadId))}
                          className="w-4 h-4 text-[#6938ef] border-gray-300 focus:ring-[#6938ef] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-gray-900">{lead.leadCode}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-gray-900">{lead.leadName}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-bold text-indigo-600">
                        {lead.assignedEmployee?.name || lead.leadSource.assignee || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-gray-600">{lead.contactNumber}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-gray-600">
                        {new Date(lead.createdTime).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-gray-600">{lead.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {lead.leadSource.avatar && (
                            <img
                              src={lead.leadSource.avatar}
                              alt={lead.leadSource.assignee}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span className="text-xs sm:text-sm text-gray-600">{lead.leadSource.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block ${lead.status === 'In Progress' ? 'px-3 py-0.5' : 'px-2 py-0.5'} rounded-full text-xs font-bold ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewLead(lead)}
                          className="px-2.5 py-1 rounded-md font-medium text-xs transition-all hover:shadow-sm"
                          style={{
                            backgroundColor: 'rgba(105, 56, 239, 0.1)',
                            color: '#6938ef',
                            border: '1px solid rgba(105, 56, 239, 0.3)'
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="text-gray-600 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="text-gray-600 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <AddLeadModal
          onClose={() => setShowAddLeadModal(false)}
          onSave={async (formData) => {
            await handleSaveLead(formData);
          }}
        />
      )}

      {/* View Lead Modal */}
      {viewingLead && (
        <ViewLeadModal
          lead={viewingLead}
          onClose={() => setViewingLead(null)}
          onUpdate={handleUpdateLead}
          onDelete={async (leadId: number) => {
            // Refresh from server so re-numbered serials are shown
            setViewingLead(null);
            await fetchLeads();
          }}
        />
      )}

    </div>
  );
};

export default ViewLeads;
