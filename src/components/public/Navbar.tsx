import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Compass, ShieldCheck, Menu, X, User } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string, params?: Record<string, string>) => void;
  openEnquiryModal: (prefill?: { destination?: string; packageTitle?: string }) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, openEnquiryModal }) => {
  const { user, isAdmin, isTraveller } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (route: string, params?: Record<string, string>) => {
    navigate(route, params);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F2]/95 backdrop-blur-md border-b border-[#173D32]/10 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <button
          onClick={() => handleNavClick('home')}
          className="group flex items-center gap-2.5 text-left focus:outline-none shrink-0"
        >
          <div className="w-9 h-9 rounded bg-[#173D32] flex items-center justify-center text-[#B89A56] shadow-sm">
            <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-[#173D32] whitespace-nowrap">
            WANDERCMS
          </span>
        </button>

        {/* Zone 2: Desktop 4-5 Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#252525]/80">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors hover:text-[#173D32] whitespace-nowrap shrink-0 ${
              currentRoute === 'home' ? 'text-[#173D32] font-bold border-b-2 border-[#173D32] pb-0.5' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('packages')}
            className={`transition-colors hover:text-[#173D32] whitespace-nowrap shrink-0 ${
              currentRoute === 'packages' ? 'text-[#173D32] font-bold border-b-2 border-[#173D32] pb-0.5' : ''
            }`}
          >
            Packages
          </button>
          <button
            onClick={() => handleNavClick('destinations')}
            className={`transition-colors hover:text-[#173D32] whitespace-nowrap shrink-0 ${
              currentRoute === 'destinations' ? 'text-[#173D32] font-bold border-b-2 border-[#173D32] pb-0.5' : ''
            }`}
          >
            Destinations & Circuits
          </button>
          <button
            onClick={() => handleNavClick('inspiration')}
            className={`transition-colors hover:text-[#173D32] whitespace-nowrap shrink-0 ${
              currentRoute === 'inspiration' ? 'text-[#173D32] font-bold border-b-2 border-[#173D32] pb-0.5' : ''
            }`}
          >
            Travel Inspiration
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`transition-colors hover:text-[#173D32] whitespace-nowrap shrink-0 ${
              currentRoute === 'about' ? 'text-[#173D32] font-bold border-b-2 border-[#173D32] pb-0.5' : ''
            }`}
          >
            About
          </button>
        </nav>

        {/* Zone 3: Actions (Enquire Now + Portal Switch + Mobile Menu Toggle) */}
        <div className="flex items-center gap-3 shrink-0">
          {isAdmin ? (
            <button
              onClick={() => handleNavClick('admin-dashboard')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded border border-[#173D32]/20 text-[#173D32] hover:bg-[#173D32]/5 transition-colors whitespace-nowrap"
              title="Signed in as Staff Admin"
            >
              <ShieldCheck className="w-4 h-4 text-[#B89A56]" />
              Staff CMS
            </button>
          ) : isTraveller ? (
            <button
              onClick={() => handleNavClick('traveller-dashboard')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded border border-[#B89A56]/40 bg-[#173D32]/5 text-[#173D32] hover:bg-[#173D32]/10 transition-colors whitespace-nowrap"
              title={`Signed in as ${user?.name}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <User className="w-3.5 h-3.5 text-[#B89A56]" />
              <span>My Trips ({user?.name ? user.name.split(' ')[0] : 'Portal'})</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="hidden sm:block text-xs font-medium text-[#252525]/70 hover:text-[#173D32] transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => openEnquiryModal()}
            className="px-4 sm:px-5 py-2.5 text-xs font-semibold text-white bg-[#173D32] hover:bg-[#122e25] rounded transition-all shadow-sm hover:shadow active:scale-[0.99] whitespace-nowrap"
          >
            Enquire Now
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded text-[#173D32] hover:bg-[#173D32]/5 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#173D32]/10 px-6 py-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-[#252525]">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-left py-2 px-3 rounded hover:bg-[#F8F7F2] ${
                currentRoute === 'home' ? 'text-[#173D32] font-bold bg-[#173D32]/5' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('packages')}
              className={`text-left py-2 px-3 rounded hover:bg-[#F8F7F2] ${
                currentRoute === 'packages' ? 'text-[#173D32] font-bold bg-[#173D32]/5' : ''
              }`}
            >
              Holiday Packages Catalog
            </button>
            <button
              onClick={() => handleNavClick('destinations')}
              className={`text-left py-2 px-3 rounded hover:bg-[#F8F7F2] ${
                currentRoute === 'destinations' ? 'text-[#173D32] font-bold bg-[#173D32]/5' : ''
              }`}
            >
              Destinations & Circuits
            </button>
            <button
              onClick={() => handleNavClick('inspiration')}
              className={`text-left py-2 px-3 rounded hover:bg-[#F8F7F2] ${
                currentRoute === 'inspiration' ? 'text-[#173D32] font-bold bg-[#173D32]/5' : ''
              }`}
            >
              Travel Inspiration & Guides
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`text-left py-2 px-3 rounded hover:bg-[#F8F7F2] ${
                currentRoute === 'about' ? 'text-[#173D32] font-bold bg-[#173D32]/5' : ''
              }`}
            >
              About Our Operations Team
            </button>
            
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              {isAdmin ? (
                <button
                  onClick={() => handleNavClick('admin-dashboard')}
                  className="text-left py-2 px-3 text-xs font-semibold text-[#173D32] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#B89A56]" />
                  Staff Operations CMS
                </button>
              ) : isTraveller ? (
                <button
                  onClick={() => handleNavClick('traveller-dashboard')}
                  className="text-left py-2 px-3 text-xs font-semibold text-[#173D32] flex items-center gap-1.5"
                >
                  <User className="w-4 h-4 text-[#B89A56]" />
                  <span>Traveller Portal ({user?.name})</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="text-left py-2 px-3 text-xs font-semibold text-[#B89A56] hover:underline flex items-center gap-1.5"
                >
                  <span>Traveller & Staff Sign In</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
