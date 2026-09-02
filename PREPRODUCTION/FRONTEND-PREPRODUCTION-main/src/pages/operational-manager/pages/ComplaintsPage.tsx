import { useState, useEffect } from 'react'
import { MessageSquareWarning, Search, CheckCircle2, AlertCircle, Clock, X, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [resolvingId, setResolvingId] = useState<number | null>(null)
    const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
    const token = localStorage.getItem('token') || localStorage.getItem('ra_token')

    const fetchComplaints = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${API_URL}/operational-manager/complaints`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setComplaints(res.data.data)
            }
        } catch (err) {
            console.error("Failed to fetch complaints", err)
            toast.error("Failed to load complaints")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComplaints()
    }, [API_URL, token])

    const handleResolve = async (id: number) => {
        try {
            setResolvingId(id)
            const res = await axios.patch(`${API_URL}/operational-manager/complaints/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success("Complaint resolved successfully")
                setComplaints(prev => prev.map(c => 
                    c.id === id ? { ...c, status: 'Resolved', resolvedAt: new Date().toISOString() } : c
                ))
                if (selectedComplaint && selectedComplaint.id === id) {
                    setSelectedComplaint((prev: any) => ({ ...prev, status: 'Resolved', resolvedAt: new Date().toISOString() }))
                }
            }
        } catch (err: any) {
            console.error("Failed to resolve complaint", err)
            toast.error(err.response?.data?.message || "Failed to resolve complaint")
        } finally {
            setResolvingId(null)
        }
    }

    const filteredComplaints = complaints.filter(c => 
        c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.leadSerialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <MessageSquareWarning className="text-red-500" size={28} />
                        Client Complaints
                    </h1>
                    <p className="text-gray-500 mt-1">Monitor and resolve complaints raised by clients.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search complaints..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Client</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Subject</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Event Type</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Date</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                                        Loading complaints...
                                    </td>
                                </tr>
                            ) : filteredComplaints.length > 0 ? (
                                filteredComplaints.map(complaint => (
                                    <tr key={complaint.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{complaint.firstName} {complaint.lastName}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{complaint.leadSerialNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                                            {complaint.subject || 'No Subject'}
                                        </td>
                                        <td className="px-6 py-4 max-w-[150px] truncate">
                                            {complaint.eventType || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                complaint.status === 'Resolved' 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                                    : 'bg-red-50 text-red-700 border border-red-200/50'
                                            }`}>
                                                {complaint.status === 'Resolved' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                {complaint.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap flex items-center gap-2">
                                            <Clock size={14} className="text-gray-400" />
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedComplaint(complaint)}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-semibold hover:bg-purple-100 hover:border-purple-300 transition-all"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                                            <CheckCircle2 size={24} className="text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900 mb-1">No complaints found</p>
                                        <p className="text-sm">Everything looks good.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquareWarning className="text-red-500" size={20} />
                                Complaint Details
                            </h2>
                            <button 
                                onClick={() => setSelectedComplaint(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            
                            {/* Client Info Banner */}
                            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Client Name</p>
                                    <p className="font-bold text-gray-900 text-sm">{selectedComplaint.firstName} {selectedComplaint.lastName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Lead: {selectedComplaint.leadSerialNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Event Type</p>
                                    <p className="font-medium text-gray-800 text-sm flex items-center gap-1.5">
                                        <CalendarIcon size={14} className="text-purple-400" />
                                        {selectedComplaint.eventType || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Email</p>
                                    <p className="font-medium text-gray-800 text-sm flex items-center gap-1.5">
                                        <Mail size={14} className="text-purple-400" />
                                        {selectedComplaint.clientEmail || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Mobile Number</p>
                                    <p className="font-medium text-gray-800 text-sm flex items-center gap-1.5">
                                        <Phone size={14} className="text-purple-400" />
                                        {selectedComplaint.clientMobile || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Complaint Content */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-900 text-base">
                                        {selectedComplaint.subject || 'No Subject'}
                                    </h3>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest ${
                                        selectedComplaint.status === 'Resolved' 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                            : 'bg-red-50 text-red-700 border border-red-200/50'
                                    }`}>
                                        {selectedComplaint.status}
                                    </span>
                                </div>
                                
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[120px]">
                                    {selectedComplaint.complaint}
                                </div>
                                
                                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 font-medium">
                                    <Clock size={14} />
                                    Submitted on {new Date(selectedComplaint.createdAt).toLocaleString()}
                                    {selectedComplaint.status === 'Resolved' && selectedComplaint.resolvedAt && (
                                        <>
                                            <span className="mx-2">•</span>
                                            <span className="text-emerald-600">Resolved on {new Date(selectedComplaint.resolvedAt).toLocaleString()}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                            <button 
                                onClick={() => setSelectedComplaint(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            
                            {selectedComplaint.status !== 'Resolved' && (
                                <button 
                                    onClick={() => handleResolve(selectedComplaint.id)}
                                    disabled={resolvingId === selectedComplaint.id}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {resolvingId === selectedComplaint.id ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Resolving...</>
                                    ) : (
                                        <><CheckCircle2 size={16} /> Mark as Resolved</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
