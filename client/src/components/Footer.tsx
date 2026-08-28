import React, { useState } from 'react';
import { Camera, ArrowRight, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface FooterProps {
  onOpenContact: () => void;
  onOpenDemo: () => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenContact,
  onOpenDemo,
  onSuccess,
  onError,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.subscribeNewsletter(email);
      onSuccess(res.message || 'Subscribed to Demo Project updates!');
      setEmail('');
    } catch (err: any) {
      onError(err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-100">
          
          {/* Col 1: Brand & Description */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-lg tracking-wider font-display uppercase">
              <span className="text-brand-600 font-bold">—</span>
              <Camera className="w-5 h-5 text-brand-nav" />
              <span>DEMO PROJECT</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              The premier creative management ecosystem for professional photographers and creative studios.
            </p>

            {/* Newsletter Subscription */}
            <form onSubmit={handleSubscribe} className="pt-2 max-w-sm">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Stay in the loop
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-all bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-full bg-brand-nav hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center gap-1"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Join</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Col 2: PRODUCT */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900 font-display">
              PRODUCT
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#ai" className="hover:text-brand-600 transition-colors">
                  AI Enhancements
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-brand-600 transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: COMPANY */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900 font-display">
              COMPANY
            </h4>
            <ul className="space-y-3">
              <li>
                <button onClick={onOpenContact} className="hover:text-brand-600 transition-colors text-left">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-brand-600 transition-colors text-left">
                  Contact
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-brand-600 transition-colors text-left">
                  Careers
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: SOCIAL */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900 font-display">
              SOCIAL
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://behance.net"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition-colors"
                >
                  Behance
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Demo Project Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={onOpenContact} className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </button>
            <button onClick={onOpenContact} className="hover:text-slate-600 transition-colors">
              Terms of Service
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
