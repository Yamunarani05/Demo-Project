import React, { useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  CreditCard,
  Building2,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function FinanceInvoices() {
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2026-001',
      client: 'Arun & Priya',
      eventType: 'Pre-Wedding Royal Suite',
      totalAmount: 185000,
      discount: 10000,
      paidAmount: 60000,
      balance: 115000,
      billingDate: '2026-08-22',
      dueDate: '2026-09-15',
      paymentStatus: 'Partial Payment',
      approvalStatus: 'Approved',
    },
    {
      id: 'INV-2026-002',
      client: 'Karthik & Divya',
      eventType: 'Complete Wedding Suite (3 Days)',
      totalAmount: 350000,
      discount: 0,
      paidAmount: 350000,
      balance: 0,
      billingDate: '2026-08-15',
      dueDate: '2026-09-28',
      paymentStatus: 'Paid',
      approvalStatus: 'Approved',
    },
    {
      id: 'INV-2026-003',
      client: 'Siddharth & Meera',
      eventType: 'Cinematic Pre-Wedding Shoot',
      totalAmount: 45000,
      discount: 5000,
      paidAmount: 0,
      balance: 40000,
      billingDate: '2026-09-02',
      dueDate: '2026-09-20',
      paymentStatus: 'Unpaid',
      approvalStatus: 'Pending',
    },
    {
      id: 'INV-2026-004',
      client: 'Karan & Rhea Batra',
      eventType: 'Traditional Engagement',
      totalAmount: 40000,
      discount: 0,
      paidAmount: 15000,
      balance: 25000,
      billingDate: '2026-09-05',
      dueDate: '2026-10-10',
      paymentStatus: 'Partial Payment',
      approvalStatus: 'Approved',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(i =>
    i.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">INVOICES & BILLING</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Generate milestone invoices, track outstanding balances & export PDF receipts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.success('New Invoice Wizard initialized')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md shadow-purple-600/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Billed</span>
          <div className="text-2xl font-black text-slate-900 mt-1">₹6,20,000</div>
          <span className="text-[11px] text-purple-600 font-semibold">Across active client bookings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Collected</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹4,25,000</div>
          <span className="text-[11px] text-emerald-600 font-semibold">68.5% recovery rate</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Balance Pending</span>
          <div className="text-2xl font-black text-amber-600 mt-1">₹1,95,000</div>
          <span className="text-[11px] text-amber-600 font-semibold">Due on shoot completion</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client or invoice number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Invoice ID</th>
                <th className="py-3.5 px-4">Client Name</th>
                <th className="py-3.5 px-4">Shoot Package</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-600">{inv.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{inv.client}</td>
                  <td className="py-3.5 px-4 text-slate-600">{inv.eventType}</td>
                  <td className="py-3.5 px-4 font-bold">₹{inv.totalAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">₹{inv.paidAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-600">₹{inv.balance.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      inv.paymentStatus === 'Partial Payment' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toast.success(`PDF receipt generated for ${inv.id}`)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all"
                      title="Download PDF"
                    >
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
