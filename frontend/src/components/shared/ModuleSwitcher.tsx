import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Crown, Briefcase, Clapperboard, LayoutGrid } from 'lucide-react';

interface ModuleSwitcherProps {
  className?: string;
  variant?: 'topbar' | 'floating' | 'inline';
}

export const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({
  className = '',
  variant = 'topbar',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isGreatMaster = path.startsWith('/great-master');
  const isMasterStudio = path.startsWith('/master') && !path.startsWith('/master-admin');
  const isSales = path.startsWith('/sales') || path.startsWith('/master/sales');
  const isPreProduction =
    path.startsWith('/pre-production') ||
    path.startsWith('/crm') ||
    path.startsWith('/master/pre-production');

  const modules = [
    {
      id: 'great-master',
      label: 'Great Master',
      icon: Crown,
      path: '/great-master/dashboard',
      active: isGreatMaster,
      badge: 'Platform',
      activeColor: 'bg-amber-500 text-white shadow-amber-500/25',
      hoverColor: 'hover:bg-amber-50 text-amber-900 border-amber-200/60',
      tagColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'master-studio',
      label: 'Master Studio',
      icon: Briefcase,
      path: '/master/dashboard',
      active: isMasterStudio,
      badge: 'Studio',
      activeColor: 'bg-[#5E35B1] text-white shadow-purple-900/25',
      hoverColor: 'hover:bg-purple-50 text-purple-900 border-purple-200/60',
      tagColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'sales-client',
      label: 'Sales CRM',
      icon: Briefcase,
      path: '/sales/dashboard',
      active: isSales,
      badge: 'Sales',
      activeColor: 'bg-indigo-600 text-white shadow-indigo-500/25',
      hoverColor: 'hover:bg-indigo-50 text-indigo-900 border-indigo-200/60',
      tagColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'pre-production',
      label: 'Pre-Production',
      icon: Clapperboard,
      path: '/pre-production/dashboard',
      active: isPreProduction,
      badge: 'Workflow',
      activeColor: 'bg-purple-600 text-white shadow-purple-500/25',
      hoverColor: 'hover:bg-purple-50 text-purple-900 border-purple-200/60',
      tagColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div
      className={`flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-sm ${className}`}
    >
      {/* Module Hub Quick Link */}
      <button
        onClick={() => navigate('/dashboard')}
        title="Unified Module Hub"
        className={`flex items-center justify-center h-8 w-8 rounded-xl transition-all ${
          path === '/dashboard' || path === '/modules'
            ? 'bg-gray-900 text-white shadow-sm'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <LayoutGrid size={15} />
      </button>

      <div className="h-4 w-px bg-gray-200 mx-0.5" />

      {/* Module Pill Tabs */}
      <div className="flex items-center gap-1">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => navigate(mod.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 border ${
                mod.active
                  ? `${mod.activeColor} shadow-md border-transparent scale-[1.02]`
                  : `bg-transparent border-transparent text-gray-600 ${mod.hoverColor}`
              }`}
            >
              <Icon size={14} className={mod.active ? 'text-white' : 'text-gray-500'} />
              <span>{mod.label}</span>
              {mod.active && (
                <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 font-bold uppercase tracking-wider text-white">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleSwitcher;
