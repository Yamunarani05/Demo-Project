import { useEffect, useMemo, useState } from 'react'
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    Download,
    ExternalLink,
    Eye,
    FileText,
    MessageSquareWarning,
    RefreshCcw,
    RotateCcw,
    Search,
    Send,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    User,
    X,
} from 'lucide-react'
import axios from 'axios'
import RawDataDelivery from './RawDataDelivery'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export type QCWorkflowPhase = 'pre_production' | 'post_production' | 'event' | 'all'

interface CrmQCCheckProps {
    workflowPhase?: QCWorkflowPhase
    title?: string
    description?: string
}

type EditorProject = {
    id: number
    project_id: string
    project_name: string
    project_type: string
    employee_id: string
    employee_name?: string
    status: string
    upload_link?: string | null
    admin_notes?: string | null
    updated_at?: string
}

type ApprovalGroup = {
    id: string
    project_id: string
    project_name: string
    project_type: string
    stageLabel: string
    items: EditorProject[]
    status: string
    statusLabel: string
    submittedCount: number
    pendingCount: number
    approvedCount: number
}

const preProductionTypes = ['Save the Date', 'Save the Video', 'Retouching']
const postProductionTypes = [
    'Traditional Video Editing',
    'Retouch Editing',
    'Album Design',
    'Magazine Design',
    'Frame Design',
    'Candid Video Editing',
]
const editorTypes = [...preProductionTypes, ...postProductionTypes]

const roleLabels: Record<string, string> = {
    'Save the Date': 'Save the Date Post',
    'Save the Video': 'Save the Video',
    Retouching: 'Retouch',
    'Traditional Video Editing': 'Traditional Video Editor',
    'Retouch Editing': 'Retouch Editor',
    'Album Design': 'Album Designer',
    'Magazine Design': 'Magazine Designer',
    'Frame Design': 'Frame Designer',
    'Candid Video Editing': 'Candid Video Editor',
}

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
    Pending:      { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400',   label: 'Assigned' },
    Accepted:     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400',    label: 'Accepted' },
    'In Progress':{ bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400',    label: 'In Progress' },
    Completed:    { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500',  label: 'QC Pending' },
    Approved:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Approved' },
    Rework:       { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    label: 'Re-upload Requested' },
}

const reviewStatuses = ['Completed', 'Approved', 'Rework']
const statuses = ['All Status', ...reviewStatuses]

const getPhaseTypes = (phase: QCWorkflowPhase) => {
    if (phase === 'pre_production') return preProductionTypes
    if (phase === 'post_production') return postProductionTypes
    if (phase === 'event') return []
    return editorTypes
}

const formatDate = (value?: string) => {
    if (!value) return '—'
    try {
        return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return '—' }
}

const formatDateShort = (value?: string) => {
    if (!value) return '—'
    try {
        return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return '—' }
}

// ── Parse raw admin_notes into structured query/rework entries ─────────────
type ParsedNote = { type: 'client_query'; timestamp: string; body: string } | { type: 'rework'; body: string }

const parseAdminNotes = (raw: string | null | undefined): ParsedNote[] => {
    if (!raw) return []
    const entries: ParsedNote[] = []
    // Split on === Client Query markers
    const parts = raw.split(/\n?=== Client Query \(([^)]+)\) ===\n?/)
    // parts[0] is text before first marker (rework notes from CRM), then alternating timestamp, body
    const pre = parts[0].trim()
    if (pre) entries.push({ type: 'rework', body: pre })
    for (let i = 1; i < parts.length; i += 2) {
        const timestamp = parts[i]?.trim() || ''
        const body = parts[i + 1]?.trim() || ''
        if (body) entries.push({ type: 'client_query', timestamp, body })
    }
    return entries
}

function AdminNotesDisplay({ notes }: { notes: string | null | undefined }) {
    const entries = parseAdminNotes(notes)
    if (entries.length === 0) return null
    return (
        <div className="mt-4 flex flex-col gap-2.5">
            {entries.map((entry, i) => {
                if (entry.type === 'client_query') {
                    return (
                        <div
                            key={i}
                            className="rounded-xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 shadow-sm"
                        >
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                    <MessageSquareWarning size={14} className="text-orange-500" />
                                    <span className="text-xs font-bold uppercase tracking-wide text-orange-600">Client Query</span>
                                </div>
                                {entry.timestamp && (
                                    <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-500">{entry.timestamp}</span>
                                )}
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-orange-900 whitespace-pre-wrap">{entry.body}</p>
                        </div>
                    )
                }
                return (
                    <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <div className="mb-1.5 flex items-center gap-1.5">
                            <AlertCircle size={13} className="text-amber-500" />
                            <span className="text-xs font-bold uppercase tracking-wide text-amber-600">QC Rework Note</span>
                        </div>
                        <p className="text-sm leading-relaxed text-amber-800 whitespace-pre-wrap">{entry.body}</p>
                    </div>
                )
            })}
        </div>
    )
}

const getGroupStatus = (items: EditorProject[]) => {
    const approved = items.filter(item => item.status === 'Approved').length
    const pending = items.filter(item => item.status === 'Completed').length
    const rework = items.filter(item => item.status === 'Rework').length
    if (items.length > 0 && approved === items.length) return { status: 'Approved', label: 'Approved' }
    if (pending > 0) return { status: 'Completed', label: 'QC Pending' }
    if (rework > 0) return { status: 'Rework', label: 'Re-upload Requested' }
    return { status: items[0]?.status || 'Pending', label: statusConfig[items[0]?.status || 'Pending']?.label || 'Pending' }
}

const getStageApprovalLabel = (projectType: string, phase: QCWorkflowPhase) => {
    if (phase === 'pre_production' || preProductionTypes.includes(projectType)) return 'Pre-production Phase 2'
    if (phase === 'post_production' || postProductionTypes.includes(projectType)) return 'Post-production'
    if (phase === 'event') return 'Event'
    return 'Stage Approval'
}

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', label: status }
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

function ProgressBar({ value, max, color = 'emerald' }: { value: number; max: number; color?: string }) {
    const pct = max === 0 ? 0 : Math.round((value / max) * 100)
    const colorMap: Record<string, string> = {
        emerald: 'from-emerald-400 to-emerald-600',
        violet: 'from-violet-400 to-violet-600',
        indigo: 'from-indigo-400 to-indigo-600',
    }
    return (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${colorMap[color] || colorMap.emerald}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    )
}

export default function CrmQCCheck({
    workflowPhase = 'all',
    title,
    description,
}: CrmQCCheckProps = {}) {
    const [projects, setProjects] = useState<EditorProject[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All Status')
    const [selectedGroup, setSelectedGroup] = useState<ApprovalGroup | null>(null)
    const [selectedProject, setSelectedProject] = useState<EditorProject | null>(null)
    const [reviewNotes, setReviewNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [completionMessage, setCompletionMessage] = useState('')
    const [deliveryProjectId, setDeliveryProjectId] = useState<string | null>(null)
    const [deliverySentProjectIds, setDeliverySentProjectIds] = useState<string[]>([])

    const allowedTypes = useMemo(() => getPhaseTypes(workflowPhase), [workflowPhase])

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_URL}/employee-projects/all`)
            if (res.data?.success) setProjects(res.data.data || [])
        } catch (error) {
            console.error('CRM QC editor projects fetch failed:', error)
            setProjects([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchProjects() }, [])

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase()
        return projects.filter((project) => {
            if (!allowedTypes.includes(project.project_type)) return false
            if (!project.upload_link && !reviewStatuses.includes(project.status)) return false
            const matchesSearch = !query ||
                String(project.id).includes(query) ||
                (project.project_id || '').toLowerCase().includes(query) ||
                (project.project_name || '').toLowerCase().includes(query) ||
                (project.project_type || '').toLowerCase().includes(query) ||
                (project.employee_name || project.employee_id || '').toLowerCase().includes(query)
            const matchesStatus = statusFilter === 'All Status' || project.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [allowedTypes, projects, search, statusFilter])

    const groupedApprovals = useMemo(() => {
        const groups = new Map<string, EditorProject[]>()
        for (const project of filtered) {
            const key = `${project.project_id || project.project_name}-${getStageApprovalLabel(project.project_type, workflowPhase)}`
            groups.set(key, [...(groups.get(key) || []), project])
        }
        return Array.from(groups.entries()).map(([id, items]) => {
            const first = items[0]
            const groupStatus = getGroupStatus(items)
            return {
                id,
                project_id: first.project_id,
                project_name: first.project_name,
                project_type: first.project_type,
                stageLabel: getStageApprovalLabel(first.project_type, workflowPhase),
                items,
                status: groupStatus.status,
                statusLabel: groupStatus.label,
                submittedCount: items.filter(item => Boolean(item.upload_link)).length,
                pendingCount: items.filter(item => item.status === 'Completed').length,
                approvedCount: items.filter(item => item.status === 'Approved').length,
            }
        })
    }, [filtered, workflowPhase])

    const handleAddReview = async (group: ApprovalGroup) => {
        try {
            setSubmitting(true)
            await axios.post(`${API_URL}/crm/projects/${encodeURIComponent(group.project_id)}/final-delivery/add-review`)
            alert('Review access restored for client.')
        } catch (error: any) {
            console.error('Failed to add review:', error)
            alert(error.response?.data?.message || 'Failed to restore review access')
        } finally {
            setSubmitting(false)
        }
    }

    const handleReviewProject = async (project: EditorProject, status: 'Approved' | 'Rework') => {
        setSubmitting(true)
        try {
            await axios.put(`${API_URL}/employee-projects/${project.id}/review`, {
                status,
                admin_notes: status === 'Rework' ? reviewNotes : reviewNotes || undefined,
            })
            setSelectedProject(null)
            if (selectedGroup) {
                const updatedItems = selectedGroup.items.map(item => item.id === project.id ? { ...item, status, admin_notes: status === 'Rework' ? reviewNotes : reviewNotes || null } : item)
                const approvedCount = updatedItems.filter(i => i.status === 'Approved').length
                const pendingCount = updatedItems.filter(i => i.status === 'Completed').length
                const reworkCount = updatedItems.filter(i => i.status === 'Rework').length
                let groupStatus = { status: selectedGroup.status, label: selectedGroup.statusLabel }
                if (updatedItems.length > 0 && approvedCount === updatedItems.length) groupStatus = { status: 'Approved', label: 'Approved' }
                else if (pendingCount > 0) groupStatus = { status: 'Completed', label: 'QC Pending' }
                else if (reworkCount > 0) groupStatus = { status: 'Rework', label: 'Re-upload Requested' }
                else groupStatus = { status: updatedItems[0]?.status || 'Pending', label: statusConfig[updatedItems[0]?.status || 'Pending']?.label || 'Pending' }
                setSelectedGroup({ ...selectedGroup, items: updatedItems, pendingCount, approvedCount, status: groupStatus.status, statusLabel: groupStatus.label })
                if (pendingCount === 0 && approvedCount === updatedItems.length && updatedItems.length > 0)
                    setCompletionMessage('QC approval is complete. Send the approved delivery to the client to unlock the next stage.')
            } else {
                setSelectedGroup(null)
            }
            setReviewNotes('')
            await fetchProjects()
        } catch (error) {
            console.error('CRM QC review failed:', error)
            alert('Failed to update QC review status')
        } finally {
            setSubmitting(false)
        }
    }

    const handleReview = async (status: 'Approved' | 'Rework') => {
        if (!selectedProject) return
        await handleReviewProject(selectedProject, status)
    }

    const handleApproveAll = async (group: ApprovalGroup) => {
        const pendingItems = group.items.filter(item => item.status === 'Completed')
        if (pendingItems.length === 0 || submitting) return
        setSubmitting(true)
        try {
            await Promise.all(pendingItems.map(item =>
                axios.put(`${API_URL}/employee-projects/${item.id}/review`, { status: 'Approved', admin_notes: reviewNotes || undefined })
            ))
            setSelectedProject(null)
            
            setSelectedGroup({ 
                ...group, 
                items: group.items.map(item => pendingItems.some(p => p.id === item.id) ? { ...item, status: 'Approved', admin_notes: reviewNotes || null } : item), 
                pendingCount: 0, 
                approvedCount: group.items.length, 
                status: 'Approved', 
                statusLabel: 'Approved' 
            })
            setCompletionMessage('QC approval is complete. Send the approved delivery to the client to unlock the next stage.')
            setReviewNotes('')
            await fetchProjects()
        } catch (error) {
            console.error('CRM QC approve all failed:', error)
            alert('Failed to approve all pending submissions')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDownloadReport = () => {
        if (groupedApprovals.length === 0) return
        const headers = ['Project ID', 'Client', 'Stage Approval', 'Submissions', 'Pending', 'Approved', 'Status']
        const rows = groupedApprovals.map((row) =>
            [row.project_id, row.project_name, row.stageLabel, row.items.length, row.pendingCount, row.approvedCount, row.statusLabel]
            .map((value) => `"${String(value || '').replace(/"/g, '""')}"`)
            .join(',')
        )
        const blob = new Blob(['\ufeff' + [headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const date = new Date()
        link.href = URL.createObjectURL(blob)
        link.download = `crm_editor_qc_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.csv`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // ── LOADING ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 w-64 rounded-xl bg-slate-200" />
                <div className="h-4 w-48 rounded-lg bg-slate-100" />
                <div className="mt-6 grid grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-32 rounded-2xl bg-slate-100" />
                    ))}
                </div>
            </div>
        )
    }

    // ── RAW DATA DELIVERY ──────────────────────────────────────────────────────
    if (deliveryProjectId) {
        return (
            <RawDataDelivery
                projectId={deliveryProjectId}
                mode="final"
                workflowPhase={workflowPhase}
                onBack={() => setDeliveryProjectId(null)}
                onSent={() => {
                    setDeliverySentProjectIds(prev => prev.includes(deliveryProjectId) ? prev : [...prev, deliveryProjectId])
                    setDeliveryProjectId(null)
                    setCompletionMessage('Delivery details sent to client successfully.')
                }}
            />
        )
    }

    // ── GROUP DETAIL VIEW ──────────────────────────────────────────────────────
    if (selectedGroup && !selectedProject) {
        const canApproveAll = selectedGroup.pendingCount > 0
        const canSendDelivery = workflowPhase === 'pre_production' || workflowPhase === 'post_production' || workflowPhase === 'event'
        const deliveryAlreadySent = deliverySentProjectIds.includes(selectedGroup.project_id)
        const allApproved = selectedGroup.pendingCount === 0 && selectedGroup.approvedCount === selectedGroup.items.length && selectedGroup.items.length > 0
        const approvalPct = selectedGroup.items.length === 0 ? 0 : Math.round((selectedGroup.approvedCount / selectedGroup.items.length) * 100)

        return (
            <div className="min-h-screen">
                {/* ── Header ── */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => { setSelectedGroup(null); setReviewNotes(''); setCompletionMessage('') }}
                            className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="rounded-lg bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-600 uppercase tracking-wide">
                                    {selectedGroup.stageLabel}
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900">{selectedGroup.project_name}</h1>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Lead ID: <span className="font-semibold text-indigo-600">{selectedGroup.project_id}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleAddReview(selectedGroup)}
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 py-2.5 text-sm font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <RefreshCcw size={16} />
                            Add Review
                        </button>
                        <button
                            onClick={() => handleApproveAll(selectedGroup)}
                            disabled={!canApproveAll || submitting}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                        >
                            {submitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Check size={16} />}
                            Approve All
                        </button>
                    </div>
                </div>

                {/* ── Completion Banner ── */}
                {(completionMessage || allApproved) && (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                                    <CheckCircle2 size={20} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-900">Stage approval complete</p>
                                    <p className="mt-0.5 text-sm text-emerald-700">
                                        {completionMessage || 'All items have been approved. Send the delivery to the client.'}
                                    </p>
                                </div>
                            </div>
                            {canSendDelivery && (
                                <button
                                    onClick={() => setDeliveryProjectId(selectedGroup.project_id)}
                                    disabled={deliveryAlreadySent}
                                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition ${
                                        deliveryAlreadySent
                                            ? 'cursor-not-allowed bg-emerald-500 opacity-80'
                                            : 'bg-indigo-600 shadow-indigo-500/25 hover:bg-indigo-700'
                                    }`}
                                >
                                    {deliveryAlreadySent ? <><Check size={15} /> Sent to Client</> : <><Send size={15} /> Send to Client</>}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Stats row ── */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Stage', value: selectedGroup.stageLabel, color: 'text-slate-900', sub: null },
                        { label: 'Total Submissions', value: String(selectedGroup.items.length), color: 'text-slate-900', sub: null },
                        { label: 'QC Pending', value: String(selectedGroup.pendingCount), color: 'text-violet-700', sub: null },
                        { label: 'Approved', value: String(selectedGroup.approvedCount), color: 'text-emerald-700', sub: null },
                    ].map(stat => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
                            <p className={`mt-1.5 text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Progress ── */}
                <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-slate-700">Approval Progress</p>
                        <span className="text-sm font-bold text-emerald-600">{approvalPct}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                            style={{ width: `${approvalPct}%` }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{selectedGroup.approvedCount} of {selectedGroup.items.length} submissions approved</p>
                </div>

                {/* ── Approval Notes ── */}
                <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <FileText size={12} /> Approval Notes
                    </label>
                    <textarea
                        value={reviewNotes}
                        onChange={e => setReviewNotes(e.target.value)}
                        rows={3}
                        placeholder="Optional notes for approve all, or required notes when requesting re-upload from an individual approval..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    />
                </div>

                {/* ── Editor cards ── */}
                <div className="grid gap-4">
                    {selectedGroup.items.map((item) => {
                        const cfg = statusConfig[item.status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', label: item.status }
                        const canReview = item.status === 'Completed'
                        const approvalLabel = `${roleLabels[item.project_type] || item.project_type} Approval`
                        return (
                            <div
                                key={item.id}
                                className={`group rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${canReview ? 'border-violet-100 ring-1 ring-violet-50' : 'border-slate-100'}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                                            {item.project_type.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{approvalLabel}</p>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                <span className="font-semibold text-slate-600">{item.employee_name || item.employee_id}</span>
                                                <span className="mx-1">·</span>{item.employee_id}
                                                <span className="mx-1">·</span>Updated {formatDateShort(item.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {item.upload_link ? (
                                        <a
                                            href={item.upload_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                                        >
                                            <ExternalLink size={13} /> Open Work
                                        </a>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-400">
                                            <FileText size={13} /> No upload yet
                                        </span>
                                    )}
                                    <button
                                        onClick={() => { setSelectedProject(item); setReviewNotes(''); setCompletionMessage('') }}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-100"
                                    >
                                        <Eye size={13} /> View Submission
                                    </button>
                                    <button
                                        onClick={() => handleReviewProject(item, 'Approved')}
                                        disabled={!canReview || submitting}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Check size={13} /> Approve
                                    </button>
                                </div>

                                {item.admin_notes && <AdminNotesDisplay notes={item.admin_notes} />}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // ── INDIVIDUAL PROJECT QC VIEW ─────────────────────────────────────────────
    if (selectedProject) {
        const canReview = selectedProject.status === 'Completed'

        return (
            <div className="min-h-screen">
                {/* ── Header ── */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => { setSelectedProject(null); setReviewNotes('') }}
                            className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <span className="rounded-lg bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-600 uppercase tracking-wide">
                                QC Review
                            </span>
                            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                                {roleLabels[selectedProject.project_type] || selectedProject.project_type}
                            </h1>
                            <p className="text-sm text-slate-500">
                                Lead <span className="font-semibold text-indigo-600">{selectedProject.project_id?.replace('CRM-', '')}</span>
                                {' · '}{selectedProject.project_name}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={selectedProject.status} />
                </div>

                {/* ── Info cards ── */}
                <div className="mb-5 grid gap-5 lg:grid-cols-2">
                    {/* Editor Details */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                                <User size={15} className="text-indigo-600" />
                            </div>
                            <h2 className="text-sm font-bold text-slate-800">Editor Details</h2>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {[
                                { label: 'Employee', value: selectedProject.employee_name || selectedProject.employee_id },
                                { label: 'Employee ID', value: selectedProject.employee_id },
                                { label: 'Role', value: roleLabels[selectedProject.project_type] || selectedProject.project_type },
                            ].map(row => (
                                <div key={row.label} className="py-2.5">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{row.label}</p>
                                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{row.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submission Status */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                                <Clock size={15} className="text-violet-600" />
                            </div>
                            <h2 className="text-sm font-bold text-slate-800">Submission Status</h2>
                        </div>
                        <div className="divide-y divide-slate-50">
                            <div className="py-2.5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current Status</p>
                                <div className="mt-1.5">
                                    <StatusBadge status={selectedProject.status} />
                                </div>
                            </div>
                            <div className="py-2.5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last Updated</p>
                                <p className="mt-0.5 text-sm font-semibold text-slate-800">{formatDate(selectedProject.updated_at)}</p>
                            </div>
                            <div className="py-2.5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Project</p>
                                <p className="mt-0.5 text-sm font-semibold text-slate-800">{selectedProject.project_name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Upload & Notes ── */}
                <div className="mb-5 grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">Uploaded Work</h2>
                        {selectedProject.upload_link ? (
                            <a
                                href={selectedProject.upload_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-4 text-sm font-bold text-indigo-700 transition hover:from-indigo-100 hover:to-blue-100"
                            >
                                <ExternalLink size={16} /> Open Submitted Work
                            </a>
                        ) : (
                            <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                                <FileText size={18} className="text-slate-300" />
                                <p className="text-sm text-slate-400">No upload link submitted yet.</p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">QC History &amp; Client Queries</h2>
                        {selectedProject.admin_notes ? (
                            <AdminNotesDisplay notes={selectedProject.admin_notes} />
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-400">No previous QC notes or client queries on record.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── QC Decision ── */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                            <ShieldCheck size={15} className="text-slate-600" />
                        </div>
                        <h2 className="text-sm font-bold text-slate-800">QC Decision</h2>
                    </div>

                    <textarea
                        value={reviewNotes}
                        onChange={e => setReviewNotes(e.target.value)}
                        rows={3}
                        placeholder="Add QC notes or re-upload instructions..."
                        className="mb-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    />

                    {!canReview && (
                        <div className="mb-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <Clock size={14} className="mt-0.5 shrink-0 text-slate-400" />
                            <p className="text-xs text-slate-500">
                                Approval actions unlock after the editor submits a link and status becomes <strong>QC Pending</strong>.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handleReview('Approved')}
                            disabled={!canReview || submitting}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                        >
                            {submitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Check size={16} />}
                            Approve Submission
                        </button>
                        <button
                            onClick={() => handleReview('Rework')}
                            disabled={!canReview || submitting || !reviewNotes.trim()}
                            className="flex items-center gap-2 rounded-xl border-2 border-rose-200 bg-white px-6 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <RotateCcw size={16} /> Request Re-upload
                        </button>
                    </div>
                    {!reviewNotes.trim() && canReview && (
                        <p className="mt-2 text-xs text-slate-400">Notes are required to request a re-upload.</p>
                    )}
                </div>
            </div>
        )
    }

    // ── MAIN LIST VIEW ─────────────────────────────────────────────────────────
    const totalPending = groupedApprovals.reduce((sum, g) => sum + g.pendingCount, 0)
    const totalApproved = groupedApprovals.reduce((sum, g) => sum + g.approvedCount, 0)

    return (
        <div className="min-h-screen">
            {/* ── Page Header ── */}
            <div className="mb-6 flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                        <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">{title ?? 'QC Checking'}</h1>
                        <p className="mt-0.5 text-sm text-slate-500">{description ?? 'Review and approve editor submissions'}</p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadReport}
                    disabled={groupedApprovals.length === 0}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download size={15} /> Export CSV
                </button>
            </div>

            {/* ── Summary Stats ── */}
            {groupedApprovals.length > 0 && (
                <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Projects</p>
                        <p className="mt-1 text-2xl font-extrabold text-slate-900">{groupedApprovals.length}</p>
                        <ProgressBar value={groupedApprovals.length} max={groupedApprovals.length} color="indigo" />
                    </div>
                    <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">QC Pending</p>
                        <p className="mt-1 text-2xl font-extrabold text-violet-700">{totalPending}</p>
                        <ProgressBar value={totalPending} max={totalPending + totalApproved || 1} color="violet" />
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Approved</p>
                        <p className="mt-1 text-2xl font-extrabold text-emerald-700">{totalApproved}</p>
                        <ProgressBar value={totalApproved} max={totalPending + totalApproved || 1} color="emerald" />
                    </div>
                </div>
            )}

            {/* ── Filters ── */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 max-w-md items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                    <Search size={15} className="shrink-0 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, client, editor or role..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                        <SlidersHorizontal size={13} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="cursor-pointer appearance-none bg-transparent text-sm font-medium text-slate-700 outline-none"
                        >
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Project cards ── */}
            {groupedApprovals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                        <Sparkles size={28} className="text-slate-300" />
                    </div>
                    <p className="text-base font-bold text-slate-600">No QC submissions found</p>
                    <p className="mt-1 text-sm text-slate-400 max-w-xs">
                        {search || statusFilter !== 'All Status'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Editor submissions will appear here once they upload their work.'}
                    </p>
                    {(search || statusFilter !== 'All Status') && (
                        <button
                            onClick={() => { setSearch(''); setStatusFilter('All Status') }}
                            className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {groupedApprovals.map((row) => {
                        const pct = row.items.length === 0 ? 0 : Math.round((row.approvedCount / row.items.length) * 100)
                        const editorRoles = Array.from(new Set(row.items.map(i => roleLabels[i.project_type] || i.project_type)))
                        return (
                            <div
                                key={row.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:border-indigo-100 hover:shadow-md sm:flex-row"
                            >
                                {/* Left accent bar */}
                                <div className={`w-full sm:w-1.5 shrink-0 ${row.status === 'Approved' ? 'bg-emerald-400' : row.status === 'Completed' ? 'bg-violet-400' : row.status === 'Rework' ? 'bg-rose-400' : 'bg-slate-200'}`} style={{ minHeight: '4px' }} />

                                <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                                    {/* Lead ID */}
                                    <div className="shrink-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lead ID</p>
                                        <p className="mt-0.5 text-base font-extrabold text-indigo-600">{row.project_id?.replace('CRM-', '')}</p>
                                    </div>

                                    {/* Client + roles */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{row.project_name}</p>
                                        <p className="mt-0.5 text-xs text-slate-400 truncate">{row.stageLabel}</p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {editorRoles.slice(0, 3).map(role => (
                                                <span key={role} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                    {role}
                                                </span>
                                            ))}
                                            {editorRoles.length > 3 && (
                                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                                                    +{editorRoles.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="shrink-0 min-w-[120px]">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-semibold text-slate-500">Progress</p>
                                            <span className="text-xs font-bold text-emerald-600">{pct}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-slate-400">{row.approvedCount}/{row.items.length} approved</p>
                                    </div>

                                    {/* Status + Action */}
                                    <div className="flex shrink-0 items-center gap-3">
                                        <StatusBadge status={row.status} />
                                        <button
                                            onClick={() => { setSelectedGroup(row); setReviewNotes(''); setCompletionMessage('') }}
                                            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 transition group-hover:bg-indigo-100"
                                        >
                                            Review <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
