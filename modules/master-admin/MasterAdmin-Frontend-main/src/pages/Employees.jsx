import React, { useEffect, useMemo, useState } from 'react'
import { Check, Eye, FileText, Pencil, Search, Trash2, UserRound, X } from 'lucide-react'
import { api } from '../api'
import Badge from '../ui/Badge'
import Table from '../ui/Table'
import { flowLabel } from '../utils'

const emptyEmployee = {
  employeeId: '',
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  contactNumber: '',
  dob: '',
  address: '',
  workLocation: '',
  role: '',
  roles: [],
  experience: '',
  dateOfJoin: '',
  description: '',
  createdBy: '',
  status: 'Active',
  newPassword: '',
  confirmPassword: '',
}

const ROLE_GROUPS = [
  {
    title: 'Workflow Control',
    description: 'Owners and handoff controllers across the flow.',
    roles: ['CRM', 'Pre-production CRM', 'Post-production CRM', 'Event Coordinator', 'Data Manager', 'Operational Manager'],
  },
  {
    title: 'Event Execution',
    description: 'Field crew for event capture and runtime coverage.',
    roles: ['Photographer', 'Videographer', 'Drone'],
  },
  {
    title: 'Pre-production Deliverables',
    description: 'Phase 2 outputs before the pre-wedding event stage.',
    roles: ['Save the Date Post', 'Save the Date Video', 'Retouch Photo'],
  },
  {
    title: 'Post-production Specialists',
    description: 'Final production roles after event/raw-data approval.',
    roles: ['Traditional Video Editor', 'Retouch Editor', 'Album Designer', 'Magazine Designer', 'Frame Designer', 'Candid Video Editor'],
  },
]

const asInputDate = value => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const splitName = employee => {
  const name = String(employee.name || '').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  return {
    firstName: employee.firstName || parts[0] || '',
    lastName: employee.lastName || parts.slice(1).join(' ') || '',
  }
}

const normalizeEmployee = employee => {
  const names = splitName(employee)
  const roles = Array.isArray(employee.roles)
    ? employee.roles
    : String(employee.roles || employee.role || '').split(',').map(role => role.trim()).filter(Boolean)

  return {
    ...emptyEmployee,
    ...employee,
    ...names,
    roles,
    role: employee.role || roles.join(', '),
    status: employee.status || 'Active',
    dob: asInputDate(employee.dob),
    dateOfJoin: asInputDate(employee.dateOfJoin),
  }
}

const uploadUrl = file => {
  if (!file) return ''
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5011/api'
  return `${apiUrl.replace('/api', '')}/uploads/${file}`
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [filters, setFilters] = useState({ flowType: 'all', phase: 'all', search: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewEmployee, setViewEmployee] = useState(null)
  const [editEmployee, setEditEmployee] = useState(null)
  const [deleteEmployeeId, setDeleteEmployeeId] = useState('')
  const [saving, setSaving] = useState(false)
  const [openingEmployeeId, setOpeningEmployeeId] = useState('')

  const loadEmployees = () => {
    setLoading(true)
    setError('')
    api.employees(filters)
      .then(data => setEmployees(data.map(normalizeEmployee)))
      .catch(err => {
        console.error('Master admin employees failed', err)
        setError(err.response?.data?.message || 'Unable to load employees.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEmployees()
  }, [filters])

  const visible = useMemo(() => employees.filter(emp => {
    const haystack = [
      emp.employeeId,
      emp.name,
      emp.firstName,
      emp.lastName,
      emp.email,
      emp.contactNumber,
      emp.role,
      ...(emp.roles || []),
    ].join(' ').toLowerCase()
    return haystack.includes((filters.search || '').toLowerCase())
  }), [employees, filters.search])

  const setEditField = (key, value) => {
    setEditEmployee(current => ({ ...current, [key]: value }))
  }

  const openEmployee = async (employeeId, mode) => {
    setOpeningEmployeeId(employeeId)
    setError('')
    try {
      const employee = normalizeEmployee(await api.employee(employeeId))
      if (mode === 'view') setViewEmployee(employee)
      if (mode === 'edit') setEditEmployee(employee)
    } catch (err) {
      console.error(`Failed to open employee ${employeeId}`, err)
      setError(err.response?.data?.message || 'Unable to load the complete employee record.')
    } finally {
      setOpeningEmployeeId('')
    }
  }

  const saveEmployee = async () => {
    if (!editEmployee) return
    setError('')

    if (editEmployee.newPassword && editEmployee.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }
    if (editEmployee.newPassword !== editEmployee.confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    setSaving(true)

    const roles = Array.isArray(editEmployee.roles)
      ? editEmployee.roles
      : String(editEmployee.roles || '').split(',').map(role => role.trim()).filter(Boolean)

    try {
      const updated = await api.updateEmployee(editEmployee.employeeId, {
        first_name: editEmployee.firstName,
        last_name: editEmployee.lastName,
        email: editEmployee.email,
        contact_number: editEmployee.contactNumber,
        dob: editEmployee.dob || null,
        address: editEmployee.address,
        work_location: editEmployee.workLocation,
        role: editEmployee.role || roles.join(', '),
        roles,
        experience: editEmployee.experience,
        date_of_join: editEmployee.dateOfJoin || null,
        description: editEmployee.description,
        created_by: editEmployee.createdBy,
        status: editEmployee.status,
        password: editEmployee.newPassword || undefined,
      })
      const normalized = normalizeEmployee(updated)
      setEmployees(current => current.map(emp => emp.employeeId === normalized.employeeId ? normalized : emp))
      setEditEmployee(null)
    } catch (err) {
      console.error('Failed to update employee', err)
      setError(err.response?.data?.message || 'Failed to update employee.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteEmployeeId) return
    setSaving(true)
    setError('')
    try {
      await api.deleteEmployee(deleteEmployeeId)
      setEmployees(current => current.filter(emp => emp.employeeId !== deleteEmployeeId))
      setDeleteEmployeeId('')
    } catch (err) {
      console.error('Failed to delete employee', err)
      setError(err.response?.data?.message || 'Failed to delete employee.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Employee Directory</h1>
          <p>View, edit, and delete employees from the pre and post production staff database.</p>
        </div>
      </div>

      {error ? <div className="error employee-error">{error}</div> : null}

      <div className="filters">
        <div className="search-box">
          <Search size={14} />
          <input value={filters.search || ''} onChange={event => setFilters(current => ({ ...current, search: event.target.value }))} placeholder="Search employees..." />
        </div>
        <select value={filters.flowType || 'all'} onChange={event => setFilters(current => ({ ...current, flowType: event.target.value }))}>
          <option value="all">All flows</option>
          <option value="pre_wedding">Pre-wedding</option>
          <option value="post_wedding">Post-wedding</option>
        </select>
        <select value={filters.phase || 'all'} onChange={event => setFilters(current => ({ ...current, phase: event.target.value }))}>
          <option value="all">All phases</option>
          <option value="pre_production">Pre-production</option>
          <option value="event">Event</option>
          <option value="post_production">Post-production</option>
        </select>
      </div>

      <Table headers={['Employee ID', 'Name', 'Role', 'Contact', 'Current Tasks', 'Flow Involvement', 'Attendance', 'Action']} empty={loading ? 'Loading employees...' : 'No employees found.'}>
        {!loading && visible.length ? visible.map(emp => (
          <tr key={emp.employeeId}>
            <td className="accent">{emp.employeeId}</td>
            <td>
              <div className="employee-name-cell">
                <EmployeeAvatar employee={emp} />
                <strong>{emp.name || `${emp.firstName} ${emp.lastName}`.trim() || '-'}</strong>
              </div>
            </td>
            <td className="truncate">{emp.role || '-'}</td>
            <td>{emp.contactNumber || '-'}<small>{emp.email || '-'}</small></td>
            <td>{emp.currentTasks || 0}</td>
            <td>{String(emp.flowInvolvement || '').split(', ').filter(Boolean).map(flowLabel).join(', ') || '-'}</td>
            <td><Badge value={emp.attendanceToday || emp.status || 'Absent'} /></td>
            <td>
              <div className="row-actions">
                <button type="button" title="View employee" disabled={openingEmployeeId === emp.employeeId} onClick={() => openEmployee(emp.employeeId, 'view')}><Eye size={16} /></button>
                <button type="button" title="Edit employee" disabled={openingEmployeeId === emp.employeeId} onClick={() => openEmployee(emp.employeeId, 'edit')}><Pencil size={16} /></button>
                <button type="button" title="Delete employee" onClick={() => setDeleteEmployeeId(emp.employeeId)}><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        )) : null}
      </Table>

      {viewEmployee ? (
        <EmployeeViewModal employee={viewEmployee} onClose={() => setViewEmployee(null)} />
      ) : null}

      {editEmployee ? (
        <EmployeeEditModal
          employee={editEmployee}
          saving={saving}
          error={error}
          onChange={setEditField}
          onClose={() => setEditEmployee(null)}
          onSave={saveEmployee}
        />
      ) : null}

      {deleteEmployeeId ? (
        <div className="modal-backdrop">
          <div className="modal-card delete-modal">
            <div className="modal-icon danger"><Trash2 size={24} /></div>
            <h2>Delete Employee?</h2>
            <p>This removes employee {deleteEmployeeId} from the staff database.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setDeleteEmployeeId('')} disabled={saving}>Cancel</button>
              <button type="button" className="danger-btn" onClick={confirmDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function EmployeeViewModal({ employee, onClose }) {
  return (
    <div className="employee-dialog-backdrop">
      <div className="employee-dialog">
        <div className="employee-dialog-head">
          <div>
            <h2>Employee Details</h2>
            <p>Complete staff profile and professional information.</p>
          </div>
          <button type="button" className="employee-dialog-close" onClick={onClose} title="Close"><X size={20} /></button>
        </div>

        <div className="employee-dialog-body">
          <div className="employee-profile-banner">
            <div className="employee-profile-avatar">
              <EmployeeAvatar employee={employee} />
            </div>
            <div>
              <strong>{employee.name || `${employee.firstName} ${employee.lastName}`.trim() || '-'}</strong>
              <small>{employee.employeeId} · {employee.status || 'Active'}</small>
            </div>
          </div>

          <EmployeeSection title="Basic Information">
            <div className="employee-view-grid">
              <ViewField label="Employee ID" value={employee.employeeId} />
              <ViewField label="First Name" value={employee.firstName} />
              <ViewField label="Last Name" value={employee.lastName} />
              <ViewField label="Contact Number" value={employee.contactNumber} />
              <ViewField label="Email" value={employee.email} />
              <ViewField label="Date of Birth" value={asInputDate(employee.dob)} />
              <ViewField label="Work Location" value={employee.workLocation} />
              <ViewField label="Address" value={employee.address} wide />
            </div>
          </EmployeeSection>

          <EmployeeSection title="Documents">
            <div className="employee-document-grid">
              <DocumentBox
                icon={<UserRound size={17} />}
                label="Profile Image"
                value={employee.profileImage ? 'Image available' : 'No image uploaded'}
                href={employee.profileImage ? uploadUrl(employee.profileImage) : ''}
              />
              <DocumentBox
                icon={<FileText size={17} />}
                label="Identity Document"
                value={employee.identityDocument ? 'Document available' : 'No document uploaded'}
                href={employee.identityDocument ? uploadUrl(employee.identityDocument) : ''}
              />
            </div>
          </EmployeeSection>

          <EmployeeSection title="Professional Details">
            <RoleGroups selectedRoles={employee.roles || []} readOnly />
            <div className="employee-view-grid employee-professional-grid">
              <ViewField label="Experience" value={employee.experience} />
              <ViewField label="Date of Join" value={asInputDate(employee.dateOfJoin)} />
              <ViewField label="Created By" value={employee.createdBy} />
              <ViewField label="Status" value={employee.status} />
              <ViewField label="Current Tasks" value={employee.currentTasks || 0} />
              <ViewField label="Flow Involvement" value={String(employee.flowInvolvement || '').split(', ').filter(Boolean).map(flowLabel).join(', ')} />
              <ViewField label="Last Activity" value={employee.lastActivity} wide />
              <ViewField label="Description" value={employee.description} wide />
            </div>
          </EmployeeSection>
        </div>

        <div className="employee-dialog-footer">
          <button type="button" className="employee-secondary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function EmployeeEditModal({ employee, saving, error, onChange, onClose, onSave }) {
  const toggleRole = role => {
    const roles = employee.roles || []
    const nextRoles = roles.includes(role) ? roles.filter(item => item !== role) : [...roles, role]
    onChange('roles', nextRoles)
    onChange('role', nextRoles.join(', '))
  }

  return (
    <div className="employee-dialog-backdrop">
      <div className="employee-dialog">
        <div className="employee-dialog-head">
          <div>
            <h2>Edit Employee</h2>
            <p>Update the employee's personal and professional details.</p>
          </div>
          <button type="button" className="employee-dialog-close" onClick={onClose} title="Close"><X size={20} /></button>
        </div>

        <div className="employee-dialog-body">
          {error ? <div className="employee-modal-error">{error}</div> : null}
          <EmployeeSection title="Basic Information">
            <div className="employee-form-grid">
              <Field label="Employee ID *" value={employee.employeeId} readOnly />
              <Field label="First Name *" value={employee.firstName} onChange={value => onChange('firstName', value)} />
              <Field label="Last Name" value={employee.lastName} onChange={value => onChange('lastName', value)} />
              <Field label="Contact Number" value={employee.contactNumber} onChange={value => onChange('contactNumber', value)} />
              <Field label="Email *" type="email" value={employee.email} onChange={value => onChange('email', value)} />
              <Field label="Date of Birth" type="date" value={employee.dob} onChange={value => onChange('dob', value)} />
              <Field label="Work Location" value={employee.workLocation} onChange={value => onChange('workLocation', value)} />
              <Field label="Address" value={employee.address} onChange={value => onChange('address', value)} wide />
            </div>
          </EmployeeSection>

          <EmployeeSection title="Documents">
            <div className="employee-document-grid">
              <DocumentBox
                icon={<UserRound size={17} />}
                label="Profile Image"
                value={employee.profileImage ? 'Current image available' : 'No image uploaded'}
                href={employee.profileImage ? uploadUrl(employee.profileImage) : ''}
              />
              <DocumentBox
                icon={<FileText size={17} />}
                label="Identity Document"
                value={employee.identityDocument ? 'Current document available' : 'No document uploaded'}
                href={employee.identityDocument ? uploadUrl(employee.identityDocument) : ''}
              />
            </div>
          </EmployeeSection>

          <EmployeeSection title="Professional Details">
            <div className="employee-role-label">Roles *</div>
            <RoleGroups selectedRoles={employee.roles || []} onToggle={toggleRole} />
            <div className="employee-form-grid employee-professional-grid">
              <Field label="Experience" value={employee.experience} onChange={value => onChange('experience', value)} />
              <Field label="Date of Join" type="date" value={employee.dateOfJoin} onChange={value => onChange('dateOfJoin', value)} />
              <Field label="Created By" value={employee.createdBy} onChange={value => onChange('createdBy', value)} />
              <label className="employee-field">
                <span>Status</span>
                <select value={employee.status || 'Active'} onChange={event => onChange('status', event.target.value)}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <Field label="New Password" type="password" value={employee.newPassword} onChange={value => onChange('newPassword', value)} />
              <Field label="Confirm Password" type="password" value={employee.confirmPassword} onChange={value => onChange('confirmPassword', value)} />
              <p className="employee-password-note employee-field-wide">Leave both password fields blank to keep the current password.</p>
              <label className="employee-field employee-field-wide">
                <span>Description</span>
                <textarea value={employee.description || ''} onChange={event => onChange('description', event.target.value)} rows={3} placeholder="Short description about the employee..." />
              </label>
            </div>
          </EmployeeSection>
        </div>

        <div className="employee-dialog-footer">
          <button type="button" className="employee-secondary-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="employee-primary-btn" onClick={onSave} disabled={saving || !employee.firstName || !(employee.roles || []).length}>
            <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmployeeSection({ title, children }) {
  return (
    <section className="employee-dialog-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function ViewField({ label, value, wide = false }) {
  return (
    <div className={`employee-view-field${wide ? ' employee-field-wide' : ''}`}>
      <span>{label}</span>
      <strong>{value === 0 ? 0 : value || '-'}</strong>
    </div>
  )
}

function DocumentBox({ icon, label, value, href }) {
  const content = (
    <>
      {icon}
      <span>
        <strong>{label}</strong>
        <small>{value}</small>
      </span>
    </>
  )
  return href ? <a className="employee-document-box" href={href} target="_blank" rel="noreferrer">{content}</a> : <div className="employee-document-box disabled">{content}</div>
}

function EmployeeAvatar({ employee }) {
  const [failed, setFailed] = useState(false)
  const initials = String(employee.name || employee.employeeId || '?')
    .split(/\s+/)
    .filter(Boolean)
    .map(item => item[0])
    .join('')
    .slice(0, 2)

  if (!employee.profileImage || failed) return <span>{initials}</span>

  return (
    <img
      src={uploadUrl(employee.profileImage)}
      alt=""
      onError={() => setFailed(true)}
    />
  )
}

function RoleGroups({ selectedRoles, onToggle, readOnly = false }) {
  return (
    <div className="employee-role-groups">
      {ROLE_GROUPS.map(group => (
        <div className="employee-role-group" key={group.title}>
          <div className="employee-role-group-head">
            <div>
              <strong>{group.title}</strong>
              <small>{group.description}</small>
            </div>
            <span>{group.roles.filter(role => selectedRoles.includes(role)).length}/{group.roles.length}</span>
          </div>
          <div className="employee-role-options">
            {group.roles.map(role => {
              const selected = selectedRoles.includes(role)
              return (
                <button
                  key={role}
                  type="button"
                  className={selected ? 'selected' : ''}
                  disabled={readOnly}
                  onClick={() => onToggle?.(role)}
                >
                  {role}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', readOnly = false, wide = false }) {
  return (
    <label className={`employee-field${wide ? ' employee-field-wide' : ''}`}>
      <span>{label}</span>
      <input type={type} value={value || ''} readOnly={readOnly} onChange={event => onChange?.(event.target.value)} />
    </label>
  )
}
