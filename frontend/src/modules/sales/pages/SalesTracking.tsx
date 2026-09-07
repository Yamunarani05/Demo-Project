import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Eye, User } from 'lucide-react';

interface LeadTrackingRow {
  id: string;
  leadId: string;
  leadName: string;
  contactId: string;
  invoiceId: string;
  billingDate: string;
  employeeInitials: string;
  employeeName: string;
  plan: string;
  status: 'Paid' | 'Unpaid';
}

interface EmployeeTrackingRow {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  position: string;
  contact: string;
}

const LEAD_TRACKING_ROWS: LeadTrackingRow[] = [
  {
    id: '1',
    leadId: 'LD-07',
    leadName: 'Hems S (Birthday)',
    contactId: '1234568761',
    invoiceId: '—',
    billingDate: '—',
    employeeInitials: 'UN',
    employeeName: 'Unassigned',
    plan: 'Birthday Plan',
    status: 'Unpaid',
  },
  {
    id: '2',
    leadId: 'LD-06',
    leadName: 'Mohan S (RedAngle-Single Session Basic Quotation)',
    contactId: '9361880503',
    invoiceId: 'INV166',
    billingDate: '24 Aug 2026',
    employeeInitials: 'KS',
    employeeName: 'Krishna S',
    plan: 'RedAngle-Single Session Basic Quotation',
    status: 'Paid',
  },
  {
    id: '3',
    leadId: 'LD-06',
    leadName: 'Mohan S (RedAngle-Single Session Premium Quotation)',
    contactId: '9361880503',
    invoiceId: 'INV165',
    billingDate: '24 Aug 2026',
    employeeInitials: 'KS',
    employeeName: 'Krishna S',
    plan: 'RedAngle-Single Session Premium Quotation',
    status: 'Paid',
  },
  {
    id: '4',
    leadId: 'RAS-03',
    leadName: 'Kavitha S (Premium)',
    contactId: '9790123456',
    invoiceId: 'INV144',
    billingDate: '18 Jul 2026',
    employeeInitials: 'EP',
    employeeName: 'emp p',
    plan: 'Premium',
    status: 'Paid',
  },
];

const EMPLOYEE_TRACKING_ROWS: EmployeeTrackingRow[] = [
  {
    id: '1',
    name: 'Krishna S',
    employeeId: 'EMP-01',
    email: 'krishna@redangle.in',
    position: 'Senior Lead Manager',
    contact: '9361880503',
  },
  {
    id: '2',
    name: 'emp p',
    employeeId: 'EMP-02',
    email: 'empp@redangle.in',
    position: 'Sales Executive',
    contact: '9790123456',
  },
];

export default function SalesTracking() {
  const [leadSearch, setLeadSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  const filteredLeadTracking = LEAD_TRACKING_ROWS.filter(
    (r) =>
      r.leadName.toLowerCase().includes(leadSearch.toLowerCase()) ||
      r.leadId.toLowerCase().includes(leadSearch.toLowerCase()) ||
      r.invoiceId.toLowerCase().includes(leadSearch.toLowerCase())
  );

  const filteredEmployeeTracking = EMPLOYEE_TRACKING_ROWS.filter(
    (e) =>
      e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Title matching Screenshot 4 */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#17152B] tracking-tight uppercase">
          TRACKING DETAILS
        </h1>
      </div>

      {/* Section 1: Lead Tracking matching Screenshot 4 */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-[#17152B]">
          Lead Tracking
        </h2>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            value={leadSearch}
            onChange={(e) => setLeadSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B42F3] transition-all shadow-2xs"
          />
        </div>

        {/* Lead Tracking Table */}
        <div className="bg-white border border-[#E5E1F2] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#17152B]">
              <thead className="bg-[#F8F9FD] text-[#68647A] text-[11px] font-black uppercase tracking-wider border-b border-[#E5E1F2]">
                <tr>
                  <th className="py-4 px-4">LEAD ID</th>
                  <th className="py-4 px-4">LEAD NAME</th>
                  <th className="py-4 px-4">CONTACT ID</th>
                  <th className="py-4 px-4">INVOICE ID</th>
                  <th className="py-4 px-4">BILLING DATE</th>
                  <th className="py-4 px-4">EMPLOYEE ASSIGNED</th>
                  <th className="py-4 px-4">PLAN</th>
                  <th className="py-4 px-4 text-center">STATUS</th>
                  <th className="py-4 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1F2]">
                {filteredLeadTracking.map((row, idx) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-[#F8F6FF]/60 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {row.leadId}
                    </td>

                    <td className="py-4 px-4 font-bold text-[#17152B] max-w-[240px]">
                      {row.leadName}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600">
                      {row.contactId}
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {row.invoiceId}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {row.billingDate}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#5B42F3] text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                          {row.employeeInitials}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {row.employeeName}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {row.plan}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${
                          row.status === 'Paid'
                            ? 'bg-[#ECFDF5] text-[#10B981]'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => alert(`View details for ${row.leadName}`)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-[#5B42F3] bg-[#ECE8FD] hover:bg-purple-200 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination matching Screenshot 4 */}
          <div className="p-3 border-t border-[#E5E1F2] flex items-center justify-end gap-3 text-xs text-[#68647A] font-bold">
            <span>1-4 of 5</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-600">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Employee Tracking matching Screenshot 4 */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-extrabold text-[#17152B]">
          Employee Tracking
        </h2>

        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B42F3] transition-all shadow-2xs"
          />
        </div>

        <div className="bg-white border border-[#E5E1F2] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#17152B]">
              <thead className="bg-[#F8F9FD] text-[#68647A] text-[11px] font-black uppercase tracking-wider border-b border-[#E5E1F2]">
                <tr>
                  <th className="py-4 px-4">EMPLOYEE NAME</th>
                  <th className="py-4 px-4">EMPLOYEE ID</th>
                  <th className="py-4 px-4">EMAIL</th>
                  <th className="py-4 px-4">POSITION</th>
                  <th className="py-4 px-4">CONTACT</th>
                  <th className="py-4 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1F2]">
                {filteredEmployeeTracking.map((emp, idx) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-[#F8F6FF]/60 transition-colors"
                  >
                    <td className="py-4 px-4 font-extrabold text-[#17152B]">
                      {emp.name}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700">
                      {emp.employeeId}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {emp.email}
                    </td>
                    <td className="py-4 px-4 text-slate-800 font-semibold">
                      {emp.position}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-600">
                      {emp.contact}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => alert(`View employee profile for ${emp.name}`)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-[#5B42F3] bg-[#ECE8FD] hover:bg-purple-200 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
