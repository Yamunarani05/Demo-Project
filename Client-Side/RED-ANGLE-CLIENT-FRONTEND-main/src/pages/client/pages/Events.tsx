import { useState, useEffect } from 'react';
import { ExternalLink, Send, Camera, Link as LinkIcon, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Events() {
    const [traditionalRef, setTraditionalRef] = useState('');
    const [traditionalSel, setTraditionalSel] = useState('');
    const [candidRef, setCandidRef] = useState('');
    const [candidSel, setCandidSel] = useState('');
    const [retouchRef, setRetouchRef] = useState('');
    const [retouchSel, setRetouchSel] = useState('');
    const [albumRef, setAlbumRef] = useState('');
    const [albumSel, setAlbumSel] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isApproved, setIsApproved] = useState(false);
    const [isRawDataApproved, setIsRawDataApproved] = useState(false);
    const [pixofficeLink, setPixofficeLink] = useState('');
    const [pixstudioLink, setPixstudioLink] = useState('');

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const token = localStorage.getItem("ra_token");
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get(`${API_URL}/events`, config);
                if (response.data.success) {
                    setIsApproved(response.data.dataManagerApproved);
                    setIsRawDataApproved(response.data.isRawDataApproved || false);
                    setPixofficeLink(response.data.pixofficeLink || '');
                    setPixstudioLink(response.data.pixstudioLink || '');
                }
            } catch (error: any) {
                console.error("Failed to fetch event data", error);
                toast.error(error?.response?.data?.message || error.message || "Failed to fetch event data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEventData();
    }, []);

    const handleApproveRawData = async () => {
        setIsRawDataApproved(true);
        try {
            const token = localStorage.getItem('ra_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
            await axios.post(`${API_URL}/preproduction/approve-raw-data`, {
                projectType: 'Event Deliverables'
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
        if (!traditionalSel.trim() && !candidSel.trim() && !retouchSel.trim() && !albumSel.trim()) {
            toast.error("Please enter selections for at least one category.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("ra_token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_URL}/events/submit-selection`, {
                traditional: { ref: traditionalRef, sel: traditionalSel },
                candid: { ref: candidRef, sel: candidSel },
                retouch: { ref: retouchRef, sel: retouchSel },
                album: { ref: albumRef, sel: albumSel }
            }, config);
            if (response.data.success) {
                toast.success("Event details sent to the editor successfully!");
                setTraditionalRef(''); setTraditionalSel('');
                setCandidRef(''); setCandidSel('');
                setRetouchRef(''); setRetouchSel('');
                setAlbumRef(''); setAlbumSel('');
            } else {
                toast.error(response.data.message || "Failed to submit selection.");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "An error occurred.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Events</h1>
                    <p className="text-slate-500 mt-1">Review raw event data, provide references, and submit selections.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : !isApproved ? (
                <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Waiting for Data Manager Verification</h2>
                    <p className="text-slate-600 max-w-lg">
                        Your event photos and videos are currently being verified by our data management team. Once verified, the secure Google Drive link will appear here for you to make your selections.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Section 1: Drive Link */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Camera size={100} />
                        </div>
                        
                        <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                            Raw Data Link
                        </h2>
                        <p className="text-sm text-slate-500 mb-6 flex-1">
                            Your production team has uploaded the raw event photos/videos. Please review them using the secure link below.
                        </p>
                        
                        <div className="flex flex-col gap-3 mt-auto">
                            {pixofficeLink && (
                                <a 
                                    href={pixofficeLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-center justify-between p-4 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all text-indigo-700 font-medium text-sm"
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                            <ExternalLink size={16} className="text-indigo-600" />
                                        </div>
                                        <span className="truncate">Pixoffice Path: {pixofficeLink}</span>
                                    </div>
                                </a>
                            )}
                            {pixstudioLink && (
                                <a 
                                    href={pixstudioLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-center justify-between p-4 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all text-indigo-700 font-medium text-sm"
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                            <ExternalLink size={16} className="text-indigo-600" />
                                        </div>
                                        <span className="truncate">Pix Studio Path: {pixstudioLink}</span>
                                    </div>
                                </a>
                            )}
                            {!pixofficeLink && !pixstudioLink && (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-medium text-sm text-center">
                                    No links available yet.
                                </div>
                            )}
                        </div>
                        
                        {/* Approval Button */}
                        {(pixofficeLink || pixstudioLink) && (
                            !isRawDataApproved ? (
                                <div className="mt-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200 border-dashed gap-3">
                                    <p className="text-sm text-slate-500 text-center">Please review the raw event photos/videos and approve to proceed to the next steps.</p>
                                    <button 
                                        onClick={handleApproveRawData}
                                        className="px-6 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold text-sm rounded-lg transition-colors"
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
                            )
                        )}
                    </div>

                    {/* Sections: Categorized References & Selections */}
                    <div className={`md:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col transition-all ${!isRawDataApproved ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <LinkIcon size={100} />
                        </div>
                        
                        <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                            Reference & Submit Selection
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Provide reference links (e.g. Pinterest, Instagram) and submit your selections for each applicable category.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: 'Traditional Video', refState: traditionalRef, setRef: setTraditionalRef, selState: traditionalSel, setSel: setTraditionalSel },
                                { title: 'Candid Video', refState: candidRef, setRef: setCandidRef, selState: candidSel, setSel: setCandidSel },
                                { title: 'Retouch Edit', refState: retouchRef, setRef: setRetouchRef, selState: retouchSel, setSel: setRetouchSel },
                                { title: 'Album Designer', refState: albumRef, setRef: setAlbumRef, selState: albumSel, setSel: setAlbumSel }
                            ].map((cat, idx) => (
                                <div key={idx} className="p-5 rounded-xl border border-slate-100 bg-slate-50">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        {cat.title}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Reference Link</label>
                                            <input 
                                                type="text"
                                                value={cat.refState}
                                                onChange={(e) => cat.setRef(e.target.value)}
                                                placeholder="Paste reference link here (optional)..."
                                                disabled={!isRawDataApproved}
                                                className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none disabled:bg-slate-100 disabled:text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Selections</label>
                                            <textarea 
                                                value={cat.selState}
                                                onChange={(e) => cat.setSel(e.target.value)}
                                                placeholder="Enter image/video numbers..."
                                                disabled={!isRawDataApproved}
                                                className="w-full min-h-[80px] p-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-y text-sm outline-none disabled:bg-slate-100 disabled:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-6 pt-6 border-t border-slate-100">
                            <button 
                                onClick={handleSendToEditor}
                                disabled={isSubmitting || !isRawDataApproved}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#5B5FC7] text-white font-bold text-sm hover:bg-[#4f46e5] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/20"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                                Submit Selections
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
