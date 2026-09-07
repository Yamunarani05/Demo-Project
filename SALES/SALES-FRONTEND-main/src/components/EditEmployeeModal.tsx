// src/components/EditEmployeeModal.tsx
import { useState } from "react";
import { X } from "lucide-react";
import { EmployeeAPI } from "../api/employees.api";

interface EditEmployeeModalProps {
  employee: any;
  onClose: () => void;
  onUpdated: () => void;
}

const EditEmployeeModal = ({
  employee,
  onClose,
  onUpdated,
}: EditEmployeeModalProps) => {
  const [form, setForm] = useState({
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    contactNumber: employee.contactNumber || "",
    position: employee.position || "",
    commission: employee.commission || "",
    workLocation: employee.workLocation || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await EmployeeAPI.updateEmployee(employee.employeeId, form);
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-5">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Edit Employee</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="border rounded px-3 py-2"
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="border rounded px-3 py-2"
          />

          <input
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="Contact Number"
            className="border rounded px-3 py-2"
          />

          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          >
            <option value="">Select Position</option>
            <option value="Photographer">Photographer</option>
            <option value="Editor">Editor</option>
            <option value="Manager">Manager</option>
          </select>

          <input
            name="commission"
            value={form.commission}
            onChange={handleChange}
            placeholder="Commission %"
            className="border rounded px-3 py-2"
          />

          <input
            name="workLocation"
            value={form.workLocation}
            onChange={handleChange}
            placeholder="Work Location"
            className="border rounded px-3 py-2"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm text-white rounded bg-gradient-to-r from-[#6938ef] to-[#5a2dd4]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
