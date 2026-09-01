import { useState, useEffect } from 'react';
import { ExternalLink, Send, Scissors, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function Retouch() {
    const [retouchCount, setRetouchCount] = useState('');
    const [imageNumbers, setImageNumbers] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRawDataApproved, setIsRawDataApproved] = useState(false);
    const [driveLink, setDriveLink] = useState<string | null>(null);
    const [videoDriveLink, setVideoDriveLink] = useState<string | null>(null);
    const [finalDelivery, setFinalDelivery] = useState<{driveLink?: string|null, videoDriveLink?: string|null, notes?: string} | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectQuery, setRejectQuery] = useState('');
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const token = localStorage.getItem('ra_token');
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
                const res = await axios.get(`${API_URL}/preproduction/raw-data-links?type=Retouch`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data?.success) {
                    setDriveLink(res.data.data?.driveLink || null);
                    setVideoDriveLink(res.data.data?.videoDriveLink || null);
                    if (res.data.data?.isRawDataApproved) {
                        setIsRawDataApproved(true);
                    }
                    if (res.data.data?.requirements) {
                        const reqs = res.data.data.requirements;
                        if (reqs.referenceLink) {
                            setRetouchCount(reqs.referenceLink.replace(/^Quantity:\s*/, ''));
                        }
                        if (reqs.imageNumbers) {
                            setImageNumbers(reqs.imageNumbers);
                        }
                    }
                    if (res.data.data?.finalDelivery) {
                        setFinalDelivery(res.data.data.finalDelivery);
                    } else {
                        setFinalDelivery(null);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch raw data links", err);
            }
        };
        fetchLinks();
    }, []);

    const handleApproveRawData = async () => {
        setIsRawDataApproved(true);
        try {
            const token = localStorage.getItem('ra_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
            await axios.post(`${API_URL}/preproduction/approve-raw-data`, {
                projectType: 'Retouch'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Raw data approved. Media team notified.");
        } catch (err: any) {
            console.error("Failed to approve raw data", err);
            setIsRawDataApproved(false);
            toast.error("Failed to approve raw data. Please try again.");
        }
    };

    const handleSendToEditor = async () => {
        if (!retouchCount.trim()) {
            toast.error("Please specify how many photos you need retouched.");
            return;
        }
        if (!imageNumbers.trim()) {
            toast.error("Please enter the image numbers.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('ra_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
            await axios.post(`${API_URL}/preproduction/requirements`, {
                projectType: 'Retouching',
                referenceLink: `Quantity: ${retouchCount}`,
                imageNumbers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Retouch details sent to the editor successfully!");
            setRetouchCount('');
            setImageNumbers('');
        } catch (err: any) {
            console.error("Failed to send details", err);
            toast.error(err.response?.data?.message || "Failed to send details to editor");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleApproveFinalDelivery = async () => {
        try {
            const token = localStorage.getItem('ra_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
            await axios.post(`${API_URL}/preproduction/approve-final-delivery`, {
                projectType: 'Retouch'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Final delivery approved successfully!");
            if (finalDelivery) {
                setFinalDelivery({ ...finalDelivery, notes: (finalDelivery.notes || '') + ' [Retouch_Final_Approved]' });
            }
        } catch (err: any) {
            console.error("Failed to approve final delivery", err);
            toast.error("Failed to approve final delivery. Please try again.");
        }
    };

    const handleRejectFinalDelivery = async () => {
        if (!rejectQuery.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }
        try {
            const token = localStorage.getItem('ra_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
            await axios.post(`${API_URL}/preproduction/reject-final-delivery`, {
                projectType: 'Retouch',
                query: rejectQuery
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Feedback submitted. The team will review it shortly.");
            setIsRejectModalOpen(false);
            setRejectQuery('');
            if (finalDelivery) {
                setFinalDelivery({ ...finalDelivery, notes: (finalDelivery.notes || '') + ' [Retouch_Rejected]' });
            }
        } catch (err: any) {
            console.error("Failed to submit feedback", err);
            toast.error("Failed to submit feedback. Please try again.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Retouch Selection</h1>
                    <p className="text-slate-500 mt-1">Review raw data and provide instructions for photo retouching.</p>
                </div>
            </div>

            {finalDelivery ? (
                <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Check size={100} />
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0"><Check size={16} /></span>
                        Final Delivery Ready
                    </h2>
                    <p className="text-sm text-slate-500 mb-6 flex-1">
                        {finalDelivery.notes || 'Your final deliverables have been processed and are ready for download.'}
                    </p>
                    
                    <div className="flex flex-col gap-3 mt-auto">
                        {finalDelivery.driveLink ? (
                            <a href={finalDelivery.driveLink} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-4 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all text-indigo-700 font-medium text-sm">
                                <div className="flex items-center gap-3 truncate">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <Scissors size={20} className="text-indigo-600" />
                                    </div>
                                    <span className="truncate text-base">Retouch Delivery Link</span>
                                </div>
                                <ExternalLink size={18} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                            </a>
                        ) : null}
                    </div>

                    {finalDelivery.notes?.includes('[Retouch_Final_Approved]') ? (
                        <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                <Check size={16} />
                            </div>
                            <div>
                                <span className="font-bold text-green-800 text-sm block">Delivery Approved</span>
                                <span className="text-green-600 text-xs">Thank you for approving this final delivery.</span>
                            </div>
                        </div>
                    ) : finalDelivery.notes?.includes('[Retouch_Rejected]') ? (
                        <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200">
                            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                                <AlertCircle size={16} />
                            </div>
                            <div>
                                <span className="font-bold text-orange-800 text-sm block">Query Raised</span>
                                <span className="text-orange-600 text-xs">Waiting for the CRM to review your query.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 flex items-center gap-4">
                            <button 
                                onClick={handleApproveFinalDelivery}
                                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                            >
                                Approve
                            </button>
                            <button 
                                onClick={() => setIsRejectModalOpen(true)}
                                className="flex-1 px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold text-sm rounded-xl transition-colors"
                            >
                                Reject & Raise Query
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Section 1: Drive Link */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Scissors size={100} />
                    </div>
                    
                    <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                        Raw Data Link
                    </h2>
                    <p className="text-sm text-slate-500 mb-6 flex-1">
                        Review the uploaded raw media to select which ones you want professionally retouched.
                    </p>
                    
                    <div className="flex flex-col gap-3 mt-auto">
                        {driveLink ? (
                            <a href={driveLink} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all text-indigo-700 font-medium text-sm">
                                <div className="flex items-center gap-3 truncate">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <ExternalLink size={16} className="text-indigo-600" />
                                    </div>
                                    <span className="truncate">Photography Raw Data</span>
                                </div>
                            </a>
                        ) : null}

                        {videoDriveLink ? (
                            <a href={videoDriveLink} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-3.5 rounded-xl bg-pink-50 border border-pink-100 hover:bg-pink-100 hover:border-pink-200 transition-all text-pink-700 font-medium text-sm">
                                <div className="flex items-center gap-3 truncate">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <ExternalLink size={16} className="text-pink-600" />
                                    </div>
                                    <span className="truncate">Videography Raw Data</span>
                                </div>
                            </a>
                        ) : null}

                        {!driveLink && !videoDriveLink ? (
                            <div className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 font-medium text-sm opacity-70">
                                <div className="flex items-center gap-3 truncate">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <ExternalLink size={16} className="text-slate-300" />
                                    </div>
                                    <span className="truncate">No link uploaded yet</span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                    
                    {/* Approval Button */}
                    {!isRawDataApproved ? (
                        <div className="mt-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200 border-dashed gap-3">
                            <p className="text-sm text-slate-500 text-center">Please review the raw photos and approve to proceed to the next steps.</p>
                            <button 
                                onClick={handleApproveRawData}
                                disabled={!driveLink && !videoDriveLink}
                                className="px-6 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Approve Raw Data
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                <Check size={16} />
                            </div>
                            <div>
                                <span className="font-bold text-green-800 text-sm block">Raw Data Approved</span>
                                <span className="text-green-600 text-xs">You can now proceed to submit your selection.</span>
                            </div>
                            <button 
                                onClick={() => setIsRawDataApproved(false)}
                                className="ml-auto text-xs text-green-700 hover:underline font-medium"
                            >
                                Undo
                            </button>
                        </div>
                    )}
                </div>

                {/* Section 2: Quantity Input */}
                <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col transition-all ${!isRawDataApproved ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''}`}>
                    <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                        Retouch Quantity
                    </h2>
                    <p className="text-sm text-slate-500 mb-6 flex-1">
                        How many photos do you need retouched? (e.g., 15, 20)
                    </p>

                    <div className="mt-auto">
                        <input 
                            type="text"
                            value={retouchCount}
                            onChange={(e) => setRetouchCount(e.target.value)}
                            placeholder="Enter number (e.g., 15 to 20)"
                            disabled={!isRawDataApproved}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm text-slate-700 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        />
                    </div>
                </div>

                {/* Section 3: Image Selection */}
                <div className={`md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col transition-all ${!isRawDataApproved ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''}`}>
                    <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                        Submit Image Numbers
                    </h2>
                    <p className="text-sm text-slate-500 mb-4">
                        Type the file numbers of the images you want to be retouched based on your quantity above.
                    </p>

                    <div className="flex-1 flex flex-col">
                        <textarea 
                            value={imageNumbers}
                            onChange={(e) => setImageNumbers(e.target.value)}
                            placeholder="Enter image numbers here...&#10;Example: IMG_1405, IMG_1406, IMG_1410"
                            disabled={!isRawDataApproved}
                            className="w-full flex-1 min-h-[120px] p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none text-sm text-slate-700 mb-4 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        />
                        
                        <div className="flex justify-end">
                            <button 
                                onClick={handleSendToEditor}
                                disabled={isSubmitting || !isRawDataApproved}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5B5FC7] text-white font-bold text-sm hover:bg-[#4f46e5] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/20"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                                Send to Editor
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            )}

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Raise a Query</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Please let us know what changes are required for the retouched photos. Be as specific as possible.
                            </p>
                            <textarea 
                                value={rejectQuery}
                                onChange={(e) => setRejectQuery(e.target.value)}
                                placeholder="E.g., The skin smoothing is too heavy, and please brighten the background..."
                                className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all resize-none text-sm text-slate-700 mb-6 outline-none"
                            />
                            <div className="flex items-center gap-3 justify-end">
                                <button 
                                    onClick={() => { setIsRejectModalOpen(false); setRejectQuery(''); }}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium text-sm rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleRejectFinalDelivery}
                                    disabled={!rejectQuery.trim()}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Query
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
