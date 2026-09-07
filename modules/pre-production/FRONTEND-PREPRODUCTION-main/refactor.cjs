const fs = require('fs');
const file = 'src/pages/data-manager/pages/RawDataView.tsx';
let content = fs.readFileSync(file, 'utf8');

// The plan: Replace the grid layout entirely.
// We'll replace everything from "{/* SPLIT BOXES: Photography (Left) vs Videography (Right) */}"
// up to "{/* BOTTOM PROJECT LEVEL RESOURCES */}"

const startIdx = content.indexOf('{/* SPLIT BOXES: Photography (Left) vs Videography (Right) */}');
const endIdx = content.indexOf('{/* BOTTOM PROJECT LEVEL RESOURCES */}');

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find boundaries");
    process.exit(1);
}

const before = content.slice(0, startIdx);
const after = content.slice(endIdx);

const newGrid = `
            {/* INDIVIDUAL CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                
                {/* TRADITIONAL PHOTOGRAPHY CARD */}
                <div className="bg-white rounded-xl border-t-4 border-t-blue-500 border-x border-b border-gray-200 p-6 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                            <ImageIcon size={22} className="text-blue-500" /> Traditional Photography
                        </h2>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                            {numImages} Photos
                        </span>
                    </div>

                    <div className="space-y-6 flex-grow">
                        {/* Team Member */}
                        <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm border border-gray-200 shrink-0">
                                    <User size={18} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Photographer</div>
                                    <div className="text-sm font-bold text-gray-900">{photographer || 'Unassigned'}</div>
                                </div>
                            </div>
                            
                            {photographerStaff.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Freelancer</div>
                                    <div className="flex flex-col gap-2">
                                        {photographerStaff.map((entry: string, i: number) => {
                                            const { displayName, phone } = parseFreelancer(entry);
                                            return (
                                                <div key={i} className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100/60">
                                                    <div>
                                                        <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Name</div>
                                                        <div className="text-xs font-bold text-blue-900 capitalize leading-none">{displayName}</div>
                                                    </div>
                                                    {phone && (
                                                        <div className="text-right">
                                                            <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Mobile Number</div>
                                                            <div className="text-xs font-bold text-blue-900 leading-none">{phone}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submitted Details from JSON */}
                        <ShootDetailsViewer details={photoDetails} clientName={rawData.client || data.client} role="photo" />

                        {/* Media Links / Previews */}
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Submitted Media Link</span>
                            
                            {photoDrive ? (
                                <a href={photoDrive} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 transition-colors">
                                    <Link2 size={16} /> Google Drive Link ↗
                                </a>
                            ) : <p className="text-sm text-gray-400 italic">No drive link provided.</p>}
                        </div>

                        {/* Hard Disk Status */}
                        {photoHardDisk && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 mt-auto">
                                <div className="flex items-center gap-2">
                                    <HardDrive size={16} className="text-gray-500" />
                                    <span className="text-xs font-bold text-gray-700">Hard Disk Delivery</span>
                                </div>
                                <span className={\`px-2 py-1 rounded text-[10px] font-bold \${photoHardDisk.received ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}\`}>
                                    {photoHardDisk.received ? 'RECEIVED' : 'PENDING'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Verification Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                        {readOnlyReview ? (() => {
                            const photoApproved = rawData.photo_approved || data.photo_approved || rawData.event_photo_approved || data.event_photo_approved;
                            return (
                                <div className={\`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm border \${photoApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}\`}>
                                    {photoApproved ? <><CheckCircle size={18} /> DM Verified (Photos)</> : <><Clock size={18} /> Pending DM Verification</>}
                                </div>
                            );
                        })() : verificationDone ? (
                            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                                <CheckCircle size={18} /> {isCrmVerified ? 'CRM Verified' : 'Data Manager Verified'}
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                {localApprovedRoles.includes('photographer') ? (
                                    <button disabled className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 opacity-60 cursor-not-allowed">
                                        <CheckCircle size={16} /> Trad Photo Approved
                                    </button>
                                ) : (
                                    <button onClick={() => handleLocalApprove('photographer')} disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-sm"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                        <CheckCircle size={16} /> Approve Trad Photo
                                    </button>
                                )}
                                <button onClick={() => handleAction('request-reupload', 'photographer')} disabled={submitting}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
                                    <RotateCcw size={16} /> Re-upload
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* CANDID PHOTOGRAPHY CARD */}
                {(secondaryPhotoDrive || secondaryPhotoDetails || secondaryPhotographerStaff.length > 0) && (
                    <div className="bg-white rounded-xl border-t-4 border-t-blue-400 border-x border-b border-gray-200 p-6 shadow-sm flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                                <ImageIcon size={22} className="text-blue-400" /> Candid Photography
                            </h2>
                        </div>

                        <div className="space-y-6 flex-grow">
                            {/* Team Member */}
                            <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm border border-gray-200 shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Secondary Photographer</div>
                                        <div className="text-sm font-bold text-gray-900">{secondaryPhotographerStaff.length > 0 ? 'Assigned' : 'Unassigned'}</div>
                                    </div>
                                </div>
                                
                                {secondaryPhotographerStaff.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Freelancer</div>
                                        <div className="flex flex-col gap-2">
                                            {secondaryPhotographerStaff.map((entry: string, i: number) => {
                                                const { displayName, phone } = parseFreelancer(entry);
                                                return (
                                                    <div key={i} className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100/60">
                                                        <div>
                                                            <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Name</div>
                                                            <div className="text-xs font-bold text-blue-900 capitalize leading-none">{displayName}</div>
                                                        </div>
                                                        {phone && (
                                                            <div className="text-right">
                                                                <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Mobile Number</div>
                                                                <div className="text-xs font-bold text-blue-900 leading-none">{phone}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submitted Details from JSON */}
                            <ShootDetailsViewer details={secondaryPhotoDetails} clientName={rawData.client || data.client} role="photo" />

                            {/* Media Links / Previews */}
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Submitted Media Link</span>
                                
                                {secondaryPhotoDrive ? (
                                    <a href={secondaryPhotoDrive} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 transition-colors">
                                        <Link2 size={16} /> Google Drive Link ↗
                                    </a>
                                ) : <p className="text-sm text-gray-400 italic">No drive link provided.</p>}
                            </div>
                        </div>

                        {/* Verification Actions */}
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                            {readOnlyReview ? (() => {
                                const photoApproved = rawData.photo_approved || data.photo_approved || rawData.event_photo_approved || data.event_photo_approved;
                                return (
                                    <div className={\`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm border \${photoApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}\`}>
                                        {photoApproved ? <><CheckCircle size={18} /> DM Verified (Photos)</> : <><Clock size={18} /> Pending DM Verification</>}
                                    </div>
                                );
                            })() : verificationDone ? (
                                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                                    <CheckCircle size={18} /> {isCrmVerified ? 'CRM Verified' : 'Data Manager Verified'}
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    {localApprovedRoles.includes('candid-photographer') ? (
                                        <button disabled className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 opacity-60 cursor-not-allowed">
                                            <CheckCircle size={16} /> Candid Photo Approved
                                        </button>
                                    ) : (
                                        <button onClick={() => handleLocalApprove('candid-photographer')} disabled={submitting}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-sm"
                                            style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}>
                                            <CheckCircle size={16} /> Approve Candid Photo
                                        </button>
                                    )}
                                    <button onClick={() => handleAction('request-reupload', 'candid-photographer')} disabled={submitting}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
                                        <RotateCcw size={16} /> Re-upload
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TRADITIONAL VIDEOGRAPHY CARD */}
                <div className="bg-white rounded-xl border-t-4 border-t-pink-500 border-x border-b border-gray-200 p-6 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-pink-800 flex items-center gap-2">
                            <Video size={22} className="text-pink-500" /> Traditional Videography
                        </h2>
                        <span className="px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-full border border-pink-100">
                            {numVideos} Videos
                        </span>
                    </div>

                    <div className="space-y-6 flex-grow">
                        {/* Team Member */}
                        <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pink-600 shadow-sm border border-gray-200 shrink-0">
                                    <User size={18} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Videographer</div>
                                    <div className="text-sm font-bold text-gray-900">{videographer || 'Unassigned'}</div>
                                </div>
                            </div>
                            
                            {videographerStaff.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Freelancer</div>
                                    <div className="flex flex-col gap-2">
                                        {videographerStaff.map((entry: string, i: number) => {
                                            const { displayName, phone } = parseFreelancer(entry);
                                            return (
                                                <div key={i} className="flex items-center justify-between p-2.5 bg-pink-50 rounded-lg border border-pink-100/60">
                                                    <div>
                                                        <div className="text-[9px] font-bold text-pink-400 uppercase tracking-wider mb-0.5">Name</div>
                                                        <div className="text-xs font-bold text-pink-900 capitalize leading-none">{displayName}</div>
                                                    </div>
                                                    {phone && (
                                                        <div className="text-right">
                                                            <div className="text-[9px] font-bold text-pink-400 uppercase tracking-wider mb-0.5">Mobile Number</div>
                                                            <div className="text-xs font-bold text-pink-900 leading-none">{phone}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submitted Details from JSON */}
                        <ShootDetailsViewer details={videoDetails} clientName={rawData.client || data.client} role="video" />

                        {/* Media Links / Previews */}
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Submitted Media Link</span>
                            
                            {videoDrive ? (
                                <a href={videoDrive} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-800 bg-pink-50 p-3 rounded-lg border border-pink-100 mb-4 transition-colors">
                                    <Link2 size={16} /> Google Drive Link ↗
                                </a>
                            ) : <p className="text-sm text-gray-400 italic">No drive link provided.</p>}
                        </div>

                        {/* Hard Disk Status */}
                        {videoHardDisk && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 mt-auto">
                                <div className="flex items-center gap-2">
                                    <HardDrive size={16} className="text-gray-500" />
                                    <span className="text-xs font-bold text-gray-700">Hard Disk Delivery</span>
                                </div>
                                <span className={\`px-2 py-1 rounded text-[10px] font-bold \${videoHardDisk.received ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}\`}>
                                    {videoHardDisk.received ? 'RECEIVED' : 'PENDING'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Verification Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                        {readOnlyReview ? (() => {
                            const videoApproved = rawData.video_approved || data.video_approved || rawData.event_video_approved || data.event_video_approved;
                            return (
                                <div className={\`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm border \${videoApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}\`}>
                                    {videoApproved ? <><CheckCircle size={18} /> DM Verified (Videos)</> : <><Clock size={18} /> Pending DM Verification</>}
                                </div>
                            );
                        })() : verificationDone ? (
                            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                                <CheckCircle size={18} /> {isCrmVerified ? 'CRM Verified' : 'Data Manager Verified'}
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                {localApprovedRoles.includes('videographer') ? (
                                    <button disabled className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-pink-700 bg-pink-50 border border-pink-100 opacity-60 cursor-not-allowed">
                                        <CheckCircle size={16} /> Trad Video Approved
                                    </button>
                                ) : (
                                    <button onClick={() => handleLocalApprove('videographer')} disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-sm"
                                        style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
                                        <CheckCircle size={16} /> Approve Trad Video
                                    </button>
                                )}
                                <button onClick={() => handleAction('request-reupload', 'videographer')} disabled={submitting}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
                                    <RotateCcw size={16} /> Re-upload
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* CANDID VIDEOGRAPHY CARD */}
                {(secondaryVideoDrive || secondaryVideoDetails || secondaryVideographerStaff.length > 0) && (
                    <div className="bg-white rounded-xl border-t-4 border-t-pink-400 border-x border-b border-gray-200 p-6 shadow-sm flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-pink-800 flex items-center gap-2">
                                <Video size={22} className="text-pink-400" /> Candid Videography
                            </h2>
                        </div>

                        <div className="space-y-6 flex-grow">
                            {/* Team Member */}
                            <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pink-600 shadow-sm border border-gray-200 shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Secondary Videographer</div>
                                        <div className="text-sm font-bold text-gray-900">{secondaryVideographerStaff.length > 0 ? 'Assigned' : 'Unassigned'}</div>
                                    </div>
                                </div>
                                
                                {secondaryVideographerStaff.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Freelancer</div>
                                        <div className="flex flex-col gap-2">
                                            {secondaryVideographerStaff.map((entry: string, i: number) => {
                                                const { displayName, phone } = parseFreelancer(entry);
                                                return (
                                                    <div key={i} className="flex items-center justify-between p-2.5 bg-pink-50 rounded-lg border border-pink-100/60">
                                                        <div>
                                                            <div className="text-[9px] font-bold text-pink-400 uppercase tracking-wider mb-0.5">Name</div>
                                                            <div className="text-xs font-bold text-pink-900 capitalize leading-none">{displayName}</div>
                                                        </div>
                                                        {phone && (
                                                            <div className="text-right">
                                                                <div className="text-[9px] font-bold text-pink-400 uppercase tracking-wider mb-0.5">Mobile Number</div>
                                                                <div className="text-xs font-bold text-pink-900 leading-none">{phone}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submitted Details from JSON */}
                            <ShootDetailsViewer details={secondaryVideoDetails} clientName={rawData.client || data.client} role="video" />

                            {/* Media Links / Previews */}
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Submitted Media Link</span>
                                
                                {secondaryVideoDrive ? (
                                    <a href={secondaryVideoDrive} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-800 bg-pink-50 p-3 rounded-lg border border-pink-100 mb-4 transition-colors">
                                        <Link2 size={16} /> Google Drive Link ↗
                                    </a>
                                ) : <p className="text-sm text-gray-400 italic">No drive link provided.</p>}
                            </div>
                        </div>

                        {/* Verification Actions */}
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                            {readOnlyReview ? (() => {
                                const videoApproved = rawData.video_approved || data.video_approved || rawData.event_video_approved || data.event_video_approved;
                                return (
                                    <div className={\`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm border \${videoApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}\`}>
                                        {videoApproved ? <><CheckCircle size={18} /> DM Verified (Videos)</> : <><Clock size={18} /> Pending DM Verification</>}
                                    </div>
                                );
                            })() : verificationDone ? (
                                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                                    <CheckCircle size={18} /> {isCrmVerified ? 'CRM Verified' : 'Data Manager Verified'}
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    {localApprovedRoles.includes('candid-videographer') ? (
                                        <button disabled className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-pink-700 bg-pink-50 border border-pink-100 opacity-60 cursor-not-allowed">
                                            <CheckCircle size={16} /> Candid Video Approved
                                        </button>
                                    ) : (
                                        <button onClick={() => handleLocalApprove('candid-videographer')} disabled={submitting}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-sm"
                                            style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)' }}>
                                            <CheckCircle size={16} /> Approve Candid Video
                                        </button>
                                    )}
                                    <button onClick={() => handleAction('request-reupload', 'candid-videographer')} disabled={submitting}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
                                        <RotateCcw size={16} /> Re-upload
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* DRONE BOX */}
                {isEventPhase && (droneSubmittedDetails || dronePhotoDrive || droneVideoDrive || drone) && (
                    <div className="bg-white rounded-xl border-t-4 border-t-teal-500 border-x border-b border-gray-200 p-6 shadow-sm flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-teal-800 flex items-center gap-2">
                                <Camera size={22} className="text-teal-500" /> Drone Operator Details
                            </h2>
                            {(droneNumImages > 0 || droneNumVideos > 0) && (
                                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-100">
                                    {droneNumImages > 0 ? \`\${droneNumImages} Photos\` : ''}{droneNumImages > 0 && droneNumVideos > 0 ? ' · ' : ''}{droneNumVideos > 0 ? \`\${droneNumVideos} Videos\` : ''}
                                </span>
                            )}
                        </div>

                        <div className="space-y-6 flex-grow">
                            {/* Team Member */}
                            <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm border border-gray-200 shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Drone Operator</div>
                                        <div className="text-sm font-bold text-gray-900">{drone || 'Unassigned'}</div>
                                    </div>
                                </div>
                                
                                {droneStaff.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Freelancer</div>
                                        <div className="flex flex-col gap-2">
                                            {droneStaff.map((entry: string, i: number) => {
                                                const { displayName, phone } = parseFreelancer(entry);
                                                return (
                                                    <div key={i} className="flex items-center justify-between p-2.5 bg-teal-50 rounded-lg border border-teal-100/60">
                                                        <div>
                                                            <div className="text-[9px] font-bold text-teal-400 uppercase tracking-wider mb-0.5">Name</div>
                                                            <div className="text-xs font-bold text-teal-900 capitalize leading-none">{displayName}</div>
                                                        </div>
                                                        {phone && (
                                                            <div className="text-right">
                                                                <div className="text-[9px] font-bold text-teal-400 uppercase tracking-wider mb-0.5">Mobile Number</div>
                                                                <div className="text-xs font-bold text-teal-900 leading-none">{phone}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submitted Details from JSON */}
                            {droneSubmittedDetails && <ShootDetailsViewer details={droneSubmittedDetails} clientName={rawData.client || data.client} role="drone" />}

                            {/* Media Links / Previews */}
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Submitted Media</span>
                                
                                <div className="flex gap-3 mb-4">
                                    {dronePhotoDrive && (
                                        <a href={dronePhotoDrive} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-800 bg-teal-50 p-3 rounded-lg border border-teal-100 transition-colors">
                                            <Link2 size={16} /> Photos Drive ↗
                                        </a>
                                    )}
                                    {droneVideoDrive && (
                                        <a href={droneVideoDrive} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-800 bg-teal-50 p-3 rounded-lg border border-teal-100 transition-colors">
                                            <Link2 size={16} /> Videos Drive ↗
                                        </a>
                                    )}
                                    {!dronePhotoDrive && !droneVideoDrive && (
                                        <p className="text-sm text-gray-400 italic">No drive link provided.</p>
                                    )}
                                </div>
                            </div>

                            {/* Hard Disk Status */}
                            {droneHardDisk && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <HardDrive size={16} className="text-gray-500" />
                                        <span className="text-xs font-bold text-gray-700">Hard Disk Delivery</span>
                                    </div>
                                    <span className={\`px-2 py-1 rounded text-[10px] font-bold \${droneHardDisk.received ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}\`}>
                                        {droneHardDisk.received ? 'RECEIVED' : 'PENDING'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Verification Actions */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            {readOnlyReview ? (() => {
                                const droneApproved = rawData.drone_approved || data.drone_approved;
                                return (
                                    <div className={\`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm border \${droneApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}\`}>
                                        {droneApproved ? <><CheckCircle size={18} /> DM Verified (Drone)</> : <><Clock size={18} /> Pending DM Verification</>}
                                    </div>
                                );
                            })() : verificationDone ? (
                                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                                    <CheckCircle size={18} /> {isCrmVerified ? 'CRM Verified' : 'Data Manager Verified'}
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    {localApprovedRoles.includes('drone') ? (
                                        <button
                                            disabled
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-teal-700 bg-teal-50 border border-teal-100 opacity-60 cursor-not-allowed"
                                        >
                                            <CheckCircle size={16} /> Approved
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleLocalApprove('drone')}
                                            disabled={submitting}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-sm"
                                            style={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)' }}
                                        >
                                            <CheckCircle size={16} /> Approve Drone
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleAction('request-reupload', 'drone')}
                                        disabled={submitting}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        <RotateCcw size={16} /> Re-upload
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
`;

content = before + newGrid + "\n" + after;
fs.writeFileSync('src/pages/data-manager/pages/RawDataView.tsx', content);
console.log("Refactored successfully.");
