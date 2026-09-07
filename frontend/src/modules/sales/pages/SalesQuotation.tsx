import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Send,
  Eye,
  ArrowRight,
  Layers,
  Sparkles,
  DollarSign,
  Download,
  Calendar,
  User,
  Package,
  X,
  Check,
  Percent,
  Clock
} from 'lucide-react';
import { api } from '../../../services/api';

export default function SalesQuotation() {
  const [searchParams] = useSearchParams();
  const leadIdParam = searchParams.get('leadId');

  const [quotations, setQuotations] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState<any | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form State for Generator
  const [form, setForm] = useState({
    leadId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    eventDate: '',
    venue: '',
    packageId: '',
    packageName: '',
    basePrice: 150000,
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    discountPercent: 5,
    taxPercent: 18,
    notes: 'Includes high-resolution color graded pictures and cinematic teasers.',
    selectedAddons: [] as { name: string; price: number }[],
  });

  const availableAddons = [
    { name: 'Drone Aerial 4K Coverage', price: 15000 },
    { name: 'Same Day Teaser Video Edit (Reels ready)', price: 20000 },
    { name: 'Handcrafted Premium Leatherette Photobook (40 pages)', price: 18000 },
    { name: 'Additional Senior Candid Photographer', price: 12000 },
    { name: 'Live Streaming Setup with Dedicated Server', price: 25000 },
  ];

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [quotesRes, pkgsRes, leadsRes] = await Promise.all([
        api.getSalesQuotations(),
        api.getSalesPackages(),
        api.getSalesLeads(),
      ]);

      if (quotesRes.success) setQuotations(quotesRes.data || []);
      if (pkgsRes.success) setPackages(pkgsRes.data || []);
      if (leadsRes.success) {
        setLeads(leadsRes.data || []);

        // If URL param leadId is present, auto switch to create and populate lead!
        if (leadIdParam) {
          const matchedLead = leadsRes.data?.find((l: any) => l.id === leadIdParam);
          if (matchedLead) {
            setActiveTab('create');
            setForm((prev) => ({
              ...prev,
              leadId: matchedLead.id,
              clientName: matchedLead.clientName,
              clientPhone: matchedLead.phone,
              clientEmail: matchedLead.email || '',
              eventDate: matchedLead.eventDate || '',
              venue: matchedLead.location || '',
            }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load quotation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [leadIdParam]);

  // Handle Package Selection
  const handleSelectPackage = (pkgId: string) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setForm((prev) => ({
        ...prev,
        packageId: pkg.id,
        packageName: pkg.name,
        basePrice: pkg.price,
      }));
    }
  };

  // Toggle Addon
  const handleToggleAddon = (addon: { name: string; price: number }) => {
    const exists = form.selectedAddons.some((a) => a.name === addon.name);
    if (exists) {
      setForm((prev) => ({
        ...prev,
        selectedAddons: prev.selectedAddons.filter((a) => a.name !== addon.name),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        selectedAddons: [...prev.selectedAddons, addon],
      }));
    }
  };

  // Financial Calculations
  const addonsTotal = form.selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const subtotal = (form.basePrice || 0) + addonsTotal;
  const discountAmount = Math.round((subtotal * (form.discountPercent || 0)) / 100);
  const netBeforeTax = subtotal - discountAmount;
  const taxAmount = Math.round((netBeforeTax * (form.taxPercent || 0)) / 100);
  const finalPayable = netBeforeTax + taxAmount;

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName) {
      alert('Please enter client name or select lead');
      return;
    }

    try {
      const payload = {
        leadId: form.leadId || undefined,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        clientEmail: form.clientEmail,
        eventDate: form.eventDate,
        venue: form.venue,
        packageId: form.packageId || packages[0]?.id,
        packageName: form.packageName || packages[0]?.name || 'Standard Wedding Package',
        basePrice: form.basePrice,
        addons: form.selectedAddons,
        discountPercent: form.discountPercent,
        taxPercent: form.taxPercent,
        validUntil: form.validUntil,
        notes: form.notes,
      };

      const res = await api.createSalesQuotation(payload);
      if (res.success) {
        setActionNotice(`Quotation ${res.data.quotationNumber} generated successfully!`);
        setTimeout(() => setActionNotice(null), 4000);
        setActiveTab('list');
        loadInitialData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to create quotation');
    }
  };

  const handleUpdateStatus = async (quoteId: string, status: string) => {
    try {
      const res = await api.updateQuotationStatus(quoteId, status);
      if (res.success) {
        if (status === 'ACCEPTED') {
          setActionNotice('🎉 Quotation Accepted! Automatically converted to Client and Shoot Project in Pre-Production!');
        } else {
          setActionNotice(`Quotation status updated to ${status}`);
        }
        setTimeout(() => setActionNotice(null), 4500);
        loadInitialData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update quotation');
    }
  };

  const filteredQuotes = statusFilter === 'ALL'
    ? quotations
    : quotations.filter((q) => q.status === statusFilter);

  return (
    <div className="space-y-6 font-sans">
      {/* Banner */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <Link
            to="/pre-production/dashboard"
            className="underline font-extrabold text-emerald-950 flex items-center gap-1 shrink-0"
          >
            Go to Pre-Production <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152B] tracking-tight">
            Quotation & Proposal Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#68647A] mt-0.5">
            Create itemized photography proposals with package deliverables, discounts, and instant client conversion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-[#5B42F3] text-white shadow-md shadow-[#5B42F3]/25'
                : 'bg-white border border-[#E5E1F2] text-[#68647A] hover:text-[#17152B]'
            }`}
          >
            All Proposals ({quotations.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-[#5B42F3] text-white shadow-md shadow-[#5B42F3]/25'
                : 'bg-white border border-[#E5E1F2] text-[#68647A] hover:text-[#17152B]'
            }`}
          >
            <Plus size={15} />
            <span>Create New Quote</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* Quotation Generator Form Wizard */
        <form onSubmit={handleCreateQuotation} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Client & Event Information */}
            <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5E1F2]">
                <div className="p-2 bg-purple-50 text-[#5B42F3] rounded-xl">
                  <User size={16} />
                </div>
                <h3 className="font-extrabold text-sm text-[#17152B]">1. Client & Event Details</h3>
              </div>

              {leads.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Auto-Fill from Existing Pipeline Lead
                  </label>
                  <select
                    value={form.leadId}
                    onChange={(e) => {
                      const l = leads.find((x) => x.id === e.target.value);
                      if (l) {
                        setForm((prev) => ({
                          ...prev,
                          leadId: l.id,
                          clientName: l.clientName,
                          clientPhone: l.phone,
                          clientEmail: l.email || '',
                          eventDate: l.eventDate || '',
                          venue: l.location || '',
                        }));
                      } else {
                        setForm((prev) => ({ ...prev, leadId: '' }));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  >
                    <option value="">-- Choose a lead or enter custom client below --</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.clientName} ({l.eventType} - {l.location || 'Location TBD'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Client / Couple Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditya & Sneha"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Venue / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Leela Palace"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Quotation Valid Until
                  </label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Package & Deliverables */}
            <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5E1F2]">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package size={16} />
                </div>
                <h3 className="font-extrabold text-sm text-[#17152B]">2. Photography Package & Base Price</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map((pkg) => {
                  const isSelected = form.packageId === pkg.id || (!form.packageId && form.basePrice === pkg.price);
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#ECE8FD] border-[#5B42F3] shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-extrabold text-xs text-[#17152B] line-clamp-1">{pkg.name}</div>
                      <div className="text-xs font-extrabold text-[#5B42F3] mt-1">
                        ₹{(pkg.price || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                        {pkg.deliverables?.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Or Custom Base Price (₹)
                </label>
                <input
                  type="number"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                  className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#17152B] focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                />
              </div>
            </div>

            {/* Step 3: Optional Add-ons */}
            <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5E1F2]">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-extrabold text-sm text-[#17152B]">3. Add-on Services & Enhancements</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableAddons.map((addon, i) => {
                  const isChecked = form.selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <div
                      key={i}
                      onClick={() => handleToggleAddon(addon)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="rounded text-[#5B42F3] focus:ring-[#5B42F3]"
                        />
                        <span className="text-xs font-bold text-slate-800">{addon.name}</span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-600 shrink-0">
                        +₹{addon.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Price Calculation & Summary Card */}
          <div className="space-y-4">
            <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs sticky top-24 space-y-4">
              <h3 className="font-extrabold text-sm text-[#17152B] pb-3 border-b border-[#E5E1F2] flex items-center justify-between">
                <span>Quotation Summary</span>
                <span className="text-[10px] uppercase font-bold text-[#5B42F3] bg-[#ECE8FD] px-2 py-0.5 rounded-full">
                  Real-Time Calc
                </span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Base Package:</span>
                  <span className="font-bold text-[#17152B]">₹{form.basePrice.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Add-ons ({form.selectedAddons.length}):</span>
                  <span className="font-bold text-[#17152B]">₹{addonsTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-800 font-semibold">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={form.discountPercent}
                      onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      GST / Tax (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="28"
                      value={form.taxPercent}
                      onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-rose-600 font-semibold text-xs">
                  <span>Discount ({form.discountPercent}%):</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 text-xs">
                  <span>Taxes ({form.taxPercent}%):</span>
                  <span>+₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>

                {/* Final Total */}
                <div className="pt-3 border-t-2 border-[#E5E1F2] flex items-baseline justify-between">
                  <span className="font-extrabold text-sm text-[#17152B]">Final Amount:</span>
                  <span className="text-xl font-extrabold text-[#5B42F3]">
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Milestones Breakdown */}
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] space-y-1 text-purple-950">
                  <div className="font-bold flex items-center gap-1 text-[#5B42F3]">
                    <Clock size={12} /> Standard Payment Milestones
                  </div>
                  <div className="flex justify-between">
                    <span>30% Advance on Booking:</span>
                    <span className="font-bold">₹{Math.round(finalPayable * 0.3).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>50% On Shoot Day:</span>
                    <span className="font-bold">₹{Math.round(finalPayable * 0.5).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>20% Final Album Delivery:</span>
                    <span className="font-bold">₹{Math.round(finalPayable * 0.2).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-extrabold bg-[#5B42F3] hover:bg-[#4E35E0] text-white shadow-md shadow-[#5B42F3]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText size={15} />
                  <span>Generate Quotation Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Quotations List View */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['ALL', 'DRAFT', 'SENT', 'NEGOTIATION', 'ACCEPTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#5B42F3] text-white shadow-xs'
                    : 'bg-white border border-[#E5E1F2] text-[#68647A] hover:bg-[#F8F6FF]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuotes.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-extrabold text-[#5B42F3] bg-purple-50 px-2 py-0.5 rounded-md">
                        {q.quotationNumber}
                      </span>
                      <h3 className="font-extrabold text-sm text-[#17152B] mt-1.5">{q.clientName}</h3>
                      <p className="text-[11px] text-slate-500">{q.packageName}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      q.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      q.status === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      q.status === 'NEGOTIATION' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E1F2] space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Event Date:</span>
                      <span className="font-semibold text-slate-800">{q.eventDate || 'TBD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valid Till:</span>
                      <span className="font-semibold text-slate-800">{q.validUntil}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="font-bold text-slate-800">Final Price:</span>
                      <span className="text-base font-extrabold text-emerald-600">
                        ₹{(q.finalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#E5E1F2] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedQuoteForPreview(q)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#5B42F3] bg-[#ECE8FD] hover:bg-purple-200 transition-colors flex items-center gap-1"
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>

                  {q.status !== 'ACCEPTED' ? (
                    <div className="flex items-center gap-1.5">
                      {q.status === 'DRAFT' && (
                        <button
                          onClick={() => handleUpdateStatus(q.id, 'SENT')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1"
                        >
                          <Send size={12} />
                          <span>Send</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(q.id, 'ACCEPTED')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
                        title="Mark Accepted and Auto-Convert to Pre-Production Shoot"
                      >
                        <Check size={13} />
                        <span>Accept & Convert</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/pre-production/dashboard"
                      className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>In Pre-Production</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formal Proposal Preview Modal */}
      {selectedQuoteForPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E5E1F2] space-y-6 my-8 animate-in fade-in">
            {/* Proposal Header */}
            <div className="flex items-start justify-between border-b pb-4 border-[#E5E1F2]">
              <div>
                <div className="text-xl font-extrabold text-[#17152B] tracking-tight">LUMINA CREATIVE STUDIOS</div>
                <div className="text-xs text-slate-500">Premium Wedding & Event Cinematography</div>
                <div className="text-xs font-bold text-[#5B42F3] mt-1 font-mono">
                  PROPOSAL #{selectedQuoteForPreview.quotationNumber}
                </div>
              </div>
              <button
                onClick={() => setSelectedQuoteForPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Client & Proposal Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Client / Couple</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedQuoteForPreview.clientName}</span>
                <span className="block text-slate-600 mt-0.5">{selectedQuoteForPreview.clientPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Event Details</span>
                <span className="font-bold text-slate-900">{selectedQuoteForPreview.eventDate || 'Date TBD'}</span>
                <span className="block text-slate-600 mt-0.5">{selectedQuoteForPreview.venue || 'Venue TBD'}</span>
              </div>
            </div>

            {/* Scope / Package Details */}
            <div className="space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Selected Package & Scope</h4>
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                <div className="flex justify-between font-extrabold text-[#17152B] text-sm">
                  <span>{selectedQuoteForPreview.packageName}</span>
                  <span>₹{(selectedQuoteForPreview.basePrice || 0).toLocaleString('en-IN')}</span>
                </div>
                {selectedQuoteForPreview.deliverables && (
                  <ul className="mt-2 space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                    {selectedQuoteForPreview.deliverables.map((d: string, i: number) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedQuoteForPreview.addons?.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <h5 className="font-bold text-slate-700 text-[11px]">Add-ons & Upgrades</h5>
                  {selectedQuoteForPreview.addons.map((a: any, i: number) => (
                    <div key={i} className="flex justify-between text-slate-600 text-[11px] px-2 py-1 bg-slate-50 rounded">
                      <span>+ {a.name}</span>
                      <span className="font-semibold">₹{a.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Pricing Breakup */}
            <div className="bg-[#F8F6FF] border border-purple-200 p-4 rounded-xl text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{(selectedQuoteForPreview.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Special Discount ({selectedQuoteForPreview.discountPercent}%):</span>
                <span>-₹{(selectedQuoteForPreview.discountAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({selectedQuoteForPreview.taxPercent}%):</span>
                <span>+₹{(selectedQuoteForPreview.taxAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-purple-200 flex justify-between font-extrabold text-base text-[#5B42F3]">
                <span>Total Quotation Amount:</span>
                <span>₹{(selectedQuoteForPreview.finalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Print / Save PDF</span>
              </button>

              {selectedQuoteForPreview.status !== 'ACCEPTED' ? (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedQuoteForPreview.id, 'ACCEPTED');
                    setSelectedQuoteForPreview(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Accept Proposal & Handover to Pre-Production</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
                  Already Converted & Active in Pre-Production
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
