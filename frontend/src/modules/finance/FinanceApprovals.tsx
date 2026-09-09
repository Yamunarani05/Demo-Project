import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function FinanceApprovals() {
  const [approvals, setApprovals] = useState([
    {
      id: 'APP-01',
      client: 'Aditya Joshi & Pooja Sen',
      type: '10% Seasonal Early Bird Discount',
      amount: 12000,
      requestedBy: 'Rahul Mehta (Sales)',
      date: 'Sep 06, 2026',
      status: 'Pending',
    },
    {
      id: 'APP-02',
      client: 'Arun & Priya',
      type: 'Complimentary Mini Teaser Video Addon',
      amount: 15000,
      requestedBy: 'Priya Sharma (Admin)',
      date: 'Sep 04, 2026',
      status: 'Approved',
    },
    {
      id: 'APP-03',
      client: 'Vikramaditya Singhania',
      type: 'Custom Luxury Drone Multi-Day Rate Waiver',
      amount: 25000,
      requestedBy: 'Priya Sharma (Admin)',
      date: 'Sep 02, 2026',
      status: 'Approved',
    },
  ]);

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
    if (action === 'Approved') toast.success(`Approval ${id} granted!`);
    else toast.error(`Approval ${id} rejected.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">FINANCIAL APPROVALS</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Review discount authorizations, addon waivers & payment exceptions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Approval Requests</h2>
          <span className="text-xs text-purple-600 font-bold">Studio Aurora Governance</span>
        </div>

        <div className="divide-y divide-slate-100">
          {approvals.map(item => (
            <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-600">{item.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm font-bold text-slate-900">{item.type}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Client: <span className="font-semibold text-slate-700">{item.client}</span> • Requested by: <span className="font-semibold text-slate-700">{item.requestedBy}</span> ({item.date})
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-base font-black text-slate-900">₹{item.amount.toLocaleString()}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {item.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(item.id, 'Approved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'Rejected')}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
