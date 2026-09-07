import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight, Clock, Send, Eye, ShieldCheck } from 'lucide-react';

interface Stage {
  status: string;
  label: string;
  progress: number;
  description?: string;
}

interface VisualTimelineProps {
  currentStatus: string;
  onAdvanceStage?: (nextStatus: string) => void;
  onOpenClientReview?: () => void;
  onOpenGallery?: () => void;
  readOnly?: boolean;
}

export const STAGES_LIST: Stage[] = [
  { status: 'LEAD', label: '1. Lead Inquiry', progress: 5, description: 'Initial requirements and package discussion.' },
  { status: 'CONFIRMED', label: '2. Confirmed', progress: 15, description: 'Booking advance received and dates locked.' },
  { status: 'PLANNED', label: '3. Shoot Planned', progress: 25, description: 'Locations, moodboard, outfits, and timing agreed.' },
  { status: 'PHOTOGRAPHER_ASSIGNED', label: '4. Crew Assigned', progress: 35, description: 'Primary photographer, cinematographer & drone pilot allocated.' },
  { status: 'SHOOTING', label: '5. Shoot In Progress', progress: 45, description: 'On-location shoot actively underway.' },
  { status: 'SHOOT_COMPLETED', label: '6. Shoot Done', progress: 55, description: 'RAW footage safely backed up to storage.' },
  { status: 'UPLOADED', label: '7. Photos Uploaded', progress: 65, description: 'High-res gallery generated and shared.' },
  { status: 'SELECTION', label: '8. Photo Selection', progress: 72, description: 'Couple shortlists favorite frames for album.' },
  { status: 'EDITING', label: '9. Fine Retouching', progress: 80, description: 'Color grading, skin toning, and cinematic master.' },
  { status: 'INTERNAL_REVIEW', label: '10. Creative QC', progress: 86, description: 'Studio director quality inspection.' },
  { status: 'CLIENT_REVIEW', label: '11. Client Review', progress: 92, description: 'Presented to couple for sign-off.' },
  { status: 'CLIENT_APPROVED', label: '12. Client Approved', progress: 96, description: 'Sign-off received for print production.' },
  { status: 'DELIVERY', label: '13. Final Delivery', progress: 98, description: 'Physical album dispatched & 4K download links live.' },
  { status: 'COMPLETED', label: '14. Completed', progress: 100, description: 'All deliverables handed over.' },
];

export const VisualTimeline: React.FC<VisualTimelineProps> = ({
  currentStatus,
  onAdvanceStage,
  onOpenClientReview,
  onOpenGallery,
  readOnly = false,
}) => {
  const currentIndex = STAGES_LIST.findIndex((s) => s.status === currentStatus);
  const nextStage = currentIndex >= 0 && currentIndex < STAGES_LIST.length - 1
    ? STAGES_LIST[currentIndex + 1]
    : null;

  return (
    <div className="space-y-6">
      {/* Horizontal Connected Timeline Node Bar */}
      <div className="overflow-x-auto pb-3">
        <div className="flex items-center min-w-[920px] justify-between relative px-2">
          {STAGES_LIST.map((st, idx) => {
            const isPassed = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={st.status} className="flex-1 flex flex-col items-center relative text-center group">
                {/* Connecting track line */}
                {idx < STAGES_LIST.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-1 -z-0 transition-all ${
                      idx < currentIndex ? 'bg-[#5E35B1]' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Node Pill */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black z-10 transition-all duration-300 ${
                    isPassed
                      ? 'bg-[#5E35B1] text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#5E35B1] text-white ring-4 ring-purple-100 shadow-md animate-pulse'
                      : 'bg-white text-slate-400 border border-slate-300'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <span
                  className={`text-[10px] font-bold mt-2 truncate max-w-[70px] ${
                    isCurrent ? 'text-[#5E35B1]' : isPassed ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {st.label.replace(/^\d+\.\s*/, '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Stage Detail & Action Card */}
      <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-[#5E35B1] text-white">
              Active Milestone #{currentIndex + 1}
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              {STAGES_LIST[currentIndex]?.label}
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            {STAGES_LIST[currentIndex]?.description}
          </p>
        </div>

        {/* Action Triggers */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-2">
            {currentStatus === 'UPLOADED' || currentStatus === 'SELECTION' ? (
              <button
                onClick={onOpenGallery}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#5E35B1] text-xs font-bold border border-purple-200 shadow-xs flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Photo Curation</span>
              </button>
            ) : null}

            {currentStatus === 'EDITING' || currentStatus === 'INTERNAL_REVIEW' ? (
              <button
                onClick={onOpenClientReview}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Client Review</span>
              </button>
            ) : null}

            {nextStage && onAdvanceStage && (
              <button
                onClick={() => onAdvanceStage(nextStage.status)}
                className="px-4 py-2 rounded-xl bg-[#5E35B1] hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>Advance to {nextStage.label.replace(/^\d+\.\s*/, '')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualTimeline;
