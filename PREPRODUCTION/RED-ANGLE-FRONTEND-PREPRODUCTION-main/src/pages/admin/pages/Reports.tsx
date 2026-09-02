import { useState, useEffect } from 'react'
import { Download, Search } from 'lucide-react';
import axios from 'axios';
import { exportToStyledExcel } from '../../../utils/exportExcel';
import Breadcrumb from '../../../components/Breadcrumb';

export default function Reports() {
    const [search, setSearch] = useState('')
    const [reportCategory, setReportCategory] = useState('preproduction')
    const [dateFilter, setDateFilter] = useState('month')
    const [entityId, setEntityId] = useState('')
    
    const [reportData, setReportData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    
    // For dropdowns
    const [allClients, setAllClients] = useState<any[]>([])
    const [allEmployees, setAllEmployees] = useState<any[]>([])

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

    useEffect(() => {
        // Fetch clients and employees for the dropdowns
        const fetchDropdowns = async () => {
            try {
                const [clientRes, empRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/reports/clients`),
                    axios.get(`${API_URL}/admin/reports/employees`)
                ]);
                if (clientRes.data?.success) setAllClients(clientRes.data.data);
                if (empRes.data?.success) setAllEmployees(empRes.data.data);
            } catch (err) {
                console.error("Failed to fetch dropdowns:", err)
            }
        };
        fetchDropdowns();
    }, [])

    useEffect(() => {
        if (['single_client', 'single_employee'].includes(reportCategory) && !entityId) {
            setReportData(null);
            return;
        }
        fetchData()
    }, [reportCategory, dateFilter, entityId])

    const fetchData = async () => {
        setLoading(true)
        try {
            let endpoint = '';
            
            if (['preproduction', 'event', 'post_production'].includes(reportCategory)) {
                endpoint = `/admin/reports/phase/${reportCategory}?dateFilter=${dateFilter}`;
            } else if (reportCategory === 'clients') {
                endpoint = `/admin/reports/clients`;
            } else if (reportCategory === 'attendance') {
                endpoint = `/admin/reports/attendance`;
            } else if (reportCategory === 'leave') {
                endpoint = `/admin/reports/leave`;
            } else if (reportCategory === 'work') {
                endpoint = `/admin/reports/work`;
            } else if (reportCategory === 'single_client') {
                if (!entityId) return;
                endpoint = `/admin/reports/single-client/${entityId}`;
            } else if (reportCategory === 'single_employee') {
                if (!entityId) return;
                endpoint = `/admin/reports/single-employee/${entityId}`;
            }

            if (!endpoint) return;

            const res = await axios.get(`${API_URL}${endpoint}`)
            if (res.data?.success) {
                setReportData(res.data.data)
            }
        } catch (err) {
            console.error("Failed to fetch report:", err)
        } finally {
            setLoading(false)
        }
    }

    const todayDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '-'
        try {
            if (timeStr.includes('-') || timeStr.includes('/') || timeStr.includes('T')) {
                const date = new Date(timeStr)
                if (!isNaN(date.getTime())) {
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
            }
            const [hours, minutes] = timeStr.split(':')
            const date = new Date()
            date.setHours(parseInt(hours, 10))
            date.setMinutes(parseInt(minutes, 10))
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        } catch {
            return timeStr
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-IN');
    }

    const isArrayData = Array.isArray(reportData);

    // Dynamic filtering for array data
    const filteredData = isArrayData ? reportData.filter(item => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        if (item.lead_name && item.lead_name.toLowerCase().includes(searchLower)) return true;
        if (item.first_name && item.first_name.toLowerCase().includes(searchLower)) return true;
        if (item.employee_id && String(item.employee_id).toLowerCase().includes(searchLower)) return true;
        if (item.external_id && String(item.external_id).toLowerCase().includes(searchLower)) return true;
        return false;
    }) : [];

    const handleDownloadExcel = async () => {
        if (!reportData) return;
        await exportToStyledExcel(
            reportCategory,
            reportData,
            filteredData,
            formatDate,
            formatTime,
            todayDate
        );
    };

    const renderTableHeaders = () => {
        if (!isArrayData) return null;
        if (['preproduction', 'event', 'post_production', 'clients'].includes(reportCategory)) {
            return (
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">S.NO</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Lead ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Client Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Event Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Event Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Current Phase</th>
                </tr>
            )
        } else if (reportCategory === 'attendance') {
            return (
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">S.NO</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Emp ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Punch In</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
            )
        } else if (reportCategory === 'leave') {
            return (
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">S.NO</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Leave Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">From - To</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Days</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
            )
        } else if (reportCategory === 'work') {
            return (
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">S.NO</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Client</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Assigned To</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Task</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Deadline</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
            )
        }
    }

    const renderTableRow = (item: any, idx: number) => {
        if (!isArrayData) return null;
        if (['preproduction', 'event', 'post_production', 'clients'].includes(reportCategory)) {
            return (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm text-slate-600">{idx + 1}</td>
                    <td className="px-5 py-4 text-sm text-slate-900 font-medium">{item.external_id || item.lead_serial_number}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.lead_name || '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.event_type || '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.event_date)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.current_phase || '-'}</td>
                </tr>
            )
        } else if (reportCategory === 'attendance') {
            return (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm text-slate-600">{idx + 1}</td>
                    <td className="px-5 py-4 text-sm text-slate-900">{item.employee_id}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-medium">{`${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.date)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatTime(item.check_in)}</td>
                    <td className="px-5 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status?.toLowerCase() === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.status || 'Absent'}
                        </span>
                    </td>
                </tr>
            )
        } else if (reportCategory === 'leave') {
            return (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm text-slate-600">{idx + 1}</td>
                    <td className="px-5 py-4 text-sm text-slate-900 font-medium">{`${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.leave_type || '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.from_date)} - {formatDate(item.to_date)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.no_of_days}</td>
                    <td className="px-5 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' : item.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.status || 'Pending'}
                        </span>
                    </td>
                </tr>
            )
        } else if (reportCategory === 'work') {
            return (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm text-slate-600">{idx + 1}</td>
                    <td className="px-5 py-4 text-sm text-slate-900 font-medium">{item.lead_name || '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{`${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.task_name || '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.deadline)}</td>
                    <td className="px-5 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status?.toLowerCase().includes('complete') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.status || 'Pending'}
                        </span>
                    </td>
                </tr>
            )
        }
    }

    const renderMobileCard = (item: any, idx: number) => {
        if (!isArrayData) return null;
        if (['preproduction', 'event', 'post_production', 'clients'].includes(reportCategory)) {
            return (
                <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{item.lead_name || '-'}</h3>
                            <p className="text-xs text-gray-500">ID: {item.external_id || item.lead_serial_number} • {item.event_type || '-'}</p>
                        </div>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-md">{item.current_phase || '-'}</span>
                    </div>
                    <div className="text-xs text-gray-500">Date: {formatDate(item.event_date)}</div>
                </div>
            )
        } else if (reportCategory === 'attendance') {
            return (
                <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{`${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown'}</h3>
                            <p className="text-xs text-gray-500">Emp ID: {item.employee_id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${item.status?.toLowerCase() === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.status || 'Absent'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">Date: {formatDate(item.date)} • Punch In: {formatTime(item.check_in)}</div>
                </div>
            )
        } else if (reportCategory === 'leave') {
            return (
                <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{`${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown'}</h3>
                            <p className="text-xs text-gray-500">Type: {item.leave_type || '-'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${item.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' : item.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.status || 'Pending'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(item.from_date)} - {formatDate(item.to_date)} ({item.no_of_days} days)</div>
                </div>
            )
        } else if (reportCategory === 'work') {
            return (
                <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{item.lead_name || '-'}</h3>
                            <p className="text-xs text-gray-500">Assigned: {`${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${item.status?.toLowerCase().includes('complete') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.status || 'Pending'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">Task: {item.task_name || '-'} • Deadline: {formatDate(item.deadline)}</div>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="flex flex-col min-h-full max-w-7xl mx-auto p-2 pb-10">
            <Breadcrumb items={[{ label: 'Reports' }]} homeLink="/admin/dashboard" />
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Admin Reports Data</h1>
                    <p className="text-slate-500 mt-1">Export customized production and employee data directly to Excel.</p>
                </div>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Type</label>
                    <select 
                        className="text-sm font-medium rounded-xl appearance-none bg-slate-50 border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer w-full"
                        value={reportCategory}
                        onChange={(e) => {
                            setReportCategory(e.target.value);
                            setEntityId('');
                        }}
                    >
                        <optgroup label="Production Tracking">
                            <option value="preproduction">Pre-production Completed</option>
                            <option value="event">Event Completed</option>
                            <option value="post_production">Post-production Completed</option>
                        </optgroup>
                        <optgroup label="Clients">
                            <option value="clients">All Client Details</option>
                            <option value="single_client">Single Client Detailed Report</option>
                        </optgroup>
                        <optgroup label="Employee Data">
                            <option value="attendance">Overall Attendance</option>
                            <option value="leave">Leave Reports</option>
                            <option value="work">Overall Work Tracking</option>
                            <option value="single_employee">Single Employee Detailed Report</option>
                        </optgroup>
                    </select>
                </div>
                
                {['preproduction', 'event', 'post_production'].includes(reportCategory) && (
                    <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeframe</label>
                        <select 
                            className="text-sm font-medium rounded-xl appearance-none bg-slate-50 border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer w-full"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                )}

                {['single_client', 'single_employee'].includes(reportCategory) && (
                    <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {reportCategory === 'single_client' ? 'Select Client' : 'Select Employee'}
                        </label>
                        <select
                            value={entityId}
                            onChange={e => setEntityId(e.target.value)}
                            className="text-sm font-medium rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors w-full cursor-pointer"
                        >
                            <option value="">{reportCategory === 'single_client' ? '-- Select a Client --' : '-- Select an Employee --'}</option>
                            {reportCategory === 'single_client' && allClients.map(c => (
                                <option key={c.external_id || c.lead_serial_number} value={c.external_id || c.lead_serial_number}>
                                    {c.lead_name} ({c.external_id || c.lead_serial_number})
                                </option>
                            ))}
                            {reportCategory === 'single_employee' && allEmployees.map(e => (
                                <option key={e.employee_id} value={e.employee_id}>
                                    {e.first_name} {e.last_name} ({e.employee_id}) - {e.role}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {isArrayData && (
                    <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 flex-1 min-w-[250px] bg-slate-50 border border-slate-200">
                        <Search size={16} className="text-slate-400" />
                        <input type="text" placeholder="Search report..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-transparent outline-none text-sm flex-1 font-medium text-slate-700 placeholder:text-slate-400" />
                    </div>
                )}

                <button 
                    onClick={handleDownloadExcel}
                    disabled={(!isArrayData && !reportData) || (isArrayData && filteredData.length === 0)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                >
                    <Download size={16} /> Download Excel
                </button>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {[
                    { label: isArrayData ? 'Total Rows (Filtered)' : 'Report Ready', val: isArrayData ? filteredData.length : (reportData ? 'Yes' : 'No') },
                    { label: 'Data Source', val: reportCategory.replace('_', ' ').toUpperCase() },
                    { label: 'Current Date', val: todayDate }
                ].map(card => (
                    <div key={card.label} className="bg-white p-6 rounded-2xl border shadow-sm border-slate-100">
                        <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">{card.label}</p>
                        <p className="text-2xl font-bold text-indigo-600">{card.val}</p>
                    </div>
                ))}
            </div>

            {/* Table or Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                {isArrayData ? (
                    <>
                        <div className="hidden md:block overflow-x-auto h-[500px]">
                            <table className="w-full relative">
                                <thead className="sticky top-0 z-10">
                                    {renderTableHeaders()}
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-20 text-slate-500">
                                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
                                                Loading report data...
                                            </td>
                                        </tr>
                                    ) : filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-20 text-slate-500 font-medium">
                                                No data found for this report and filter combination.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((item, idx) => renderTableRow(item, idx))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Stackable Cards */}
                        <div className="md:hidden grid gap-4 bg-gray-50 p-4">
                            {loading ? (
                                <div className="text-center py-10 text-slate-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
                                    Loading report data...
                                </div>
                            ) : filteredData.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 font-medium bg-white rounded-2xl border border-gray-100 p-6">
                                    No data found for this report and filter combination.
                                </div>
                            ) : (
                                filteredData.map((item, idx) => renderMobileCard(item, idx))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-center h-[500px]">
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
                                <p className="text-slate-500">Fetching comprehensive detailed report...</p>
                            </>
                        ) : reportData ? (
                            <div className="p-8 w-full text-left overflow-y-auto h-full max-h-[500px]">
                                {reportCategory === 'single_employee' && (
                                    <div className="max-w-4xl mx-auto">
                                        <div className="mb-6 pb-6 border-b">
                                            <h2 className="text-2xl font-bold text-slate-900">{reportData.employee.first_name} {reportData.employee.last_name}</h2>
                                            <p className="text-slate-500 font-medium">Role: {reportData.employee.role} | ID: {reportData.employee.employee_id}</p>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-slate-800 mb-3">Recent Tasks ({reportData.tasks?.length || 0})</h3>
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 shadow-sm">
                                            {reportData.tasks?.length === 0 ? <p className="text-slate-400 italic">No tasks assigned yet.</p> : reportData.tasks?.slice(0,10).map((t:any, i:number) => (
                                                <div key={i} className="flex justify-between py-2.5 border-b last:border-0 border-slate-200 items-center">
                                                    <div>
                                                        <p className="font-bold text-slate-700">{t.client || t.lead_name || t.lead_code}</p>
                                                        <p className="text-slate-500 text-xs">{t.name || t.task_name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-slate-500 text-sm block mb-1">Due: {formatDate(t.deadline)}</span>
                                                        <span className="text-indigo-600 font-semibold text-xs px-2 py-0.5 bg-indigo-50 rounded-md">{t.status || 'Pending'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {(reportData.tasks?.length > 10) && <p className="text-xs text-slate-400 mt-3 text-center font-medium">... and {reportData.tasks.length - 10} more. Download Excel to view all.</p>}
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-800 mb-3">Recent Attendance</h3>
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                                            {reportData.attendance?.length === 0 ? <p className="text-slate-400 italic">No attendance records.</p> : reportData.attendance?.slice(0,5).map((a:any, i:number) => (
                                                <div key={i} className="flex justify-between py-2 border-b last:border-0 border-slate-200">
                                                    <span className="font-medium text-slate-700">{formatDate(a.date)}</span>
                                                    <span className="text-slate-500 text-sm">In: {formatTime(a.check_in)} / Out: {formatTime(a.check_out)}</span>
                                                </div>
                                            ))}
                                            {(reportData.attendance?.length > 5) && <p className="text-xs text-slate-400 mt-3 text-center font-medium">Download Excel for full attendance log.</p>}
                                        </div>
                                    </div>
                                )}
                                {reportCategory === 'single_client' && (
                                    <div className="max-w-4xl mx-auto">
                                        <div className="mb-6 pb-6 border-b">
                                            <h2 className="text-2xl font-bold text-slate-900">{reportData.client?.name}</h2>
                                            <p className="text-slate-500 font-medium">ID: {reportData.client?.serialNumber || reportData.client?.externalId} | Event: {reportData.client?.eventType}</p>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-800 mb-3">Employee Assignments</h3>
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 shadow-sm">
                                            {reportData.assignmentSummary?.length === 0 ? <p className="text-slate-400 italic">No employees assigned.</p> : reportData.assignmentSummary?.map((a:any, i:number) => (
                                                <div key={i} className="flex justify-between py-2.5 border-b last:border-0 border-slate-200 items-center">
                                                    <div>
                                                        <p className="font-bold text-slate-700">{a.role}</p>
                                                        <p className="text-slate-500 text-xs">Task: {a.task}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-indigo-600 font-semibold text-sm">{a.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-800 mb-3">Financial Summary</h3>
                                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-slate-600">Total Invoice Amount:</span> 
                                                <span className="font-bold text-slate-800">₹{reportData.client?.invoiceTotal || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-slate-600">Remaining Balance:</span> 
                                                <span className="font-bold text-red-600">₹{reportData.client?.invoiceBalance || 0}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-8 border-t pt-8">
                                            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Pipeline Journey</h3>
                                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                                
                                                {/* Phase 1: CRM & Initial Call */}
                                                <div className="relative flex items-start group is-active">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-slate-50 shadow shrink-0 z-10 mt-1">
                                                        1
                                                    </div>
                                                    <div className="ml-6 flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                        <div className="font-bold text-slate-900 mb-2">CRM & Initial Requirements</div>
                                                        <div className="text-slate-500 text-sm space-y-1.5 break-words">
                                                            <p><span className="font-medium text-slate-700">Services:</span> {reportData.client?.services || '-'}</p>
                                                            <p><span className="font-medium text-slate-700">Budget:</span> {reportData.client?.budgetRange || '-'}</p>
                                                            <p><span className="font-medium text-slate-700">Meeting:</span> {reportData.client?.meetingDetails || '-'}</p>
                                                            <p><span className="font-medium text-slate-700">Requirements:</span> {reportData.client?.clientRequirements || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phase 2: Pre-production */}
                                                <div className="relative flex items-start group is-active">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-slate-50 shadow shrink-0 z-10 mt-1">
                                                        2
                                                    </div>
                                                    <div className="ml-6 flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                        <div className="font-bold text-slate-900 mb-2">Pre-Production & Planning</div>
                                                        <div className="text-slate-500 text-sm space-y-1.5 break-words">
                                                            <p><span className="font-medium text-slate-700">Shoot Locations:</span> {JSON.stringify(reportData.client?.shootLocations || [])}</p>
                                                            <p><span className="font-medium text-slate-700">Deliverables:</span> {reportData.client?.deliverables || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phase 3: Event Execution */}
                                                <div className="relative flex items-start group is-active">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-slate-50 shadow shrink-0 z-10 mt-1">
                                                        3
                                                    </div>
                                                    <div className="ml-6 flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                        <div className="font-bold text-slate-900 mb-2">Event Execution & Media</div>
                                                        <div className="text-slate-500 text-sm space-y-1.5 break-words">
                                                            <p><span className="font-medium text-slate-700">Started:</span> {formatDate(reportData.client?.eventStartedAt)}</p>
                                                            <p><span className="font-medium text-slate-700">Ended:</span> {formatDate(reportData.client?.eventEndedAt)}</p>
                                                            <p><span className="font-medium text-slate-700">Photo Drive:</span> {reportData.client?.driveLink ? <a href={reportData.client.driveLink} target="_blank" rel="noreferrer" className="text-indigo-600 underline break-all">{reportData.client.driveLink}</a> : '-'}</p>
                                                            <p><span className="font-medium text-slate-700">Drone Photo Drive:</span> {reportData.client?.dronePhotoDriveLink ? <a href={reportData.client.dronePhotoDriveLink} target="_blank" rel="noreferrer" className="text-indigo-600 underline break-all">{reportData.client.dronePhotoDriveLink}</a> : '-'}</p>
                                                            <p><span className="font-medium text-slate-700">Drone Video Drive:</span> {reportData.client?.droneVideoDriveLink ? <a href={reportData.client.droneVideoDriveLink} target="_blank" rel="noreferrer" className="text-indigo-600 underline break-all">{reportData.client.droneVideoDriveLink}</a> : '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phase 4: Delivery */}
                                                <div className="relative flex items-start group is-active">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-slate-50 shadow shrink-0 z-10 mt-1">
                                                        4
                                                    </div>
                                                    <div className="ml-6 flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                        <div className="font-bold text-slate-900 mb-2">Post-Production & Delivery</div>
                                                        <div className="text-slate-500 text-sm space-y-1.5 break-words">
                                                            <p><span className="font-medium text-slate-700">Photo Delivery:</span> {reportData.client?.photoDeliveryMethod || '-'}</p>
                                                            <p><span className="font-medium text-slate-700">Photo HD Date:</span> {formatDate(reportData.client?.photoHardDiskDeliveryDate)}</p>
                                                            <p><span className="font-medium text-slate-700">Video Delivery:</span> {reportData.client?.videoDeliveryMethod || '-'}</p>
                                                            <p><span className="font-medium text-slate-700">Video HD Date:</span> {formatDate(reportData.client?.videoHardDiskDeliveryDate)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-center text-sm text-slate-400 mt-8 pt-4">Download Excel to view all tabs including Work Progress and Blockers.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Search size={48} className="text-slate-300 mb-6" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Select {reportCategory === 'single_client' ? 'a Client' : 'an Employee'}</h3>
                                <p className="text-slate-500">
                                    Please select a {reportCategory === 'single_client' ? 'Client' : 'Employee'} from the dropdown above to fetch their detailed history.
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
