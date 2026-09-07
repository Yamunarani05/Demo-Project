import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Check,
  Plus,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Camera,
  Film,
  Award
} from 'lucide-react';
import { api } from '../../../services/api';

export default function SalesPackages() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    loadPackages();
  }, [selectedCategory]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesPackages({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      });
      if (res.success) {
        setPackages(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', 'Wedding', 'Pre-Wedding', 'Engagement', 'Portrait', 'Baby & Family'];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152B] tracking-tight">
            Photography Packages & Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#68647A] mt-0.5">
            Standardized and customizable photography service tiers with detailed deliverables.
          </p>
        </div>

        <Link
          to="/sales/quotations"
          className="bg-[#5B42F3] hover:bg-[#4E35E0] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5B42F3]/25 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles size={14} />
          <span>Launch Quotation Generator</span>
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#5B42F3] text-white shadow-xs'
                : 'bg-white border border-[#E5E1F2] text-[#68647A] hover:bg-[#F8F6FF]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-3 border-[#5B42F3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.id}
              className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#ECE8FD] text-[#5B42F3] border border-purple-200">
                    {pkg.category || 'Package'}
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award size={11} /> Best Seller
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-lg text-[#17152B] tracking-tight">{pkg.name}</h3>
                <p className="text-xs text-[#68647A] mt-1 line-clamp-2">
                  {pkg.description || 'Comprehensive photography and cinematic deliverables.'}
                </p>

                <div className="mt-4 pt-4 border-t border-[#E5E1F2]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">Starting from</span>
                    <span className="text-2xl font-extrabold text-[#17152B]">
                      ₹{(pkg.price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400">/ event</span>
                  </div>
                </div>

                {/* Deliverables List */}
                <div className="mt-5 space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    What's Included:
                  </span>
                  <ul className="space-y-2">
                    {pkg.deliverables?.map((deliv: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <Check size={14} className="text-[#5B42F3] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{deliv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-[#E5E1F2]">
                <Link
                  to={`/sales/quotations?packageId=${pkg.id}`}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#F8F6FF] hover:bg-[#5B42F3] text-[#5B42F3] hover:text-white border border-[#E5E1F2] hover:border-[#5B42F3] transition-all flex items-center justify-center gap-1.5 group-hover:shadow-xs"
                >
                  <span>Create Quote with this Package</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
