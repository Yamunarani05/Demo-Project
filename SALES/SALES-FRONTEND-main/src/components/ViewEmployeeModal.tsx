import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';

interface ViewEmployeeModalProps {
  employee: any; // keeping as-is (lead object)
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
      taskName: employee.taskName || employee.employeeName || 'N/A',
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

    // ❌ Case 1: Not assigned earlier
    if (!employee.assignedEmployeeName) {
        toast.error("Employee is unassigned. Please assign first.");
        return;
      }

    // ❌ Case 2: No new assignee selected
    if (!formData.assigneeId) {
      toast.error("Please select an assignee");
      return;
    }

    // ❌ Case 3: Same employee selected
    if (Number(formData.assigneeId) === Number(employee.assignedEmployeeName)) {
      toast("This employee is already assigned");
      return;
    }

    try {
      await api.request({
        url: '/leads/update-assign-employee',
        method: 'PUT',

        data: {
          leadId: Number(employee.id),
          employeeId: Number(formData.assigneeId),
        },

        params: {
          leadId: Number(employee.id),
        },
      });

      const selectedEmployee = employees.find(
        emp => emp.employeeId === Number(formData.assigneeId)
      );

      if (onUpdate && selectedEmployee) {
        onUpdate({
          ...employee,
          assignedEmployeeId: selectedEmployee.employeeId,
          assignedEmployeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        });
      }

      toast.success("Employee reassigned successfully ✅");

      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Failed to update assignment', error);
      toast.error("Failed to reassign employee");
    }
  };

  const employeeName = formData.taskName || employee.employeeName || 'Unknown';
  const department = formData.taskGroup || employee.department?.type || 'Unknown';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-purple-50 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-gray-700" />
            <h2 className="text-base font-bold text-gray-900">Employee Details</h2>
          </div>
        </div>

        <div className="bg-purple-50 px-6 py-6 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>

          <div className="flex-1 flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-900">{employeeName}</h3>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 text-xs font-semibold rounded-md
                bg-[#6938ef] text-white hover:bg-[#5a2dd4]"
              >
                UPDATE
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg m-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <ReadOnly label="Task Name" value={formData.taskName} />

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Assignee
                </label>

                {isEditing ? (
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => handleChange('assigneeId', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    <option value="">Select Assignee</option>
                    {employees.map(emp => (
                      <option
                        key={emp.employeeId}
                        value={emp.employeeId.toString()}
                      >
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-bold text-gray-900">
                    {employee.assignedEmployeeName || 'N/A'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <ReadOnly label="Deadline" value={formData.deadline} />
              <ReadOnly label="Priority" value={formData.priority} />
              <ReadOnly label="Email" value={formData.email} />
              <ReadOnly label="Contact Number" value={formData.contactNumber} />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 bg-gray-200 rounded-md text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#6938ef] text-white rounded-md text-xs"
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
