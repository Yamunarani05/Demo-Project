// KPICard.tsx
import React from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
   icon?: React.ReactNode;
  description?: string;
 trend?: 'up' | 'down' | 'neutral';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
      <div className="text-xs sm:text-sm text-gray-500 font-medium">{title}</div>
      <div className="mt-1 text-lg sm:text-2xl font-bold text-gray-900">
        {value}
      </div>
      {description && (
        <div className="mt-0.5 text-[11px] sm:text-xs text-gray-500">
          {description}
        </div>
      )}
    </div>
  );
};

export default KPICard;
