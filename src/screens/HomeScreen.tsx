import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TravelPackage } from '../types';
import { PackageCard } from '../components/public/PackageCard';
import { DESTINATION_IMAGES } from '../assets/images';
import { Search, Compass, Calendar, Users, MapPin, Sparkles, Shield, Clock, Award, ArrowRight } from 'lucide-react';

interface HomeScreenProps {
  navigate: (route: string, params?: Record<string, string>) => void;
  openEnquiryModal: (prefill?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigate, openEnquiryModal }) => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Search interface state (Section 6)
  const [destinationSearch, setDestinationSearch] = useState('All');
  const [travelMonth, setTravelMonth] = useState('October–March (Peak)');
  const [travellers, setTravellers] = useState('2 Travellers');

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await api.getPublishedPackages();
        setPackages(res.packages);
      } catch (e) {
        console.error('Failed to load featured packages:', e);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('packages', { destination: destinationSearch });
  };

  const destinationsList = [
    {
      name: 'Munnar',
      state: 'Kerala',
      subtitle: 'Tea hills & mist-draped peaks',
      image: DESTINATION_IMAGES.munnarTea,
      searchQuery: 'Munnar',
    },
    {
      name: 'Alleppey',
      state: 'Kerala',
      subtitle: 'Serene backwaters & private houseboats',
      image: DESTINATION_IMAGES.alleppeyHouseboat,
      searchQuery: 'Alleppey',
    },
    {
      name: 'Thekkady',
      state: 'Kerala',
      subtitle: 'Periyar tiger reserve & spice gardens',
      image: DESTINATION_IMAGES.thekkadyForest,
      searchQuery: 'Thekkady',
    },
    {
      name: 'Madurai',
      state: 'Tamil Nadu',
      subtitle: 'Ancient Dravidian temple architecture',
      image: DESTINATION_IMAGES.maduraiTemple,
      searchQuery: 'Madurai',
    },
    {
      name: 'Rameswaram',
      state: 'Tamil Nadu',
      subtitle: 'Pamban sea bridge & sacred shores',
      image: DESTINATION_IMAGES.rameswaramBridge,
      searchQuery: 'Rameswaram',
    },
    {
      name: 'Kanyakumari',
      state: 'Tamil Nadu',
      subtitle: 'Tricolored ocean confluence & memorial',
      image: DESTINATION_IMAGES.kanyakumariSunset,
      searchQuery: 'Kanyakumari',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION (Screen 1) */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Full-width Kerala Travel Photograph Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={DESTINATION_IMAGES.heroKerala}
            alt="Munnar Kerala Tea Plantations"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173D32]/80 via-transparent to-black/30" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full">
          <div className="max-w-2xl text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#B89A56]/20 backdrop-blur-md border border-[#B89A56]/40 text-[#B89A56] text-xs font-semibold tracking-wide uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>South India Tour Operator · Kochi, Kerala</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-balance">
              Discover the Beauty of South India
            </h1>

            <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-xl font-light">
              Thoughtfully designed journeys through Kerala and beyond. From misty Western Ghat tea plantations to private backwater houseboats.
            </p>
          </div>

          {/* Search Interface Bar */}
          <div className="mt-10 max-w-4xl bg-white rounded-xl shadow-2xl p-4 sm:p-5 border border-[#173D32]/10 backdrop-blur-md">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              {/* Destination */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#173D32] font-bold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#B89A56]" />
                  Destination
                </label>
                <select
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  className="w-full text-xs font-medium text-[#252525] bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                >
                  <option value="All">All South India</option>
                  <option value="Munnar">Munnar Tea Hills</option>
                  <option value="Alleppey">Alleppey Houseboats</option>
                  <option value="Thekkady">Thekkady Wildlife</option>
                  <option value="Wayanad">Wayanad Rainforest</option>
                  <option value="Tamil Nadu">Tamil Nadu Heritage</option>
                </select>
              </div>

              {/* Travel Month */}
              <div className="sm:border-l sm:border-[#173D32]/10 sm:pl-4">
                <label className="block text-[11px] uppercase tracking-wider text-[#173D32] font-bold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#B89A56]" />
                  Travel Season
                </label>
                <select
                  value={travelMonth}
                  onChange={(e) => setTravelMonth(e.target.value)}
                  className="w-full text-xs font-medium text-[#252525] bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                >
                  <option value="October–March (Peak)">October–March (Peak Season)</option>
                  <option value="June–September (Monsoon)">June–September (Monsoon Ayurvedic)</option>
                  <option value="April–May (Summer)">April–May (Hill Station Retreat)</option>
                  <option value="All Year">Flexible / All Year</option>
                </select>
              </div>

              {/* Number of Travellers */}
              <div className="sm:border-l sm:border-[#173D32]/10 sm:pl-4">
                <label className="block text-[11px] uppercase tracking-wider text-[#173D32] font-bold mb-1 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#B89A56]" />
                  Travellers
                </label>
                <select
                  value={travellers}
                  onChange={(e) => setTravellers(e.target.value)}
                  className="w-full text-xs font-medium text-[#252525] bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                >
                  <option value="2 Travellers">2 Adults (Couple / Twin)</option>
                  <option value="Family">2 Adults + 1-2 Children</option>
                  <option value="Group">Small Group (4-8 pax)</option>
                  <option value="Solo">Solo Traveler</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="sm:pl-2">
                <button
                  type="submit"
                  className="w-full h-11 px-5 rounded-lg bg-[#173D32] text-white hover:bg-[#122e25] text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                >
                  <Search className="w-4 h-4 text-[#B89A56]" />
                  <span>Search Packages</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS SECTION (Section 6) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold mb-2">
              Curated Destinations
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#173D32]">
              Popular South India Destinations
            </h2>
          </div>
          <button
            onClick={() => navigate('destinations')}
            className="text-xs font-semibold text-[#173D32] hover:text-[#B89A56] flex items-center gap-1.5 transition-colors"
          >
            <span>Explore All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinationsList.map((dest) => (
            <div
              key={dest.name}
              onClick={() => navigate('packages', { destination: dest.searchQuery })}
              className="group relative rounded-lg overflow-hidden cursor-pointer aspect-[3/4] bg-neutral-100 border border-[#173D32]/10 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <img
                src={dest.image}
                alt={dest.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase tracking-wider text-[#B89A56] font-semibold">
                  {dest.state}
                </span>
                <h3 className="font-display text-base font-bold leading-tight mt-0.5">
                  {dest.name}
                </h3>
                <p className="text-[10px] text-white/70 line-clamp-1 mt-0.5">
                  {dest.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PACKAGES SECTION (Section 6) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold mb-2">
              Verified Tariffs
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#173D32]">
              Featured Holiday Packages
            </h2>
          </div>
          <button
            onClick={() => navigate('packages')}
            className="px-4 py-2 text-xs font-semibold rounded border border-[#173D32]/20 text-[#173D32] hover:bg-[#173D32]/5 transition-colors"
          >
            Explore All 60+ Packages
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-lg bg-neutral-200 animate-pulse" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-neutral-200 p-8">
            <Compass className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <p className="text-sm text-neutral-600">No published packages currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onViewDetails={(slug) => navigate('package-detail', { slug })}
                onEnquire={(p) => openEnquiryModal({ packageTitle: p.title, destination: p.destination })}
              />
            ))}
          </div>
        )}
      </section>

      {/* WHY TRAVEL WITH US SECTION (Section 6: Service-oriented, no invented awards) */}
      <section className="bg-white border-y border-[#173D32]/10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold">
              The WanderCMS Assurance
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#173D32] mt-2">
              Why Travellers Choose Our Kerala Operations
            </h2>
            <p className="text-sm text-[#252525]/70 mt-2">
              Dedicated destination experts based directly in Kochi, managing end-to-end holiday experiences across South India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-[#F8F7F2] border border-[#173D32]/10 space-y-3">
              <div className="w-10 h-10 rounded bg-[#173D32] text-[#B89A56] flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#173D32]">
                Verified Seasonal Pricing
              </h3>
              <p className="text-xs text-[#252525]/70 leading-relaxed">
                Direct seasonal tariffs maintained directly by our operations team. Transparent twin-sharing rates with all government GST and accommodation details clearly stated.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#F8F7F2] border border-[#173D32]/10 space-y-3">
              <div className="w-10 h-10 rounded bg-[#173D32] text-[#B89A56] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#173D32]">
                Rapid Enquiry Response
              </h3>
              <p className="text-xs text-[#252525]/70 leading-relaxed">
                Our centralized AI enquiry processing engine instantly analyzes travel group size, dates, and houseboat requirements, ensuring human specialists provide detailed quotes quickly.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#F8F7F2] border border-[#173D32]/10 space-y-3">
              <div className="w-10 h-10 rounded bg-[#173D32] text-[#B89A56] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#173D32]">
                Local Chauffeurs & Private Fleets
              </h3>
              <p className="text-xs text-[#252525]/70 leading-relaxed">
                Every package includes dedicated commercial air-conditioned vehicles and experienced chauffeurs with deep knowledge of ghat roads, temple timings, and spice plantations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRAVEL INSPIRATION SECTION (Section 6) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold mb-2">
              Insider Travel Knowledge
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#173D32]">
              Travel Inspiration & Backwater Guides
            </h2>
          </div>
          <button
            onClick={() => navigate('inspiration')}
            className="text-xs font-semibold text-[#173D32] hover:text-[#B89A56] flex items-center gap-1.5 transition-colors"
          >
            <span>Read All Guides</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            onClick={() => navigate('inspiration')}
            className="group cursor-pointer rounded-lg overflow-hidden border border-[#173D32]/10 bg-white hover:border-[#B89A56]/60 transition-all hover:shadow-md"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100">
              <img
                src={DESTINATION_IMAGES.backwaterCanoe}
                alt="Alleppey Houseboat Guide"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 space-y-2">
              <div className="text-xs text-[#B89A56] font-semibold uppercase tracking-wider">
                Kerala Backwaters · 4 min read
              </div>
              <h3 className="font-display text-xl font-bold text-[#173D32] group-hover:text-[#B89A56] transition-colors">
                Everything You Need to Know Before Booking a Private Alleppey Houseboat
              </h3>
              <p className="text-xs text-[#252525]/70 leading-relaxed">
                Deluxe vs Premium houseboats, air-conditioning operational hours, traditional Karimeen fish lunches, and optimal cruising routes along Vembanad Lake.
              </p>
            </div>
          </div>

          <div
            onClick={() => navigate('inspiration')}
            className="group cursor-pointer rounded-lg overflow-hidden border border-[#173D32]/10 bg-white hover:border-[#B89A56]/60 transition-all hover:shadow-md"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100">
              <img
                src={DESTINATION_IMAGES.wayanadRainforest}
                alt="Munnar Tea Plantations"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 space-y-2">
              <div className="text-xs text-[#B89A56] font-semibold uppercase tracking-wider">
                Western Ghats · 5 min read
              </div>
              <h3 className="font-display text-xl font-bold text-[#173D32] group-hover:text-[#B89A56] transition-colors">
                Munnar & Thekkady: The Ideal 5-Day Hills and Spice Corridors
              </h3>
              <p className="text-xs text-[#252525]/70 leading-relaxed">
                Tips for spotting the endangered Nilgiri Tahr at Eravikulam, visiting tea factories, and enjoying bamboo rafting through Periyar wildlife reserve.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
