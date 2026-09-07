import { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import LeaveRequestModal from '../../components/LeaveRequestModal';
import { EmployeeAPI } from '../../api/employees.api';

interface LeaveRequest {
  id: string;
  serialNo: number;
  name: string;
  date: string;
  fromTime: string;
  toTime: string;
  leaveType: string;
  reason: string;
  empId: string;
  totalDays: number;
  fromDate: string;
  toDate: string;
}

const Approval = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingRequest, setViewingRequest] = useState<LeaveRequest | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterLeaveType, setFilterLeaveType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [total, setTotal] = useState(0);

  const filterRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 8;

  /* ---------------- CLICK OUTSIDE FILTER ---------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilter]);

  /* ---------------- FETCH LEAVE REQUESTS ---------------- */
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const res = await EmployeeAPI.getLeaveRequests(
          currentPage - 1,
          itemsPerPage,
          searchQuery
        );

        console.log('Full API response:', res.data);

        const apiLeaves = res.data?.leaves?.leaves || [];

        // ✅ Filter only pending + normalize data for UI
        const pendingLeaves: LeaveRequest[] = apiLeaves
          .filter((leave: any) => leave.status === 'Pending')
          .map((leave: any, index: number) => ({
            id: String(leave.leaveRequestId),
            serialNo: index + 1,
            name: `${leave.employee?.firstName ?? ''} ${leave.employee?.lastName ?? ''}`.trim(),
            date: leave.fromDate ? leave.fromDate.split('T')[0] : '',
            fromTime: leave.fromDate ? leave.fromDate.split('T')[0] : '',
            toTime: leave.toDate ? leave.toDate.split('T')[0] : '',
            leaveType: leave.leaveType ?? '',
            reason: leave.reason ?? '',
            empId: String(leave.employeeId ?? ''),
            totalDays: leave.noOfDays ?? 0,
            fromDate: leave.fromDate ?? '',
            toDate: leave.toDate ?? '',
          }));

        console.log('Pending leaves (mapped):', pendingLeaves);

        setLeaveRequests(pendingLeaves);
        setTotal(res.data?.leaves?.pagination?.total || pendingLeaves.length);
      } catch (error) {
        console.error('Failed to fetch leave requests', error);
      }
    };

    fetchLeaveRequests();
  }, [currentPage, searchQuery]);

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredRequests = leaveRequests.filter((request) => {
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      (request.name ?? '').toLowerCase().includes(search) ||
      (request.leaveType ?? '').toLowerCase().includes(search) ||
      (request.reason ?? '').toLowerCase().includes(search);

    const matchesLeaveType = !filterLeaveType || request.leaveType === filterLeaveType;
    const matchesDate = !filterDate || request.date === filterDate;

    return matchesSearch && matchesLeaveType && matchesDate;
  });

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  /* ---------------- ACTION HANDLERS ---------------- */
  const handleViewRequest = (request: LeaveRequest) => setViewingRequest(request);

  const handleApprove = async (id: string) => {
    try {
      await EmployeeAPI.approveLeave(Number(id));
      setLeaveRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error('Failed to approve leave', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await EmployeeAPI.rejectLeave(Number(id));
      setLeaveRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error('Failed to reject leave', error);
    }
  };

  /* ---------------- DATE DISPLAY ---------------- */
  const getFormattedDate = () => {
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Leave Request Approval
            </h1>
            <p className="text-xs text-gray-600">{getFormattedDate()}</p>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input
                  type="text"
                  placeholder="Q Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                />
              </div>

              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>

                {showFilter && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-[200px]">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Leave Type
                        </label>
                        <select
                          value={filterLeaveType}
                          onChange={(e) => setFilterLeaveType(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                        >
                          <option value="">All</option>
                          <option value="Leave">Leave</option>
                          <option value="Permission">Permission</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>

                      <button
                        onClick={() => {
                          setFilterLeaveType('');
                          setFilterDate('');
                        }}
                        className="w-full px-2.5 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#e6edf5' }}>
                    <th className="px-4 py-3 text-xs font-bold">S.No</th>
                    <th className="px-4 py-3 text-xs font-bold">Name</th>
                    <th className="px-4 py-3 text-xs font-bold">Date</th>
                    <th className="px-4 py-3 text-xs font-bold">From Time</th>
                    <th className="px-4 py-3 text-xs font-bold">To Time</th>
                    <th className="px-4 py-3 text-xs font-bold">Leave Type-Reason</th>
                    <th className="px-4 py-3 text-xs font-bold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request, index) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs">
                        {String(startIndex + index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-3 text-xs">{request.name}</td>
                      <td className="px-4 py-3 text-xs">{request.date}</td>
                      <td className="px-4 py-3 text-xs">{request.fromTime}</td>
                      <td className="px-4 py-3 text-xs">{request.toTime}</td>
                      <td className="px-4 py-3 text-xs">
                        {request.leaveType} - {request.reason}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleApprove(request.id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                          Approve
                        </button>
                        <button onClick={() => handleReject(request.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Reject
                        </button>
                        <button onClick={() => handleViewRequest(request)} className="px-2 py-1 text-xs border rounded text-[#6938ef]">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <p className="text-center text-xs text-gray-500 py-4">
                  No pending leave requests
                </p>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 mt-4">
              <span className="text-xs text-gray-600">
                {startIndex + 1}-{Math.min(endIndex, total)} of {total}
              </span>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight />
              </button>
            </div>
          )}
        </main>
      </div>

      {viewingRequest && (
        <LeaveRequestModal
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
        />
      )}
    </div>
  );
};

export default Approval;
