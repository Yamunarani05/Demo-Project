import { useState, useEffect } from 'react'
import { Download, Info, Film, Database, CheckCircle2, ArrowRight, MessageSquare, AlertCircle, FileVideo, Image as ImageIcon } from 'lucide-react'
import axios from 'axios'

export default function Delivery() {
    const [deliveries, setDeliveries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [queryDeliveryId, setQueryDeliveryId] = useState<number | null>(null)
    const [queryDeliverable, setQueryDeliverable] = useState<string>('overall')
    const [queryText, setQueryText] = useState('')
    const [submittingQuery, setSubmittingQuery] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'
    const token = localStorage.getItem('ra_token')

    useEffect(() => {
        const fetchDeliveries = async () => {
            try {
                const res = await axios.get(`${API_URL}/deliveries`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.data.success) {
                    console.log("CLIENT DELIVERIES FETCHED:", res.data.data)
                    setDeliveries(res.data.data)
                }
            } catch (err) {
                console.error("Failed to fetch deliveries", err)
            } finally {
                setLoading(false)
            }
        }
        if (token) fetchDeliveries()
    }, [token, API_URL])


    const finalDeliveries = deliveries.filter(d => d.deliveryType === 'FINAL_DELIVERABLES')
    const pendingFinal = finalDeliveries.filter(d => d.status === 'pending' || d.status === 'query_raised')
    const approvedFinal = finalDeliveries.filter(d => d.status === 'client_approved')

    const handleApprove = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/deliveries/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'client_approved' } : d))
            window.dispatchEvent(new Event('deliveriesUpdated'))
        } catch (err) {
            console.error("Failed to approve delivery", err)
            alert("Failed to approve delivery")
        }
    }

    const handleRaiseQuery = async (id: number) => {
        if (!queryText.trim()) return;
        setSubmittingQuery(true)

        // Build a prefixed message so the CRM knows which deliverable the query is about
        const prefix = queryDeliverable && queryDeliverable !== 'overall'
            ? `[${queryDeliverable}] `
            : ''
        const fullMessage = prefix + queryText.trim()

        try {
            await axios.post(`${API_URL}/deliveries/${id}/query`, {
                queryMessage: fullMessage,
                deliverableType: queryDeliverable !== 'overall' ? queryDeliverable : undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setDeliveries(prev => prev.map(d => {
                if (d.id === id) {
                    return { ...d, status: 'query_raised', queryCount: (d.queryCount || 0) + 1, notes: (d.notes ? d.notes + '\n\n' : '') + `Client Query: ${fullMessage}` }
                }
                return d;
            }))
            setQueryDeliveryId(null)
            setQueryText('')
            setQueryDeliverable('overall')
            window.dispatchEvent(new Event('deliveriesUpdated'))
            alert("Query submitted successfully! Our team will get back to you.")
        } catch (err: any) {
            console.error("Failed to submit query", err)
            alert(err.response?.data?.message || "Failed to submit query")
        } finally {
            setSubmittingQuery(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Reviews & Delivery</h1>
                    <p className="text-slate-500 mt-2 text-lg">Review active edits, submit feedback, and download your final files.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* FINAL APPROVAL CARD */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        
                        {/* Header Section */}
                        <div className="p-8 pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                                <Film size={150} />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                        Final Approval
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium mt-0.5">Carefully review your masterpieces before final delivery.</p>
                                </div>
                            </div>
                            {pendingFinal.length > 0 && (
                                <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                                    <span className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-widest">Action Required</span>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50/30">
                            {loading ? (
                                <div className="py-16 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                    <p className="text-slate-500 font-medium">Loading your deliverables...</p>
                                </div>
                            ) : pendingFinal.length > 0 ? pendingFinal.map(delivery => (
                                <div key={delivery.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    
                                    {/* Item Header */}
                                    <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <Film size={14} className="text-indigo-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">Edited Content Ready</h3>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${delivery.status === 'query_raised' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {delivery.status === 'query_raised' ? 'Query Submitted' : 'Pending Review'}
                                        </span>
                                    </div>

                                    <div className="p-6">
                                        {/* Admin Note */}
                                        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap flex gap-3">
                                            <MessageSquare size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                            <p>
                                                {(() => {
                                                    const raw = delivery.notes || '';
                                                    const cutIdx = raw.search(/\n\n(Client Query|Client Approval|=== Client Query)/i);
                                                    const displayNote = cutIdx > 0 ? raw.slice(0, cutIdx).trim() : raw.trim();
                                                    return displayNote || 'Please review the final deliverables. If you are satisfied with the edits, click Approve.';
                                                })()}
                                            </p>
                                        </div>

                                        {queryDeliveryId === delivery.id ? (
                                            /* Query Form */
                                            <div className="mb-6 bg-white p-6 rounded-2xl border border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.1)] relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                                
                                                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <AlertCircle size={18} className="text-amber-500" /> Need changes? Let us know.
                                                </h4>

                                                {delivery.approvedLinks && delivery.approvedLinks.length > 0 && (
                                                    <div className="mb-5">
                                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                                            Select Deliverable
                                                        </label>
                                                        <div className="relative">
                                                            <select
                                                                value={queryDeliverable}
                                                                onChange={e => setQueryDeliverable(e.target.value)}
                                                                className="w-full text-sm p-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all appearance-none font-medium text-slate-700"
                                                            >
                                                                <option value="overall">🗂 Overall — All Deliverables</option>
                                                                {(() => {
                                                                    const seen = new Set<string>();
                                                                    return delivery.approvedLinks
                                                                        .filter((l: any) => !['save the date', 'save the video', 'outdoor retouch', 'retouching'].includes((l.project_type || '').toLowerCase().trim()))
                                                                        .filter((l: any) => {
                                                                            const key = (l.project_type || '').trim();
                                                                            if (seen.has(key)) return false;
                                                                            seen.add(key);
                                                                            return true;
                                                                        })
                                                                        .map((l: any, i: number) => (
                                                                            <option key={i} value={l.project_type}>
                                                                                {l.project_type}
                                                                            </option>
                                                                        ));
                                                                })()}
                                                            </select>
                                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <textarea
                                                    value={queryText}
                                                    onChange={e => setQueryText(e.target.value)}
                                                    placeholder={queryDeliverable !== 'overall'
                                                        ? `Describe the issue with ${queryDeliverable}...`
                                                        : "Describe the specific changes or issues you noticed..."
                                                    }
                                                    className="w-full text-sm p-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 mb-5 transition-all resize-none shadow-inner"
                                                    rows={4}
                                                />
                                                
                                                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                                    <button onClick={() => { setQueryDeliveryId(null); setQueryText(''); setQueryDeliverable('overall'); }} disabled={submittingQuery} className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors">
                                                        Cancel
                                                    </button>
                                                    <button onClick={() => handleRaiseQuery(delivery.id)} disabled={submittingQuery || !queryText.trim()} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2">
                                                        {submittingQuery ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                                        Submit Query
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-6">
                                                {/* File Links Grid */}
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Available Files</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                        {delivery.approvedLinks && Array.isArray(delivery.approvedLinks) && delivery.approvedLinks.length > 0 ? (() => {
                                                                const seenTypes = new Set<string>();
                                                                return delivery.approvedLinks
                                                                    .filter((link: any) => {
                                                                        const type = (link.project_type || '').toLowerCase().trim();
                                                                        return !['save the date', 'save the video', 'outdoor retouch', 'retouching'].includes(type);
                                                                    })
                                                                    .filter((link: any) => {
                                                                        const key = (link.project_type || '').trim();
                                                                        if (seenTypes.has(key)) return false;
                                                                        seenTypes.add(key);
                                                                        return true;
                                                                    })
                                                                    .map((link: any, idx: number) => {
                                                                        const isVideo = (link.project_type || '').toLowerCase().includes('video');
                                                                        return (
                                                                            <button key={idx} onClick={() => window.open(link.upload_link, '_blank')} className="group p-4 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl text-left transition-all shadow-sm relative overflow-hidden">
                                                                                {delivery.status === 'pending' && (
                                                                                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                                                                                )}
                                                                                <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-3 transition-colors border border-slate-100 relative">
                                                                                    {isVideo ? <FileVideo size={18} className="text-indigo-500" /> : <ImageIcon size={18} className="text-indigo-500" />}
                                                                                </div>
                                                                                <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors pr-4">{link.project_type || 'View Files'}</div>
                                                                                <div className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1 group-hover:text-indigo-400">
                                                                                    Open Drive <ArrowRight size={10} />
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    });
                                                            })() : (
                                                            <>
                                                                {delivery.driveLink && (
                                                                    <button onClick={() => window.open(delivery.driveLink, '_blank')} className="group p-4 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl text-left transition-all shadow-sm relative overflow-hidden">
                                                                        {delivery.status === 'pending' && (
                                                                            <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                                                                        )}
                                                                        <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-3 transition-colors border border-slate-100">
                                                                            <ImageIcon size={18} className="text-indigo-500" />
                                                                        </div>
                                                                        <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">View Photos</div>
                                                                    </button>
                                                                )}
                                                                {delivery.videoDriveLink && (
                                                                    <button onClick={() => window.open(delivery.videoDriveLink, '_blank')} className="group p-4 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl text-left transition-all shadow-sm relative overflow-hidden">
                                                                        {delivery.status === 'pending' && (
                                                                            <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                                                                        )}
                                                                        <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-3 transition-colors border border-slate-100">
                                                                            <FileVideo size={18} className="text-indigo-500" />
                                                                        </div>
                                                                        <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">View Videos</div>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons Row */}
                                                <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-2 border-t border-slate-100">
                                                    {(delivery.queryCount || 0) < 2 && (
                                                        <button onClick={() => setQueryDeliveryId(delivery.id)} className="flex-1 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm">
                                                            Raise Query <span className="opacity-80 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] uppercase border border-slate-200">{(2 - (delivery.queryCount || 0))} LEFT</span>
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleApprove(delivery.id)} className="flex-[2] py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                                                        <CheckCircle2 size={18} /> Approve All Edits
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-16 text-center">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 text-xl">You're All Caught Up!</h3>
                                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">There are no final deliverables pending your review at the moment. We'll notify you when new edits are ready.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* REVIEW HISTORY */}
                    <div className="mt-8">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            Review History
                        </h3>
                        <div className="space-y-3">
                            {approvedFinal.length > 0 ? approvedFinal.map(delivery => (
                                <div key={delivery.id} className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                            <CheckCircle2 size={20} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">Final Deliverables Approved</h4>
                                            <p className="text-sm text-slate-500 font-medium mt-0.5">Approved on {new Date(delivery.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <ArrowRight size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-sm text-slate-400 font-medium">No previous reviews found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="space-y-6">
                    {/* Final Deliverables Box */}
                    <div className="bg-slate-900 rounded-[2rem] shadow-xl p-8 text-white relative overflow-hidden border border-slate-800">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 text-white">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <Download className="text-indigo-300" size={18} />
                            </div>
                            Final Deliverables
                        </h2>

                        <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <Database size={24} className="text-indigo-200/50" />
                            </div>
                            <h3 className="font-bold text-white text-lg mb-2">No Files Yet</h3>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">Your high-res exports and source files will securely appear here when ready.</p>
                            <button disabled className="w-full py-3 bg-white/10 text-white/40 rounded-xl text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2 transition-colors hover:bg-white/10">
                                <Download size={16} /> Open Drive Link
                            </button>
                        </div>
                    </div>

                    {/* Upsell / Info Box */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                            <Info size={24} className="text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            Need Raw Footage?
                        </h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
                            A hard drive containing all RAW unedited files requires a separate buyout clause in your contract.
                        </p>
                        <button className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-md mt-auto">
                            Request RAW Buyout
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
