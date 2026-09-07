import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
    Bell,
    Calendar,
    CalendarOff,
    ChevronDown,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Users,
    Wand2,
    MessageSquareWarning,
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

type LeafItem = { to: string; icon: any; label: string; activePaths?: string[]; showBadge?: boolean }
type GroupItem = {
    key: string
    icon: any
    label: string
    color: string
    children: LeafItem[]
}

const topItems: LeafItem[] = [
    { to: '/operational-manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
]

const groups: GroupItem[] = [
    {
        key: 'post-production',
        icon: Wand2,
        label: 'Post-production',
        color: '#d97706',
        children: [
            {
                to: '/operational-manager/client',
                icon: Users,
                label: 'New Clients',
                activePaths: ['/operational-manager/client', '/operational-manager/assign-editor'],
            },
            { to: '/operational-manager/work-status', icon: ClipboardList, label: 'Work Status' },
        ],
    },
]

export default function OperationalManagerSidebar() {
    const navigate = useNavigate()
    const location = useLocation()

    const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
        'post-production': true,
    }))
    
    const [hasNewComplaints, setHasNewComplaints] = useState(false)
    const pendingCountRef = useRef<number>(-1)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
    const token = localStorage.getItem('token') || localStorage.getItem('ra_token')

    useEffect(() => {
        const fetchComplaints = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${API_URL}/operational-manager/complaints`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.data.success) {
                    const pending = res.data.data.filter((c: any) => c.status !== 'Resolved')
                    
                    // If we already initialized and the count went up, it means a new complaint arrived
                    if (pendingCountRef.current !== -1 && pending.length > pendingCountRef.current) {
                        toast.error('New Client Complaint Raised!', { 
                            icon: '🚨',
                            duration: 5000,
                            style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #F87171' }
                        })
                    } else if (pendingCountRef.current === -1 && pending.length > 0) {
                        // On initial load, notify them if they have unresolved complaints
                        toast(`You have ${pending.length} unresolved complaint(s)`, {
                            icon: '🚨',
                            duration: 4000,
                            style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #F87171' }
                        })
                    }
                    
                    pendingCountRef.current = pending.length
                    setHasNewComplaints(pending.length > 0)
                }
            } catch (err) {
                console.error("Failed to check complaints status", err)
            }
        }
        
        fetchComplaints()
        // Poll every 30 seconds
        const interval = setInterval(fetchComplaints, 30000)
        return () => clearInterval(interval)
    }, [API_URL, token])

    const bottomItems: LeafItem[] = [
        { to: '/operational-manager/complaints', icon: MessageSquareWarning, label: 'Complaints', showBadge: hasNewComplaints },
        { to: '/operational-manager/notifications', icon: Bell, label: 'Notifications' },
        { to: '/operational-manager/attendance', icon: Calendar, label: 'Attendance' },
        { to: '/operational-manager/leave-request', icon: CalendarOff, label: 'Leave Request' },
    ]

    const toggle = (key: string) =>
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

    const renderLeaf = ({ to, icon: Icon, label, activePaths, showBadge }: LeafItem, indent = false) => (
        <NavLink
            key={to}
            to={to}
            className={`flex items-center rounded-xl transition-all duration-150 ${indent
                ? 'gap-2.5 px-3 py-2 text-[13px] font-medium'
                : 'mb-1 gap-3 px-4 py-3 text-sm font-semibold'
                }`}
            style={({ isActive }) => {
                const forcedActive = activePaths?.some(path => location.pathname.startsWith(path))
                const active = isActive || forcedActive
                return {
                    color: active ? '#7c3aed' : indent ? '#6B7280' : '#374151',
                    background: active ? '#fff' : undefined,
                    boxShadow: active ? '0 1px 3px rgba(124,58,237,0.1)' : undefined,
                }
            }}
        >
            <div className="relative flex items-center justify-center">
                <Icon size={indent ? 14 : 18} />
                {showBadge && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </div>
            <span>{label}</span>
        </NavLink>
    )

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col overflow-y-auto border-r border-purple-100 bg-[#F8F6FF]">
            <div className="flex-shrink-0 cursor-pointer px-5 pb-4 pt-6" onClick={() => navigate('/operational-manager/dashboard')}>
                <div className="flex flex-col items-start gap-1">
                    <img src="/red_angle_logo.png" alt="RED ANGLE STUDIO" className="h-[36px] w-auto object-contain" />
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Post-production</div>
                </div>
            </div>

            <div className="mx-4 mb-2 h-px bg-purple-200/50" />

            <nav className="flex-1 overflow-y-auto px-3" style={{ scrollbarWidth: 'none' }}>
                {topItems.map(item => renderLeaf(item))}

                {groups.map(group => {
                    const Icon = group.icon
                    const isOpen = !!expanded[group.key]
                    const isGroupActive = group.children.some(child =>
                        location.pathname.startsWith(child.to) ||
                        child.activePaths?.some(path => location.pathname.startsWith(path))
                    )

                    return (
                        <div key={group.key} className="mt-1">
                            <button
                                type="button"
                                onClick={() => toggle(group.key)}
                                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isGroupActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: `${group.color}15` }}
                                    >
                                        <Icon size={15} style={{ color: group.color }} />
                                    </div>
                                    {group.label}
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isOpen && (
                                <div className="ml-6 space-y-0.5 border-l-2 border-purple-100 pb-1 pl-4">
                                    {group.children.map(child => renderLeaf(child, true))}
                                </div>
                            )}
                        </div>
                    )
                })}

                <div className="mx-1 my-3 h-px bg-purple-200/50" />
                {bottomItems.map(item => renderLeaf(item))}
            </nav>

            <div className="flex-shrink-0 px-3 pb-6 pt-2">
                <div className="mb-3 h-px bg-purple-200/50" />
                <button
                    onClick={() => {
                        localStorage.removeItem('ra_token')
                        localStorage.removeItem('ra_user')
                        localStorage.removeItem('ra_active_role')
                        navigate('/login')
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-white hover:text-gray-700"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}
