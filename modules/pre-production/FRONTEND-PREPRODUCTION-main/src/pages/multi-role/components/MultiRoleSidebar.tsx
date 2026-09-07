import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import {
    LayoutDashboard, Camera, Video, Briefcase, Users, Calendar,
    LogOut, Image, Film, CalendarCheck, FileText, Bell, Plane, Clock, Palette
} from 'lucide-react'

interface NavSection {
    id: string
    label: string
    icon: React.ElementType
    color: string
    items: { to: string; icon: React.ElementType; label: string }[]
}

const sections: NavSection[] = [
    {
        id: 'photographer',
        label: 'Photographer',
        icon: Camera,
        color: '#2563eb',
        items: [
            { to: '/multi-role/photographer/assigned-client', icon: Users, label: 'Assigned Client' },
            { to: '/multi-role/photographer/event-schedule', icon: Calendar, label: 'Event Scheduler' },
            { to: '/multi-role/photographer/works', icon: Briefcase, label: 'Works' },
        ],
    },
    {
        id: 'videographer',
        label: 'Videographer',
        icon: Video,
        color: '#059669',
        items: [
            { to: '/multi-role/videographer/assigned-client', icon: Users, label: 'Assigned Client' },
            { to: '/multi-role/videographer/event-schedule', icon: Calendar, label: 'Event Scheduler' },
            { to: '/multi-role/videographer/works', icon: Briefcase, label: 'Works' },
        ],
    },
    {
        id: 'drone',
        label: 'Drone (Event-only)',
        icon: Plane,
        color: '#0d9488',
        items: [
            { to: '/multi-role/drone/assigned-client', icon: Users, label: 'Assigned Client' },
            { to: '/multi-role/drone/event-schedule', icon: Calendar, label: 'Event Scheduler' },
            { to: '/multi-role/drone/works', icon: Briefcase, label: 'Works' },
        ],
    },
    {
        id: 'save-the-date',
        label: 'Save the Date',
        icon: Image,
        color: '#d97706',
        items: [
            { to: '/multi-role/employee/save-the-date', icon: Users, label: 'Assigned Client' },
        ],
    },
    {
        id: 'save-the-video',
        label: 'Save the Video',
        icon: Film,
        color: '#ea580c',
        items: [
            { to: '/multi-role/employee/save-the-video', icon: Users, label: 'Assigned Client' },
        ],
    },
    {
        id: 'outdoor-retouch',
        label: 'Outdoor Retouch',
        icon: Palette,
        color: '#65a30d',
        items: [
            { to: '/multi-role/employee/retouch', icon: Users, label: 'Assigned Client' },
        ],
    },
    {
        id: 'traditional-video',
        label: 'Traditional Video',
        icon: Video,
        color: '#be185d',
        items: [
            { to: '/multi-role/traditional-video/assigned-client', icon: Users, label: 'Assigned Client' },
            { to: '/multi-role/traditional-video/works', icon: Briefcase, label: 'Works' },
        ],
    },
    {
        id: 'candid-video',
        label: 'Candid Video',
        icon: Film,
        color: '#be123c',
        items: [
            { to: '/multi-role/candid-video/assigned-client', icon: Users, label: 'Assigned Client' },
            { to: '/multi-role/candid-video/works', icon: Briefcase, label: 'Works' },
        ],
    },
    {
        id: 'retouch',
        label: 'Retouch',
        icon: Camera,
        color: '#7c3aed',
        items: [
            { to: '/multi-role/traditional-photo/assigned-client', icon: Users, label: 'Assigned Client' },
            { to: '/multi-role/traditional-photo/works', icon: Briefcase, label: 'Works' },
        ],
    },
    {
        id: 'album-design',
        label: 'Album Designer',
        icon: Image,
        color: '#9333ea',
        items: [
            { to: '/multi-role/album-design/assigned-client', icon: Users, label: 'Assigned Client' },
            { to: '/multi-role/album-design/works', icon: Briefcase, label: 'Works' },
        ],
    },
    {
        id: 'magazine-design',
        label: 'Magazine Designer',
        icon: Image,
        color: '#ec4899', // pink-500
        items: [
            { to: '/multi-role/magazine-design/assigned-client', icon: Users, label: 'Assigned Client' },
            { to: '/multi-role/magazine-design/works', icon: Briefcase, label: 'Works' },
        ],
    },
    {
        id: 'frame-design',
        label: 'Frame Designer',
        icon: Image,
        color: '#eab308', // yellow-500
        items: [
            { to: '/multi-role/frame-design/assigned-client', icon: Users, label: 'Assigned Client' },
            { to: '/multi-role/frame-design/works', icon: Briefcase, label: 'Works' },
        ],
    },
]

export default function MultiRoleSidebar() {
    const navigate = useNavigate()
    const location = useLocation()

    const filteredSections = useMemo(() => {
        const rawUser = localStorage.getItem('ra_user')
        const user = rawUser ? JSON.parse(rawUser) : null
        const userRoles: string[] = user?.roles || (user?.role ? [user.role] : [])
        const uRoles = userRoles
            .flatMap((role) => String(role).split(',').map((part) => part.toLowerCase().trim()))
            .filter(Boolean)

        const showPhotographer = uRoles.includes('photographer')
        const showVideographer = uRoles.includes('videographer')
        const showDrone = uRoles.includes('drone')
        const showSaveTheDate = uRoles.some((r) => r === 'employee-1' || r.includes('save the date post') || r === 'save the date')
        const showSaveTheVideo = uRoles.some((r) => r === 'employee-2' || r.includes('save the date video') || r.includes('save the video'))
        const showOutdoorRetouch = uRoles.some(
            (r) => r === 'employee-4' || r.includes('retouch photo') || r.includes('outdoor retouch') || r === 'outdoor-retouch'
        )
        const showTraditionalVideo = uRoles.includes('traditional-video-editor') || uRoles.includes('traditional video editor')
        const showTraditionalPhoto = uRoles.includes('retouch-editor') || uRoles.includes('traditional-photo-editor') || uRoles.includes('traditional photo editor') || uRoles.includes('retouch editor')
        const showAlbumDesign = uRoles.includes('album-designer') || uRoles.includes('album designer')
        const showMagazineDesign = uRoles.includes('magazine-designer') || uRoles.includes('magazine designer')
        const showFrameDesign = uRoles.includes('frame-designer') || uRoles.includes('frame designer')
        const showCandidVideo = uRoles.includes('candid-video-editor') || uRoles.includes('candid video editor')

        return sections.map(section => {
            if (section.id === 'photographer' && !showPhotographer) return null
            if (section.id === 'videographer' && !showVideographer) return null
            if (section.id === 'drone' && !showDrone) return null
            if (section.id === 'outdoor-retouch' && !showOutdoorRetouch) return null
            if (section.id === 'retouch' && !showTraditionalPhoto) return null
            if (section.id === 'album-design' && !showAlbumDesign) return null
            if (section.id === 'magazine-design' && !showMagazineDesign) return null
            if (section.id === 'frame-design' && !showFrameDesign) return null
            if (section.id === 'traditional-video' && !showTraditionalVideo) return null
            if (section.id === 'candid-video' && !showCandidVideo) return null
            if (section.id === 'save-the-date' && !showSaveTheDate) return null
            if (section.id === 'save-the-video' && !showSaveTheVideo) return null
            
            return section
        }).filter(Boolean) as NavSection[]
    }, [])

    // const [, setExpanded] = useState<Record<string, boolean>>(() => {
    //     // Expand the section that contains the current path
    //     const initial: Record<string, boolean> = {}
    //     filteredSections.forEach(s => {
    //         initial[s.id] = s.items.some(i => location.pathname.startsWith(i.to))
    //     })
    //     // If none matched (e.g. on dashboard), expand all
    //     if (!Object.values(initial).some(Boolean)) {
    //         filteredSections.forEach(s => { initial[s.id] = true })
    //     }
    //     return initial
    // })

    // const toggle = (id: string) => {
    //     setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
    // }

    return (
        <aside className="w-[280px] bg-[#F8F6FF] flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-20 border-r border-purple-100">
            {/* Logo */}
            <div className="px-5 pt-6 pb-4 cursor-pointer" onClick={() => navigate('/multi-role/dashboard')}>
                <div className="flex flex-col items-start gap-1">
                    <img src="/red_angle_logo.png" alt="RED ANGLE STUDIO" className="h-[36px] w-auto object-contain" />
                    <div className="text-[10px] tracking-widest uppercase text-gray-400 font-bold ml-1">Multi-Role</div>
                </div>
            </div>

            <div className="h-px bg-purple-200/50 mx-4 mb-2" />

            <nav className="flex-1 px-3 overflow-y-auto">
                {/* Dashboard link */}
                <NavLink
                    to="/multi-role/dashboard"
                    end
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1"
                    style={({ isActive }) => ({
                        color: isActive ? '#7c3aed' : '#374151',
                        background: isActive ? '#fff' : undefined,
                        boxShadow: isActive ? '0 1px 3px rgba(124,58,237,0.1)' : undefined,
                    })}
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </NavLink>

                {/* Common Photography/Video/Drone/Employee Client Flow */}
                {filteredSections.length > 0 && (
                    <>
                        <NavLink
                            to="/multi-role/clients"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1"
                            style={({ isActive }) => ({
                                color: isActive ? '#7c3aed' : '#374151',
                                background: isActive ? '#fff' : undefined,
                                boxShadow: isActive ? '0 1px 3px rgba(124,58,237,0.1)' : undefined,
                            })}
                        >
                            <Users size={18} />
                            Clients
                        </NavLink>
                        
                        <NavLink
                            to="/multi-role/time-tracker"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-4"
                            style={({ isActive }) => ({
                                color: isActive ? '#7c3aed' : '#374151',
                                background: isActive ? '#fff' : undefined,
                                boxShadow: isActive ? '0 1px 3px rgba(124,58,237,0.1)' : undefined,
                            })}
                        >
                            <Clock size={18} />
                            Time Tracker
                        </NavLink>
                    </>
                )}

                {/* Role sections */}
                {filteredSections.map((section) => {
                    const SectionIcon = section.icon
                    const sectionActive = section.items.some(i => location.pathname.startsWith(i.to))

                    return (
                        <div key={section.id} className="mb-4">
                            <div className={`flex items-center w-full px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider mb-2 ${sectionActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: `${section.color}15` }}>
                                        <SectionIcon size={13} style={{ color: section.color }} />
                                    </div>
                                    {section.label}
                                </div>
                            </div>

                            <div className="ml-6 pl-4 border-l-2 border-purple-100 space-y-0.5 pb-1">
                                {section.items.map(({ to, icon: Icon, label }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
                                        style={({ isActive }) => ({
                                            color: isActive ? '#7c3aed' : '#6B7280',
                                            background: isActive ? '#fff' : undefined,
                                            boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.04)' : undefined,
                                        })}
                                    >
                                        <Icon size={14} />
                                        {label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )
                })}

                {/* Common pages divider */}
                <div className="h-px bg-purple-200/50 mx-1 my-3" />

                {/* Common pages */}
                {[
                    { to: '/multi-role/attendance', icon: CalendarCheck, label: 'Attendance' },
                    { to: '/multi-role/leave-request', icon: FileText, label: 'Leave Request' },
                    { to: '/multi-role/notifications', icon: Bell, label: 'Notifications' },
                ].map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-0.5"
                        style={({ isActive }) => ({
                            color: isActive ? '#7c3aed' : '#6B7280',
                            background: isActive ? '#fff' : undefined,
                            boxShadow: isActive ? '0 1px 3px rgba(124,58,237,0.1)' : undefined,
                        })}
                    >
                        <Icon size={16} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6 pt-2">
                <div className="h-px bg-purple-200/50 mb-3" />
                <button
                    onClick={() => {
                        localStorage.removeItem('ra_token')
                        localStorage.removeItem('ra_user')
                        localStorage.removeItem('ra_active_role')
                        navigate('/login')
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-gray-500 hover:bg-white hover:text-gray-700 transition-all"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </aside>
    )
}
