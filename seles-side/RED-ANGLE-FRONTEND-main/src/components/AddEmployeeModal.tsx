import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { EmployeeAPI } from '../api/employees.api';
import { CircleX } from "lucide-react";

interface AddEmployeeModalProps {
  onClose: () => void;
  onSave?: (formData: any) => void;
}

const AddEmployeeModal = ({ onClose, onSave }: AddEmployeeModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    contactNumber: '',
    dob: '',
    address: '',
    workLocation: '',
    salesType: 'Photography',
    position: '',
    experience: '',
    dateOfJoin: '',
    portfolio: '',
    photographyKnowledge: '',
    commission: '', // only for partner

    profileImage: '' as string,
    documentPdf: '' as string,
  });

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact Number is required";
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Enter valid 10 digit number";
    }

    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.workLocation) newErrors.workLocation = "Work Location is required";
    if (!formData.salesType) newErrors.salesType = "Sales Type is required";
    if (!formData.position) newErrors.position = "Position is required";
    if (!formData.experience) newErrors.experience = "Experience is required";
    if (!formData.dateOfJoin) newErrors.dateOfJoin = "Date of Join is required";
    if (!formData.portfolio) newErrors.portfolio = "Portfolio is required";
    if (!formData.photographyKnowledge) newErrors.photographyKnowledge = "Photography Knowledge is required";
    if (formData.role === 'partner' && !formData.commission) newErrors.commission = "Commission is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  };
  const handleFileChange = (field: 'profileImage' | 'documentPdf', file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [field]: '' }));
    }
  };
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit clicked!");

    // Wait, let's enable validation
    if (!validateForm()) return;

    try {
      const role = formData.role === "employee" ? "employee" : "partner";

      const formPayload = new FormData();
      formPayload.append(
        "uniqueId",
        `${role === "employee" ? "EMP" : "PAR"}-${formData.firstName.charAt(0).toUpperCase()}-${Date.now()}`
      );
      formPayload.append("firstName", formData.firstName.trim());
      formPayload.append("lastName", formData.lastName.trim());
      formPayload.append("email", formData.email.trim());
      formPayload.append("password", formData.password);
      formPayload.append("role", role);
      formPayload.append("contactNumber", formData.contactNumber || "");
      formPayload.append("workLocation", formData.workLocation || "");
      formPayload.append("salesType", formData.salesType || "Photography");
      formPayload.append("position", formData.position || "");
      formPayload.append("experience", String(Number(formData.experience) || 0));
      formPayload.append("portfolioPath", formData.portfolio || "");
      formPayload.append("photographyDescription", formData.photographyKnowledge || "");
      formPayload.append("commission", role === "partner" ? String(formData.commission || 0) : "0");
      if (formData.dob) formPayload.append("dob", formData.dob);
      if (formData.dateOfJoin) formPayload.append("dateOfJoin", formData.dateOfJoin);
      if (formData.profileImage) formPayload.append("profileImage", formData.profileImage);
      if (formData.documentPdf) formPayload.append("documentPdf", formData.documentPdf);

      console.log("FINAL FORM DATA →", Array.from(formPayload.entries()));

      const res = await EmployeeAPI.createEmployee(formPayload);
      console.log("API RESPONSE →", res);

      if (res?.data) {
        if (onSave) onSave(res.data); 
        onClose();
      } else {
        alert("Failed to add employee: No response from server.");
      }
    } catch (error: any) {
      console.error("Error creating employee:", error);
      
      const serverErrors = error.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        setErrors((prev: any) => ({ ...prev, ...serverErrors }));
      } else {
        alert(error.response?.data?.message || "Failed to add employee. Check console.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
<div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 rounded-t-2xl relative">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add New Employee</h2>
            <p className="text-xs text-gray-600 mt-0.5">{getCurrentDate()}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-900 hover:text-red-600 z-50"
          >
            <CircleX size={28} />
          </button>



        </div>

        {/* Form */}
       <form
          onSubmit={handleSubmit}
          className="p-4 overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 80px)' }}
        >
          {/* Basic Details */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-3">Basic Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">First Name<span className="text-red-500 ml-1">*</span></label>
                <input
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                />{errors.firstName && <p className="text-red-500 text-[10px] mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Last Name<span className="text-red-500 ml-1">*</span></label>
                <input
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                />{errors.lastName && <p className="text-red-500 text-[10px] mt-1">{errors.lastName}</p>}
              </div>
            </div>
          </div>

          {/* Communication Details */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-3">Communication Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Email<span className="text-red-500 ml-1">*</span></label>
                <input
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                />{errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Password<span className="text-red-500 ml-1">*</span></label>
                <input
                  type="password"
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                />{errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Role<span className="text-red-500 ml-1">*</span></label>
                <select
                  value={formData.role}
                  onChange={e => handleChange('role', e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                >
                  <option value="">Select Role</option>
                  <option value="employee">Employee</option>
                  <option value="partner">Channel Partner</option>
                </select>{errors.role && <p className="text-red-500 text-[10px] mt-1">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Contact Number<span className="text-red-500 ml-1">*</span></label>
                <input
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.contactNumber}
                  onChange={e => handleChange('contactNumber', e.target.value)}
                />{errors.contactNumber && <p className="text-red-500 text-[10px] mt-1">{errors.contactNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Date of Birth<span className="text-red-500 ml-1">*</span></label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    value={formData.dob}
                    onChange={e => handleChange('dob', e.target.value)}
                  />{errors.dob && <p className="text-red-500 text-[10px] mt-1">{errors.dob}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Address<span className="text-red-500 ml-1">*</span></label>
                <input
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                />{errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-bold mb-3">Professional Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Work Location<span className="text-red-500 ml-1">*</span></label>
                <input
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.workLocation}
                  onChange={e => handleChange('workLocation', e.target.value)}
                />{errors.workLocation && <p className="text-red-500 text-[10px] mt-1">{errors.workLocation}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Sales Type<span className="text-red-500 ml-1">*</span></label>
                <select
                  value={formData.salesType}
                  onChange={e => handleChange('salesType', e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                >
                  <option value="Photography">Photography</option>
                  <option value="Videography">Videography</option>
                  <option value="Editing">Editing</option>
                  <option value="Marketing">Marketing</option>
                </select>{errors.salesType && <p className="text-red-500 text-[10px] mt-1">{errors.salesType}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Position<span className="text-red-500 ml-1">*</span></label>
                <input
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.position}
                  onChange={e => handleChange('position', e.target.value)}
                />{errors.position && <p className="text-red-500 text-[10px] mt-1">{errors.position}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Experience (Years)<span className="text-red-500 ml-1">*</span></label>
                <input
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.experience}
                  onChange={e => handleChange('experience', e.target.value)}
                />{errors.experience && <p className="text-red-500 text-[10px] mt-1">{errors.experience}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Date of Joining<span className="text-red-500 ml-1">*</span></label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    value={formData.dateOfJoin}
                    onChange={e => handleChange('dateOfJoin', e.target.value)}
                  />{errors.dateOfJoin && <p className="text-red-500 text-[10px] mt-1">{errors.dateOfJoin}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Portfolio<span className="text-red-500 ml-1">*</span></label>
                <input
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.portfolio}
                  onChange={e => handleChange('portfolio', e.target.value)}
                />{errors.portfolio && <p className="text-red-500 text-[10px] mt-1">{errors.portfolio}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1">Photography Knowledge<span className="text-red-500 ml-1">*</span></label>
                <textarea
                  rows={3}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  value={formData.photographyKnowledge}
                  onChange={e => handleChange('photographyKnowledge', e.target.value)}
                />{errors.photographyKnowledge && <p className="text-red-500 text-[10px] mt-1">{errors.photographyKnowledge}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Profile Image (JPG / PNG)<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-xs"
                  onChange={e => handleFileChange('profileImage', e.target.files?.[0] || null)}
                />
                {formData.profileImage && (
                  <img src={formData.profileImage} alt="Profile Preview" className="mt-2 h-16 w-16 object-cover rounded-md border" />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Upload Document (PDF)<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="w-full text-xs"
                  onChange={e => handleFileChange('documentPdf', e.target.files?.[0] || null)}
                />
                {formData.documentPdf && (
                  <div className="mt-2 text-xs text-green-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    PDF Document Selected
                  </div>
                )}
              </div>


              {formData.role === "partner" && (
                <div>
                  <label className="block text-xs font-medium mb-1">Commission (%)<span className="text-red-500 ml-1">*</span></label>
                  <input
                    type="number"
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    value={formData.commission}
                    onChange={e => handleChange('commission', e.target.value)}
                  />{errors.commission && <p className="text-red-500 text-[10px] mt-1">{errors.commission}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md text-xs"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;