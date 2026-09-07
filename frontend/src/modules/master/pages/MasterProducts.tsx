import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  CheckCircle2,
  Sparkles,
  Camera,
  Film,
  BookOpen,
  DollarSign,
  Clock,
  Users,
  Search,
  ArrowRight,
  Filter,
  Layers,
  X,
  Tag,
  Eye,
} from 'lucide-react';
import { api } from '../../../services/api';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  name: string;
  category: 'Wedding' | 'Pre-Wedding' | 'Albums' | 'Video' | 'Add-ons';
  description: string;
  price: number;
  duration: string;
  photographersCount?: number;
  editedPhotosCount?: number;
  album?: string;
  video?: string;
  addons?: string[];
  status: 'active' | 'inactive';
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'pkg_1',
    name: 'Classic Pre-Wedding',
    category: 'Pre-Wedding',
    description: 'Romantic 1-day couple session at 2 picturesque locations with 4K teaser video.',
    price: 45000,
    duration: '1 Day (6 Hours)',
    photographersCount: 1,
    editedPhotosCount: 40,
    album: 'Premium 20-Page Linen Book',
    video: '2-Min 4K Cinematic Teaser',
    addons: ['Drone Aerials', 'Smoke Bombs', 'Outfit Styling'],
    status: 'active',
  },
  {
    id: 'pkg_2',
    name: 'Royal Heritage Wedding',
    category: 'Wedding',
    description: 'Comprehensive 2-day multi-camera traditional and candid wedding coverage.',
    price: 185000,
    duration: '2 Days',
    photographersCount: 3,
    editedPhotosCount: 250,
    album: 'Handcrafted Leather Bound 50-Page Album',
    video: '15-Min Cinematic Highlight Film + Teaser',
    addons: ['Same-Day Edit', 'Live Drone Streaming', 'Parent Mini Albums'],
    status: 'active',
  },
  {
    id: 'pkg_3',
    name: 'Imperial Grand Wedding',
    category: 'Wedding',
    description: 'The ultimate luxury wedding experience featuring a full cinema crew and heirloom albums.',
    price: 350000,
    duration: '3 Days',
    photographersCount: 5,
    editedPhotosCount: 500,
    album: 'Two 60-Page Acrylic Glass Albums',
    video: '30-Min Feature Film + 3-Min Instagram Reel',
    addons: ['Director Cut', 'Vanity Van Styling', 'VR 360 Capture'],
    status: 'active',
  },
  {
    id: 'pkg_4',
    name: 'Handcrafted Heirloom Album',
    category: 'Albums',
    description: 'Custom-designed 40-page flush-mount album on archival metallic paper with custom debossing.',
    price: 25000,
    duration: 'Production: 14 Days',
    album: 'Italian Velvet / Leatherette Cover',
    status: 'active',
  },
  {
    id: 'pkg_5',
    name: '4K Cinematic Drone Coverage',
    category: 'Video',
    description: 'Licensed DGCA drone pilot capturing breathtaking aerial perspectives of the venue and couple.',
    price: 20000,
    duration: 'Per Day (4 Flights)',
    video: '4K ProRes Aerial Log Footage',
    status: 'active',
  },
];

export default function MasterProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductItem | null>(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Wedding' as const,
    price: '',
    duration: '1 Day',
    description: '',
  });

  useEffect(() => {
    // Fetch live packages from backend API
    api.getSalesPackages()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped: ProductItem[] = res.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: (p.category || 'Wedding') as any,
            description: p.description || '',
            price: Number(p.price) || 50000,
            duration: p.duration || '1 Day',
            photographersCount: p.photographers_count || p.photographersCount || 2,
            editedPhotosCount: p.edited_photos_count || p.editedPhotosCount || 100,
            album: p.album || 'Standard Album',
            video: p.video || 'Cinematic Highlight',
            addons: Array.isArray(p.addons) ? p.addons : [],
            status: p.status || 'active',
          }));
          setProducts(mapped);
        }
      })
      .catch((err) => console.warn('Using cached products data:', err));
  }, []);

  const categories = ['All', 'Wedding', 'Pre-Wedding', 'Albums', 'Video', 'Add-ons'];

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please enter product name and price');
      return;
    }

    const created: ProductItem = {
      id: `pkg_${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      duration: newProduct.duration,
      description: newProduct.description,
      status: 'active',
    };

    setProducts([created, ...products]);
    setShowAddModal(false);
    setNewProduct({ name: '', category: 'Wedding', price: '', duration: '1 Day', description: '' });
    toast.success(`Created product "${created.name}"`);
  };

  const handleSelectForQuotation = (prod: ProductItem) => {
    toast.success(`Selected "${prod.name}" for quotation`);
    navigate('/sales/quotation');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold mb-1.5">
            <Package className="w-3.5 h-3.5" />
            <span>Master Studio Catalog</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17152B] tracking-tight uppercase">
            Products & Photography Packages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your photography packages, heirloom albums, cinematography films, and add-on services.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5E35B1] hover:bg-[#512DA8] text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product / Package</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E1F2] shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#5E35B1] text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products & packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5E35B1] transition-all"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((prod) => (
          <motion.div
            key={prod.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="bg-white rounded-2xl border border-[#E5E1F2] p-5 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Category & Duration */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200/80">
                  {prod.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{prod.duration}</span>
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-extrabold text-[#17152B] group-hover:text-[#5E35B1] transition-colors line-clamp-1">
                {prod.name}
              </h3>

              {/* Concise 1-line summary */}
              <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                {prod.description}
              </p>

              {/* Clean key highlight badges in a single compact row */}
              <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-slate-100">
                {prod.photographersCount && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-slate-700 text-[11px] font-semibold">
                    <Camera className="w-3 h-3 text-purple-600" />
                    <span>{prod.photographersCount} Crew</span>
                  </span>
                )}
                {prod.album && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-slate-700 text-[11px] font-semibold">
                    <BookOpen className="w-3 h-3 text-indigo-600" />
                    <span>Album</span>
                  </span>
                )}
                {prod.video && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-slate-700 text-[11px] font-semibold">
                    <Film className="w-3 h-3 text-blue-600" />
                    <span>4K Video</span>
                  </span>
                )}
              </div>
            </div>

            {/* Price & Action Button */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">PRICE</span>
                <span className="text-lg font-black text-[#17152B] mt-0.5 block">
                  ₹{prod.price.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductDetail(prod)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  Details
                </button>
                <button
                  onClick={() => handleSelectForQuotation(prod)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5E35B1] hover:bg-[#512DA8] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <span>Use in Quotation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 border border-[#E5E1F2] shadow-xl w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[#17152B] uppercase tracking-tight">
                  Add New Product / Package
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Signature Sunset Couple Session"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#5E35B1]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Pre-Wedding">Pre-Wedding</option>
                      <option value="Albums">Albums</option>
                      <option value="Video">Video</option>
                      <option value="Add-ons">Add-ons</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="45000"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#5E35B1]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration / Turnaround</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Day (8 Hours)"
                    value={newProduct.duration}
                    onChange={(e) => setNewProduct({ ...newProduct, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe deliverables, cameras, crew, and special features..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#5E35B1] hover:bg-[#512DA8] text-white rounded-xl font-bold shadow-md shadow-purple-900/10"
                  >
                    Create Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* View Full Package Details Modal */}
        {selectedProductDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 border border-[#E5E1F2] shadow-xl w-full max-w-lg space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                    {selectedProductDetail.category} · {selectedProductDetail.duration}
                  </span>
                  <h3 className="text-lg font-black text-[#17152B] mt-1">
                    {selectedProductDetail.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProductDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedProductDetail.description}
              </p>

              {/* Deliverables breakdown */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Deliverables & Coverage Specs
                </span>
                {selectedProductDetail.photographersCount && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Camera className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{selectedProductDetail.photographersCount} Dedicated Photographers · {selectedProductDetail.editedPhotosCount || 200} High-Res Retouched Photos</span>
                  </div>
                )}
                {selectedProductDetail.album && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{selectedProductDetail.album}</span>
                  </div>
                )}
                {selectedProductDetail.video && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Film className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{selectedProductDetail.video}</span>
                  </div>
                )}
              </div>

              {/* Addons if any */}
              {selectedProductDetail.addons && selectedProductDetail.addons.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Included Add-ons
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedProductDetail.addons.map((add) => (
                      <span key={add} className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200/60">
                        +{add}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL PRICE</span>
                  <span className="text-xl font-black text-[#17152B]">
                    ₹{selectedProductDetail.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProductDetail(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleSelectForQuotation(selectedProductDetail);
                      setSelectedProductDetail(null);
                    }}
                    className="px-4 py-2 bg-[#5E35B1] hover:bg-[#512DA8] text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/10"
                  >
                    Use in Quotation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
