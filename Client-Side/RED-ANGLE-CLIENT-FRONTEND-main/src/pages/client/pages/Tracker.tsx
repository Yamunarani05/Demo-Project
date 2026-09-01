import { useState, useEffect } from 'react'
import { ChevronDown, CalendarDays, Compass, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
if (API_URL.includes("5001")) API_URL = API_URL.replace("5001", "5002");

const ALL_STEPS = [
    // Phase 1: Onboarding
    { step: 1, phase: 'Onboarding', label: 'Lead', desc: 'Project inquiry created and assigned', status: 'waiting' },
    { step: 2, phase: 'Onboarding', label: 'Quotation', desc: 'Quotation sent for approval', status: 'waiting' },
    { step: 3, phase: 'Onboarding', label: 'Confirmation', desc: 'Quotation approved and advance paid', status: 'waiting' },
    { step: 4, phase: 'Onboarding', label: 'Finalised', desc: 'Project officially finalised for production', status: 'waiting' },

    // Phase 2: Pre-production
    { step: 5, phase: 'Pre-production', label: 'Team Assigned', desc: 'Photographer and videographer assigned for pre-shoot', status: 'waiting' },
    { step: 6, phase: 'Pre-production', label: 'Shoot Tracking', desc: 'Shoot schedule confirmed and team dispatched', status: 'waiting' },
    { step: 7, phase: 'Pre-production', label: 'Shoot Completed', desc: 'Shoot completed by assigned team', status: 'waiting' },
    { step: 8, phase: 'Pre-production', label: 'Raw Data Upload', desc: 'Raw files uploaded', status: 'waiting' },
    { step: 9, phase: 'Pre-production', label: 'Data Manager Verification', desc: 'Files verified by data manager', status: 'waiting' },
    { step: 10, phase: 'Pre-production', label: 'Assigned to CRM', desc: 'Data assigned to CRM for editing', status: 'waiting' },
    { step: 11, phase: 'Pre-production', label: 'CRM Verified', desc: 'CRM team verifies edited content', status: 'waiting' },
    { step: 12, phase: 'Pre-production', label: 'Pre-production Deliverables', desc: 'CRM delivers pre-production assets', status: 'waiting' },

    // Phase 3: Event
    { step: 13, phase: 'Event', label: 'Event Team Assigned', desc: 'Event Coordinator assigns new Photographer and Videographer', status: 'waiting' },
    { step: 14, phase: 'Event', label: 'Event Shoot Completed', desc: 'Event shoot completed successfully', status: 'waiting' },
    { step: 15, phase: 'Event', label: 'Event Raw Data Upload', desc: 'Team sends raw data to Data Manager', status: 'waiting' },
    { step: 16, phase: 'Event', label: 'Pixoffice/Pixstudio Link', desc: 'Data Manager shares link and concludes event', status: 'waiting' },

    // Phase 4: Post-production
    { step: 17, phase: 'Post-production', label: 'Operational Manager Assigned Post-production CRM', desc: 'Assigned to Post-production CRM', status: 'waiting' },
    { step: 18, phase: 'Post-production', label: 'Editors Assigned', desc: 'CRM assigns Editors', status: 'waiting' },
    { step: 19, phase: 'Post-production', label: 'Editing Completed', desc: 'Editors send edited files to CRM', status: 'waiting' },
    { step: 20, phase: 'Post-production', label: 'Final Deliverables', desc: 'Deliverables sent to Client', status: 'waiting' },
]

const STAGE_ORDER = ['Lead', 'Quotation', 'Confirmation', 'Finalised'];

const stepStyle: any = {
    done: { bg: '#22c55e', text: '#fff' },
    in_progress: { bg: '#fbbf24', text: '#fff' },
    reupload: { bg: '#fbbf24', text: '#fff' },
    waiting: { bg: '#e5e7eb', text: '#9ca3af' },
}

const stepBadge: any = {
    done: { bg: '#dcfce7', color: '#16a34a', label: 'Done' },
    in_progress: { bg: '#fef3c7', color: '#d97706', label: 'In Progress' },
    reupload: { bg: '#fef3c7', color: '#d97706', label: 'Re-upload' },
    waiting: { bg: '#f3f4f6', color: '#6b7280', label: 'Pending' },
}

export default function Tracker() {
    const [expandedStep, setExpandedStep] = useState<number | null>(null)
    const [clientInfo, setClientInfo] = useState<any>({ name: 'Loading...', event: 'Loading...', eventDate: '-', leadFollowedBy: '-' })
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const [stepStatuses, setStepStatuses] = useState<Record<string, 'waiting' | 'in_progress' | 'reupload' | 'done'>>({})

    // Team arrays for each phase
    const [preprodTeam, setPreprodTeam] = useState<any[]>([])
    const [eventTeam, setEventTeam] = useState<any[]>([])
    const [postTeam, setPostTeam] = useState<any[]>([])
    const [editorsTeam, setEditorsTeam] = useState<any[]>([])
    const [editingCompletedTeam, setEditingCompletedTeam] = useState<any[]>([])
    const [preprodEvents, setPreprodEvents] = useState<any[]>([])
    const [preprodDeliverables, setPreprodDeliverables] = useState<any[]>([])

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const token = localStorage.getItem('ra_token')
                if (!token) return

                const res = await axios.get(`${API_URL}/client-auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    const lead = res.data.data;
                    setClientInfo({
                        name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Client',
                        event: lead.eventType || 'Event',
                        eventDate: lead.eventDate ? new Date(lead.eventDate).toLocaleDateString() : 'TBD',
                        leadFollowedBy: lead.leadFollowedBy || (lead.leadEmployee?.length > 0 ? `${lead.leadEmployee[0].employee?.firstName || ''} ${lead.leadEmployee[0].employee?.lastName || ''}`.trim() : 'Not Assigned')
                    });

                    let calculatedStatuses: Record<string, 'waiting' | 'in_progress' | 'reupload' | 'done'> = {};
                    ALL_STEPS.forEach(s => calculatedStatuses[s.label] = 'waiting');

                    // ==========================================
                    // PHASE 1: ONBOARDING
                    // ==========================================
                    const normalizeStage = (st?: string) => {
                        if (!st) return 'Lead';
                        const lower = st.toLowerCase().trim();
                        if (lower === 'finalised' || lower === 'finalized' || lower === 'completed') return 'Finalised';
                        if (lower === 'confirmation' || lower === 'confirmed') return 'Confirmation';
                        if (lower === 'quotation' || lower === 'quote') return 'Quotation';
                        if (lower === 'lead' || lower === 'callup' || lower === 'call up' || lower === 'call_up') return 'Lead';
                        return 'Lead';
                    };

                    const normStage = normalizeStage(lead.currentStage);

                    const hasApprovedQuotation = lead.quotationLeads && lead.quotationLeads.some((q: any) => ['approved', 'accepted', 'completed'].includes(q.status?.toLowerCase()));
                    const hasApprovedInvoice = lead.invoices && lead.invoices.some((inv: any) => ['approved', 'paid', 'completed', 'verified'].includes(inv.status?.toLowerCase()));

                    if (normStage === 'Finalised') {
                        calculatedStatuses['Lead'] = 'done';
                        calculatedStatuses['Quotation'] = 'done';
                        calculatedStatuses['Confirmation'] = 'done';
                        calculatedStatuses['Finalised'] = 'done';
                    } else if (normStage === 'Confirmation') {
                        calculatedStatuses['Lead'] = 'done';
                        calculatedStatuses['Quotation'] = 'done';
                        calculatedStatuses['Confirmation'] = hasApprovedInvoice ? 'done' : 'in_progress';
                        calculatedStatuses['Finalised'] = hasApprovedInvoice ? 'in_progress' : 'waiting';
                    } else if (normStage === 'Quotation') {
                        calculatedStatuses['Lead'] = 'done';
                        calculatedStatuses['Quotation'] = hasApprovedQuotation ? 'done' : 'in_progress';
                        calculatedStatuses['Confirmation'] = hasApprovedQuotation ? 'in_progress' : 'waiting';
                        calculatedStatuses['Finalised'] = 'waiting';
                    } else {
                        calculatedStatuses['Lead'] = 'done';
                        calculatedStatuses['Quotation'] = hasApprovedQuotation ? 'done' : 'in_progress';
                        calculatedStatuses['Confirmation'] = hasApprovedInvoice ? 'done' : (hasApprovedQuotation ? 'in_progress' : 'waiting');
                        calculatedStatuses['Finalised'] = 'waiting';
                    }

                    let pTeam: any[] = [];
                    let pEvents: any[] = [];
                    let pDeliverables: any[] = [];
                    let eTeam: any[] = [];
                    let postTeamTemp: any[] = [];
                    let editorsTeamTemp: any[] = [];
                    let editingCompletedTeamTemp: any[] = [];

                    const isProjectComplete = normStage === 'Finalised';

                    if (isProjectComplete) {

                        // Categorize Employees by Phase
                        const allEmps = lead.leadEmployee || [];
                        const preProdEmps = allEmps.filter((le: any) => le.flowStage === 'Pre-production' && !['save the date post', 'save the video', 'retouch'].some(t => le.taskName?.toLowerCase() === t));
                        const preProdEditors = allEmps.filter((le: any) => ['save the date post', 'save the video', 'retouch'].some(t => le.taskName?.toLowerCase() === t));
                        const evEmps = allEmps.filter((le: any) => le.flowStage === 'Event' || ((le.taskName?.toLowerCase() || '').includes('event') && !(le.taskName?.toLowerCase() || '').includes('pre-production')));
                        const postProdEmps = allEmps.filter((le: any) => le.flowStage === 'Post-production' || (le.taskName?.toLowerCase() || '').includes('post-production') || (le.taskName?.toLowerCase() || '').includes('edit') || (le.taskName?.toLowerCase() || '').includes('retouch editing'));
                        const postCrmEmps = postProdEmps.filter((le: any) => (le.employee?.position?.toLowerCase() || '').includes('crm') || (le.taskName?.toLowerCase() || '').includes('crm'));
                        const editorEmps = postProdEmps.filter((le: any) => !((le.employee?.position?.toLowerCase() || '').includes('crm') || (le.taskName?.toLowerCase() || '').includes('crm')));

                        // ==========================================
                        // PHASE 2: PRE-PRODUCTION
                        // ==========================================
                        if (preProdEmps.length > 0) {
                            calculatedStatuses['Team Assigned'] = 'done';
                            pTeam = preProdEmps.map((le: any) => ({
                                name: `${le.employee?.firstName || ''} ${le.employee?.lastName || ''}`.trim(),
                                role: le.employee?.position || 'Pre-production Team',
                                date: new Date(le.createdAt).toLocaleDateString(),
                                notes: le.description || 'Assigned to pre-production',
                                uiColor: 'done'
                            }));
                        } else {
                            calculatedStatuses['Team Assigned'] = 'in_progress';
                        }

                        const preProductionTypes = ['Save the Date', 'Save the Video', 'Retouching', 'Save the Date Post'];
                        const assignedPreProdProjects = (lead.assignedProjects || []).filter((ap: any) =>
                            ap.employee_id &&
                            ap.employee_id !== 'Unassigned' &&
                            ap.first_name &&
                            preProductionTypes.includes(ap.project_type)
                        );

                        if (assignedPreProdProjects.length > 0) {
                            pDeliverables = assignedPreProdProjects.map((ap: any) => ({
                                name: `${ap.first_name} ${ap.last_name || ''}`.trim(),
                                role: ap.project_type || 'Pre-production Editor',
                                date: new Date(ap.created_at || ap.updated_at || Date.now()).toLocaleDateString(),
                                notes: 'Assigned to deliverables',
                                uiColor: (ap.status === 'Completed' || ap.status === 'Approved') ? 'done' : 'in_progress',
                                status: ap.status || 'In Progress'
                            }));
                        } else if (preProdEditors.length > 0) {
                            pDeliverables = preProdEditors.map((le: any) => ({
                                name: `${le.employee?.firstName || ''} ${le.employee?.lastName || ''}`.trim(),
                                role: le.taskName || 'Pre-production Editor',
                                date: new Date(le.createdAt).toLocaleDateString(),
                                notes: 'Assigned to deliverables',
                                uiColor: (le.status === 'Completed' || le.status === 'Approved') ? 'done' : 'in_progress',
                                status: le.status || 'In Progress'
                            }));
                        }

                        const preDeliveries = lead.clientDeliveries?.filter((cd: any) =>
                            cd.deliveryType === 'RAW_DATA' || cd.deliveryType === 'EVENT_RAW_DATA' || (cd.deliveryType?.toLowerCase() || '').includes('pre-production')
                        ) || [];

                        const hasPreDelivery = preDeliveries.length > 0;
                        const hasApprovedPreDelivery = preDeliveries.some((d: any) => ['completed', 'approved', 'client_approved'].includes(d.status?.toLowerCase()));

                        if (calculatedStatuses['Team Assigned'] === 'done' || hasPreDelivery || lead.rawDataUploaded || lead.dataManagerVerified || preProdEditors.length > 0) {
                            const preEvents = lead.events?.filter((e: any) => (e.eventName?.toLowerCase() || '').includes('pre-production') || (e.eventName?.toLowerCase() || '').includes('pre-shoot') || (e.eventName?.toLowerCase() || '').includes('engagement') || (e.eventName?.toLowerCase() || '').includes('prewedding') || (e.eventName?.toLowerCase() || '').includes('pre-wedding')) || [];

                            if (preEvents.length > 0) {
                                pEvents = preEvents.map((e: any) => ({
                                    name: e.eventName,
                                    role: `Status: ${e.status || 'Pending'}`,
                                    date: '',
                                    notes: 'Pre-production Event Tracker',
                                    uiColor: ['completed', 'approved'].includes(e.status?.toLowerCase()) ? 'done' : 'in_progress'
                                }));
                            }

                            // Step 6: Shoot Tracking (Accepted task)
                            const isShootAccepted = preProdEmps.some((le: any) => ['accepted', 'in_progress', 'completed', 'approved'].includes(le.status?.toLowerCase())) || preEvents.some((e: any) => ['inprogress', 'completed', 'approved'].includes(e.status?.toLowerCase()));

                            if (isShootAccepted) {
                                calculatedStatuses['Shoot Tracking'] = 'done';
                            } else {
                                calculatedStatuses['Shoot Tracking'] = 'in_progress';
                            }

                            // Step 7: Shoot Completed (Time tracker stopped)
                            const isShootCompleted = preProdEmps.some((le: any) => ['completed', 'approved'].includes(le.status?.toLowerCase())) || preEvents.some((e: any) => ['completed', 'approved'].includes(e.status?.toLowerCase()));

                            if (isShootCompleted) {
                                calculatedStatuses['Shoot Completed'] = 'done';
                            } else if (calculatedStatuses['Shoot Tracking'] === 'done') {
                                calculatedStatuses['Shoot Completed'] = 'in_progress';
                            } else {
                                calculatedStatuses['Shoot Completed'] = 'waiting';
                            }

                            // Step 8: Raw Data Upload
                            if (lead.rawDataUploaded) {
                                calculatedStatuses['Raw Data Upload'] = 'done';
                            } else if (calculatedStatuses['Shoot Completed'] === 'done') {
                                calculatedStatuses['Raw Data Upload'] = 'in_progress';
                            } else {
                                calculatedStatuses['Raw Data Upload'] = 'waiting';
                            }

                            // Step 9: Data Manager Verification
                            if (lead.dataManagerVerified) {
                                calculatedStatuses['Data Manager Verification'] = 'done';
                            } else if (calculatedStatuses['Raw Data Upload'] === 'done') {
                                calculatedStatuses['Data Manager Verification'] = 'in_progress';
                            } else {
                                calculatedStatuses['Data Manager Verification'] = 'waiting';
                            }

                            // Step 10: Assigned to CRM
                            // As requested: auto-complete step 10 when step 9 is done
                            const isAssignedToCRM = !!lead.assignedPostProdCrm || preProdEditors.length > 0 || calculatedStatuses['Data Manager Verification'] === 'done';
                            if (isAssignedToCRM) {
                                calculatedStatuses['Assigned to CRM'] = 'done';
                            } else if (calculatedStatuses['Data Manager Verification'] === 'done') {
                                calculatedStatuses['Assigned to CRM'] = 'in_progress';
                            } else {
                                calculatedStatuses['Assigned to CRM'] = 'waiting';
                            }

                            // Step 11: CRM Verified (Send to Client)
                            if (hasPreDelivery) {
                                calculatedStatuses['CRM Verified'] = 'done';
                            } else if (calculatedStatuses['Assigned to CRM'] === 'done') {
                                calculatedStatuses['CRM Verified'] = 'in_progress';
                            } else {
                                calculatedStatuses['CRM Verified'] = 'waiting';
                            }

                            // Step 12: Pre-production Deliverables
                            if (hasApprovedPreDelivery) {
                                calculatedStatuses['Pre-production Deliverables'] = 'done';
                            } else if (calculatedStatuses['CRM Verified'] === 'done') {
                                calculatedStatuses['Pre-production Deliverables'] = 'in_progress';
                            } else {
                                calculatedStatuses['Pre-production Deliverables'] = 'waiting';
                            }
                        }


                        // ==========================================
                        // PHASE 3: EVENT
                        // ==========================================
                        if (calculatedStatuses['Pre-production Deliverables'] === 'done' || preProdEmps.length === 0) {
                            // Event phase begins
                            if (evEmps.length > 0) {
                                calculatedStatuses['Event Team Assigned'] = 'done';
                                eTeam = evEmps.map((le: any) => {
                                    const empName = `${le.employee?.firstName || ''} ${le.employee?.lastName || ''}`.trim();
                                    let displayRole = 'Event Team';
                                    if (le.taskName) {
                                        const tn = le.taskName.toLowerCase();
                                        if (tn.includes('secondary-photo') || tn.includes('candid photo')) displayRole = 'Candid Photography';
                                        else if (tn.includes('secondary-video') || tn.includes('candid video')) displayRole = 'Candid Videography';
                                        else if (tn.includes('photo')) displayRole = 'Traditional Photography';
                                        else if (tn.includes('video')) displayRole = 'Traditional Videography';
                                        else if (tn.includes('drone')) displayRole = 'Drone Operator';
                                        else displayRole = le.taskName.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                                    }
                                    return {
                                        name: `${empName} (${displayRole})`,
                                        role: le.employee?.position || 'Event Team',
                                        date: new Date(le.createdAt).toLocaleDateString(),
                                        notes: le.description || 'Assigned to Event',
                                        uiColor: 'done'
                                    };
                                });
                            } else {
                                calculatedStatuses['Event Team Assigned'] = 'in_progress';
                            }
                        }

                        if (calculatedStatuses['Event Team Assigned'] === 'done') {
                            const mainEvents = lead.events?.filter((e: any) => !(e.eventName?.toLowerCase() || '').includes('pre-production')) || [];

                            let isEventPassed = false;
                            if (lead.eventDate) {
                                const evDate = new Date(lead.eventDate);
                                evDate.setHours(0, 0, 0, 0);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                if (today > evDate) {
                                    isEventPassed = true;
                                }
                            }

                            const hasPix = lead.pixoffice?.length > 0 || lead.pixstudio?.length > 0;
                            const hasRawData = lead.rawDataUploaded || hasPix;

                            if (hasPix || hasRawData) {
                                calculatedStatuses['Event Shoot Completed'] = 'done';
                            } else if (mainEvents.length > 0) {
                                if (isEventPassed || mainEvents.some((e: any) => ['completed', 'approved'].includes(e.status?.toLowerCase()))) {
                                    calculatedStatuses['Event Shoot Completed'] = 'done';
                                } else {
                                    calculatedStatuses['Event Shoot Completed'] = 'in_progress';
                                }
                            } else {
                                if (isEventPassed) {
                                    calculatedStatuses['Event Shoot Completed'] = 'done';
                                } else {
                                    calculatedStatuses['Event Shoot Completed'] = 'in_progress';
                                }
                            }
                        }

                        if (calculatedStatuses['Event Shoot Completed'] === 'done') {
                            const hasPix = lead.pixoffice?.length > 0 || lead.pixstudio?.length > 0;
                            const hasRawData = lead.rawDataUploaded || hasPix;

                            if (hasRawData) {
                                calculatedStatuses['Event Raw Data Upload'] = 'done';
                            } else {
                                calculatedStatuses['Event Raw Data Upload'] = 'in_progress';
                            }

                            if (hasPix) {
                                calculatedStatuses['Pixoffice/Pixstudio Link'] = 'done';
                            } else if (hasRawData) {
                                calculatedStatuses['Pixoffice/Pixstudio Link'] = 'in_progress';
                            }
                        }

                        // ==========================================
                        // PHASE 4: POST-PRODUCTION
                        // ==========================================
                        if (calculatedStatuses['Pixoffice/Pixstudio Link'] === 'done') {
                            const crmObj = lead.assignedPostProdCrm;
                            if (crmObj || postCrmEmps.length > 0) {
                                calculatedStatuses['Operational Manager Assigned Post-production CRM'] = 'done';
                                if (crmObj) {
                                    postTeamTemp = [{
                                        name: `${crmObj.first_name || ''} ${crmObj.last_name || ''}`.trim(),
                                        role: crmObj.position || crmObj.role || 'Post-production CRM',
                                        date: '-',
                                        notes: 'Assigned as Post-production CRM by Operational Manager',
                                        uiColor: 'done'
                                    }];
                                } else {
                                    postTeamTemp = postCrmEmps.map((le: any) => ({
                                        name: `${le.employee?.firstName || ''} ${le.employee?.lastName || ''}`.trim(),
                                        role: le.employee?.position || 'CRM',
                                        date: new Date(le.createdAt).toLocaleDateString(),
                                        notes: le.description || 'Assigned to post-production CRM',
                                        uiColor: 'done'
                                    }));
                                }
                            } else {
                                calculatedStatuses['Operational Manager Assigned Post-production CRM'] = 'in_progress';
                            }
                        }

                        if (calculatedStatuses['Operational Manager Assigned Post-production CRM'] === 'done') {
                            const preProductionTypes = ['Save the Date', 'Save the Video', 'Retouching', 'Save the Date Post'];
                            const assignedProjects = (lead.assignedProjects || []).filter((ap: any) =>
                                ap.employee_id &&
                                ap.employee_id !== 'Unassigned' &&
                                ap.first_name &&
                                !preProductionTypes.includes(ap.project_type)
                            );
                            if (assignedProjects.length > 0) {
                                calculatedStatuses['Editors Assigned'] = 'done';
                                editorsTeamTemp = assignedProjects.map((ap: any) => ({
                                    name: `${ap.first_name} ${ap.last_name || ''}`.trim(),
                                    role: ap.project_type || ap.role || 'Editor',
                                    date: new Date(ap.created_at || ap.updated_at || Date.now()).toLocaleDateString(),
                                    notes: `Assigned for ${ap.project_type || 'Editing'}`,
                                    uiColor: 'done'
                                }));
                            } else if (editorEmps.length > 0) {
                                calculatedStatuses['Editors Assigned'] = 'done';
                                editorsTeamTemp = editorEmps.map((le: any) => ({
                                    name: `${le.employee?.firstName || ''} ${le.employee?.lastName || ''}`.trim(),
                                    role: le.employee?.position || 'Editor',
                                    date: new Date(le.createdAt).toLocaleDateString(),
                                    notes: le.description || 'Assigned to editing',
                                    uiColor: 'done'
                                }));
                            } else {
                                calculatedStatuses['Editors Assigned'] = 'in_progress';
                            }
                        }

                        if (calculatedStatuses['Editors Assigned'] === 'done') {
                            if (editorsTeamTemp.length > 0) {
                                editingCompletedTeamTemp = editorsTeamTemp.map((ed: any) => {
                                    let isCompleted = false;
                                    const ap = (lead.assignedProjects || []).find((p: any) => p.project_type === ed.role && (`${p.first_name} ${p.last_name || ''}`.trim() === ed.name));
                                    if (ap) {
                                        isCompleted = ['Completed', 'Approved'].includes(ap.status);
                                    } else {
                                        const le = editorEmps.find((e: any) => e.employee?.position === ed.role && (`${e.employee?.firstName || ''} ${e.employee?.lastName || ''}`.trim() === ed.name || `Employee ${e.employee_id}` === ed.name));
                                        if (le) {
                                            isCompleted = ['Completed', 'Approved'].includes(le.status);
                                        }
                                    }
                                    return {
                                        ...ed,
                                        uiColor: isCompleted ? 'done' : 'in_progress',
                                        notes: isCompleted ? 'Editing Completed' : 'Editing in progress'
                                    };
                                });

                                const allDone = editingCompletedTeamTemp.every(ed => ed.uiColor === 'done');
                                calculatedStatuses['Editing Completed'] = allDone ? 'done' : 'in_progress';
                            } else {
                                calculatedStatuses['Editing Completed'] = 'in_progress';
                            }

                            if (calculatedStatuses['Editing Completed'] === 'done') {
                                // Check final deliveries
                                const finalDeliveries = lead.clientDeliveries?.filter((cd: any) => cd.deliveryType === 'FINAL_DELIVERABLES') || [];
                                if (finalDeliveries.length > 0) {
                                    const hasReupload = finalDeliveries.some((d: any) => ['query_raised', 'rejected', 'rework'].includes(d.status?.toLowerCase()));
                                    if (hasReupload) calculatedStatuses['Final Deliverables'] = 'reupload';
                                    else calculatedStatuses['Final Deliverables'] = 'done';
                                } else {
                                    calculatedStatuses['Final Deliverables'] = 'waiting';
                                }
                            }
                        }
                    }

                    // Cascade 'done' status logically
                    let previousDone = true;
                    for (const step of ALL_STEPS) {
                        if (calculatedStatuses[step.label] === 'done') {
                            previousDone = true;
                        } else if (calculatedStatuses[step.label] === 'waiting' && previousDone && isProjectComplete) {
                            // The next logical step should be in_progress
                            // calculatedStatuses[step.label] = 'in_progress';
                            // previousDone = false;
                        } else {
                            previousDone = false;
                        }
                    }

                    setStepStatuses(calculatedStatuses);
                    setPreprodTeam(pTeam);
                    setPreprodEvents(pEvents);
                    setPreprodDeliverables(pDeliverables);
                    setEventTeam(eTeam);
                    setPostTeam(postTeamTemp);
                    setEditorsTeam(editorsTeamTemp);
                    setEditingCompletedTeam(editingCompletedTeamTemp);
                }
            } catch (err) {
                console.error("Failed to load client tracker data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchClientData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#5B5FC7] border-t-transparent" />
            </div>
        )
    }

    const doneCount = Object.values(stepStatuses).filter(v => v === 'done').length;
    const progressPct = Math.round((doneCount / ALL_STEPS.length) * 100);

    const getStageEmployees = (label: string) => {
        if (label === 'Team Assigned') return preprodTeam;
        if (label === 'Shoot Tracking') return preprodEvents;
        if (label === 'Pre-production Deliverables') return preprodDeliverables;
        if (label === 'Event Team Assigned') return eventTeam;
        if (label === 'Operational Manager Assigned Post-production CRM') return postTeam;
        if (label === 'Editors Assigned') return editorsTeam;
        if (label === 'Editing Completed') return editingCompletedTeam;
        if (STAGE_ORDER.includes(label) && label === 'Lead') {
            return [{
                name: clientInfo.leadFollowedBy,
                role: 'Sales Executive',
                date: clientInfo.eventDate,
                notes: 'Lead Manager assigned to you',
                uiColor: 'done'
            }];
        }
        if (STAGE_ORDER.includes(label) && label === 'Finalised') {
            return [{
                name: clientInfo.name,
                role: 'Project Finalised',
                date: clientInfo.eventDate,
                notes: 'Project officially finalised for production',
                uiColor: 'done'
            }];
        }
        return [];
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Production Tracker</h1>
                    <p className="text-slate-500 mt-2 text-lg">Unified view of your project lifecycle.</p>
                </div>
            </div>

            {/* Active Client Banner */}
            <div className="rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden bg-slate-900 border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="font-black text-2xl mb-3 tracking-tight">{clientInfo.name}</div>
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-sm">{clientInfo.event}</span>
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-sm flex items-center gap-1.5"><CalendarDays size={14} className="text-indigo-300" /> {clientInfo.eventDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unified Timeline */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                            <Compass size={20} />
                        </div>
                        Project Status
                    </h2>
                    <div className="flex items-center gap-4 w-full sm:w-1/2 justify-end">
                        <div className="w-full max-w-[200px] h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                            <div className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 shadow-sm">{doneCount} / {ALL_STEPS.length}</span>
                    </div>
                </div>

                <div className="relative">
                    {ALL_STEPS.map((s, i) => {
                        let stepStatus = stepStatuses[s.label] || 'waiting';

                        const isExpanded = expandedStep === i
                        const employees = getStageEmployees(s.label)

                        // Visual groupings
                        const showPhaseHeader = i === 0 || s.phase !== ALL_STEPS[i - 1].phase;

                        return (
                            <div key={i}>
                                {showPhaseHeader && (
                                    <div className="flex items-center gap-4 mt-8 mb-6">
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.phase} Phase</span>
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </div>
                                )}
                                <div className="flex gap-4 sm:gap-6 mb-6">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black shadow-md border-2 border-white transition-all`}
                                            style={{ background: stepStyle[stepStatus]?.bg, color: stepStyle[stepStatus]?.text, transform: stepStatus === 'in_progress' ? 'scale(1.1)' : 'scale(1)' }}>
                                            {stepStatus === 'done' ? <CheckCircle2 size={20} /> : stepStatus === 'reupload' ? '↺' : s.step}
                                        </div>
                                        {i < ALL_STEPS.length - 1 && <div className="w-1 rounded-full mt-3 opacity-50" style={{ background: '#E5E7EB', minHeight: isExpanded ? '100%' : '32px' }} />}
                                    </div>
                                    <div className="flex-1 mt-0.5">
                                        <div
                                            className={`bg-white rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md border ${isExpanded ? 'border-indigo-300 shadow-md ring-4 ring-indigo-50' : 'border-slate-200 shadow-sm hover:border-indigo-200'}`}
                                            onClick={() => {
                                                if (s.label === 'Quotation') navigate('/client/quotation');
                                                else if (s.label === 'Confirmation') navigate('/client/invoice');
                                                else if (s.label === 'Pixoffice/Pixstudio Link') navigate('/client/events');
                                                else if (s.label === 'Final Deliverables') navigate('/client/delivery');
                                                else setExpandedStep(isExpanded ? null : i);
                                            }}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Step {s.step}</span>
                                                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm"
                                                        style={{ background: stepBadge[stepStatus]?.bg, color: stepBadge[stepStatus]?.color }}>
                                                        {stepBadge[stepStatus]?.label}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    size={20}
                                                    className="text-slate-400 transition-transform duration-300"
                                                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                                />
                                            </div>
                                            <p className="text-lg font-bold text-slate-900 tracking-tight">{s.label}</p>
                                            <p className="text-sm text-slate-500 mt-1 font-medium">{s.desc}</p>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className="mt-4 rounded-2xl p-6 shadow-inner relative overflow-hidden" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                                {employees.length === 0 ? (
                                                    <div className="text-center py-4">
                                                        <p className="text-sm font-medium text-slate-400">No team data or additional details available for this stage.</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between mb-5">
                                                            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                                                {s.label.includes('Tracking') ? '📅 Tracked Events' : s.label === 'Pre-production Deliverables' ? '🎨 Deliverable Editors' : '👥 Assigned Team'}
                                                            </span>
                                                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-600 shadow-inner">
                                                                {employees.length} {employees.length === 1 ? 'Member' : 'Members'}
                                                            </span>
                                                        </div>
                                                        <div className={`grid gap-4 ${s.label === 'Pre-production Deliverables' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                                                            {employees.map((emp: any, ei: number) => {
                                                                const isDeliverable = s.label === 'Pre-production Deliverables';
                                                                const roleLower = (emp.role || '').toLowerCase();
                                                                let navPath = '';
                                                                if (isDeliverable) {
                                                                    if (roleLower.includes('save the date post')) navPath = '/client/preproduction/save-the-date';
                                                                    else if (roleLower.includes('save the video')) navPath = '/client/preproduction/save-the-video';
                                                                    else if (roleLower.includes('retouch')) navPath = '/client/preproduction/retouch';
                                                                }

                                                                return (
                                                                    <div
                                                                        key={ei}
                                                                        className={`flex items-start gap-4 rounded-xl p-5 bg-white border border-slate-200 shadow-sm ${navPath ? 'cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group' : ''}`}
                                                                        onClick={() => {
                                                                            if (navPath) navigate(navPath);
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-black shrink-0 shadow-sm group-hover:scale-110 transition-transform"
                                                                            style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
                                                                        >
                                                                            {emp.name.charAt(0)}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex flex-col gap-1 mb-2">
                                                                                <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{emp.name}</span>
                                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-slate-100 text-slate-500 w-fit truncate max-w-full">{emp.role}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${emp.uiColor === 'done' ? 'bg-emerald-500' : emp.uiColor === 'reupload' ? 'bg-amber-500' : emp.uiColor === 'in_progress' ? 'bg-amber-400' : 'bg-slate-400'}`}></div>
                                                                                <p className="text-xs font-semibold text-slate-600 truncate">{emp.status || emp.notes}</p>
                                                                            </div>
                                                                            <div className="flex items-center justify-between mt-3">
                                                                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><CalendarDays size={12} /> {emp.date || 'TBD'}</p>
                                                                                {emp.category && (
                                                                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-600 uppercase tracking-wider">
                                                                                        {emp.category}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}



