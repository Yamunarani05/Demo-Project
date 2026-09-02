import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
LayoutDashboard,
Eye,
FileText,
DollarSign,
LogOut,
User,
Camera,
} from "lucide-react";

// Define MenuItem interface
interface MenuItem {
name: string;
icon: React.ReactNode;
path: string;
}

interface PartnerSidebarProps {
userName?: string;
userRole?: string;
userAvatar?: string;
menuItems?: MenuItem[];
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({
userName = "Priya",
userRole = "Partner",
userAvatar,
menuItems: customMenuItems,
}) => {
const navigate = useNavigate();
const location = useLocation();
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

const defaultMenuItems: MenuItem[] = [
{
name: "Dashboard",
icon: <LayoutDashboard className="w-5 h-5" />,
path: "/partner/dashboard",
},
{
name: "Leads",
icon: <Eye className="w-5 h-5" />,
path: "/partner/leads",
},
{
name: "Earnings",
icon: <DollarSign className="w-5 h-5" />,
path: "/partner/earnings",
},
{
name: "Profile",
icon: <User className="w-5 h-5" />,
path: "/partner/profile",
},
];

const menuItems = customMenuItems || defaultMenuItems;

const handleLogout = () => {
navigate("/");
};

const isActive = (path: string) =>
location.pathname === path || location.pathname.startsWith(path + "/");

const avatarUrl =
userAvatar || "https://ui-avatars.com/api/?name=${userName}&background=6938ef&color=fff";

return (
<>
{/* Mobile Toggle */}
<button
onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-violet-600 text-white rounded-xl shadow-lg"
>
☰
</button>


  <aside
    className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300
    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    style={{
      backgroundColor: "rgba(105, 56, 239, 0.18)",
    }}
  >
    <div className="h-full flex flex-col justify-between px-4 py-5">
      {/* Top - Avatar & Role */}
      <div>
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-wider uppercase font-display text-gray-900">
              DEMO STUDIO
            </span>
          </div>
          <span className="text-xs font-bold text-violet-700 bg-violet-100/80 px-2.5 py-0.5 rounded-full">{userRole}</span>
        </div>

        {/* Menu */}
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition
                    ${active ? "bg-violet-600 text-white" : "text-gray-700"}`}
                  >
                    <span className="flex items-center justify-center">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom - Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-600"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  </aside>

  {/* Overlay for mobile */}
  {isMobileMenuOpen && (
    <div
      className="fixed inset-0 bg-black/40 z-30 lg:hidden"
      onClick={() => setIsMobileMenuOpen(false)}
    />
  )}
</>
);
};

export default PartnerSidebar;