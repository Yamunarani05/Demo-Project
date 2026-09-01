import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import type { Lead } from './ViewLeads';
import { api } from '../../api/axios';

interface LeadTracking {
  id: string;
  leadId: string;
  leadName: string;
  contactId: string;
  invoiceId: string;
  billingDate: string;
  employeeAssigned: {
    name: string;
    avatar: string;
  };
  plan: string;
  status: string;
  email: string;
  address: string;
  eventDate: string;
  createdTime: string;
  currentStage: string;
}

interface EmployeeTracking {
  id: string;
  employeeName: string;
  employeeId: string;
  email: string;
  position: string;
  contact: string;
  avatar: string;
}

const TrackingDetails = () => {
  const navigate = useNavigate();
  const [leadTracking, setLeadTracking] = useState<LeadTracking[]>([]);
  const [employeeTracking, setEmployeeTracking] = useState<EmployeeTracking[]>([]);
  const [leadCurrentPage, setLeadCurrentPage] = useState(1);
  const [employeeCurrentPage, setEmployeeCurrentPage] = useState(1);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 4;

  const normalizeStage = (stageStr?: string): string => {
    if (!stageStr) return 'Lead';
    const s = String(stageStr).trim().toLowerCase();
    if (s === 'finalised' || s === 'finalized' || s === 'completed' || s === 'done') return 'Finalised';
    if (s === 'confirmation' || s === 'confirmed' || s === 'invoiceapproved') return 'Confirmation';
    if (s === 'quotation' || s === 'quotationapproved' || s === 'in progress') return 'Quotation';
    return 'Lead';
  };

  useEffect(() => {
    const fetchLeadsAndInvoices = async () => {
      setLoading(true);
      try {
        const leadsRes = await api.get('/leads');
        const leadsData = leadsRes.data.data;

        const invoicesRes = await api.get('/invoices');
        const invoicesData = invoicesRes.data.data;

        const formattedLeads: LeadTracking[] = [];

        leadsData.forEach((lead: any) => {
          const leadEmployees = lead.leadEmployee || [];
          const defaultEmp = leadEmployees[0]?.employee;
          const defaultEmpName = defaultEmp
            ? `${defaultEmp.firstName ?? ""} ${defaultEmp.lastName ?? ""}`.trim()
            : 'Unassigned';

          const leadInvoiceGroup = invoicesData.find((inv: any) => inv.leadId === lead.leadId);
          const leadInvoices: any[] = leadInvoiceGroup?.invoices || [];

          if (leadInvoices.length === 0) {
            const employeeName = defaultEmpName;
            const status = lead.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid';
            const stage = normalizeStage(lead.currentStage);

            formattedLeads.push({
              id: String(lead.leadId),
              leadId: lead.leadSerialNumber || `LD${lead.leadId}`,
              leadName: `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() + (lead.eventType ? ` (${lead.eventType})` : ""),
              contactId: lead.contactNumber || "-",
              invoiceId: "-",
              email: lead.email || "-",
              billingDate: "-",
              address: lead.address || "-",
              eventDate: lead.eventDate
                ? new Date(lead.eventDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                : "-",
              createdTime: lead.createdTime
                ? new Date(lead.createdTime).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                : "-",
              employeeAssigned: {
                name: employeeName,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  employeeName
                )}&background=6938ef&color=fff`,
              },
              plan: lead.eventType ? `${lead.eventType} Plan` : "-",
              status,
              currentStage: stage,
            });
          } else {
            // Sort invoices (newest billing date first, then by invoiceId)
            const sortedInvoices = [...leadInvoices].sort((a, b) => {
              const dateA = a.billingDate ? new Date(a.billingDate).getTime() : 0;
              const dateB = b.billingDate ? new Date(b.billingDate).getTime() : 0;
              return dateB - dateA || (b.invoiceId || 0) - (a.invoiceId || 0);
            });

            sortedInvoices.forEach((inv: any) => {
              const planName = inv.plan || (lead.eventType ? `${lead.eventType} Plan` : "-");
              const cleanTaskName = inv.plan
                ? inv.plan.replace(/\s*plan$/i, '').trim()
                : (lead.eventType || '');

              // Match employee for this task/event
              const matchedLeadEmp = leadEmployees.find((le: any) => {
                if (!le.taskName) return false;
                const tName = le.taskName.toLowerCase().trim();
                const pName = cleanTaskName.toLowerCase().trim();
                return pName.includes(tName) || tName.includes(pName);
              });

              const assignedEmpObj = matchedLeadEmp?.employee || defaultEmp;
              const empName = assignedEmpObj
                ? `${assignedEmpObj.firstName ?? ""} ${assignedEmpObj.lastName ?? ""}`.trim()
                : defaultEmpName;

              // Initial status (will also be verified via /payments/invoice API below)
              const initialStatus = (inv.status === 'Paid' || lead.paymentStatus === 'Paid') ? 'Paid' : 'Unpaid';

              // Determine stage for this specific task
              let taskStage = 'Lead';
              if (matchedLeadEmp?.stage) {
                taskStage = matchedLeadEmp.stage;
              } else if (matchedLeadEmp?.status === 'completed' || matchedLeadEmp?.status === 'done') {
                taskStage = 'Finalised';
              } else if (inv.status === 'Paid' || lead.paymentStatus === 'Paid') {
                taskStage = normalizeStage(lead.currentStage) === 'Finalised' ? 'Finalised' : 'Confirmation';
              } else if (inv.status === 'Approved' || normalizeStage(lead.currentStage) === 'Confirmation') {
                taskStage = 'Confirmation';
              } else {
                taskStage = normalizeStage(lead.currentStage);
              }

              const leadDisplayName =
                `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() +
                (cleanTaskName ? ` (${cleanTaskName})` : (lead.eventType ? ` (${lead.eventType})` : ""));

              formattedLeads.push({
                id: `${lead.leadId}-${inv.invoiceId}`,
                leadId: lead.leadSerialNumber || `LD${lead.leadId}`,
                leadName: leadDisplayName,
                contactId: lead.contactNumber || "-",
                invoiceId: inv.invoiceId ? `INV${inv.invoiceId}` : "-",
                email: lead.email || "-",
                billingDate: inv.billingDate
                  ? new Date(inv.billingDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  : "-",
                address: lead.address || "-",
                eventDate: lead.eventDate
                  ? new Date(lead.eventDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  : "-",
                createdTime: lead.createdTime
                  ? new Date(lead.createdTime).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  : "-",
                employeeAssigned: {
                  name: empName,
                  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    empName
                  )}&background=6938ef&color=fff`,
                },
                plan: planName,
                status: initialStatus,
                currentStage: normalizeStage(taskStage),
              });
            });
          }
        });

        // Connect directly to the payment verification endpoint (exact same check as Invoice.tsx)
        const enrichedLeads: LeadTracking[] = await Promise.all(
          formattedLeads.map(async (row) => {
            if (!row.invoiceId || row.invoiceId === '-') return row;
            const numericId = row.invoiceId.replace(/^INV-?/i, '');
            try {
              const payRes = await api.get(`/payments/invoice/${numericId}`);
              const summary = payRes.data;
              const totalPaid = Number(summary.totalPaid ?? summary.paid ?? 0);
              const discount = Number(summary.discount ?? 0);
              const totalAmount = Number(summary.totalAmount ?? 0) - discount;
              const balance =
                summary.balance !== undefined
                  ? Number(summary.balance)
                  : Math.max(0, totalAmount - totalPaid);
              const isPaid =
                (totalAmount > 0 && balance <= 0) ||
                (totalAmount > 0 && totalPaid >= totalAmount) ||
                summary.status?.toLowerCase() === 'paid';

              return {
                ...row,
                status: isPaid ? 'Paid' : 'Unpaid',
              };
            } catch {
              return row;
            }
          })
        );

        setLeadTracking(enrichedLeads);
      } catch (err) {
        console.error('Failed to fetch leads or invoices', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadsAndInvoices();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await api.get('/employees');
        const employeesData = res.data.employees.employees;

        const formattedEmployees: EmployeeTracking[] = employeesData.map((emp: any) => ({
          id: String(emp.employeeId),
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeId: `EM${emp.employeeId}`,
          email: emp.user?.email || '-',
          position: emp.position || '-',
          contact: emp.contactNumber || '-',
          avatar: emp.firstName
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.firstName + ' ' + emp.lastName)}&background=10b981&color=fff`
            : 'https://ui-avatars.com/api/?name=NA&background=10b981&color=fff',
        }));

        setEmployeeTracking(formattedEmployees);
      } catch (err) {
        console.error('Failed to fetch employees', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredLeads = leadTracking.filter(
    (lead) =>
      lead.leadName.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.leadId.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.invoiceId.toLowerCase().includes(leadSearchQuery.toLowerCase())
  );

  const filteredEmployees = employeeTracking.filter(
    (emp) =>
      emp.employeeName.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  const leadTotalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const leadStartIndex = (leadCurrentPage - 1) * itemsPerPage;
  const leadEndIndex = leadStartIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(leadStartIndex, leadEndIndex);

  const employeeTotalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const employeeStartIndex = (employeeCurrentPage - 1) * itemsPerPage;
  const employeeEndIndex = employeeStartIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    employeeStartIndex,
    employeeEndIndex
  );

  const handleViewLead = (lead: LeadTracking) => {
    const leadData: Lead = {
      id: lead.id,
      leadId: lead.leadId,
      leadName: lead.leadName,
      leadCode: "",
      contactNumber: lead.contactId,
      email: lead.email,
      address: lead.address,
      eventDate: lead.eventDate,
      createdTime: lead.createdTime,
      status: "Done",
      leadSource: {
        type: lead.plan,
        assignee: lead.employeeAssigned.name,
        avatar: lead.employeeAssigned.avatar,
      },
      currentStage: lead.currentStage,
    };

    navigate('/admin/tracking/track-leads', { state: { lead: leadData } });
  };

  const handleViewEmployee = (emp: EmployeeTracking) => {
    navigate('/admin/employees', {
      state: {
        employee: {
          id: emp.id,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          contactNumber: emp.contact,
          email: emp.email,
          position: emp.position || 'General',
          avatar: emp.avatar,
        },
      },
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'Paid') return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#f4f3ff] flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 w-full">
          <h1 className="text-2xl font-bold text-[#151a33] mb-6">
            TRACKING DETAILS
          </h1>
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#151a33]">
                Lead Tracking
              </h2>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={leadSearchQuery}
                  onChange={(e) => {
                    setLeadSearchQuery(e.target.value);
                    setLeadCurrentPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#d5dce6]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Lead Id
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Lead Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Contact Id
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Invoice Id
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Billing date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Employee Assigned
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Plan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <svg
                              className="w-6 h-6 text-[#6938ef] animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              />
                            </svg>
                            <p className="text-sm text-gray-600 font-medium">
                              Loading leads...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : currentLeads.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-sm text-gray-500">
                          No leads found
                        </td>
                      </tr>
                    ) : (
                      currentLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b border-gray-100 hover:bg-[#f7f7ff]"
                        >
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {lead.leadId}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {lead.leadName}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {lead.contactId}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {lead.invoiceId}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {lead.billingDate}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={lead.employeeAssigned.avatar}
                                alt={lead.employeeAssigned.name}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-xs text-gray-700">
                                {lead.employeeAssigned.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700">
                            {lead.plan}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(
                                lead.status
                              )}`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewLead(lead)}
                              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#6938ef]/40 text-[#6938ef] shadow-sm hover:bg-[#f3ecff]"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {leadTotalPages > 1 && (
                <div className="flex justify-end px-6 py-3 bg-transparent">
                  <div className="inline-flex items-center gap-4 rounded-full bg-white shadow-md border border-gray-200 px-4 py-2 text-xs">
                    <span className="text-gray-900">
                      {leadStartIndex + 1}-
                      {Math.min(leadEndIndex, filteredLeads.length)} of{' '}
                      {filteredLeads.length}
                    </span>

                    <button
                      onClick={() =>
                        setLeadCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={leadCurrentPage === 1}
                      className={`rounded-full p-1 transition ${leadCurrentPage === 1
                        ? 'text-gray-300 cursor-default'
                        : 'text-[#3b82f6]'
                        }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setLeadCurrentPage((prev) =>
                          Math.min(leadTotalPages, prev + 1)
                        )
                      }
                      disabled={leadCurrentPage === leadTotalPages}
                      className={`rounded-full p-1 transition ${leadCurrentPage === leadTotalPages
                        ? 'text-gray-300 cursor-default'
                        : 'text-[#3b82f6]'
                        }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#151a33]">
                Employee Tracking
              </h2>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={employeeSearchQuery}
                  onChange={(e) => {
                    setEmployeeSearchQuery(e.target.value);
                    setEmployeeCurrentPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#d5dce6]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Employee Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Employee Id
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmployees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="border-b border-gray-100 hover:bg-[#f7f7ff]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={emp.avatar}
                              alt={emp.employeeName}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-xs text-gray-700">
                              {emp.employeeName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {emp.employeeId}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {emp.email}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {emp.position}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {emp.contact}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewEmployee(emp)}
                            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#6938ef]/40 text-[#6938ef] shadow-sm hover:bg-[#f3ecff]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {employeeTotalPages > 1 && (
                <div className="flex justify-end px-6 py-3 bg-transparent">
                  <div className="inline-flex items-center gap-4 rounded-full bg-white shadow-md border border-gray-200 px-4 py-2 text-xs">
                    <span className="text-gray-900">
                      {employeeStartIndex + 1}-
                      {Math.min(
                        employeeEndIndex,
                        filteredEmployees.length
                      )}{' '}
                      of {filteredEmployees.length}
                    </span>

                    <button
                      onClick={() =>
                        setEmployeeCurrentPage((prev) =>
                          Math.max(1, prev - 1)
                        )
                      }
                      disabled={employeeCurrentPage === 1}
                      className={`rounded-full p-1 transition ${employeeCurrentPage === 1
                        ? 'text-gray-300 cursor-default'
                        : 'text-[#3b82f6]'
                        }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setEmployeeCurrentPage((prev) =>
                          Math.min(employeeTotalPages, prev + 1)
                        )
                      }
                      disabled={employeeCurrentPage === employeeTotalPages}
                      className={`rounded-full p-1 transition ${employeeCurrentPage === employeeTotalPages
                        ? 'text-gray-300 cursor-default'
                        : 'text-[#3b82f6]'
                        }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TrackingDetails;