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
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as any[]),
        error: (err) => reject(err),
      });
    });
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        // Use raw: true so Excel date serial numbers come through as numbers
        // (handled by excelSerialToDate). raw: false causes locale-dependent
        // string formatting (e.g. "5/18/2026") that is hard to parse reliably.
        const workbook = XLSX.read(data, { type: "array", cellDates: false });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: true,
          defval: "",
        });

        resolve(jsonData as any[]);
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleBulkUpload = async (file: File) => {
    const toastId = toast.loading('Uploading leads...');

    try {
      let rows: any[] = [];

      // ---- FILE PARSE ----
      if (file.name.endsWith('.csv')) {
        rows = await parseCSV(file);
      } else {
        rows = await parseExcel(file);
      }

      if (!rows.length) {
        toast.error('File is empty ❌', { id: toastId });
        return;
      }

      // ---- ROW → PAYLOAD ----
      const leadsPayload: any[] = [];

      rows.forEach((row, index) => {
        // Skip completely empty rows
        const isRowEmpty = !Object.values(row).some(
          val => val !== null && val !== undefined && String(val).trim() !== ''
        );
        if (isRowEmpty) return;

        // ---------- NAME ----------
        const fullName = String(row['full_name'] || '').trim();
        const [firstName, ...rest] = fullName.split(' ');
        const lastName = rest.join(' ') || undefined;

        // ---------- PHONE (scientific notation safe) ----------
        const rawPhone = row['Phone_number'];
        const contactNumber =
          rawPhone !== undefined && rawPhone !== null
            ? String(rawPhone)
              .replace(/\.0$/, '')
              .replace(/E\+?11/i, '')
              .trim()
            : '';

        // ---------- PAYLOAD ----------
        const payload: any = {
          firstName,
          lastName,
          email: String(row['E_mail'] || '').trim(),
          contactNumber,
          eventType: row['what_type_of_your_wedding?'] || undefined,
          budget: parseBudget(row['choose_your_package?']),
          eventDate: parseEventDate(row['enter_event_date_&_month']),
          address: row['enter_your_wedding_location'] || undefined,
          leadType: row['lead_type'] || undefined,
          leadSerialNumber: row['lead_id'] || row['Lead ID'] || undefined,
          leadSource: 'Excel Upload',
        };

        // remove empty fields
        Object.keys(payload).forEach(
          key => payload[key] === undefined && delete payload[key]
        );

        // ---------- VALIDATION ----------
        const missing: string[] = [];
        if (!payload.firstName) missing.push('full_name');
        if (!payload.email) missing.push('E_mail');
        if (!payload.contactNumber) missing.push('Phone_number');

        if (missing.length) {
          throw new Error(
            `Row ${index + 2} missing required fields: ${missing.join(', ')}`
          );
        }

        leadsPayload.push(payload);
      });

      if (leadsPayload.length === 0) {
        throw new Error('No valid leads found in file');
      }

      // ---- API CALL ----
      await LeadsAPI.bulkCreate(leadsPayload);

      // ---- SUCCESS ----
      toast.success(
        `Bulk upload successful 🎉 (${leadsPayload.length} leads added)`,
        { id: toastId }
      );

      // ---- REFRESH ----
      setCurrentPage(1);
      setSearchQuery('');
      await fetchLeads();

    } catch (err: any) {
      console.error('❌ BULK UPLOAD ERROR:', err);

      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        'Bulk upload failed ❌',
        { id: toastId }
      );
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
        leadName: `${l.firstName} ${l.lastName ?? ""} (${l.eventType ?? ""})`,
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
          : null,
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
