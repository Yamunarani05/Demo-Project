import { Bell, Phone, FileText, Download, Building2, User, Mail, Compass, Camera, Film, ChevronRight, Clock, IndianRupee } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
if (API_URL.includes("5001")) API_URL = API_URL.replace("5001", "5002");

const timeAgo = (dateInput: string | Date | undefined | null) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 30) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return '1 month ago';
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    const diffInYears = Math.floor(diffInDays / 365);
    if (diffInYears === 1) return '1 year ago';
    return `${diffInYears} years ago`;
};

const formatTime12Hour = (dateInput: string | Date | undefined | null) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

export default function Dashboard() {
    const [clientDetails, setClientDetails] = useState<any>({
        name: 'Loading...',
        company: 'Red Angle Studio',
        contactPerson: '-',
        email: '-',
        phone: '-',
        package: '-',
        location: '-',
        startDate: '-',
        status: 'Loading...'
    });

    const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('ra_token');
                if (!token) return;

                const meRes = await axios.get(`${API_URL}/client-auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (meRes.data.success) {
                    const lead = meRes.data.data;
                    setClientDetails({
                        name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Client',
                        company: lead.companyName || 'Red Angle Studio',
                        contactPerson: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Client',
                        email: lead.email || '-',
                        phone: lead.contactNumber || lead.phone || lead.contact || '-',
                        package: lead.eventType || 'Event',
                        location: lead.address || lead.location || '-',
                        startDate: lead.eventDate ? new Date(lead.eventDate).toLocaleDateString() : 'TBD',
                        status: lead.currentStage || 'Processing'
                    });
                }

                try {
                    const notifRes = await axios.get(`${API_URL}/client-notifications`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (notifRes.data?.success && Array.isArray(notifRes.data.data)) {
                        setRecentNotifications(notifRes.data.data.slice(0, 5));
                    } else if (Array.isArray(notifRes.data)) {
                        setRecentNotifications(notifRes.data.slice(0, 5));
                    }
                } catch (notifErr) {
                    console.error("Notifications fetch error (non-fatal)", notifErr);
                }

            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
        };

        fetchDashboardData();
    }, []);

    const handleMarkAllRead = () => {
        setRecentNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };
    return (
        <div className="pb-20 max-w-6xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Project Overview</h1>
                    <p className="text-slate-500 mt-2 text-lg">Welcome back. Here is the high-level summary of your project.</p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100 shadow-sm">
                    <span className="relative flex h-2.5 w-2.5 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                    </span>
                    Status: {clientDetails.status}
                </div>
            </div>

            {/* QUICK ACTIONS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/client/tracker" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative overflow-hidden flex flex-col justify-between aspect-square">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                        <Compass size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Timeline</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Track production</p>
                    </div>
                </Link>

                <Link to="/client/preproduction" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-200 transition-all group relative overflow-hidden flex flex-col justify-between aspect-square">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
                        <Camera size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Preproduction</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Shoot details</p>
                    </div>
                </Link>

                <Link to="/client/postproduction" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group relative overflow-hidden flex flex-col justify-between aspect-square">
                    <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                        <Film size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Review Edits</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Action required</p>
                    </div>
                </Link>

                <Link to="/client/invoice" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group relative overflow-hidden flex flex-col justify-between aspect-square">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                        <IndianRupee size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Financials</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Invoices & Calls</p>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* 2. DETAILS SECTION */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 pb-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <FileText size={20} />
                            </div>
                            Project Details
                        </h2>
                    </div>

                    <div className="p-8 bg-slate-50/50 flex-1 space-y-6">
                        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1.5">Package Selected</h3>
                            <p className="font-extrabold text-slate-900 text-lg">{clientDetails.package}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors min-w-0">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                    <Building2 size={18} className="text-slate-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Company</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5 truncate" title={clientDetails.company || "Red Angle Studio"}>
                                        {clientDetails.company || "Red Angle Studio"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors min-w-0">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                    <User size={18} className="text-slate-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Contact Person</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5 truncate" title={clientDetails.contactPerson}>{clientDetails.contactPerson}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors min-w-0">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                    <Mail size={18} className="text-slate-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Email</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5 truncate break-all" title={clientDetails.email}>{clientDetails.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors min-w-0">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                    <Phone size={18} className="text-slate-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Phone</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5 truncate" title={clientDetails.phone}>{clientDetails.phone}</p>
                                </div>
                            </div>
                        </div>

                        <Link to="/client/quotation" className="mt-4 w-full py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 group">
                            <Download size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" /> View Proposal / Contract
                        </Link>
                    </div>
                </div>

                {/* 2. NOTIFICATION SECTION */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-8 pb-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                <Bell size={20} />
                            </div>
                            Recent Activity
                        </h2>
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            Mark all read
                        </button>
                    </div>

                    <div className="p-8 bg-slate-50/50 flex-1 space-y-4">
                        {recentNotifications.length === 0 ? (
                            <div className="py-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                                    <Bell size={24} />
                                </div>
                                <h3 className="font-bold text-slate-700 text-lg">All Caught Up</h3>
                                <p className="text-sm text-slate-500 mt-1">No recent activity to show here.</p>
                            </div>
                        ) : (
                            recentNotifications.map(nav => (
                                <div key={nav.id} className={`p-5 rounded-2xl border flex items-center gap-4 transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer group ${nav.is_read === false ? 'bg-white border-orange-200 hover:shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${nav.is_read === false ? 'bg-orange-500 animate-pulse' : 'bg-transparent'}`} />
                                    <div className="flex-1">
                                        <p className={`text-sm ${nav.is_read === false ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>{nav.title}</p>
                                        <p className="text-xs text-slate-500 mt-1.5 font-medium flex items-center gap-1.5">
                                            <Clock size={12} className="text-slate-400" /> {nav.created_at ? `${timeAgo(nav.created_at)}${formatTime12Hour(nav.created_at) ? ` (${formatTime12Hour(nav.created_at)})` : ''}` : ''}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
