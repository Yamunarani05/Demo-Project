import { useState, useEffect } from 'react';
import { User, Trash2, X } from 'lucide-react';
import type { Lead } from '../pages/admin/ViewLeads';
import toast from 'react-hot-toast';
import { LeadsAPI } from '../api/leads.api';

interface ViewLeadModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate?: (lead: Lead) => void;
  onDelete?: (leadId: number) => void;
}

const ViewLeadModal = ({ lead, onClose, onUpdate, onDelete }: ViewLeadModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    eventType: '',
    eventDate: '',
    weddingDate: '',
    receptionDate: '',
    budget: '',
    assignee: '',
    leadSource: ''
  });

  useEffect(() => {
    setFormData({
      firstName: lead.firstName || lead.leadName.split(' ')[0] || '',
      lastName: lead.lastName || lead.leadName.split(' ').slice(1).join(' ') || '',
      email: lead.email || '',
      contactNumber: lead.contactNumber || '',
      address: lead.address || '',
      eventType: lead.eventType || lead.leadName.match(/\(([^)]+)\)/)?.[1] || '',
      eventDate: lead.eventDate || '',
      weddingDate: lead.weddingDate || '',
      receptionDate: lead.receptionDate || '',
      budget: lead.budget || '',
      // assignee:
      //   lead.leadSource && typeof lead.leadSource === 'object'
      //     ? lead.leadSource.assignee || ''
      //     : '',
      assignee: lead.assignedEmployee?.name || '',
      leadSource:
        lead.leadSource && typeof lead.leadSource === 'object'
          ? lead.leadSource.type || ''
          : typeof lead.leadSource === 'string'
            ? lead.leadSource
            : ''
    });
  }, [lead]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        address: formData.address,
        eventType: formData.eventType || undefined,
        budget: formData.budget || undefined,
        eventDate: formData.eventType !== 'Wedding' ? (formData.eventDate || undefined) : undefined,
        weddingDate: formData.eventType === 'Wedding' ? (formData.weddingDate || undefined) : undefined,
        receptionDate: formData.eventType === 'Wedding' ? (formData.receptionDate || undefined) : undefined,
        leadSource: formData.leadSource || undefined,
      };

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await LeadsAPI.updateLead(
        Number(lead.leadId),
        payload,
        user.userId
      );

      const updatedLead: Lead = {
        ...lead,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        address: formData.address,
        eventType: formData.eventType || lead.eventType,
        budget: formData.budget || lead.budget,
        eventDate: formData.eventType !== 'Wedding' ? (formData.eventDate || lead.eventDate) : lead.eventDate,
        weddingDate: formData.eventType === 'Wedding' ? (formData.weddingDate || lead.weddingDate) : lead.weddingDate,
        receptionDate: formData.eventType === 'Wedding' ? (formData.receptionDate || lead.receptionDate) : lead.receptionDate,
        leadSource: {
          ...lead.leadSource,
          type: formData.leadSource,
        },
      };

      if (onUpdate) {
        onUpdate(updatedLead);
      }

      toast.success('Lead updated successfully ✅');
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed', error);
      toast.error('Failed to update lead ❌');
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);

  // Call this when the delete button inside the main modal is clicked
  const handleDeleteClick = () => {
    setShowDeleteModal(true); // show custom confirmation popup
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Deleting lead', Number(lead.leadId)); // debug
      await LeadsAPI.deleteLead(Number(lead.leadId));   // wait for backend
      if (onDelete) onDelete(Number(lead.leadId));     // update UI
      toast.success('Lead deleted successfully 👍');
      setShowDeleteModal(false);
      onClose();
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Failed to delete lead');
    }
  };

  const handlePermanentDeleteClick = () => {
    setShowPermanentDeleteModal(true);
  };

  const handleCancelPermanentDelete = () => {
    setShowPermanentDeleteModal(false);
  };

  const handleConfirmPermanentDelete = async () => {
    try {
      console.log('Permanently deleting lead', Number(lead.leadId));
      await LeadsAPI.deleteLeadPermanently(Number(lead.leadId));
      if (onDelete) onDelete(Number(lead.leadId));
      toast.success('Lead permanently deleted 👍');
      setShowPermanentDeleteModal(false);
      onClose();
    } catch (err) {
      console.error('Permanent delete error', err);
      toast.error('Failed to permanently delete lead');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false); // just close the confirmation popup
  };


  const leadName = formData.firstName || lead.leadName.split(' ')[0] || 'Unknown';
  const leadSource = formData.leadSource || lead.leadSource.type || 'Unknown';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(105, 56, 239, 0.11)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 rounded-t-2xl flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-gray-700" />
            <h2 className="text-base font-bold text-gray-900">Lead Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md font-medium hover:from-[#5a2dd4] hover:to-[#4a23c3] transition-all shadow-sm text-xs uppercase"
            >
              UPDATE LEADS
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 flex items-center gap-4 border-b border-gray-200">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {lead.leadSource.avatar ? (
              <img
                src={lead.leadSource.avatar}
                alt={leadName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => {
                    const nameParts = e.target.value.split(' ');
                    handleChange('firstName', nameParts[0] || '');
                    handleChange('lastName', nameParts.slice(1).join(' ') || '');
                  }}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-[#6938ef] mb-2"
                  placeholder="Enter name"
                />
                <div className="flex items-center gap-2">
                  <span className="text-base text-gray-700">Lead Source :</span>
                  <select
                    value={formData.leadSource}
                    onChange={(e) => handleChange('leadSource', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs text-gray-700 appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.25rem center',
                      backgroundSize: '12px',
                      paddingRight: '1.5rem'
                    }}
                  >
                    <option value="">Select lead source</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Assignee">Assignee</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-gray-900">{leadName}</h3>
                <p className="text-xs text-gray-700 mt-0.5">Lead Source : {leadSource}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs font-bold text-gray-900"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs font-bold text-gray-900"
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-900">{formData.firstName} {formData.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Event type</label>
                {isEditing ? (
                  <select
                    value={formData.eventType}
                    onChange={(e) => handleChange('eventType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-base font-bold text-gray-900 appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="">Select event type</option>
                    <option value="Marriage">Marriage</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Pre-Wedding">Pre-Wedding</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                ) : (
                  <p className="text-xs text-gray-900">{formData.eventType || 'Unassigned'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs text-gray-900 resize-none"
                  />
                ) : (
                  <p className="text-xs text-gray-900 whitespace-pre-line">{formData.address || 'Unassigned'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Employee Assigned</label>
                {isEditing ? (
                  <select
                    value={formData.assignee}
                    onChange={(e) => handleChange('assignee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-base font-bold text-gray-900 appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="">Select Assignee</option>
                    <option value="Ramesh">Ramesh</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                  </select>
                ) : (
                  <p className="text-xs text-gray-900">{formData.assignee || 'Unassigned'}</p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              {formData.eventType === 'Wedding' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Wedding Date</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.weddingDate ? formData.weddingDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const isoDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                          handleChange('weddingDate', isoDate);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs font-bold text-gray-900"
                      />
                    ) : (
                      <p className="text-xs font-bold text-gray-900">
                        {formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString() : 'Unassigned'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Reception Date</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.receptionDate ? formData.receptionDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const isoDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                          handleChange('receptionDate', isoDate);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs font-bold text-gray-900"
                      />
                    ) : (
                      <p className="text-xs font-bold text-gray-900">
                        {formData.receptionDate ? new Date(formData.receptionDate).toLocaleDateString() : 'Unassigned'}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Event Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.eventDate ? formData.eventDate.split('T')[0] : ''}
                      onChange={(e) => {
                        const isoDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                        handleChange('eventDate', isoDate);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs font-bold text-gray-900"
                    />
                  ) : (
                    <p className="text-xs font-bold text-gray-900">
                      {formData.eventDate ? new Date(formData.eventDate).toLocaleDateString() : 'Unassigned'}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs text-gray-900"
                  />
                ) : (
                  <p className="text-xs text-gray-900">{formData.email || 'Unassigned'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contact Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs text-gray-900"
                  />
                ) : (
                  <p className="text-xs text-gray-900">{formData.contactNumber || 'Unassigned'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Budget</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs text-gray-900"
                    placeholder="Enter budget"
                  />
                ) : (
                  <p className="text-xs text-gray-900">{formData.budget || 'Unassigned'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-sm text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button
                onClick={handlePermanentDeleteClick}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-md font-medium hover:from-red-800 hover:to-red-950 transition-all shadow-sm text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Permanently
              </button>
            </div>
            <div className="flex items-center gap-3">
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: lead.firstName || lead.leadName.split(' ')[0] || '',
                      lastName: lead.lastName || lead.leadName.split(' ').slice(1).join(' ') || '',
                      email: lead.email || '',
                      contactNumber: lead.contactNumber || '',
                      address: lead.address || '',
                      eventType: lead.eventType || lead.leadName.match(/\(([^)]+)\)/)?.[1] || '',
                      eventDate: lead.eventDate ?? '', // must stay ISO string from backend
                      weddingDate: lead.weddingDate ?? '',
                      receptionDate: lead.receptionDate ?? '',
                      budget: lead.budget || '',
                      assignee: lead.leadSource.assignee || '',
                      leadSource: lead.leadSource.type || ''
                    });
                  }}
                  className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-all text-xs"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={isEditing ? handleSave : onClose}
                className="px-5 py-2 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md font-medium hover:from-[#5a2dd4] hover:to-[#4a23c3] transition-all shadow-sm text-xs uppercase"
              >
                {isEditing ? 'Save' : 'Close'}
              </button>
            </div>
          </div>
          {/* Custom Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center z-60 p-4 bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Lead?</h3>
                <p className="text-xs text-gray-700 mb-6">
                  Are you sure you want to delete this lead? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-1.5 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Permanent Delete Confirmation Modal */}
          {showPermanentDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center z-60 p-4 bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
                <h3 className="text-lg font-bold text-red-600 mb-4">Permanently Delete Lead?</h3>
                <p className="text-xs text-gray-700 mb-6">
                  Are you sure you want to permanently delete this lead from the database? This action absolutely cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleCancelPermanentDelete}
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPermanentDelete}
                    className="px-4 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ViewLeadModal;