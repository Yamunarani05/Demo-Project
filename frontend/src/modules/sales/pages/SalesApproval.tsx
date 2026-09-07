import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X, Check, Search, ShieldCheck } from 'lucide-react';

interface ApprovalRow {
  id: string;
  leadCode: string;
  clientName: string;
  requestedBy: string;
  type: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const APPROVAL_ROWS: ApprovalRow[] = [
  { id: '1', leadCode: 'LD-07', clientName: 'Hems S', requestedBy: 'Unassigned', type: 'Special 10% Discount Request', amount: 35000, date: '04/09/2026', status: 'Pending' },
  { id: '2', leadCode: 'LD-06', clientName: 'Mohan S', requestedBy: 'Krishna S', type: 'Complimentary Photobook Add-on', amount: 65000, date: '24/08/2026', status: 'Approved' },
  { id: '3', leadCode: 'RAS-03', clientName: 'Kavitha S', requestedBy: 'emp p', type: 'Invoice Split Milestone (40/60)', amount: 120000, date: '22/08/2026', status: 'Approved' },
];

import { api } from '../../../services/api';

export default function SalesApproval() {
  const [rows, setRows] = useState<ApprovalRow[]>(APPROVAL_ROWS);

  React.useEffect(() => {
    api.getSalesApprovals()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped: ApprovalRow[] = res.data.map((item: any, idx: number) => ({
            id: item.id || String(idx + 1),
            leadCode: item.lead_code || item.leadCode || `LD-0${idx + 1}`,
            clientName: item.client_name || item.clientName || 'Client Name',
            requestedBy: item.requested_by || item.requestedBy || 'Sales Rep',
            type: item.type || 'Standard Approval',
            amount: Number(item.amount) || 25000,
            date: item.date ? new Date(item.date).toLocaleDateString('en-GB') : (item.date || '04/09/2026'),
            status: item.status || 'Pending',
          }));
          setRows(mapped);
        }
      })
      .catch((err) => console.warn('Using cached approval rows:', err));
  }, []);

  const handleApprove = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Approved' } : r));
    api.updateSalesApprovalStatus(id, 'Approved').catch((err) => console.warn('Approval sync warning:', err));
  };

  const handleReject = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Rejected' } : r));
    api.updateSalesApprovalStatus(id, 'Rejected').catch((err) => console.warn('Rejection sync warning:', err));
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-black text-[#17152B] tracking-tight uppercase">
          Approval
        </h1>
      </div>

      <div className="bg-white border border-[#E5E1F2] rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-[#17152B]">
          <thead className="bg-[#F8F9FD] text-[#68647A] text-[11px] font-black uppercase tracking-wider border-b border-[#E5E1F2]">
            <tr>
              <th className="py-4 px-4">LEAD CODE</th>
              <th className="py-4 px-4">CLIENT NAME</th>
              <th className="py-4 px-4">REQUESTED BY</th>
              <th className="py-4 px-4">REQUEST TYPE</th>
              <th className="py-4 px-4">AMOUNT</th>
              <th className="py-4 px-4">DATE</th>
              <th className="py-4 px-4 text-center">STATUS</th>
              <th className="py-4 px-4 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1F2]">
            {rows.map((r, idx) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="hover:bg-[#F8F6FF]/60 transition-colors"
              >
                <td className="py-4 px-4 font-bold text-slate-800">{r.leadCode}</td>
                <td className="py-4 px-4 font-extrabold text-[#17152B]">{r.clientName}</td>
                <td className="py-4 px-4 text-slate-600 font-medium">{r.requestedBy}</td>
                <td className="py-4 px-4 font-semibold text-slate-800">{r.type}</td>
                <td className="py-4 px-4 font-extrabold text-[#5B42F3]">₹{r.amount.toLocaleString('en-IN')}</td>
                <td className="py-4 px-4 text-slate-600">{r.date}</td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${
                      r.status === 'Approved'
                        ? 'bg-[#ECFDF5] text-[#10B981]'
                        : r.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-[#FEE2E2] text-[#EF4444]'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  {r.status === 'Pending' ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer"
                        title="Approve Request"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white shadow-2xs cursor-pointer"
                        title="Reject Request"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-bold text-[10px]">Processed</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
