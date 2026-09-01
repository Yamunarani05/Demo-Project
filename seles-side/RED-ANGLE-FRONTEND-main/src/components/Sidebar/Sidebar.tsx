// src/components/Sidebar/Sidebar.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Eye,
  UserCheck,
  FileText,
  CheckCircle,
  Users,
  FileCheck,
  BarChart3,
  LogOut,
  CalendarCheck,
  ClipboardList,
  IndianRupee,
  User,
  Link as LinkIcon,
  DollarSign,
} from "lucide-react";

import redAngleLogo from "../../assets/red_angle_logo.png";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC<{ forceOpen?: boolean }> = ({ forceOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ROLE DETECTION
  const isAdmin = location.pathname.startsWith("/admin");
  const isEmployee = location.pathname.startsWith("/employee");
  const isPartner = location.pathname.startsWith("/partner");

  const roleLabel = isAdmin ? "Admin" : isEmployee ? "Employee" : "Partner";

  // ADMIN MENU
  const adminMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      path: "/admin/dashboard",
    },
    {
      name: "View Leads",
      icon: <Eye className="w-4 h-4" />,
      path: "/admin/view-leads",
    },
    {
      name: "Assign Leads",
      icon: <UserCheck className="w-4 h-4" />,
      path: "/admin/assign-leads",
    },
    {
      name: "Tracking",
      icon: <LinkIcon className="w-4 h-4" />,
      path: "/admin/tracking",
    },
    {
      name: "Invoice",
      icon: <FileText className="w-4 h-4" />,
      path: "/admin/invoice",
    },
    {
      name: "Attendance",
      icon: <CalendarCheck className="w-4 h-4" />,
      path: "/admin/attendance",
    },
    {
      name: "Approval",
      icon: <CheckCircle className="w-4 h-4" />,
      path: "/admin/approval",
    },
    {
      name: "Employees",
      icon: <Users className="w-4 h-4" />,
      path: "/admin/employees",
    },
    {
      name: "Quotation",
      icon: <FileCheck className="w-4 h-4" />,
      path: "/admin/quotation",
    },
    {
      name: "Report",
      icon: <BarChart3 className="w-4 h-4" />,
      path: "/admin/report",
    },
  ];

  // EMPLOYEE MENU
  const employeeMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <User className="w-4 h-4" />,
      path: "/employee/employee-profile",
    },
    {
      name: "Tasks",
      icon: <ClipboardList className="w-4 h-4" />,
      path: "/employee/tasks",
    },
    {
      name: "Attendance",
      icon: <CalendarCheck className="w-4 h-4" />,
      path: "/employee/attendance",
    },
    {
      name: "Profile",
      icon: <Users className="w-4 h-4" />,
      path: "/employee/employee-details",
    },
    {
      name: "Leave Request",
      icon: <CheckCircle className="w-4 h-4" />,
      path: "/employee/leave-approval",
    },
  ];

  // PARTNER MENU 
  const partnerMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      path: "/partner/dashboard",
    },
    {
      name: "Leads",
      icon: <Eye className="w-4 h-4" />,
      path: "/partner/leads",
    },
    {
      name: "Earnings",
      icon: <DollarSign className="w-4 h-4" />,
      path: "/partner/earnings",
    },
    {
      name: "Profile",
      icon: <User className="w-4 h-4" />,
      path: "/partner/profile",
    },
  ];

  // ACTIVE MENU
  const menuItems = isAdmin
    ? adminMenu
    : isEmployee
    ? employeeMenu
    : partnerMenu;

  
  const isActive = (path: string) => {
    if (isPartner) {
      return (
        location.pathname === path ||
        location.pathname.startsWith(path + "/")
      );
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#6938ef] text-white rounded-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-56 flex-shrink-0 transform ${
          isMobileMenuOpen || forceOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out h-full`}
        style={{
          backgroundColor: "rgba(105, 56, 239, 0.20)",
          borderRadius: "12px",
        }}
      >
        <div className="flex flex-col h-full px-3 pt-3 pb-4">
          {/* Logo + role */}
          <div className="mb-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-center">
              <img
                src={redAngleLogo}
                alt="Red Angle Studio"
                className="w-32 h-auto object-contain"
              />
            </div>
            <span className="mt-1 text-sm font-bold text-gray-700">
              {roleLabel}
            </span>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: active ? "#6938ef" : "transparent",
                        color: active ? "#ffffff" : "#333333",
                      }}
                    >
                      <span
                        className="flex items-center justify-center"
                        style={{ color: active ? "#ffffff" : "#000000" }}
                      >
                        {item.icon}
                      </span>
                      <span className="font-bold text-xs leading-none">
                        {item.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          {/* Logout */}
{/* Logout */}
<div className="mt-4 pt-3 border-t border-violet-200">
  <button
    onClick={handleLogout}
    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-full
               text-sm font-semibold
               text-violet-700
               bg-violet-50
               hover:bg-violet-100
               transition-colors"
  >
    <LogOut className="w-4 h-4" />
    <span>Logout</span>
  </button>
</div>

        </div>
      </aside>

      {/* Backdrop mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
