// src/pages/partner/Leads.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import * as LeadService from '../../Services/leadService';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import LeadModal from '../../components/LeadModal/LeadModal';
import {
  Search,
  Download,
  Plus,
  ArrowUpDown,
  MoreVertical,
  Eye,
} from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import toast from 'react-hot-toast';

interface Task {
  taskId: number;
  taskName: string;
  description?: string;
  dueDate?: string;
  estimatedDuration?: number;
  priority?: string;
  assignedTo?: number;
  assignedToName?: string;
  assignedRole?: string;
  assignedBy?: {
    userId: number;
    email: string;
    role: string;
  };
}

interface Lead {
  leadId: string;
  leadSerialNumber?: string;
  leadName: string;
  type: string;
  createdDate: string;
  createdAtRaw?: string;
  editedDate: string;
  status: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  priority?: string;
  contactNumber?: string;
  leadType?: string;
  address?: string;
  eventType?: string;
  leadSource?: string;
  budget?: string;
  eventDate?: string;
  assignee?: string;
  description?: string;
  currentStage?: string;
  createdByUserId?: number;
  assignedPartnerId?: number;
  assignedBy?: {
    userId: number;
    email: string;
    role: string;
  };
  createdBy?: {
    userId: number;
    email: string;
    role: string;
  };
  tasks?: Task[];
}

type TaskStatus = "To Do" | "In Progress" | "In Review" | "Done";

interface UITask {
  id: string;        // STRING ONLY
  sno: number;
  leadId: string;
  rawLeadId: string;
  leadName: string;
  task: string;
  due: string;
  dueStatus?: "normal" | "soon" | "today" | "overdue";
  diffDays?: number;
  assignee: string;
  avatar: string;
  status: TaskStatus;
}
const formatDateForDisplay = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};


const Leads = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view'>('add');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const mapBackendToClientLead = (l: any): Lead => {
    return {
      leadId: String(l.leadId ?? l.lead_id ?? ''),

      // ✅ FORCE SERIAL NUMBER PRIORITY
      leadSerialNumber:
        l.lead_serial_number ??
        l.leadSerialNumber ??
        `${l.lead_type || l.leadType || 'LD'}-${String(l.leadId ?? l.lead_id).padStart(2, '0')}`,

      leadName:
        l.leadName ||
        `${l.firstName || ''} ${l.lastName || ''}`.trim() ||
        'Unnamed Lead',

      status: l.status || 'To Do',
      type: l.eventType || 'Not specified',
      createdDate: formatDateForDisplay(l.created_at || l.createdTime),
      createdAtRaw: l.created_at || l.createdTime || '',
      editedDate: '',
      assignedBy: l.assignedBy,
      tasks: Array.isArray(l.tasks) ? l.tasks : [],
    };
  };

  const formatError = (err: any) => {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    if (err.status) {
      const body = err.body;
      const bodyMsg =
        body && typeof body === 'object'
          ? body.message || body.error || JSON.stringify(body)
          : body;
      return `Request failed (${err.status})${bodyMsg ? `: ${bodyMsg}` : ''
        }`;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

const DEMO_PARTNER_LEADS_DATA: Lead[] = [
  {
    leadId: "801",
    leadSerialNumber: "RAS-01",
    leadName: "Vikram Malhotra",
    type: "Wedding Photography",
    createdDate: "Sep 01, 2026",
    createdAtRaw: "2026-09-01T10:00:00.000Z",
    editedDate: "-",
    status: "In Progress",
    tasks: [
      {
        taskId: 1001,
        taskName: "Client Consultation & Plan Selection",
        priority: "High",
      },
    ],
  },
  {
    leadId: "802",
    leadSerialNumber: "RAS-02",
    leadName: "Rohan Mehta",
    type: "Cinematic Wedding",
    createdDate: "Sep 02, 2026",
    createdAtRaw: "2026-09-02T11:30:00.000Z",
    editedDate: "-",
    status: "To Do",
    tasks: [
      {
        taskId: 1002,
        taskName: "Share Portfolio & Quotation",
        priority: "Medium",
      },
    ],
  },
  {
    leadId: "803",
    leadSerialNumber: "RAS-03",
    leadName: "Meera Nair",
    type: "Reception & Sangeet",
    createdDate: "Aug 28, 2026",
    createdAtRaw: "2026-08-28T14:15:00.000Z",
    editedDate: "Sep 01, 2026",
    status: "Done",
    tasks: [
      {
        taskId: 1003,
        taskName: "Deliverable Review & Approval",
        priority: "Low",
      },
    ],
  },
  {
    leadId: "804",
    leadSerialNumber: "RAS-04",
    leadName: "Karan Kapoor",
    type: "Pre-Wedding Shoot",
    createdDate: "Aug 20, 2026",
    createdAtRaw: "2026-08-20T09:45:00.000Z",
    editedDate: "Aug 25, 2026",
    status: "In Review",
    tasks: [
      {
        taskId: 1004,
        taskName: "Teaser Clip Feedback",
        priority: "Medium",
      },
    ],
  },
  {
    leadId: "805",
    leadSerialNumber: "RAS-05",
    leadName: "Divya Verma",
    type: "Destination Wedding",
    createdDate: "Aug 15, 2026",
    createdAtRaw: "2026-08-15T16:20:00.000Z",
    editedDate: "-",
    status: "In Progress",
    tasks: [
      {
        taskId: 1005,
        taskName: "Venue Coordination & Gear Checklist",
        priority: "High",
      },
    ],
  },
  {
    leadId: "806",
    leadSerialNumber: "RAS-06",
    leadName: "Arjun Sharma",
    type: "Engagement Coverage",
    createdDate: "Jul 25, 2026",
    createdAtRaw: "2026-07-25T12:00:00.000Z",
    editedDate: "Jul 30, 2026",
    status: "Done",
    tasks: [
      {
        taskId: 1006,
        taskName: "Final Photo Album Handover",
        priority: "Low",
      },
    ],
  },
];

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (localStorage.getItem("isDemoPortal") === "true") {
      setLeads(DEMO_PARTNER_LEADS_DATA);
      setLoading(false);
      return;
    }

    try {
      const res: any = await LeadService.getPartnerAssignedLeads();
      const items = Array.isArray(res?.data) ? res.data : [];
      const mappedLeads = items.map(mapBackendToClientLead);
      setLeads(mappedLeads);
    } catch (err: any) {
      console.error("❌ Failed to fetch leads:", err);
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchLeads();
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchLeads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const sortByDate = (list: Lead[]) => {
    return [...list].sort((a, b) => {
      const dateA = a.createdAtRaw ? new Date(a.createdAtRaw).getTime() : 0;
      const dateB = b.createdAtRaw ? new Date(b.createdAtRaw).getTime() : 0;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  const handleSortByDate = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleDownload = () => {
    if (!leads || leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    const loadingToast = toast.loading("Exporting lead tracking report...");

    try {
      const sortedLeads = sortByDate(leads);

      const excelData = sortedLeads.map(lead => ({
        'Lead ID': lead.leadSerialNumber || lead.leadId,
        'Lead Name': lead.leadName,
        'Task': lead.tasks && lead.tasks.length > 0
          ? lead.tasks.map(t => t.taskName).join(', ')
          : '-',
        'Created Date': lead.createdDate,
        'Edited Date': lead.editedDate,
        Status: lead.status,
      }));

      exportToExcel(
        excelData,
        `leads-report-${new Date().toISOString().split("T")[0]}`,
        [
          'Lead ID',
          'Lead Name',
          'Task',
          'Created Date',
          'Edited Date',
          'Status',
        ],
        'Lead Tracking Report'
      );

      toast.success("Lead tracking report exported successfully", { id: loadingToast });
    } catch (error) {
      console.error("Lead export failed", error);
      toast.error("Failed to export lead tracking report", { id: loadingToast });
    }
  };


  const sortedLeads = sortByDate(leads);

  const handleViewLead = (leadId: string) => {
    navigate(`/partner/lead/${leadId}/overview`);
  };

  const handleAddNew = () => {
    setSelectedLead(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleSaveLead = async (leadData: Partial<Lead>) => {
    setError(null);
    setSaving(true);
    setSuccess(null);

    if (localStorage.getItem("isDemoPortal") === "true") {
      const newLead: Lead = {
        leadId: String(Date.now()),
        leadSerialNumber: `RAS-${leads.length + 1}`,
        leadName: `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim() || 'New Partner Lead',
        type: leadData.eventType || 'Wedding Photography',
        createdDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        createdAtRaw: new Date().toISOString(),
        editedDate: '-',
        status: 'To Do',
        tasks: [],
      };
      setLeads((prev) => [newLead, ...prev]);
      setSuccess('Lead created successfully! (Demo Mode)');
      setTimeout(() => setSuccess(null), 4000);
      setShowModal(false);
      setSelectedLead(null);
      setSaving(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      setSaving(false);
      navigate('/login');
      return;
    }

    try {
      const payload: any = {
        firstName: leadData.firstName || '',
        lastName: leadData.lastName || '',
        email: leadData.email || '',
        contactNumber: leadData.contactNumber || '',
        address: leadData.address || '',
        eventType: leadData.eventType || '',
        leadSource: leadData.leadSource || '',
        priority: leadData.priority || 'Medium',
        description: leadData.description || '',
        leadType: leadData.leadType || 'LD',
        currentStage: leadData.currentStage || 'Lead',
        status: leadData.currentStage || 'Lead',
      };

      if (leadData.budget) {
        payload.budget = leadData.budget;
      } else {
        payload.budget = '0';
      }

      if (leadData.eventDate) {
        payload.eventDate = new Date(leadData.eventDate).toISOString();
      }

      if (modalMode === 'add') {
        await LeadService.createLead(payload);
        await fetchLeads();
        setSuccess('Lead created successfully!');
        setTimeout(() => setSuccess(null), 4000);
      }

      setShowModal(false);
      setSelectedLead(null);
    } catch (err: any) {
      console.error('❌ Save lead failed:', err);
      if (err.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(formatError(err));
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // ================================================
  // ===== Map leads + tasks for the UI grid ========
  // ================================================
  const tasks: UITask[] = sortedLeads.flatMap((lead, index) => {
    const shouldHideHighlight = lead.status !== 'Lead' && lead.status !== 'To Do' && lead.status !== 'ToDo' && lead.status?.toLowerCase() !== 'lead';

    if (!lead.tasks || lead.tasks.length === 0) {
      let dueStatus: "normal" | "soon" | "today" | "overdue" = "normal";
      let diffDays = -1;
      
      if (lead.createdAtRaw && !shouldHideHighlight) {
        const dDate = new Date(lead.createdAtRaw);
        dDate.setHours(0,0,0,0);
        const now = new Date();
        now.setHours(0,0,0,0);
        const diffTime = dDate.getTime() - now.getTime();
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          dueStatus = "overdue";
        } else if (diffDays === 0) {
          dueStatus = "today";
        } else if (diffDays <= 2) {
          dueStatus = "soon";
        }
      }

      return [{
        id: `lead-${lead.leadId}`,   // FORCE string
        sno: index + 1,
        leadId: lead.leadSerialNumber || lead.leadId,
        rawLeadId: lead.leadId,
        leadName: lead.leadName,
        task: "Not specified",
        due: lead.createdDate || "—",
        dueStatus,
        diffDays,
        assignee: lead.assignedBy?.email ?? "—",
        avatar: "/path/to/default/avatar.jpg",
        status: (lead.status as TaskStatus) || "To Do",
      }];
    }

    return lead.tasks.map((task, i) => {
      let dueStatus: "normal" | "soon" | "today" | "overdue" = "normal";
      let diffDays = -1;
      
      if (task.dueDate && !shouldHideHighlight) {
        const dDate = new Date(task.dueDate);
        dDate.setHours(0,0,0,0);
        const now = new Date();
        now.setHours(0,0,0,0);
        const diffTime = dDate.getTime() - now.getTime();
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          dueStatus = "overdue";
        } else if (diffDays === 0) {
          dueStatus = "today";
        } else if (diffDays <= 2) {
          dueStatus = "soon";
        }
      }

      return {
        id: `task-${task.taskId}`,     // FORCE string
        sno: index + 1,
        leadId: lead.leadSerialNumber || lead.leadId,
        rawLeadId: lead.leadId,
        leadName: lead.leadName,
        task: task.taskName,
        due: task.dueDate ? formatDateForDisplay(task.dueDate) : "—",
        dueStatus,
        diffDays,
        assignee: task.assignedBy?.email ?? "—",
        avatar: "/path/to/default/avatar.jpg",
        status: (lead.status as TaskStatus) || "To Do",
      };
    });
  });

  // ===================== SEARCH FILTER =====================
  const filteredTasks = tasks.filter(task => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      task.leadId.toLowerCase().includes(q) ||
      task.leadName.toLowerCase().includes(q) ||
      task.task.toLowerCase().includes(q) ||
      task.assignee.toLowerCase().includes(q)
    );
  });

  // ======================= RETURN JSX =======================
  return (
    <div className="fixed inset-0 flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w_full min-w-0">
        <DashboardHeader title="LEADS" />

        <main className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-5 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Lead ID, name, task or assignee"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg.white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent text-sm sm:text-base border border-gray-300"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                className="p-2 rounded-lg transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'rgba(105, 56, 239, 0.7)',
                  color: '#ffffff',
                }}
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              <button
                onClick={handleSortByDate}
                className="px-3 py-1.5 bg-[#6938ef] text-white rounded-lg font-medium hover:bg-[#5a2dd4] transition-colors text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
                title={sortOrder === 'desc' ? 'Currently: Newest First' : 'Currently: Oldest First'}
              >
                <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{sortOrder === 'desc' ? '↓ Newest First' : '↑ Oldest First'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-[#6938ef] text-white rounded-lg font-medium hover:bg-[#5a2dd4] transition-colors text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={handleAddNew}
                className="p-2 sm:p-2.5 bg-[#6938ef] text-white rounded-full hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-10 space-y-3">

            {/* ================= HEADER ================= */}
            <div className="hidden md:block bg-[#EEF3F9] rounded-full px-6 py-3">
              <div className="grid grid-cols-12 text-sm font-semibold text-gray-700">
                <div className="col-span-1">Lead ID</div>
                <div className="col-span-3">Lead Name</div>
                <div className="col-span-3">Task</div>
                <div className="col-span-2">Assigned By</div>
                <div className="col-span-1">Due</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
            </div>

            {loading && (
              <div className="text-center py-10 text-gray-500">
                Loading tasks
              </div>
            )}

            {!loading && filteredTasks.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No tasks assigned
              </div>
            )}

            {/* ================= ROWS ================= */}
            <div className="space-y-2">

              {/* ✅ MOBILE VIEW (Cards) */}
              <div className="block md:hidden space-y-3">
                {!loading &&
                  filteredTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`rounded-2xl px-4 py-3 shadow transition-all ${
                        task.dueStatus === "today"
                          ? "bg-red-50 border border-red-200"
                          : task.dueStatus === "soon"
                            ? "bg-orange-50 border border-orange-200"
                            : task.dueStatus === "overdue"
                              ? "bg-red-100 border border-red-300 opacity-90"
                              : "bg-white border border-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {task.leadId} - {task.leadName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            Task: {task.task}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap ${task.status === "To Do"
                            ? "border-gray-400 text-gray-600"
                            : task.status === "In Progress"
                              ? "border-yellow-400 text-yellow-600"
                              : task.status === "In Review"
                                ? "border-orange-400 text-orange-600"
                                : "border-green-400 text-green-600"
                            }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
                        <div>
                          <p className="text-gray-400">Assigned By</p>
                          <p className="truncate font-medium">{task.assignee}</p>
                        </div>

                        <div className="flex flex-col gap-1 items-start">
                          <p className="text-gray-400">Due</p>
                          <p className="font-medium">{task.due}</p>
                          {task.dueStatus === "today" && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-sm">
                              Due Today
                            </span>
                          )}
                          {task.dueStatus === "soon" && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                              Due in {task.diffDays} day{task.diffDays! > 1 ? "s" : ""}
                            </span>
                          )}
                          {task.dueStatus === "overdue" && (
                            <span className="px-2 py-0.5 bg-red-700 text-white text-[10px] font-bold rounded-full shadow-sm">
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleViewLead(task.rawLeadId)}
                          className="text-purple-600 font-semibold text-sm"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* ✅ DESKTOP VIEW (Table Grid) */}
              <div className="hidden md:block space-y-2">
                {!loading &&
                  filteredTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`grid grid-cols-12 items-center rounded-2xl px-6 py-4 shadow transition-all ${
                        task.dueStatus === "today"
                          ? "bg-red-50 border border-red-200"
                          : task.dueStatus === "soon"
                            ? "bg-orange-50 border border-orange-200"
                            : task.dueStatus === "overdue"
                              ? "bg-red-100 border border-red-300 opacity-90"
                              : "bg-white"
                      }`}
                    >
                      <div className="col-span-1 font-semibold text-xs truncate" title={task.leadId}>{task.leadId}</div>

                      <div className="col-span-3 font-medium text-gray-800 truncate">
                        {task.leadName}
                      </div>

                      <div className="col-span-3 font-medium truncate">
                        {task.task}
                      </div>

                      <div className="col-span-2 flex items-center gap-2">
                        <span className="text-sm truncate">{task.assignee}</span>
                      </div>

                      <div className="col-span-1 flex flex-col gap-1 items-start">
                        <span className="text-sm">{task.due}</span>
                        {task.dueStatus === "today" && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-sm">
                            Due Today
                          </span>
                        )}
                        {task.dueStatus === "soon" && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                            Due in {task.diffDays} day{task.diffDays! > 1 ? "s" : ""}
                          </span>
                        )}
                        {task.dueStatus === "overdue" && (
                          <span className="px-2 py-0.5 bg-red-700 text-white text-[10px] font-bold rounded-full shadow-sm">
                            Overdue
                          </span>
                        )}
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs border ${task.status === "To Do"
                            ? "border-gray-400 text-gray-600"
                            : task.status === "In Progress"
                              ? "border-yellow-400 text-yellow-600"
                              : task.status === "In Review"
                                ? "border-orange-400 text-orange-600"
                                : "border-green-400 text-green-600"
                            }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleViewLead(task.rawLeadId)}
                          className="text-purple-600 hover:underline font-medium text-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <LeadModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedLead(null);
        }}
        onSave={handleSaveLead}
        leadData={selectedLead}
        mode={modalMode}
        isSaving={saving}
      />
    </div>
  );
};

export default Leads;
