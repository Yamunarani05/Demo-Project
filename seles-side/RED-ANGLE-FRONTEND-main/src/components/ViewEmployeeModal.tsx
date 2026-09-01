import { useState, useEffect } from 'react';
import { User, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';

interface ViewEmployeeModalProps {
  employee: any; // lead object
  onClose: () => void;
  onUpdate?: (updatedLead: any) => void;
}

const ViewEmployeeModal = ({ employee, onClose, onUpdate }: ViewEmployeeModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    taskName: '',
    taskGroup: '',
    estimate: '',
    deadline: '',
    priority: '',
    assigneeId: '',
    description: '',
    email: '',
    contactNumber: ''
  });

  const formatDate = (date?: string) => {
    if (!date || date === 'N/A') return 'N/A';

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return 'N/A';

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees');
        setEmployees(
          res.data.employees.employees.map((e: any) => ({
            employeeId: e.employeeId,
            firstName: e.firstName,
            lastName: e.lastName,
            role: e.user?.role || 'employee',
          }))
        );
      } catch (error) {
        console.error('Failed to fetch employees', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!employee) return;

    setFormData({
      taskName: employee.taskName || employee.eventType || 'N/A',
      taskGroup: employee.taskGroup || employee.department?.type || 'N/A',
      estimate: employee.estimate ?? 'N/A',
      deadline: formatDate(employee.deadline),
      priority: employee.priority || 'N/A',
      assigneeId: employee.assignedEmployeeId?.toString() || '',
      description: employee.description || 'N/A',
      email: employee.email || 'N/A',
      contactNumber: employee.contactNumber || 'N/A',
    });
  }, [employee]);

  useEffect(() => {
    if (!employee || employees.length === 0) return;

    setFormData(prev => ({
      ...prev,
      assigneeId: employee.assignedEmployeeId?.toString() || ''
    }));
  }, [employee, employees]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // ❌ Case 1: No assignee selected
    if (!formData.assigneeId) {
      toast.error("Please select an assignee");
      return;
    }

    // ❌ Case 2: Same employee selected
    if (employee.assignedEmployeeId && Number(formData.assigneeId) === Number(employee.assignedEmployeeId)) {
      toast("This employee is already assigned");
      return;
    }

    try {
      const targetLeadId = Number(employee.id || employee.leadId);
      await api.request({
        url: '/leads/update-assign-employee',
        method: 'PUT',
        data: {
          leadId: targetLeadId,
          employeeId: Number(formData.assigneeId),
        },
        params: {
          leadId: targetLeadId,
        },
      });

      const selectedEmployee = employees.find(
        emp => Number(emp.employeeId) === Number(formData.assigneeId)
      );

      if (onUpdate && selectedEmployee) {
        onUpdate({
          ...employee,
          assignedEmployeeId: selectedEmployee.employeeId,
          assignedEmployeeName: `${selectedEmployee.firstName ?? ""} ${selectedEmployee.lastName ?? ""}`.trim(),
        });
      }

      toast.success("Employee assigned successfully ✅");

      setIsEditing(false);
      onClose();
    } catch (error: any) {
      console.error('Failed to update assignment', error);
      toast.error(error?.response?.data?.message || "Failed to assign employee");
    }
  };

  const leadName = employee?.employeeName || `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim() || 'Unknown Lead';
  const assignedTasks = employee?.assignedTasks || [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-purple-50 px-6 py-4 rounded-t-2xl flex items-center justify-between border-b border-purple-100">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-[#6938ef]" />
            <h2 className="text-base font-bold text-gray-900">Lead Assignment Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="bg-purple-50 px-6 py-6 flex items-center gap-4 border-b border-purple-100">
          <div className="w-16 h-16 rounded-full bg-purple-200 text-[#6938ef] flex items-center justify-center font-bold text-xl">
            {leadName[0]?.toUpperCase() || "L"}
          </div>

          <div className="flex-1 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">{leadName}</h3>
              <p className="text-xs text-gray-500 font-medium">{employee?.employeeId || ""}</p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 text-xs font-semibold rounded-md
                bg-[#6938ef] text-white hover:bg-[#5a2dd4] transition shadow-sm"
              >
                UPDATE ASSIGNEE
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg m-4 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <ReadOnly label="Event / Task Type" value={formData.taskName} />

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Assigned Employee(s) / Partner(s)
                </label>

                {isEditing ? (
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => handleChange('assigneeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#6938ef] focus:outline-none"
                  >
                    <option value="">Select Assignee</option>
                    {employees.map(emp => (
                      <option
                        key={emp.employeeId}
                        value={emp.employeeId.toString()}
                      >
                        {emp.firstName} {emp.lastName} ({emp.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-bold text-gray-900 bg-purple-50 p-2 rounded-md border border-purple-100">
                    {employee?.assignedTasksSummary || employee?.assignedEmployeeName || 'Unassigned'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <ReadOnly label="Deadline / Event Date" value={formData.deadline} />
              <ReadOnly label="Priority" value={formData.priority} />
              <ReadOnly label="Email" value={formData.email} />
              <ReadOnly label="Contact Number" value={formData.contactNumber} />
            </div>
          </div>

          {/* Assigned Tasks Breakdown */}
          {assignedTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Assigned Tasks Breakdown ({assignedTasks.length})
              </h4>
              <div className="space-y-2">
                {assignedTasks.map((t: any, idx: number) => {
                  const empName = t.employee
                    ? `${t.employee.firstName ?? ""} ${t.employee.lastName ?? ""}`.trim()
                    : "Unassigned";
                  return (
                    <div
                      key={t.leadEmployeeId || idx}
                      className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#6938ef]" />
                          <span>{t.taskName || "General Task"}</span>
                        </div>
                        <p className="text-gray-500 mt-0.5 ml-5">
                          Assigned to: <span className="font-medium text-gray-800">{empName}</span>
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-gray-500">
                        {t.EstimatedDuration && (
                          <div className="flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            <span>{t.EstimatedDuration}h</span>
                          </div>
                        )}
                        {t.deadline && (
                          <div className="flex items-center gap-1 justify-end">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(t.deadline)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-xs font-medium transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#6938ef] hover:bg-[#5a2dd4] text-white rounded-md text-xs font-medium transition shadow-sm"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReadOnly = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {label}
    </label>
    <p className="text-xs font-bold text-gray-900">{value}</p>
  </div>
);

export default ViewEmployeeModal;
