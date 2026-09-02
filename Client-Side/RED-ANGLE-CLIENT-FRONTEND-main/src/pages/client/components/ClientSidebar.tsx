import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Compass, Camera, Download, FileText, IndianRupee, Bell, LogOut, BriefcaseBusiness, Film, ChevronDown, MessageSquareWarning } from 'lucide-react'
import axios from 'axios'

const navItems = [
    { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { name: 'Works', path: '/client/works', icon: BriefcaseBusiness },
    { name: 'Tracker', path: '/client/tracker', icon: Compass },
    { name: 'Quotation', path: '/client/quotation', icon: FileText },
    { name: 'Invoice', path: '/client/invoice', icon: IndianRupee },
    { 
        name: 'Preproduction', 
        path: '/client/preproduction', 
        icon: Film,
        subItems: [
            { name: 'Save the Date', path: '/client/preproduction/save-the-date' },
            { name: 'Save the Video', path: '/client/preproduction/save-the-video' },
            { name: 'Retouch', path: '/client/preproduction/retouch' },
        ]
    },
    { name: 'Events', path: '/client/events', icon: Camera },
    { name: 'Delivery', path: '/client/delivery', icon: Download },
    { name: 'Raise Complaint', path: '/client/raise-complaint', icon: MessageSquareWarning },
    { name: 'Notifications', path: '/client/notifications', icon: Bell },
]

export default function ClientSidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
        'Preproduction': location.pathname.includes('/client/preproduction')
    })
    const [pendingDeliveryCount, setPendingDeliveryCount] = useState(0)

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'
        const token = localStorage.getItem('ra_token')

        const fetchDeliveries = async () => {
            if (!token) return
            try {
                const res = await axios.get(`${API_URL}/deliveries`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.data.success) {
                    const finalDeliveries = res.data.data.filter((d: any) => d.deliveryType === 'FINAL_DELIVERABLES')
                    const pending = finalDeliveries.filter((d: any) => d.status === 'pending' || d.status === 'query_raised')
                    setPendingDeliveryCount(pending.length)
                }
            } catch (err) {
                console.error("Failed to fetch deliveries for sidebar", err)
            }
        }

        fetchDeliveries()

        const handleUpdate = () => fetchDeliveries()
        window.addEventListener('deliveriesUpdated', handleUpdate)
        return () => window.removeEventListener('deliveriesUpdated', handleUpdate)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('ra_token')
        localStorage.removeItem('ra_user')
        navigate('/login')
    }

    const toggleDropdown = (name: string) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [name]: !prev[name]
        }))
    }

    const closeMobile = () => {
        if (setIsOpen) setIsOpen(false)
    }

    return (
        <aside 
            className={`w-[var(--sidebar-width)] h-screen fixed left-0 top-0 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} 
            style={{ backgroundColor: 'rgba(218, 210, 242, 1)' }}
        >
            {/* Logo Area */}
            <div className="h-[var(--topbar-height)] flex items-center px-6 border-b border-indigo-900/10 pt-4 pb-2">
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/client/dashboard')}>
                    <div className="w-7 h-7 rounded-lg bg-[#5B5FC7] flex items-center justify-center shadow-sm">
                        <Camera className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-extrabold text-base tracking-wider uppercase font-display text-indigo-950">
                        DEMO STUDIO
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const hasSubItems = !!item.subItems
                    const isActive = hasSubItems 
                        ? location.pathname.startsWith(item.path)
                        : location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    
                    const isOpen = openDropdowns[item.name]
                    const Icon = item.icon

                    return (
                        <div key={item.path} className="flex flex-col">
                            {hasSubItems ? (
                                <button
                                    onClick={() => toggleDropdown(item.name)}
                                    className={`
                                        flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative w-full
                                        ${isActive
                                            ? 'bg-white text-[#5B5FC7] shadow-sm'
                                            : 'hover:bg-white/40 hover:text-indigo-950 text-indigo-900/70'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full shadow-sm" style={{ backgroundColor: '#5B5FC7' }}></div>
                                        )}
                                        <Icon
                                            size={18}
                                            className={isActive ? 'text-[#5B5FC7]' : 'text-indigo-900/50 group-hover:text-indigo-900'}
                                        />
                                        {item.name}
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`text-indigo-900/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>
                            ) : (
                                <Link
                                    to={item.path}
                                    onClick={closeMobile}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative
                                        ${isActive
                                            ? 'bg-white text-[#5B5FC7] shadow-sm'
                                            : 'hover:bg-white/40 hover:text-indigo-950 text-indigo-900/70'
                                        }
                                    `}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full shadow-sm" style={{ backgroundColor: '#5B5FC7' }}></div>
                                    )}
                                    <Icon
                                        size={18}
                                        className={isActive ? 'text-[#5B5FC7]' : 'text-indigo-900/50 group-hover:text-indigo-900'}
                                    />
                                    {item.name}
                                    {item.name === 'Delivery' && pendingDeliveryCount > 0 && (
                                        <div className="absolute right-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                                    )}
                                </Link>
                            )}

                            {/* Render Sub Items */}
                            {hasSubItems && isOpen && (
                                <div className="flex flex-col gap-1 mt-1 pl-10 pr-2">
                                    {item.subItems.map(sub => {
                                        const isSubActive = location.pathname === sub.path
                                        return (
                                            <Link
                                                key={sub.path}
                                                to={sub.path}
                                                onClick={closeMobile}
                                                className={`
                                                    block px-3 py-2 rounded-md text-xs font-medium transition-colors
                                                    ${isSubActive 
                                                        ? 'bg-white/60 text-[#5B5FC7] font-bold' 
                                                        : 'text-indigo-900/60 hover:text-indigo-900 hover:bg-white/40'
                                                    }
                                                `}
                                            >
                                                {sub.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-indigo-900/10 mb-2">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-900/70 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogOut
                        size={18}
                        className="text-indigo-900/50 group-hover:text-red-600 transition-colors"
                    />
                    Logout
                </button>
            </div>
        </aside>
    )
}
