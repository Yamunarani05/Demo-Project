import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
    Camera,
    Calendar,
    Film,
    Download,
    CheckCircle2,
    ChevronLeft,
    MapPin,
    Users,
    Clock,
    AlertCircle,
    ArrowRight,
    Video,
    Sparkles,
    Eye,
    MessageSquare,
    Play,
    Pause,
    Volume2,
    ShieldCheck,
    Share2,
    Package,
    Truck,
    HardDrive,
    ExternalLink,
    Copy,
    Check,
    FileText,
    BadgeCheck,
    Send
} from 'lucide-react'

// Workflow stage configuration
const STAGES = [
    {
        id: 0,
        key: 'preproduction',
        title: 'Preproduction',
        shortDesc: 'Planning, Venue & Crew',
        badge: 'Phase 1',
        icon: Camera,
        color: 'sky'
    },
    {
        id: 1,
        key: 'event',
        title: 'Event Shoot',
        shortDesc: 'Live Execution & Ingestion',
        badge: 'Phase 2',
        icon: Calendar,
        color: 'purple'
    },
    {
        id: 2,
        key: 'postproduction',
        title: 'Postproduction',
        shortDesc: 'Cuts, Retouch & Approvals',
        badge: 'Phase 3',
        icon: Film,
        color: 'amber'
    },
    {
        id: 3,
        key: 'delivery',
        title: 'Final Delivery',
        shortDesc: 'Master Files & Shipment',
        badge: 'Phase 4',
        icon: Download,
        color: 'emerald'
    }
]

// Sample Real Production Data for Client
const CLIENT_PROJECT = {
    id: 'PRJ-2026-884',
    title: 'The Royal Wedding & Reception',
    clientName: 'Acme / Sarah & Michael',
    dates: 'October 12 - 14, 2026',
    venue: 'Grand Taj Palace & Heritage Gardens',
    city: 'Downtown Waterfront',
    package: 'Royal Signature Cinema & Editorial Photo (4K Ultra HD)',
    status: 'In Active Production'
}

// Stage 1 Data: Pre-Events & Confirmed Crew
const PRE_EVENTS_DATA = [
    {
        id: 1,
        title: 'Sangeet & Musical Night',
        date: 'Oct 12, 2026',
        time: '06:00 PM - 11:30 PM',
        venue: 'Grand Taj Palace, Crystal Ballroom',
        address: '45 Serenity Route, Downtown',
        crew: '2 Cinematographers, 2 Candid Photographers',
        notes: 'Choreographed couple entrance at 07:30 PM. Audio feed from master sound console.',
        status: 'CONFIRMED'
    },
    {
        id: 2,
        title: 'Haldi & Mehendi Celebration',
        date: 'Oct 13, 2026',
        time: '10:00 AM - 03:30 PM',
        venue: "Bride's Courtyard Residence",
        address: '12 Maple Avenue, Palm Grove',
        crew: '1 Lead Photographer, 1 Candid Video Specialist',
        notes: 'Natural sunlight and yellow floral aesthetics. Drone aerial portraits scheduled for 11:00 AM.',
        status: 'CONFIRMED'
    },
    {
        id: 3,
        title: 'Grand Wedding & Royal Reception',
        date: 'Oct 14, 2026',
        time: '04:00 PM - 12:30 AM',
        venue: 'The Heritage Gardens & Pavilion',
        address: '100 Heritage Lane, Upstate Valley',
        crew: 'Lead Cinema Director, 2 Traditional Cameras, 2 Candid Photo, 1 DGCA Drone Pilot',
        notes: 'Mandap ceremony at sunset (05:45 PM). Pyrotechnics during cake cutting.',
        status: 'CONFIRMED'
    }
]

const CONFIRMED_CREW = [
    {
        name: 'Rahul Kumar',
        role: 'Lead Cinematographer',
        exp: '8 Years &bull; 120+ Weddings',
        gear: 'Sony FX6 Cinema Camera + G-Master Primes',
        badge: 'Confirmed On-Site',
        avatar: 'RK'
    },
    {
        name: 'Vikram Sinha',
        role: 'Candid Video Director',
        exp: '6 Years &bull; Award-winning cuts',
        gear: 'Sony A7S III + DJI RS3 Pro Gimbal',
        badge: 'Confirmed On-Site',
        avatar: 'VS'
    },
    {
        name: 'Kavitha Rao',
        role: 'Lead Editorial Photographer',
        exp: '7 Years &bull; Vogue Featured',
        gear: 'Canon R5 + 50mm f/1.2 & 85mm f/1.2',
        badge: 'Confirmed On-Site',
        avatar: 'KR'
    },
    {
        name: 'Amit Shah',
        role: 'Certified Drone Pilot (DGCA)',
        exp: '5 Years &bull; 400+ Flight Hours',
        gear: 'DJI Inspire 3 (8K Full Frame Cinema)',
        badge: 'Airspace Cleared',
        avatar: 'AS'
    }
]

// Stage 2 Data: Live Shoot Timeline & Raw Ingestion
const SHOOT_TIMELINE = [
    { time: '07:30 AM', title: 'Crew Call Time & Equipment Diagnostics', status: 'completed', detail: 'All 6 crew members on-site at Taj Palace. Sensor checks & timecode sync verified.' },
    { time: '09:00 AM', title: 'Bride & Groom Prep & Detail Macro Shots', status: 'completed', detail: 'Outfits, jewelry, handwritten vows, and bride/groom portraits captured.' },
    { time: '11:30 AM', title: 'First Look Reveal & Private Couple Session', status: 'completed', detail: 'Secret garden first look. 4K dual-camera high frame rate capture.' },
    { time: '02:00 PM', title: 'Family Portraits & Baraat Procession', status: 'completed', detail: 'Energetic drone flyovers + ground gimbal coverage of baraat arrival.' },
    { time: '05:30 PM', title: 'Mandap Ceremony & Sunset Vows', status: 'completed', detail: 'Direct feed audio capture of vows + 3-point multicam recording.' },
    { time: '09:00 PM', title: 'Reception Performances, Speeches & Fireworks', status: 'completed', detail: 'Live stage audio sync + 360-degree guest candid captures.' },
    { time: '11:45 PM', title: 'Shoot Wrap & Memory Card Ingestion Protocol', status: 'completed', detail: 'Zero lost data. Secure dual-SSD offloading completed.' }
]

const INGESTION_STATS = [
    { label: 'Raw Photos Captured', count: '3,480 Files', format: 'Lossless RAW (.CR3 / .ARW)', status: 'Ingested & Verified', size: '142 GB' },
    { label: '4K Cinema Video', count: '8.4 Hours', format: '10-bit 4:2:2 ProRes & XAVC-S', status: 'Ingested & Proxies Made', size: '512 GB' },
    { label: 'Aerial Drone Takes', count: '42 Takes', format: '4K D-Log M 60fps', status: 'Color Space Tagged', size: '68 GB' },
    { label: 'Audio Multitrack', count: '6 Master Tracks', format: '32-bit Float 48kHz WAV', status: 'Noise Reduced & Synced', size: '18 GB' }
]

// Stage 3 Data: Retouched Photos & Album Spreads
const SAMPLE_RETOUCHED_PHOTOS = [
    { id: 1, title: 'Golden Hour Sunset Couple', tag: 'Portraits', ratio: '3:2' },
    { id: 2, title: 'Bridal First Look Emotion', tag: 'Candid', ratio: '3:2' },
    { id: 3, title: 'Mandap Sacred Fire Ritual', tag: 'Ceremony', ratio: '3:2' },
    { id: 4, title: 'Sangeet Choreography Spin', tag: 'Candid', ratio: '3:2' },
    { id: 5, title: 'Baraat Celebration Fireworks', tag: 'Ceremony', ratio: '3:2' },
    { id: 6, title: 'Editorial Jewelry & Details', tag: 'Portraits', ratio: '3:2' }
]

export default function ClientWorkflow() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    // Read current step from query params (default: 0)
    const stepParam = parseInt(searchParams.get('step') || '0', 10)
    const currentStep = isNaN(stepParam) || stepParam < 0 || stepParam > 3 ? 0 : stepParam

    const setStep = (newStep: number) => {
        const target = Math.max(0, Math.min(3, newStep))
        setSearchParams({ step: String(target) })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Stage 3 Interactive States
    const [videoPlaying, setVideoPlaying] = useState(false)
    const [videoApproved, setVideoApproved] = useState(false)
    const [showRevisionForm, setShowRevisionForm] = useState(false)
    const [revisionTimestamp, setRevisionTimestamp] = useState('01:14')
    const [revisionNotes, setRevisionNotes] = useState('')
    const [revisionSubmitted, setRevisionSubmitted] = useState(false)
    const [approvedPhotos, setApprovedPhotos] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true })
    const [albumSpreadIndex, setAlbumSpreadIndex] = useState(0)
    const [albumApproved, setAlbumApproved] = useState(false)
    const [photoFilter, setPhotoFilter] = useState<'all' | 'Portraits' | 'Candid' | 'Ceremony'>('all')

    // Stage 4 Interactive States
    const [copiedShareLink, setCopiedShareLink] = useState(false)
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null)

    // Ensure demo auth session exists when loading this page
    useEffect(() => {
        const token = localStorage.getItem('ra_token')
        if (!token) {
            localStorage.setItem('ra_token', 'client_demo_token')
            localStorage.setItem(
                'ra_user',
                JSON.stringify({
                    id: 'demo-client',
                    name: 'Sarah & Michael',
                    role: 'client',
                    roles: ['client'],
                    email: 'client@demo.com',
                    redirectPath: '/client/workflow'
                })
            )
        }
    }, [])

    const handleCopyLink = () => {
        navigator.clipboard.writeText('https://demostudio.com/gallery/royal-wedding-2026?pin=8842')
        setCopiedShareLink(true)
        setTimeout(() => setCopiedShareLink(false), 2500)
    }

    const handleSimulateDownload = (fileId: string) => {
        setDownloadingFile(fileId)
        setTimeout(() => {
            setDownloadingFile(null)
            alert(`Download initialized for ${fileId}! Master files are transferring.`)
        }, 1200)
    }

    const handleApproveVideo = () => {
        setVideoApproved(true)
        setShowRevisionForm(false)
    }

    const handleSendRevision = (e: React.FormEvent) => {
        e.preventDefault()
        if (!revisionNotes.trim()) return
        setRevisionSubmitted(true)
        setTimeout(() => {
            setShowRevisionForm(false)
            setRevisionSubmitted(false)
            setRevisionNotes('')
        }, 2000)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-24 font-sans text-slate-800">
            {/* --- TOP PERSISTENT WORKFLOW CONTROL HEADER --- */}
            <div className="bg-white rounded-3xl border border-purple-100/80 shadow-md p-5 sm:p-6 sticky top-20 z-20 backdrop-blur-md bg-white/95 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                Real Client Workflow
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                                Project #{CLIENT_PROJECT.id}
                            </span>
                            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {CLIENT_PROJECT.status}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            {CLIENT_PROJECT.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Client: <span className="font-semibold text-slate-700">{CLIENT_PROJECT.clientName}</span> &bull; {CLIENT_PROJECT.dates} &bull; {CLIENT_PROJECT.city}
                        </p>
                    </div>

                    {/* Quick navigation and primary Continue button */}
                    <div className="flex items-center gap-2.5 self-start lg:self-center">
                        <button
                            type="button"
                            onClick={() => navigate('/client/dashboard')}
                            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-all hidden sm:flex items-center gap-1 cursor-pointer"
                            title="Go to standard dashboard"
                        >
                            <span>Dashboard</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(currentStep - 1)}
                            disabled={currentStep === 0}
                            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        {/* THE PROMINENT CONTINUE BUTTON */}
                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={() => setStep(currentStep + 1)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Continue to {STAGES[currentStep + 1]?.title}</span>
                                <ArrowRight size={16} className="animate-pulse" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setStep(0)}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <CheckCircle2 size={16} />
                                <span>Completed &bull; Restart Tour</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* --- 4-STEP INTERACTIVE WORKFLOW STEPPER TABS --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-4">
                    {STAGES.map((stage) => {
                        const Icon = stage.icon
                        const isActive = currentStep === stage.id
                        const isPast = currentStep > stage.id

                        return (
                            <button
                                key={stage.id}
                                type="button"
                                onClick={() => setStep(stage.id)}
                                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-start gap-3 ${
                                    isActive
                                        ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-400/20 shadow-sm'
                                        : isPast
                                        ? 'bg-slate-50/90 border-emerald-200/80 hover:bg-slate-100/80 text-slate-700'
                                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500'
                                }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black shadow-sm ${
                                        isActive
                                            ? 'bg-purple-600 text-white shadow-purple-500/30'
                                            : isPast
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    {isPast ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isActive ? 'text-purple-700' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                                            {stage.badge}
                                        </span>
                                        {isActive && (
                                            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                                        )}
                                    </div>
                                    <p className={`text-xs font-black truncate mt-0.5 ${isActive ? 'text-purple-950' : 'text-slate-800'}`}>
                                        {stage.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                                        {stage.shortDesc}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* STAGE 0: PREPRODUCTION CLIENT VIEW */}
            {/* ========================================================================= */}
            {currentStep === 0 && (
                <div className="space-y-6 animate-fade-in">
                    {/* Stage Hero Banner */}
                    <div className="bg-gradient-to-br from-sky-600 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sky-100 text-xs font-bold uppercase tracking-wider">
                                    <Camera size={14} /> Stage 1: Preproduction & Shoot Planning
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                                    Confirmed Itinerary & Field Crew
                                </h2>
                                <p className="text-sm text-sky-100/90 leading-relaxed">
                                    All pre-events, dates, shoot timings, and gear packages have been locked with your Project Manager. Review your confirmed crew details below.
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shrink-0 text-center md:text-right space-y-1">
                                <p className="text-xs uppercase tracking-widest text-sky-200 font-bold">Planning Status</p>
                                <p className="text-xl font-black text-white flex items-center justify-center md:justify-end gap-2">
                                    <CheckCircle2 size={20} className="text-emerald-400" /> Locked & Dispatched
                                </p>
                                <p className="text-xs text-sky-100/70">Assigned CRM: Sneha Mehta</p>
                            </div>
                        </div>
                    </div>

                    {/* Pre-events Cards */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Calendar size={18} className="text-sky-600" />
                                Scheduled Events & Locations ({PRE_EVENTS_DATA.length})
                            </h3>
                            <span className="text-xs text-slate-500">All venues inspected & confirmed</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {PRE_EVENTS_DATA.map((ev) => (
                                <div
                                    key={ev.id}
                                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-sky-100 text-sky-700">
                                                {ev.status}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500">{ev.date}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                                            {ev.title}
                                        </h4>
                                        <div className="space-y-2 text-xs text-slate-600 pt-1">
                                            <div className="flex items-start gap-2">
                                                <Clock size={14} className="text-sky-500 shrink-0 mt-0.5" />
                                                <span>{ev.time}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-bold text-slate-800">{ev.venue}</p>
                                                    <p className="text-[11px] text-slate-400">{ev.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Users size={14} className="text-purple-500 shrink-0 mt-0.5" />
                                                <span className="font-medium text-purple-900">{ev.crew}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/60 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
                                        <strong className="block text-[10px] uppercase font-bold text-amber-800 mb-0.5">Special Directive:</strong>
                                        {ev.notes}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Assigned Crew Section */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Users size={20} className="text-purple-600" />
                                    Assigned Production Team Roster
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Dedicated lead photographers, cinematographers, and aerial drone specialists for your dates.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full self-start border border-purple-200">
                                4 Specialists Assigned
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {CONFIRMED_CREW.map((crew, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-purple-300 hover:bg-white transition-all space-y-3 shadow-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                                            {crew.avatar}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 leading-tight">{crew.name}</h4>
                                            <p className="text-xs font-bold text-purple-700">{crew.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-200/60 pt-2">
                                        <p className="font-semibold text-slate-700">{crew.exp}</p>
                                        <p className="text-slate-500 line-clamp-2">Gear: {crew.gear}</p>
                                    </div>
                                    <div className="pt-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                                            <BadgeCheck size={12} /> {crew.badge}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Creative Preferences & Location Map */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <FileText size={18} className="text-indigo-600" />
                                Confirmed Shot-list & Creative Questionnaire
                            </h3>
                            <div className="space-y-2.5 text-xs">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <span className="font-medium text-slate-700">Cinematography Style</span>
                                    <span className="font-bold text-indigo-700">Cinematic 2.39:1 Anamorphic & Warm Tone</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <span className="font-medium text-slate-700">Must-Have Shot #1</span>
                                    <span className="font-bold text-indigo-700">Private First Look & Vow Exchange</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <span className="font-medium text-slate-700">Must-Have Shot #2</span>
                                    <span className="font-bold text-indigo-700">Sunset Drone Flyover over Heritage Garden</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <span className="font-medium text-slate-700">Music Preference</span>
                                    <span className="font-bold text-indigo-700">Modern Acoustic / Romantic Orchestral</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Venue Map */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <MapPin size={18} className="text-rose-500" />
                                Primary Venue: Grand Taj Palace
                            </h3>
                            <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 relative">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    src="https://maps.google.com/maps?q=Grand+Palace+Waterfront&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                    title="Venue Location"
                                />
                            </div>
                            <p className="text-xs text-slate-500 flex items-center justify-between">
                                <span>Entry via East Gate &bull; Reserved Media Parking Confirmed</span>
                                <span className="font-bold text-purple-700">Site Recce Completed</span>
                            </p>
                        </div>
                    </div>

                    {/* Preproduction Bottom Continue Callout */}
                    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-black text-sky-800 uppercase tracking-widest bg-sky-100 px-2.5 py-1 rounded">
                                Ready for Shoot Day?
                            </span>
                            <h3 className="text-xl font-black text-slate-900 mt-2">
                                Preproduction planning is complete!
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                Click Continue below to see how live event execution, team tracking, and raw media card ingestion work.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-md hover:shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                            <span>Continue to Event Shoot Stage</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 1: EVENT SHOOT CLIENT VIEW */}
            {/* ========================================================================= */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                    {/* Stage Hero Banner */}
                    <div className="bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-purple-100 text-xs font-bold uppercase tracking-wider">
                                    <Calendar size={14} /> Stage 2: Event Shoot & Data Ingestion
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                                    Live Shoot Execution & Media Ingestion
                                </h2>
                                <p className="text-sm text-purple-100/90 leading-relaxed">
                                    View real-time shoot day logs, crew check-in verifications, and memory card uploads offloaded directly to our secure studio RAID servers.
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shrink-0 text-center md:text-right space-y-1">
                                <p className="text-xs uppercase tracking-widest text-purple-200 font-bold">Execution Status</p>
                                <p className="text-xl font-black text-white flex items-center justify-center md:justify-end gap-2">
                                    <CheckCircle2 size={20} className="text-emerald-400" /> Shoot Wrapped & 100% Ingested
                                </p>
                                <p className="text-xs text-purple-200/80">Zero Corrupt Files &bull; MD5 Checksum Passed</p>
                            </div>
                        </div>
                    </div>

                    {/* Ingestion Metric Counters */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {INGESTION_STATS.map((stat, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-purple-300 transition-all space-y-2"
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-bold">{stat.format}</span>
                                    <span className="text-purple-700 font-black bg-purple-50 px-2 py-0.5 rounded">
                                        {stat.size}
                                    </span>
                                </div>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.count}</p>
                                <p className="text-xs font-bold text-slate-600">{stat.label}</p>
                                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 pt-1 border-t border-slate-100">
                                    <CheckCircle2 size={12} /> {stat.status}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Live Shoot Day Timeline & Crew Check-in Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Timeline Column */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Clock size={20} className="text-purple-600" />
                                    Wedding Day Execution Milestones
                                </h3>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                    All 7 Milestones Completed
                                </span>
                            </div>

                            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-100">
                                {SHOOT_TIMELINE.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4 relative">
                                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 z-10 shadow-sm mt-0.5">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-200/70 hover:bg-white hover:border-purple-200 transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                                                <span className="text-xs font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded w-fit">
                                                    {item.time}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Crew Ingestion & Data Manager Validation Sidebar */}
                        <div className="space-y-6">
                            {/* Data Manager Certificate */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-200 p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                                        <ShieldCheck size={26} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-indigo-950">Data Manager Verification</h4>
                                        <p className="text-xs font-semibold text-indigo-700">QC Approved by Arjun Nair</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs text-slate-600 bg-white/80 rounded-2xl p-4 border border-indigo-100">
                                    <div className="flex items-center justify-between">
                                        <span>Checksum Integrity</span>
                                        <span className="font-black text-emerald-600">100% Valid (MD5)</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Primary Server Storage</span>
                                        <span className="font-bold text-slate-800">PixStudio NVMe RAID 5</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Cloud Cold Vault</span>
                                        <span className="font-bold text-slate-800">AWS S3 Glacier Deep Archive</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Post-production Handshake</span>
                                        <span className="font-black text-purple-700">Handed to Lead Editor</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 text-center">
                                    Footage securely verified and indexed on October 15, 2026.
                                </p>
                            </div>

                            {/* Camera Memory Card Offload Logs */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    <HardDrive size={18} className="text-purple-600" />
                                    Card Offload Verification
                                </h4>
                                <div className="space-y-2.5 text-xs">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">Cam A (Sony FX6) &bull; 160GB</p>
                                            <p className="text-[10px] text-slate-400">CFexpress Type A &bull; Verified</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700">DONE</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">Cam B (Sony A7S III) &bull; 128GB</p>
                                            <p className="text-[10px] text-slate-400">V90 SDXC UHS-II &bull; Verified</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700">DONE</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">Photo A & B (Canon R5) &bull; 140GB</p>
                                            <p className="text-[10px] text-slate-400">CFexpress Type B &bull; Verified</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700">DONE</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">Drone Air SSD &bull; 64GB</p>
                                            <p className="text-[10px] text-slate-400">ProRes RAW &bull; Verified</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700">DONE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Event Shoot Bottom Continue Callout */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest bg-purple-100 px-2.5 py-1 rounded">
                                Footage Ingested
                            </span>
                            <h3 className="text-xl font-black text-slate-900 mt-2">
                                Ready to review video cuts & retouched photos?
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                Click Continue below to enter the Postproduction review room with live video draft approval and photo proofs.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md hover:shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                            <span>Continue to Postproduction Stage</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 2: POSTPRODUCTION CLIENT VIEW */}
            {/* ========================================================================= */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                    {/* Stage Hero Banner */}
                    <div className="bg-gradient-to-br from-amber-600 via-rose-700 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold uppercase tracking-wider">
                                    <Film size={14} /> Stage 3: Postproduction Editing & Client Approvals
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                                    Video Cuts, Retouch Proofs & Approvals
                                </h2>
                                <p className="text-sm text-amber-100/90 leading-relaxed">
                                    Review your 4K Highlight Teaser draft, approve retouched wedding portraits, and review photobook album spreads before final rendering.
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shrink-0 text-center md:text-right space-y-1">
                                <p className="text-xs uppercase tracking-widest text-amber-200 font-bold">Review Pipeline</p>
                                <p className="text-xl font-black text-white flex items-center justify-center md:justify-end gap-2">
                                    <Sparkles size={20} className="text-amber-300" /> Action Required: Client Review
                                </p>
                                <p className="text-xs text-amber-100/80">Draft V1 Ready &bull; 45 Retouched Photos</p>
                            </div>
                        </div>
                    </div>

                    {/* INTERACTIVE VIDEO PLAYER & APPROVAL MODULE */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                        Draft Cut V1
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">Duration: 02:45 &bull; 4K 60fps</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900">
                                    Royal Wedding Cinematic Teaser
                                </h3>
                            </div>
                            <div>
                                {videoApproved ? (
                                    <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-xs">
                                        <CheckCircle2 size={16} /> Cut Approved by Client
                                    </span>
                                ) : (
                                    <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold">
                                        Pending Client Review
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Video Player Mock Screen */}
                        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-[440px] flex items-center justify-center border border-slate-800 group shadow-inner">
                            {/* Ambient Video Background Simulation */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950 opacity-90" />

                            <div className="relative z-10 text-center space-y-3 p-6">
                                <button
                                    type="button"
                                    onClick={() => setVideoPlaying(!videoPlaying)}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xl border border-white/30 mx-auto"
                                >
                                    {videoPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                                </button>
                                <div>
                                    <p className="text-sm sm:text-base font-black text-white">
                                        {videoPlaying ? 'Playing: Wedding Teaser (V1 Cut 4K)' : 'Click to Play Cinematic Teaser (V1 Cut)'}
                                    </p>
                                    <p className="text-xs text-purple-200/80">
                                        Graded in DaVinci Resolve Studio &bull; Sound Design: 5.1 Surround
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Video Controls Bar */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between text-white text-xs z-10">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setVideoPlaying(!videoPlaying)}
                                        className="hover:text-purple-400 transition-colors"
                                    >
                                        {videoPlaying ? <Pause size={18} /> : <Play size={18} />}
                                    </button>
                                    <Volume2 size={18} className="text-slate-400" />
                                    <span className="font-mono text-[11px]">01:14 / 02:45</span>
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
                                        <div className="bg-purple-500 h-full w-[45%]" />
                                    </div>
                                </div>
                                <span className="font-bold text-purple-300 text-[11px]">4K ULTRA HD</span>
                            </div>
                        </div>

                        {/* Interactive Approval & Revision Action Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleApproveVideo}
                                className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    videoApproved
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:scale-[1.01]'
                                }`}
                            >
                                <CheckCircle2 size={18} />
                                <span>{videoApproved ? 'Cut Approved & Ready for Master' : 'Approve This Video Cut'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowRevisionForm(!showRevisionForm)}
                                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs sm:text-sm border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <MessageSquare size={18} />
                                <span>{showRevisionForm ? 'Close Revision Box' : 'Request Revision / Changes'}</span>
                            </button>
                        </div>

                        {/* Revision Feedback Form */}
                        {showRevisionForm && (
                            <form
                                onSubmit={handleSendRevision}
                                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <AlertCircle size={15} className="text-amber-500" />
                                        Submit Timestamped Revision Request
                                    </h4>
                                    <span className="text-[10px] text-slate-400">Turnaround: 24-48 Hours</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    <div className="sm:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                            Video Timestamp
                                        </label>
                                        <input
                                            type="text"
                                            value={revisionTimestamp}
                                            onChange={(e) => setRevisionTimestamp(e.target.value)}
                                            placeholder="e.g. 01:24"
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                            Requested Change / Correction Notes
                                        </label>
                                        <input
                                            type="text"
                                            value={revisionNotes}
                                            onChange={(e) => setRevisionNotes(e.target.value)}
                                            placeholder="e.g. Please swap the song to the acoustic version at this transition"
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowRevisionForm(false)}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Send size={13} />
                                        <span>Send to Video Editor</span>
                                    </button>
                                </div>

                                {revisionSubmitted && (
                                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 pt-1">
                                        <CheckCircle2 size={14} /> Revision submitted! Editor Vikram Sinha notified.
                                    </p>
                                )}
                            </form>
                        )}
                    </div>

                    {/* PHOTO RETOUCHING PROOFING GALLERY */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Eye size={20} className="text-purple-600" />
                                    Master Photo Retouching Proofs
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    High-res skin smoothing, color balance, and editorial grading.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {(['all', 'Portraits', 'Candid', 'Ceremony'] as const).map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setPhotoFilter(tag)}
                                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            photoFilter === tag
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Photo Proof Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {SAMPLE_RETOUCHED_PHOTOS.filter((p) => photoFilter === 'all' || p.tag === photoFilter).map((photo) => {
                                const isApproved = approvedPhotos[photo.id]

                                return (
                                    <div
                                        key={photo.id}
                                        className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-md transition-all group"
                                    >
                                        <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 relative flex items-center justify-center text-white p-4">
                                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-purple-200">
                                                {photo.tag}
                                            </div>
                                            <div className="text-center space-y-1">
                                                <Camera size={28} className="mx-auto text-purple-300 opacity-80" />
                                                <p className="text-xs font-bold text-white/90">{photo.title}</p>
                                                <p className="text-[10px] text-purple-200/60">300 DPI &bull; Print Ready</p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
                                            <span className="text-xs font-semibold text-slate-700">
                                                Photo #{photo.id}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setApprovedPhotos((prev) => ({ ...prev, [photo.id]: !prev[photo.id] }))}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                                    isApproved
                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {isApproved ? <Check size={13} /> : null}
                                                <span>{isApproved ? 'Approved' : 'Approve Proof'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* PHOTOBOOK ALBUM DESIGN SPREADS */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Package size={20} className="text-amber-600" />
                                    Custom Leather Photobook Spreads Review
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    12x18 Flush-Mount Panoramic Album Layout &bull; 40 Spreads (80 Pages)
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAlbumApproved(!albumApproved)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                    albumApproved
                                        ? 'bg-emerald-100 text-emerald-800 shadow-xs'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20'
                                }`}
                            >
                                <CheckCircle2 size={16} />
                                <span>{albumApproved ? 'Album Layout Approved' : 'Approve Full Photobook'}</span>
                            </button>
                        </div>

                        {/* Interactive Flipbook Spread Simulation */}
                        <div className="bg-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 border border-slate-200">
                            <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl border border-slate-300 aspect-[2/1] p-6 flex items-center justify-between relative overflow-hidden">
                                <div className="w-1/2 h-full border-r border-slate-200 pr-4 flex flex-col justify-center items-center text-center space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Left Page ({albumSpreadIndex * 2 + 1})</span>
                                    <div className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-center text-xs text-slate-400">
                                        Panoramic Couple Portrait
                                    </div>
                                </div>
                                <div className="w-1/2 h-full pl-4 flex flex-col justify-center items-center text-center space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Right Page ({albumSpreadIndex * 2 + 2})</span>
                                    <div className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-center text-xs text-slate-400">
                                        Mandap Ceremony Details
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setAlbumSpreadIndex((prev) => Math.max(0, prev - 1))}
                                    disabled={albumSpreadIndex === 0}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold disabled:opacity-40"
                                >
                                    &larr; Previous Spread
                                </button>
                                <span className="text-xs font-bold text-slate-600">
                                    Spread {albumSpreadIndex + 1} of 20
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setAlbumSpreadIndex((prev) => Math.min(19, prev + 1))}
                                    disabled={albumSpreadIndex === 19}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold disabled:opacity-40"
                                >
                                    Next Spread &rarr;
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Postproduction Bottom Continue Callout */}
                    <div className="bg-gradient-to-r from-amber-50 to-purple-50 border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest bg-amber-100 px-2.5 py-1 rounded">
                                Approvals Complete
                            </span>
                            <h3 className="text-xl font-black text-slate-900 mt-2">
                                Ready to access final deliverables & tracking?
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                Click Continue below to access your master 4K download center, online cloud vault, and live courier tracking.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(3)}
                            className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md hover:shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                            <span>Continue to Final Delivery Stage</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 3: FINAL DELIVERY CLIENT VIEW */}
            {/* ========================================================================= */}
            {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                    {/* Stage Hero Banner */}
                    <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold uppercase tracking-wider">
                                    <Download size={14} /> Stage 4: Final Deliverables & Archival
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                                    Master 4K Downloads & Keepsake Shipment
                                </h2>
                                <p className="text-sm text-emerald-100/90 leading-relaxed">
                                    Your full production assets have been rendered in Ultra HD. Download your cloud files below and track your handcrafted photobook courier.
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shrink-0 text-center md:text-right space-y-1">
                                <p className="text-xs uppercase tracking-widest text-emerald-200 font-bold">Delivery Status</p>
                                <p className="text-xl font-black text-white flex items-center justify-center md:justify-end gap-2">
                                    <CheckCircle2 size={20} className="text-emerald-300" /> Fully Delivered & Active
                                </p>
                                <p className="text-xs text-emerald-100/80">Vault Active for 10 Years</p>
                            </div>
                        </div>
                    </div>

                    {/* DIGITAL DOWNLOAD VAULT */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Download size={20} className="text-emerald-600" />
                                    Master Download Center (High Speed Direct Server)
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Direct gigabit downloads hosted on Amazon CloudFront with high reliability.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                4 Master Archives Available
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Download Item 1 */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-white transition-all flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Video size={16} className="text-emerald-600" />
                                        <h4 className="text-sm font-black text-slate-900">
                                            Cinematic Wedding Film (4K ProRes)
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Runtime: 24 mins &bull; 3840x2160 &bull; 18.4 GB Master
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSimulateDownload('Cinematic Film 4K')}
                                    disabled={downloadingFile === 'Cinematic Film 4K'}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer shrink-0"
                                >
                                    <Download size={14} />
                                    <span>{downloadingFile === 'Cinematic Film 4K' ? 'Connecting...' : 'Download'}</span>
                                </button>
                            </div>

                            {/* Download Item 2 */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-white transition-all flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Camera size={16} className="text-emerald-600" />
                                        <h4 className="text-sm font-black text-slate-900">
                                            All Retouched Photos (High-Res ZIP)
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        450 Selected Master Photos &bull; 300 DPI &bull; 8.2 GB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSimulateDownload('Master Photos ZIP')}
                                    disabled={downloadingFile === 'Master Photos ZIP'}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer shrink-0"
                                >
                                    <Download size={14} />
                                    <span>{downloadingFile === 'Master Photos ZIP' ? 'Connecting...' : 'Download'}</span>
                                </button>
                            </div>

                            {/* Download Item 3 */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-white transition-all flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-emerald-600" />
                                        <h4 className="text-sm font-black text-slate-900">
                                            Social Media Reel & Short Cuts Pack
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        6 Vertical 9:16 Reels for Instagram & WhatsApp &bull; 1.8 GB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSimulateDownload('Social Reels Pack')}
                                    disabled={downloadingFile === 'Social Reels Pack'}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer shrink-0"
                                >
                                    <Download size={14} />
                                    <span>{downloadingFile === 'Social Reels Pack' ? 'Connecting...' : 'Download'}</span>
                                </button>
                            </div>

                            {/* Download Item 4 */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-white transition-all flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Film size={16} className="text-emerald-600" />
                                        <h4 className="text-sm font-black text-slate-900">
                                            Full Length Ceremony Documentation
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Runtime: 2h 40m &bull; Complete Traditional Vows & Sangeet &bull; 34 GB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSimulateDownload('Full Ceremony')}
                                    disabled={downloadingFile === 'Full Ceremony'}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer shrink-0"
                                >
                                    <Download size={14} />
                                    <span>{downloadingFile === 'Full Ceremony' ? 'Connecting...' : 'Download'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PHYSICAL SHIPMENT TRACKING & ONLINE SHAREABLE VAULT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Courier Tracking */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <Truck size={18} className="text-indigo-600" />
                                    Physical Keepsake & Photobook Courier
                                </h3>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                    Out For Delivery
                                </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-indigo-900">Carrier: BlueDart Express Air</span>
                                    <span className="font-mono font-bold text-indigo-700">BLD-982410582-IN</span>
                                </div>
                                <p className="text-xs text-slate-600">
                                    Contents: Handcrafted Italian Leather Photobook (12x18) + Engraved Crystal USB Box
                                </p>
                            </div>

                            <div className="space-y-3 pt-2 text-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="font-bold text-slate-800">Today, 09:30 AM:</span>
                                    <span className="text-slate-600">Out for delivery with delivery agent Rajesh K.</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                    <span className="font-semibold text-slate-500">Yesterday, 06:15 PM:</span>
                                    <span className="text-slate-500">Arrived at City Central Sort Facility</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                    <span className="font-semibold text-slate-500">Oct 26:</span>
                                    <span className="text-slate-500">Dispatched from Studio Bindery</span>
                                </div>
                            </div>
                        </div>

                        {/* Online Cloud Sharing & Guest Gallery Link */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <Share2 size={18} className="text-purple-600" />
                                    Private Cloud Gallery for Family & Guests
                                </h3>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                                    PIN Protected
                                </span>
                            </div>

                            <p className="text-xs text-slate-500">
                                Share this direct mobile link with wedding guests so they can view, favorite, and download high-res photos on any smartphone.
                            </p>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                                <code className="text-xs font-mono text-purple-900 truncate">
                                    https://demostudio.com/gallery/royal-wedding-2026?pin=8842
                                </code>
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                    {copiedShareLink ? <Check size={14} /> : <Copy size={14} />}
                                    <span>{copiedShareLink ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                                <span>Guest PIN: <strong className="font-mono text-slate-900">8842</strong></span>
                                <span className="text-purple-700 font-bold flex items-center gap-1 cursor-pointer">
                                    Open Web Gallery <ExternalLink size={12} />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Celebratory Completion Banner */}
                    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Full Client Production Workflow Completed!
                        </h3>
                        <p className="text-sm text-purple-200/90 max-w-xl mx-auto leading-relaxed">
                            You have walked through all 4 modules: Preproduction Planning, Event Execution & Ingestion, Postproduction Cuts & Approvals, and Final 4K Master Delivery.
                        </p>
                        <div className="pt-3 flex items-center justify-center gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setStep(0)}
                                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-black text-xs sm:text-sm hover:bg-slate-100 transition-all cursor-pointer shadow-md"
                            >
                                ↺ Restart Workflow Tour (Stage 1)
                            </button>
                            <Link
                                to="/client/dashboard"
                                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                            >
                                Go to Client Dashboard &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* --- STICKY BOTTOM PROGRESS / CONTINUE BAR --- */}
            <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 sm:p-4 z-40 shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                            {currentStep + 1}/4
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-xs font-black text-slate-900">
                                Current Stage: {STAGES[currentStep]?.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                {currentStep < 3 ? `Next: ${STAGES[currentStep + 1]?.title}` : 'All stages complete'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setStep(currentStep - 1)}
                            disabled={currentStep === 0}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
                        >
                            <ChevronLeft size={16} />
                            <span>Back</span>
                        </button>

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={() => setStep(currentStep + 1)}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Continue to {STAGES[currentStep + 1]?.title}</span>
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setStep(0)}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <CheckCircle2 size={16} />
                                <span>Done (Restart)</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
