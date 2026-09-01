import type { KPICardProps } from '../../components/KPI_pros/KPIcards';

const KPICard = ({ title, value }: KPICardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
      <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#6938ef' }}>
        {value}
      </p>
    </div>
  );
};

export default KPICard;
