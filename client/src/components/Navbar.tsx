import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Menu, X, Sparkles, ArrowRight, LogIn } from 'lucide-react';

interface NavbarProps {
  onOpenDemo?: () => void;
  onOpenContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemo, onOpenContact }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact', onClick: onOpenContact },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Main Navigation Bar - White Glassmorphism */}
      <div className={`transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 text-slate-900 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider uppercase font-display leading-tight text-slate-900">
                DEMO PROJECT
              </span>
              <span className="text-[10px] text-purple-600 tracking-widest uppercase font-bold -mt-0.5">
                Great Master & Studio Admin
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50/60 transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action CTA Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50/60 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>Login</span>
            </button>

            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2.5 rounded-full text-sm font-bold bg-[#5E35B1] hover:bg-[#512DA8] text-white shadow-md shadow-purple-900/20 hover:shadow-lg hover:shadow-purple-900/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
              <span>Start Free Trial</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => navigate('/signup')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#5E35B1] text-white shadow-sm"
            >
              Free Trial
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="sm:hidden bg-white border-t border-slate-100 text-slate-800 px-4 py-6 shadow-2xl"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (link.onClick) {
                      e.preventDefault();
                      link.onClick();
                    }
                  }}
                  className="px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all flex items-center justify-between"
                >
                  {link.name}
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </a>
              ))}

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-800 hover:bg-slate-50"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/signup');
                  }}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-[#5E35B1] text-white hover:bg-[#512DA8] shadow-sm"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
