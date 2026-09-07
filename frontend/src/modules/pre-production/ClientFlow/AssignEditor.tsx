import { useState, useEffect } from "react";
import axios from 'axios';
import { Calendar, Video, Edit3, Users, Bell, Camera, Image, Film } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { EmployeePicker, AdditionalStaffPicker, type Employee } from './assignTeamShared';
import { getCurrentUserDisplayName, getCurrentUserRole } from '../utils/currentUser';



type FieldKey =
    | 'saveTheDate' | 'saveTheVideo' | 'retouching'
    | 'traditionalVideo' | 'traditionalPhoto' | 'albumDesign' | 'magazineDesign' | 'frameDesign' | 'candidVideo'

type FieldDef = {
    key: FieldKey
    label: string
    role: string
    icon: any
    optional?: boolean
    hasCount?: boolean
    countLabel?: string
}

type ExistingAssignment = {
    project_type: string
    employee_id: string
    task_count?: number
}

export default function AssignEditor() {
    const navigate = useNavigate();
    const location = useLocation();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);

    const clientName = location.state?.client || location.state?.clientName || '—';
    const leadId = location.state?.lead_id;
    const isPostProduction =
        location.state?.context === 'post_production' ||
        location.pathname.startsWith('/operational-manager') ||
        location.pathname.startsWith('/post-production-crm');

    const fieldDefs: FieldDef[] = isPostProduction
        ? [
            { key: 'traditionalVideo', label: 'Traditional Video Editor', role: 'Traditional Video Editor', icon: <Video size={18} className="text-gray-500" />, hasCount: true, countLabel: 'Song Count' },
            { key: 'traditionalPhoto', label: 'Retouch Editor', role: 'Retouch Editor', icon: <Camera size={18} className="text-gray-500" />, optional: true, hasCount: true, countLabel: 'Photo Count' },
            { key: 'albumDesign', label: 'Album Designer', role: 'Album Designer', icon: <Image size={18} className="text-gray-500" />, hasCount: true, countLabel: 'Page Count' },
            { key: 'magazineDesign', label: 'Magazine Designer', role: 'Magazine Designer', icon: <Image size={18} className="text-gray-500" />, optional: true, hasCount: true, countLabel: 'Page Count' },
            { key: 'frameDesign', label: 'Frame Designer', role: 'Frame Designer', icon: <Image size={18} className="text-gray-500" />, optional: true, hasCount: true, countLabel: 'Frame Count' },
            { key: 'candidVideo', label: 'Candid Video Editor', role: 'Candid Video Editor', icon: <Film size={18} className="text-gray-500" />, optional: true, hasCount: true, countLabel: 'Song Count' },
        ]
        : [
            { key: 'saveTheDate', label: 'Save the Date', role: 'Save the Date Post', icon: <Calendar size={18} className="text-gray-500" />, hasCount: true, countLabel: 'Count' },
            { key: 'saveTheVideo', label: 'Save the Video', role: 'Save the Date Video', icon: <Video size={18} className="text-gray-500" />, hasCount: true, countLabel: 'Count' },
            { key: 'retouching', label: 'Retouching', role: 'Retouch Photo', icon: <Edit3 size={18} className="text-gray-500" />, hasCount: true, countLabel: 'Photo Count' },
        ];

    const initialEditorData: Record<string, string> = {};
    fieldDefs.forEach(f => { initialEditorData[f.key] = '' });
    const [editorData, setEditorData] = useState<Record<string, string>>(initialEditorData);
    const [counts, setCounts] = useState<Record<string, string>>({});
    const [assistants, setAssistants] = useState<string[]>([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/employees`);
                setEmployees(res.data.data || []);
            } catch (error) {
                console.error("Employee fetch failed", error);
                toast.error('Failed to load employees');
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (!leadId) return;

        const projectTypeToKey: Record<string, FieldKey> = {
            'Save the Date': 'saveTheDate',
            'Save the Video': 'saveTheVideo',
            'Retouching': 'retouching',
            'Traditional Video Editing': 'traditionalVideo',
            'Retouch Editing': 'traditionalPhoto',
            'Album Design': 'albumDesign',
            'Magazine Design': 'magazineDesign',
            'Frame Design': 'frameDesign',
            'Candid Video Editing': 'candidVideo',
        };

        const fetchExistingAssignments = async () => {
            try {
                const projectId = `CRM-${leadId}`;
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/employee-projects/project/${encodeURIComponent(projectId)}`
                );
                const assignments: ExistingAssignment[] = res.data?.data || [];

                const nextEditorData: Record<string, string> = { ...initialEditorData };
                const nextCounts: Record<string, string> = {};
                const nextAssistants: string[] = [];

                assignments.forEach(assignment => {
                    if (assignment.project_type === 'Assistant') {
                        if (assignment.employee_id && !nextAssistants.includes(assignment.employee_id)) {
                            nextAssistants.push(assignment.employee_id);
                        }
                        return;
                    }

                    const key = projectTypeToKey[assignment.project_type];
                    if (key && key in nextEditorData) {
                        nextEditorData[key] = assignment.employee_id;
                        if (assignment.task_count != null) {
                            nextCounts[key] = String(assignment.task_count);
                        }
                    }
                });

                setEditorData(nextEditorData);
                setCounts(nextCounts);
                setAssistants(nextAssistants);
            } catch (error) {
                console.error('Existing editor assignments fetch failed', error);
                toast.error('Failed to load saved editor assignments');
            }
        };

        fetchExistingAssignments();
    }, [leadId, isPostProduction]);

    const employeeMatchesRole = (emp: any, role: string) => {
        if (emp.role === role) return true
        if (Array.isArray(emp.roles) && emp.roles.includes(role)) return true
        return false
    }

    const renderDropdown = (def: FieldDef) => {
        const filtered = employees.filter(emp => employeeMatchesRole(emp, def.role)) as Employee[]
        const pickerLabel = def.optional ? `${def.label} (Optional)` : def.label
        return (
            <div key={def.key} className="flex flex-col gap-2">
                <EmployeePicker
                    label={pickerLabel}
                    icon={def.icon}
                    value={editorData[def.key] || ''}
                    placeholder={loadingEmployees ? 'Loading editors...' : `Select ${def.label.toLowerCase()}`}
                    options={filtered}
                    onChange={(value) => setEditorData(prev => ({ ...prev, [def.key]: value }))}
                />
                {def.hasCount && editorData[def.key] && (
                    <div className="flex items-center justify-between px-5 py-3 mx-2 -mt-4 bg-gray-50 border border-gray-100 rounded-b-2xl relative z-0">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            {def.countLabel || 'Count'}
                        </label>
                        <input
                            type="number"
                            value={counts[def.key] || ''}
                            onChange={(e) => setCounts(prev => ({ ...prev, [def.key]: e.target.value }))}
                            className="w-24 px-3 py-1.5 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none text-center"
                            placeholder="e.g. 50"
                        />
                    </div>
                )}
            </div>
        )
    }

    const handleSave = async () => {
        if (!leadId) {
            toast.error("Missing Lead ID, cannot assign editors.");
            return;
        }

        const requiredKeys = fieldDefs.filter(f => !f.optional).map(f => f.key);
        const missingRequired = requiredKeys.some(k => !editorData[k]);
        if (missingRequired) {
            toast.error("Please select an editor for every required role before saving.");
            return;
        }

        try {
            const payload = {
                external_lead_id: leadId,
                project_name: clientName || 'Unknown Client',
                editors: editorData,
                counts,
                assistants,
                phase: isPostProduction ? 'post_production' : 'pre_production',
                assigned_by_name: getCurrentUserDisplayName(),
                assigned_by_role: getCurrentUserRole(isPostProduction ? 'operational-manager' : 'crm'),
            };

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/employee-projects/batch`, payload);
            if (res.data.success) {
                toast.success('Editors assigned successfully');
                navigate(-1);
            } else {
                toast.error(res.data.message || 'Failed to assign editors');
            }
        } catch (error) {
            console.error('Failed to assign editors:', error);
            toast.error('Failed to assign editors');
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Assign Editors</h1>
                {clientName && clientName !== '—' && (
                    <p className="text-sm text-gray-500 font-medium">
                        Client: <span className="font-semibold text-purple-600">{clientName}</span>
                        {leadId && <span className="ml-3 text-gray-400">#{leadId}</span>}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                {fieldDefs.map(def => renderDropdown(def))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <AdditionalStaffPicker
                    tags={assistants}
                    employees={employees as Employee[]}
                    availableRoles={isPostProduction
                        ? [
                            { key: 'traditional_video', label: 'Traditional Video' },
                            { key: 'retouch', label: 'Retouch' },
                            { key: 'album_design', label: 'Album Design' },
                            { key: 'magazine_design', label: 'Magazine Design' },
                            { key: 'frame_design', label: 'Frame Design' },
                            { key: 'candid_video', label: 'Candid Video' },
                        ]
                        : [
                            { key: 'save_the_date', label: 'Save the Date' },
                            { key: 'save_the_video', label: 'Save the Video' },
                            { key: 'retouch', label: 'Retouch' },
                        ]
                    }
                    onAdd={t => setAssistants([...assistants, t])}
                    onRemove={t => setAssistants(assistants.filter(a => a !== t))}
                    icon={<Users size={18} className="text-gray-500" />}
                />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                    Cancel
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-purple-700 shadow-sm hover:bg-purple-100 transition-colors" style={{ background: '#EDE9FE' }}>
                    <Bell size={16} /> Notify Team
                </button>
                <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90" style={{ background: '#5B5FC7' }}>
                    Save
                </button>
            </div>
        </div>
    );
}
