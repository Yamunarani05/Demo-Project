import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Camera, Save, UploadCloud, Users, Video, Trash2 } from 'lucide-react'
import axios from 'axios'
import { getAssignTeam, saveAssignTeam } from '../../../api/assignTeam.api'
import { getEventDetailsByLeadId, saveEventDetails } from '../../../api/eventDetails.api'
import { EmployeePicker, AdditionalStaffPicker, type Employee } from '../../../ClientFlow/assignTeamShared'

type ClientLike = {
  id: string
  serialNumber?: string
  name: string
  email: string
  phone: string
  location: string
  eventDate: string
  shootType: string
}

type Props = {
  client: ClientLike
  onBack: () => void
  onNext: () => void
}

type TeamState = {
  photographer: string
  videographer: string
  drone: string
  secondary_photographer: string
  secondary_videographer: string
  event_date: string
  event_time: string
  location: string
}

type UploadProgressItem = {
  key: string
  label: string
  employee_id: string | null
  required: boolean
  uploaded: boolean
  upload_link: string | null
}

type EventDataProgress = {
  media_status: string
  required_count: number
  uploaded_count: number
  all_uploaded: boolean
  data_manager_approved: boolean
  workflow_status: string
  next_owner: string
  next_path: string
  uploads: UploadProgressItem[]
}

const emptyTeamState: TeamState = {
  photographer: '',
  videographer: '',
  drone: '',
  secondary_photographer: '',
  secondary_videographer: '',
  event_date: '',
  event_time: '',
  location: '',
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: '#111827' }}>{title}</h3>
      {children}
    </div>
  )
}

// function FieldLabel({ children }: { children: React.ReactNode }) {
//   return (
//     <label className="block text-xs font-semibold mb-2" style={{ color: '#4B5563' }}>
//       {children}
//     </label>
//   )
// }

function InputShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white px-4 py-3" style={{ borderColor: '#E5E7EB' }}>
      {children}
    </div>
  )
}

export default function EventStageClientView({ client, onBack, onNext }: Props) {
  const actualId = client.id;
  const API_URL = import.meta.env.VITE_API_URL
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [teamState, setTeamState] = useState<TeamState>(emptyTeamState)
  const [additionalStaff, setAdditionalStaff] = useState<string[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [phaseStatus, setPhaseStatus] = useState<string>('')
  const [, setDataProgress] = useState<EventDataProgress | null>(null)
  const [invoiceServices, setInvoiceServices] = useState<string[]>([])
  const [photoLabels, setPhotoLabels] = useState<string[]>([])
  const [videoLabels, setVideoLabels] = useState<string[]>([])
  const [droneLabels, setDroneLabels] = useState<string[]>([])

  const [invitationFile, setInvitationFile] = useState<File | string | null>(null)
  const [invitationPreview, setInvitationPreview] = useState<string | null>(null)
  const [serviceDetails, setServiceDetails] = useState([{ type: '', name: '', mobile: '' }])

  const setField = (field: keyof TeamState, value: string) => {
    setTeamState(prev => ({ ...prev, [field]: value }))
  }

  const loadDataProgress = async () => {
    const progressRes = await axios
      .get(`${API_URL}/event-coordinator/event/${actualId}/data-progress`)
      .catch(() => null)
    setDataProgress(progressRes?.data?.data || null)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [phaseRes, employeeRes, assignRes, eventRes, leadRes] = await Promise.all([
          axios.get(`${API_URL}/crm/leads/${actualId}/phase-info`).catch(() => null),
          axios.get(`${API_URL}/employees`).catch(() => null),
          getAssignTeam(String(actualId), 'event').catch(() => null),
          getEventDetailsByLeadId(String(actualId)).catch(() => null),
          axios.get(`${API_URL}/externalLeads/${actualId}`).catch(() => null),
        ])

        setPhaseStatus(phaseRes?.data?.data?.phase_status || '')
        setEmployees((employeeRes?.data?.data || []) as Employee[])

        const leadData = leadRes?.data?.data || leadRes?.data
        if (leadData?.invoice_data) {
          try {
            const parsed = typeof leadData.invoice_data === 'string' ? JSON.parse(leadData.invoice_data) : leadData.invoice_data;
            const invoiceObj = Array.isArray(parsed) ? parsed[0] : parsed;
            const itemsByCategory = invoiceObj?.itemsByCategory || {};
            let photos: string[] = [];
            let videos: string[] = [];
            let drones: string[] = [];
            let allServices: string[] = [];

            const excludedCats = ['add-ons', 'packages', 'deliverable', 'complementary'];

            for (const key of Object.keys(itemsByCategory)) {
              if (!excludedCats.includes(key.toLowerCase())) {
                itemsByCategory[key].forEach((item: any) => {
                  if (item.name) {
                    const name = item.name;
                    allServices.push(name);
                    const lower = name.toLowerCase();
                    if (lower.includes('photo')) photos.push(name);
                    else if (lower.includes('video')) videos.push(name);
                    else if (lower.includes('drone')) drones.push(name);
                  }
                });
              }
            }
            setPhotoLabels(photos);
            setVideoLabels(videos);
            setDroneLabels(drones);
            setInvoiceServices(allServices);
          } catch (e) {
            console.error('Failed to parse invoice data', e)
          }
        }

        const savedTeam = assignRes?.data?.data
        const eventData = eventRes?.data

        if (savedTeam || eventData) {
          setTeamState({
            photographer: savedTeam?.photographer || '',
            videographer: savedTeam?.videographer || '',
            drone: savedTeam?.drone || '',
            secondary_photographer: Array.isArray(savedTeam?.secondary_photographer)
              ? (savedTeam.secondary_photographer[0] || '')
              : '',
            secondary_videographer: Array.isArray(savedTeam?.secondary_videographer)
              ? (savedTeam.secondary_videographer[0] || '')
              : '',
            event_date: (savedTeam?.event_date || eventData?.preferred_date || '').toString().slice(0, 10),
            event_time: savedTeam?.event_time || eventData?.preferred_time || '',
            location: savedTeam?.location || eventData?.event_location || client.location || '',
          })

          if (savedTeam?.additional_staff) {
            const parsed = Array.isArray(savedTeam.additional_staff)
              ? savedTeam.additional_staff
              : JSON.parse(savedTeam.additional_staff)
            setAdditionalStaff(parsed)
          }

          if (eventData?.invitation_upload) {
            setInvitationFile(eventData.invitation_upload)
            setInvitationPreview(eventData.invitation_upload)
          }

          if (eventData?.event_service_details) {
            const parsed = typeof eventData.event_service_details === 'string'
              ? JSON.parse(eventData.event_service_details)
              : eventData.event_service_details
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServiceDetails(parsed)
            }
          }
        }

        await loadDataProgress()
      } catch (error) {
        console.error('Failed to load event-stage client data', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [API_URL, actualId, client.location])

  const hasRole = (emp: Employee, expectedRoles: string[]) => {
    const rolesStr = emp.roles ? (typeof emp.roles === 'string' ? emp.roles : JSON.stringify(emp.roles)) : ''
    const roleStr = emp.role || ''
    const normalizedRoles = `${rolesStr} ${roleStr}`.toLowerCase()
    return expectedRoles.some((expectedRole) => normalizedRoles.includes(expectedRole.toLowerCase()))
  }

  // const photographers = employees.filter((emp) => hasRole(emp, ['photographer']))
  // const videographers = employees.filter((emp) => hasRole(emp, ['videographer']))
  // const drones = employees.filter((emp) => hasRole(emp, ['drone']))
  const allShooters = employees.filter((emp) => hasRole(emp, ['photographer', 'videographer', 'drone']))

  const getEmployeeLabel = (employeeId: string) => {
    if (!employeeId) return 'Unassigned'

    const employee = employees.find((item) => String(item.employee_id) === String(employeeId))
    if (!employee) return employeeId

    const name = [employee.first_name, employee.last_name].filter(Boolean).join(' ').trim()
    return `${name || employee.employee_id} (${employee.employee_id})`
  }

  const removeAdditionalStaff = (value: string) => {
    setAdditionalStaff(prev => prev.filter(item => item !== value))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      await saveAssignTeam({
        external_lead_id: String(actualId),
        assignment_phase: 'event',
        photographer: teamState.photographer,
        videographer: teamState.videographer,
        drone: teamState.drone,
        secondary_photographer: teamState.secondary_photographer ? [teamState.secondary_photographer] : [],
        secondary_videographer: teamState.secondary_videographer ? [teamState.secondary_videographer] : [],
        secondary_drone: [],
        additional_staff: additionalStaff,
        event_date: teamState.event_date,
        event_time: teamState.event_time,
        location: teamState.location,
        event_photographer_label: photoLabels[0] || undefined,
        event_secondary_photographer_label: photoLabels[1] || undefined,
        event_videographer_label: videoLabels[0] || undefined,
        event_secondary_videographer_label: videoLabels[1] || undefined,
        event_drone_label: droneLabels[0] || undefined
      })

      let base64Invitation = typeof invitationFile === 'string' ? invitationFile : undefined;
      if (invitationFile instanceof File) {
        base64Invitation = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(invitationFile);
        });
      }

      await saveEventDetails({
        external_lead_id: String(actualId),
        client_name: client.name,
        email: client.email,
        phone: client.phone,
        contact_person_name: client.name,
        contact_person_number: client.phone,
        event_type: client.shootType,
        event_location: teamState.location,
        preferred_date: teamState.event_date,
        preferred_time: teamState.event_time,
        budget_range: '',
        services: [],
        deliverables: [],
        invoice_attached: false,
        meeting_type: 'event',
        meeting_details: 'Event coordinator setup',
        client_requirements: '',
        priority_level: 'medium',
        invitation_upload: base64Invitation,
        event_service_details: serviceDetails,
      })

      if (phaseStatus !== 'in_progress') {
        await axios.patch(`${API_URL}/crm/leads/${actualId}/phase-status`, {
          status: 'in_progress',
        }).catch(() => null)
      }

      await loadDataProgress()

      const assignmentSummary = [
        `Photographer: ${getEmployeeLabel(teamState.photographer)}`,
        `Videographer: ${getEmployeeLabel(teamState.videographer)}`,
        `Drone: ${getEmployeeLabel(teamState.drone)}`,
        teamState.secondary_photographer ? `Secondary Photographer: ${getEmployeeLabel(teamState.secondary_photographer)}` : '',
        teamState.secondary_videographer ? `Secondary Videographer: ${getEmployeeLabel(teamState.secondary_videographer)}` : '',
      ].filter(Boolean).join('\n')

      alert(`Event setup saved successfully.\n\n${assignmentSummary}`)
      onNext()
    } catch (error) {
      console.error('Failed to save event setup', error)
      alert('Failed to save event setup')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-[32px] bg-white p-10 text-center shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <p className="text-sm" style={{ color: '#6B7280' }}>Loading event setup...</p>
      </div>
    )
  }

  // const progressPercent = dataProgress?.required_count
  //   ? Math.round((dataProgress.uploaded_count / dataProgress.required_count) * 100)
  //   : 0
  // const statusLabel = dataProgress?.data_manager_approved
  //   ? 'Data Manager Approved'
  //   : dataProgress?.workflow_status === 'reupload_requested'
  //     ? 'Re-upload Requested'
  //     : dataProgress?.all_uploaded
  //       ? 'Waiting for Data Manager Approval'
  //       : 'Waiting for Field Uploads'
  // const statusColor = dataProgress?.data_manager_approved
  //   ? { bg: '#DCFCE7', text: '#047857', border: '#BBF7D0' }
  //   : dataProgress?.workflow_status === 'reupload_requested'
  //     ? { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' }
  //     : dataProgress?.all_uploaded
  //       ? { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }
  //       : { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={onBack}
              className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB' }}
              title="Go back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: '#7C3AED' }}>
                Event Coordinator
              </p>
              <h1 className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>Event Setup</h1>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Manage event assignments and schedule without using the CRM pre-production flow.
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: '#5B5FC7' }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Event Setup'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Client Summary">
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: '#F9FAFB' }}>
              <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Client</p>
              <p className="text-sm font-bold mt-1" style={{ color: '#111827' }}>{client.name}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#F9FAFB' }}>
                <CalendarDays size={16} style={{ color: '#5B5FC7' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Event Date</p>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>{client.eventDate || '—'}</p>
                </div>
              </div>
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#F9FAFB' }}>
                <Users size={16} style={{ color: '#5B5FC7' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Event Type</p>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>{client.shootType || '—'}</p>
                </div>
              </div>
            </div>

            {invoiceServices.length > 0 && (
              <div className="mt-2 rounded-2xl p-4" style={{ background: '#F9FAFB' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>Purchased Services (From Invoice)</p>
                <div className="flex flex-col gap-2">
                  {invoiceServices.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                      <span className="text-sm font-medium text-gray-800">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <div className="lg:col-span-2">
          <SectionCard title="Event Crew">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {photoLabels[0] && (
                <EmployeePicker
                  label={photoLabels[0]}
                  value={teamState.photographer}
                  placeholder="Select team member"
                  options={allShooters}
                  onChange={(value) => setField('photographer', value)}
                  icon={<Camera size={16} style={{ color: '#64748B' }} />}
                />
              )}
              {videoLabels[0] && (
                <EmployeePicker
                  label={videoLabels[0]}
                  value={teamState.videographer}
                  placeholder="Select team member"
                  options={allShooters}
                  onChange={(value) => setField('videographer', value)}
                  icon={<Video size={16} style={{ color: '#64748B' }} />}
                />
              )}
              {photoLabels[1] && (
                <EmployeePicker
                  label={photoLabels[1]}
                  value={teamState.secondary_photographer}
                  placeholder="Select team member"
                  options={allShooters}
                  onChange={(value) => setField('secondary_photographer', value)}
                  icon={<Camera size={16} style={{ color: '#64748B' }} />}
                />
              )}
              {videoLabels[1] && (
                <EmployeePicker
                  label={videoLabels[1]}
                  value={teamState.secondary_videographer}
                  placeholder="Select team member"
                  options={allShooters}
                  onChange={(value) => setField('secondary_videographer', value)}
                  icon={<Video size={16} style={{ color: '#64748B' }} />}
                />
              )}
              {droneLabels[0] && (
                <EmployeePicker
                  label={droneLabels[0]}
                  value={teamState.drone}
                  placeholder="Select team member"
                  options={allShooters}
                  onChange={(value) => setField('drone', value)}
                  icon={<Users size={16} style={{ color: '#64748B' }} />}
                />
              )}
              <AdditionalStaffPicker
                tags={additionalStaff}
                employees={employees}
                availableRoles={[
                  { key: 'photographer', label: 'Photographer' },
                  { key: 'videographer', label: 'Videographer' },
                  { key: 'drone', label: 'Drone Operator' },
                ]}
                onAdd={(value) => setAdditionalStaff(prev => [...prev, value])}
                onRemove={removeAdditionalStaff}
                icon={<Users size={16} style={{ color: '#64748B' }} />}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Additional Details">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
          {/* Invitation Upload */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] mb-4" style={{ color: '#5B5FC7' }}>
              Invitation Upload
            </p>
            <div className="rounded-2xl border p-5 flex flex-col items-center justify-center text-center gap-3" style={{ borderColor: '#E5E7EB', background: '#F9FAFB', minHeight: '160px' }}>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                <UploadCloud size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Upload Invitation</p>
                <p className="text-xs text-gray-500 mb-4">Select an image file</p>

                {invitationPreview && (
                  <div className="mb-4 flex justify-center w-full">
                    <img src={invitationPreview} alt="Invitation Preview" className="h-32 w-full object-contain rounded-lg shadow-sm border border-gray-200" />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  id="invitation-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setInvitationFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setInvitationPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor="invitation-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  {invitationFile instanceof File ? invitationFile.name : 'Choose File'}
                </label>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: '#5B5FC7' }}>
                Service Details
              </p>
              <button
                type="button"
                onClick={() => setServiceDetails([...serviceDetails, { type: '', name: '', mobile: '' }])}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                + Add More
              </button>
            </div>

            <div className="space-y-3">
              {serviceDetails.map((detail, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start">
                  <InputShell>
                    <input
                      type="text"
                      placeholder="Service Type"
                      value={detail.type}
                      onChange={(e) => {
                        const newDetails = [...serviceDetails]
                        newDetails[index].type = e.target.value
                        setServiceDetails(newDetails)
                      }}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </InputShell>
                  <InputShell>
                    <input
                      type="text"
                      placeholder="Name"
                      value={detail.name}
                      onChange={(e) => {
                        const newDetails = [...serviceDetails]
                        newDetails[index].name = e.target.value
                        setServiceDetails(newDetails)
                      }}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </InputShell>
                  <InputShell>
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={detail.mobile}
                      onChange={(e) => {
                        const newDetails = [...serviceDetails]
                        newDetails[index].mobile = e.target.value
                        setServiceDetails(newDetails)
                      }}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </InputShell>
                  {serviceDetails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newDetails = [...serviceDetails]
                        newDetails.splice(index, 1)
                        setServiceDetails(newDetails)
                      }}
                      className="h-[42px] px-3 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
