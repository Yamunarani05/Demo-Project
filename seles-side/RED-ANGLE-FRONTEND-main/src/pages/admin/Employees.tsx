import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; // ✅ HOT TOAST
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import AddEmployeeModal from '../../components/AddEmployeeModal';
import EditEmployeeModal from '../../components/EditEmployeeModal';
import { EmployeeAPI } from '../../api/employees.api';

interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  contactNumber: string;
  dob: string;
  address: string;
  workLocation: string;
  salesType: string;
  experience: string;
  dateOfJoin: string;
  portfolioPath: string | null;
  photographyDescription: string | null;
  position: string;
  commission: string;
  createdBy: number;

  profileImagePath?: string | null;
  documentPdfPath?: string | null;

  user: {
    userId: number;
    email: string;
    role: string;
  };
}

const Employees = () => {
  const navigate = useNavigate();

  // ---------------- STATES ----------------
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any | null>(null);

  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null);

  const itemsPerPage = 8;

  // ---------------- FETCH EMPLOYEES ----------------
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await EmployeeAPI.getEmployees(currentPage - 1, itemsPerPage, searchQuery);
      const employeesArray = res.data?.employees?.employees ?? [];
      const totalCount = res.data?.employees?.total ?? 0;

      setEmployees(employeesArray);
      setTotalEmployees(totalCount);
    } catch (error) {
      console.error('Failed to fetch employees', error);
      toast.error('Failed to fetch employees');
      setEmployees([]);
      setTotalEmployees(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchQuery]);

  const filteredEmployees = employees.filter((emp) => {
    if (positionFilter === 'All') return true;
    return emp.position?.toLowerCase() === positionFilter.toLowerCase();
  });

  const totalPages = Math.ceil(totalEmployees / itemsPerPage);

  // ---------------- DELETE ----------------
  const handleDeleteEmployeeConfirm = async () => {
    if (!deleteEmployeeId) return;
    try {
      await EmployeeAPI.deleteEmployee(deleteEmployeeId);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      console.error('Failed to delete employee', error);
      toast.error('Failed to delete employee');
    } finally {
      setDeleteEmployeeId(null);
    }
  };

  // ---------------- NAVIGATION ----------------
  const handleEmployeeClick = (employee: Employee) => {
    navigate('/admin/employees/profile', { state: { employee } });
  };

  const handleChangeFilter = (position: string) => {
    setPositionFilter(position);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
      {/* TOAST CONTAINER */}
      <Toaster position="top-right" />

      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
          {/* HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Employees ({totalEmployees})
            </h1>

            <button
              onClick={() => setShowAddEmployeeModal(true)}
              className="px-2.5 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Employee
            </button>
          </div>

          {/* SEARCH + FILTER */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employee"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              {/* FILTER */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="p-1.5 border border-gray-300 rounded-lg text-xs flex items-center gap-1"
                >
                  <Filter className="w-4 h-4" />
                  {positionFilter === 'All' ? 'Filter' : positionFilter}
                </button>

                {filterOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow z-10 text-xs">
                    {['All', 'Photographer', 'Editor', 'Manager'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => handleChangeFilter(pos)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                          positionFilter === pos ? 'text-[#6938ef] font-semibold' : ''
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <table className="w-full">
              <thead style={{ backgroundColor: '#e6edf5' }}>
                <tr>
                  {[
                    'Employee Name',
                    'Employee Id',
                    'Role',
                    'Email',
                    'Position',
                    'Contact',
                    'Profile',
                    'Document',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-700"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-sm text-gray-500">
                      Loading employees...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredEmployees.map((employee) => (
                    <tr
                      key={employee.employeeId}
                      onClick={() => handleEmployeeClick(employee)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-bold text-sm">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm">EMP{employee.employeeId}</td>
                      <td className="px-4 py-3 text-sm">{employee.user.role}</td>
                      <td className="px-4 py-3 text-sm">{employee.user.email}</td>
                      <td className="px-4 py-3 text-sm">{employee.position}</td>
                      <td className="px-4 py-3 text-sm">{employee.contactNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        {employee.profileImagePath ? (
                          <img
                            src={employee.profileImagePath.startsWith('data:') || employee.profileImagePath.startsWith('http')
                              ? employee.profileImagePath
                              : `${import.meta.env.VITE_API_URL}/${employee.profileImagePath}`
                            }
                            alt="Profile"
                            className="w-9 h-9 rounded-full object-cover border"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {employee.documentPdfPath ? (
                          <a
                            href={employee.documentPdfPath.startsWith('data:') || employee.documentPdfPath.startsWith('http')
                              ? employee.documentPdfPath
                              : `${import.meta.env.VITE_API_URL}/${employee.documentPdfPath}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 text-xs underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {/* EDIT */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditEmployee(employee);
                            }}
                            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700"
                          >
                            Edit
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteEmployeeId(employee.employeeId); // ✅ open modal
                            }}
                            className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!loading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-sm text-gray-500">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-md p-3 mt-4">
              <div className="flex items-center justify-end gap-3 text-xs">
                <span>
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalEmployees)} of {totalEmployees}
                </span>

                <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                  <ChevronLeft />
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD MODAL */}
      {showAddEmployeeModal && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployeeModal(false)}
          onSave={() => {
            fetchEmployees();
            setShowAddEmployeeModal(false);
            toast.success('Employee added successfully'); // ✅ Toast on creation
          }}
        />
      )}

      {/* EDIT MODAL */}
      {editEmployee && (
        <EditEmployeeModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onUpdated={() => {
            fetchEmployees();
            toast.success('Employee updated successfully'); // ✅ Toast on update
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteEmployeeId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <p className="mb-4 text-sm">Are you sure you want to delete this employee?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteEmployeeId(null)}
                className="px-3 py-1 text-sm rounded border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployeeConfirm}
                className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
