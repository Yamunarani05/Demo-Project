import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function PostProductionTasks() {
  const [activeRole, setActiveRole] = useState('all');

  const editingDisciplines = [
    { key: 'all', label: 'All Disciplines' },
    { key: 'retouch', label: 'Retouch Photo' },
    { key: 'save_the_date', label: 'Save The Date' },
    { key: 'candid_video', label: 'Candid Video' },
    { key: 'traditional_video', label: 'Traditional Video' },
    { key: 'album_design', label: 'Album Design' },
    { key: 'magazine_design', label: 'Magazine Design' },
    { key: 'frame_design', label: 'Frame Design' },
  ];

  const [tasks, setTasks] = useState([
    {
      id: 'T-101',
      client: 'Arun & Priya (Pre-Wedding)',
      discipline: 'retouch',
      disciplineLabel: 'Retouch Photo',
      editor: 'Ramesh Krishnan',
      progress: '68/120 Photos',
      percent: 56,
      dueDate: 'Sep 18, 2026',
      status: 'In Progress',
      priority: 'High',
    },
    {
      id: 'T-102',
      client: 'Arun & Priya (Pre-Wedding)',
      discipline: 'candid_video',
      disciplineLabel: 'Candid Video (60s Teaser)',
      editor: 'Vijay Anand',
      progress: 'Rough Cut Ready',
      percent: 75,
      dueDate: 'Sep 20, 2026',
      status: 'Internal Review',
      priority: 'High',
    },
    {
      id: 'T-103',
      client: 'Siddharth & Meera (Pre-Wedding)',
      discipline: 'save_the_date',
      disciplineLabel: 'Save The Date Post',
      editor: 'Anita Sharma',
      progress: '3 Layout Variations',
      percent: 100,
      dueDate: 'Sep 14, 2026',
      status: 'Ready for QC',
      priority: 'Medium',
    },
    {
      id: 'T-104',
      client: 'Karthik & Divya (Wedding)',
      discipline: 'album_design',
      disciplineLabel: 'Royal Wedding Album',
      editor: 'Harika Naidu',
      progress: '12/40 Spreads',
      percent: 30,
      dueDate: 'Oct 05, 2026',
      status: 'In Progress',
      priority: 'Medium',
    },
    {
      id: 'T-105',
      client: 'Vikramaditya & Ananya',
      discipline: 'traditional_video',
      disciplineLabel: 'Traditional Video Film',
      editor: 'Suresh Kumar',
      progress: 'Audio Syncing Phase',
      percent: 40,
      dueDate: 'Oct 10, 2026',
      status: 'In Progress',
      priority: 'Low',
    },
  ]);

  const filteredTasks = activeRole === 'all'
    ? tasks
    : tasks.filter(t => t.discipline === activeRole);

  const handleAdvanceStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'In Progress' ? 'Internal Review' : t.status === 'Internal Review' ? 'Ready for QC' : 'Approved for Delivery';
        toast.success(`Task ${t.id} transitioned to: ${nextStatus}`);
        return { ...t, status: nextStatus, percent: Math.min(100, t.percent + 25) };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">EDITING & DESIGN QUEUE</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Multi-role task management across photo retouching, films & custom album layouts</p>
        </div>
      </div>

      {/* Disciplines Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {editingDisciplines.map(d => (
          <button
            key={d.key}
            onClick={() => setActiveRole(d.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeRole === d.key
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-purple-300 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-600 uppercase tracking-wider">{task.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                task.status === 'Ready for QC' ? 'bg-blue-100 text-blue-700' :
                task.status === 'Approved for Delivery' ? 'bg-emerald-100 text-emerald-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {task.status}
              </span>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase">{task.disciplineLabel}</div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">{task.client}</h2>
              <div className="text-xs text-slate-500 mt-1">Lead Editor: <span className="font-semibold text-slate-700">{task.editor}</span></div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Progress: {task.progress}</span>
                <span>{task.percent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${task.percent}%` }} />
              </div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between pt-1">
                <span>Due Date:</span>
                <span className="font-bold text-slate-600">{task.dueDate}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-[11px] font-bold ${task.priority === 'High' ? 'text-red-500' : 'text-slate-500'}`}>
                {task.priority} Priority
              </span>
              <button
                onClick={() => handleAdvanceStatus(task.id)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                Advance Phase <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
