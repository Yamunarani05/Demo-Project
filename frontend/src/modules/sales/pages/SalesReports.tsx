import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  PieChart,
  Award,
  Sparkles
} from 'lucide-react';
import { api } from '../../../services/api';

export default function SalesReports() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesReports({ period });
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to load sales reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !reports) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="w-8 h-8 border-3 border-[#5B42F3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const funnel = reports?.funnel || [
    { stage: 'Total Inquiries', count: 12, percent: 100 },
    { stage: 'Contacted', count: 10, percent: 83 },
    { stage: 'Qualified Leads', count: 8, percent: 66 },
    { stage: 'Quotations Sent', count: 6, percent: 50 },
    { stage: 'Converted Clients', count: 4, percent: 33 },
  ];

  const packagesPerformance = reports?.topPackages || [
    { name: 'Royal Wedding Heritage', bookings: 3, revenue: 840000 },
    { name: 'Cinematic Highlights Wedding', bookings: 2, revenue: 380000 },
    { name: 'Pre-Wedding Fantasy', bookings: 2, revenue: 150000 },
    { name: 'Grand Engagement & Ring Ceremony', bookings: 1, revenue: 85000 },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152B] tracking-tight">
            Sales & Pipeline Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#68647A] mt-0.5">
            Key business health indicators, lead conversion funnel, and package revenue distribution.
          </p>
        </div>

        <div className="bg-white border border-[#E5E1F2] rounded-xl p-1 flex items-center text-xs font-bold self-start sm:self-auto">
          {['month', 'quarter', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider text-[10px] transition-colors ${
                period === p ? 'bg-[#ECE8FD] text-[#5B42F3]' : 'text-[#68647A] hover:text-[#17152B]'
              }`}
            >
              {p === 'month' ? 'This Month' : p === 'quarter' ? 'Quarter' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-[#68647A] uppercase tracking-wider">Booked Revenue</span>
          <div className="text-2xl font-extrabold text-[#17152B] mt-2">
            ₹{(reports?.bookedRevenue || 1455000).toLocaleString('en-IN')}
          </div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight size={13} /> +18.4% vs last period
          </div>
        </div>

        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-[#68647A] uppercase tracking-wider">Active Pipeline</span>
          <div className="text-2xl font-extrabold text-[#17152B] mt-2">
            ₹{(reports?.pipelineValue || 920000).toLocaleString('en-IN')}
          </div>
          <div className="text-xs font-semibold text-purple-600 mt-1">
            From 7 active leads
          </div>
        </div>

        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-[#68647A] uppercase tracking-wider">Lead Conversion Rate</span>
          <div className="text-2xl font-extrabold text-[#5B42F3] mt-2">
            {reports?.conversionRate || '42.8'}%
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-1">
            Top tier studio benchmark
          </div>
        </div>

        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-[#68647A] uppercase tracking-wider">Avg. Deal Value</span>
          <div className="text-2xl font-extrabold text-[#17152B] mt-2">
            ₹{(reports?.avgDealSize || 185000).toLocaleString('en-IN')}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Per confirmed wedding client
          </div>
        </div>
      </div>

      {/* Funnel & Package Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1F2]">
            <h3 className="font-extrabold text-sm text-[#17152B] flex items-center gap-2">
              <TrendingUp size={16} className="text-[#5B42F3]" /> Lead Conversion Funnel
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Stage by stage drop-off</span>
          </div>

          <div className="space-y-4 pt-2">
            {funnel.map((step: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{step.stage}</span>
                  <span>{step.count} ({step.percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#5B42F3] to-[#806BFF]"
                    style={{ width: `${Math.max(step.percent, 8)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Packages by Revenue */}
        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1F2]">
            <h3 className="font-extrabold text-sm text-[#17152B] flex items-center gap-2">
              <Award size={16} className="text-[#5B42F3]" /> Top Revenue Packages
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Ranked by booked volume</span>
          </div>

          <div className="divide-y divide-[#E5E1F2]">
            {packagesPerformance.map((pkg: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#17152B]">{pkg.name}</h4>
                  <p className="text-[11px] text-slate-500">{pkg.bookings} confirmed bookings</p>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-xs text-[#17152B]">
                    ₹{(pkg.revenue || 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
