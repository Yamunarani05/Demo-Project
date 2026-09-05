import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import KPICard from '../../components/KPICard/KPICard';
import ChartSection from '../../components/ChartSection/ChartSection';
import LeadModal from '../../components/LeadModal/LeadModal';
import * as LeadService from '../../Services/leadService';
import { useNavigate } from 'react-router-dom';

interface Lead {
  leadId: string;
  leadName: string;
  type: string;
  createdDate: string;
  editedDate: string;
  status: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  priority?: string;
  contactNumber?: string;
  address?: string;
  eventType?: string;
  leadSource?: string;
  budget?: string;
  assignee?: string;
  currentStage?: string;
  createdByUserId?: number;
  leadSerialNumber?: string;
}

interface ChartData {
  month: string;
  leads: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view'>('view');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [chartData, setChartData] = useState<PerformanceChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentLeadsLoading, setRecentLeadsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalLeads, setTotalLeads] = useState(0);
  const [pendingLeads, setPendingLeads] = useState(0);
  const [currentMonthLeads, setCurrentMonthLeads] = useState(0);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const mapBackendToClientLead = (l: any): Lead => {
    const leadName =
      l.lead_name ||
      `${l.firstName || ''} ${l.lastName || ''}`.trim() ||
      'Unnamed Lead';

    const formatDateForDisplay = (dateString?: string) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    return {
      leadId: String(l.lead_id ?? l.leadId ?? ''),
      leadSerialNumber:
        l.leadSerialNumber ||
        l.lead_serial_number ||
        `${l.leadType === "LD" ? "LD" : "RAS"}-${l.lead_id ?? l.leadId}`,
      leadName,
      type: l.source || 'Not specified',
      createdDate: formatDateForDisplay(l.created_at),
      editedDate: '',
      status: l.status,
      currentStage: 'Lead',
    };
  };

  const isLeadDone = (lead: Lead): boolean => {
    const statusLower = lead.status.toLowerCase();
    return (
      statusLower.includes('done') ||
      statusLower.includes('completed') ||
      statusLower.includes('closed won') ||
      statusLower.includes('finalize') ||
      statusLower.includes('finalized')
    );
  };

  const getMonthFromDate = (dateString: string): number => {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.getMonth();
      }
    } catch {
      // ignore
    }
    return new Date().getMonth();
  };

  const mapMonthWiseToPerformanceData = (
    backendData: {
      month: string;
      totalLeads: number;
      finalizedLeads: number;
    }[]
  ): PerformanceChartData[] => {
    return backendData.map((item) => {
      const [year, month] = item.month.split('-');
      const monthName = new Date(
        Number(year),
        Number(month) - 1
      ).toLocaleString('en-US', { month: 'short' });

      return {
        month: monthName,
        target: item.totalLeads,
        achieved: item.finalizedLeads,
      };
    });
  };


  const buildPerformanceData = (leads: Lead[]): PerformanceChartData[] => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = monthNames.map((m) => ({
      month: m,
      achieved: 0,
      target: 0,
    }));

    leads.forEach((lead) => {
      const monthIndex = getMonthFromDate(lead.createdDate);
      data[monthIndex].target += 1;

      if (isLeadDone(lead)) {
        data[monthIndex].achieved += 1;
      }
    });

    // show last 5 months only (same UX as admin)
    return data.slice(new Date().getMonth() - 4, new Date().getMonth() + 1);
  };

  const generateChartDataFromLeads = (leads: Lead[]): ChartData[] => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthCounts = new Array(12).fill(0);
    leads.forEach((lead) => {
      const monthIndex = getMonthFromDate(lead.createdDate);
      monthCounts[monthIndex]++;
    });
    return monthNames.map((month, index) => ({
      month,
      leads: monthCounts[index],
    }));
  };

  const fetchAllLeads = async (): Promise<Lead[]> => {
    try {
      const res: any = await LeadService.getPartnerAssignedLeads();

      // backend returns: { success: true, data: [...] }
      const items = Array.isArray(res?.data) ? res.data : [];

      const mapped = items.map(mapBackendToClientLead);

      console.log(`Fetched ${mapped.length} partner leads for dashboard`);
      return mapped;
    } catch (err) {
      console.error('Error fetching partner leads for dashboard:', err);
      return [];
    }
  };


  const getRecentLeads = (leads: Lead[]): Lead[] =>
    leads
      .filter((lead) => !isLeadDone(lead))
      .sort((a, b) => {
        const dA = new Date(a.createdDate).getTime();
        const dB = new Date(b.createdDate).getTime();
        return dB - dA;
      })
      .slice(0, 3);

  const countPendingLeads = (leads: Lead[]): number =>
    leads.filter((lead) => !isLeadDone(lead)).length;

  const getLastSixMonthsDateRange = () => {
    const endDate = new Date(); // today
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5); // 5 months ago
    startDate.setDate(1); // first day of that month

    const format = (d: Date) => d.toISOString().split('T')[0]; // "YYYY-MM-DD"
    return { startDate: format(startDate), endDate: format(endDate) };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setRecentLeadsLoading(true);
    try {
      if (localStorage.getItem("isDemoPortal") === "true") {
        const demoLeads: Lead[] = [
          {
            leadId: "801",
            leadSerialNumber: "RAS-01",
            leadName: "Vikram Malhotra",
            type: "Wedding Photography",
            createdDate: "Sep 01, 2026",
            editedDate: "-",
            status: "In Progress",
            currentStage: "Quotation",
          },
          {
            leadId: "802",
            leadSerialNumber: "RAS-02",
            leadName: "Rohan Mehta",
            type: "Cinematic Wedding",
            createdDate: "Sep 02, 2026",
            editedDate: "-",
            status: "Pending",
            currentStage: "Leads",
          },
          {
            leadId: "803",
            leadSerialNumber: "RAS-03",
            leadName: "Meera Nair",
            type: "Reception & Sangeet",
            createdDate: "Aug 28, 2026",
            editedDate: "Sep 01, 2026",
            status: "Finalized",
            currentStage: "Finalize",
          },
          {
            leadId: "804",
            leadSerialNumber: "RAS-04",
            leadName: "Karan Kapoor",
            type: "Pre-Wedding Shoot",
            createdDate: "Aug 20, 2026",
            editedDate: "Aug 25, 2026",
            status: "Completed",
            currentStage: "Finalize",
          },
          {
            leadId: "805",
            leadSerialNumber: "RAS-05",
            leadName: "Divya Verma",
            type: "Destination Wedding",
            createdDate: "Aug 15, 2026",
            editedDate: "-",
            status: "In Review",
            currentStage: "Confirmation",
          },
          {
            leadId: "806",
            leadSerialNumber: "RAS-06",
            leadName: "Arjun Sharma",
            type: "Engagement Coverage",
            createdDate: "Jul 25, 2026",
            editedDate: "Jul 30, 2026",
            status: "Done",
            currentStage: "Finalize",
          },
        ];

        setAllLeads(demoLeads);
        setTotalLeads(demoLeads.length);
        setPendingLeads(countPendingLeads(demoLeads));
        setCurrentMonthLeads(2);

        const demoPerformanceData: PerformanceChartData[] = [
          { month: "May", target: 5, achieved: 4 },
          { month: "Jun", target: 6, achieved: 5 },
          { month: "Jul", target: 8, achieved: 7 },
          { month: "Aug", target: 7, achieved: 6 },
          { month: "Sep", target: 5, achieved: 3 },
        ];
        setChartData(demoPerformanceData);
        setRecentLeads(getRecentLeads(demoLeads));
        setLoading(false);
        setRecentLeadsLoading(false);
        return;
      }

      const [leadsData, monthWise] = await Promise.all([
        fetchAllLeads(),
        (() => {
          const { startDate, endDate } = getLastSixMonthsDateRange();
          return LeadService.getMonthWiseLeads(startDate, endDate);
        })(),
      ]);

      setAllLeads(leadsData);

      // KPIs
      setTotalLeads(leadsData.length);
      setPendingLeads(countPendingLeads(leadsData));
      setCurrentMonthLeads(
        leadsData.filter(
          (l) => new Date(l.createdDate).getMonth() === new Date().getMonth()
        ).length
      );

      // Graph
      const performanceData = mapMonthWiseToPerformanceData(monthWise).slice(-5);
      setChartData(performanceData);

      // Recent leads
      setRecentLeads(getRecentLeads(leadsData));
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRecentLeadsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();

    if (
      statusLower.includes('done') ||
      statusLower.includes('completed') ||
      statusLower.includes('finalize') ||
      statusLower.includes('finalized')
    ) {
      return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' };
    } else if (
      statusLower.includes('new') ||
      statusLower.includes('lead') ||
      statusLower.includes('leads') ||
      statusLower.includes('quotation') ||
      statusLower.includes('confirmation')
    ) {
      return { bg: 'rgba(105, 56, 239, 0.2)', text: '#6938ef' };
    } else if (
      statusLower.includes('progress') ||
      statusLower.includes('prospect') ||
      statusLower.includes('qualified') ||
      statusLower.includes('negotiation')
    ) {
      return { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' };
    } else if (statusLower.includes('closed lost')) {
      return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
    }

    return { bg: 'rgba(105, 56, 239, 0.2)', text: '#6938ef' };
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/partner/lead/${leadId}/overview`);
  };

  const handleSaveLead = (leadData: Partial<Lead>) => {
    console.log('Save lead:', leadData);
    setShowModal(false);
    setSelectedLead(null);
    fetchDashboardData();
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="w-full h-screen bg-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
          <div className="flex justify-end mb-3 sm:mb-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#6938ef] text-white rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Loading...</span>
                  <span className="sm:hidden">Load...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Refresh Data</span>
                  <span className="sm:hidden">Refresh</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <KPICard
              title="Total Leads"
              value={totalLeads.toString()}
              description={`Year ${new Date().getFullYear()}`}
              icon=""
              trend={totalLeads > 0 ? 'up' : 'neutral'}
            />
            <KPICard
              title="Current Month"
              value={currentMonthLeads.toString()}
              description={new Date().toLocaleString('en-US', {
                month: 'long',
              })}
              icon=""
              trend={currentMonthLeads > 0 ? 'up' : 'neutral'}
            />
            <KPICard
              title="Pending"
              value={pendingLeads.toString()}
              description="Active leads (excluding done/completed)"
              icon=""
              trend="neutral"
            />
          </div>

          <div className="mb-4 sm:mb-5">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Performance
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Achieved vs total leads (last 5 months)
                </p>
              </div>

              <PerformanceLineChart
                data={
                  chartData.length > 0
                    ? chartData
                    : [{ month: 'No data', achieved: 0, target: 0 }]
                }
                hoveredIndex={hoveredIndex}
                onHover={setHoveredIndex}
              />

              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded" />
                  <span className="text-sm font-semibold text-gray-600">
                    Achieved
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#6938ef] rounded" />
                  <span className="text-sm font-semibold text-gray-600">
                    Total Leads
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Recent Leads</h3>
              <p className="text-sm text-gray-500 mt-1">Latest lead activities</p>
            </div>

            {recentLeadsLoading ? (
              <div className="p-8 flex justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading recent leads...</p>
                </div>
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No recent leads found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {['Lead ID', 'Lead Name', 'Type', 'Created Date', 'Status', 'Actions'].map((col) => (
                      <th
                        key={col}
                        className="text-left px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentLeads.map((lead, idx) => {
                    // Type colors for Assigned / Created
                    const typeColors: Record<string, { bg: string; text: string }> = {
                      ASSIGNED: { bg: 'bg-purple-100', text: 'text-purple-700' },
                      CREATED: { bg: 'bg-green-100', text: 'text-green-700' },
                    };

                    const type = lead.type === 'ASSIGNED' ? 'ASSIGNED' : 'CREATED';
                    const { bg: typeBg, text: typeText } = typeColors[type];

                    // Status colors
                    const { bg: statusBg, text: statusText } = getStatusColor(lead.status);

                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition cursor-pointer">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {lead.leadSerialNumber || lead.leadId}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-gray-900 truncate max-w-[150px] sm:max-w-none"
                          title={lead.leadName}
                        >
                          {lead.leadName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${typeBg} ${typeText}`}
                          >
                            {type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.createdDate || '-'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full shadow-sm`}
                            style={{ backgroundColor: statusBg, color: statusText }}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewLead(lead.leadId)}
                            className="px-3 py-1 text-xs font-semibold rounded-full border border-purple-600 text-purple-600 hover:bg-purple-50 transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      <LeadModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedLead(null);
        }}
        onSave={handleSaveLead}
        leadData={selectedLead}
        mode={modalMode}
      />
    </div>
  );
};

export interface PerformanceChartData {
  month: string;
  achieved: number;
  target: number;
}

interface LineChartProps {
  data: PerformanceChartData[];
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}

const PerformanceLineChart = ({ data, hoveredIndex, onHover }: LineChartProps) => {
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
        `L ${achievedPoints[achievedPoints.length - 1].x
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


export default Dashboard;