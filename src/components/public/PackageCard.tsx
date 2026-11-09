import React from 'react';
import { TravelPackage, getStartingPrice } from '../../types';
import { ArrowRight, Calendar, Star, MapPin } from 'lucide-react';

interface PackageCardProps {
  pkg: TravelPackage;
  onViewDetails: (slug: string) => void;
  onEnquire: (pkg: TravelPackage) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, onViewDetails, onEnquire }) => {
  const startingPrice = getStartingPrice(pkg);
  const primaryPhoto = pkg.photos && pkg.photos.length > 0 ? pkg.photos[0] : '/src/assets/images/hero_kerala_tea_mist_1794053733109.jpg';

  // Highlight season name if available
  const activeSeason = pkg.seasonalPrices?.[0]?.seasonName || 'Standard';

  return (
    <div className="group bg-white rounded-lg border border-[#173D32]/10 overflow-hidden flex flex-col transition-all hover:border-[#B89A56]/60 hover:shadow-lg">
      {/* Image Container with subtle zoom */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <img
          src={primaryPhoto}
          alt={pkg.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Measured subtle scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Location Text overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 font-medium truncate drop-shadow">
            <MapPin className="w-3.5 h-3.5 text-[#B89A56] shrink-0" />
            <span className="truncate">{pkg.destination}</span>
          </div>
          <span className="font-semibold px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[11px] whitespace-nowrap">
            {pkg.days}D / {pkg.nights}N
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata unboxed text with separators */}
          <div className="flex items-center gap-2 text-xs text-[#252525]/60 mb-2">
            <span className="flex items-center gap-1 text-[#173D32] font-semibold">
              <Star className="w-3.5 h-3.5 fill-[#B89A56] text-[#B89A56]" />
              {pkg.hotelCategory}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeSeason}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-[#252525]/50">{pkg.packageId}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(pkg.slug)}
            className="font-display text-lg font-bold text-[#173D32] group-hover:text-[#B89A56] transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {pkg.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-[#252525]/70 line-clamp-2 mt-2 leading-relaxed">
            {pkg.description}
          </p>
        </div>

        {/* Price & Actions Strip */}
        <div className="pt-5 mt-4 border-t border-[#173D32]/10">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#252525]/50 block">From</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono tabular-nums text-[#173D32]">
                  ₹{startingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#252525]/60">/ person</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-[#252525]/60">
              <p className="font-medium text-[#173D32]">{pkg.pricingBasis}</p>
              <p className="text-[10px] text-[#252525]/50">{pkg.gstInformation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onViewDetails(pkg.slug)}
              className="w-full py-2 px-3 text-xs font-semibold rounded border border-[#173D32]/20 text-[#173D32] hover:bg-[#173D32]/5 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEnquire(pkg)}
              className="w-full py-2 px-3 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25] transition-colors whitespace-nowrap shadow-sm"
            >
              Enquire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
