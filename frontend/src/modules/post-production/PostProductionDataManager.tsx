import React, { useState } from 'react';
import {
  HardDrive,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';

export default function PostProductionDataManager() {
  const [drives, setDrives] = useState([
    {
      id: 'DRV-101',
      client: 'Arun & Priya (Pre-Wedding)',
      pixstudioUrl: 'https://drive.google.com/drive/folders/pixstudio-raw-client1',
      pixofficeUrl: 'https://drive.google.com/drive/folders/pixoffice-verified-client1',
      totalRawGb: 544,
      status: 'Verified & Dual-Backed',
      verifiedDate: 'Sep 04, 2026',
      dataManager: 'Suresh Kumar',
    },
    {
      id: 'DRV-102',
      client: 'Karthik & Divya (Wedding)',
      pixstudioUrl: 'https://drive.google.com/drive/folders/pixstudio-raw-client2',
      pixofficeUrl: 'https://drive.google.com/drive/folders/pixoffice-verified-client2',
      totalRawGb: 1024,
      status: 'Ingest In Progress',
      verifiedDate: 'Pending',
      dataManager: 'Suresh Kumar',
    },
    {
      id: 'DRV-103',
      client: 'Siddharth & Meera',
      pixstudioUrl: 'https://drive.google.com/drive/folders/pixstudio-raw-client3',
      pixofficeUrl: 'https://drive.google.com/drive/folders/pixoffice-verified-client3',
      totalRawGb: 380,
      status: 'Verified & Dual-Backed',
      verifiedDate: 'Sep 01, 2026',
      dataManager: 'Suresh Kumar',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">PIXSTUDIO & PIXOFFICE STORAGE</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">RAW card ingest, secondary cloud redundancy & studio drive archive management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Database size={15} /> Total RAW Ingested</span>
          <div className="text-2xl font-black text-slate-900">1.94 TB</div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% data integrity verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Cloud size={15} /> Pixstudio Cloud Drives</span>
          <div className="text-2xl font-black text-slate-900">3 Active</div>
          <span className="text-[11px] text-purple-600 font-semibold">Unlimited Google Workspace Vault</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><HardDrive size={15} /> Pixoffice Local NAS</span>
          <div className="text-2xl font-black text-slate-900">Synology 64 TB</div>
          <span className="text-[11px] text-slate-500 font-semibold">RAID-6 redundancy online</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Project Cloud Drives</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {drives.map(drive => (
            <div key={drive.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-purple-600 uppercase tracking-wider">{drive.id}</span>
                  <span className="text-slate-300">•</span>
                  <h3 className="text-sm font-bold text-slate-900">{drive.client}</h3>
                </div>
                <div className="text-xs text-slate-500">
                  Size: <span className="font-semibold text-slate-700">{drive.totalRawGb} GB RAW</span> • Data Manager: <span className="font-semibold text-slate-700">{drive.dataManager}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={drive.pixstudioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 transition-all text-xs font-bold flex items-center gap-1"
                >
                  Pixstudio RAW <ExternalLink size={12} />
                </a>

                <a
                  href={drive.pixofficeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all text-xs font-bold flex items-center gap-1"
                >
                  Pixoffice Verified <ExternalLink size={12} />
                </a>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  drive.status.includes('Verified') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {drive.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
