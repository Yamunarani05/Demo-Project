import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  UserPlus,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  User,
  ShieldCheck
} from 'lucide-react';

interface AssignLeadItem {
  id: string;
  leadCode: string;
  leadName: string;
  contactNumber: string;
  createdTime: string;
  email: string;
  employeePartner: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Review' | 'Done';
}

const INITIAL_ASSIGN_LEADS: AssignLeadItem[] = [
  {
    id: '1',
    leadCode: 'LD-07',
    leadName: 'Hems S',
    contactNumber: '1234568761',
    createdTime: '04/09/2026',
    email: 'svennimalaimohan6@gmail.com',
    employeePartner: 'Unassigned',
    priority: 'Medium',
    status: 'To Do',
  },
  {
    id: '2',
    leadCode: 'LD-06',
    leadName: 'Mohan S',
    contactNumber: '9361880503',
    createdTime: '24/08/2026',
    email: 'svennimalaimohan86@gmail.com',
    employeePartner: 'Krishna S',
    priority: 'Medium',
    status: 'In Review',
  },
  {
    id: '3',
    leadCode: 'RAS-03',
    leadName: 'Kavitha S',
    contactNumber: '9790123456',
    createdTime: '22/08/2026',
    email: 'mukilanbalakrishnan7@gmail.com',
    employeePartner: 'emp p',
    priority: 'Low',
    status: 'Done',
  },
  {
    id: '4',
    leadCode: 'RAS-01',
    leadName: 'Suryaa M',
    contactNumber: '9944233056',
    createdTime: '22/08/2026',
    email: 'test@gmail.com',
    employeePartner: 'emp p',
    priority: 'Low',
    status: 'To Do',
  },
];

export default function SalesAssignLeads() {
  const [leads, setLeads] = useState<AssignLeadItem[]>(INITIAL_ASSIGN_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState<AssignLeadItem | null>(null);

  // Modal State
  const [targetLeadId, setTargetLeadId] = useState(INITIAL_ASSIGN_LEADS[0].id);
  const [assignedStaff, setAssignedStaff] = useState('Krishna S');
  const [assignedPriority, setAssignedPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const employeesList = ['Krishna S', 'emp p', 'Priya Sharma', 'Rahul Mehta', 'Arjun Reddy'];

  const filteredLeads = leads.filter((l) =>
    l.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.leadCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.employeePartner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeads((prev) =>
      prev.map((l) =>
        l.id === targetLeadId
          ? { ...l, employeePartner: assignedStaff, priority: assignedPriority, status: 'In Review' }
          : l
      )
    );
    setIsAssignModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17152B] tracking-tight uppercase">
            ASSIGN LEADS
          </h1>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5B42F3] hover:bg-[#4E35E0] transition-all shadow-md shadow-[#5B42F3]/25 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={15} />
          <span>Assign Employee / Partner</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B42F3] transition-all shadow-2xs"
          />
        </div>

        <button
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Filter Options"
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Table matching Screenshot 3 */}
      <div className="bg-white border border-[#E5E1F2] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#17152B]">
            <thead className="bg-[#F8F9FD] text-[#68647A] text-[11px] font-black uppercase tracking-wider border-b border-[#E5E1F2]">
              <tr>
                <th className="py-4 px-4 w-10">
                  <div className="w-4 h-4 rounded border border-slate-300" />
                </th>
                <th className="py-4 px-4">LEAD ID</th>
                <th className="py-4 px-4">LEAD NAME</th>
                <th className="py-4 px-4">CONTACT NUMBER</th>
                <th className="py-4 px-4">CREATED TIME</th>
                <th className="py-4 px-4">EMAIL</th>
                <th className="py-4 px-4">EMPLOYEE / PARTNER</th>
                <th className="py-4 px-4">PRIORITY</th>
                <th className="py-4 px-4 text-center">STATUS</th>
                <th className="py-4 px-4 text-center">VIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1F2]">
              {filteredLeads.map((lead, idx) => {
                const isSelected = selectedIds.includes(lead.id);
                return (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`hover:bg-[#F8F6FF]/60 transition-colors ${
                      isSelected ? 'bg-purple-50/40' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div
                        onClick={() => toggleSelect(lead.id)}
                        className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#5B42F3] border-[#5B42F3]'
                            : 'border-slate-300 hover:border-purple-400'
                        }`}
                      >
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800">
                      {lead.leadCode}
                    </td>

                    <td className="py-4 px-4 font-extrabold text-[#17152B]">
                      {lead.leadName}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600">
                      {lead.contactNumber}
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {lead.createdTime}
                    </td>

                    <td className="py-4 px-4 text-slate-600 max-w-[180px] truncate">
                      {lead.email}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800">
                      {lead.employeePartner}
                    </td>

                    {/* Priority with arrows matching Screenshot 3 */}
                    <td className="py-4 px-4 font-bold">
                      {lead.priority === 'High' && (
                        <span className="text-rose-500 flex items-center gap-1 font-bold">
                          High <ArrowUp size={13} />
                        </span>
                      )}
                      {lead.priority === 'Medium' && (
                        <span className="text-orange-500 flex items-center gap-1 font-bold">
                          Medium <ArrowUp size={13} />
                        </span>
                      )}
                      {lead.priority === 'Low' && (
                        <span className="text-emerald-500 flex items-center gap-1 font-bold">
                          Low <ArrowDown size={13} />
                        </span>
                      )}
                    </td>

                    {/* Status Pills */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${
                          lead.status === 'Done'
                            ? 'bg-[#ECFDF5] text-[#10B981]'
                            : lead.status === 'In Review'
                            ? 'bg-[#ECE8FD] text-[#6938ef]'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    {/* View Button */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedLeadForAssign(lead);
                          setTargetLeadId(lead.id);
                          setIsAssignModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-[#5B42F3] bg-[#ECE8FD] hover:bg-purple-200 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1F2] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E1F2]">
                <h3 className="font-extrabold text-base text-[#17152B]">Assign Employee / Partner</h3>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Select Lead *
                  </label>
                  <select
                    value={targetLeadId}
                    onChange={(e) => setTargetLeadId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B42F3] font-bold text-[#17152B]"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.leadCode} - {l.leadName} ({l.employeePartner})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Assign to Employee / Partner *
                  </label>
                  <select
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B42F3] font-bold text-[#17152B]"
                  >
                    {employeesList.map((emp) => (
                      <option key={emp} value={emp}>
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Low', 'Medium', 'High'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAssignedPriority(p)}
                        className={`py-2 rounded-xl font-bold border transition-colors ${
                          assignedPriority === p
                            ? 'bg-[#5B42F3] text-white border-[#5B42F3]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E1F2] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#5B42F3] hover:bg-[#4E35E0] text-white font-bold rounded-xl shadow-md shadow-[#5B42F3]/25"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
