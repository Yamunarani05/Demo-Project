import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  PlusCircle,
  Sparkles,
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  Heart,
  FileText,
  DollarSign,
  CheckCircle2,
  Camera,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClientOnboarding() {
  const { activeStudio, onboardClient } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    partnerName: '',
    email: '',
    phone: '',
    eventType: 'Destination Wedding',
    shootType: 'Both' as 'Pre-Wedding' | 'Post-Wedding' | 'Both',
    eventDate: '2026-11-15',
    location: 'Udaipur Palace & Lake Pichola',
    budget: 250000,
    notes: 'Sunset lake portraits, drone aerials, and 4K teaser delivery.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = [
    'Destination Wedding',
    'Royal Palace Celebration',
    'Beachside Celebration',
    'Traditional South Indian Wedding',
    'Contemporary Urban Wedding',
    'Intimate Heritage Shoot',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const createdClient = onboardClient(formData);
      toast.success(`Client "${createdClient.name}" onboarded successfully!`, {
        description: `Registered with Lead ID: ${createdClient.serialNumber}. Navigating to workspace...`,
      });
      setIsSubmitting(false);
      navigate(`/studio/clients/${createdClient.id}`);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/studio/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full font-bold">
          {activeStudio?.name} · Client Intake
        </span>
      </div>

      {/* Main Onboarding Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
        <div className="mb-6 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Client Project Onboarding</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Onboard New Photography Client
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register a new client couple, configure shoot deliverables, and initialize their interactive Pre-Wedding & Post-Wedding workflow pipelines.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Couple / Client Information */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Couple & Client Details</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Client / Couple Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul & Priya"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Partner / Bride Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="client@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 23456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Shoot Scope & Workflow Selection */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-600" />
              <span>Shoot Scope & Event Details</span>
            </h2>

            {/* Shoot Type Radio Pills */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Workflow Scope <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Pre-Wedding', 'Post-Wedding', 'Both'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, shootType: type })}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      formData.shootType === type
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-900/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{type}</span>
                    <span className="text-[10px] font-normal opacity-80">
                      {type === 'Both'
                        ? 'Pre & Post Pipelines'
                        : `${type} Workflow`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event / Celebration Type
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {eventTypes.map((et) => (
                    <option key={et} value={et}>
                      {et}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shoot / Event Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Shoot Venue <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ooty Pine Hills / Lake Resort"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Package Budget (INR)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="10000"
                    placeholder="250000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Creative Notes & Deliverables Requirements
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Drone video required, 100 edited portraits, teaser in 48 hours..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/studio/dashboard"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Onboard Client & Open Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
