import { useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { masterAdminApi } from '../pages/master-admin/api/masterAdmin.api'

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

export default function MasterAdminTracker({ clientId, onNavigate }: { clientId: string, onNavigate?: (tab: string) => void }) {
    const navigate = useNavigate()
    const [expandedStep, setExpandedStep] = useState<number | null>(null)
    const [clientInfo, setClientInfo] = useState<any>({ name: 'Loading...', event: 'Loading...', eventDate: '-', leadFollowedBy: '-' })
    const [loading, setLoading] = useState(true)
    const [showQuotation, setShowQuotation] = useState(false)

    const [stepStatuses, setStepStatuses] = useState<Record<string, 'waiting'|'in_progress'|'reupload'|'done'>>({})
    
    // Team arrays for each phase
    const [preprodTeam, setPreprodTeam] = useState<any[]>([])
    const [eventTeam, setEventTeam] = useState<any[]>([])
    const [postTeam, setPostTeam] = useState<any[]>([])
    const [editorsTeam, setEditorsTeam] = useState<any[]>([])
    const [editingCompletedTeam, setEditingCompletedTeam] = useState<any[]>([])
    const [preprodEvents, setPreprodEvents] = useState<any[]>([])
    const [preprodDeliverables, setPreprodDeliverables] = useState<any[]>([])
    const [pixoffice, setPixoffice] = useState<any[]>([])
    const [pixstudio, setPixstudio] = useState<any[]>([])

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                if(!clientId) return;

                const clientMeta = await masterAdminApi.client(clientId);
                const trackerData = clientMeta ? await masterAdminApi.trackerData(clientMeta.serialNumber || clientId) : null;

                if(clientMeta) {
                    setClientInfo({
                        name: clientMeta.name || 'Client',
                        event: clientMeta.eventType || 'Event',
                        eventDate: clientMeta.eventDate || 'TBD',
                        leadFollowedBy: trackerData?.salesExecutive || clientMeta.phaseOwner || 'Not Assigned'
                    });

                    let calculatedStatuses: Record<string, 'waiting'|'in_progress'|'reupload'|'done'> = {};
                    ALL_STEPS.forEach(s => calculatedStatuses[s.label] = 'waiting');

                    // ==========================================
                    // PHASE 1: ONBOARDING
                    // ==========================================
                    // Note: master admin clientMeta uses currentPhase instead of currentStage. We have to map it.
                    // For simplicity, assume all sales steps done if they are in preproduction or beyond
                    const phase = clientMeta.currentPhase;
                    
                    let currentStageIndex = 0;
                    if (['preproduction', 'event', 'post_production', 'completed'].includes(phase)) {
                        currentStageIndex = 3; // Finalised
                    }
                    
                    for (let i = 0; i <= currentStageIndex; i++) {
                        calculatedStatuses[STAGE_ORDER[i]] = 'done';
                    }
                    if (currentStageIndex < STAGE_ORDER.length - 1) {
                         calculatedStatuses[STAGE_ORDER[currentStageIndex + 1]] = 'in_progress';
                    }

                    const hasApprovedQuotation = trackerData?.quotations && trackerData.quotations.some((q: any) => q.status?.toLowerCase() === 'approved');
                    if (!hasApprovedQuotation && calculatedStatuses['Quotation'] === 'done') {
                        calculatedStatuses['Quotation'] = 'in_progress';
                        calculatedStatuses['Confirmation'] = 'waiting';
                        calculatedStatuses['Finalised'] = 'waiting';
                    }

                    try {
                        const invoices = await masterAdminApi.clientInvoice(clientId);
                        const hasApprovedInvoice = invoices && invoices.some((inv: any) => inv.status?.toLowerCase() === 'approved');
                        if (!hasApprovedInvoice && calculatedStatuses['Confirmation'] === 'done') {
                            calculatedStatuses['Confirmation'] = 'in_progress';
                            calculatedStatuses['Finalised'] = 'waiting';
                        }
                    } catch (e) {
                        console.error('Failed to fetch invoices for tracker confirmation logic', e);
                    }

                    let pTeam: any[] = [];
                    let pEvents: any[] = [];
                    let pDeliverables: any[] = [];
                    let eTeam: any[] = [];
                    let postTeamTemp: any[] = [];
                    let editorsTeamTemp: any[] = [];
                    let editingCompletedTeamTemp: any[] = [];
                    let localPixoffice: any[] = [];
                    let localPixstudio: any[] = [];

                    const isProjectComplete = currentStageIndex === STAGE_ORDER.length - 1;
                    
                    if (isProjectComplete) {
                        
                        const allEmps = trackerData?.assignments || [];
                        const events = trackerData?.events || [];
                        localPixoffice = trackerData?.pixoffice || [];
                        localPixstudio = trackerData?.pixstudio || [];

                        const preProdEmps = allEmps.filter((le:any) => (le.flowStage || le.flow_stage) === 'Pre-production' && !['save the date post', 'save the video', 'retouch'].some(t => (le.taskName?.toLowerCase() || le.task_name?.toLowerCase()) === t));
                        const preProdEditors = allEmps.filter((le:any) => ['save the date post', 'save the video', 'retouch'].some(t => (le.taskName?.toLowerCase() || le.task_name?.toLowerCase()) === t));
                        const evEmps = allEmps.filter((le:any) => (le.flowStage || le.flow_stage) === 'Event' || ((le.taskName?.toLowerCase() || le.task_name?.toLowerCase() || '').includes('event') && !(le.taskName?.toLowerCase() || le.task_name?.toLowerCase() || '').includes('pre-production')));
                        const postProdEmps = allEmps.filter((le:any) => (le.flowStage || le.flow_stage) === 'Post-production' || (le.taskName?.toLowerCase() || le.task_name?.toLowerCase() || '').includes('post-production') || (le.taskName?.toLowerCase() || le.task_name?.toLowerCase() || '').includes('edit') || (le.taskName?.toLowerCase() || le.task_name?.toLowerCase() || '').includes('retouch editing'));
                        const postCrmEmps = postProdEmps.filter((le:any) => (le.employee?.role?.toLowerCase() || le.role?.toLowerCase() || '').includes('crm') || (le.taskName?.toLowerCase() || le.task_name?.toLowerCase() || '').includes('crm'));
                        const editorEmps = postProdEmps.filter((le:any) => !((le.employee?.role?.toLowerCase() || le.role?.toLowerCase() || '').includes('crm') || (le.taskName?.toLowerCase() || le.task_name?.toLowerCase() || '').includes('crm')));
                        
                        // ==========================================
                        // PHASE 2: PRE-PRODUCTION
                        // ==========================================
                        if (preProdEmps.length > 0) {
                            calculatedStatuses['Team Assigned'] = 'done';
                            pTeam = preProdEmps.map((le: any) => ({
                                name: le.employee_first_name ? `${le.employee_first_name} ${le.employee_last_name || ''}`.trim() : `Employee ${le.employee_id}`,
                                role: 'Pre-production Team',
                                date: new Date(le.created_at).toLocaleDateString(),
                                notes: le.description || 'Assigned to pre-production',
                                uiColor: 'done'
                            }));
                        } else {
                            calculatedStatuses['Team Assigned'] = 'in_progress';
                        }

                        const preProductionTypes = ['Save the Date', 'Save the Video', 'Retouching', 'Save the Date Post'];
                        const assignedPreProdProjects = (trackerData?.assignedProjects || []).filter((ap:any) => 
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
                                name: le.employee_first_name ? `${le.employee_first_name} ${le.employee_last_name || ''}`.trim() : `Employee ${le.employee_id}`,
                                role: le.task_name || 'Pre-production Editor',
                                date: new Date(le.created_at).toLocaleDateString(),
                                notes: 'Assigned to deliverables',
                                uiColor: (le.status === 'Completed' || le.status === 'Approved') ? 'done' : 'in_progress',
                                status: le.status || 'In Progress'
                            }));
                        }

                        if (calculatedStatuses['Team Assigned'] === 'done') {
                            const preDeliveries = (trackerData?.clientDeliveries || []).filter((d:any) => 
                                ['save the date', 'save the video', 'retouch', 'save the date post'].some(pt => 
                                    (d.delivery_type?.toLowerCase() || d.deliveryType?.toLowerCase() || '').includes(pt.toLowerCase()) ||
                                    (d.notes?.toLowerCase() || '').includes(pt.toLowerCase())
                                )
                            );
                            const hasPreDelivery = preDeliveries.length > 0;
                            const hasApprovedPreDelivery = preDeliveries.some((d:any) => ['completed','approved'].includes(d.status?.toLowerCase()));

                            if (hasPreDelivery) {
                                calculatedStatuses['Shoot Tracking'] = 'done';
                                calculatedStatuses['Shoot Completed'] = 'done';
                                calculatedStatuses['Raw Data Upload'] = 'done';
                                calculatedStatuses['Data Manager Verification'] = 'done';
                                calculatedStatuses['Assigned to CRM'] = 'done';
                                calculatedStatuses['CRM Verified'] = 'done';
                                
                                if (hasApprovedPreDelivery) {
                                    calculatedStatuses['Pre-production Deliverables'] = 'done';
                                } else {
                                    calculatedStatuses['Pre-production Deliverables'] = 'in_progress';
                                }
                            } else {
                                const preEvents = events.filter((e:any) => (e.eventName?.toLowerCase() || e.event_name?.toLowerCase() || '').includes('pre-production'));
                                if (preEvents.length > 0) {
                                    pEvents = preEvents.map((e:any) => ({
                                        name: e.event_name,
                                        role: `Status: ${e.status || 'Pending'}`,
                                        date: '',
                                        notes: 'Pre-production Event Tracker',
                                        uiColor: ['completed', 'approved'].includes(e.status?.toLowerCase()) ? 'done' : 'in_progress'
                                    }));
                                    
                                    const hasCompleted = preEvents.some((e:any) => ['completed', 'approved'].includes(e.status?.toLowerCase()));
                                    const hasInProgress = preEvents.some((e:any) => e.status?.toLowerCase() === 'inprogress');
                                    if (hasCompleted) {
                                        calculatedStatuses['Shoot Tracking'] = 'done';
                                        calculatedStatuses['Shoot Completed'] = 'done';
                                    } else if (hasInProgress) {
                                        calculatedStatuses['Shoot Tracking'] = 'in_progress';
                                    }
                                }
                                
                                if (preProdEditors.length > 0) {
                                    const allEditorsCompletedOrApproved = preProdEditors.every((le:any) => ['completed', 'approved'].includes(le.status?.toLowerCase()));
                                    const allEditorsApproved = preProdEditors.every((le:any) => ['approved'].includes(le.status?.toLowerCase()));
                                    
                                    if (allEditorsCompletedOrApproved) {
                                        calculatedStatuses['Raw Data Upload'] = 'done';
                                        calculatedStatuses['Data Manager Verification'] = 'done';
                                        calculatedStatuses['Assigned to CRM'] = 'done';
                                        if (allEditorsApproved) {
                                            calculatedStatuses['CRM Verified'] = 'done';
                                        } else {
                                            calculatedStatuses['CRM Verified'] = 'in_progress';
                                        }
                                    } else {
                                        calculatedStatuses['Assigned to CRM'] = 'in_progress';
                                    }
                                }
                            }
                        }

                        // ==========================================
                        // PHASE 3: EVENT
                        // ==========================================
                        if (calculatedStatuses['Pre-production Deliverables'] === 'done' || preProdEmps.length === 0) {
                            if (evEmps.length > 0) {
                                calculatedStatuses['Event Team Assigned'] = 'done';
                                eTeam = evEmps.map((le: any) => ({
                                    name: le.employee_first_name ? `${le.employee_first_name} ${le.employee_last_name || ''}`.trim() : `Employee ${le.employee_id}`,
                                    role: 'Event Team',
                                    date: new Date(le.created_at).toLocaleDateString(),
                                    notes: le.description || 'Assigned to Event',
                                    uiColor: 'done'
                                }));
                            } else {
                                calculatedStatuses['Event Team Assigned'] = 'in_progress';
                            }
                        }

                        if (calculatedStatuses['Event Team Assigned'] === 'done') {
                            const mainEvents = events.filter((e:any) => !(e.eventName?.toLowerCase() || e.event_name?.toLowerCase() || '').includes('pre-production'));
                            const hasPix = pixoffice.length > 0 || pixstudio.length > 0;
                            // Wait, does MasteradminTracker have rawDataUploaded? No, it doesn't. 
                            // But hasPix implies Data Manager sent the link.
                            
                            if (hasPix) {
                                calculatedStatuses['Event Shoot Completed'] = 'done';
                            } else if (mainEvents.length > 0) {
                                if (mainEvents.some((e:any) => ['completed', 'approved'].includes(e.status?.toLowerCase()))) {
                                    calculatedStatuses['Event Shoot Completed'] = 'done';
                                } else {
                                    calculatedStatuses['Event Shoot Completed'] = 'in_progress';
                                }
                            }
                        }

                        if (calculatedStatuses['Event Shoot Completed'] === 'done') {
                            const hasPix = pixoffice.length > 0 || pixstudio.length > 0;
                            if (hasPix) {
                                calculatedStatuses['Event Raw Data Upload'] = 'done';
                                calculatedStatuses['Pixoffice/Pixstudio Link'] = 'done';
                            } else {
                                calculatedStatuses['Event Raw Data Upload'] = 'in_progress';
                            }
                        }

                        // ==========================================
                        // PHASE 4: POST-PRODUCTION
                        // ==========================================
                        if (calculatedStatuses['Pixoffice/Pixstudio Link'] === 'done') {
                            const crmObj = trackerData?.assignedPostProdCrm;
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
                                        name: le.employee_first_name ? `${le.employee_first_name} ${le.employee_last_name || ''}`.trim() : `Employee ${le.employee_id}`,
                                        role: le.role || 'CRM',
                                        date: new Date(le.created_at).toLocaleDateString(),
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
                            const assignedProjects = (trackerData?.assignedProjects || []).filter((ap:any) => 
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
                                    name: le.employee_first_name ? `${le.employee_first_name} ${le.employee_last_name || ''}`.trim() : `Employee ${le.employee_id}`,
                                    role: le.role || 'Editor',
                                    date: new Date(le.created_at).toLocaleDateString(),
                                    notes: le.description || 'Assigned to editing',
                                    uiColor: 'done'
                                }));
                            } else {
                                calculatedStatuses['Editors Assigned'] = 'in_progress';
                            }
                        }

                        if (calculatedStatuses['Editors Assigned'] === 'done') {
                            if (editorsTeamTemp.length > 0) {
                                // Match editorsTeamTemp but with individual completion statuses
                                editingCompletedTeamTemp = editorsTeamTemp.map((ed: any) => {
                                    // Let's find their actual status from assignedProjects or editorEmps
                                    let isCompleted = false;
                                    const ap = (trackerData?.assignedProjects || []).find((p:any) => p.project_type === ed.role && (`${p.first_name} ${p.last_name || ''}`.trim() === ed.name));
                                    if (ap) {
                                        isCompleted = ['Completed', 'Approved'].includes(ap.status);
                                    } else {
                                        const le = editorEmps.find((e:any) => e.role === ed.role && (`${e.employee_first_name} ${e.employee_last_name || ''}`.trim() === ed.name || `Employee ${e.employee_id}` === ed.name));
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
                                calculatedStatuses['Editing Completed'] = phase === 'completed' ? 'done' : 'in_progress';
                            }

                            if (calculatedStatuses['Editing Completed'] === 'done') {
                                const finalDeliveries = trackerData?.clientDeliveries?.filter((cd:any) => cd.delivery_type === 'FINAL_DELIVERABLES') || [];
                                if (finalDeliveries.length > 0) {
                                    const hasReupload = finalDeliveries.some((d:any) => ['query_raised', 'rejected', 'rework'].includes(d.status?.toLowerCase()));
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
                            // logical step should be in_progress
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
                    setPixoffice(localPixoffice);
                    setPixstudio(localPixstudio);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load tracker data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchClientData()
    }, [clientId])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
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
        return [];
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Unified Timeline */}
            <div className="bg-white rounded-xl shadow-sm relative">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-lg font-bold text-slate-900">Project Status</p>
                    <div className="flex items-center gap-3 w-1/2 justify-end">
                        <div className="w-full max-w-[200px] h-2.5 rounded-full" style={{ background: '#F3F4F6' }}>
                            <div className="h-2.5 rounded-full transition-all duration-500 ease-out" style={{ background: '#22c55e', width: `${progressPct}%` }} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: '#6B7280' }}>{doneCount}/{ALL_STEPS.length}</span>
                    </div>
                </div>

                <div className="relative">
                    {ALL_STEPS.map((s, i) => {
                        let stepStatus = stepStatuses[s.label] || 'waiting';
                        const isExpanded = expandedStep === i
                        const employees = getStageEmployees(s.label)
                        const showPhaseHeader = i === 0 || s.phase !== ALL_STEPS[i - 1].phase;

                        return (
                            <div key={i}>
                                {showPhaseHeader && (
                                    <div className="flex items-center gap-4 mt-6 mb-4">
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.phase} Phase</span>
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </div>
                                )}
                                <div className="flex gap-4 mb-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border border-white`}
                                            style={{ background: stepStyle[stepStatus]?.bg, color: stepStyle[stepStatus]?.text }}>
                                            {stepStatus === 'done' ? '✓' : stepStatus === 'reupload' ? '↺' : s.step}
                                        </div>
                                        {i < ALL_STEPS.length - 1 && <div className="w-0.5 mt-2" style={{ background: '#E5E7EB', minHeight: isExpanded ? '100%' : '24px' }} />}
                                    </div>
                                    <div className="flex-1 mt-0.5">
                                        <div
                                            className="bg-white rounded-xl p-4 cursor-pointer transition-all hover:shadow-md border border-slate-100"
                                            style={{ border: isExpanded ? '1px solid #c4b5fd' : undefined }}
                                            onClick={() => {
                                                if (s.label === 'Quotation') setShowQuotation(true);
                                                else if (s.label === 'Confirmation' && onNavigate) onNavigate('invoice');
                                                else setExpandedStep(isExpanded ? null : i);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Step {s.step}</span>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                        style={{ background: stepBadge[stepStatus]?.bg, color: stepBadge[stepStatus]?.color }}>
                                                        {stepBadge[stepStatus]?.label}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    size={16}
                                                    style={{
                                                        color: '#9CA3AF',
                                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s',
                                                    }}
                                                />
                                            </div>
                                            <p className="text-base font-bold text-slate-900">{s.label}</p>
                                            <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
                                        </div>
                                        {isExpanded && (
                                            <div className="mt-3 rounded-xl p-5 shadow-inner" style={{ background: '#F9F8FF', border: '1px solid #EDE9FE' }}>
                                                {s.label === 'Pixoffice/Pixstudio Link' ? (
                                                    <div className="flex flex-col gap-3">
                                                        <h3 className="text-sm font-bold text-[#5B5FC7]">Shared Links</h3>
                                                        {pixoffice.map((p: any) => (
                                                            <div key={`po-${p.id}`} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800">Pixoffice - {p.event_name}</p>
                                                                    <p className="text-xs text-slate-500">{p.sub_category} • {p.file_size}</p>
                                                                </div>
                                                                {p.storage_path && (
                                                                    <a href={p.storage_path} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-semibold transition-colors">
                                                                        Open Link
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {pixstudio.map((p: any) => (
                                                            <div key={`ps-${p.id}`} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800">Pixstudio - {p.event_name}</p>
                                                                    <p className="text-xs text-slate-500">{p.sub_category} • {p.file_size}</p>
                                                                </div>
                                                                {p.storage_path && (
                                                                    <a href={p.storage_path} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-semibold transition-colors">
                                                                        Open Link
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {pixoffice.length === 0 && pixstudio.length === 0 && (
                                                            <p className="text-sm italic" style={{ color: '#9CA3AF' }}>No links have been shared yet.</p>
                                                        )}
                                                    </div>
                                                ) : employees.length === 0 ? (
                                                    <p className="text-sm italic" style={{ color: '#9CA3AF' }}>No team data or additional details available for this stage.</p>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span className="text-sm font-bold" style={{ color: '#5B5FC7' }}>
                                                                {s.label.includes('Tracking') ? '📅 Tracked Events' : s.label === 'Pre-production Deliverables' ? '🎨 Deliverable Editors' : '👥 Assigned Team'}
                                                            </span>
                                                        </div>
                                                        <div className={`grid gap-3 ${s.label === 'Pre-production Deliverables' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
                                                            {employees.map((emp: any, ei: number) => {
                                                                const isDeliverable = s.label === 'Pre-production Deliverables';
                                                                const roleLower = (emp.role || '').toLowerCase();
                                                                let navPath = '';
                                                                if (isDeliverable) {
                                                                    if (roleLower.includes('save the date post')) navPath = '/multi-role/employee/save-the-date';
                                                                    else if (roleLower.includes('save the video')) navPath = '/multi-role/employee/save-the-video';
                                                                    else if (roleLower.includes('retouch')) navPath = '/multi-role/employee/retouch';
                                                                }

                                                                return (
                                                                <div 
                                                                    key={ei} 
                                                                    className={`flex items-start gap-4 rounded-xl p-4 shadow-sm ${navPath ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`} 
                                                                    style={{ background: '#fff', border: '1px solid #f3f4f6' }}
                                                                    onClick={() => {
                                                                        if (navPath) navigate(navPath);
                                                                    }}
                                                                >
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-sm font-bold" style={{ color: '#111827' }}>{emp.name}</span>
                                                                            <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider" style={{ background: '#f3f4f6', color: '#6B7280' }}>{emp.role}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${emp.uiColor === 'done' ? 'bg-green-500' : emp.uiColor === 'reupload' ? 'bg-yellow-500' : emp.uiColor === 'in_progress' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                                                                            <p className="text-sm" style={{ color: '#6B7280' }}>{emp.status || emp.notes}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 mt-2">
                                                                           <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>📅 {emp.date || 'TBD'}</p>
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

            {/* Dummy Quotation Modal */}
            {showQuotation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Project Quotation</h2>
                            <button onClick={() => setShowQuotation(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 h-[60vh] overflow-y-auto bg-gray-50/50">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-indigo-900 mb-1">Quotation #QT-001</h3>
                                        <p className="text-sm text-gray-500">Date Issued: {clientInfo.eventDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">Approved</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-gray-100 pb-3">
                                        <div className="text-sm">
                                            <p className="font-semibold text-gray-900">Photography Services</p>
                                            <p className="text-gray-500">Traditional & Candid</p>
                                        </div>
                                        <div className="font-semibold text-gray-900">₹45,000</div>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 pb-3">
                                        <div className="text-sm">
                                            <p className="font-semibold text-gray-900">Videography Services</p>
                                            <p className="text-gray-500">Cinematic & Drone</p>
                                        </div>
                                        <div className="font-semibold text-gray-900">₹60,000</div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <p className="text-gray-500 text-sm font-medium">Total Amount</p>
                                    <p className="text-xl font-bold text-gray-900">₹1,05,000</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


