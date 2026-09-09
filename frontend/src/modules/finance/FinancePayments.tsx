import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Building2,
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function FinancePayments() {
  const [payments] = useState([
    {
      id: 'PAY-1001',
      invoiceNumber: 'INV-2026-001',
      client: 'Arun & Priya',
      amount: 60000,
      method: 'Razorpay UPI (Axis Bank)',
      date: 'Aug 22, 2026',
      referenceId: 'pay_PQR182939102',
      status: 'Verified',
    },
    {
      id: 'PAY-1002',
      invoiceNumber: 'INV-2026-002',
      client: 'Karthik & Divya',
      amount: 200000,
      method: 'NEFT / RTGS (HDFC Bank)',
      date: 'Aug 15, 2026',
      referenceId: 'UTR-HDFC-9918231',
      status: 'Verified',
    },
    {
      id: 'PAY-1003',
      invoiceNumber: 'INV-2026-002',
      client: 'Karthik & Divya',
      amount: 150000,
      method: 'Razorpay Credit Card',
      date: 'Sep 01, 2026',
      referenceId: 'pay_CRD998127361',
      status: 'Verified',
    },
    {
      id: 'PAY-1004',
      invoiceNumber: 'INV-2026-004',
      client: 'Karan & Rhea Batra',
      amount: 150000,
      method: 'Google Pay UPI',
      date: 'Sep 05, 2026',
      referenceId: 'UPI-REF-8871625',
      status: 'Verified',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">PAYMENTS & RAZORPAY</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Transaction audit trail, payment gateway webhooks & verified bank credits</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Transaction History</h2>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ShieldCheck size={14} /> 100% Encrypted & Bank Reconciled
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {payments.map(pay => (
            <div key={pay.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-600">{pay.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-900">{pay.client}</span>
                  <span className="text-slate-400 text-xs font-mono">({pay.invoiceNumber})</span>
                </div>
                <div className="text-xs text-slate-500">
                  Method: <span className="font-semibold text-slate-700">{pay.method}</span> • Ref: <span className="font-mono text-slate-600">{pay.referenceId}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-base font-black text-slate-900">₹{pay.amount.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{pay.date}</div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  {pay.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
