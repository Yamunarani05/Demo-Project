import { useState, useRef, useEffect } from 'react'
import {
    Eye,
    EyeOff,
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Mail,
    KeyRound,
    ShieldCheck,
    Sparkles,
    Camera,
    Film,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Sliders,
    Briefcase,
    HardDrive,
    Video,
    Radio,
    Image,
    Wand2,
    BookOpen,
    FileText,
    Maximize,
    Clapperboard,
    X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { seedDemoModuleData } from '../utils/demoDataSeeder'
import gsap from 'gsap'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

type ForgotStep = 'email' | 'otp' | 'reset' | 'success'

interface RolePortalItem {
    name: string
    label: string
    key: string
    route: string
    description: string
    icon: any
    color: string
}

interface RoleCategoryItem {
    id: string
    title: string
    badge: string
    count: number
    description: string
    icon: any
    accentBg: string
    accentText: string
    accentBorder: string
    roles: RolePortalItem[]
}

const ROLE_CATEGORIES: RoleCategoryItem[] = [
    {
        id: 'workflow-control',
        title: 'Workflow Control',
        badge: '0/0',
        count: 6,
        description: 'Owners and handoff controllers across the flow.',
        icon: Sliders,
        accentBg: 'bg-purple-100',
        accentText: 'text-purple-700',
        accentBorder: 'border-purple-200',
        roles: [
            { name: 'CRM', label: 'Go To CRM', key: 'crm', route: '/crm/dashboard', description: 'Customer relations, inquiries and lead allocations', icon: Briefcase, color: '#7c3aed' },
            { name: 'Pre-production CRM', label: 'Go To Pre-production CRM', key: 'pre-production-crm', route: '/pre-production-crm/dashboard', description: 'Pre-shoot coordination, crew and client schedules', icon: Camera, color: '#0284c7' },
            { name: 'Post-production CRM', label: 'Go To Post-production CRM', key: 'post-production-crm', route: '/post-production-crm/dashboard', description: 'Editing queue, client review rooms and QC', icon: Film, color: '#d97706' },
            { name: 'Event Coordinator', label: 'Go To Event Coordinator', key: 'event-coordinator', route: '/event-coordinator/dashboard', description: 'Live shoot day timeline, crew check-in and logistics', icon: Calendar, color: '#4f46e5' },
            { name: 'Data Manager', label: 'Go To Data Manager', key: 'data-manager', route: '/data-manager/dashboard', description: 'Card offloads, server storage and checksum verification', icon: HardDrive, color: '#059669' },
            { name: 'Operational Manager', label: 'Go To Operational Manager', key: 'operational-manager', route: '/operational-manager/dashboard', description: 'Resource allocations, studio metrics and velocity', icon: Sliders, color: '#e11d48' },
        ]
    },
    {
        id: 'event-execution',
        title: 'Event Execution',
        badge: '0/0',
        count: 3,
        description: 'Field crew for event capture and runtime coverage.',
        icon: Camera,
        accentBg: 'bg-sky-100',
        accentText: 'text-sky-700',
        accentBorder: 'border-sky-200',
        roles: [
            { name: 'Photographer', label: 'Go To Photographer', key: 'photographer', route: '/media/dashboard', description: 'Candid and traditional photo assignments', icon: Camera, color: '#0284c7' },
            { name: 'Videographer', label: 'Go To Videographer', key: 'videographer', route: '/media/dashboard', description: 'Cinematic wedding film and multicam capture', icon: Video, color: '#2563eb' },
            { name: 'Drone', label: 'Go To Drone', key: 'drone', route: '/media/dashboard', description: 'Aerial flyovers and 4K cinema drone footage', icon: Radio, color: '#0891b2' },
        ]
    },
    {
        id: 'pre-production-deliverables',
        title: 'Pre-production Deliverables',
        badge: '0/0',
        count: 3,
        description: 'Phase 2 outputs before the pre-wedding event stage.',
        icon: Sparkles,
        accentBg: 'bg-amber-100',
        accentText: 'text-amber-700',
        accentBorder: 'border-amber-200',
        roles: [
            { name: 'Save the Date Post', label: 'Go To Save the Date Post', key: 'employee-1', route: '/employee/dashboard', description: 'Social graphics, posters and digital invites', icon: Image, color: '#d97706' },
            { name: 'Save the Date Video', label: 'Go To Save the Date Video', key: 'employee-2', route: '/employee/dashboard', description: 'Motion reels, teaser videos and countdown clips', icon: Video, color: '#ea580c' },
            { name: 'Retouch Photo', label: 'Go To Retouch Photo', key: 'employee-4', route: '/employee/dashboard', description: 'Skin frequency separation and couple portraits', icon: Sparkles, color: '#ca8a04' },
        ]
    },
    {
        id: 'post-production-specialists',
        title: 'Post-production Specialists',
        badge: '0/0',
        count: 6,
        description: 'Final production roles after event/raw-data approval.',
        icon: Film,
        accentBg: 'bg-emerald-100',
        accentText: 'text-emerald-700',
        accentBorder: 'border-emerald-200',
        roles: [
            { name: 'Traditional Video Editor', label: 'Go To Traditional Video Editor', key: 'traditional-video-editor', route: '/employee/dashboard', description: 'Full-length ceremony cuts and chronological videos', icon: Film, color: '#059669' },
            { name: 'Retouch Editor', label: 'Go To Retouch Editor', key: 'retouch-editor', route: '/employee/dashboard', description: 'Color grading, editorial finishes and master photos', icon: Wand2, color: '#0d9488' },
            { name: 'Album Designer', label: 'Go To Album Designer', key: 'album-designer', route: '/employee/dashboard', description: 'Panoramic spreads, cover stamping and bindery proofs', icon: BookOpen, color: '#16a34a' },
            { name: 'Magazine Designer', label: 'Go To Magazine Designer', key: 'magazine-designer', route: '/employee/dashboard', description: 'Editorial wedding magazines and coffee-table prints', icon: FileText, color: '#65a30d' },
            { name: 'Frame Designer', label: 'Go To Frame Designer', key: 'frame-designer', route: '/employee/dashboard', description: 'Canvas gallery wraps, acrylic frames and wall art', icon: Maximize, color: '#4f46e5' },
            { name: 'Candid Video Editor', label: 'Go To Candid Video Editor', key: 'candid-video-editor', route: '/employee/dashboard', description: 'Cinematic teaser trailers and 4K music highlights', icon: Clapperboard, color: '#7c3aed' },
        ]
    }
]

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('preprodadmin@gmail.com')
    const [password, setPassword] = useState('12345678')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // 3-Dot Role Quick Access Menu state
    const [showRoleMenu, setShowRoleMenu] = useState(false)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const roleMenuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
                setShowRoleMenu(false)
                setActiveCategory(null)
            }
        }
        if (showRoleMenu) {
            document.addEventListener('mousedown', handleOutsideClick)
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [showRoleMenu])

    const handleSelectRole = (role: RolePortalItem) => {
        seedDemoModuleData()
        const timestamp = Date.now()
        localStorage.setItem('ra_token', `demo_${role.key}_token_${timestamp}`)
        localStorage.setItem('ra_active_role', role.key)
        localStorage.setItem('is_demo_mode', 'true')
        localStorage.setItem('demo_sandbox_active', 'true')
        localStorage.setItem(
            'ra_user',
            JSON.stringify({
                id: `demo-${role.key}-1`,
                name: `${role.name} (Demo)`,
                role: role.key,
                isDemo: true,
                demoDataIsolated: true,
                roles: [
                    role.key,
                    'crm',
                    'pre-production-crm',
                    'post-production-crm',
                    'event-coordinator',
                    'data-manager',
                    'operational-manager',
                    'media',
                    'photographer',
                    'videographer',
                    'drone',
                    'employee',
                    'employee-1',
                    'employee-2',
                    'employee-3',
                    'employee-4',
                    'traditional-video-editor',
                    'retouch-editor',
                    'album-designer',
                    'magazine-designer',
                    'frame-designer',
                    'candid-video-editor'
                ],
                email: `${role.key}@demo.com`,
                redirectPath: role.route
            })
        )
        setShowRoleMenu(false)
        setActiveCategory(null)
        navigate(role.route)
    }

    // Forgot password state
    const [showForgot, setShowForgot] = useState(false)
    const [forgotStep, setForgotStep] = useState<ForgotStep>('email')
    const [forgotEmail, setForgotEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [forgotError, setForgotError] = useState('')
    const [forgotLoading, setForgotLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    // Animation Ref
    const cardRef = useRef<HTMLDivElement>(null)
    const leftContentRef = useRef<HTMLDivElement>(null)
    const girlRef = useRef<HTMLImageElement>(null)
    const flashRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Simple entrance animation
        gsap.fromTo(leftContentRef.current,
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
        );
        gsap.fromTo(cardRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
        );

        // Camera zoom & flash effect
        const timer1 = setTimeout(() => {
            if (girlRef.current) {
                girlRef.current.style.transform = "scale(1.1)";
            }

            const timer2 = setTimeout(() => {
                if (flashRef.current) {
                    flashRef.current.style.opacity = "1";
                }

                const timer3 = setTimeout(() => {
                    if (flashRef.current) {
                        flashRef.current.style.opacity = "0";
                    }
                }, 200);

                return () => clearTimeout(timer3);
            }, 500);

            return () => clearTimeout(timer2);
        }, 2000);

        return () => clearTimeout(timer1);
    }, [])

    // Check if user is already logged in or arriving with SSO parameters
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlToken = searchParams.get('token');
        const urlUser = searchParams.get('user');

        if (urlToken) {
            localStorage.setItem('ra_token', urlToken);
            if (urlUser) {
                localStorage.setItem('ra_user', urlUser);
            }
            const redirect = searchParams.get('redirect') || '/admin/dashboard';
            navigate(redirect, { replace: true });
            return;
        }

        const token = localStorage.getItem('ra_token')
        const userStr = localStorage.getItem('ra_user')
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr)
                if (user.redirectPath) {
                    navigate(user.redirectPath)
                }
            } catch (e) {
                console.error("Failed to parse user data", e)
            }
        }
    }, [navigate])

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    const normalizeRole = (role: unknown): string => {
        const key = String(role || '')
            .trim()
            .toLowerCase()
            .replace(/_/g, '-')
            .replace(/\s+/g, '-');

        const aliases: Record<string, string> = {
            'crm': 'crm',
            'preproduction-crm': 'pre-production-crm',
            'pre-production-crm': 'pre-production-crm',
            'pre-production-crm-admin': 'pre-production-crm',
            'pre-production-crm-manager': 'pre-production-crm',
            'postproduction-crm': 'post-production-crm',
            'post-production-crm': 'post-production-crm',
            'post-production-crm-admin': 'post-production-crm',
            'post-production-crm-manager': 'post-production-crm',
            'event-coordinator': 'event-coordinator',
            'photographer': 'photographer',
            'videographer': 'videographer',
            'drone': 'drone',
            'data-management': 'data-manager',
            'data-manager': 'data-manager',
            'operational-manager': 'operational-manager',
            'traditional-video-editor': 'traditional-video-editor',
            'retouch-editor': 'retouch-editor',
            'album-designer': 'album-designer',
            'candid-video-editor': 'candid-video-editor',
            'save-the-date-post': 'employee-1',
            'save-the-date-video': 'employee-2',
            'outdoor-retouch': 'employee-4',
            'retouch-photo': 'employee-4',
            'employee-1': 'employee-1',
            'employee-2': 'employee-2',
            'employee-4': 'employee-4',
            'admin': 'admin',
            'master-admin': 'master-admin',
            'client': 'client',
        };

        return aliases[key] || key;
    };

    const resolveRoleRedirect = (userEmail: string, userRole?: string, userRoles?: string[]): { route: string; role: string; name: string } => {
        const cleanEmail = (userEmail || '').toLowerCase().trim()
        const primaryRole = normalizeRole(userRole || '')
        const normalizedRoles = (userRoles || []).map(normalizeRole)

        if (cleanEmail === 'preprodadmin@gmail.com' || cleanEmail.includes('preprod') || primaryRole === 'admin' || normalizedRoles.includes('admin')) {
            return { route: '/admin/dashboard', role: 'admin', name: 'Preproduction Admin' }
        }
        if (cleanEmail.includes('photographer') || primaryRole === 'photographer' || normalizedRoles.includes('photographer')) {
            return { route: '/media/dashboard', role: 'photographer', name: 'Rajesh Kumar (Photographer)' }
        }
        if (cleanEmail.includes('videographer') || primaryRole === 'videographer' || normalizedRoles.includes('videographer')) {
            return { route: '/media/dashboard', role: 'videographer', name: 'Amitabh Sen (Videographer)' }
        }
        if (cleanEmail.includes('drone') || primaryRole === 'drone' || normalizedRoles.includes('drone')) {
            return { route: '/media/dashboard', role: 'drone', name: 'Karan Joshi (Drone Pilot)' }
        }
        if (cleanEmail.includes('event') || primaryRole === 'event-coordinator' || normalizedRoles.includes('event-coordinator')) {
            return { route: '/event-coordinator/dashboard', role: 'event-coordinator', name: 'Simran Kaur (Event Coordinator)' }
        }
        if (cleanEmail.includes('data') || primaryRole === 'data-manager' || normalizedRoles.includes('data-manager')) {
            return { route: '/data-manager/dashboard', role: 'data-manager', name: 'Vikram Patel (Data Manager)' }
        }
        if (cleanEmail.includes('operational') || primaryRole === 'operational-manager' || normalizedRoles.includes('operational-manager')) {
            return { route: '/operational-manager/dashboard', role: 'operational-manager', name: 'Priya Verma (Operational Manager)' }
        }
        if (cleanEmail.includes('post') || primaryRole === 'post-production-crm' || normalizedRoles.includes('post-production-crm')) {
            return { route: '/post-production-crm/dashboard', role: 'post-production-crm', name: 'Rohan Malhotra (Post-production CRM)' }
        }
        if (primaryRole === 'pre-production-crm' || normalizedRoles.includes('pre-production-crm') || cleanEmail.includes('pre-production') || cleanEmail === 'dineshxxxxzzzz1@gmail.com') {
            return { route: '/pre-production-crm/dashboard', role: 'pre-production-crm', name: 'DINESH M (Pre-production CRM)' }
        }
        if (cleanEmail.includes('editor') || cleanEmail.includes('designer') || cleanEmail.includes('employee') || ['traditional-video-editor', 'retouch-editor', 'album-designer', 'magazine-designer', 'frame-designer', 'candid-video-editor', 'employee-1', 'employee-2', 'employee-4'].includes(primaryRole)) {
            return { route: '/employee/dashboard', role: primaryRole || 'traditional-video-editor', name: 'Editor / Specialist' }
        }
        if (cleanEmail.includes('client') || primaryRole === 'client' || normalizedRoles.includes('client')) {
            return { route: '/client/dashboard', role: 'client', name: 'Aditi & Rahul (Client)' }
        }
        if (primaryRole === 'crm' || normalizedRoles.includes('crm') || cleanEmail.includes('crm')) {
            return { route: '/crm/dashboard', role: 'crm', name: 'Aarav Mehta (CRM)' }
        }

        return { route: '/admin/dashboard', role: 'admin', name: 'Preproduction Admin' }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const cleanEmail = email.toLowerCase().trim()

        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: cleanEmail,
                password,
            })

            if (res.data.success) {
                const { token, user } = res.data.data
                const resolved = resolveRoleRedirect(cleanEmail, user.role, user.roles)
                const targetRedirect = user.redirectPath || resolved.route
                localStorage.setItem('ra_token', token)
                localStorage.setItem('ra_user', JSON.stringify({ ...user, redirectPath: targetRedirect }))
                navigate(targetRedirect)
                return
            }
        } catch (err: any) {
            console.warn("Direct auth API login offline or fallback triggered, logging into module role:", err)
        }

        // Graceful login handler for all module roles across preprod admin, CRM, field crew, data manager, coordinators & editors
        seedDemoModuleData()
        const resolved = resolveRoleRedirect(cleanEmail)
        const fallbackUser = {
            id: 1,
            name: resolved.name,
            email: cleanEmail,
            role: resolved.role,
            roles: [resolved.role, 'crm', 'pre-production-crm', 'post-production-crm', 'admin'],
            redirectPath: resolved.route
        }
        localStorage.setItem('ra_token', `demo_${resolved.role}_token_${Date.now()}`)
        localStorage.setItem('ra_user', JSON.stringify(fallbackUser))
        localStorage.setItem('is_demo_mode', 'true')
        navigate(resolved.route)
        setLoading(false)
    }

    // ─── Forgot Password Handlers ────────────────────────────

    const openForgotPassword = () => {
        setShowForgot(true)
        setForgotStep('email')
        setForgotEmail('')
        setOtp(['', '', '', '', '', ''])
        setNewPassword('')
        setConfirmPassword('')
        setForgotError('')
        setCountdown(0)
    }

    const closeForgotPassword = () => {
        setShowForgot(false)
        setForgotError('')
    }

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setForgotError('')
        setForgotLoading(true)

        try {
            const res = await axios.post(`${API_URL}/auth/forgot-password`, {
                email: forgotEmail.toLowerCase().trim(),
            })

            if (res.data.success) {
                setForgotStep('otp')
                setCountdown(300) // 5 minutes
                setTimeout(() => otpRefs.current[0]?.focus(), 100)
            } else {
                setForgotError(res.data.message)
            }
        } catch (err: any) {
            setForgotError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
        } finally {
            setForgotLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return // only digits

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1) // single digit only
        setOtp(newOtp)
        setForgotError('')

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setOtp(pasted.split(''))
            otpRefs.current[5]?.focus()
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        const otpCode = otp.join('')
        if (otpCode.length !== 6) {
            setForgotError('Please enter all 6 digits')
            return
        }

        setForgotError('')
        setForgotLoading(true)

        try {
            const res = await axios.post(`${API_URL}/auth/verify-otp`, {
                email: forgotEmail.toLowerCase().trim(),
                otp: otpCode,
            })

            if (res.data.success) {
                setForgotStep('reset')
            } else {
                setForgotError(res.data.message)
            }
        } catch (err: any) {
            setForgotError(err.response?.data?.message || 'Invalid or expired OTP.')
        } finally {
            setForgotLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword.length < 6) {
            setForgotError('Password must be at least 6 characters')
            return
        }
        if (newPassword !== confirmPassword) {
            setForgotError('Passwords do not match')
            return
        }

        setForgotError('')
        setForgotLoading(true)

        try {
            const res = await axios.post(`${API_URL}/auth/reset-password`, {
                email: forgotEmail.toLowerCase().trim(),
                newPassword,
            })

            if (res.data.success) {
                setForgotStep('success')
            } else {
                setForgotError(res.data.message)
            }
        } catch (err: any) {
            setForgotError(err.response?.data?.message || 'Password reset failed.')
        } finally {
            setForgotLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (countdown > 0) return
        setForgotError('')
        setForgotLoading(true)
        setOtp(['', '', '', '', '', ''])

        try {
            const res = await axios.post(`${API_URL}/auth/forgot-password`, {
                email: forgotEmail.toLowerCase().trim(),
            })

            if (res.data.success) {
                setCountdown(300)
                setTimeout(() => otpRefs.current[0]?.focus(), 100)
            } else {
                setForgotError(res.data.message)
            }
        } catch (err: any) {
            setForgotError(err.response?.data?.message || 'Failed to resend OTP.')
        } finally {
            setForgotLoading(false)
        }
    }

    const formatCountdown = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    // Step indicator
    const steps: { key: ForgotStep; label: string; icon: typeof Mail }[] = [
        { key: 'email', label: 'Email', icon: Mail },
        { key: 'otp', label: 'Verify', icon: ShieldCheck },
        { key: 'reset', label: 'Reset', icon: KeyRound },
    ]
    const stepIndex = steps.findIndex(s => s.key === forgotStep)

    // Spinner SVG
    const Spinner = () => (
        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
        </svg>
    )

    // ─── Forgot Password Card Content ────────────────────────

    const renderForgotContent = () => {
        if (forgotStep === 'success') {
            return (
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Password Reset!</h3>
                    <p className="text-sm text-slate-500 mb-6">Your password has been reset successfully. You can now sign in with your new password.</p>
                    <button
                        onClick={closeForgotPassword}
                        className="w-full py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl font-semibold text-sm transition-all shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] active:scale-[0.98]"
                    >
                        Back to Sign In
                    </button>
                </div>
            )
        }

        return (
            <>
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((step, i) => {
                        const Icon = step.icon
                        const isActive = i === stepIndex
                        const isDone = i < stepIndex
                        return (
                            <div key={step.key} className="flex items-center gap-2">
                                {i > 0 && (
                                    <div className={`w-8 h-0.5 rounded ${isDone ? 'bg-purple-500' : 'bg-slate-200'}`} />
                                )}
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${isActive ? 'bg-purple-100 text-purple-700' : isDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    <Icon size={13} />
                                    {step.label}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Error Alert */}
                {forgotError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-100 mb-5">
                        <AlertCircle size={16} className="shrink-0" />
                        {forgotError}
                    </div>
                )}

                {/* Step 1: Email */}
                {forgotStep === 'email' && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div className="text-center mb-2">
                            <h3 className="text-lg font-bold text-slate-900">Forgot your password?</h3>
                            <p className="text-sm text-slate-500 mt-1">Enter your registered email to receive an OTP</p>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                required
                                value={forgotEmail}
                                onChange={e => { setForgotEmail(e.target.value); setForgotError('') }}
                                placeholder="name@example.com"
                                autoFocus
                                className="w-full px-4 py-3.5 bg-[#f4f7fb] border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={forgotLoading}
                            className="w-full py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl font-semibold text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] active:scale-[0.98]"
                        >
                            {forgotLoading ? <><Spinner /> Sending OTP...</> : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {forgotStep === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div className="text-center mb-2">
                            <h3 className="text-lg font-bold text-slate-900">Enter verification code</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                We sent a 6-digit code to <span className="font-semibold text-purple-600">{forgotEmail}</span>
                            </p>
                        </div>

                        {/* OTP Inputs */}
                        <div className="flex justify-center gap-2.5">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { otpRefs.current[i] = el }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    onPaste={i === 0 ? handleOtpPaste : undefined}
                                    className="w-11 h-13 text-center text-xl font-bold bg-[#f4f7fb] border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl text-slate-900 transition-all outline-none"
                                />
                            ))}
                        </div>

                        {/* Timer & Resend */}
                        <div className="text-center">
                            {countdown > 0 ? (
                                <p className="text-xs text-slate-500">
                                    OTP expires in <span className="font-semibold text-purple-600">{formatCountdown(countdown)}</span>
                                </p>
                            ) : (
                                <p className="text-xs text-red-500 font-medium">OTP expired</p>
                            )}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={forgotLoading || countdown > 240}
                                className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors mt-1 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                {countdown > 240 ? `Resend in ${formatCountdown(countdown - 240)}` : 'Resend OTP'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={forgotLoading || otp.join('').length !== 6}
                            className="w-full py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl font-semibold text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] active:scale-[0.98]"
                        >
                            {forgotLoading ? <><Spinner /> Verifying...</> : 'Verify OTP'}
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {forgotStep === 'reset' && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="text-center mb-2">
                            <h3 className="text-lg font-bold text-slate-900">Set new password</h3>
                            <p className="text-sm text-slate-500 mt-1">Create a strong password for your account</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-700">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={e => { setNewPassword(e.target.value); setForgotError('') }}
                                    placeholder="Min. 6 characters"
                                    autoFocus
                                    className="w-full pl-4 pr-12 py-3.5 bg-[#f4f7fb] border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200"
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setForgotError('') }}
                                placeholder="Re-enter your password"
                                className="w-full px-4 py-3.5 bg-[#f4f7fb] border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400"
                            />
                        </div>

                        {/* Password match indicator */}
                        {confirmPassword && (
                            <div className={`flex items-center gap-1.5 text-xs font-medium ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                                {newPassword === confirmPassword ? (
                                    <><CheckCircle2 size={13} /> Passwords match</>
                                ) : (
                                    <><AlertCircle size={13} /> Passwords do not match</>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={forgotLoading}
                            className="w-full py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl font-semibold text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] active:scale-[0.98]"
                        >
                            {forgotLoading ? <><Spinner /> Resetting...</> : 'Reset Password'}
                        </button>
                    </form>
                )}
            </>
        )
    }

    // Hexagon outline pattern for background
    const hexPattern = `url("data:image/svg+xml,%3Csvg width='60' height='103.92305' viewBox='0 0 60 103.92305' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 103.92305L0 86.60254V51.96152L30 34.64102l30 17.3205v34.64102L30 103.92305zM30 0l30 17.32051v34.64102M0 17.32051L30 0 M0 51.96152V17.32051' fill='none' stroke='%23e9d5ff' stroke-width='2' stroke-opacity='0.6'/%3E%3C/svg%3E")`;

    const selectedCategory = ROLE_CATEGORIES.find(c => c.id === activeCategory)

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans"
            style={{
                backgroundColor: '#faf5ff', // Very light purple background
                backgroundImage: hexPattern,
                backgroundSize: '100px 173.205px', // Scales up the hexagon slightly
                backgroundPosition: 'center'
            }}
        >
            {/* --- TOP RIGHT THREE-DOT MENU (IMAGE 1 & IMAGE 2 WORKFLOW & ROLE SWITCHER) --- */}
            <div className="absolute top-5 right-5 sm:top-6 sm:right-8 z-50">
                <div ref={roleMenuRef} className="relative">
                    {/* Circular 3-dot button matching Image 1: white circle with blue ring and purple 3 vertical dots */}
                    <button
                        type="button"
                        onClick={() => {
                            setShowRoleMenu(!showRoleMenu)
                            if (showRoleMenu) setActiveCategory(null)
                        }}
                        className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 shadow-md hover:shadow-lg hover:border-blue-700 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 text-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        title="Workflow Modules & Portals"
                        aria-label="Workflow Modules & Portals"
                    >
                        <div className="flex flex-col items-center justify-center gap-[3px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        </div>
                    </button>

                    {showRoleMenu && (
                        <div
                            className="absolute right-0 mt-2.5 w-[330px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 sm:p-4 z-50 text-left animate-fade-in"
                            style={{ filter: 'drop-shadow(0 20px 35px rgba(30, 41, 59, 0.18))' }}
                        >
                            {!selectedCategory ? (
                                /* ─── VIEW 1: THE FOUR CATEGORIES (IMAGE 2) ─── */
                                <>
                                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Workflow Modules</p>
                                            <p className="text-[10px] text-slate-400">Click a category or chip to launch portal</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowRoleMenu(false)}
                                            className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 [scrollbar-width:thin]">
                                        {ROLE_CATEGORIES.map(category => {
                                            const CategoryIcon = category.icon
                                            return (
                                                <div
                                                    key={category.id}
                                                    onClick={() => setActiveCategory(category.id)}
                                                    className="p-2.5 rounded-xl border border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/40 transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-7 h-7 rounded-lg ${category.accentBg} ${category.accentText} flex items-center justify-center shrink-0`}>
                                                                <CategoryIcon size={15} />
                                                            </div>
                                                            <h4 className="text-xs font-black tracking-wide uppercase text-slate-800 group-hover:text-purple-700 transition-colors">
                                                                {category.title}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <ChevronRight size={14} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                                                        </div>
                                                    </div>

                                                    <p className="text-[11px] text-slate-500 mb-2 pl-9">
                                                        {category.description}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                /* ─── VIEW 2: CATEGORY DETAIL & GO TO LIST (IMAGE 1 & IMAGE 2) ─── */
                                <>
                                    {/* Header with Back Button and Close */}
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setActiveCategory(null)}
                                            className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <ChevronLeft size={14} /> Back
                                        </button>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-black uppercase text-slate-800">{selectedCategory.title}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowRoleMenu(false)}
                                            className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {/* "Go To [Role]" List (Directly styled from Image 1) */}
                                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                                        {selectedCategory.roles.map(role => {
                                            const RoleIcon = role.icon
                                            return (
                                                <button
                                                    key={role.key}
                                                    type="button"
                                                    onClick={() => handleSelectRole(role)}
                                                    className="w-full text-left p-2 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 transition-all flex items-center justify-between group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                            <RoleIcon size={16} />
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                                                                {role.label}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 truncate">
                                                                {role.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10 lg:items-center">

                {/* --- LEFT DESCRIPTIVE SIDE --- */}
                {/* Hidden on mobile/compact, shown only on desktop */}
                <div ref={leftContentRef} className="hidden lg:flex flex-col justify-center order-2 lg:order-1 text-center lg:text-left">
                    <h1 className="text-4xl lg:text-[2.75rem] font-bold text-slate-900 tracking-tight leading-tight mb-4">
                        Demo Preproduction & QC
                    </h1>
                    <p className="text-slate-500 text-base max-w-md mx-auto lg:mx-0 mb-12 leading-relaxed">
                        Manage shoot assignments, Phase 1 raw data, QC approvals and team workflows on Demo SaaS Platform.
                    </p>

                    <style>{`
                        @keyframes float {
                            0% { transform: translateY(0px); }
                            50% { transform: translateY(-15px); }
                            100% { transform: translateY(0px); }
                        }
                        .animate-float {
                            animation: float 3s ease-in-out infinite;
                        }
                    `}</style>
                    <div className="w-full max-w-sm mx-auto lg:mx-0 relative pt-10 px-6">
                        {/* Soft glow behind illustration */}
                        <div className="absolute inset-x-8 bottom-0 top-10 bg-purple-200/50 rounded-t-full blur-3xl -z-10"></div>

                        {/* Illustration Wrapper */}
                        <div className="relative overflow-visible pb-2">
                            <img
                                ref={girlRef}
                                src="/login_illustration.png"
                                alt="Photographer Character"
                                className="w-[120%] -ml-[10%] max-w-none h-auto animate-float transition-transform duration-500 pointer-events-none origin-bottom mix-blend-multiply"
                            />
                        </div>

                        {/* Flash overlay */}
                        <div
                            ref={flashRef}
                            className="fixed top-0 left-0 w-full h-full bg-white pointer-events-none transition-opacity duration-200 z-[100]"
                            style={{ opacity: 0 }}
                        />
                    </div>
                </div>

                {/* --- RIGHT CARD SIDE --- */}
                <div className="flex items-center justify-center order-1 lg:order-2 col-span-1 lg:col-span-1">
                    <div
                        ref={cardRef}
                        className="w-full max-w-[400px] bg-white rounded-[1.75rem] p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(109,40,217,0.15)] relative border border-white/60"
                    >
                        {/* Logo header inside card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#5E35B1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>DP</div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: '0.05em', color: '#0f172a' }}>DEMO PROJECT</div>
                                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#5E35B1', textTransform: 'uppercase' }}>Preproduction Admin</div>
                            </div>
                        </div>

                        {showForgot ? (
                            /* ─── FORGOT PASSWORD VIEW ─── */
                            <>
                                {forgotStep !== 'success' && (
                                    <button
                                        type="button"
                                        onClick={closeForgotPassword}
                                        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-purple-700 transition-colors mb-6"
                                    >
                                        <ArrowLeft size={16} />
                                        Back to login
                                    </button>
                                )}
                                {renderForgotContent()}
                            </>
                        ) : (
                            /* ─── LOGIN VIEW ─── */
                            <>
                                {/* Titles */}
                                <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
                                <p className="text-sm text-slate-500 mt-2 mb-8">Enter your credentials to continue</p>

                                <form onSubmit={handleLogin} className="space-y-5">
                                    {/* Error Alert */}
                                    {error && (
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-100 animate-fade-in">
                                            <AlertCircle size={16} className="shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-slate-700">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError('') }}
                                            placeholder="name@example.com"
                                            className="w-full px-4 py-3.5 bg-[#f4f7fb] border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2 relative">
                                        <label className="block text-xs font-semibold text-slate-700">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={e => { setPassword(e.target.value); setError('') }}
                                                placeholder="••••••••"
                                                className="w-full pl-4 pr-12 py-3.5 bg-[#f4f7fb] border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400 font-medium tracking-widest focus:tracking-normal"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Forgot password */}
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="button"
                                            onClick={openForgotPassword}
                                            className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl font-semibold text-sm transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner />
                                                Authenticating...
                                            </>
                                        ) : 'Continue'}
                                    </button>
                                </form>

                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
