import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Search,
  Building2,
  Users,
  Camera,
  UserCheck,
  PackageCheck,
  ArrowRight,
  Sparkles,
  X,
  CornerDownLeft,
} from 'lucide-react';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioId?: string;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  isOpen,
  onClose,
  studioId,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({
    studios: [],
    clients: [],
    shoots: [],
    photographers: [],
    deliverables: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (!query) {
        // Load initial popular results
        api.search('wedding', studioId).then((res) => {
          if (res.success) setResults(res.data);
        });
      }
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    const debounce = setTimeout(() => {
      api.search(query, studioId)
        .then((res) => {
          if (res.success) setResults(res.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, 150);

    return () => clearTimeout(debounce);
  }, [query, studioId]);

  // Flattened list for keyboard navigation
  const allItems: any[] = [
    ...(results.clients || []),
    ...(results.shoots || []),
    ...(results.studios || []),
    ...(results.photographers || []),
    ...(results.deliverables || []),
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % (allItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allItems[selectedIndex];
        if (selected?.url) {
          navigate(selected.url);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allItems]);

  if (!isOpen) return null;

  const handleItemClick = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#5E35B1] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search studios, couples, shoots, photographers, deliverables..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 divide-y divide-slate-100">
          {/* CLIENTS SECTION */}
          {results.clients?.length > 0 && (
            <div className="space-y-1 pt-2 first:pt-0">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-rose-500" />
                <span>Clients & Couples</span>
              </div>
              <div className="space-y-1">
                {results.clients.map((c: any) => (
                  <div
                    key={c.id}
                    onClick={() => handleItemClick(c.url)}
                    className="p-2.5 rounded-2xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0">
                        👰
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#5E35B1] transition-colors">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500">{c.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>Open Project</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHOOTS SECTION */}
          {results.shoots?.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-500" />
                <span>Shoots & 14-Stage Projects</span>
              </div>
              <div className="space-y-1">
                {results.shoots.map((s: any) => (
                  <div
                    key={s.id}
                    onClick={() => handleItemClick(s.url)}
                    className="p-2.5 rounded-2xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#5E35B1] shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#5E35B1] transition-colors">
                            {s.title}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {s.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{s.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#5E35B1]">
                      {s.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STUDIOS SECTION */}
          {results.studios?.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#5E35B1]" />
                <span>Photography Studios</span>
              </div>
              <div className="space-y-1">
                {results.studios.map((st: any) => (
                  <div
                    key={st.id}
                    onClick={() => handleItemClick(st.url)}
                    className="p-2.5 rounded-2xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={st.image}
                        alt={st.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#5E35B1] transition-colors">
                          {st.title}
                        </h4>
                        <p className="text-xs text-slate-500">{st.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">{st.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHOTOGRAPHERS SECTION */}
          {results.photographers?.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Photographer Crew</span>
              </div>
              <div className="space-y-1">
                {results.photographers.map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => handleItemClick(p.url)}
                    className="p-2.5 rounded-2xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#5E35B1] transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500">{p.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-500">★ {p.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allItems.length === 0 && !loading && (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No matching photography records found</p>
              <p className="text-[11px] text-slate-400 mt-1">Try searching for couple names like "Arun & Priya", "Dream Frames", or "Karthik"</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↓</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵ Select</kbd>
          </div>
          <span className="font-semibold text-[#5E35B1]">Direct Object Jump</span>
        </div>
      </div>
    </div>
  );
};

export default CommandSearchModal;
