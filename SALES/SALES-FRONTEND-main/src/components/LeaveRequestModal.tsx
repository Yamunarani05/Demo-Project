import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

interface LeaveRequest {
  id: string;
  serialNo: number;
  name: string;
  date: string;
  fromTime: string;
  toTime: string;
  leaveType: string;
  reason: string;
  empId: string;
  totalDays: number;
  fromDate: string;
  toDate: string;
}

interface LeaveRequestModalProps {
  request: LeaveRequest;
  onClose: () => void;
}

const LeaveRequestModal = ({ request, onClose }: LeaveRequestModalProps) => {
  const [formData, setFormData] = useState({
    empId: request.empId || 'EMP - 1024',
    leaveType: request.leaveType === 'Leave' ? 'Sick leave' : 'Permission',
    totalDays: request.totalDays || 1,
    fromDate: request.fromDate || '12-11-2025',
    toDate: request.toDate || '13-11-2025',
    reason: request.reason || 'fever'
  });

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return 'N/A';

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  useEffect(() => {
    setFormData({
      empId: request.empId || 'EMP - 1024',
      leaveType: request.leaveType === 'Leave' ? 'Sick leave' : 'Permission',
      totalDays: request.totalDays || 1,
      fromDate: formatDate(request.fromDate),
      toDate: formatDate(request.toDate),
      reason: request.reason || 'N/A',
    });
  }, [request]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">New Leave Request</h2>
            <p className="text-xs text-gray-600 mt-0.5">Leave request for approval</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 space-y-3">
          {/* Emp Id */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Emp Id</label>
            <input
              type="text"
              value={formData.empId}
              readOnly
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-xs font-bold text-gray-900"
            />
          </div>

          {/* Leave type and Total days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Leave type</label>
              {/* <select
                value={formData.leaveType}
                onChange={(e) => handleChange('leaveType', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs bg-white"
              >
                <option>Sick leave</option>
                <option>Casual leave</option>
                <option>Permission</option>
                <option>Emergency leave</option>
              </select> */}
              <input
                type="text"
                value={formData.leaveType}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Total days</label>
              <input
                type="number"
                value={formData.totalDays}
                onChange={(e) => handleChange('totalDays', parseInt(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                readOnly
              />
            </div>
          </div>

          {/* From date and To date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">From date</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.fromDate}
                  onChange={(e) => handleChange('fromDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                  readOnly
                />
                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To date</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.toDate}
                  onChange={(e) => handleChange('toDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                />
                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Reason for leave */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reason for leave</label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              rows={3}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs resize-none"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestModal;

