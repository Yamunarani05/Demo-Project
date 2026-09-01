import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import KPICard from '../../components/KPICard/KPICard';
import { Download, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

interface EarningsData {
  leadId: string;
  leadName: string;
  type: string;
  createdDate: string;
  projectValue: number;
  commissionPercent: number;
  earnings: number;
  status: 'Paid' | 'Unpaid' | 'Pending';
}

interface ApiResultItem {
  leadId: number;
  leadSerialNumber?: string;
  leadName: string;
  eventType?: string;
  createdDate: string;
  projectValue: number;
  commissionPercent: number;
  earning: number;
  status: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  results: ApiResultItem[];
  totalEarnings: number;
}

const Earnings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5;

  const mapStatus = (status: string): 'Paid' | 'Unpaid' | 'Pending' => {
    const statusLower = status?.toLowerCase() || '';
    if (
      statusLower === 'unpaid' ||
      statusLower === 'due' ||
      statusLower === 'pending_payment' ||
      statusLower === 'not_paid'
    ) {
      return 'Unpaid';
    } else if (
      statusLower === 'paid' ||
      statusLower === 'completed' ||
      statusLower === 'settled' ||
      statusLower === 'paid_out' ||
      statusLower === 'disbursed'
    ) {
      return 'Paid';
    } else {
      return 'Pending';
    }
  };

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('authToken') ||
          '';

        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/leads/earnings`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }
          throw new Error(
            `Failed to fetch earnings: ${response.status} ${response.statusText}`
          );
        }

        const result: ApiResponse = await response.json();

        if (!result.success || !Array.isArray(result.results)) {
          setEarningsData([]);
          setError(result.message || 'No earnings data found.');
          return;
        }

        const transformedData: EarningsData[] = result.results.map(
  (item: ApiResultItem, index: number) => {
    const projectValue = item.projectValue ?? 0;
    const commissionPercent = item.commissionPercent ?? 0;

    const earnings = Math.round(
      (projectValue * commissionPercent) / 100
    );

    return {
      leadId: item.leadSerialNumber || `LD-${String(item.leadId).padStart(2, '0')}`,
      leadName: item.leadName ?? 'Customer',
      type: item.eventType || '—',
      createdDate: new Date(item.createdDate).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      projectValue,
      commissionPercent,
      earnings,
      status: mapStatus(item.status ?? 'pending'),
    };
  }
);

        setEarningsData(transformedData);
      } catch (err) {
        console.error('Error fetching earnings data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load earnings data'
        );
        setEarningsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  const parseDateString = (dateStr: string): number => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return Date.now();
    return date.getTime();
  };

  const sortByDate = (earnings: EarningsData[]) => {
    return [...earnings].sort((a, b) => {
      const dateA = parseDateString(a.createdDate);
      const dateB = parseDateString(b.createdDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  const handleSortByDate = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(1);
  };

  const handleDownloadStatement = () => {
    if (earningsData.length === 0) {
      alert('No data available to download');
      return;
    }

    const sortedEarnings = sortByDate(earningsData);

    const excelData = sortedEarnings.map((earning) => ({
      'Lead ID': earning.leadId,
      'Lead Name': earning.leadName,
      Type: earning.type,
      'Created Date': earning.createdDate,
      'Project Value': earning.projectValue,
      'Commission %': earning.commissionPercent,
      Earnings: earning.earnings,
      Status: earning.status,
    }));

    exportToExcel(
      excelData,
      'earnings_statement',
      [
        'Lead ID',
        'Lead Name',
        'Type',
        'Created Date',
        'Project Value',
        'Commission %',
        'Earnings',
        'Status',
      ],
      'Earnings Statement Report'
    );
  };

  const sortedEarnings = sortByDate(earningsData);
  const totalPages = Math.ceil(sortedEarnings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEarnings = sortedEarnings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const eligibleProjects = earningsData.length;

  const confirmedCommission = earningsData
    .filter((item) => item.status === 'Paid')
    .reduce((sum, item) => sum + item.earnings, 0);

  const pendingCommission = earningsData
    .filter((item) => item.status === 'Pending' || item.status === 'Unpaid')
    .reduce((sum, item) => sum + item.earnings, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusOutline = (status: string) => {
    // if (status === 'Paid') return 'border-emerald-500 text-emerald-600';
    // if (status === 'Unpaid') return 'border-rose-500 text-rose-600';
    // return 'border-amber-500 text-amber-600';
      if (status === 'Paid') return 'bg-emerald-100 text-emerald-700';
      if (status === 'Unpaid') return 'bg-rose-100 text-rose-700';
      return 'bg-amber-100 text-amber-700';
  };

  const handleRefresh = () => window.location.reload();

  if (loading) {
    return (
      <div className="w-full h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <DashboardHeader title="EARNINGS" />
          <main className="flex-1 overflow-auto p-4 w-full flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-200 px-8 py-8 shadow-sm flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#6938ef] mb-4"></div>
              <div className="text-base font-semibold text-gray-700">
                Loading earnings data...
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Please wait while we fetch your statement
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <DashboardHeader title="EARNINGS" />

        <main className="flex-1 overflow-auto p-3 sm:p-4 w-full">
          {/* Header */}
          <div className="flex justify-between items-start sm:items-center mb-4 gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Earnings
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Track your commissions and earnings
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={handleDownloadStatement}
                className="px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm
                bg-[#6938ef] text-white hover:bg-[#5a2dd4] transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={earningsData.length === 0}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-rose-700 font-semibold text-sm">⚠ {error}</p>
            </div>
          )}

          {/* KPI Cards (NO extra wrapper now) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <KPICard
              title="Eligible Projects"
              value={eligibleProjects}
              description="Total projects"
            />
            <KPICard
              title="Confirmed"
              value={`₹${formatCurrency(confirmedCommission)}`}
              description="Paid earnings"
            />
            <KPICard
              title="Pending"
              value={`₹${formatCurrency(pendingCommission)}`}
              description="Unpaid + Pending"
            />
          </div>

          {/* Table */}
          {earningsData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-lg font-bold text-gray-700 mb-2">
                No earnings data
              </div>
              <p className="text-gray-500 text-sm mb-4">
                You haven’t earned any commissions yet.
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-[#6938ef] text-white rounded-xl hover:bg-[#5a2dd4] transition font-semibold"
              >
                Refresh Data
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-gray-900">
                  Earnings Details
                </h3>
                <div className="text-sm text-gray-600">
                  Total: <b>{earningsData.length}</b> records
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                      {/* ✅ header bold only */}
                      <th className="text-left py-3 px-4 font-bold">Lead ID</th>
                      <th className="text-left py-3 px-4 font-bold">
                        Lead Name
                      </th>
                      <th className="text-left py-3 px-4 font-bold">Type</th>
                      <th className="text-left py-3 px-4 font-bold">
                        <button
                          onClick={handleSortByDate}
                          className="flex items-center gap-1 hover:text-[#6938ef] transition"
                        >
                          Date{' '}
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-bold">Value</th>
                      <th className="text-left py-3 px-4 font-bold">Comm %</th>
                      <th className="text-left py-3 px-4 font-bold">
                        Earnings
                      </th>
                      <th className="text-left py-3 px-4 font-bold">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedEarnings.map((earning, index) => (
                      <tr
                        key={`${earning.leadId}-${index}`}
                        className="border-b border-gray-100 hover:bg-[#6938ef]/5 transition"
                      >
                        {/* ✅ body normal text */}
                        <td className="py-3 px-4 text-gray-900 font-normal">
                          {earning.leadId}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-normal truncate max-w-[180px]">
                          {earning.leadName}
                        </td>

                        {/* Type outline */}
                        <td className="py-3 px-4">
                          {/* <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-[#6938ef] text-[#6938ef]">
                            {earning.type}
                          </span> */}
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#6938ef]/10 text-[#6938ef]">
                            {earning.type}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-gray-600 font-normal whitespace-nowrap">
                          {earning.createdDate}
                        </td>

                        <td className="py-3 px-4 text-gray-700 font-normal">
                          ₹{formatCurrency(earning.projectValue)}
                        </td>

                        <td className="py-3 px-4 text-gray-600 font-normal">
                          {earning.commissionPercent}%
                        </td>

                        <td className="py-3 px-4 text-gray-900 font-normal">
                          ₹{formatCurrency(earning.earnings)}
                        </td>

                        {/* Status outline */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusOutline(
                              earning.status
                            )}`}
                          >
                            {earning.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-2 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing <b>{startIndex + 1}</b> to{' '}
                    <b>
                      {Math.min(startIndex + itemsPerPage, sortedEarnings.length)}
                    </b>{' '}
                    of <b>{sortedEarnings.length}</b>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2)
                          pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-xl text-sm font-bold transition ${
                              currentPage === pageNum
                                ? 'bg-[#6938ef] text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Earnings;
