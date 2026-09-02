const { pool } = require('./db')
const bcrypt = require('bcryptjs')

const normalizeFlow = flow => (['pre_wedding', 'post_wedding'].includes(String(flow || '')) ? String(flow) : 'all')
const normalizePhase = phase => (['pre_production', 'event', 'post_production'].includes(String(phase || '')) ? String(phase) : 'all')
const numberValue = value => Number(value || 0)
const DAY_MS = 24 * 60 * 60 * 1000

const roleMap = {
  Photographer: 'photographer',
  Videographer: 'videographer',
  'Save the Date Post': 'employee-1',
  'Save the Date Video': 'employee-2',
  'Retouch Photo': 'employee-4',
  'Data Manager': 'data-manager',
  CRM: 'crm',
  'Pre-production CRM': 'pre-production-crm',
  'Post-production CRM': 'post-production-crm',
  'Event CRM': 'post-production-crm',
  'Event Coordinator': 'event-coordinator',
  Drone: 'drone',
  'Operational Manager': 'operational-manager',
  'Traditional Video Editor': 'traditional-video-editor',
  'Retouch Editor': 'retouch-editor',
  'Album Designer': 'album-designer',
  'Magazine Designer': 'magazine-designer',
  'Candid Video Editor': 'candid-video-editor',
  'Frame Designer': 'frame-designer',
}

const assignmentValues = `
  VALUES
    (at.photographer, 'Photographer'),
    (at.videographer, 'Videographer'),
    (at.drone, 'Drone'),
    (at.save_the_date, 'Save the Date'),
    (at.save_the_video, 'Save the Video'),
    (at.retouch, 'Retouch'),
    (at.editor, 'Editor'),
    (at.assistant, 'Assistant')
`

const normalizeRoleForUser = role => {
  const label = String(role || '').trim()
  return roleMap[label] || label.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-')
}

const parseRoles = (roles, fallbackRole) => {
  let parsed = roles
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch (_error) {
      parsed = parsed.split(',').map(item => item.trim()).filter(Boolean)
    }
  }
  if (!Array.isArray(parsed) || parsed.length === 0) parsed = [fallbackRole].filter(Boolean)
  return [...new Set(parsed.map(role => String(role || '').trim()).filter(Boolean))]
}

const normalizeRolesForUser = (roles, fallbackRole) => {
  const rawRoles = parseRoles(roles, fallbackRole)
  return [...new Set(rawRoles.map(normalizeRoleForUser).filter(Boolean))]
}

const asDate = value => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const isSameDay = (left, right) => {
  const a = asDate(left)
  const b = asDate(right)
  return Boolean(a && b && a.toDateString() === b.toDateString())
}

const isSameMonth = (left, right) => {
  const a = asDate(left)
  const b = asDate(right)
  return Boolean(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth())
}

const daysBetween = (from, to = new Date()) => {
  const date = asDate(from)
  if (!date) return 0
  return Math.max(0, Math.round((to.getTime() - date.getTime()) / DAY_MS))
}

const average = values => {
  const valid = values.map(Number).filter(value => Number.isFinite(value))
  return valid.length ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length) : 0
}

const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0)

const countBy = (items, keyGetter) => items.reduce((acc, item) => {
  const key = keyGetter(item) || 'Unspecified'
  acc[key] = (acc[key] || 0) + 1
  return acc
}, {})

const uniqueCsv = value => {
  const items = String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  return [...new Set(items)].join(', ')
}

const sumBy = (items, keyGetter, valueGetter) => items.reduce((acc, item) => {
  const key = keyGetter(item) || 'Unspecified'
  acc[key] = (acc[key] || 0) + numberValue(valueGetter(item))
  return acc
}, {})

const toList = object => Object.entries(object)
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)

const isClientActive = client => !['completed', 'cancelled'].includes(String(client.status || '').toLowerCase())
const isClientCompleted = client => String(client.status || '').toLowerCase() === 'completed'

const isWorkCompleted = item => String(item.status || '').toLowerCase().includes('complete')
const isWorkPending = item => !isWorkCompleted(item)
const isWorkOverdue = item => {
  const deadline = asDate(item.deadline)
  return Boolean(deadline && deadline < new Date() && isWorkPending(item))
}

const phaseOrderByFlow = flowType => {
  if (flowType === 'post_wedding') return ['event', 'post_production']
  return ['pre_production', 'event', 'post_production']
}

const phaseRank = (flowType, phase) => {
  const index = phaseOrderByFlow(flowType).indexOf(phase)
  return index === -1 ? 99 : index
}

const normalizeTaskPhase = value => {
  const text = String(value || '').toLowerCase().replace(/\s+/g, '_')
  if (text.includes('album') || text.includes('edit') || text.includes('retouch') || text.includes('save_the') || text.includes('save-the')) return 'post_production'
  if (text.includes('event') || text.includes('shoot') || text.includes('photographer') || text.includes('videographer') || text.includes('drone') || text.includes('data_manager') || text.includes('crm_verified')) return 'event'
  if (text.includes('creative') || text.includes('planning') || text.includes('assignment') || text.includes('confirmation')) return 'pre_production'
  return 'pre_production'
}

const normalizeWorkStatus = value => {
  const text = String(value || '').toLowerCase()
  if (['approved', 'completed', 'complete', 'done', 'ended'].some(status => text.includes(status))) return 'Completed'
  if (['progress', 'started', 'running'].some(status => text.includes(status))) return 'In Progress'
  if (['rework', 'blocked', 'hold'].some(status => text.includes(status))) return 'Blocked'
  return value || 'Pending'
}

const buildStageRows = (client, rows = [], rawUploadedIds = null) => {
  const currentRank = phaseRank(client.flowType, client.currentPhase)
  const completedClient = isClientCompleted(client) || String(client.phaseStatus || '').toLowerCase().includes('complete')
  const phases = phaseOrderByFlow(client.flowType)

  return phases.map((phase, index) => {
    const phaseRows = rows.filter(row => row.phase === phase)
    const explicitCompleted = phaseRows.some(row => String(row.status || '').toLowerCase().includes('complete'))
    let status = completedClient || explicitCompleted || index < currentRank
      ? 'Completed'
      : index === currentRank
        ? 'In Progress'
        : 'Pending'

    if (phase === 'event') {
      if (rawUploadedIds && rawUploadedIds.has(String(client.serialNumber))) {
        status = 'Completed';
      } else if (client.eventDate) {
        const evDate = new Date(client.eventDate);
        evDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (today > evDate) {
          status = 'Completed';
        }
      }
    }

    return {
      id: `${client.id}-${phase}-stage`,
      clientId: client.id,
      serialNumber: client.serialNumber,
      client: client.name,
      flowType: client.flowType,
      currentPhase: client.currentPhase,
      phase,
      task: phase,
      employee: [...new Set(phaseRows.map(row => row.employee).filter(Boolean))].join(', ') || client.phaseOwner || '-',
      role: 'Workflow Stage',
      priority: index === currentRank ? 'Active' : '-',
      status,
      startDate: phaseRows[0]?.startDate || client.createdAt,
      deadline: phase === 'event' ? client.eventDate : null,
      stageOrder: index,
      source: 'workflow_stage',
      isStageRow: true,
    }
  })
}

const detectWorkflowStage = client => {
  const status = String(client.status || '').toLowerCase()
  const phase = String(client.currentPhase || '').toLowerCase()
  const step = String(client.preProductionStep || '').toLowerCase()

  if (status === 'completed' || phase.includes('delivery') || phase.includes('delivered')) return 'Delivery'
  if (step.includes('print')) return 'Printing'
  if (step.includes('album')) return 'Album'
  if (step.includes('edit') || step.includes('retouch') || phase === 'post_production') return 'Editing'
  if (step.includes('selection') || step.includes('select')) return 'Selection'
  if (phase === 'event') return 'Shoot'
  if (client.invoicePaid > 0 || client.invoiceTotal > 0 || ['pre_wedding', 'post_wedding'].includes(client.flowType)) return 'Booking'
  return 'Enquiry'
}

const buildAlerts = ({ clients, workTracker }) => {
  const now = new Date()
  const alertRows = []

  clients.forEach(client => {
    const eventDate = asDate(client.eventDate)
    const ageDays = daysBetween(client.createdAt, now)
    const status = String(client.status || '').toLowerCase()
    const phaseStatus = String(client.phaseStatus || '').toLowerCase()
    const step = String(client.preProductionStep || '').toLowerCase()

    if (eventDate && eventDate < now && isClientActive(client) && !String(client.currentPhase || '').toLowerCase().includes('delivery')) {
      alertRows.push({
        title: 'Delivery crossing deadline',
        clientId: client.id,
        client: client.name,
        severity: ageDays > 30 ? 'red' : 'yellow',
        detail: `${client.serialNumber} event date was ${eventDate.toISOString()}`,
      })
    }

    if (ageDays > 7 && isClientActive(client)) {
      alertRows.push({
        title: 'Client inactive for more than 7 days',
        clientId: client.id,
        client: client.name,
        severity: ageDays > 14 ? 'red' : 'yellow',
        detail: `${ageDays} days since lead creation`,
      })
    }

    if (client.invoiceBalance > 0 && client.invoicePaid <= 0) {
      alertRows.push({
        title: 'Payment not collected',
        clientId: client.id,
        client: client.name,
        severity: 'red',
        detail: `Pending balance ${client.invoiceBalance}`,
      })
    }

    if (phaseStatus.includes('approval') || phaseStatus.includes('pending approval')) {
      alertRows.push({
        title: 'Approval pending too long',
        clientId: client.id,
        client: client.name,
        severity: ageDays > 5 ? 'red' : 'yellow',
        detail: client.phaseStatus,
      })
    }

    if (step.includes('selection') && !isClientCompleted(client)) {
      alertRows.push({
        title: 'Photo selection pending too long',
        clientId: client.id,
        client: client.name,
        severity: ageDays > 10 ? 'red' : 'yellow',
        detail: client.preProductionStep,
      })
    }

    if (status === 'completed' || !isClientActive(client)) {
      alertRows.push({
        title: 'Normal',
        clientId: client.id,
        client: client.name,
        severity: 'green',
        detail: 'No immediate owner action required',
      })
    }
  })

  workTracker.filter(isWorkOverdue).forEach(item => {
    alertRows.push({
      title: 'Team task overdue',
      clientId: item.clientId,
      client: item.client,
      severity: 'red',
      detail: `${item.task} assigned to ${item.employee}`,
    })
  })

  const severityRank = { red: 0, yellow: 1, green: 2 }
  return alertRows
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
    .slice(0, 12)
}

const buildOwnerDashboard = ({ clients, employees, workTracker, attendanceSummary, expenses }) => {
  const now = new Date()
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const currentMonthClients = clients.filter(client => isSameMonth(client.createdAt, now))
  const previousMonthClients = clients.filter(client => isSameMonth(client.createdAt, previousMonth))
  const completedClients = clients.filter(isClientCompleted)
  const activeClients = clients.filter(isClientActive)
  const workPending = workTracker.filter(isWorkPending)
  const overdueWork = workTracker.filter(isWorkOverdue)
  const todayShoots = clients.filter(client => isSameDay(client.eventDate, now))
  const delayedProjects = clients.filter(client => {
    const eventDate = asDate(client.eventDate)
    return eventDate && eventDate < now && isClientActive(client)
  })
  const pendingPayments = clients.filter(client => client.invoiceBalance > 0)
  const thisMonthIncome = clients
    .filter(client => isSameMonth(client.createdAt, now) || isSameMonth(client.eventDate, now))
    .reduce((sum, client) => sum + client.invoicePaid, 0)
  const invoiceTotal = clients.reduce((sum, client) => sum + client.invoiceTotal, 0)
  const invoicePaid = clients.reduce((sum, client) => sum + client.invoicePaid, 0)
  const invoiceBalance = clients.reduce((sum, client) => sum + client.invoiceBalance, 0)
  const stageCounts = countBy(clients, detectWorkflowStage)
  const stageOrder = ['Enquiry', 'Booking', 'Shoot', 'Selection', 'Editing', 'Album', 'Printing', 'Delivery']
  const pipeline = stageOrder.map(stage => {
    const stageClients = clients.filter(client => detectWorkflowStage(client) === stage)
    return {
      stage,
      totalClients: stageCounts[stage] || 0,
      averageCompletionDays: average(stageClients.map(client => daysBetween(client.createdAt, now))),
      bottleneck: stageClients.length >= Math.max(3, Math.ceil(clients.length * 0.25)),
    }
  })
  const packageRevenue = sumBy(clients, client => client.eventType, client => client.invoiceTotal)
  const packageCounts = countBy(clients, client => client.eventType)
  const topPackage = toList(packageCounts)[0] || { name: '-', value: 0 }
  const profitablePackage = toList(packageRevenue)[0] || { name: '-', value: 0 }
  const advanceRows = clients
    .filter(client => client.invoicePaid > 0)
    .map(client => ({
      date: client.createdAt || client.eventDate,
      salesPerson: client.phaseOwner || 'Unassigned',
      clientId: client.id,
      client: client.name,
      amount: client.invoicePaid,
    }))
    .sort((a, b) => (asDate(b.date)?.getTime() || 0) - (asDate(a.date)?.getTime() || 0))
    .slice(0, 10)
  const editorWork = employees
    .filter(employee => String(employee.role || employee.lastActivity || '').toLowerCase().includes('edit'))
    .map(employee => ({
      employeeId: employee.employeeId,
      name: employee.name,
      pendingCount: numberValue(employee.currentTasks),
      workload: numberValue(employee.currentTasks),
    }))
  const designerWorkload = employees
    .filter(employee => String(employee.role || employee.lastActivity || '').toLowerCase().includes('design'))
    .map(employee => ({
      employeeId: employee.employeeId,
      name: employee.name,
      workload: numberValue(employee.currentTasks),
    }))
  const productivity = workTracker.length ? percent(workTracker.length - workPending.length, workTracker.length) : percent(attendanceSummary.present, attendanceSummary.total)
  const recentClientActivity = [
    ...clients.slice(0, 6).map(client => ({
      type: 'New enquiry',
      clientId: client.id,
      client: client.name,
      date: client.createdAt,
      detail: client.serialNumber,
    })),
    ...clients.filter(client => client.invoicePaid > 0).slice(0, 4).map(client => ({
      type: 'Payment received',
      clientId: client.id,
      client: client.name,
      date: client.createdAt,
      detail: client.invoicePaid,
    })),
    ...clients.filter(client => isClientCompleted(client)).slice(0, 4).map(client => ({
      type: 'Selection completed',
      clientId: client.id,
      client: client.name,
      date: client.eventDate,
      detail: client.eventType,
    })),
  ].sort((a, b) => (asDate(b.date)?.getTime() || 0) - (asDate(a.date)?.getTime() || 0)).slice(0, 10)
  const deliveryCompletedClients = completedClients.slice(0, 8).map(client => ({
    clientId: client.id,
    client: client.name,
    eventType: client.eventType,
    completedOn: client.eventDate || client.createdAt,
    googleReviewReady: true,
  }))
  const alerts = buildAlerts({ clients, workTracker })

  return {
    companyHealth: {
      totalActiveClients: activeClients.length,
      teamActiveCount: employees.filter(employee => String(employee.attendanceToday || '').toLowerCase() === 'present').length || attendanceSummary.present,
      todayShoots: todayShoots.length,
      pendingDeliveries: activeClients.filter(client => detectWorkflowStage(client) !== 'Delivery').length,
      delayedProjects: delayedProjects.length,
      pendingPayments: pendingPayments.length,
      thisMonthIncome,
      thisMonthExpenses: expenses,
      advancePaymentsReceived: advanceRows,
    },
    todayFocus: {
      todayFollowUps: clients.filter(client => ['contacted', 'pending'].includes(String(client.status || '').toLowerCase())).slice(0, 8),
      todayDueDeliveries: delayedProjects.slice(0, 8),
      clientApprovalPending: clients.filter(client => String(client.phaseStatus || '').toLowerCase().includes('approval')).slice(0, 8),
      teamPendingTasks: workPending.slice(0, 8),
      delayedProjects: delayedProjects.slice(0, 8),
      emergencyAlerts: alerts.filter(alert => alert.severity === 'red').slice(0, 6),
    },
    workflowPipeline: {
      stages: pipeline,
      bottlenecks: pipeline.filter(stage => stage.bottleneck).map(stage => stage.stage),
    },
    smartAlertCenter: alerts,
    teamPerformance: {
      editorWisePendingCount: editorWork,
      designerWorkload,
      crmFollowUpStatus: {
        pending: clients.filter(client => ['contacted', 'pending'].includes(String(client.status || '').toLowerCase())).length,
        completed: completedClients.length,
      },
      productivityPercentage: productivity,
      lateTaskReport: overdueWork.slice(0, 10),
    },
    clientActivityPanel: recentClientActivity,
    financialSnapshot: {
      monthlyRevenue: thisMonthIncome,
      monthlyExpenses: expenses,
      pendingBalances: invoiceBalance,
      advanceReceived: clients.reduce((sum, client) => sum + client.invoicePaid, 0),
      averageProjectValue: clients.length ? Math.round(invoiceTotal / clients.length) : 0,
      topSellingPackage: topPackage.name,
    },
    clientExperience: {
      feedbackCount: 0,
      averageRating: 0,
      googleReviewTriggerReady: deliveryCompletedClients.length,
      deliveryCompletedClients,
    },
    automationControlCenter: [
      { name: 'Auto reminders for photo selection', status: clients.some(client => String(client.preProductionStep || '').toLowerCase().includes('selection')) ? 'Attention' : 'Normal' },
      { name: 'Delay alert automation', status: delayedProjects.length ? 'Critical' : 'Normal' },
      { name: 'Invoice mail automation', status: pendingPayments.length ? 'Attention' : 'Normal' },
      { name: 'Approval reminders', status: clients.some(client => String(client.phaseStatus || '').toLowerCase().includes('approval')) ? 'Attention' : 'Normal' },
      { name: 'Follow-up reminders', status: clients.some(client => ['contacted', 'pending'].includes(String(client.status || '').toLowerCase())) ? 'Attention' : 'Normal' },
      { name: 'One-click report generation for Operations Manager', status: 'Normal' },
      { name: 'Export daily and monthly reports', status: 'Normal' },
      { name: 'Quick client search', status: 'Normal' },
    ],
    businessGrowthMetrics: {
      monthlyGrowthPercentage: previousMonthClients.length ? percent(currentMonthClients.length - previousMonthClients.length, previousMonthClients.length) : percent(currentMonthClients.length, Math.max(clients.length, 1)),
      leadToBookingConversionRatio: percent(clients.filter(client => client.invoiceTotal > 0 || ['pre_wedding', 'post_wedding'].includes(client.flowType)).length, clients.length),
      repeatClientCount: clients.filter(client => String(client.status || '').toLowerCase().includes('repeat')).length,
      referralClientCount: clients.filter(client => String(client.status || '').toLowerCase().includes('referral')).length,
      mostProfitablePackage: profitablePackage.name,
      averageDeliveryTime: average(completedClients.map(client => daysBetween(client.createdAt, client.eventDate || now))),
    },
  }
}

const buildClientWhere = (filters = {}, startIndex = 1) => {
  const where = []
  const values = []
  let index = startIndex

  const flowType = normalizeFlow(filters.flowType)
  if (flowType !== 'all') {
    where.push(`COALESCE(e.flow_type, '') = $${index++}`)
    values.push(flowType)
  }

  const phase = normalizePhase(filters.phase)
  if (phase !== 'all') {
    where.push(`COALESCE(e.current_phase, 'not_started') = $${index++}`)
    values.push(phase)
  }

  if (filters.status && filters.status !== 'all') {
    where.push(`LOWER(COALESCE(e.status, '')) = LOWER($${index++})`)
    values.push(filters.status)
  }

  if (filters.search) {
    where.push(`(
      e.external_id::text ILIKE $${index}
      OR COALESCE(e.lead_serial_number, '') ILIKE $${index}
      OR COALESCE(e.lead_name, '') ILIKE $${index}
      OR COALESCE(e.email, '') ILIKE $${index}
      OR COALESCE(e.phone, '') ILIKE $${index}
    )`)
    values.push(`%${filters.search}%`)
  }

  return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', values }
}

const clientSelect = `
  SELECT
    e.external_id::text AS "id",
    e.lead_serial_number AS "serialNumber",
    e.lead_name AS "name",
    e.email,
    e.phone,
    e.location,
    e.event_type AS "eventType",
    COALESCE(ed.preferred_date, e.event_date) AS "eventDate",
    COALESCE(e.flow_type, '') AS "flowType",
    COALESCE(e.current_phase, 'not_started') AS "currentPhase",
    COALESCE(e.phase_status, 'not_started') AS "phaseStatus",
    COALESCE(e.phase_owner, '') AS "phaseOwner",
    COALESCE(e.pre_production_step, '') AS "preProductionStep",
    e.invoice_id AS "invoiceId",
    e.invoice_data AS "invoiceData",
    COALESCE(e.invoice_total, 0) AS "invoiceTotal",
    COALESCE(e.invoice_paid, 0) AS "invoicePaid",
    COALESCE(e.invoice_balance, 0) AS "invoiceBalance",
    e.status,
    e.created_at AS "createdAt",
    CASE WHEN at.external_lead_id IS NULL THEN 'Unassigned' ELSE 'Assigned' END AS "assignmentStatus",
    COALESCE(
      NULLIF(CONCAT_WS(
        ', ',
        CASE WHEN at.photographer IS NOT NULL THEN COALESCE(NULLIF(TRIM(CONCAT_WS(' ', p.first_name, p.last_name)), ''), at.photographer) END,
        CASE WHEN at.videographer IS NOT NULL THEN COALESCE(NULLIF(TRIM(CONCAT_WS(' ', v.first_name, v.last_name)), ''), at.videographer) END,
        CASE WHEN at.drone IS NOT NULL THEN COALESCE(NULLIF(TRIM(CONCAT_WS(' ', d.first_name, d.last_name)), ''), at.drone) END,
        CASE WHEN at.save_the_date IS NOT NULL THEN COALESCE(NULLIF(TRIM(CONCAT_WS(' ', std.first_name, std.last_name)), ''), at.save_the_date) END,
        CASE WHEN at.save_the_video IS NOT NULL THEN COALESCE(NULLIF(TRIM(CONCAT_WS(' ', stv.first_name, stv.last_name)), ''), at.save_the_video) END,
        CASE WHEN at.retouch IS NOT NULL THEN COALESCE(NULLIF(TRIM(CONCAT_WS(' ', rt.first_name, rt.last_name)), ''), at.retouch) END
      ), ''),
      'Unassigned'
    ) AS "assignedTeamSummary"
  FROM external_leads e
  LEFT JOIN event_details ed
    ON ed.external_lead_id = e.external_id::text
    OR ed.external_lead_id = e.lead_serial_number
  LEFT JOIN assign_teams at
    ON at.external_lead_id = e.external_id::text
    OR at.external_lead_id = e.lead_serial_number
  LEFT JOIN employees p ON p.employee_id = at.photographer
  LEFT JOIN employees v ON v.employee_id = at.videographer
  LEFT JOIN employees d ON d.employee_id = at.drone
  LEFT JOIN employees std ON std.employee_id = at.save_the_date
  LEFT JOIN employees stv ON stv.employee_id = at.save_the_video
  LEFT JOIN employees rt ON rt.employee_id = at.retouch
`

const mapClient = row => ({
  id: String(row.id || ''),
  serialNumber: row.serialNumber || String(row.id || ''),
  name: row.name || 'Unknown Client',
  email: row.email || '-',
  phone: row.phone || '-',
  location: row.location || '-',
  eventType: row.eventType || '-',
  eventDate: row.eventDate || null,
  flowType: row.flowType || 'Not selected',
  currentPhase: row.currentPhase || 'not_started',
  phaseStatus: row.phaseStatus || 'not_started',
  phaseOwner: row.phaseOwner || '-',
  preProductionStep: row.preProductionStep || '-',
  assignmentStatus: row.assignmentStatus || 'Unassigned',
  assignedTeamSummary: uniqueCsv(row.assignedTeamSummary) || 'Unassigned',
  invoiceId: row.invoiceId || '-',
  invoiceData: row.invoiceData || null,
  invoiceTotal: numberValue(row.invoiceTotal),
  invoicePaid: numberValue(row.invoicePaid),
  invoiceBalance: numberValue(row.invoiceBalance),
  status: row.status || 'new',
  createdAt: row.createdAt || null,
})

const getClients = async (filters = {}) => {
  const where = buildClientWhere(filters)
  const result = await pool.query(`${clientSelect} ${where.clause} ORDER BY e.created_at DESC`, where.values)
  return result.rows.map(mapClient)
}

const getClient = async clientId => {
  const result = await pool.query(
    `${clientSelect}
     WHERE e.external_id::text = $1 OR e.lead_serial_number = $1
     ORDER BY e.created_at DESC
     LIMIT 1`,
    [clientId]
  )
  return result.rows[0] ? mapClient(result.rows[0]) : null
}

const summarizeClients = items => ({
  clients: items.length,
  activeClients: items.filter(c => !['completed', 'cancelled'].includes(c.status.toLowerCase())).length,
  completedClients: items.filter(c => c.status.toLowerCase() === 'completed').length,
  invoiceTotal: items.reduce((sum, c) => sum + c.invoiceTotal, 0),
  invoicePaid: items.reduce((sum, c) => sum + c.invoicePaid, 0),
  invoiceBalance: items.reduce((sum, c) => sum + c.invoiceBalance, 0),
})

const getDashboard = async () => {
  const clients = await getClients()
  const preWedding = clients.filter(c => c.flowType === 'pre_wedding')
  const postWedding = clients.filter(c => c.flowType === 'post_wedding')

  const [employeeResult, attendanceResult, workResult, workTracker, employees, expenseResult] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS count FROM employees`).catch(() => ({ rows: [{ count: 0 }] })),
    pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Present') AS present,
        COUNT(*) FILTER (WHERE status = 'Absent') AS absent
      FROM employees_attendance
      WHERE date = CURRENT_DATE
    `).catch(() => ({ rows: [{ total: 0, present: 0, absent: 0 }] })),
    pool.query(`SELECT COUNT(*) AS count FROM lead_employee`).catch(() => ({ rows: [{ count: 0 }] })),
    getWorkTracker({}).catch(() => []),
    getEmployees({}).catch(() => []),
    pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM expenses
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    `).catch(() => ({ rows: [{ total: 0 }] })),
  ])

  const attendanceSummary = {
    total: numberValue(attendanceResult.rows[0].total),
    present: numberValue(attendanceResult.rows[0].present),
    absent: numberValue(attendanceResult.rows[0].absent),
  }

  return {
    combined: {
      totalClients: clients.length,
      activeClients: clients.filter(isClientActive).length,
      completedClients: clients.filter(c => isClientCompleted(c) || ['event', 'post_production'].includes(c.currentPhase)).length,
      pendingFollowUps: clients.filter(c => ['contacted', 'pending'].includes(String(c.status || '').toLowerCase())).length,
      assignedEmployees: numberValue(employeeResult.rows[0].count),
      openWorkItems: numberValue(workResult.rows[0].count),
      invoiceTotal: clients.reduce((sum, c) => sum + c.invoiceTotal, 0),
      invoicePaid: clients.reduce((sum, c) => sum + c.invoicePaid, 0),
      invoiceBalance: clients.reduce((sum, c) => sum + c.invoiceBalance, 0),
    },
    breakdown: {
      preWedding: summarizeClients(preWedding),
      postWedding: summarizeClients(postWedding),
    },
    recentClients: clients.slice(0, 8),
    attendanceSummary,
    ownerDashboard: buildOwnerDashboard({
      clients,
      employees,
      workTracker,
      attendanceSummary,
      expenses: numberValue(expenseResult.rows[0].total),
    }),
  }
}

const getEmployees = async (filters = {}) => {
  const where = buildEmployeeDirectoryWhere(filters)
  const result = await pool.query(
    `SELECT
      e.employee_id AS "employeeId",
      e.first_name AS "firstName",
      e.last_name AS "lastName",
      COALESCE(NULLIF(TRIM(CONCAT_WS(' ', e.first_name, e.last_name)), ''), e.employee_id) AS "name",
      e.email,
      e.contact_number AS "contactNumber",
      e.dob,
      e.address,
      e.work_location AS "workLocation",
      e.role,
      COALESCE(e.roles, '{}'::text[]) AS roles,
      e.experience,
      e.date_of_join AS "dateOfJoin",
      e.description,
      e.created_by AS "createdBy",
      e.profile_image AS "profileImage",
      e.identity_document AS "identityDocument",
      COALESCE(e.status, 'Active') AS status,
      e.created_at AS "createdAt",
      e.employee_code AS "employeeCode",
      COUNT(a.task_name) AS "currentTasks",
      STRING_AGG(DISTINCT COALESCE(a.flow_type, 'unknown'), ', ') FILTER (WHERE a.task_name IS NOT NULL) AS "flowInvolvement",
      ea.status AS "attendanceToday",
      STRING_AGG(DISTINCT a.task_name, ', ') FILTER (WHERE a.task_name IS NOT NULL) AS "lastActivity"
    FROM employees e
    LEFT JOIN LATERAL (
      SELECT assignment.task_name, COALESCE(el.flow_type, 'unknown') AS flow_type, COALESCE(el.current_phase, 'not_started') AS current_phase
      FROM assign_teams at
      JOIN external_leads el
        ON at.external_lead_id = el.external_id::text
        OR at.external_lead_id = el.lead_serial_number
      CROSS JOIN LATERAL (${assignmentValues}) AS assignment(employee_id, task_name)
      WHERE assignment.employee_id = e.employee_id
    ) a ON true
    LEFT JOIN employees_attendance ea
      ON ea.employee_id = CAST(REPLACE(COALESCE(e.employee_id, '0'), 'EMP-', '') AS INTEGER)
      AND ea.date = CURRENT_DATE
    ${where.clause}
    GROUP BY e.employee_id, e.first_name, e.last_name, e.email, e.contact_number, e.dob, e.address,
      e.work_location, e.role, e.roles, e.experience, e.date_of_join, e.description, e.created_by,
      e.profile_image, e.identity_document, e.status, e.created_at, e.employee_code, ea.status
    ORDER BY "name" ASC`,
    where.values
  )
  return result.rows
}

const buildEmployeeDirectoryWhere = (filters = {}) => {
  const where = []
  const values = []
  let index = 1

  const flowType = normalizeFlow(filters.flowType)
  if (flowType !== 'all') {
    where.push(`EXISTS (
      SELECT 1
      FROM assign_teams at
      JOIN external_leads el
        ON at.external_lead_id = el.external_id::text
        OR at.external_lead_id = el.lead_serial_number
      CROSS JOIN LATERAL (${assignmentValues}) AS assignment(employee_id, task_name)
      WHERE assignment.employee_id = e.employee_id
        AND COALESCE(el.flow_type, '') = $${index++}
    )`)
    values.push(flowType)
  }

  const phase = normalizePhase(filters.phase)
  if (phase !== 'all') {
    where.push(`EXISTS (
      SELECT 1
      FROM assign_teams at
      JOIN external_leads el
        ON at.external_lead_id = el.external_id::text
        OR at.external_lead_id = el.lead_serial_number
      CROSS JOIN LATERAL (${assignmentValues}) AS assignment(employee_id, task_name)
      WHERE assignment.employee_id = e.employee_id
        AND COALESCE(el.current_phase, 'not_started') = $${index++}
    )`)
    values.push(phase)
  }

  if (filters.search) {
    where.push(`(
      COALESCE(e.employee_id, '') ILIKE $${index}
      OR COALESCE(e.first_name, '') ILIKE $${index}
      OR COALESCE(e.last_name, '') ILIKE $${index}
      OR COALESCE(e.email, '') ILIKE $${index}
      OR COALESCE(e.contact_number, '') ILIKE $${index}
      OR COALESCE(e.role, '') ILIKE $${index}
      OR COALESCE(array_to_string(e.roles, ', '), '') ILIKE $${index}
    )`)
    values.push(`%${filters.search}%`)
  }

  return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', values }
}

const getEmployee = async employeeId => {
  const employees = await getEmployees({ search: employeeId })
  return employees.find(employee => employee.employeeId === employeeId) || null
}

const updateEmployee = async (employeeId, data = {}) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const existing = await client.query('SELECT email FROM employees WHERE employee_id = $1 LIMIT 1', [employeeId])
    if (!existing.rows.length) {
      await client.query('ROLLBACK')
      return null
    }

    const roles = parseRoles(data.roles, data.role)
    const userRoles = normalizeRolesForUser(roles, data.role)
    const firstName = data.first_name ?? data.firstName ?? ''
    const lastName = data.last_name ?? data.lastName ?? ''
    const email = data.email ?? ''
    const contactNumber = data.contact_number ?? data.contactNumber ?? ''
    const role = data.role || roles.join(', ')
    const name = [firstName, lastName].filter(Boolean).join(' ').trim()
    const password = String(data.password || '')

    if (password && password.length < 6) {
      throw new Error('New password must be at least 6 characters long')
    }

    await client.query(
      `UPDATE employees
       SET
        first_name = $1,
        last_name = $2,
        email = $3,
        contact_number = $4,
        dob = $5::date,
        address = $6,
        work_location = $7,
        role = $8,
        roles = $9::text[],
        experience = $10,
        date_of_join = $11::date,
        description = $12,
        created_by = $13,
        status = $14
       WHERE employee_id = $15`,
      [
        firstName,
        lastName,
        email,
        contactNumber,
        data.dob || null,
        data.address || '',
        data.work_location ?? data.workLocation ?? '',
        role,
        roles,
        data.experience || '',
        data.date_of_join ?? data.dateOfJoin ?? null,
        data.description || '',
        data.created_by ?? data.createdBy ?? '',
        data.status || 'Active',
        employeeId,
      ]
    )

    if (email && userRoles.length > 0) {
      const passwordHash = password ? await bcrypt.hash(password, 10) : null
      await client.query(
        `UPDATE users
         SET
          name = $1,
          email = $2,
          role = $3,
          roles = $4,
          password_hash = COALESCE($5, password_hash)
         WHERE LOWER(email) = LOWER($6) OR LOWER(email) = LOWER($2)`,
        [name, email.toLowerCase().trim(), userRoles[0], userRoles, passwordHash, existing.rows[0].email || email]
      )
    }

    await client.query('COMMIT')
    return getEmployee(employeeId)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

const deleteEmployee = async employeeId => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const existing = await client.query('SELECT email FROM employees WHERE employee_id = $1 LIMIT 1', [employeeId])
    if (existing.rows.length > 0 && existing.rows[0].email) {
      await client.query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [existing.rows[0].email])
    }

    const result = await client.query('DELETE FROM employees WHERE employee_id = $1 RETURNING employee_id', [employeeId])
    
    await client.query('COMMIT')
    return result.rowCount > 0
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

const getClientEmployees = async clientId => {
  const result = await pool.query(
    `WITH matched AS (
      SELECT at.*
      FROM assign_teams at
      LEFT JOIN external_leads e
        ON at.external_lead_id = e.external_id::text
        OR at.external_lead_id = e.lead_serial_number
      WHERE at.external_lead_id = $1
        OR e.external_id::text = $1
        OR e.lead_serial_number = $1
      LIMIT 1
    )
    SELECT
      assignment.group_name AS "group",
      assignment.task_name AS "task",
      COALESCE(emp.employee_id, assignment.employee_id) AS "employeeId",
      COALESCE(NULLIF(TRIM(CONCAT_WS(' ', emp.first_name, emp.last_name)), ''), assignment.employee_id) AS "name",
      COALESCE(emp.role, assignment.task_name) AS "role"
    FROM matched m
    CROSS JOIN LATERAL (
      VALUES
        ('Shoot team', 'Photographer', m.photographer),
        ('Shoot team', 'Videographer', m.videographer),
        ('Shoot team', 'Drone', m.drone),
        ('Editing team', 'Save the Date', m.save_the_date),
        ('Editing team', 'Save the Video', m.save_the_video),
        ('Editing team', 'Retouch', m.retouch),
        ('Editing team', 'Editor', m.editor),
        ('Shoot team', 'Assistant', m.assistant)
    ) AS assignment(group_name, task_name, employee_id)
    LEFT JOIN employees emp ON emp.employee_id = assignment.employee_id
    WHERE assignment.employee_id IS NOT NULL AND assignment.employee_id <> ''
    ORDER BY assignment.group_name, assignment.task_name`,
    [clientId]
  ).catch(() => ({ rows: [] }))
  return result.rows
}

const getWorkTracker = async (filters = {}, clientId) => {
  const where = buildClientWhere(filters)
  const clientClause = clientId
    ? `${where.clause ? `${where.clause} AND` : 'WHERE'} (e.external_id::text = $${where.values.length + 1} OR e.lead_serial_number = $${where.values.length + 1})`
    : where.clause
  const values = clientId ? [...where.values, clientId] : where.values

  const result = await pool.query(
    `SELECT
      le.lead_employee_id AS "id",
      e.external_id::text AS "clientId",
      e.lead_serial_number AS "serialNumber",
      e.lead_name AS "client",
      COALESCE(e.flow_type, '') AS "flowType",
      COALESCE(e.current_phase, 'not_started') AS "currentPhase",
      le.task_name AS "task",
      COALESCE(NULLIF(TRIM(CONCAT_WS(' ', emp.first_name, emp.last_name)), ''), le.employee_id) AS "employee",
      emp.role,
      le.priority AS "priority",
      COALESCE(le.status, le.priority, 'Pending') AS "status",
      le.created_at AS "startDate",
      le.deadline AS "deadline"
    FROM external_leads e
    LEFT JOIN event_details ed
      ON ed.external_lead_id = e.external_id::text
      OR ed.external_lead_id = e.lead_serial_number
    JOIN lead_employee le
      ON le.lead_id::text = e.external_id::text
      OR le.lead_id::text = e.lead_serial_number
    LEFT JOIN employees emp ON emp.employee_id = le.employee_id
    ${clientClause}
    ORDER BY le.created_at DESC`,
    values
  ).catch(() => ({ rows: [] }))

  const clients = clientId ? [await getClient(clientId)].filter(Boolean) : await getClients(filters)
  if (!clients.length) return result.rows

  const clientIds = clients.flatMap(client => [
    client.id,
    client.serialNumber,
    `CRM-${client.serialNumber}`,
    `CRM-${client.id}`,
  ]).filter(Boolean)

  const [stageResult, assignedProjectResult] = await Promise.all([
    pool.query(
      `SELECT
        lts.external_lead_id AS "leadId",
        lts.stage_name AS "task",
        lts.created_at AS "startDate"
      FROM lead_tracking_stages lts
      WHERE lts.external_lead_id = ANY($1::text[])
      ORDER BY lts.created_at ASC`,
      [clientIds]
    ).catch(() => ({ rows: [] })),
    pool.query(
      `SELECT
        ap.id,
        ap.project_id AS "projectId",
        ap.project_name AS "projectName",
        ap.project_type AS "task",
        ap.employee_id AS "employeeId",
        COALESCE(NULLIF(TRIM(CONCAT_WS(' ', emp.first_name, emp.last_name)), ''), ap.employee_id) AS "employee",
        emp.role,
        ap.status,
        ap.created_at AS "startDate",
        ap.updated_at AS "updatedAt"
      FROM assigned_projects ap
      LEFT JOIN employees emp ON emp.employee_id = ap.employee_id
      WHERE ap.project_id = ANY($1::text[])
      ORDER BY ap.created_at ASC`,
      [clientIds]
    ).catch(() => ({ rows: [] })),
  ])

  const normalizedRows = result.rows.map(row => {
    let displayRole = 'Event Team';
    if (row.task) {
      const tn = String(row.task).toLowerCase();
      if (tn.includes('secondary-photo') || tn.includes('candid photo')) displayRole = 'Candid Photography';
      else if (tn.includes('secondary-video') || tn.includes('candid video')) displayRole = 'Candid Videography';
      else if (tn.includes('photo')) displayRole = 'Traditional Photography';
      else if (tn.includes('video')) displayRole = 'Traditional Videography';
      else if (tn.includes('drone')) displayRole = 'Drone Operator';
      else displayRole = String(row.task).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Only format if it's an event team task or has a specific task name, but safely apply it
    const formattedEmployee = row.employee && row.task ? `${row.employee} (${displayRole})` : row.employee;

    return {
      ...row,
      employee: formattedEmployee,
      phase: normalizeTaskPhase(`${row.currentPhase} ${row.task}`),
      status: normalizeWorkStatus(row.status),
      source: 'lead_employee',
    }
  })

  for (const row of stageResult.rows) {
    const client = clients.find(item => [item.id, item.serialNumber, `CRM-${item.id}`, `CRM-${item.serialNumber}`].includes(row.leadId))
    if (!client) continue
    normalizedRows.push({
      id: `${client.id}-stage-${row.task}-${row.startDate}`,
      clientId: client.id,
      serialNumber: client.serialNumber,
      client: client.name,
      flowType: client.flowType,
      currentPhase: client.currentPhase,
      phase: normalizeTaskPhase(row.task),
      task: row.task,
      employee: client.phaseOwner || '-',
      role: 'Stage Tracking',
      priority: '-',
      status: 'Completed',
      startDate: row.startDate,
      deadline: null,
      source: 'lead_tracking_stages',
    })
  }

  for (const row of assignedProjectResult.rows) {
    const client = clients.find(item => [item.id, item.serialNumber, `CRM-${item.id}`, `CRM-${item.serialNumber}`].includes(row.projectId))
    if (!client) continue
    normalizedRows.push({
      id: `assigned-project-${row.id}`,
      clientId: client.id,
      serialNumber: client.serialNumber,
      client: client.name,
      flowType: client.flowType,
      currentPhase: client.currentPhase,
      phase: normalizeTaskPhase(row.task),
      task: row.task,
      employee: row.employee,
      role: row.role,
      priority: '-',
      status: normalizeWorkStatus(row.status),
      startDate: row.startDate,
      deadline: row.updatedAt,
      source: 'assigned_projects',
    })
  }

  const rawUploadedRes = await pool.query(`
    SELECT at.external_lead_id
    FROM assign_teams at
    JOIN event_media_clips emc ON at.external_lead_id = emc.external_lead_id
    WHERE (emc.photo_first_clip IS NOT NULL)
       OR (emc.video_first_clip IS NOT NULL)
       OR (emc.drone_first_clip IS NOT NULL)
       OR (emc.secondary_photo_first_clip IS NOT NULL)
       OR (emc.secondary_video_first_clip IS NOT NULL)
  `);
  const rawUploadedIds = new Set(rawUploadedRes.rows.map(r => String(r.external_lead_id)));

  const withStageRows = clients.flatMap(client => {
    const clientRows = normalizedRows.filter(row => row.clientId === client.id)
    return [...buildStageRows(client, clientRows, rawUploadedIds), ...clientRows]
  })

  return withStageRows.sort((a, b) => {
    const flowSort = String(a.flowType || '').localeCompare(String(b.flowType || ''))
    if (!clientId && flowSort !== 0) return flowSort
    const phaseSort = phaseRank(a.flowType, a.phase) - phaseRank(b.flowType, b.phase)
    if (phaseSort !== 0) return phaseSort
    if (a.isStageRow && !b.isStageRow) return -1
    if (!a.isStageRow && b.isStageRow) return 1
    return (asDate(a.startDate)?.getTime() || 0) - (asDate(b.startDate)?.getTime() || 0)
  })
}

const getInvoices = async (filters = {}, clientId) => {
  const clients = clientId ? [await getClient(clientId)].filter(Boolean) : await getClients(filters)
  return clients.map(client => ({
    invoiceId: client.invoiceId,
    clientId: client.id,
    serialNumber: client.serialNumber,
    client: client.name,
    flowType: client.flowType,
    eventType: client.eventType,
    total: client.invoiceTotal,
    paid: client.invoicePaid,
    balance: client.invoiceBalance,
    invoiceData: client.invoiceData,
    status: client.invoiceBalance <= 0 && client.invoiceTotal > 0 ? 'Paid' : client.invoicePaid > 0 ? 'Partial' : 'Pending',
    dueDate: client.eventDate,
  }))
}

const getAttendance = async (filters = {}, clientId) => {
  const employees = clientId ? await getClientEmployees(clientId) : await getEmployees(filters)
  const ids = employees.map(employee => String(employee.employeeId || '').replace('EMP-', '')).filter(Boolean)
  const numericIds = ids.map(Number).filter(id => !Number.isNaN(id))
  if (!numericIds.length) return []

  const result = await pool.query(
    `SELECT
      ea.attendance_id AS "id",
      COALESCE(e.employee_id, 'EMP-' || ea.employee_id::text) AS "employeeId",
      COALESCE(NULLIF(TRIM(CONCAT_WS(' ', e.first_name, e.last_name)), ''), 'Employee ' || ea.employee_id::text) AS "employee",
      e.role,
      ea.date,
      ea.check_in AS "checkIn",
      ea.check_out AS "checkOut",
      ea.status
    FROM employees_attendance ea
    LEFT JOIN employees e ON ea.employee_id = CAST(REPLACE(e.employee_id, 'EMP-', '') AS INTEGER)
    WHERE ea.employee_id = ANY($1::int[])
    ORDER BY ea.date DESC, "employee" ASC`,
    [numericIds]
  ).catch(() => ({ rows: [] }))
  return result.rows
}

const getReports = async (filters = {}) => {
  const [dashboard, workTracker, employees, clients] = await Promise.all([
    getDashboard(),
    getWorkTracker(filters),
    getEmployees(filters),
    getClients(filters),
  ])
  const completedClients = clients.filter(isClientCompleted)
  const activeClients = clients.filter(isClientActive)
  const delayedClients = clients.filter(client => {
    const eventDate = asDate(client.eventDate)
    return eventDate && eventDate < new Date() && isClientActive(client)
  })
  return {
    conversion: {
      totalLeads: clients.length,
      bookings: clients.filter(client => client.invoiceTotal > 0 || ['pre_wedding', 'post_wedding'].includes(client.flowType)).length,
      completed: completedClients.length,
      leadToBookingRatio: dashboard.ownerDashboard.businessGrowthMetrics.leadToBookingConversionRatio,
      preWedding: dashboard.breakdown.preWedding,
      postWedding: dashboard.breakdown.postWedding,
    },
    assignmentLoad: employees,
    workCompletion: {
      total: workTracker.length,
      completed: workTracker.filter(item => String(item.status).toLowerCase().includes('complete')).length,
      pending: workTracker.filter(item => !String(item.status).toLowerCase().includes('complete')).length,
      late: workTracker.filter(isWorkOverdue).length,
    },
    invoiceCollection: dashboard.combined,
    attendance: dashboard.attendanceSummary,
    clientDeliveryStatus: {
      active: activeClients.length,
      completed: completedClients.length,
      pendingDeliveries: dashboard.ownerDashboard.companyHealth.pendingDeliveries,
      delayed: delayedClients.length,
      averageDeliveryTime: dashboard.ownerDashboard.businessGrowthMetrics.averageDeliveryTime,
    },
  }
}

const getClientReport = async clientId => {
  const [client, employees, workTracker, invoices, attendance] = await Promise.all([
    getClient(clientId),
    getClientEmployees(clientId),
    getWorkTracker({}, clientId),
    getInvoices({}, clientId),
    getAttendance({}, clientId),
  ])

  const completedItems = workTracker.filter(item => String(item.status).toLowerCase().includes('complete'))
  const pendingItems = workTracker.filter(item => !String(item.status).toLowerCase().includes('complete'))
  const overdueItems = workTracker.filter(isWorkOverdue)
  const blockedItems = workTracker.filter(item => ['pending', 'blocked', 'rework'].some(status => String(item.status).toLowerCase().includes(status)))

  const phaseBreakdown = ['pre_production', 'event', 'post_production'].map(phase => {
    const phaseItems = workTracker.filter(item => item.phase === phase)
    const phaseCompleted = phaseItems.filter(item => String(item.status).toLowerCase().includes('complete'))
    return {
      phase,
      total: phaseItems.length,
      completed: phaseCompleted.length,
      pending: phaseItems.length - phaseCompleted.length,
      completionPercent: phaseItems.length > 0 ? Math.round((phaseCompleted.length / phaseItems.length) * 100) : 0,
    }
  })

  const priorityDistribution = ['High', 'Medium', 'Low', '-'].map(pri => ({
    priority: pri,
    count: pendingItems.filter(item => (item.priority || '-') === pri).length,
  }))

  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter(a => String(a.status || '').toLowerCase() === 'present').length / attendance.length) * 100)
    : 0

  const attendanceByEmployee = employees.map(emp => {
    const empAttendance = attendance.filter(a => a.employeeId === emp.employeeId)
    return {
      employeeId: emp.employeeId,
      name: emp.name,
      role: emp.role,
      total: empAttendance.length,
      present: empAttendance.filter(a => String(a.status || '').toLowerCase() === 'present').length,
      absent: empAttendance.filter(a => String(a.status || '').toLowerCase() === 'absent').length,
    }
  })

  const milestones = workTracker.filter(item => item.isStageRow).map(item => ({
    id: item.id,
    phase: item.phase,
    status: item.status,
    employee: item.employee,
    startDate: item.startDate,
    deadline: item.deadline,
    isStageRow: true,
  }))

  const activityLog = [...workTracker.filter(item => !item.isStageRow)].sort(
    (a, b) => (new Date(b.startDate || 0).getTime()) - (new Date(a.startDate || 0).getTime())
  )

  const onTimeDelivery = workTracker.filter(item => {
    if (!item.deadline || String(item.status).toLowerCase().includes('complete')) return false
    return new Date(item.deadline) >= new Date()
  }).length

  return {
    client,
    assignmentSummary: employees,
    workProgress: {
      total: workTracker.length,
      completed: completedItems.length,
      pending: pendingItems.length,
      overdue: overdueItems.length,
      completionPercent: workTracker.length > 0 ? Math.round((completedItems.length / workTracker.length) * 100) : 0,
      onTimeDelivery,
      onTimePercent: workTracker.length > 0 ? Math.round((onTimeDelivery / workTracker.length) * 100) : 0,
    },
    phaseBreakdown,
    priorityDistribution,
    invoiceSummary: invoices[0] || null,
    attendanceSummary: attendance,
    attendanceRate,
    attendanceByEmployee,
    milestones,
    activityLog,
    blockers: blockedItems,
    overdue: overdueItems,
  }
}

const getClientInvoiceDetail = async clientId => {
  const result = await pool.query(
    `SELECT
      e.external_id::text AS id,
      e.lead_serial_number,
      e.lead_name,
      e.email,
      e.phone,
      e.location,
      e.event_type,
      e.event_date,
      e.invoice_id,
      e.invoice_total,
      e.invoice_paid,
      e.invoice_balance,
      e.discount,
      e.invoice_data,
      e.created_at
    FROM external_leads e
    WHERE e.external_id::text = $1 OR e.lead_serial_number = $1
    ORDER BY e.created_at DESC
    LIMIT 1`,
    [clientId]
  )
  if (!result.rows.length) return null

  const lead = result.rows[0]
  let extInvoice = {}
  try {
    extInvoice = typeof lead.invoice_data === 'string'
      ? JSON.parse(lead.invoice_data)
      : (lead.invoice_data || {})
  } catch (_e) {
    extInvoice = {}
  }

  const computedTotal = (Number(extInvoice.paid) || 0) + (Number(extInvoice.balance) || 0) + (Number(extInvoice.discount) || 0)

  return {
    id: String(lead.id || ''),
    invoiceId: lead.id || lead.external_id || clientId,
    name: lead.lead_name || 'Unknown Client',
    contact: lead.phone || '-',
    billingDate: Object.keys(extInvoice).length > 0
      ? (extInvoice.billingDate || extInvoice.date || lead.created_at)
      : (lead.created_at || new Date().toISOString()),
    eventName: extInvoice.eventName ?? '',
    billNo: lead.lead_serial_number || extInvoice.billNo || '',
    location: extInvoice.location ?? '',
    totalAmount: Number(extInvoice.totalAmount ?? extInvoice.total ?? lead.invoice_total ?? computedTotal),
    paid: Number(extInvoice.paid ?? lead.invoice_paid ?? 0),
    discount: Number(extInvoice.discount ?? lead.discount ?? 0),
    itemsByCategory: extInvoice.itemsByCategory || {},
    qtyOverrides: extInvoice.qtyOverrides || {},
    engagementDetails: extInvoice.engagement || extInvoice.engagementDetails || '',
    weddingDetails: extInvoice.wedding || extInvoice.weddingDetails || '',
    receptionDetails: extInvoice.reception || extInvoice.receptionDetails || '',
    ritualsDetails: extInvoice.rituals || extInvoice.ritualsDetails || '',
  }
}

const getNotifications = async () => {
  const query = `
    SELECT 
      id AS "notificationId", 
      type AS "issueType", 
      title, 
      detail AS message, 
      created_at AS "createdAt", 
      is_read AS "isRead"
    FROM notifications
    WHERE target_roles && ARRAY['admin', 'master-admin', 'masteradmin']::text[]
       OR title ILIKE '%completed%'
       OR type ILIKE '%completed%'
    ORDER BY created_at DESC
    LIMIT 50;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const markNotificationRead = async (id) => {
  await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
  return { success: true };
};

const markAllNotificationsRead = async () => {
  // We'll mark all notifications that might show up for admin as read
  await pool.query(`
    UPDATE notifications 
    SET is_read = true 
    WHERE target_roles && ARRAY['admin', 'master-admin', 'masteradmin']::text[]
       OR title ILIKE '%completed%'
       OR type ILIKE '%completed%'
  `);
  return { success: true };
};

const clearNotifications = async () => {
  await pool.query(`
    DELETE FROM notifications 
    WHERE is_read = true AND (
       target_roles && ARRAY['admin', 'master-admin', 'masteradmin']::text[]
       OR title ILIKE '%completed%'
       OR type ILIKE '%completed%'
    )
  `);
  return { success: true };
};

module.exports = {
  getDashboard,
  getClients,
  getClient,
  getClientEmployees,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getWorkTracker,
  getInvoices,
  getAttendance,
  getReports,
  getClientReport,
  getClientInvoiceDetail,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
}
