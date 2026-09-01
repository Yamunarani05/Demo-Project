import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

export interface Lead {
  leadId: string;
  leadName: string;
  type: string;
  createdDate: string;
  editedDate: string;
  status: string;
  // Extended fields for the form
  firstName?: string;
  lastName?: string;
  email?: string;
  priority?: string;
  contactNumber?: string;
  address?: string;
  eventType?: string;
  leadSource?: string;
  budget?: string;

  assignee?: string;
  leadType?: string;

  currentStage?: string;
}

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Partial<Lead>) => void;
  leadData?: Lead | null;
  mode: 'add' | 'edit' | 'view';
  isSaving?: boolean;
}

const LeadModal = ({ isOpen, onClose, onSave, leadData, mode, isSaving = false }: LeadModalProps) => {
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

    assignee: '',
    leadType: 'LD',

    currentStage: 'Lead'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Lead, string>>>({});
  const validate = () => {
    const newErrors: Partial<Record<keyof Lead, string>> = {};

    if (!formData.firstName) newErrors.firstName = 'First Name is required';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact Number is required';
    if (!formData.eventType) newErrors.eventType = 'Event Type is required';
    if (!formData.leadSource) newErrors.leadSource = 'Lead Source is required';
    if (!formData.leadType) newErrors.leadType = 'Lead Type is required' as any;

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  // Update form data when leadData changes
  useEffect(() => {
    if (leadData) {
      setFormData({
        firstName: leadData.firstName || '',
        lastName: leadData.lastName || '',
        email: leadData.email || '',
        priority: leadData.priority || '',
        contactNumber: leadData.contactNumber || '',
        address: leadData.address || '',
        eventType: leadData.eventType || leadData.type || '',
        leadSource: leadData.leadSource || '',
        budget: leadData.budget || '',
        leadType: leadData.leadType || 'LD',

        assignee: leadData.assignee || '',

        currentStage: leadData.currentStage || 'Lead'
      });
    } else {
      // Reset form for new lead
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        priority: '',
        contactNumber: '',
        address: '',
        eventType: '',
        leadSource: '',
        budget: '',
        leadType: 'LD',

        assignee: '',

        currentStage: 'Lead'
      });
    }
  }, [leadData, isOpen]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return; // stop submission if errors exist

    const newLead: Partial<Lead> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      contactNumber: formData.contactNumber,
      address: formData.address,
      eventType: formData.eventType,
      leadSource: formData.leadSource,
      priority: formData.priority,
      budget: formData.budget,
      leadType: formData.leadType,
      currentStage: formData.currentStage,
      status: formData.currentStage || 'Lead'
    };

    onSave(newLead);
  };


  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'add' ? 'Add New Lead' : mode === 'edit' ? 'Edit Lead' : 'View Lead'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{currentDate}</p>

          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Details</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.leadType}
                onChange={(e) => handleChange('leadType', e.target.value)}
                disabled={mode === 'view'}
                className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '12px'
                }}
              >
                <option value="LD">LD (Love Destiny)</option>
                <option value="RAS">RAS (Red Angle Studio)</option>
              </select>
              {errors.leadType && <p className="text-red-500 text-sm mt-1">{errors.leadType as string}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter First Name"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)'
                  }}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)'
                  }}
                />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>
          </div>

          {/* Communication Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Communication Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)'
                  }}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px'
                  }}
                >
                  
                  <option value="">Choose the priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)'
                  }}
                />
                {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  placeholder="Enter Address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleChange('eventType', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="">Select event type</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Pre-Wedding">Pre-Wedding</option>
                  <option value="Baby Shower">Baby Shower</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Photoshoot">Photoshoot</option>
                </select>
                {errors.eventType && <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Sources <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => handleChange('leadSource', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="">Select lead source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Assignee">Assignee</option>
                </select>
                {errors.leadSource && <p className="text-red-500 text-sm mt-1">{errors.leadSource}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <input
                  type="number"
                  placeholder="Enter budget amount"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)'
                  }}
                />
              </div>

              {/* <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stage <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.currentStage}
                  onChange={(e) => handleChange('currentStage', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="Lead">Lead</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div> */}


            </div>
          </div>

          {/* Submit Button */}
          {mode !== 'view' && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className={`px-8 py-3 rounded-lg font-semibold transition-all shadow-lg ${isSaving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white hover:from-[#5a2dd4] hover:to-[#4a23c3]'
                  }`}
              >
                {isSaving ? 'Saving to Database...' : mode === 'add' ? 'Create Lead' : 'Update Lead'}
              </button>
            </div>
          )}


        </form>
      </div>
    </div>
  );
};

export default LeadModal;