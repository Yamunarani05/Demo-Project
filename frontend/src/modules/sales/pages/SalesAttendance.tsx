import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AttendanceRow {
  id: string;
  employeeName: string;
  role: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Absent';
}

const ATTENDANCE_ROWS: AttendanceRow[] = [
  { id: '1', employeeName: 'Krishna S', role: 'Lead Manager', date: '05/09/2026', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'Present' },
  { id: '2', employeeName: 'emp p', role: 'Sales Executive', date: '05/09/2026', checkIn: '09:45 AM', checkOut: '06:45 PM', status: 'Late' },
  { id: '3', employeeName: 'Priya Sharma', role: 'Senior Client Associate', date: '05/09/2026', checkIn: '09:05 AM', checkOut: '06:15 PM', status: 'Present' },
  { id: '4', employeeName: 'Arjun Reddy', role: 'Cinematography Consultant', date: '05/09/2026', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present' },
  { id: '5', employeeName: 'Rahul Mehta', role: 'Field Account Manager', date: '05/09/2026', checkIn: '—', checkOut: '—', status: 'Absent' },
];

import { api } from '../../../services/api';

export default function SalesAttendance() {
  const [rows, setRows] = useState<AttendanceRow[]>(ATTENDANCE_ROWS);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    api.getSalesAttendance()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped: AttendanceRow[] = res.data.map((item: any, idx: number) => ({
            id: item.id || String(idx + 1),
            employeeName: item.employee_name || item.employeeName || 'Staff Member',
            role: item.role || 'Sales Associate',
            date: item.date ? new Date(item.date).toLocaleDateString('en-GB') : (item.date || '05/09/2026'),
            checkIn: item.check_in || item.checkIn || '09:00 AM',
            checkOut: item.check_out || item.checkOut || '06:00 PM',
            status: item.status || 'Present',
          }));
          setRows(mapped);
        }
      })
      .catch((err) => console.warn('Using cached attendance rows:', err));
  }, []);

  const filtered = rows.filter((r) =>
    r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-black text-[#17152B] tracking-tight uppercase">
          Attendance
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#5B42F3] transition-all shadow-2xs"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E5E1F2] rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-[#17152B]">
          <thead className="bg-[#F8F9FD] text-[#68647A] text-[11px] font-black uppercase tracking-wider border-b border-[#E5E1F2]">
            <tr>
              <th className="py-4 px-4">EMPLOYEE NAME</th>
              <th className="py-4 px-4">ROLE</th>
              <th className="py-4 px-4">DATE</th>
              <th className="py-4 px-4">CHECK IN</th>
              <th className="py-4 px-4">CHECK OUT</th>
              <th className="py-4 px-4 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1F2]">
            {filtered.map((r, idx) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="hover:bg-[#F8F6FF]/60 transition-colors"
              >
                <td className="py-4 px-4 font-extrabold text-[#17152B]">{r.employeeName}</td>
                <td className="py-4 px-4 text-slate-600 font-medium">{r.role}</td>
                <td className="py-4 px-4 text-slate-600">{r.date}</td>
                <td className="py-4 px-4 font-mono text-slate-700">{r.checkIn}</td>
                <td className="py-4 px-4 font-mono text-slate-700">{r.checkOut}</td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${
                      r.status === 'Present'
                        ? 'bg-[#ECFDF5] text-[#10B981]'
                        : r.status === 'Late'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-[#FEE2E2] text-[#EF4444]'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
