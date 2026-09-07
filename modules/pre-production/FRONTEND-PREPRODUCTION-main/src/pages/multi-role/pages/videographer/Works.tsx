import { useState, useEffect } from 'react'
import { ExternalLink, Video } from 'lucide-react'
import Breadcrumb from '../../../../components/Breadcrumb'

const API_URL = import.meta.env.VITE_API_URL

const formatUIText = (text?: string) => {
    if (!text) return '';
    return text.replace(/Pre-production/gi, 'Outdoor Shoot');
};

interface WorkItem {
    lead_employee_id: number
    lead_id: number
    lead_code: string
    name: string
    client?: string
    type: string
    task_name: string
    priority: string
    deadline: string
    created_at?: string
    upload_link?: string
    task_key?: string
}

const getPriorityStyle = (p: string) => {
    switch (p?.toLowerCase()) {
        case 'high': return 'bg-red-50 text-red-700'
        case 'medium': return 'bg-orange-50 text-orange-700'
        case 'low': return 'bg-green-50 text-green-700'
        default: return 'bg-gray-50 text-gray-600'
    }
}

const timeValue = (value?: string) => {
    if (!value) return Number.MIN_SAFE_INTEGER
    const parsed = new Date(value).getTime()
    return Number.isNaN(parsed) ? Number.MIN_SAFE_INTEGER : parsed
}

const sortNewestFirst = (items: WorkItem[]) =>
    [...items].sort((a, b) =>
        timeValue(b.created_at) - timeValue(a.created_at)
        || timeValue(b.deadline) - timeValue(a.deadline)
        || String(a.lead_code || '').localeCompare(String(b.lead_code || ''))
    )

export default function VideographerWorks() {
    const [works, setWorks] = useState<WorkItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const raw = localStorage.getItem('ra_user')
        if (!raw) return
        const user = JSON.parse(raw)
        const empId = user?.employee_id
        if (!empId) return

        fetch(`${API_URL}/employee/${empId}/my-work`)
            .then(r => r.json())
            .then(result => {
                if (result.success) {
                    const filtered = (result.data || []).filter((w: WorkItem) => 
                        ['videography', 'secondary-videography', 'event-videography', 'event-secondary-videography'].includes(w.task_key || '')
                    );
                    setWorks(sortNewestFirst(filtered))
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
            <Breadcrumb items={[{ label: 'Works' }]} homeLink="/multi-role/dashboard" />
            <div className="mb-5">
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Video size={20} className="text-green-600" /> Videographer — Works
                </h1>
                <p className="text-sm text-gray-500">All your videography work items</p>
            </div>

            {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
            : works.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center bg-white rounded-xl border border-gray-100">No work items</p>
            : (
                <div className="flex flex-col gap-8">
                    {(() => {
                        const outdoorWorks = works.filter(w => ['videography', 'secondary-videography'].includes(w.task_key || ''));
                        const eventWorks = works.filter(w => ['event-videography', 'event-secondary-videography'].includes(w.task_key || ''));

                        const renderTable = (items: WorkItem[], title: string) => {
                            if (items.length === 0) return null;
                            return (
                                <div>
                                    <h2 className="text-md font-semibold text-gray-800 mb-3">{title}</h2>
                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Lead ID</th>
                                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Task</th>
                                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Deadline</th>
                                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Priority</th>
                                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {items.map(w => (
                                                        <tr key={w.lead_employee_id} className="hover:bg-gray-50/50">
                                                            <td className="px-4 py-3 font-medium text-green-600">{w.lead_code || `LD-${w.lead_id}`}</td>
                                                            <td className="px-4 py-3 text-gray-900">{w.client || w.name}</td>
                                                            <td className="px-4 py-3 text-gray-600 flex items-center gap-1"><Video size={13} className="text-green-500" /> {formatUIText(w.task_name || w.name)}</td>
                                                            <td className="px-4 py-3 text-gray-600">{w.type}</td>
                                                            <td className="px-4 py-3 text-gray-600">{w.deadline || '—'}</td>
                                                            <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityStyle(w.priority)}`}>{w.priority || '—'}</span></td>
                                                            <td className="px-4 py-3">
                                                                {w.upload_link ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => window.open(w.upload_link, '_blank', 'noopener,noreferrer')}
                                                                        className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                                                                    >
                                                                        <ExternalLink size={13} /> View Files
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs font-semibold text-gray-300">No upload</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Mobile Stackable Cards */}
                                        <div className="md:hidden grid gap-4 p-4 bg-gray-50/50">
                                            {items.map(w => (
                                                <div key={w.lead_employee_id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{w.client || w.name}</h3>
                                                            <p className="text-xs font-medium text-green-600">{w.lead_code || `LD-${w.lead_id}`}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Task:</span>
                                                            <span className="font-medium text-gray-700 flex items-center gap-1"><Video size={11} className="text-green-500" /> {formatUIText(w.task_name || w.name)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Type:</span>
                                                            <span className="font-medium text-gray-700">{w.type}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Deadline:</span>
                                                            <span className="font-medium text-gray-700">{w.deadline || '—'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Priority:</span>
                                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getPriorityStyle(w.priority)}`}>
                                                                {w.priority || '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end pt-2 border-t border-gray-100">
                                                        {w.upload_link ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(w.upload_link, '_blank', 'noopener,noreferrer')}
                                                                className="flex-1 justify-center inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100"
                                                            >
                                                                <ExternalLink size={14} /> View Files
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-gray-300 w-full text-center py-2">No upload</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        };

                        return (
                            <>
                                {renderTable(outdoorWorks, 'Outdoor Shoot Works')}
                                {renderTable(eventWorks, 'Event Works')}
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    )
}
