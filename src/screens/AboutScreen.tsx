import React from 'react';
import { DESTINATION_IMAGES } from '../assets/images';
import { Compass, Users, MapPin, Shield, CheckCircle2, Award, Calendar } from 'lucide-react';

interface AboutScreenProps {
  navigate: (route: string) => void;
  openEnquiryModal: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ navigate, openEnquiryModal }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold">
          About WanderCMS Operations
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#173D32] leading-tight">
          Crafting Meaningful Journeys Across South India
        </h1>
        <p className="text-base text-[#252525]/80 leading-relaxed font-light">
          Headquartered in Kochi, Kerala, WanderCMS operates as a premier regional tour operator managing bespoke holidays, family vacations, and honeymoon getaways across Kerala, Tamil Nadu, and Karnataka.
        </p>
      </div>

      {/* Operations Overview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-[#173D32]/10 shadow-md">
          <img
            src={DESTINATION_IMAGES.alleppeyHouseboat}
            alt="Kerala Backwater Operations"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 text-white text-xs">
            <span className="font-bold">Operations Hub · Marine Drive, Kochi</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-[#173D32]">
              Local Ground Expertise & Transparent Operations
            </h2>
            <p className="text-xs sm:text-sm text-[#252525]/75 leading-relaxed">
              With 48 full-time travel planners, fleet logistics coordinators, and destination specialists in Kochi, our operations team handles approximately 4,300 holiday bookings annually across over 60 curated holiday circuits.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-white border border-[#173D32]/10 space-y-1">
              <span className="font-mono text-2xl font-bold text-[#173D32]">48</span>
              <span className="block text-[11px] text-[#252525]/60">Operations Staff & Planners</span>
            </div>
            <div className="p-4 rounded-lg bg-white border border-[#173D32]/10 space-y-1">
              <span className="font-mono text-2xl font-bold text-[#173D32]">~4,300</span>
              <span className="block text-[11px] text-[#252525]/60">Annual Holiday Bookings</span>
            </div>
            <div className="p-4 rounded-lg bg-white border border-[#173D32]/10 space-y-1">
              <span className="font-mono text-2xl font-bold text-[#173D32]">60+</span>
              <span className="block text-[11px] text-[#252525]/60">Verified Travel Circuits</span>
            </div>
            <div className="p-4 rounded-lg bg-white border border-[#173D32]/10 space-y-1">
              <span className="font-mono text-2xl font-bold text-[#173D32]">100%</span>
              <span className="block text-[11px] text-[#252525]/60">Government GST Compliant</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={openEnquiryModal}
              className="px-6 py-2.5 rounded bg-[#173D32] text-white text-xs font-semibold hover:bg-[#122e25] shadow-sm transition-all"
            >
              Connect with Our Travel Planners
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
