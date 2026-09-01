import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, MapPin, Calendar, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { LeadsAPI } from '../../api/leads.api';

interface Project {
  id: number;
  projectId: string;
  projectName: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  role: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  team: string[];
  avatar: string;
}

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('Completed Projects');
  const itemsPerPage = 8;

  const [employeeInfo, setEmployeeInfo] = useState({
    employeeId:'',
    name: '',
    position: '',
    location: '',
    birthday: '',
    email: '',
    mobile: '',
    experience: '',
    avatar: 'https://ui-avatars.com/api/?name=Arjun&background=6938ef&color=fff'
  });


  useEffect(() => {
    if (location.state?.employee) {
      const emp = location.state.employee;
      setEmployeeInfo({
        employeeId: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}` || '-',
        position: emp.position || '-',
        location: emp.workLocation  || emp.address,
        birthday: formatDate(emp.dob) || '-',
        email: emp.user.email || '-',
        mobile: emp.contactNumber || '-',
        experience: emp.experience || '-',
        avatar: getAvatarUrl(
          `${emp.firstName} ${emp.lastName || ''}`,
          emp.avatar
        ),
      });
    }
  }, [location.state]);

const [projects, setProjects] = useState<Project[]>([]);

const filteredProjects = projects.filter((project) => {
  if (filterType === 'To Do') return project.status === 'To Do';
  if (filterType === 'In Progress') return project.status === 'In Progress';
  if (filterType === 'Completed Projects') return project.status === 'Completed';
  return true;
});

const [loading, setLoading] = useState(false);
const getAvatarUrl = (name: string, avatar?: string) => {
  if (!avatar || avatar === 'null' || avatar === 'undefined') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6938ef&color=fff`;
  }
  return avatar;
};


useEffect(() => {
  if (!employeeInfo?.employeeId) return;

  const fetchEmployeeLeads = async () => {
    try {
      setLoading(true);

      const res = await LeadsAPI.getEmployeeLeads(Number(employeeInfo.employeeId));

      if (res.data.success) {
      const tasks: Project[] = res.data.data.flatMap((lead: any) =>
        lead.leadEmployee.map((task: any) => ({
          id: task.leadEmployeeId,
          projectId: `LEAD-${lead.leadId}`,
          projectName: task.taskName,
          date: formatDate(task.deadline),
          priority: task.priority,
          role: employeeInfo.position,
          status: getStatusFromStage(lead.currentStage),
          team: [],
          avatar:  `https://ui-avatars.com/api/?name=${employeeInfo.name}&background=6938ef&color=fff`
        }))
      );

        setProjects(tasks);
      }
    } catch (error) {
      console.error('Error fetching employee tasks', error);
    } finally {
      setLoading(false);
    }
  };

  fetchEmployeeLeads();
}, [employeeInfo.employeeId]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

const getStatusColor = (status: string) => {
  if (status === 'Completed') return 'bg-green-100 text-green-800';
  if (status === 'In Progress') return 'bg-blue-100 text-blue-800';
  if (status === 'To Do') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};
  
const formatDate = (date?: string) => {
  if (!date) return '-';

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

  const getStatusFromStage = (stage?: string): Project['status'] => {
    const normalized = stage?.trim().toLowerCase();

    switch (normalized) {
      case 'lead':
        return 'To Do';

      case 'confirmation':
        return 'In Progress'; // or 'In Review' if you want consistency

      case 'finalized':
      case 'finalised':
        return 'Completed';

      default:
        return 'To Do';
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate('/admin/tracking/employee-profile/track-employee', {
      state: {
        employee: employeeInfo,
        project: project
      }
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-5">Employee Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left Column - Employee Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 max-w-sm">
                <div className="text-center mb-3">
                  <img
                    src={employeeInfo.avatar}
                    alt={employeeInfo.name}
                    className="w-12 h-12 rounded-full mx-auto mb-2"
                  />
                  <h2 className="text-sm font-bold text-gray-900">{employeeInfo.name}</h2>
                  <p className="text-xs text-gray-600 mt-1 font-normal">{employeeInfo.position}</p>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                    <input
                      type="text"
                      value={employeeInfo.position}
                      readOnly
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={employeeInfo.location}
                        readOnly
                        className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-xs"
                      />
                      <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Birthday Date</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={employeeInfo.birthday}
                        readOnly
                        className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-xs"
                      />
                      <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={employeeInfo.email}
                        readOnly
                        className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-xs"
                      />
                      <Mail className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={employeeInfo.mobile}
                        readOnly
                        className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-xs"
                      />
                      <Phone className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Experience</label>
                    <input
                      type="text"
                      value={employeeInfo.experience}
                      readOnly
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Projects */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    
                      <select
                        value={filterType}
                        onChange={(e) => {
                          setFilterType(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                      >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Completed Projects</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={project.avatar}
                          alt={project.projectName}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">{project.projectId}</p>
                          <h3 className="text-xs text-gray-900 mb-0.5 truncate">{project.projectName}</h3>
                          <p className="text-xs text-gray-500 mb-2">{project.date}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div>
                              <span className="text-xs text-gray-500">Role: </span>
                              <span className="text-xs text-gray-900">{project.role}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <div className="flex items-center gap-1">
                              {project.team.slice(0, 3).map((_, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white -ml-2 first:ml-0"
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">+{project.team.length - 3}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <div className="text-xs text-gray-600">
                      {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length}
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
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeProfile;