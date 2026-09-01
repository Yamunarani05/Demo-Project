import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Employee } from "../pages/admin/AssignLeads";

interface AssignEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignEmployeeData) => Promise<void> | void;
  initialTaskName?: string;
  employees?: Employee[];
  selectedLeadCount?: number;
}

export interface AssignEmployeeData {
  employeeId: string;
  employeeName: string;
  taskName: string;
  estimate: string;
  deadline?: string | null;
  priority: "Low" | "Medium" | "High";
  description: string;
}

const AssignEmployeeModal: React.FC<AssignEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTaskName = "",
  employees = [],
  selectedLeadCount = 0,
}) => {
  const [formData, setFormData] = useState<AssignEmployeeData>({
    employeeId: "",
    employeeName: "",
    taskName: "",
    estimate: "",
    deadline: "",
    priority: "Medium",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        taskName: initialTaskName || "",
      }));
    }
  }, [isOpen, initialTaskName]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: AssignEmployeeData = {
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
    };

    console.log("ASSIGN PAYLOAD (fixed)", payload);

    try {
      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "calc(100vh - 3.5rem)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
        tabIndex={0}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Assign employee / partner
            </h2>
            {selectedLeadCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Assigning to {selectedLeadCount} selected lead
                {selectedLeadCount > 1 ? "s" : ""}.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name
            </label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              placeholder="Task Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimate
              </label>
              <input
                type="text"
                name="estimate"
                value={formData.estimate}
                onChange={handleChange}
                placeholder="Select duration"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dead Line
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignee
            </label>

            <select
              value={formData.employeeId}
              onChange={(e) => {
                const selectedEmp = employees.find(
                  (emp) => emp.employeeId === e.target.value
                );
                setFormData((prev) => ({
                  ...prev,
                  employeeId: e.target.value,
                  employeeName: selectedEmp
                    ? `${selectedEmp.firstName ?? ""} ${
                        selectedEmp.lastName ?? ""
                      }`.trim()
                    : "",
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Assignee</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add some description of the task"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm resize-none h-24"
            />
          </div>

          <button
            type="submit"
            className={`w-full mt-6 px-4 py-2 text-white rounded-md font-medium ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#6938ef] to-[#5a2dd4]"
            }`}
            disabled={loading}
          >
            {loading
              ? "Assigning..."
              : selectedLeadCount > 1
              ? `Assign to ${selectedLeadCount} leads`
              : "Assign Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignEmployeeModal;