import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Upload,
  Plus,
  X,
  Check,
  Eye,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface LeadItem {
  id: string;
  leadCode: string;
  leadName: string;
  assignedEmployee: string;
  contactNumber: string;
  createdTime: string;
  email: string;
  leadSource: string;
  status: 'To Do' | 'In Review' | 'Done';
}

const INITIAL_LEADS: LeadItem[] = [
  {
    id: '1',
    leadCode: 'LD-07',
    leadName: 'Hems S',
    assignedEmployee: 'Unassigned',
    contactNumber: '1234568761',
    createdTime: 'Sep 04, 2026',
    email: 'svennimalaimohan6@gmail.com',
    leadSource: 'Website',
    status: 'To Do',
  },
  {
    id: '2',
    leadCode: 'LD-06',
    leadName: 'Mohan S',
    assignedEmployee: 'Krishna S',
    contactNumber: '9361880503',
    createdTime: 'Aug 24, 2026',
    email: 'svennimalaimohan86@gmail.com',
    leadSource: 'Website',
    status: 'In Review',
  },
  {
    id: '3',
    leadCode: 'RAS-03',
    leadName: 'Kavitha S',
    assignedEmployee: 'emp p',
    contactNumber: '9790123456',
    createdTime: 'Aug 22, 2026',
    email: 'mukilanbalakrishnan7@gmail.com',
    leadSource: 'Website',
    status: 'Done',
  },
  {
    id: '4',
    leadCode: 'RAS-01',
    leadName: 'Suryaa M',
    assignedEmployee: 'emp p',
    contactNumber: '9944233056',
    createdTime: 'Aug 22, 2026',
    email: 'test@gmail.com',
    leadSource: 'Website',
    status: 'To Do',
  },
];

export default function SalesViewLeads() {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Form for new lead
  const [newLeadForm, setNewLeadForm] = useState({
    leadName: '',
    contactNumber: '',
    email: '',
    assignedEmployee: 'Unassigned',
    leadSource: 'Website',
    status: 'To Do' as 'To Do' | 'In Review' | 'Done',
  });

  const filteredLeads = leads.filter((l) =>
    l.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.leadCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.contactNumber.includes(searchQuery)
  );

  const toggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextCode = `LD-${String(leads.length + 8).padStart(2, '0')}`;
    const newRecord: LeadItem = {
      id: String(Date.now()),
      leadCode: nextCode,
      leadName: newLeadForm.leadName,
      contactNumber: newLeadForm.contactNumber,
      email: newLeadForm.email || 'client@gmail.com',
      assignedEmployee: newLeadForm.assignedEmployee,
      createdTime: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      leadSource: newLeadForm.leadSource,
      status: newLeadForm.status,
    };
    setLeads([newRecord, ...leads]);
    setIsAddModalOpen(false);
    setNewLeadForm({
      leadName: '',
      contactNumber: '',
      email: '',
      assignedEmployee: 'Unassigned',
      leadSource: 'Website',
      status: 'To Do',
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Title and Action Buttons matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17152B] tracking-tight uppercase">
            VIEW LEADS
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Bulk Upload CSV/Excel initialized')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#5B42F3] bg-white border border-[#5B42F3] hover:bg-purple-50 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Upload size={14} />
            <span>Bulk Upload</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5B42F3] hover:bg-[#4E35E0] transition-all shadow-md shadow-[#5B42F3]/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Add Lead</span>
          </button>
        </div>
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

      {/* Leads Table matching Screenshot 2 */}
      <div className="bg-white border border-[#E5E1F2] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#17152B]">
            <thead className="bg-[#F8F9FD] text-[#68647A] text-[11px] font-black uppercase tracking-wider border-b border-[#E5E1F2]">
              <tr>
                <th className="py-4 px-4 w-10">
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                </th>
                <th className="py-4 px-4">LEAD ID</th>
                <th className="py-4 px-4">LEAD NAME</th>
                <th className="py-4 px-4">ASSIGNED EMPLOYEE</th>
                <th className="py-4 px-4">CONTACT NUMBER</th>
                <th className="py-4 px-4">CREATED TIME</th>
                <th className="py-4 px-4">EMAIL</th>
                <th className="py-4 px-4">LEAD SOURCE</th>
                <th className="py-4 px-4 text-center">STATUS</th>
                <th className="py-4 px-4 text-center">VIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1F2]">
              {filteredLeads.map((lead, idx) => {
                const isSelected = selectedRowIds.includes(lead.id);
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
                        onClick={() => toggleSelectRow(lead.id)}
                        className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center transition-colors ${
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

                    <td className="py-4 px-4 font-bold">
                      <span className={lead.assignedEmployee === 'Unassigned' ? 'text-[#5B42F3]' : 'text-slate-800'}>
                        {lead.assignedEmployee}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600">
                      {lead.contactNumber}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {lead.createdTime}
                    </td>

                    <td className="py-4 px-4 text-slate-600 max-w-[180px] truncate">
                      {lead.email}
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {lead.leadSource}
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
                        onClick={() => setSelectedLead(lead)}
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

      {/* View Lead Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E1F2] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E1F2]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 text-[#5B42F3] rounded-xl">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#17152B]">{selectedLead.leadName}</h3>
                    <span className="text-xs font-mono font-bold text-[#5B42F3]">{selectedLead.leadCode}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                    <div className="font-bold text-slate-800 mt-0.5">{selectedLead.contactNumber}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
                    <div className="font-bold text-slate-800 mt-0.5 truncate">{selectedLead.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Employee</span>
                    <div className="font-bold text-[#5B42F3] mt-0.5">{selectedLead.assignedEmployee}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                    <div className="font-bold text-emerald-600 mt-0.5">{selectedLead.status}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E1F2] flex items-center justify-between">
                <Link
                  to="/pre-production/dashboard"
                  className="text-xs font-bold text-[#5B42F3] hover:underline flex items-center gap-1"
                >
                  <Layers size={13} />
                  <span>Open in Pre-Production</span>
                  <ArrowRight size={13} />
                </Link>

                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 bg-[#5B42F3] text-white font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1F2] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E1F2]">
                <h3 className="font-extrabold text-base text-[#17152B]">Add New Lead</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddLeadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Lead Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newLeadForm.leadName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, leadName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B42F3] focus:outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={newLeadForm.contactNumber}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, contactNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B42F3] focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="client@gmail.com"
                      value={newLeadForm.email}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B42F3] focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={newLeadForm.status}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B42F3] focus:outline-none font-medium"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Review">In Review</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Lead Source
                    </label>
                    <select
                      value={newLeadForm.leadSource}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, leadSource: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B42F3] focus:outline-none font-medium"
                    >
                      <option value="Website">Website</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Referral">Referral</option>
                      <option value="Walk-in">Walk-in</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E1F2] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#5B42F3] hover:bg-[#4E35E0] text-white font-bold rounded-xl shadow-md shadow-[#5B42F3]/25"
                  >
                    Add Lead
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
