// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import {
  dashboardService,
  buildFiveMonthPerformance,
} from '../../Services/dashboardService';
import {
  Group as MGroupIcon,
  PeopleAlt as MPeopleAltIcon,
  Timeline as MTimelineIcon,
  ReceiptLong as MReceiptLongIcon,
  PendingActions as MPendingActionsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ChartData {
  month: string;
  achieved: number;
  target: number;
}

interface LineChartProps {
  data: ChartData[];
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}

const LineChart = ({ data, hoveredIndex, onHover }: LineChartProps) => {
  const rawMax = Math.max(0, ...data.map((d) => Math.max(d.achieved, d.target)));
  const maxValue = rawMax <= 0 ? 2 : Math.ceil(rawMax / 2) * 2;

  const chartPadding = { top: 16, bottom: 40, left: 4, right: 4 };

  const getYPercent = (value: number) => {
    const usableHeight = 100 - chartPadding.top - chartPadding.bottom;
    if (maxValue === 0) return 100 - chartPadding.bottom;
    return chartPadding.top + (usableHeight - (value / maxValue) * usableHeight);
  };

  const getXPercent = (index: number) => {
    if (data.length <= 1) return 50;
    const innerPadding = 8;
    const span = 100 - innerPadding * 2;
    return innerPadding + (index / (data.length - 1)) * span;
  };

  const achievedPoints = data.map((point, index) => {
    const x = getXPercent(index);
    const y = getYPercent(point.achieved);
    return { x, y };
  });

  const targetPoints = data.map((point, index) => {
    const x = getXPercent(index);
    const y = getYPercent(point.target);
    return { x, y };
  });

  const buildSmoothPath = (points: { x: number; y: number }[]) => {
    if (!points.length) return '';
    if (points.length === 1) {
      const p = points[0];
      return `M ${p.x} ${p.y}`;
    }

    const d: string[] = [];
    d.push(`M ${points[0].x} ${points[0].y}`);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const smoothing = 0.2;

      const cp1x = p1.x + ((p2.x - p0.x) / 6) * smoothing * 3;
      const cp1y = p1.y + ((p2.y - p0.y) / 6) * smoothing * 3;

      const cp2x = p2.x - ((p3.x - p1.x) / 6) * smoothing * 3;
      const cp2y = p2.y - ((p3.y - p1.y) / 6) * smoothing * 3;

      d.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
    }

    return d.join(' ');
  };

  const achievedPath = buildSmoothPath(achievedPoints);
  const targetPath = buildSmoothPath(targetPoints);

  const achievedAreaPath =
    achievedPoints.length > 0
      ? [
          `M ${achievedPoints[0].x} ${100 - chartPadding.bottom}`,
          ...achievedPoints.map((p) => `L ${p.x} ${p.y}`),
          `L ${
            achievedPoints[achievedPoints.length - 1].x
          } ${100 - chartPadding.bottom}`,
          'Z',
        ].join(' ')
      : '';

  return (
    <div className="h-64 sm:h-80 relative">
      <div
        className="h-full relative"
        onMouseLeave={() => onHover(null)}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="achievedArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fff7ed" stopOpacity="0.2" />
            </linearGradient>
            <filter id="cardShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0.6" stdDeviation="0.8" floodOpacity="0.18" />
            </filter>
          </defs>

          {[0.25, 0.5, 0.75].map((ratio) => {
            const usableHeight = 100 - chartPadding.top - chartPadding.bottom;
            const y = chartPadding.top + usableHeight * (1 - ratio);
            return (
              <line
                key={ratio}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="0.3"
              />
            );
          })}

          <line
            x1="0"
            y1={100 - chartPadding.bottom}
            x2="100"
            y2={100 - chartPadding.bottom}
            stroke="#e5e7eb"
            strokeWidth="0.6"
          />

          {achievedAreaPath && (
            <path
              d={achievedAreaPath}
              fill="url(#achievedArea)"
              stroke="none"
            />
          )}

          {targetPath && (
            <path
              d={targetPath}
              fill="none"
              stroke="#6938ef"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          )}

          {achievedPath && (
            <path
              d={achievedPath}
              fill="none"
              stroke="#f97316"
              strokeWidth="1.0"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#cardShadow)"
              opacity={0.95}
            />
          )}

          {data.map((point, index) => {
            const x = getXPercent(index);
            const achievedY = getYPercent(point.achieved);
            const targetY = getYPercent(point.target);
            const isHovered = hoveredIndex === index;

            return (
              <g key={index}>
                <rect
                  x={x - 4}
                  y={chartPadding.top}
                  width="8"
                  height={100 - chartPadding.top - chartPadding.bottom}
                  fill="transparent"
                  onMouseEnter={() => onHover(index)}
                  style={{ cursor: 'pointer' }}
                />

                <circle
                  cx={x}
                  cy={targetY}
                  r={isHovered ? 1.4 : 0.9}
                  fill="#6938ef"
                  stroke="white"
                  strokeWidth={isHovered ? 0.4 : 0.3}
                />

                <circle
                  cx={x}
                  cy={achievedY}
                  r={isHovered ? 1.6 : 1.1}
                  fill="#f97316"
                  stroke="white"
                  strokeWidth={isHovered ? 0.5 : 0.35}
                />

                {isHovered && (
                  <g>
                    <line
                      x1={x}
                      y1={chartPadding.top}
                      x2={x}
                      y2={100 - chartPadding.bottom}
                      stroke="#6938ef"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />
                    <rect
                      x={x - 16}
                      y={chartPadding.top - 15}
                      width="32"
                      height="13"
                      fill="white"
                      stroke="#e5e7eb"
                      strokeWidth="0.3"
                      rx="2"
                      filter="url(#cardShadow)"
                    />
                    <text
                      x={x}
                      y={chartPadding.top - 11}
                      textAnchor="middle"
                      fontSize="2.3"
                      fill="#f97316"
                      fontWeight="bold"
                    >
                      {Math.round(point.achieved)} done
                    </text>
                    <text
                      x={x}
                      y={chartPadding.top - 6}
                      textAnchor="middle"
                      fontSize="2.3"
                      fill="#6938ef"
                      fontWeight="bold"
                    >
                      {Math.round(point.target)} total
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-0 left-0 right-0">
          {data.map((point, index) => {
            const xPercent = getXPercent(index);
            return (
              <div
                key={index}
                className="text-[10px] sm:text-xs text-gray-600 text-center font-medium absolute"
                style={{
                  left: `${xPercent}%`,
                  transform: 'translateX(-50%)',
                  minWidth: '36px',
                }}
              >
                {point.month}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface LeadRow {
  id: string;
  leadIdLabel: string;
  name: string;
  assignedEmployee: string;
  date: string;
  source: string;
  status: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [pendingLeads, setPendingLeads] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);

  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);

  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const [selectedEndMonth, setSelectedEndMonth] = useState<Date>(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      case 'Approved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCircleRatio = (value: number, max: number) => {
    if (max <= 0) return 0;
    const ratio = value / max;
    return Math.max(0, Math.min(1, ratio));
  };

  const recomputePerformance = (endMonth: Date, source?: any[]) => {
    const leadsSource = source ?? allLeads;
    const data = buildFiveMonthPerformance(leadsSource, endMonth);
    setPerformanceData(data);
  };

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoadingSummary(true);
        const summary = await dashboardService.getSummary();

        setTotalEmployees(summary.totalEmployees);
        setTotalLeads(summary.totalLeads);
        setPendingLeads(summary.pendingLeads);

        const leadsList: any[] = summary.allLeads ?? [];
        setAllLeads(leadsList);

        // derive invoice counts directly from lead_details.current_stage
        let pendingInvCount = 0;
        let createdInvCount = 0;

        for (const l of leadsList) {
          const stage = (l.currentStage ?? '').toLowerCase();
          if (stage === 'confirmation') {
            pendingInvCount += 1;
          }
          if (stage === 'finalised' || stage === 'finalized') {
            createdInvCount += 1;
          }
        }

        setPendingInvoices(pendingInvCount);
        setTotalInvoices(createdInvCount);

        const initialEnd = new Date();
        setSelectedEndMonth(initialEnd);
        recomputePerformance(initialEnd, leadsList);
      } catch (err) {
        console.error('Error loading dashboard summary:', err);
        setPendingInvoices(0);
        setTotalInvoices(0);
      } finally {
        setLoadingSummary(false);
      }
    };

    const loadLeads = async () => {
      try {
        setLoadingLeads(true);
        const recent = await dashboardService.getRecentLeads();
        const mapped: LeadRow[] = recent.map((l: any) => {
          const idNum = l.leadId ?? l.id;
          const idStr = String(idNum ?? '');
          const leadIdLabel = l.leadSerialNumber || (idStr ? `LD${idStr.padStart(3, '0')}` : '-');

          const firstName = l.firstName ?? '';
          const lastName = l.lastName ?? '';
          const fullName = `${firstName} ${lastName}`.trim();
          const eventType = l.eventType ?? '';
          const name = fullName || 'Unknown';

          const created = l.createdAt ?? l.createdTime;
          const dateObj = created ? new Date(created) : new Date();
          const date = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          const source = l.leadSource ?? 'Unknown';

          let status = 'Pending';
          const stage = (l.currentStage ?? '').toLowerCase();
          if (stage.includes('progress') || stage.includes('follow')) {
            status = 'In Progress';
          } else if (
            stage.includes('final') ||
            stage.includes('won') ||
            stage.includes('converted')
          ) {
            status = 'Complete';
          } else if (stage.includes('approved')) {
            status = 'Approved';
          }

          const emp = l.leadEmployee?.[0]?.employee;
          const assignedEmployee = emp
            ? `${emp.firstName} ${emp.lastName || ''}`.trim()
            : (l.leadFollowedBy || 'Unassigned');

          const email = l.email ?? '-';

          return {
            id: idStr,
            leadIdLabel,
            name,
            assignedEmployee,
            date,
            source,
            status,
            email,
          };
        });
        setLeads(mapped);
      } catch (err) {
        console.error('Error loading recent leads:', err);
      } finally {
        setLoadingLeads(false);
      }
    };

    loadSummary();
    loadLeads();
  }, []);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;
    const [yearStr, monthStr] = value.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    if (Number.isNaN(year) || Number.isNaN(monthIndex)) return;

    const newEnd = new Date(year, monthIndex, 1);
    setSelectedEndMonth(newEnd);
    recomputePerformance(newEnd);
  };

  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  const employeesRatio = getCircleRatio(totalEmployees, 50);
  const leadsRatio = getCircleRatio(totalLeads, 50);
  const pendingRatio = getCircleRatio(pendingLeads, 20);
  const invoicesRatio = getCircleRatio(totalInvoices, 50);
  const pendingInvoicesRatio = getCircleRatio(pendingInvoices, 20);

  const monthInputValue = `${selectedEndMonth.getFullYear()}-${String(
    selectedEndMonth.getMonth() + 1,
  ).padStart(2, '0')}-01`;

  const StatCard: React.FC<{
    title: string;
    subtitle: string;
    value: number | string;
    color: string;
    Icon: typeof MGroupIcon;
    path: string;
  }> = ({ title, subtitle, value, color, Icon, path }) => {
    const navigate = useNavigate();

    const pillBg =
      color === 'cyan'
        ? 'bg-cyan-50 text-cyan-600'
        : color === 'emerald'
        ? 'bg-emerald-50 text-emerald-600'
        : color === 'orange'
        ? 'bg-orange-50 text-orange-500'
        : color === 'sky'
        ? 'bg-sky-50 text-sky-500'
        : 'bg-rose-50 text-rose-500';

    return (
      <div
        onClick={() => navigate(path)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4
                  cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-500">
              {subtitle}
            </span>
            <h3 className="text-base font-semibold text-gray-900 mt-1">
              {title}
            </h3>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {value}
            </div>
          </div>

          <span
            className={`inline-flex items-center justify-center rounded-full p-2 ${pillBg}`}
          >
            <Icon sx={{ fontSize: 22 }} />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden wfull min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="Employees"
              subtitle="Total employees"
              value={totalEmployees}
              color="cyan"
              Icon={MGroupIcon}
              path="/admin/employees"
            />

            <StatCard
              title="Leads"
              subtitle="Total leads"
              value={totalLeads}
              color="emerald"
              Icon={MPeopleAltIcon}
              path="/admin/view-leads"
            />

            <StatCard
              title="Pending Leads"
              subtitle="Awaiting action"
              value={pendingLeads}
              color="orange"
              Icon={MTimelineIcon}
              path="/admin/assign-leads"
            />

            <StatCard
              title="Invoices"
              subtitle="Created invoices"
              value={totalInvoices}
              color="sky"
              Icon={MReceiptLongIcon}
              path="/admin/invoice"
            />

            <StatCard
              title="Pending Invoices"
              subtitle="Awaiting payment"
              value={pendingInvoices}
              color="rose"
              Icon={MPendingActionsIcon}
              path="/admin/invoice"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Performance
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Achieved vs total leads in the last 5 months
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={monthInputValue}
                  onChange={handleMonthChange}
                  className="px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6938ef]"
                />
              </div>
            </div>
            <LineChart
              data={
                performanceData.length > 0
                  ? performanceData
                  : [{ month: 'No data', achieved: 0, target: 0 }]
              }
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded shadow-sm" />
                <span className="text-sm text-gray-600 font-semibold">
                  Achieved (Completed)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#6938ef] rounded shadow-sm" />
                <span className="text-sm text-gray-600 font-semibold">
                  Target (Total Leads)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Recent Leads
              </h2>
            </div>
            <div className="overflow-x-auto">
              {loadingLeads ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  Loading leads...
                </div>
              ) : leads.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  No leads found.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-700">
                        Lead ID
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-700">
                        Lead Name
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-700">
                        Assigned Employee
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-700">
                        Lead Source
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-700">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3 text-xs text-gray-900 font-semibold">
                          {lead.leadIdLabel}
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-900 font-semibold">
                          {lead.name}
                        </td>
                        <td className="py-2 px-3 text-xs font-bold text-indigo-600">
                          {lead.assignedEmployee}
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-600 font-medium">
                          {lead.date}
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-600 font-medium">
                          {lead.source}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(
                              lead.status,
                            )}`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-600 font-medium">
                          {lead.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;