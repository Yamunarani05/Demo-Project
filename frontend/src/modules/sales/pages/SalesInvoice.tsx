import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Printer,
  CheckCircle2
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  leadId: string;
  leadName: string;
  contactId: string;
  invoiceId: string;
  billingDate: string;
  assignedInitials: string;
  assignedColor: string;
  employeeAssigned: string;
  plan: string;
  payment: 'Paid' | 'Partial Payment' | '—';
  status: 'Approved' | 'Not Approved';
  amount?: number;
}

const INVOICE_ROWS: InvoiceItem[] = [
  {
    id: '1',
    leadId: 'LD-07',
    leadName: 'Hems S',
    contactId: '1234568761',
    invoiceId: '—',
    billingDate: '—',
    assignedInitials: 'N',
    assignedColor: 'bg-purple-100 text-purple-700',
    employeeAssigned: 'Not Assigned',
    plan: '—',
    payment: '—',
    status: 'Not Approved',
    amount: 35000,
  },
  {
    id: '2',
    leadId: 'LD-06',
    leadName: 'Mohan S',
    contactId: '9361880503',
    invoiceId: 'INV166',
    billingDate: '8/24/2026',
    assignedInitials: 'K',
    assignedColor: 'bg-purple-600 text-white',
    employeeAssigned: 'Krishna S',
    plan: 'Basic',
    payment: 'Paid',
    status: 'Approved',
    amount: 65000,
  },
  {
    id: '3',
    leadId: 'LD-06',
    leadName: 'Mohan S',
    contactId: '9361880503',
    invoiceId: 'INV165',
    billingDate: '8/24/2026',
    assignedInitials: 'K',
    assignedColor: 'bg-purple-600 text-white',
    employeeAssigned: 'Krishna S',
    plan: 'Premium',
    payment: 'Paid',
    status: 'Approved',
    amount: 145000,
  },
  {
    id: '4',
    leadId: 'LD-06',
    leadName: 'Mohan S',
    contactId: '9361880503',
    invoiceId: '—',
    billingDate: '—',
    assignedInitials: 'K',
    assignedColor: 'bg-purple-600 text-white',
    employeeAssigned: 'Krishna S',
    plan: '—',
    payment: '—',
    status: 'Not Approved',
    amount: 50000,
  },
  {
    id: '5',
    leadId: 'RAS-03',
    leadName: 'Kavitha S',
    contactId: '9790123456',
    invoiceId: 'INV144',
    billingDate: '7/18/2026',
    assignedInitials: 'e',
    assignedColor: 'bg-purple-600 text-white',
    employeeAssigned: 'emp p',
    plan: 'Premium',
    payment: 'Paid',
    status: 'Approved',
    amount: 120000,
  },
  {
    id: '6',
    leadId: 'RAS-01',
    leadName: 'Suryaa M',
    contactId: '9944233056',
    invoiceId: 'INV143',
    billingDate: '6/16/2026',
    assignedInitials: 'e',
    assignedColor: 'bg-purple-600 text-white',
    employeeAssigned: 'emp p',
    plan: 'Standard',
    payment: 'Partial Payment',
    status: 'Approved',
    amount: 85000,
  },
];

import { api } from '../../../services/api';

export default function SalesInvoice() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INVOICE_ROWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  React.useEffect(() => {
    api.getSalesInvoices()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped: InvoiceItem[] = res.data.map((inv: any, idx: number) => ({
            id: inv.id || String(idx + 1),
            leadId: inv.lead_id || inv.leadId || `LD-0${idx + 1}`,
            leadName: inv.client_name || inv.clientName || inv.leadName || 'Client',
            contactId: inv.contact_number || inv.contactId || '9361880503',
            invoiceId: inv.invoice_number || inv.invoiceId || '—',
            billingDate: inv.billing_date ? new Date(inv.billing_date).toLocaleDateString('en-US') : (inv.billingDate || '—'),
            assignedInitials: (inv.employee_assigned || inv.employeeAssigned || 'K')[0].toUpperCase(),
            assignedColor: 'bg-purple-600 text-white',
            employeeAssigned: inv.employee_assigned || inv.employeeAssigned || 'Krishna S',
            plan: inv.plan || 'Standard',
            payment: (inv.payment_status || inv.payment || '—') as any,
            status: (inv.approval_status || inv.status || 'Approved') as any,
            amount: Number(inv.total_amount || inv.amount) || 50000,
          }));
          setInvoices(mapped);
        }
      })
      .catch((err) => console.warn('Using cached demo rows:', err));
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.leadId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.contactId.includes(searchQuery);

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'Approved' && inv.status === 'Approved') ||
      (statusFilter === 'Not Approved' && inv.status === 'Not Approved');

    const matchPlan =
      planFilter === 'ALL' || inv.plan.toLowerCase() === planFilter.toLowerCase();

    return matchSearch && matchStatus && matchPlan;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Title matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17152B] tracking-tight">
            Invoice
          </h1>
        </div>
      </div>

      {/* Filter Bar with Search, Status, Plans, and Download Report */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search id, name, contact, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B42F3] transition-all shadow-2xs"
          />
        </div>

        {/* Dropdowns & Download Button */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* All Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B42F3] transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Not Approved">Not Approved</option>
          </select>

          {/* All Plans dropdown */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B42F3] transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>

          {/* Download Invoice Report */}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Download Invoice Report</span>
          </button>
        </div>
      </div>

      {/* Invoice Table matching Screenshot 5 */}
      <div className="bg-white border border-[#E5E1F2] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#17152B]">
            <thead className="bg-[#F8F9FD] text-[#68647A] text-[11px] font-black uppercase tracking-wider border-b border-[#E5E1F2]">
              <tr>
                <th className="py-4 px-4">LEAD ID</th>
                <th className="py-4 px-4">LEAD NAME</th>
                <th className="py-4 px-4">CONTACT ID</th>
                <th className="py-4 px-4">INVOICE ID</th>
                <th className="py-4 px-4">BILLING DATE</th>
                <th className="py-4 px-4">EMPLOYEE ASSIGNED</th>
                <th className="py-4 px-4">PLAN</th>
                <th className="py-4 px-4">PAYMENT</th>
                <th className="py-4 px-4 text-center">STATUS</th>
                <th className="py-4 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1F2]">
              {filteredInvoices.map((row, idx) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="hover:bg-[#F8F6FF]/60 transition-colors"
                >
                  <td className="py-4 px-4 font-bold text-slate-800">
                    {row.leadId}
                  </td>

                  <td className="py-4 px-4 font-extrabold text-[#17152B]">
                    {row.leadName}
                  </td>

                  <td className="py-4 px-4 font-mono text-slate-600">
                    {row.contactId}
                  </td>

                  <td className="py-4 px-4 font-bold text-[#6938ef]">
                    {row.invoiceId}
                  </td>

                  <td className="py-4 px-4 text-slate-600">
                    {row.billingDate}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-sm font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs ${row.assignedColor}`}>
                        {row.assignedInitials}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {row.employeeAssigned}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-slate-700 font-medium">
                    {row.plan}
                  </td>

                  <td className="py-4 px-4">
                    {row.payment === 'Paid' && (
                      <span className="text-[#10B981] font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        Paid
                      </span>
                    )}
                    {row.payment === 'Partial Payment' && (
                      <span className="text-[#F59E0B] font-bold text-[11px] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Partial Payment
                      </span>
                    )}
                    {row.payment === '—' && (
                      <span className="text-slate-400 font-bold">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${
                        row.status === 'Approved'
                          ? 'bg-[#ECFDF5] text-[#10B981]'
                          : 'bg-[#FEE2E2] text-[#EF4444]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedInvoice(row)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-[#5B42F3] bg-[#ECE8FD] hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom footer matching Screenshot 5 */}
        <div className="p-4 border-t border-[#E5E1F2] flex items-center justify-between text-xs text-[#68647A] font-bold">
          <span>Showing 1 to {filteredInvoices.length} of {filteredInvoices.length} invoices</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-not-allowed">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-600">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Invoice Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1F2] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E1F2]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 text-[#5B42F3] rounded-xl">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#17152B]">Invoice {selectedInvoice.invoiceId}</h3>
                    <span className="text-xs text-slate-500">Lead: {selectedInvoice.leadName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Plan</span>
                    <div className="font-bold text-slate-800 mt-0.5">{selectedInvoice.plan}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Billing Date</span>
                    <div className="font-bold text-slate-800 mt-0.5">{selectedInvoice.billingDate}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Contract</span>
                    <div className="font-extrabold text-[#5B42F3] text-sm mt-0.5">
                      ₹{(selectedInvoice.amount || 65000).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Approval Status</span>
                    <div className={`font-bold mt-0.5 ${selectedInvoice.status === 'Approved' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {selectedInvoice.status}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E1F2] flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-5 py-2 bg-[#5B42F3] text-white font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
