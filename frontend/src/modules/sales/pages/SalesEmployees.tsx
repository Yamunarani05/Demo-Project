import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Phone, Plus } from 'lucide-react';

interface EmployeeItem {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  role: string;
  activeDeals: number;
  status: 'Active' | 'On Leave';
}

const EMPLOYEES_DATA: EmployeeItem[] = [
  { id: '1', name: 'Krishna S', employeeId: 'EMP-01', email: 'krishna@redangle.in', phone: '9361880503', role: 'Senior Lead Manager', activeDeals: 3, status: 'Active' },
  { id: '2', name: 'emp p', employeeId: 'EMP-02', email: 'empp@redangle.in', phone: '9790123456', role: 'Sales Executive', activeDeals: 2, status: 'Active' },
  { id: '3', name: 'Priya Sharma', employeeId: 'EMP-03', email: 'priya@redangle.in', phone: '9845012345', role: 'Senior Client Associate', activeDeals: 4, status: 'Active' },
  { id: '4', name: 'Arjun Reddy', employeeId: 'EMP-04', email: 'arjun@redangle.in', phone: '9886054321', role: 'Cinematography Consultant', activeDeals: 2, status: 'Active' },
  { id: '5', name: 'Rahul Mehta', employeeId: 'EMP-05', email: 'rahul@redangle.in', phone: '9741033445', role: 'Field Account Manager', activeDeals: 1, status: 'Active' },
  { id: '6', name: 'Ananya Iyer', employeeId: 'EMP-06', email: 'ananya@redangle.in', phone: '9900088776', role: 'Client Onboarding Lead', activeDeals: 2, status: 'Active' },
];

export default function SalesEmployees() {
  const [search, setSearch] = useState('');

  const filtered = EMPLOYEES_DATA.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-black text-[#17152B] tracking-tight uppercase">
          Employees
        </h1>
      </div>

      <div className="bg-white border border-[#E5E1F2] rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-[#17152B]">
          <thead className="bg-[#F8F9FD] text-[#68647A] text-[11px] font-black uppercase tracking-wider border-b border-[#E5E1F2]">
            <tr>
              <th className="py-4 px-4">EMPLOYEE ID</th>
              <th className="py-4 px-4">EMPLOYEE NAME</th>
              <th className="py-4 px-4">ROLE</th>
              <th className="py-4 px-4">EMAIL</th>
              <th className="py-4 px-4">PHONE</th>
              <th className="py-4 px-4 text-center">ACTIVE DEALS</th>
              <th className="py-4 px-4 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1F2]">
            {filtered.map((emp, idx) => (
              <motion.tr
                key={emp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="hover:bg-[#F8F6FF]/60 transition-colors"
              >
                <td className="py-4 px-4 font-bold text-slate-800">{emp.employeeId}</td>
                <td className="py-4 px-4 font-extrabold text-[#17152B]">{emp.name}</td>
                <td className="py-4 px-4 text-slate-700 font-semibold">{emp.role}</td>
                <td className="py-4 px-4 text-slate-600">{emp.email}</td>
                <td className="py-4 px-4 font-mono text-slate-600">{emp.phone}</td>
                <td className="py-4 px-4 text-center font-bold text-[#5B42F3]">
                  {emp.activeDeals} Deals
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] inline-block">
                    {emp.status}
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
