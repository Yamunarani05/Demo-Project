import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';

const router = Router();

// Helper functions
const normalizeFlow = (flow?: string) =>
  ['pre_wedding', 'post_wedding'].includes(String(flow || '')) ? String(flow) : 'all';
const normalizePhase = (phase?: string) =>
  ['pre_production', 'event', 'post_production'].includes(String(phase || '')) ? String(phase) : 'all';

// Mock/extended employees matching the Master Admin multi-role taxonomy
const masterEmployees = [
  {
    id: 'emp_1',
    employeeId: 'EMP-001',
    name: 'Karthik Rajan',
    firstName: 'Karthik',
    lastName: 'Rajan',
    email: 'karthik@dreamframes.in',
    contactNumber: '+91 98402 33445',
    role: 'Photographer',
    roles: ['Photographer'],
    experience: '8 years',
    dateOfJoin: '2022-03-15',
    dob: '1992-06-20',
    address: 'Indiranagar, Bangalore',
    workLocation: 'Bangalore / Ooty',
    status: 'Active',
    description: 'Lead candid wedding photographer & team mentor.',
    pendingCount: 2,
    workload: 4,
    productivity: 94,
  },
  {
    id: 'emp_2',
    employeeId: 'EMP-002',
    name: 'Vijay Anand',
    firstName: 'Vijay',
    lastName: 'Anand',
    email: 'vijay@dreamframes.in',
    contactNumber: '+91 98405 66778',
    role: 'Videographer, Drone',
    roles: ['Videographer', 'Drone'],
    experience: '6 years',
    dateOfJoin: '2023-01-10',
    dob: '1994-11-12',
    address: 'Koramangala, Bangalore',
    workLocation: 'Bangalore / Field',
    status: 'Active',
    description: 'Cinematic visualizer & licensed 4K aerial drone pilot.',
    pendingCount: 3,
    workload: 5,
    productivity: 91,
  },
  {
    id: 'emp_3',
    employeeId: 'EMP-003',
    name: 'Ramesh Krishnan',
    firstName: 'Ramesh',
    lastName: 'Krishnan',
    email: 'ramesh@dreamframes.in',
    contactNumber: '+91 98408 99887',
    role: 'Retouch Editor, Album Designer',
    roles: ['Retouch Editor', 'Album Designer'],
    experience: '5 years',
    dateOfJoin: '2023-05-20',
    dob: '1995-04-18',
    address: 'HSR Layout, Bangalore',
    workLocation: 'Bangalore Studio',
    status: 'Active',
    description: 'High-end fine art retoucher and album layout designer.',
    pendingCount: 4,
    workload: 6,
    productivity: 88,
  },
  {
    id: 'emp_4',
    employeeId: 'EMP-004',
    name: 'Pooja Hegde',
    firstName: 'Pooja',
    lastName: 'Hegde',
    email: 'pooja.crm@dreamframes.in',
    contactNumber: '+91 98409 22334',
    role: 'Pre-production CRM, Event Coordinator',
    roles: ['Pre-production CRM', 'Event Coordinator'],
    experience: '4 years',
    dateOfJoin: '2024-02-01',
    dob: '1997-08-25',
    address: 'Jayanagar, Bangalore',
    workLocation: 'Bangalore HQ',
    status: 'Active',
    description: 'Handles client onboarding, schedule coordinating & pre-shoot planning.',
    pendingCount: 1,
    workload: 8,
    productivity: 96,
  },
  {
    id: 'emp_5',
    employeeId: 'EMP-005',
    name: 'Suresh Kumar',
    firstName: 'Suresh',
    lastName: 'Kumar',
    email: 'suresh@dreamframes.in',
    contactNumber: '+91 98409 11223',
    role: 'Data Manager, Save the Date Post',
    roles: ['Data Manager', 'Save the Date Post'],
    experience: '12 years',
    dateOfJoin: '2021-08-15',
    dob: '1988-12-05',
    address: 'Whitefield, Bangalore',
    workLocation: 'Bangalore Studio',
    status: 'Active',
    description: 'Secure RAW data management, cloud backup & teaser post designer.',
    pendingCount: 2,
    workload: 3,
    productivity: 92,
  },
  {
    id: 'emp_6',
    employeeId: 'EMP-006',
    name: 'Anita Sharma',
    firstName: 'Anita',
    lastName: 'Sharma',
    email: 'anita@pixelstories.in',
    contactNumber: '+91 98202 55667',
    role: 'Candid Video Editor, Traditional Video Editor',
    roles: ['Candid Video Editor', 'Traditional Video Editor'],
    experience: '7 years',
    dateOfJoin: '2022-09-01',
    dob: '1993-03-14',
    address: 'Bandra, Mumbai',
    workLocation: 'Mumbai Studio',
    status: 'Active',
    description: 'Award-winning wedding teaser and 4K film editor.',
    pendingCount: 3,
    workload: 5,
    productivity: 95,
  },
];

// Helper to format client for Master Admin view
const formatMasterClient = (client: any, idx: number) => {
  const shoot = memoryStore.shoots.find(s => s.clientId === client.id) || memoryStore.shoots[idx % memoryStore.shoots.length];
  const flowType = (idx % 2 === 0) ? 'pre_wedding' : 'post_wedding';
  
  let phase = 'pre_production';
  if (shoot?.status === 'SHOOTING' || shoot?.status === 'PHOTOGRAPHER_ASSIGNED' || shoot?.status === 'SHOOT_COMPLETED') {
    phase = 'event';
  } else if (shoot?.status === 'DELIVERY' || shoot?.status === 'COMPLETED' || shoot?.status === 'EDITING' || shoot?.status === 'CLIENT_REVIEW') {
    phase = 'post_production';
  }

  const invoiceBalance = (shoot?.packageAmount || client.budget || 150000) - (shoot?.paidAmount || 50000);
  const totalAmount = shoot?.packageAmount || client.budget || 150000;
  const paidAmount = shoot?.paidAmount || 50000;

  return {
    id: client.id,
    serialNumber: `LEAD-${1000 + idx + 1}`,
    name: client.coupleName || client.name,
    coupleName: client.coupleName || client.name,
    phone: client.phone || '+91 98840 98765',
    email: client.email || 'client@example.com',
    eventType: shoot?.type || 'Pre-Wedding',
    eventDate: client.eventDate || shoot?.shootDate || '2026-09-20',
    location: client.location || shoot?.location || 'Bangalore / Ooty',
    flowType,
    currentPhase: phase,
    phaseOwner: 'Pooja Hegde (CRM)',
    preProductionStep: phase === 'pre_production' ? 'Creative Direction & Moodboard' : 'Completed',
    assignmentStatus: 'Assigned',
    assignedTeamSummary: `${shoot?.photographerName || 'Karthik Rajan'} (Photo), Vijay Anand (Video), Ramesh Krishnan (Editor)`,
    invoiceBalance: Math.max(0, invoiceBalance),
    totalAmount,
    paidAmount,
    studioId: client.studioId || 'studio_1',
    notes: client.notes || 'Destination outdoor shoot with misty sunrise & twilight reception.',
    invoiceData: JSON.stringify([
      {
        invoiceId: `INV-${202600 + idx + 1}`,
        totalAmount,
        paid: paidAmount,
        balance: Math.max(0, invoiceBalance),
        dueDate: '2026-10-15',
        status: invoiceBalance <= 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending'),
      }
    ]),
  };
};

// GET /api/master/dashboard - Comprehensive Great Master Multi-Studio Command Center
router.get(['/dashboard', '/sales/dashboard'], (req: Request, res: Response) => {
  const studios = memoryStore.studios;
  const clients = memoryStore.clients;
  const shoots = memoryStore.shoots;
  const photographers = memoryStore.photographers;
  const users = memoryStore.users;

  const totalStudios = studios.length;
  const activeStudios = studios.filter(s => s.status === 'active').length;
  const inactiveStudios = studios.filter(s => s.status !== 'active').length;
  const trialStudios = studios.filter(s => s.trialStatus === 'Active Trial' || s.plan?.includes('Trial')).length;
  const expiredTrials = studios.filter(s => s.trialStatus === 'Expired').length;
  const totalStudioAdmins = users.filter(u => u.role === 'studio_admin').length || studios.length;
  const totalClients = clients.length;
  const activeProjects = shoots.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length;
  const completedProjects = shoots.filter(s => s.status === 'COMPLETED').length;
  const totalRevenue = shoots.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalExpenses = Math.round(totalRevenue * 0.42);

  // Platform multi-studio performance list
  const studioSummaries = studios.map(s => {
    const sClients = clients.filter(c => c.studioId === s.id);
    const sShoots = shoots.filter(sh => sh.studioId === s.id);
    const sPhotographers = photographers.filter(p => p.studioId === s.id);
    const sAdmin = users.find(u => u.role === 'studio_admin' && u.studioId === s.id);
    const activeSh = sShoots.filter(sh => sh.status !== 'COMPLETED' && sh.status !== 'CANCELLED').length;
    const completedSh = sShoots.filter(sh => sh.status === 'COMPLETED').length;

    let trialDaysRemaining = 14;
    if (s.trialEndDate) {
      const diffMs = new Date(s.trialEndDate).getTime() - Date.now();
      trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      city: s.city,
      state: s.state,
      logo: s.logo,
      status: s.status,
      plan: s.plan,
      trialStatus: s.trialStatus || (s.plan?.includes('Trial') ? 'Active Trial' : 'Converted/Paid'),
      trialDaysRemaining,
      adminName: sAdmin?.name || `${s.name} Admin`,
      adminEmail: sAdmin?.email || s.email,
      adminPhone: sAdmin?.phone || s.phone,
      clientsCount: sClients.length,
      photographersCount: sPhotographers.length || 2,
      activeProjectsCount: activeSh,
      completedProjectsCount: completedSh,
      totalRevenue: s.totalRevenue || 0,
      lastActivity: 'Just now',
    };
  });

  const recentStudioActivity = memoryStore.activityLogs.slice(0, 10).map(act => ({
    id: act.id,
    studioId: act.studioId,
    studioName: studios.find(s => s.id === act.studioId)?.name || 'Studio',
    action: act.action,
    detail: act.details,
    actor: `${act.actorName} (${act.actorRole})`,
    time: act.timestamp,
    type: 'studio',
  }));

  const formattedClients = clients.map((c, i) => formatMasterClient(c, i));

  const ownerDashboard = {
    platformStats: {
      totalStudios,
      activeStudios,
      inactiveStudios,
      trialStudios,
      expiredTrials,
      totalStudioAdmins,
      totalClients,
      activeProjects,
      completedProjects,
      totalRevenue,
    },
    studioSummaries,
    recentStudioActivity,
    companyHealth: {
      totalActiveClients: clients.length,
      teamActiveCount: photographers.length + 3,
      todayShoots: shoots.filter(s => s.status === 'SHOOTING' || s.status === 'PHOTOGRAPHER_ASSIGNED').length || 2,
      pendingDeliveries: shoots.filter(s => s.status === 'DELIVERY' || s.status === 'CLIENT_REVIEW').length || 4,
      delayedProjects: 1,
      pendingPayments: shoots.filter(s => (s.packageAmount - s.paidAmount) > 0).length || 5,
      thisMonthIncome: totalRevenue || 3450000,
      thisMonthExpenses: totalExpenses || 1450000,
      advancePaymentsReceived: formattedClients.slice(0, 5).map(c => ({
        clientId: c.id,
        client: c.name,
        salesPerson: 'Pooja Hegde (CRM)',
        amount: c.paidAmount,
        date: '2026-08-28',
      })),
    },
    workflowPipeline: {
      stages: [
        { stage: 'Lead & Consultation', totalClients: 8, averageCompletionDays: 2, bottleneck: false },
        { stage: 'Pre-Production & Moodboard', totalClients: 6, averageCompletionDays: 4, bottleneck: false },
        { stage: 'Event Shoot Coverage', totalClients: 12, averageCompletionDays: 2, bottleneck: false },
        { stage: 'RAW Data QC & Ingest', totalClients: 5, averageCompletionDays: 1, bottleneck: false },
        { stage: 'Selection & Client Proofing', totalClients: 7, averageCompletionDays: 6, bottleneck: true },
        { stage: 'High-End Retouching', totalClients: 9, averageCompletionDays: 5, bottleneck: false },
        { stage: 'Teaser & Video Edit', totalClients: 6, averageCompletionDays: 7, bottleneck: true },
        { stage: 'Album & Delivery', totalClients: 4, averageCompletionDays: 3, bottleneck: false },
      ],
      bottlenecks: ['Selection & Client Proofing (6 avg days)', 'Teaser & Video Edit (7 avg days)'],
    },
    todayFocus: {
      todayFollowUps: [
        { id: 'f1', client: 'Arun & Priya', task: 'Finalize Ooty outdoor costume styling', employee: 'Pooja Hegde' },
        { id: 'f2', client: 'Rahul & Meena', task: 'Confirm Goa beach drone permit', employee: 'Vijay Anand' },
      ],
      todayDueDeliveries: [
        { id: 'd1', client: 'Karthik & Divya', task: 'Save the Date 4K Teaser Video', employee: 'Anita Sharma' },
      ],
      clientApprovalPending: [
        { id: 'a1', client: 'Adithya & Kavya', task: 'Review 80 selected album layouts', employee: 'Ramesh Krishnan' },
      ],
      teamPendingTasks: [
        { id: 't1', client: 'Arun & Priya', task: 'Color grading for sunrise tea estate shoot', employee: 'Ramesh Krishnan' },
        { id: 't2', client: 'Rahul & Meena', task: 'Deliver highlight teaser reel', employee: 'Anita Sharma' },
        { id: 't3', client: 'Siddharth & Sneha', task: 'Upload Pondicherry French Quarter RAW clips', employee: 'Vijay Anand' },
      ],
      delayedProjects: [
        { id: 'dp1', client: 'Nikhil & Riya', delayDays: 3, reason: 'Awaiting venue sound track approval' },
      ],
      emergencyAlerts: [],
    },
    smartAlertCenter: [
      {
        clientId: 'client_1',
        severity: 'green',
        title: 'Shoot Prep Complete',
        client: 'Arun & Priya',
        detail: 'Location permit & shotlist confirmed by Karthik Rajan.',
      },
      {
        clientId: 'client_6',
        severity: 'yellow',
        title: 'Drone Battery & Weather Warning',
        client: 'Rahul & Meena',
        detail: 'Forecast indicates coastal evening breeze in Goa; backup indoor lights packed.',
      },
      {
        clientId: 'client_2',
        severity: 'green',
        title: 'Advance Payment Received',
        client: 'Karthik & Divya',
        detail: 'Advance of ₹1,50,000 received via Bank Transfer.',
      },
    ],
    teamPerformance: {
      crmFollowUpStatus: { completed: 18, pending: 3 },
      productivityPercentage: 92,
      lateTaskReport: [],
      editorWisePendingCount: [
        { employeeId: 'emp_3', name: 'Ramesh Krishnan', pendingCount: 4 },
        { employeeId: 'emp_6', name: 'Anita Sharma', pendingCount: 3 },
      ],
      designerWorkload: [
        { employeeId: 'emp_3', name: 'Ramesh Krishnan', workload: 6 },
        { employeeId: 'emp_5', name: 'Suresh Kumar', workload: 3 },
      ],
    },
    financialSnapshot: {
      monthlyRevenue: totalRevenue || 3450000,
      monthlyExpenses: totalExpenses || 1450000,
      pendingBalances: 1850000,
      advanceReceived: 1600000,
      averageProjectValue: 245000,
      topSellingPackage: 'Premium Destination Wedding Suite',
    },
    businessGrowthMetrics: {
      monthlyGrowthPercentage: 24,
      leadToBookingConversionRatio: 78,
      repeatClientCount: 14,
      referralClientCount: 22,
      averageDeliveryTime: 12,
      mostProfitablePackage: 'Pre-Wedding Royal Cinematic Edition',
    },
    automationControlCenter: [
      { name: 'Automated Client WhatsApp Updates', status: 'Active' },
      { name: 'RAW Data Cloud Mirroring (AWS S3 / Google Drive)', status: 'Active' },
      { name: 'AI Face Tagging & Client Proofing Portal', status: 'Active' },
      { name: 'Auto-Generated Invoices & Payment Reminders', status: 'Active' },
      { name: 'Post-Delivery Google Review Trigger', status: 'Active' },
    ],
    clientActivityPanel: [
      { clientId: 'client_1', client: 'Arun & Priya', type: 'Approved 120 proofing photos', date: '2026-09-02T18:30:00Z' },
      { clientId: 'client_2', client: 'Karthik & Divya', type: 'Downloaded Save the Date Video', date: '2026-09-02T14:15:00Z' },
      { clientId: 'client_6', client: 'Rahul & Meena', type: 'Added comment on drone teaser clip #4', date: '2026-09-01T20:00:00Z' },
    ],
    clientExperience: {
      feedbackCount: 48,
      averageRating: 4.94,
      googleReviewTriggerReady: 6,
      deliveryCompletedClients: [
        { clientId: 'client_4', client: 'Adithya & Kavya', eventType: 'Post-Wedding Romance' },
      ],
    },
  };

  res.json({
    success: true,
    data: {
      ownerDashboard,
      studioSummaries,
      recentStudioActivity,
      recentClients: formattedClients.slice(0, 10),
    },
  });
});

// GET /api/master/activity - Multi-Studio Platform Activity Monitoring Feed
router.get('/activity', (req: Request, res: Response) => {
  const { studioId, type } = req.query;
  const studios = memoryStore.studios;

  let activities = [
    { id: 'act_1', studioId: 'studio_1', studioName: 'Dream Frames Studio', action: 'New Client Onboarded', detail: 'Arun & Priya confirmed for Ooty Pre-Wedding Shoot (₹1.85L)', actor: 'Vikram Sundaram (Studio Admin)', time: '10 mins ago', date: '2026-09-03T09:20:00Z', type: 'client', status: 'completed' },
    { id: 'act_2', studioId: 'studio_2', studioName: 'Pixel Stories Productions', action: 'Photographer Assigned', detail: 'Rohan Deshmukh assigned to Goa Beach Wedding (Rahul & Meena)', actor: 'Aakash Mehta (Studio Admin)', time: '35 mins ago', date: '2026-09-03T08:55:00Z', type: 'assignment', status: 'completed' },
    { id: 'act_3', studioId: 'studio_3', studioName: 'Lens Studio & Co.', action: 'Gallery Selection Approved', detail: 'Rajesh & Shalini finalized 120 proofing album photos', actor: 'Prasad Reddy (Studio Admin)', time: '1 hour ago', date: '2026-09-03T08:30:00Z', type: 'gallery', status: 'completed' },
    { id: 'act_4', studioId: 'studio_4', studioName: 'Royal Knot Cinematography', action: '4K Cinematic Film Delivered', detail: 'Jaipur Palace Wedding teaser and full film delivered', actor: 'Manish Rathore', time: '2 hours ago', date: '2026-09-03T07:30:00Z', type: 'delivery', status: 'completed' },
    { id: 'act_5', studioId: 'studio_5', studioName: 'Vibrant Moments Photography', action: 'Advance Payment Received', detail: '₹1,20,000 received for Backwater Pre-Wedding Shoot', actor: 'Deepak Menon', time: '4 hours ago', date: '2026-09-03T05:30:00Z', type: 'payment', status: 'completed' },
    { id: 'act_6', studioId: 'studio_1', studioName: 'Dream Frames Studio', action: 'RAW Ingest & Cloud Sync', detail: '1,450 RAW photos mirrored to secure cloud storage', actor: 'Suresh Kumar (Data Manager)', time: '5 hours ago', date: '2026-09-03T04:30:00Z', type: 'data', status: 'completed' },
    { id: 'act_7', studioId: 'studio_6', studioName: 'Aura Visuals', action: 'Studio Provisioned', detail: 'New studio workspace provisioned and onboarded', actor: 'Great Master (Platform Owner)', time: '1 day ago', date: '2026-09-02T10:00:00Z', type: 'studio', status: 'completed' },
    { id: 'act_8', studioId: 'studio_2', studioName: 'Pixel Stories Productions', action: 'Drone Flight Plan Approved', detail: 'Beachside 4K aerial flight checklist approved for Goa Shoot', actor: 'Anita Sharma', time: '1 day ago', date: '2026-09-02T15:00:00Z', type: 'assignment', status: 'completed' },
  ];

  if (studioId && studioId !== 'all') {
    activities = activities.filter(a => a.studioId === studioId);
  }
  if (type && type !== 'all') {
    activities = activities.filter(a => a.type === type);
  }

  res.json({ success: true, data: activities, total: activities.length });
});

// GET /api/master/clients - List all clients with filters
router.get(['/clients', '/sales/clients'], (req: Request, res: Response) => {
  const { flowType, phase, search } = req.query;
  let clients = memoryStore.clients.map((c, i) => formatMasterClient(c, i));

  if (flowType && flowType !== 'all') {
    clients = clients.filter(c => c.flowType === flowType);
  }
  if (phase && phase !== 'all') {
    clients = clients.filter(c => c.currentPhase === phase);
  }
  if (search) {
    const q = String(search).toLowerCase();
    clients = clients.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: clients });
});

// GET /api/master/clients/:clientId - Single client details
router.get(['/clients/:clientId', '/sales/clients/:clientId'], (req: Request, res: Response) => {
  const { clientId } = req.params;
  const idx = memoryStore.clients.findIndex(c => c.id === clientId);
  const client = memoryStore.clients[idx >= 0 ? idx : 0];

  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  const formatted = formatMasterClient(client, idx >= 0 ? idx : 0);
  res.json({ success: true, data: formatted });
});

// GET /api/master/clients/:clientId/employees
router.get(['/clients/:clientId/employees', '/sales/clients/:clientId/employees'], (req: Request, res: Response) => {
  res.json({ success: true, data: masterEmployees.slice(0, 3) });
});

// GET /api/master/clients/:clientId/work-tracker
router.get(['/clients/:clientId/work-tracker', '/sales/clients/:clientId/work-tracker'], (req: Request, res: Response) => {
  const { clientId } = req.params;
  const idx = memoryStore.clients.findIndex(c => c.id === clientId);
  const client = memoryStore.clients[idx >= 0 ? idx : 0];
  const clientName = client ? (client.coupleName || client.name) : 'Client';

  const tasks = [
    { id: 'wt_1', clientId, client: clientName, phase: 'pre_production', task: 'Moodboard & Costume Styling Finalization', employee: 'Pooja Hegde', status: 'Completed', date: '2026-08-20' },
    { id: 'wt_2', clientId, client: clientName, phase: 'pre_production', task: 'Location Scout & Permission Verification', employee: 'Vijay Anand', status: 'Completed', date: '2026-08-22' },
    { id: 'wt_3', clientId, client: clientName, phase: 'event', task: 'Main Outdoor & Candid Golden Hour Shoot', employee: 'Karthik Rajan', status: 'Completed', date: '2026-08-25' },
    { id: 'wt_4', clientId, client: clientName, phase: 'event', task: '4K Aerial Cinematic Drone Footage', employee: 'Vijay Anand', status: 'Completed', date: '2026-08-25' },
    { id: 'wt_5', clientId, client: clientName, phase: 'post_production', task: 'RAW Data Ingest & Cloud Backup', employee: 'Suresh Kumar', status: 'Completed', date: '2026-08-26' },
    { id: 'wt_6', clientId, client: clientName, phase: 'post_production', task: 'Client Proofing Gallery Selection (120 Photos)', employee: 'Pooja Hegde', status: 'Completed', date: '2026-08-28' },
    { id: 'wt_7', clientId, client: clientName, phase: 'post_production', task: 'Magazine Retouching & Color Grading', employee: 'Ramesh Krishnan', status: 'In Progress', date: '2026-09-05' },
    { id: 'wt_8', clientId, client: clientName, phase: 'post_production', task: 'Cinematic Teaser Film 4K Export', employee: 'Anita Sharma', status: 'In Progress', date: '2026-09-08' },
    { id: 'wt_9', clientId, client: clientName, phase: 'post_production', task: 'Physical Handcrafted Album Printing & Delivery', employee: 'Ramesh Krishnan', status: 'Pending', date: '2026-09-18' },
  ];

  res.json({ success: true, data: tasks });
});

// GET /api/master/clients/:clientId/invoice
router.get(['/clients/:clientId/invoice', '/sales/clients/:clientId/invoice'], (req: Request, res: Response) => {
  const { clientId } = req.params;
  const idx = memoryStore.clients.findIndex(c => c.id === clientId);
  const client = memoryStore.clients[idx >= 0 ? idx : 0];
  const clientName = client ? (client.coupleName || client.name) : 'Client';
  const total = client?.budget || 185000;
  const paid = 75000;
  const balance = total - paid;

  const invoices = [
    {
      invoiceId: `INV-${202600 + (idx >= 0 ? idx + 1 : 1)}`,
      clientId,
      client: clientName,
      flowType: (idx % 2 === 0) ? 'pre_wedding' : 'post_wedding',
      eventType: 'Pre-Wedding Royal Cinematic Suite',
      total,
      paid,
      balance,
      status: balance <= 0 ? 'Paid' : 'Partial',
      dueDate: '2026-10-15',
      items: [
        { description: 'Pre-Wedding 2-Day Cinematic Outdoor Shoot', amount: 120000 },
        { description: '4K Drone Aerial Coverage & Licensed Pilot', amount: 35000 },
        { description: 'Handcrafted Premium Leatherette Photo Album (40 Pages)', amount: 30000 },
      ],
    },
  ];

  res.json({ success: true, data: invoices });
});

// GET /api/master/clients/:clientId/attendance
router.get(['/clients/:clientId/attendance', '/sales/clients/:clientId/attendance'], (req: Request, res: Response) => {
  const { clientId } = req.params;
  const attendance = [
    { id: 'att_1', employeeId: 'EMP-001', employee: 'Karthik Rajan', role: 'Lead Photographer', date: '2026-08-25', checkIn: '06:00 AM', checkOut: '07:30 PM', status: 'Present' },
    { id: 'att_2', employeeId: 'EMP-002', employee: 'Vijay Anand', role: 'Drone Pilot & Videographer', date: '2026-08-25', checkIn: '06:00 AM', checkOut: '07:30 PM', status: 'Present' },
    { id: 'att_3', employeeId: 'EMP-005', employee: 'Suresh Kumar', role: 'Data Manager & Assistant', date: '2026-08-25', checkIn: '06:30 AM', checkOut: '08:00 PM', status: 'Present' },
  ];

  res.json({ success: true, data: attendance });
});

// GET /api/master/clients/:clientId/report
router.get(['/clients/:clientId/report', '/sales/clients/:clientId/report'], (req: Request, res: Response) => {
  const { clientId } = req.params;
  const idx = memoryStore.clients.findIndex(c => c.id === clientId);
  const client = memoryStore.clients[idx >= 0 ? idx : 0];

  res.json({
    success: true,
    data: {
      client: client ? formatMasterClient(client, idx >= 0 ? idx : 0) : null,
      summary: {
        totalTasks: 9,
        completedTasks: 6,
        inProgressTasks: 2,
        pendingTasks: 1,
        completionRate: 67,
        healthScore: 'Excellent (98%)',
        clientSatisfaction: '5.0 ★★★★★',
      },
    },
  });
});

// GET /api/master/employees - List all employees
router.get(['/employees', '/sales/employees'], (req: Request, res: Response) => {
  const { search } = req.query;
  let list = [...masterEmployees];

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: list });
});

// GET /api/master/employees/:employeeId
router.get(['/employees/:employeeId', '/sales/employees/:employeeId'], (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const emp = masterEmployees.find(e => e.id === employeeId || e.employeeId === employeeId) || masterEmployees[0];
  res.json({ success: true, data: emp });
});

// PUT /api/master/employees/:employeeId
router.put(['/employees/:employeeId', '/sales/employees/:employeeId'], (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const idx = masterEmployees.findIndex(e => e.id === employeeId || e.employeeId === employeeId);
  
  if (idx >= 0) {
    masterEmployees[idx] = { ...masterEmployees[idx], ...req.body };
    return res.json({ success: true, data: masterEmployees[idx] });
  }

  res.json({ success: true, data: req.body });
});

// DELETE /api/master/employees/:employeeId
router.delete(['/employees/:employeeId', '/sales/employees/:employeeId'], (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const idx = masterEmployees.findIndex(e => e.id === employeeId || e.employeeId === employeeId);
  if (idx >= 0) {
    masterEmployees.splice(idx, 1);
  }
  res.json({ success: true, data: { deleted: true } });
});

// GET /api/master/work-tracker
router.get(['/work-tracker', '/sales/work-tracker'], (req: Request, res: Response) => {
  const clients = memoryStore.clients;
  const allTasks = clients.flatMap((c, i) => {
    const clientName = c.coupleName || c.name;
    const flowType = (i % 2 === 0) ? 'pre_wedding' : 'post_wedding';
    return [
      { id: `wt_${c.id}_1`, clientId: c.id, client: clientName, flowType, phase: 'pre_production', task: 'Moodboard & Style Guide', employee: 'Pooja Hegde', status: 'Completed' },
      { id: `wt_${c.id}_2`, clientId: c.id, client: clientName, flowType, phase: 'event', task: 'Outdoor Candid Shoot', employee: 'Karthik Rajan', status: 'Completed' },
      { id: `wt_${c.id}_3`, clientId: c.id, client: clientName, flowType, phase: 'post_production', task: 'Photo Selection & Proofing', employee: 'Pooja Hegde', status: 'Completed' },
      { id: `wt_${c.id}_4`, clientId: c.id, client: clientName, flowType, phase: 'post_production', task: 'Magazine Retouching', employee: 'Ramesh Krishnan', status: (i % 3 === 0) ? 'Completed' : 'In Progress' },
      { id: `wt_${c.id}_5`, clientId: c.id, client: clientName, flowType, phase: 'post_production', task: 'Handcrafted Album Delivery', employee: 'Ramesh Krishnan', status: (i % 4 === 0) ? 'Completed' : 'Pending' },
    ];
  });

  res.json({ success: true, data: allTasks });
});

// GET /api/master/invoices
router.get(['/invoices', '/sales/invoices'], (req: Request, res: Response) => {
  const clients = memoryStore.clients;
  const invoices = clients.map((c, i) => {
    const total = c.budget || 160000;
    const paid = (i % 3 === 0) ? total : (i % 2 === 0 ? 80000 : 40000);
    const balance = total - paid;
    return {
      invoiceId: `INV-${202600 + i + 1}`,
      clientId: c.id,
      client: c.coupleName || c.name,
      flowType: (i % 2 === 0) ? 'pre_wedding' : 'post_wedding',
      eventType: (i % 2 === 0) ? 'Pre-Wedding Royal Suite' : 'Complete Wedding Suite (3 Days)',
      total,
      paid,
      balance,
      status: balance <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending'),
      dueDate: '2026-10-15',
    };
  });

  res.json({ success: true, data: invoices });
});

// GET /api/master/attendance
router.get(['/attendance', '/sales/attendance'], (req: Request, res: Response) => {
  const records = [
    { id: 'att_1', employeeId: 'EMP-001', employee: 'Karthik Rajan', role: 'Lead Photographer', date: '2026-09-02', checkIn: '06:00 AM', checkOut: '07:30 PM', status: 'Present' },
    { id: 'att_2', employeeId: 'EMP-002', employee: 'Vijay Anand', role: 'Videographer & Drone', date: '2026-09-02', checkIn: '06:00 AM', checkOut: '07:30 PM', status: 'Present' },
    { id: 'att_3', employeeId: 'EMP-003', employee: 'Ramesh Krishnan', role: 'Retouch Editor', date: '2026-09-02', checkIn: '09:00 AM', checkOut: '06:30 PM', status: 'Present' },
    { id: 'att_4', employeeId: 'EMP-004', employee: 'Pooja Hegde', role: 'Pre-production CRM', date: '2026-09-02', checkIn: '09:30 AM', checkOut: '06:00 PM', status: 'Present' },
    { id: 'att_5', employeeId: 'EMP-005', employee: 'Suresh Kumar', role: 'Data Manager', date: '2026-09-02', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present' },
    { id: 'att_6', employeeId: 'EMP-006', employee: 'Anita Sharma', role: 'Candid Video Editor', date: '2026-09-02', checkIn: '09:15 AM', checkOut: '06:45 PM', status: 'Present' },
    { id: 'att_7', employeeId: 'EMP-001', employee: 'Karthik Rajan', role: 'Lead Photographer', date: '2026-09-01', checkIn: '06:30 AM', checkOut: '08:00 PM', status: 'Present' },
    { id: 'att_8', employeeId: 'EMP-002', employee: 'Vijay Anand', role: 'Videographer & Drone', date: '2026-09-01', checkIn: '06:30 AM', checkOut: '08:00 PM', status: 'Present' },
  ];

  res.json({ success: true, data: records });
});

// GET /api/master/reports
router.get(['/reports', '/sales/reports'], (req: Request, res: Response) => {
  const reports = {
    conversion: {
      totalLeads: 48,
      bookedLeads: 37,
      lostLeads: 11,
      conversionRate: 77.1,
      monthlyTrends: [
        { month: 'Jun', leads: 12, bookings: 9 },
        { month: 'Jul', leads: 16, bookings: 13 },
        { month: 'Aug', leads: 20, bookings: 15 },
      ],
    },
    workCompletion: {
      totalTasks: 75,
      completedTasks: 58,
      inProgressTasks: 12,
      delayedTasks: 5,
      completionRate: 77.3,
      avgTurnaroundDays: 8.5,
    },
    invoiceCollection: {
      totalBilled: 4250000,
      totalCollected: 3100000,
      outstandingBalance: 1150000,
      collectionRate: 72.9,
    },
    attendance: {
      totalWorkingDays: 26,
      averagePresentRate: 96.2,
      overtimeHoursRecorded: 84,
    },
    clientDeliveryStatus: {
      deliveredOnTime: 32,
      deliveredWithRevision: 6,
      delayedDeliveries: 1,
      onTimeRate: 97.0,
    },
    assignmentLoad: masterEmployees.map(e => ({
      employeeId: e.employeeId,
      name: e.name,
      role: e.role,
      activeProjects: e.workload,
      completedShoots: e.experience ? parseInt(e.experience) * 6 : 18,
      pendingTasks: e.pendingCount,
      productivity: `${e.productivity}%`,
    })),
  };

  res.json({ success: true, data: reports });
});

// GET /api/master/notifications
router.get(['/notifications', '/sales/notifications'], (req: Request, res: Response) => {
  const notifications = [
    { id: 'notif_1', title: 'New Shoot Booking Confirmed', message: 'Arun & Priya confirmed Pre-Wedding Shoot for Sep 15 in Ooty.', time: '10 mins ago', isRead: false },
    { id: 'notif_2', title: 'Proofing Gallery Selection Complete', message: 'Client Rahul & Meena selected 120 photos for album retouching.', time: '1 hour ago', isRead: false },
    { id: 'notif_3', title: 'Payment Received', message: '₹75,000 received for Karthik & Divya (Invoice #INV-202602).', time: '3 hours ago', isRead: true },
    { id: 'notif_4', title: 'Delivery Approved', message: 'Adithya & Kavya approved final cinematic film with 5-star rating.', time: 'Yesterday', isRead: true },
  ];

  res.json({ success: true, data: notifications });
});

router.put(['/notifications/:id/read', '/sales/notifications/:id/read'], (req: Request, res: Response) => {
  res.json({ success: true, message: 'Notification marked as read' });
});

router.put(['/notifications/read-all', '/sales/notifications/read-all'], (req: Request, res: Response) => {
  res.json({ success: true, message: 'All notifications marked as read' });
});

// GET /api/master/preproduction - Preproduction Tracking, RAW Ingest, QC & Approvals
router.get(['/preproduction', '/sales/preproduction'], (req: Request, res: Response) => {
  const clients = memoryStore.clients;
  const shoots = memoryStore.shoots;

  const preproductionProjects = clients.map((c, i) => {
    const shoot = shoots.find(s => s.clientId === c.id) || shoots[i % shoots.length];
    const steps = [
      { id: 'step_1', title: 'Creative Direction & Moodboard', completed: true, date: '2026-08-25', owner: 'Pooja Hegde (CRM)' },
      { id: 'step_2', title: 'Location Scouting & Permissions', completed: true, date: '2026-08-28', owner: 'Karthik Rajan (Lead Photo)' },
      { id: 'step_3', title: 'Shot List & Concept Sign-off', completed: i % 3 !== 2, date: '2026-09-01', owner: 'Vijay Anand (Video Lead)' },
      { id: 'step_4', title: 'Crew & Drone Pilot Assignment', completed: true, date: '2026-09-02', owner: 'Vikram Sundaram (Studio Admin)' },
      { id: 'step_5', title: 'RAW Data Storage & Drive Link', completed: i % 2 === 0, date: '2026-09-03', owner: 'Suresh Kumar (Data Manager)' },
      { id: 'step_6', title: 'Client Pre-Shoot Consultation', completed: i === 0, date: '2026-09-04', owner: 'Pooja Hegde (CRM)' },
    ];

    const completedStepsCount = steps.filter(s => s.completed).length;
    const progressPercent = Math.round((completedStepsCount / steps.length) * 100);

    return {
      id: `pre_${c.id}`,
      clientId: c.id,
      leadId: `LEAD-${1000 + i + 1}`,
      clientName: c.coupleName || c.name,
      eventType: shoot?.type || 'Pre-Wedding Shoot',
      eventDate: c.eventDate || shoot?.shootDate || '2026-09-20',
      location: c.location || shoot?.location || 'Ooty Tea Estate & Lake',
      currentStep: steps.find(s => !s.completed)?.title || 'All Preproduction Steps Approved',
      progressPercent,
      driveLink: `https://drive.google.com/drive/folders/preprod-${c.id}`,
      secondaryDriveLink: `https://drive.google.com/drive/folders/raw-backup-${c.id}`,
      saveTheDateDriveLink: `https://drive.google.com/drive/folders/save-date-${c.id}`,
      assignedTeam: [
        { name: shoot?.photographerName || 'Karthik Rajan', role: 'Lead Photographer' },
        { name: 'Vijay Anand', role: 'Videographer & Drone Pilot' },
        { name: 'Pooja Hegde', role: 'Pre-production CRM' },
        { name: 'Suresh Kumar', role: 'Data Manager' },
      ],
      steps,
      qcStatus: i % 2 === 0 ? 'QC Passed' : 'Pending Review',
      clientApprovalStatus: i === 0 ? 'Approved by Couple' : 'Awaiting Couple Feedback',
      notes: c.notes || 'Drone sunrise tea estate shoot with 120 photo curation selection.',
    };
  });

  res.json({
    success: true,
    data: preproductionProjects,
    total: preproductionProjects.length,
  });
});

export default router;
