import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Calendar, Phone, Mail, Download } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { exportToExcel } from '../../utils/excelExport';

const LeadTrack = () => {
  const location = useLocation();
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  const [leadData, setLeadData] = useState({
    name: '',
    eventType: '',
    source: '',
    location: '',
    eventDate: '',
    createdDate: '',
    leadId: '',
    email: '',
    contact: '',
    currentStage: 'Lead',
    avatar:
      'https://ui-avatars.com/api/?name=Arjun&background=6938ef&color=fff',
  });

  useEffect(() => {
    if (location.state?.lead) {
      const lead = location.state.lead;

      setLeadData({
        name: lead.leadName?.split(' ')[0],
        eventType: lead.leadName?.match(/\(([^)]+)\)/)?.[1],
        source: lead.leadSource?.type,
        location: lead.address,
        eventDate: lead.eventDate,
        createdDate: lead.createdTime,
        leadId: lead.leadId,
        email: lead.email,
        contact: lead.contactNumber,
        currentStage: lead.currentStage,
        avatar: lead.leadSource?.avatar,
      });
    }
  }, [location.state]);

  const handleDownload = () => {
    const headers = [
      'leadId',
      'name',
      'eventType',
      'source',
      'location',
      'eventDate',
      'createdDate',
      'email',
      'contact',
      'currentStage',
    ];

    const data = [
      {
        leadId: leadData.leadId,
        name: leadData.name,
        eventType: leadData.eventType,
        source: leadData.source,
        location: leadData.location,
        eventDate: leadData.eventDate,
        createdDate: leadData.createdDate,
        email: leadData.email,
        contact: leadData.contact,
        currentStage: leadData.currentStage,
      },
    ];

    exportToExcel(
      data,
      `lead_${leadData.leadId}`,
      headers,
      'Lead Tracking Report' // 👈 THIS IS THE KEY
    );
  };

  const stages = ['Lead', 'Quotation', 'Confirmation', 'Finalised'];
  const currentStageIndex = stages.indexOf(leadData.currentStage);

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
            LEADS TRACKING
          </h1>

          <div
            className={
              showLeftPanel
                ? 'grid grid-cols-1 lg:grid-cols-4 gap-4'
                : 'grid grid-cols-1 gap-4'
            }
          >
            {/* LEFT PANEL – toggle */}
            {showLeftPanel && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mb-4">
                  <div className="text-center mb-3">
                    <img
                      src={leadData.avatar}
                      alt={leadData.name}
                      className="w-12 h-12 rounded-full mx-auto mb-2"
                    />
                    <h2 className="text-sm font-bold text-gray-900">
                      {leadData.name}
                    </h2>
                    <p className="text-gray-600 text-xs mt-1 font-normal">
                      {leadData.eventType}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-900 mb-2">
                      Main info
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Source
                        </label>
                        <input
                          type="text"
                          value={leadData.source}
                          readOnly
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs"
                        />
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Event type
                        </label>
                        <input
                          type="text"
                          value={leadData.eventType}
                          readOnly
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs"
                        />
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Location
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={leadData.location}
                            readOnly
                            className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs"
                          />
                          <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Event Date
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={leadData.eventDate}
                            readOnly
                            className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs"
                          />
                          <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Created Date
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={leadData.createdDate}
                            readOnly
                            className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs"
                          />
                          <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT PANEL */}
            <div className={showLeftPanel ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mb-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={leadData.avatar}
                        alt={leadData.name}
                        className="w-12 h-12 rounded-full cursor-pointer"
                        onClick={() => setShowLeftPanel((prev) => !prev)}
                      />
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">
                          {leadData.name}
                        </h2>
                        <p className="text-xs text-gray-600 mt-0.5 font-normal">
                          {leadData.eventType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!leadData.contact) return;
                          window.location.href = `tel:${leadData.contact}`;
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6938ef] text-white rounded-lg font-semibold hover:bg-[#5a2dd4] text-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </button>
                      <button
                        onClick={() => {
                          if (!leadData.email) return;
                          window.location.href = `mailto:${leadData.email}`;
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6938ef] text-white rounded-lg font-semibold hover:bg-[#5a2dd4] text-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="text-xs font-bold text-gray-900 mb-2">
                    Lead Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Employee Id
                      </label>
                      <input
                        type="text"
                        value={leadData.leadId}
                        readOnly
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        EMAIL
                      </label>
                      <input
                        type="email"
                        value={leadData.email}
                        readOnly
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Contact
                      </label>
                      <input
                        type="tel"
                        value={leadData.contact}
                        readOnly
                        className="w-full px-2 py-1.5 border border-blue-500 rounded-lg bg-white text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Current stage
                      </label>
                      <input
                        type="text"
                        value={leadData.currentStage}
                        readOnly
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-bold text-gray-900 mb-3">
                    Status timeline
                  </h3>

                  <div className="relative px-3">
                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200">
                      <div
                        className="absolute left-0 top-0 h-0.5 bg-[#6938ef]"
                        style={{
                          width: `${(currentStageIndex /
                            (stages.length - 1 || 1)) *
                            100
                            }%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between">
                      {stages.map((stage, index) => {
                        const isActive = index <= currentStageIndex;

                        return (
                          <div
                            key={stage}
                            className="relative z-10 flex flex-col items-center"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isActive
                                ? 'bg-[#6938ef] text-white'
                                : 'bg-gray-200 text-gray-500'
                                }`}
                            >
                              {index + 1}
                            </div>

                            <span
                              className={`mt-2 text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'
                                }`}
                            >
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md font-medium hover:from-[#5a2dd4] hover:to-[#4a23c3] transition-all shadow-sm text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadTrack;