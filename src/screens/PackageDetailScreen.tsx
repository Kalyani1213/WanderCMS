import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TravelPackage, getStartingPrice } from '../types';
import {
  Compass,
  Star,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowLeft,
  Share2,
  AlertCircle,
  FileText,
  Check,
  Copy,
  MessageCircle,
  Mail,
  X,
} from 'lucide-react';

interface PackageDetailScreenProps {
  slug: string;
  isPreview?: boolean;
  navigate: (route: string, params?: Record<string, string>) => void;
  openEnquiryModal: (prefill?: any) => void;
}

export const PackageDetailScreen: React.FC<PackageDetailScreenProps> = ({
  slug,
  isPreview = false,
  navigate,
  openEnquiryModal,
}) => {
  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Interactive Share Modal & Clipboard Feedback State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/packages/${pkg?.slug || slug}`;
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setToastMessage('✓ Package link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error('Failed to copy link:', e);
      setToastMessage('Link ready to share: ' + url);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleOpenShare = () => {
    handleCopyLink();
    setIsShareModalOpen(true);
  };

  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getPackageBySlug(slug, isPreview);
        setPkg(res.package);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [slug, isPreview]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-neutral-200 rounded" />
        <div className="h-96 w-full bg-neutral-200 rounded-xl" />
        <div className="h-12 w-3/4 bg-neutral-200 rounded" />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#173D32]">Package Not Available</h2>
        <p className="text-sm text-[#252525]/70">
          {error || 'This package does not exist or is currently unpublished.'}
        </p>
        <button
          onClick={() => navigate('packages')}
          className="px-5 py-2.5 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25]"
        >
          Return to Packages
        </button>
      </div>
    );
  }

  const startingPrice = getStartingPrice(pkg);
  const photos = pkg.photos && pkg.photos.length > 0 ? pkg.photos : ['/src/assets/images/hero_kerala_tea_mist_1794053733109.jpg'];

  return (
    <div className="space-y-10 pb-20">
      {/* Draft Preview Banner (Section 12) */}
      {isPreview && (
        <div className="bg-[#B89A56] text-[#173D32] px-6 py-3 font-semibold text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#173D32] text-[#B89A56] text-[10px] uppercase font-bold tracking-wider">
              Staff Preview Mode
            </span>
            <span>
              Viewing Unpublished Draft (Version {pkg.currentDraftVersion || 1}). This version is NOT visible to public travellers.
            </span>
          </div>
          <button
            onClick={() => navigate('admin-packages')}
            className="px-3 py-1 rounded bg-[#173D32] text-white text-[11px] hover:bg-[#122e25]"
          >
            Back to CMS
          </button>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button
          onClick={() => navigate('packages')}
          className="flex items-center gap-1.5 text-xs font-medium text-[#252525]/70 hover:text-[#173D32] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all packages</span>
        </button>
      </div>

      {/* Main Image Gallery Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Large Photo */}
          <div className="lg:col-span-2 relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 border border-[#173D32]/10">
            <img
              src={photos[selectedPhotoIndex] || photos[0]}
              alt={pkg.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/50 backdrop-blur-md text-white text-xs font-medium">
              {pkg.destination}
            </div>
          </div>

          {/* Gallery Thumbnails */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
            {photos.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative aspect-[16/10] lg:aspect-auto lg:h-32 w-40 lg:w-full rounded-lg overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${
                  selectedPhotoIndex === idx
                    ? 'border-[#B89A56] ring-2 ring-[#B89A56]/20'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Body: Details & Sticky Booking Card */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left 2 Columns: Itinerary, Inclusions, Info */}
        <div className="lg:col-span-2 space-y-12">
          {/* Header & Meta */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#252525]/60">
              <span className="flex items-center gap-1 font-semibold text-[#173D32]">
                <Star className="w-4 h-4 fill-[#B89A56] text-[#B89A56]" />
                {pkg.hotelCategory} Category
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#173D32]">
                {pkg.days} Days / {pkg.nights} Nights
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] text-[#252525]/50">{pkg.packageId}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#173D32] leading-tight">
              {pkg.title}
            </h1>

            <p className="text-sm text-[#252525]/80 leading-relaxed font-light">
              {pkg.description}
            </p>

            {/* Highlights bullet chips */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] uppercase tracking-wider text-[#173D32] font-bold block mb-2">
                  Trip Highlights:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {pkg.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-[#173D32]/5 border border-[#173D32]/10 text-[#173D32]"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DAY-WISE ITINERARY (Section 8) */}
          <div className="space-y-6 pt-6 border-t border-[#173D32]/10">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold">
                Tour Blueprint
              </span>
              <h2 className="font-display text-2xl font-bold text-[#173D32] mt-1">
                Day-by-Day Detailed Itinerary
              </h2>
            </div>

            <div className="space-y-6">
              {pkg.itinerary.map((day) => (
                <div
                  key={day.day}
                  className="p-5 rounded-lg border border-[#173D32]/10 bg-white space-y-2 hover:border-[#B89A56]/50 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#173D32] text-white font-bold text-[11px]">
                      Day {day.day}
                    </span>
                    {day.mealsIncluded && (
                      <span className="text-[#B89A56] font-semibold">
                        Meals: {day.mealsIncluded}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-base font-bold text-[#173D32] pt-1">
                    {day.title}
                  </h3>

                  <p className="text-xs text-[#252525]/80 leading-relaxed">
                    {day.description}
                  </p>

                  {day.overnightStay && (
                    <div className="text-[11px] text-[#252525]/60 pt-2 border-t border-neutral-100 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B89A56]" />
                      <span>Overnight: <strong className="text-[#173D32]">{day.overnightStay}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* INCLUSIONS & EXCLUSIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#173D32]/10">
            {/* Inclusions */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-[#173D32] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                Package Inclusions
              </h3>
              <ul className="space-y-2.5 text-xs text-[#252525]/80">
                {pkg.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-[#173D32] flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Package Exclusions
              </h3>
              <ul className="space-y-2.5 text-xs text-[#252525]/80">
                {pkg.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold shrink-0">✕</span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* IMPORTANT TRAVEL INFORMATION */}
          <div className="p-6 rounded-lg bg-[#F8F7F2] border border-[#173D32]/10 space-y-3">
            <h3 className="font-display text-base font-bold text-[#173D32] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#B89A56]" />
              Important Booking & Local Travel Guidelines
            </h3>
            <ul className="space-y-1.5 text-xs text-[#252525]/75 leading-relaxed list-disc list-inside">
              <li>Houseboat air-conditioning operates from 9:00 PM to 6:00 AM in standard deluxe boats. (Full-time AC available on upgrade).</li>
              <li>Periyar Wildlife Sanctuary boat safari tickets are subject to Kerala Forest Department slot availability.</li>
              <li>Modest dress code required when visiting ancient Tamil Nadu and Kerala temples (dhotis/saris/shoulders covered).</li>
              <li>All packages are customized with private chauffeurs and exclusive commercial vehicles.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Booking Card & Seasonal Pricing Table */}
        <div className="space-y-6">
          <div className="sticky top-28 bg-white rounded-xl border border-[#173D32]/10 shadow-lg p-6 space-y-6">
            {/* Header Price */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#252525]/50 block">
                Seasonal Starting Tariff
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-3xl font-bold text-[#173D32]">
                  ₹{startingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#252525]/60 font-medium">/ person</span>
              </div>
              <div className="text-xs text-[#173D32] font-semibold mt-1">
                {pkg.pricingBasis}
              </div>
              <div className="text-[11px] text-[#252525]/50 mt-0.5">
                {pkg.gstInformation}
              </div>
            </div>

            {/* SEASONAL PRICING TABLE (Section 8 & 11) */}
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <span className="text-xs uppercase tracking-wider text-[#173D32] font-bold block">
                Seasonal Rate Breakdown
              </span>

              <div className="space-y-2">
                {pkg.seasonalPrices.map((sp) => (
                  <div
                    key={sp.id || sp.seasonName}
                    className="p-3 rounded-lg border border-[#173D32]/10 bg-[#F8F7F2] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#173D32]">{sp.seasonName}</div>
                      <div className="text-[11px] text-[#252525]/60">
                        {sp.startMonth} – {sp.endMonth}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#173D32]">
                        ₹{sp.pricePerPerson.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#252525]/50">per person</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => openEnquiryModal({ packageTitle: pkg.title, destination: pkg.destination, duration: `${pkg.days} days`, budget: startingPrice * 2 })}
                className="w-full py-3 px-4 rounded-lg bg-[#173D32] text-white hover:bg-[#122e25] font-semibold text-xs transition-all shadow-md active:scale-[0.99]"
              >
                Enquire for this Package
              </button>

              <button
                onClick={handleOpenShare}
                className={`w-full py-2.5 px-3 rounded-lg border font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                  copied
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-[#173D32]/20 text-[#173D32] hover:bg-[#173D32]/5'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-semibold">Link Copied! Share Options</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Package (WhatsApp / Copy Link)</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust markers */}
            <div className="pt-4 border-t border-neutral-100 text-[11px] text-[#252525]/60 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Verified Local Chauffeurs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Custom Itinerary Adaptation on Request</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>No Hidden Booking Fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SHARE PACKAGE MODAL */}
      {isShareModalOpen && pkg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShareModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#173D32]/10 space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B89A56] font-bold">
                  Direct Package Sharing
                </span>
                <h3 className="font-display text-xl font-bold text-[#173D32] mt-0.5">
                  Share this Holiday Package
                </h3>
                <p className="text-xs text-[#252525]/70 mt-1 line-clamp-1">
                  {pkg.title} · {pkg.days}D/{pkg.nights}N
                </p>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-label="Close Share Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Link Copy Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#173D32]">
                Package Direct URL:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 bg-[#F8F7F2] text-[#252525] select-all focus:outline-none focus:border-[#173D32]"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#173D32] hover:bg-[#122e25] text-white shadow-sm'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Opening this link will load this exact package detail page.</span>
              </p>
            </div>

            {/* Instant App Share Options */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <span className="block text-xs font-semibold text-[#173D32]">
                Share to Apps:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* WhatsApp Share Anchor */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `*${pkg.title}* (${pkg.days} Days / ${pkg.nights} Nights)\n` +
                    `Starting at ₹${startingPrice.toLocaleString('en-IN')}/person twin-sharing with private AC vehicle & local chauffeur.\n` +
                    `Destinations: ${pkg.destination}\n\n` +
                    `View the complete day-by-day itinerary & seasonal tariffs:\n${getShareUrl()}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share via WhatsApp</span>
                </a>

                {/* Email Share Anchor */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    `South India Travel Itinerary: ${pkg.title}`
                  )}&body=${encodeURIComponent(
                    `Hi,\n\nI wanted to share this South India holiday package with you:\n\n` +
                    `${pkg.title}\n` +
                    `Duration: ${pkg.days} Days / ${pkg.nights} Nights\n` +
                    `Starting Tariff: ₹${startingPrice.toLocaleString('en-IN')} per person on twin-sharing\n` +
                    `Destinations: ${pkg.destination}\n\n` +
                    `View detailed itinerary, accommodation categories, and seasonal tariffs here:\n${getShareUrl()}\n\n` +
                    `Best regards`
                  )}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 hover:bg-[#F8F7F2] text-[#252525] text-xs font-semibold transition-all"
                >
                  <Mail className="w-4 h-4 text-[#173D32]" />
                  <span>Share via Email</span>
                </a>
              </div>

              {/* Native Mobile / System Share */}
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  onClick={async () => {
                    try {
                      await navigator.share({
                        title: pkg.title,
                        text: `${pkg.title} - South India Holiday Package`,
                        url: getShareUrl(),
                      });
                    } catch (e) {
                      // user dismissed
                    }
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-lg border border-[#173D32]/20 text-[#173D32] hover:bg-[#173D32]/5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>More Device Sharing Options</span>
                </button>
              )}
            </div>

            {/* Footnote */}
            <div className="p-2.5 rounded-lg bg-[#F8F7F2] border border-[#173D32]/10 text-[11px] text-[#252525]/70 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B89A56] shrink-0" />
              <span>Full package itinerary and pricing will load directly for the recipient.</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Copy Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#173D32] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#B89A56]/40 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#B89A56] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
