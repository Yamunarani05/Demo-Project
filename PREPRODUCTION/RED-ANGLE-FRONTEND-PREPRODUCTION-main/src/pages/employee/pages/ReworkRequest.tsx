import { useState, useEffect } from 'react'
import { AlertTriangle, Calendar, MessageSquare, RefreshCw, Link2 } from 'lucide-react'
import { getReworkProjects } from '../../../api/employee.api'
import Breadcrumb from '../../../components/Breadcrumb'

type ReworkProject = {
    id: number
    project_id: string
    project_name: string
    project_type: string
    employee_id: string
    status: string
    upload_link?: string
    admin_notes?: string
    created_at: string
}

export default function ReworkRequest() {
    const [projects, setProjects] = useState<ReworkProject[]>([])
    const [loading, setLoading] = useState(true)
    const [noteModal, setNoteModal] = useState<ReworkProject | null>(null)

    const getEmployeeId = () => {
        try {
            const user = JSON.parse(localStorage.getItem('ra_user') || '{}');
            return user.employee_id || localStorage.getItem('employee_id') || '';
        } catch {
            return localStorage.getItem('employee_id') || '';
        }
    };
    const employeeId = getEmployeeId();

    const fetchReworks = () => {
        if (!employeeId) { setLoading(false); return }
        setLoading(true)
        getReworkProjects(employeeId)
            .then(res => setProjects(res.data.data || []))
            .catch(err => console.error('Rework fetch error', err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchReworks() }, [employeeId])

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
            <Breadcrumb items={[{ label: 'Rework Requests' }]} homeLink="/employee/dashboard" />
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Rework Requests</h1>
                <p className="text-sm text-gray-500 font-medium">View and address feedback from the CRM team</p>
            </div>

            {/* Alert Banner */}
            {!loading && projects.length > 0 && (
                <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="bg-orange-400 p-2 rounded-xl shrink-0 mt-0.5 text-white">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-[15px]">
                            {projects.length} design{projects.length !== 1 ? 's' : ''} need{projects.length === 1 ? 's' : ''} your attention
                        </h3>
                        <p className="text-xs text-gray-600 font-medium mt-1">
                            Please review the feedback and update the designs
                        </p>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                        Pending Reworks {!loading && `(${projects.length})`}
                    </h2>
                    <button
                        onClick={fetchReworks}
                        className="text-gray-500 text-sm font-semibold flex items-center gap-2 hover:text-purple-600 transition-colors"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400 text-sm">Loading rework requests...</div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                        <p className="text-gray-500 font-semibold">No rework requests</p>
                        <p className="text-gray-400 text-sm">You're all caught up! No designs need re-uploading.</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                            <thead>
                                <tr className="bg-purple-100/50 rounded-2xl">
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-900 first:rounded-l-2xl">Project ID</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-900">Client Name</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-900">Project Type</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-900">Rework Notes</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-900">Assigned On</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-900 last:rounded-r-2xl">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((row) => (
                                    <tr key={row.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-6 text-sm font-bold text-gray-900">{row.project_id}</td>
                                        <td className="px-6 py-6 text-sm font-medium text-gray-700">{row.project_name}</td>
                                        <td className="px-6 py-6">
                                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                                                {row.project_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-sm font-medium text-gray-600 max-w-[220px]">
                                            <span className="line-clamp-2">{row.admin_notes || '—'}</span>
                                        </td>
                                        <td className="px-6 py-6 text-sm font-bold text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400 shrink-0" />
                                                {new Date(row.created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setNoteModal(row)}
                                                    className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                                                >
                                                    <MessageSquare size={14} /> View Feedback
                                                </button>
                                                {row.upload_link && (
                                                    <a
                                                        href={row.upload_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-purple-300 text-purple-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-400 transition-colors shadow-sm flex items-center gap-1"
                                                    >
                                                        <Link2 size={13} /> View Link
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Stackable Cards */}
                        <div className="md:hidden grid gap-4 mt-4">
                            {projects.map(row => (
                                <div key={row.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{row.project_name}</h3>
                                            <p className="text-xs font-medium text-gray-500">{row.project_id}</p>
                                        </div>
                                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold">
                                            {row.project_type}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1 text-xs">
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-500 min-w-[60px]">Notes:</span>
                                            <span className="font-medium text-gray-700 line-clamp-2 text-right">{row.admin_notes || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="font-medium text-gray-700 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2 border-t border-gray-100 gap-2">
                                        <button
                                            onClick={() => setNoteModal(row)}
                                            className="flex items-center justify-center gap-1.5 flex-1 text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
                                        >
                                            <MessageSquare size={14} /> Feedback
                                        </button>
                                        {row.upload_link && (
                                            <a
                                                href={row.upload_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-1 flex-1 text-xs font-bold bg-purple-300 text-purple-900 hover:bg-purple-400 px-3 py-2 rounded-xl transition-colors"
                                            >
                                                <Link2 size={13} /> Link
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Feedback Modal */}
            {noteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-7 w-[520px] shadow-xl">
                        <h2 className="text-base font-bold text-gray-900 mb-1">Re-upload Feedback</h2>
                        <p className="text-xs text-gray-500 mb-1">
                            Project: <span className="font-semibold text-purple-600">{noteModal.project_name}</span>
                        </p>
                        <p className="text-xs text-gray-400 mb-5">
                            Type: {noteModal.project_type} · ID: {noteModal.project_id}
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                {noteModal.admin_notes || 'No additional notes provided.'}
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setNoteModal(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
