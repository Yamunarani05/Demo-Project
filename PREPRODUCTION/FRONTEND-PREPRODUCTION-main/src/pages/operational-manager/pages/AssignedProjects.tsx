import { useEffect, useState } from 'react'
import { CheckCircle2, Eye, RefreshCw, Search, UploadCloud } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

type Lead = {
  id: string
  serialNumber?: string
  name: string
  email: string
  phone: string
  location: string
  eventDate: string
  shootType: string
  flowType?: string
  phaseStatus?: string
  assignedTo?: string
  postProductionPriority?: string
  assignedPostProdCrmId?: string
}

type Assignment = {
  id: number
  project_id: string
  project_name: string
  project_type: string
  employee_id: string
  employee_name?: string
  status: string
  upload_link?: string
}

const postProductionTypes = [
  'Traditional Video Editing',
  'Retouch Editing',
  'Album Design',
  'Magazine Design',
  'Frame Design',
  'Candid Video Editing',
]

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-GB')
  } catch {
    return '—'
  }
}

export default function AssignedProjects() {
  const navigate = useNavigate()
  const location = useLocation()
  const isPostProductionCRM = location.pathname.startsWith('/post-production-crm')
  const assignEditorPath = isPostProductionCRM
    ? '/post-production-crm/assign-editor'
    : '/operational-manager/assign-editor'
  const [leads, setLeads] = useState<Lead[]>([])
  const [assignmentsByProject, setAssignmentsByProject] = useState<Record<string, Assignment[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [assignCrmModal, setAssignCrmModal] = useState<{ isOpen: boolean, leadId: string }>({ isOpen: false, leadId: '' })
  const [crmEmployees, setCrmEmployees] = useState<any[]>([])
  const [selectedCrmId, setSelectedCrmId] = useState('')

  const fetchCrmEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/employees`)
      const emps = res.data.data.filter((e: any) => e.role?.toLowerCase().includes('post-production crm'))
      setCrmEmployees(emps)
    } catch (err) {}
  }

  const handlePriorityChange = async (leadId: string, priority: string) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/crm/leads/${leadId}/post-production-priority`, {
        priority
      });
      setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, postProductionPriority: priority } : lead));
    } catch (err) {
      console.error('Failed to update priority', err);
      alert('Failed to update post-production priority');
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError('')
      const [leadRes, assignmentRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/dashboard/leads`),
        axios.get(`${import.meta.env.VITE_API_URL}/employee-projects/all`).catch(() => null),
      ])
      const formatted: Lead[] = (leadRes.data?.data || [])
        .filter((lead: any) => lead.currentPhase === 'post_production')
        .map((lead: any) => ({
          id: String(lead.id),
          serialNumber: lead.serialNumber,
          name: lead.leadName ?? 'Unknown Client',
          email: lead.email ?? '-',
          phone: lead.phone ?? '-',
          location: lead.location ?? '-',
          eventDate: formatDate(lead.eventDate),
          shootType: lead.eventType ?? '-',
          flowType: lead.flowType,
          phaseStatus: lead.phaseStatus,
          assignedTo: lead.assignedTo,
          postProductionPriority: lead.postProductionPriority,
          assignedPostProdCrmId: lead.assignedPostProdCrmId,
        }))

      const grouped = (assignmentRes?.data?.data || [])
        .filter((assignment: Assignment) => postProductionTypes.includes(assignment.project_type))
        .reduce((acc: Record<string, Assignment[]>, assignment: Assignment) => {
          acc[assignment.project_id] = [...(acc[assignment.project_id] || []), assignment]
          return acc
        }, {})

      setLeads(formatted)
      setAssignmentsByProject(grouped)
    } catch (err) {
      console.error('Failed to load post-production leads', err)
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    if (!isPostProductionCRM) fetchCrmEmployees()
  }, [])

  const filtered = leads.filter(lead => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.id.toLowerCase().includes(q) ||
      (lead.serialNumber || '').toLowerCase().includes(q) ||
      lead.shootType.toLowerCase().includes(q)
    )
  })

  const handleAssignCrm = async () => {
    if (!selectedCrmId) return alert('Please select a CRM employee');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/crm/leads/${assignCrmModal.leadId}/assign-post-production-crm`, {
        employeeId: selectedCrmId
      });
      setAssignCrmModal({ isOpen: false, leadId: '' });
      setSelectedCrmId('');
      fetchLeads();
    } catch (err) {
      console.error(err);
      alert('Failed to assign CRM');
    }
  };

  const getProjectAssignments = (lead: Lead) => assignmentsByProject[`CRM-${lead.serialNumber || lead.id}`] || []

  const getProgress = (assignments: Assignment[]) => {
    const basis = assignments.filter(item => postProductionTypes.includes(item.project_type))
    if (basis.length === 0) return { completed: 0, total: postProductionTypes.length, percent: 0 }

    const completed = basis.filter(item =>
      ['completed', 'approved'].includes(item.status.toLowerCase()) || Boolean(item.upload_link)
    ).length

    return {
      completed,
      total: basis.length,
      percent: Math.round((completed / basis.length) * 100),
    }
  }

  const getLeadStatus = (assignments: Assignment[]) => {
    if (assignments.length === 0) return { label: 'Awaiting editor assignment', tone: 'amber' }
    if (assignments.some(item => item.status.toLowerCase() === 'rework')) return { label: 'Rework requested', tone: 'amber' }
    if (assignments.length > 0 && assignments.every(item => item.status.toLowerCase() === 'approved')) return { label: 'Approved', tone: 'green' }
    if (assignments.some(item => ['completed', 'approved'].includes(item.status.toLowerCase()) || item.upload_link)) return { label: 'Review in progress', tone: 'blue' }
    return { label: 'Editors assigned', tone: 'purple' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Post-production leads</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Assign editors and track Traditional Video, Retouch, Album Design, and Candid Video progress
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="crm-card flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 bg-white"
          style={{ color: '#6B7280' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Post-production Queue</h2>
            {!loading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {filtered.length} project{filtered.length !== 1 ? 's' : ''} ready for editor assignment
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-5"
          style={{ background: '#F0EFFE', border: '1px solid #E0DFFE' }}>
          <Search size={14} style={{ color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search by client name, lead ID, or event type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: '#374151' }}
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Loading post-production projects...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-gray-500 font-semibold">No projects in post-production yet</p>
            <p className="text-gray-400 text-sm">
              Projects appear here after the Event Coordinator approves and advances the lead.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                  {[
                    'Lead ID', 'Client Name', 'Event Type', 'Event Date', 'Editor Roles', 'Progress', 'Status',
                    'Priority',
                    ...(isPostProductionCRM ? [] : ['Assigned CRM']),
                    'Action'
                  ].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const assignments = getProjectAssignments(lead)
                  const progress = getProgress(assignments)
                  const status = getLeadStatus(assignments)
                  const statusClass = status.tone === 'green'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : status.tone === 'blue'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : status.tone === 'purple'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'

                  return (
                    <tr key={lead.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-indigo-600 align-middle">{lead.serialNumber || lead.id}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-900 align-middle">{lead.name}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 align-middle">{lead.shootType}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 align-middle">{lead.eventDate}</td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex max-w-[250px] flex-wrap gap-1.5">
                          {assignments.length === 0 ? (
                            <span className="text-xs font-medium text-gray-400 italic">Not assigned</span>
                          ) : assignments.map(assignment => (
                            <span
                              key={assignment.id}
                              className="rounded bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600 border border-gray-200"
                              title={assignment.employee_name || assignment.employee_id}
                            >
                              {assignment.project_type.replace(' Editing', '').replace(' Design', '')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="min-w-[120px]">
                          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-gray-500 tracking-wide">
                            <span>{progress.completed}/{progress.total} TASKS</span>
                            <span>{progress.percent}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm align-middle">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${statusClass}`}>
                          {progress.percent === 100 ? <CheckCircle2 size={12} strokeWidth={3} /> : <UploadCloud size={12} strokeWidth={3} />}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm align-middle">
                        <select
                          className="w-full min-w-[100px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          value={lead.postProductionPriority || ''}
                          onChange={(e) => handlePriorityChange(lead.id, e.target.value)}
                        >
                          <option value="">Priority...</option>
                          <option value="High">🔴 High</option>
                          <option value="Medium">🟡 Medium</option>
                          <option value="Low">🟢 Low</option>
                        </select>
                      </td>
                      {!isPostProductionCRM && (
                        <td className="px-5 py-4 align-middle">
                           {lead.assignedPostProdCrmId ? (() => {
                             const emp = crmEmployees.find(e => String(e.employee_id) === String(lead.assignedPostProdCrmId));
                             return (
                               <div className="flex items-center gap-2.5">
                                 <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200">
                                   {emp ? emp.first_name.charAt(0).toUpperCase() : '?'}
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="text-xs font-bold text-gray-900">{emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Unknown'}</span>
                                   <span className="text-[10px] font-medium text-gray-500">{lead.assignedPostProdCrmId}</span>
                                 </div>
                               </div>
                             );
                           })() : (
                             <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 border border-gray-200">
                               Unassigned
                             </span>
                           )}
                        </td>
                      )}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-col gap-2 min-w-[130px]">
                          {!isPostProductionCRM && (
                            <button
                              onClick={() => setAssignCrmModal({ isOpen: true, leadId: lead.id })}
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                            >
                              {lead.assignedPostProdCrmId ? 'Re-assign CRM' : 'Assign CRM'}
                            </button>
                          )}
                          <button
                            onClick={() => navigate(assignEditorPath, { state: { lead_id: lead.serialNumber || lead.id, client: lead.name, context: 'post_production' } })}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                          >
                            <Eye size={12} strokeWidth={2.5} /> {assignments.length ? 'Manage Editors' : 'Assign Editor'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {assignCrmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Assign Post-Production CRM</h2>
            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Select CRM Employee</label>
                <select
                  className="w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
                  value={selectedCrmId}
                  onChange={e => setSelectedCrmId(e.target.value)}
                >
                  <option value="">Select an employee...</option>
                  {crmEmployees.map(emp => (
                    <option key={emp.id} value={emp.employee_id}>{emp.first_name} {emp.last_name || ''} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAssignCrmModal({ isOpen: false, leadId: '' })}
                className="rounded-xl px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCrm}
                className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
