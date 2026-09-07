/**
 * Interconnected Demo Module Workflow & State Seeder
 * Connects all 20 workflow steps across all demo roles (CRM, Pre-production CRM,
 * Event Coordinator, Data Manager, Operational Manager, Field Crew & Editors).
 * Operates strictly on isolated local demo keys to protect real production data.
 */

export interface DemoClient {
    id: string;
    name: string;
    couple: string;
    eventDate: string;
    package: string;
    status: 'Inquiry' | 'Confirmed' | 'Pre-Production' | 'Post-Production' | 'Delivered';
    crmOwner: string;
    budget: string;
    location: string;
}

export interface DemoWorkflowStep {
    step: number;
    phase: 'Onboarding' | 'Pre-production' | 'Event' | 'Post-production';
    label: string;
    desc: string;
    status: 'done' | 'in_progress' | 'waiting' | 'reupload';
    updatedBy?: string;
    updatedAt?: string;
    notes?: string;
}

export interface DemoEventTask {
    id: string;
    clientName: string;
    eventType: string;
    date: string;
    venue: string;
    assignedTeam: {
        photographer: string;
        videographer: string;
        drone: string;
        coordinator: string;
    };
    qcStatus: 'Pending' | 'In Progress' | 'Approved';
}

export interface DemoMediaOffload {
    id: string;
    cardId: string;
    photographer: string;
    fileCount: number;
    totalSize: string;
    checksumStatus: 'Verified' | 'Pending';
    offloadDate: string;
}

export interface DemoPostProductionTask {
    id: string;
    clientName: string;
    taskType: 'Traditional Video' | 'Retouch Photo' | 'Album Design' | 'Magazine' | 'Teaser Film';
    editorName: string;
    progress: number;
    dueDate: string;
    status: 'Pending' | 'Editing' | 'QC Review' | 'Client Review' | 'Completed';
}

export const INITIAL_DEMO_CLIENTS: DemoClient[] = [
    {
        id: 'DEMO-CLI-001',
        name: 'Ananya & Vikram Wedding',
        couple: 'Ananya Sharma & Vikram Roy',
        eventDate: '2026-09-18',
        package: 'Royal Heritage Ultra 4K Cinema',
        status: 'Pre-Production',
        crmOwner: 'Aarav Mehta (Pre-production CRM)',
        budget: '₹8,50,000',
        location: 'Rambagh Palace, Jaipur'
    },
    {
        id: 'DEMO-CLI-002',
        name: 'Priya & Rahul Engagement',
        couple: 'Priya Verma & Rahul Kapoor',
        eventDate: '2026-09-25',
        package: 'Signature Candid & Drone Highlight',
        status: 'Confirmed',
        crmOwner: 'Neha Gupta (CRM Lead)',
        budget: '₹4,20,000',
        location: 'The Leela Palace, New Delhi'
    },
    {
        id: 'DEMO-CLI-003',
        name: 'Siddharth & Neha Sangeet',
        couple: 'Neha Patel & Siddharth Shah',
        eventDate: '2026-10-02',
        package: 'Traditional Multi-Cam & Retouch Express',
        status: 'Post-Production',
        crmOwner: 'Rohan Malhotra (Post-production CRM)',
        budget: '₹6,00,000',
        location: 'Taj Lands End, Mumbai'
    }
];

export const INITIAL_DEMO_WORKFLOW_STEPS: DemoWorkflowStep[] = [
    // Phase 1: Onboarding (Steps 1-4)
    { step: 1, phase: 'Onboarding', label: 'Lead', desc: 'Project inquiry created and assigned', status: 'done', updatedBy: 'CRM (Demo)', updatedAt: '2026-09-01' },
    { step: 2, phase: 'Onboarding', label: 'Quotation', desc: 'Quotation sent for approval', status: 'done', updatedBy: 'CRM (Demo)', updatedAt: '2026-09-02' },
    { step: 3, phase: 'Onboarding', label: 'Confirmation', desc: 'Quotation approved and advance paid', status: 'done', updatedBy: 'CRM (Demo)', updatedAt: '2026-09-03' },
    { step: 4, phase: 'Onboarding', label: 'Finalised', desc: 'Project officially finalised for production', status: 'done', updatedBy: 'CRM (Demo)', updatedAt: '2026-09-04' },

    // Phase 2: Pre-production (Steps 5-12)
    { step: 5, phase: 'Pre-production', label: 'Team Assigned', desc: 'Photographer and videographer assigned for pre-shoot', status: 'done', updatedBy: 'Pre-production CRM (Demo)', updatedAt: '2026-09-05' },
    { step: 6, phase: 'Pre-production', label: 'Shoot Tracking', desc: 'Shoot schedule confirmed and team dispatched', status: 'done', updatedBy: 'Event Coordinator (Demo)', updatedAt: '2026-09-06' },
    { step: 7, phase: 'Pre-production', label: 'Shoot Completed', desc: 'Shoot completed by assigned team', status: 'done', updatedBy: 'Photographer (Demo)', updatedAt: '2026-09-06' },
    { step: 8, phase: 'Pre-production', label: 'Raw Data Upload', desc: 'Raw files uploaded', status: 'done', updatedBy: 'Photographer (Demo)', updatedAt: '2026-09-07' },
    { step: 9, phase: 'Pre-production', label: 'Data Manager Verification', desc: 'Files verified by data manager', status: 'in_progress', updatedBy: 'Data Manager (Demo)', updatedAt: '2026-09-07' },
    { step: 10, phase: 'Pre-production', label: 'Assigned to CRM', desc: 'Data assigned to CRM for editing', status: 'waiting' },
    { step: 11, phase: 'Pre-production', label: 'CRM Verified', desc: 'CRM team verifies edited content', status: 'waiting' },
    { step: 12, phase: 'Pre-production', label: 'Pre-production Deliverables', desc: 'CRM delivers pre-production assets', status: 'waiting' },

    // Phase 3: Event (Steps 13-16)
    { step: 13, phase: 'Event', label: 'Event Team Assigned', desc: 'Event Coordinator assigns new Photographer and Videographer', status: 'waiting' },
    { step: 14, phase: 'Event', label: 'Event Shoot Completed', desc: 'Event shoot completed successfully', status: 'waiting' },
    { step: 15, phase: 'Event', label: 'Event Raw Data Upload', desc: 'Team sends raw data to Data Manager', status: 'waiting' },
    { step: 16, phase: 'Event', label: 'Pixoffice/Pixstudio Link', desc: 'Data Manager shares link and concludes event', status: 'waiting' },

    // Phase 4: Post-production (Steps 17-20)
    { step: 17, phase: 'Post-production', label: 'Operational Manager Assigned Post-production CRM', desc: 'Assigned to Post-production CRM', status: 'waiting' },
    { step: 18, phase: 'Post-production', label: 'Editors Assigned', desc: 'CRM assigns Editors', status: 'waiting' },
    { step: 19, phase: 'Post-production', label: 'Editing Completed', desc: 'Editors send edited files to CRM', status: 'waiting' },
    { step: 20, phase: 'Post-production', label: 'Final Deliverables', desc: 'Deliverables sent to Client', status: 'waiting' }
];

export const INITIAL_DEMO_EVENTS: DemoEventTask[] = [
    {
        id: 'DEMO-EVT-101',
        clientName: 'Ananya & Vikram Wedding',
        eventType: 'Sangeet & Cocktail Night',
        date: '2026-09-17',
        venue: 'Grand Ballroom, Rambagh Palace',
        assignedTeam: {
            photographer: 'Rajesh Kumar (Lead Photographer)',
            videographer: 'Amitabh Sen (Candid Film Lead)',
            drone: 'Karan Joshi (4K Drone Pilot)',
            coordinator: 'Simran Kaur (Event Coordinator)'
        },
        qcStatus: 'In Progress'
    },
    {
        id: 'DEMO-EVT-102',
        clientName: 'Priya & Rahul Engagement',
        eventType: 'Ring Ceremony & Gala Dinner',
        date: '2026-09-25',
        venue: 'Poolside Lawn, The Leela',
        assignedTeam: {
            photographer: 'Vikramaditya (Candid Specialist)',
            videographer: 'Siddharth (Cinematographer)',
            drone: 'Sameer Khan (Aerial Tech)',
            coordinator: 'Simran Kaur (Event Coordinator)'
        },
        qcStatus: 'Pending'
    }
];

export const INITIAL_DEMO_OFFLOADS: DemoMediaOffload[] = [
    {
        id: 'DEMO-OFF-301',
        cardId: 'SD-RED-042 (128GB SanDisk Extreme)',
        photographer: 'Rajesh Kumar',
        fileCount: 1420,
        totalSize: '114.6 GB',
        checksumStatus: 'Verified',
        offloadDate: '2026-09-07 10:15 AM'
    },
    {
        id: 'DEMO-OFF-302',
        cardId: 'CF-EXPRESS-018 (256GB Sony Tough)',
        photographer: 'Amitabh Sen',
        fileCount: 890,
        totalSize: '210.4 GB',
        checksumStatus: 'Verified',
        offloadDate: '2026-09-07 10:45 AM'
    }
];

export const INITIAL_DEMO_POST_TASKS: DemoPostProductionTask[] = [
    {
        id: 'DEMO-POST-401',
        clientName: 'Siddharth & Neha Sangeet',
        taskType: 'Teaser Film',
        editorName: 'Kunal Kapoor (Candid Video Editor)',
        progress: 85,
        dueDate: '2026-09-12',
        status: 'Client Review'
    },
    {
        id: 'DEMO-POST-402',
        clientName: 'Ananya & Vikram Wedding',
        taskType: 'Retouch Photo',
        editorName: 'Ritu Varma (Retouch Editor)',
        progress: 60,
        dueDate: '2026-09-15',
        status: 'Editing'
    },
    {
        id: 'DEMO-POST-403',
        clientName: 'Siddharth & Neha Sangeet',
        taskType: 'Album Design',
        editorName: 'Manish Malhotra (Album Designer)',
        progress: 100,
        dueDate: '2026-09-10',
        status: 'QC Review'
    }
];

/**
 * Seeds connected demo workflow & module state into localStorage if not already present.
 */
export function seedDemoModuleData(): void {
    if (!localStorage.getItem('demo_clients_data')) {
        localStorage.setItem('demo_clients_data', JSON.stringify(INITIAL_DEMO_CLIENTS));
    }
    if (!localStorage.getItem('demo_shared_workflow_state')) {
        localStorage.setItem('demo_shared_workflow_state', JSON.stringify(INITIAL_DEMO_WORKFLOW_STEPS));
    }
    if (!localStorage.getItem('demo_events_data')) {
        localStorage.setItem('demo_events_data', JSON.stringify(INITIAL_DEMO_EVENTS));
    }
    if (!localStorage.getItem('demo_offloads_data')) {
        localStorage.setItem('demo_offloads_data', JSON.stringify(INITIAL_DEMO_OFFLOADS));
    }
    if (!localStorage.getItem('demo_post_tasks_data')) {
        localStorage.setItem('demo_post_tasks_data', JSON.stringify(INITIAL_DEMO_POST_TASKS));
    }
    localStorage.setItem('demo_module_seeded_at', new Date().toISOString());
}

/**
 * Retrieves the current shared 20-step demo workflow state.
 */
export function getDemoWorkflowState(): DemoWorkflowStep[] {
    const stored = localStorage.getItem('demo_shared_workflow_state');
    if (!stored) {
        seedDemoModuleData();
        return INITIAL_DEMO_WORKFLOW_STEPS;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        return INITIAL_DEMO_WORKFLOW_STEPS;
    }
}

/**
 * Updates a specific step in the connected demo workflow state across all demo role logins.
 */
export function updateDemoWorkflowStep(
    stepNumber: number,
    newStatus: 'done' | 'in_progress' | 'waiting' | 'reupload',
    updatedBy: string,
    notes?: string
): DemoWorkflowStep[] {
    const currentSteps = getDemoWorkflowState();
    const updatedSteps = currentSteps.map(s => {
        if (s.step === stepNumber) {
            return {
                ...s,
                status: newStatus,
                updatedBy: updatedBy,
                updatedAt: new Date().toISOString().split('T')[0],
                notes: notes || s.notes
            };
        }
        return s;
    });

    localStorage.setItem('demo_shared_workflow_state', JSON.stringify(updatedSteps));
    return updatedSteps;
}
