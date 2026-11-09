import React from 'react';
import { Compass, Phone, Mail, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  navigate: (route: string, params?: Record<string, string>) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#173D32] text-[#F8F7F2] border-t border-[#B89A56]/25 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main 4-Column Grid: Responsive 1 col (mobile) -> 2 cols (tablet) -> 4 cols (desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4 text-left">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded bg-[#B89A56] flex items-center justify-center text-[#173D32] shadow-sm shrink-0">
                <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                WANDERCMS
              </span>
            </button>

            <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-light">
              <strong className="text-white font-medium">Discover South India. Experience More.</strong> Thoughtfully curated Kerala backwater cruises, Munnar tea hills, and South Indian heritage journeys.
            </p>

            <div className="pt-1">
              <div className="text-[11px] text-[#B89A56] font-medium tracking-wide">
                Tour Operator Operations Centre · Kochi, Kerala, India
              </div>
              <div className="text-[11px] text-white/50 mt-1">
                48-member local team · 60+ holiday circuits
              </div>
            </div>
          </div>

          {/* Col 2: Destinations & Circuits */}
          <div className="text-left space-y-4">
            <h4
              onClick={() => navigate('destinations')}
              className="text-xs uppercase tracking-widest text-[#B89A56] font-bold cursor-pointer hover:underline flex items-center gap-1.5"
            >
              <span>Destinations & Circuits</span>
            </h4>
            
            <ul className="space-y-2 text-xs sm:text-sm text-white/80">
              <li>
                <button
                  onClick={() => navigate('destinations')}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>All South India Destinations</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('packages', { destination: 'Munnar' })}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>Munnar Tea Hills</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('packages', { destination: 'Alleppey' })}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>Alleppey Backwaters & Houseboats</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('packages', { destination: 'Thekkady' })}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>Thekkady & Periyar Forest</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('packages', { destination: 'Tamil Nadu' })}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>Madurai & Kanyakumari</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('packages', { destination: 'Wayanad' })}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>Wayanad Rainforest Retreats</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Explore */}
          <div className="text-left space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#B89A56] font-bold">
              Explore
            </h4>
            
            <ul className="space-y-2 text-xs sm:text-sm text-white/80">
              <li>
                <button
                  onClick={() => navigate('home')}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('packages')}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>Holiday Packages Catalog</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('destinations')}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>Destinations & Circuits</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('inspiration')}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>Travel Inspiration & Guides</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('about')}
                  className="w-full text-left py-0.5 hover:text-[#B89A56] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56]/60 group-hover:bg-[#B89A56] shrink-0" />
                  <span>About Our Team</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('traveller-dashboard')}
                  className="w-full text-left py-0.5 text-[#B89A56] hover:text-[#e4cf9b] font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A56] shrink-0" />
                  <span>Traveller Portal (My Trips & Quotes)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('login')}
                  className="w-full text-left py-0.5 text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                  <span>Staff Operations CMS</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Operations & Inquiries */}
          <div className="text-left space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#B89A56] font-bold">
              Operations & Inquiries
            </h4>
            
            <div className="space-y-3 text-xs sm:text-sm text-white/80">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B89A56] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span>Marine Drive, Ernakulam</span>
                  <span className="block text-white/60 text-xs">Kochi, Kerala 682011</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#B89A56] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-mono text-xs">+91 (0484) 238-0000</span>
                  <span className="block text-white/60 text-[11px]">Mon–Sat, 9AM–7PM IST</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#B89A56] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <a
                    href="mailto:holidays@wandercms.com"
                    className="text-xs hover:text-[#B89A56] transition-colors font-medium"
                  >
                    holidays@wandercms.com
                  </a>
                  <span className="block text-white/60 text-[11px] mt-0.5">
                    Central Reservations & Tour Inquiries
                  </span>
                </div>
              </div>

              {/* License & Operational Info Badge */}
              <div className="pt-2 space-y-1.5">
                <div className="p-2.5 rounded bg-white/5 border border-white/10 text-[11px] text-white/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-[#B89A56]">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Licensed South India Tour Operator</span>
                  </div>
                  <div className="text-white/60 text-[10px] leading-tight">
                    Govt. of Kerala Tourism Reg. #KL-TO-4829
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/60 pt-0.5 border-t border-white/10">
                    <CheckCircle2 className="w-3 h-3 text-[#B89A56]" />
                    <span>Kochi Headquarters · Marine Drive, Ernakulam</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Clean copyright and compliance metadata */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/60 gap-4 text-center md:text-left">
          <div>
            <p>© {new Date().getFullYear()} WanderCMS Tour Operations. All rights reserved.</p>
            <p className="text-[11px] text-white/50 mt-0.5">
              Production tour operations platform with verified seasonal tariffs, GST calculations, and centralized enquiry processing.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1 text-[11px] text-[#B89A56]">
            <span>Twin-Sharing Tariffs</span>
            <span className="text-white/30 hidden sm:inline">·</span>
            <span>5% Standard GST Compliant</span>
            <span className="text-white/30 hidden sm:inline">·</span>
            <span>Deterministic 100-pt Ranking</span>
            <span className="text-white/30 hidden sm:inline">·</span>
            <span>Groq LLaMA 3.3 Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
