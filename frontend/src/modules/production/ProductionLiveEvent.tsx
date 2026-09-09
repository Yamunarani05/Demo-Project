import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionLiveEvent() {
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'running' | 'paused' | 'completed'>('running');
  const [seconds, setSeconds] = useState(7340); // 2h 02m 20s elapsed

  const [shotItems, setShotItems] = useState([
    { id: 1, text: 'Golden hour couple walking hand-in-hand through tea rows', done: true, time: '06:30 AM' },
    { id: 2, text: 'Drone 360-degree aerial orbit over the misty hills', done: true, time: '07:15 AM' },
    { id: 3, text: 'Close-up bride emotional portrait with soft veil backlight', done: true, time: '08:00 AM' },
    { id: 4, text: 'Slow-motion 4K gimbal sequence along the lake pier', done: false, time: '09:30 AM' },
    { id: 5, text: 'Traditional attire portrait by the stone arches', done: false, time: '11:00 AM' },
    { id: 6, text: 'Sunset silhouette with lantern and warm candle reflections', done: false, time: '05:45 PM' },
  ]);

  useEffect(() => {
    let interval: any = null;
    if (timerStatus === 'running') {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStatus]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleShot = (id: number) => {
    setShotItems(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-purple-600 uppercase tracking-widest">LIVE SESSION IN PROGRESS</span>
          <h1 className="text-xl font-black text-slate-900 mt-1">Arun & Priya Royal Pre-Wedding Shoot</h1>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
            <MapPin size={13} /> Avalanche Lake & Pine Forest, Ooty
          </p>
        </div>

        {/* Runtime Counter */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-emerald-400 font-mono text-2xl font-bold px-4 py-2 rounded-xl tracking-wider shadow-inner">
            {formatTime(seconds)}
          </div>
          <div className="flex items-center gap-1.5">
            {timerStatus === 'running' ? (
              <button
                onClick={() => {
                  setTimerStatus('paused');
                  toast.info('Shoot timer paused');
                }}
                className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all font-bold"
                title="Pause"
              >
                <Pause size={18} />
              </button>
            ) : (
              <button
                onClick={() => {
                  setTimerStatus('running');
                  toast.success('Shoot timer resumed');
                }}
                className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all font-bold"
                title="Resume"
              >
                <Play size={18} />
              </button>
            )}

            <button
              onClick={() => {
                setTimerStatus('completed');
                toast.success('Shoot marked completed! Ready for memory card handoff.');
              }}
              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold"
              title="End Shoot"
            >
              <Square size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Shot Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Shot List ({shotItems.filter(s => s.done).length}/{shotItems.length} Completed)
          </h2>
          <span className="text-xs font-semibold text-slate-500">Tap item to check-off</span>
        </div>

        <div className="space-y-2.5">
          {shotItems.map(shot => (
            <div
              key={shot.id}
              onClick={() => toggleShot(shot.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                shot.done
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  shot.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {shot.done && <CheckCircle2 size={14} />}
                </div>
                <span className={`text-xs font-semibold ${shot.done ? 'line-through text-slate-400' : ''}`}>
                  {shot.text}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-bold">{shot.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
