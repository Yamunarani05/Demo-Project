import { useState } from 'react';
import { X } from "lucide-react";
import ContactInput from './contactInput';

interface AddLeadModalProps {
  onClose: () => void;
  onSave?: (formData: any) => void | Promise<void>;
}

const AddLeadModal = ({ onClose, onSave }: AddLeadModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    priority: '',
    contactNumber: '',
    address: '',
    eventType: '',
    leadSource: '',
    budget: '',
    eventDate: '',
    weddingDate: '',
    receptionDate: '',
    assignee: '',
    description: '',
    leadType: 'LD',
    leadSerialNumber: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [isContactValid, setIsContactValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.leadType) newErrors.leadType = "Lead Type is required";
    if (
      formData.leadSerialNumber.trim() &&
      !/^[A-Za-z0-9][A-Za-z0-9/_-]{0,19}$/.test(formData.leadSerialNumber.trim())
    ) {
      newErrors.leadSerialNumber = "Use up to 20 letters, numbers, hyphen, underscore, or slash";
    }
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.priority) newErrors.priority = "Priority is required";

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact Number is required";
    } else if (!isContactValid) {
      newErrors.contactNumber = "Enter a valid phone number";
    }



    if (!formData.eventType) newErrors.eventType = "Event Type is required";
    if (!formData.leadSource) newErrors.leadSource = "Lead Source is required";
    // Event dates are now optional
    if (!formData.description.trim()) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formData };
    if (payload.eventType === 'Wedding') {
      delete (payload as any).eventDate;
    } else {
      delete (payload as any).weddingDate;
      delete (payload as any).receptionDate;
    }
    
    if (!payload.eventDate) delete (payload as any).eventDate;
    if (!(payload as any).weddingDate) delete (payload as any).weddingDate;
    if (!(payload as any).receptionDate) delete (payload as any).receptionDate;

    try {
      setIsSaving(true);
      await onSave?.(payload);
      setIsSaving(false);
      onClose();
    } catch (error) {
      setIsSaving(false);
      throw error;
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add Lead</h2>
            <p className="text-xs text-gray-500 mt-0.5">{currentDate}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">

          {/* Basic Details */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-900 mb-3">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Lead Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.leadType}
                  onChange={(e) => handleChange('leadType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="LD">LD (Love Destiny)</option>
                  <option value="RAS">RAS (Red Angle Studio)</option>
                </select>
                {errors.leadType && <p className="text-red-500 text-[10px] mt-1">{errors.leadType}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Lead ID
                </label>
                <input
                  type="text"
                  placeholder="Auto if left blank"
                  value={formData.leadSerialNumber}
                  onChange={(e) => handleChange('leadSerialNumber', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
                {errors.leadSerialNumber && <p className="text-red-500 text-[10px] mt-1">{errors.leadSerialNumber}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter First Name"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
                {errors.firstName && <p className="text-red-500 text-[10px] mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
                {errors.lastName && <p className="text-red-500 text-[10px] mt-1">{errors.lastName}</p>}
              </div>

            </div>
          </div>

          {/* Communication Details */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-900 mb-3">Communication Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="">Choose the priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                {errors.priority && <p className="text-red-500 text-[10px] mt-1">{errors.priority}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Contact Number <span className="text-red-500">*</span>
                </label>

                <ContactInput
                  value={formData.contactNumber}
                  onChange={(value) => handleChange("contactNumber", value)}
                  onValidationChange={setIsContactValid}
                  required
                />


                {errors.contactNumber && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.contactNumber}
                  </p>
                )}
              </div>


            </div>
          </div>

          {/* Event Details */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-900 mb-3">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleChange('eventType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="">Select event type</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Pre-Wedding">Pre-Wedding</option>
                  <option value="Baby Shower">Baby Shower</option>
                  <option value="Corporate">Corporate</option>
                </select>
                {errors.eventType && <p className="text-red-500 text-[10px] mt-1">{errors.eventType}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Lead Source <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => handleChange('leadSource', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="">Select lead source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Assignee">Assignee</option>
                </select>
                {errors.leadSource && <p className="text-red-500 text-[10px] mt-1">{errors.leadSource}</p>}
              </div>

              <div>
  <label className="block text-xs font-medium text-gray-700 mb-1.5">
    Location <span className="text-red-500">*</span>
  </label>

  <input
    type="text"
    placeholder="Enter Event Location"
    value={formData.address}
    onChange={(e) => handleChange("address", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
  />

  {errors.address && (
    <p className="text-red-500 text-[10px] mt-1">
      {errors.address}
    </p>
  )}
</div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Budget (Optional)
                </label>
                <input
                  type="number"
                  placeholder="Enter budget amount"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              {formData.eventType === 'Wedding' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Wedding Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.weddingDate}
                      onChange={(e) => handleChange('weddingDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                    {errors.weddingDate && <p className="text-red-500 text-[10px] mt-1">{errors.weddingDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Reception Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.receptionDate}
                      onChange={(e) => handleChange('receptionDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                    {errors.receptionDate && <p className="text-red-500 text-[10px] mt-1">{errors.receptionDate}</p>}
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Event Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleChange('eventDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                  {errors.eventDate && <p className="text-red-500 text-[10px] mt-1">{errors.eventDate}</p>}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Add some description of the task"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs resize-none"
                />
                {errors.description && <p className="text-red-500 text-[10px] mt-1">{errors.description}</p>}
              </div>

            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] disabled:from-gray-400 disabled:to-gray-400 text-white rounded-md text-xs"
            >
              {isSaving ? 'Saving...' : 'Save Lead'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
