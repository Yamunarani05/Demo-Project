import React, { useState } from 'react';
import {
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Camera,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionCardCheckIn() {
  const [cards, setCards] = useState([
    { id: 'C-01', camera: 'Sony A7 IV (Lead Photo)', type: 'CFexpress Type A (160 GB)', count: 2, files: '1,420 RAW', status: 'Checked In' },
    { id: 'C-02', camera: 'Sony FX3 (Cine Video)', type: 'SDXC V90 (256 GB)', count: 2, files: '28 Clips (4K 10-bit)', status: 'Checked In' },
    { id: 'C-03', camera: 'DJI Mavic 3 Pro (Drone)', type: 'MicroSD (128 GB)', count: 1, files: '14 Aerial Clips', status: 'Pending Verification' },
  ]);

  const [notes, setNotes] = useState('');

  const handleVerifyAll = () => {
    setCards(prev => prev.map(c => ({ ...c, status: 'Checked In & Verified' })));
    toast.success('All production storage media checked in and verified for RAW ingest!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">MEDIA CARD HANDOFF</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Handoff of camera storage cards from field crew to Data Manager</p>
        </div>
        <button
          onClick={handleVerifyAll}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md shadow-purple-600/25 flex items-center gap-1.5"
        >
          <CheckCircle2 size={15} />
          <span>Verify & Advance to Post-Production</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Shoot: Arun & Priya (Pre-Wedding)</h2>
          <span className="text-xs text-slate-500 font-bold">544 GB Total Captured</span>
        </div>

        <div className="divide-y divide-slate-100">
          {cards.map(card => (
            <div key={card.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  <HardDrive size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{card.camera}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{card.type} • {card.count} Card(s)</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">{card.files}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    {card.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
