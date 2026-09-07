import React, { useState } from 'react'
import {
  X,
  Camera,
  Film,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  Sparkles,
  ShieldCheck,
  Eye,
  Users,
  HardDrive,
  Clock,
  ExternalLink,
  RotateCcw,
  Sliders
} from 'lucide-react'

interface ClientDemoWorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  initialStep?: number
  onFillClientCredentials?: () => void
}

interface WorkflowStage {
  id: string
  module: 'preproduction' | 'event' | 'postproduction' | 'delivery'
  badge: string
  title: string
  tagline: string
  accentColor: string
  accentBg: string
  accentBorder: string
  icon: React.ElementType
}

const STAGES: WorkflowStage[] = [
  {
    id: 'preproduction',
    module: 'preproduction',
    badge: 'Module 1: Pre-Production',
    title: 'Pre-Shoot Planning & Crew Assignment',
    tagline: 'Client moodboard curation, creative preferences, team allocation, and shotlist approvals.',
    accentColor: '#0284c7', // sky-600
    accentBg: '#f0f9ff',
    accentBorder: '#bae6fd',
    icon: Camera
  },
  {
    id: 'event',
    module: 'event',
    badge: 'Module 2: Event Execution',
    title: 'Live Event Coordination & Data Check',
    tagline: 'Event coordinator tracking, real-time crew check-ins, card ingestion, and QC verification.',
    accentColor: '#7c3aed', // purple-600
    accentBg: '#faf5ff',
    accentBorder: '#e9d5ff',
    icon: Calendar
  },
  {
    id: 'postproduction',
    module: 'postproduction',
    badge: 'Module 3: Post-Production',
    title: 'Video & Retouch Pipeline & Client Review',
    tagline: 'Multi-editor pipeline, timestamped video reviews, photo culling, and album proof revisions.',
    accentColor: '#d97706', // amber-600
    accentBg: '#fffbeb',
    accentBorder: '#fde68a',
    icon: Film
  },
  {
    id: 'delivery',
    module: 'delivery',
    badge: 'Module 4: Final Handover',
    title: 'Master Delivery & Digital Flipbook',
    tagline: '4K final downloads, PIN-protected client cloud gallery, physical album courier tracking.',
    accentColor: '#059669', // emerald-600
    accentBg: '#ecfdf5',
    accentBorder: '#a7f3d0',
    icon: Download
  }
]

export default function ClientDemoWorkflowModal({
  isOpen,
  onClose,
  initialStep = 0,
  onFillClientCredentials
}: ClientDemoWorkflowModalProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)

  if (!isOpen) return null

  const stage = STAGES[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === STAGES.length - 1

  const handleNext = () => {
    if (isLast) {
      setCurrentStep(0)
    } else {
      setCurrentStep(prev => Math.min(prev + 1, STAGES.length - 1))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header with Title and Close Button */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-500/20">
              DP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-display">
                  Client View Demo Workflow
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700">
                  Interactive Guide
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Step-by-step preview of how clients experience Preproduction, Event, and Postproduction
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300/80 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Close Demo"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Navigation Bar */}
        <div className="px-6 pt-4 pb-3 bg-white border-b border-slate-100">
          <div className="grid grid-cols-4 gap-2">
            {STAGES.map((s, idx) => {
              const isActive = idx === currentStep
              const isPassed = idx < currentStep

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl text-left transition-all border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400/30'
                      : isPassed
                      ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100/70'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-white text-slate-900'
                        : isPassed
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 size={15} /> : idx + 1}
                  </div>
                  <div className="min-w-0 hidden md:block">
                    <p className="text-[11px] font-bold truncate leading-tight">
                      {s.badge.split(':')[1] || s.badge}
                    </p>
                    <p className={`text-[9px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      {s.title.split('&')[0]}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Active Stage Banner */}
          <div
            className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: stage.accentBg, borderColor: stage.accentBorder }}
          >
            <div className="flex items-start gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: stage.accentColor }}
              >
                <stage.icon size={20} />
              </div>
              <div>
                <span
                  className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md text-white mb-1"
                  style={{ backgroundColor: stage.accentColor }}
                >
                  {stage.badge}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {stage.title}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {stage.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-xs font-bold text-slate-500">Step {currentStep + 1} of {STAGES.length}</span>
            </div>
          </div>

          {/* Interactive Stage Simulation Cards */}
          {currentStep === 0 && (
            <div className="space-y-4">
              {/* Simulated Client Screen for Preproduction */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
                  <span className="flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    CLIENT PORTAL &rarr; /client/preproduction
                  </span>
                  <span className="font-semibold text-slate-300">Client: Aditi &amp; Rahul</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Assigned Team Card */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <Users size={14} /> Assigned Shoot Crew
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                        <div>
                          <p className="font-bold text-slate-200">Arjun Sharma</p>
                          <p className="text-[10px] text-slate-400">Lead Candid Photographer</p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300">Confirmed</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                        <div>
                          <p className="font-bold text-slate-200">Vikram Sen</p>
                          <p className="text-[10px] text-slate-400">Cinematographer (4K FX3)</p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300">Confirmed</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                        <div>
                          <p className="font-bold text-slate-200">Karan Roy</p>
                          <p className="text-[10px] text-slate-400">FAA Drone Pilot</p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300">Confirmed</span>
                      </div>
                    </div>
                  </div>

                  {/* Moodboard & Preferences */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <Sparkles size={14} /> Moodboard &amp; Themes
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-purple-900/30 border border-purple-700/40">
                        <p className="font-bold text-purple-200">Style: Royal Heritage &amp; Warm Tones</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Golden hour couple portraits &amp; candid family moments</p>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 text-[11px]">
                        <span className="text-slate-300">Shotlist Verification</span>
                        <span className="text-emerald-400 font-bold">Approved ✓</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 text-[11px]">
                        <span className="text-slate-300">Pre-Shoot Call Sheet</span>
                        <span className="text-sky-400 font-bold">Sent to Client</span>
                      </div>
                    </div>
                  </div>

                  {/* Client Milestones */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <ShieldCheck size={14} /> Pre-production Status
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Client requirements recorded</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Dates locked: Nov 14 – Nov 16</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Creative coordinator assigned</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Progress</span>
                        <span className="font-bold text-sky-400">100% Ready for Event</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behind-The-Scenes Explanation */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 text-xs text-sky-950">
                <span className="font-bold uppercase tracking-wider text-[10px] text-sky-700 block mb-1">
                  How this module works in the platform:
                </span>
                In the <strong>Preproduction CRM</strong>, the studio team captures client intake, builds shot schedules, and assigns qualified photographers, videographers, and drone pilots. The client sees their confirmed crew profiles, reviews artistic moodboards, and downloads call sheets with zero friction.
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Simulated Client Screen for Event Module */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
                  <span className="flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    EVENT MODULE &rarr; Live Shoot &amp; Ingestion Tracking
                  </span>
                  <span className="font-semibold text-slate-300">Shoot Day: Wedding Ceremony</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Event Day Status */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <Clock size={14} /> Live Shoot Schedule
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/50 flex justify-between items-center">
                        <span className="text-slate-300">09:00 AM - Baraat Arrival</span>
                        <span className="text-emerald-400 font-bold">Completed</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/50 flex justify-between items-center">
                        <span className="text-slate-300">11:30 AM - Varmala &amp; Pheras</span>
                        <span className="text-emerald-400 font-bold">Completed</span>
                      </div>
                      <div className="p-2 rounded-lg bg-purple-900/40 border border-purple-500/30 flex justify-between items-center">
                        <span className="text-purple-200 font-bold">07:00 PM - Evening Reception</span>
                        <span className="text-amber-400 font-bold animate-pulse">In Progress</span>
                      </div>
                    </div>
                  </div>

                  {/* Raw Data Vault & Ingestion */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <HardDrive size={14} /> Raw Data Ingestion
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/50">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">Photos Uploaded</span>
                          <span className="font-bold text-sky-400">4,820 RAW files</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full w-[94%]" />
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/50">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">4K Video Clips</span>
                          <span className="font-bold text-purple-400">185 ProRes Takes</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full w-[88%]" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">Dual NAS Redundancy verified</p>
                    </div>
                  </div>

                  {/* QC Verification Check */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <ShieldCheck size={14} /> Event QC Verification
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Audio check: Wireless lavs intact</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Card integrity: 0 corrupted frames</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>QC sign-off by Data Manager</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-700/50">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Ready for Post-Production Transfer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behind-The-Scenes Explanation */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 text-xs text-purple-950">
                <span className="font-bold uppercase tracking-wider text-[10px] text-purple-700 block mb-1">
                  How this module works in the platform:
                </span>
                During the event, the <strong>Event Coordinator</strong> manages the real-time itinerary and crew attendance. At wrap-up, the <strong>Data Manager</strong> ingests all camera and drone memory cards into the central storage, runs checksum validation, and performs the mandatory Phase 1 Event QC check before handoff to editors.
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Simulated Client Screen for Postproduction */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
                  <span className="flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    CLIENT PORTAL &rarr; /client/postproduction
                  </span>
                  <span className="font-semibold text-slate-300">Deliverables in Progress</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Video Editing Pipeline */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <Film size={14} /> Video Editing Suite
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-200">1-Min Teaser</span>
                          <span className="text-[10px] font-bold text-emerald-400">Ready to Review</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Editor: Rohan K. (Candid Video)</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-200">45-Min Feature Film</span>
                          <span className="text-[10px] font-bold text-amber-400">Color Grading (80%)</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Editor: Amit P. (Traditional Video)</p>
                      </div>
                    </div>
                  </div>

                  {/* Photo Retouch & Album Design */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <Sliders size={14} /> Photo Culling &amp; Album
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-200">Couple Selection</span>
                          <span className="text-[10px] font-bold text-sky-400">135 / 150 Selected</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-sky-400 h-full w-[90%]" />
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-200">Flush Mount Album</span>
                          <span className="text-[10px] font-bold text-amber-300">Proof Layout v1</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Designer: Priya M. (36 Spreads)</p>
                      </div>
                    </div>
                  </div>

                  {/* Client Review & Revision System */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <Eye size={14} /> Client Review Room
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700/40">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-300">Timestamp Revision</span>
                          <span className="text-emerald-400 text-[10px]">Applied</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 italic">
                          "At 01:42 swap the portrait shot with the family laugh"
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 text-[11px] pt-1">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>1 Revision cycle completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behind-The-Scenes Explanation */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-950">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block mb-1">
                  How this module works in the platform:
                </span>
                The <strong>Operational Manager</strong> assigns tasks to specialized editors (traditional video, candid video, retouch artist, album and frame designer). The client interacts via their portal to favorite photos, review video cuts with exact timestamps, request revisions, and give final printing sign-offs.
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Simulated Client Screen for Final Delivery */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
                  <span className="flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    CLIENT VAULT &rarr; /client/delivery
                  </span>
                  <span className="font-semibold text-emerald-400">Project Completed &amp; Delivered</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Master Downloads */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <Download size={14} /> Master Downloads
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/50 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-200">Wedding Highlights (4K)</p>
                          <p className="text-[10px] text-slate-400">ProRes 422 &amp; MP4</p>
                        </div>
                        <button type="button" className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]">
                          Download
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/50 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-200">High-Res Master Photos</p>
                          <p className="text-[10px] text-slate-400">150 Retouched JPEGs (ZIP)</p>
                        </div>
                        <button type="button" className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Online Sharing & Digital Album */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <ExternalLink size={14} /> Cloud Vault &amp; Album
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/50">
                        <p className="font-bold text-slate-200">Digital Flipbook Album</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Interactive 3D virtual page-turn preview</p>
                        <button type="button" className="mt-2 w-full py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold">
                          View Flipbook
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/50 flex justify-between items-center text-[10px]">
                        <span className="text-slate-300">Family Guest Link</span>
                        <span className="text-sky-400 font-mono">PIN: 8492</span>
                      </div>
                    </div>
                  </div>

                  {/* Physical Album Shipping */}
                  <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                      <ShieldCheck size={14} /> Physical Deliverables
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/50">
                        <p className="font-bold text-slate-200">12x36 Leatherette Album</p>
                        <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Shipped via BlueDart</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">AWB: #BD-73910842</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/50 text-[10px] flex justify-between items-center">
                        <span className="text-slate-300">Acrylic Wall Frame</span>
                        <span className="text-purple-300 font-bold">Handed Over</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behind-The-Scenes Explanation */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950">
                <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 block mb-1">
                  End-to-End Harmony:
                </span>
                From initial <strong>Preproduction</strong> planning to live <strong>Event</strong> data verification and specialized <strong>Postproduction</strong> revisions, the client experiences a transparent, continuous journey.
              </div>
            </div>
          )}
        </div>

        {/* Footer with "Continue" and "Back" Navigation Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Restart Tour"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onFillClientCredentials && (
              <button
                type="button"
                onClick={() => {
                  onFillClientCredentials()
                  onClose()
                }}
                className="px-4 py-2.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Auto-fill Client Login
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isLast ? (
                <>
                  <span>Restart Tour</span>
                  <RotateCcw size={14} />
                </>
              ) : (
                <>
                  <span>Continue to {STAGES[currentStep + 1]?.badge.split(':')[1] || 'Next'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
