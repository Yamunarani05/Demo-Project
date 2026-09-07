import { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';

interface Activity {
  id: string;
  employeeName: string;
  employeeId: string;
  activity: string;
  timestamp: string;
  type: 'task' | 'leave' | 'update';
}

const EmployeeActivity = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Sample data - will be replaced with API call
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      employeeName: 'Lenora Fowler',
      employeeId: 'EM123',
      activity: 'Completed task: Wedding Photography',
      timestamp: '2025-11-29 10:30:45',
      type: 'task'
    },
    {
      id: '2',
      employeeName: 'Shawn Stone',
      employeeId: 'EM124',
      activity: 'Applied for leave: Sick leave',
      timestamp: '2025-11-29 09:15:20',
      type: 'leave'
    },
    {
      id: '3',
      employeeName: 'Randy Delgado',
      employeeId: 'EM125',
      activity: 'Updated profile information',
      timestamp: '2025-11-29 08:45:10',
      type: 'update'
    },
    {
      id: '4',
      employeeName: 'Ethel Weber',
      employeeId: 'EM126',
      activity: 'Started new task: Product Design',
      timestamp: '2025-11-28 16:20:30',
      type: 'task'
    },
    {
      id: '5',
      employeeName: 'Manoj Kumar',
      employeeId: 'EM127',
      activity: 'Completed task: Client Meeting',
      timestamp: '2025-11-28 14:10:15',
      type: 'task'
    },
  ]);

  const filteredActivities = activities.filter(activity =>
    activity.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.activity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  const getActivityTypeColor = (type: string) => {
    if (type === 'task') return 'bg-blue-100 text-blue-800';
    if (type === 'leave') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Employee Activity</h1>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Q Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                />
              </div>
              <button className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Activity List */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#e6edf5' }}>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-900">Employee Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-900">Employee Id</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-900">Activity</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-900">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {currentActivities.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-900">{activity.employeeName}</td>
                      <td className="px-4 py-3 text-xs text-gray-900">{activity.employeeId}</td>
                      <td className="px-4 py-3 text-xs text-gray-900">{activity.activity}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getActivityTypeColor(activity.type)}`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900">{activity.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mt-4">
              <div className="flex items-center justify-end gap-2">
                <div className="text-xs text-gray-600">
                  {startIndex + 1}-{Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-gray-600 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeActivity;
