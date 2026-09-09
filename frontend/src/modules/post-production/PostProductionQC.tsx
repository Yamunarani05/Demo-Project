import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  FileCheck,
  Star,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function PostProductionQC() {
  const [reviews, setReviews] = useState([
    {
      id: 'QC-01',
      client: 'Arun & Priya',
      deliverable: '120 Curated Color Graded Photos (Batch 1)',
      editor: 'Ramesh Krishnan',
      submittedDate: 'Sep 08, 2026',
      status: 'Pending Review',
      notes: 'Natural skin tones calibrated; highlight roll-off smoothed for afternoon tea garden shots.',
    },
    {
      id: 'QC-02',
      client: 'Karthik & Divya',
      deliverable: 'Save The Date Cinematic Reel (9:16)',
      editor: 'Vijay Anand',
      submittedDate: 'Sep 07, 2026',
      status: 'Approved',
      notes: 'Audio master synced with beat drops; licensed track audio cleared.',
    },
    {
      id: 'QC-03',
      client: 'Siddharth & Meera',
      deliverable: 'Custom Album 30-Page Proof (Leatherette)',
      editor: 'Harika Naidu',
      submittedDate: 'Sep 06, 2026',
      status: 'Revision Requested',
      notes: 'Increase bleed margins on page 14-15 spread; reposition couple quote.',
    },
  ]);

  const handleApprove = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    toast.success(`Deliverable ${id} passed QC and marked ready for client delivery!`);
  };

  const handleRequestRevision = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Revision Requested' } : r));
    toast.error(`Deliverable ${id} sent back to editor with revision notes.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">QUALITY CONTROL (QC) INSPECTION</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Review editor work, verify audio/color grading standards, and approve for client delivery</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Review Queue</h2>
          <span className="text-xs font-semibold text-purple-600">3 Deliverables in Pipeline</span>
        </div>

        <div className="divide-y divide-slate-100">
          {reviews.map(item => (
            <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-purple-600 uppercase tracking-wider">{item.id}</span>
                  <span className="text-slate-300">•</span>
                  <h3 className="text-sm font-bold text-slate-900">{item.deliverable}</h3>
                </div>
                <div className="text-xs text-slate-500">
                  Client: <span className="font-semibold text-slate-700">{item.client}</span> • Editor: <span className="font-semibold text-slate-700">{item.editor}</span>
                </div>
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                  "{item.notes}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-center ${
                  item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  item.status === 'Revision Requested' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {item.status}
                </span>

                {item.status === 'Pending Review' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleRequestRevision(item.id)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle size={13} /> Rework
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
