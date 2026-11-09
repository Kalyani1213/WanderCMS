import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TravelPackage } from '../types';
import { DESTINATION_IMAGES } from '../assets/images';
import {
  MapPin,
  Compass,
  Calendar,
  Clock,
  ArrowRight,
  Sun,
  CloudRain,
  Mountain,
  CheckCircle2,
  PhoneCall,
  Search,
} from 'lucide-react';

interface DestinationsScreenProps {
  navigate: (route: string, params?: Record<string, string>) => void;
  openEnquiryModal: (prefill?: any) => void;
}

interface DestinationItem {
  id: string;
  name: string;
  state: string;
  region: 'kerala-backwaters' | 'hills-tea' | 'tamilnadu-heritage' | 'wildlife-rainforest';
  regionLabel: string;
  subtitle: string;
  description: string;
  image: string;
  searchQuery: string;
  idealDuration: string;
  bestMonths: string;
  elevationOrVibe: string;
  highlights: string[];
  popularCircuit: string;
}

export const DestinationsScreen: React.FC<DestinationsScreenProps> = ({
  navigate,
  openEnquiryModal,
}) => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [activeRegionFilter, setActiveRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPackageCounts = async () => {
      try {
        const res = await api.getPublishedPackages();
        setPackages(res.packages);
      } catch (e) {
        console.error('Failed to load package catalog for destination screen:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPackageCounts();
  }, []);

  const destinations: DestinationItem[] = [
    {
      id: 'munnar',
      name: 'Munnar',
      state: 'Kerala',
      region: 'hills-tea',
      regionLabel: 'Western Ghats & Hills',
      subtitle: 'Tea hills, misty crests & Nilgiri Tahr sanctuaries',
      description:
        'Perched at 1,600 metres in the Idukki district, Munnar is South India’s premier hill retreat. Rolling manicured tea estates stretch across misty slopes, alongside endangered Nilgiri Tahr habitats at Eravikulam National Park and serene waters at Mattupetty Dam.',
      image: DESTINATION_IMAGES.munnarTea,
      searchQuery: 'Munnar',
      idealDuration: '3–4 Days',
      bestMonths: 'September to May',
      elevationOrVibe: '1,600m Elevation · Cool Mountain Air',
      highlights: [
        'Eravikulam National Park wildlife spotting',
        'Private tea factory tour & tasting session',
        'Echo Point & Kundala Lake pedal-boating',
        'Scenic sunset views from Top Station',
      ],
      popularCircuit: 'Kochi → Munnar → Thekkady → Alleppey',
    },
    {
      id: 'alleppey',
      name: 'Alleppey (Alappuzha)',
      state: 'Kerala',
      region: 'kerala-backwaters',
      regionLabel: 'Kerala Backwaters & Coast',
      subtitle: 'Vembanad Lake waterways & traditional Kettuvallam houseboats',
      description:
        'Celebrated as the Venice of the East, Alleppey is an intricate labyrinth of palm-fringed canals, tranquil lagoons, and paddy fields below sea level. Board an authentic thatch-roofed luxury houseboat for an overnight cruise with local coastal Karimeen delicacies.',
      image: DESTINATION_IMAGES.alleppeyHouseboat,
      searchQuery: 'Alleppey',
      idealDuration: '2–3 Days',
      bestMonths: 'October to March (Houseboats open year-round)',
      elevationOrVibe: 'Sea Level · Tranquil Waterways',
      highlights: [
        'Private overnight air-conditioned Kettuvallam cruise',
        'Authentic Kerala Syrian Christian fish curry lunch',
        'Canoe exploration of narrow village waterways',
        'Marari Beach golden sunset stroll',
      ],
      popularCircuit: 'Munnar → Alleppey → Marari Beach',
    },
    {
      id: 'thekkady',
      name: 'Thekkady & Periyar',
      state: 'Kerala',
      region: 'wildlife-rainforest',
      regionLabel: 'Wildlife & Rainforests',
      subtitle: 'Periyar Tiger Reserve, spice gardens & bamboo rafting',
      description:
        'Set high in the Cardamom Hills near Kumily, Thekkady offers pristine wildlife conservation and fragrant organic spice estates. Embark on a Periyar Lake boat safari to spot wild elephant herds, sambar deer, and rare hornbills along the water’s edge.',
      image: DESTINATION_IMAGES.thekkadyForest,
      searchQuery: 'Thekkady',
      idealDuration: '2–3 Days',
      bestMonths: 'September to April',
      elevationOrVibe: '900m Elevation · Cardamom Hills',
      highlights: [
        'Periyar wildlife sanctuary morning boat safari',
        'Guided aromatic cardamom & pepper garden walk',
        'Traditional Kalaripayattu martial arts showcase',
        'Full-day bamboo rafting deep into the forest reserve',
      ],
      popularCircuit: 'Munnar → Thekkady → Alleppey',
    },
    {
      id: 'wayanad',
      name: 'Wayanad',
      state: 'Kerala',
      region: 'wildlife-rainforest',
      regionLabel: 'Wildlife & Rainforests',
      subtitle: 'Mist-clad rainforests, prehistoric petroglyphs & waterfalls',
      description:
        'Spanning the green plateau of North Kerala along the Nilgiri Biosphere, Wayanad combines dense cloud forests, organic coffee plantations, and the ancient Neolithic cave petroglyphs of Edakkal. Ideal for travelers seeking secluded nature lodges.',
      image: DESTINATION_IMAGES.wayanadRainforest,
      searchQuery: 'Wayanad',
      idealDuration: '3–4 Days',
      bestMonths: 'October to May',
      elevationOrVibe: '700–2,100m · Cloud Forest Plateau',
      highlights: [
        'Edakkal Caves Neolithic stone engravings',
        'Banasura Sagar Dam — largest earthen dam in India',
        'Chembra Peak heart-shaped lake trek',
        'Muthanga Wildlife Sanctuary jeep safari',
      ],
      popularCircuit: 'Calicut → Wayanad → Kabini → Coorg',
    },
    {
      id: 'madurai',
      name: 'Madurai',
      state: 'Tamil Nadu',
      region: 'tamilnadu-heritage',
      regionLabel: 'Heritage & Temple Corridors',
      subtitle: 'Dravidian monumental gopurams & 2,500-year living culture',
      description:
        'One of the oldest continuously inhabited cities in the world, Madurai is centered around the breathtaking Meenakshi Amman Temple. Its soaring, colorfully carved gopurams, pillared Thousand Pillar hall, and night ceremony offer unmatched cultural depth.',
      image: DESTINATION_IMAGES.maduraiTemple,
      searchQuery: 'Madurai',
      idealDuration: '2 Days',
      bestMonths: 'October to March',
      elevationOrVibe: 'Cultural Heartland · Temple Town',
      highlights: [
        'Meenakshi Amman Temple evening procession',
        'Thirumalai Nayakkar Mahal Indo-Saracenic palace',
        'Gandhi Memorial Museum & historic archives',
        'Bustling night markets & Madurai Malli jasmine bazaars',
      ],
      popularCircuit: 'Madurai → Rameswaram → Kanyakumari',
    },
    {
      id: 'kanyakumari',
      name: 'Kanyakumari',
      state: 'Tamil Nadu',
      region: 'tamilnadu-heritage',
      regionLabel: 'Heritage & Temple Corridors',
      subtitle: 'Tricolored ocean confluence at India’s southernmost tip',
      description:
        'Where the Arabian Sea, Bay of Bengal, and Indian Ocean meet in harmony. Stand on the rocky peninsula to watch simultaneous sunsets and moonrises, and ferry across to the Vivekananda Rock Memorial and 133-foot Thiruvalluvar stone monument.',
      image: DESTINATION_IMAGES.kanyakumariSunset,
      searchQuery: 'Kanyakumari',
      idealDuration: '1–2 Days',
      bestMonths: 'October to March',
      elevationOrVibe: 'Cape Comorin · Confluence of 3 Oceans',
      highlights: [
        'Ferry to Vivekananda Rock & Thiruvalluvar statue',
        'Sunrise & sunset vantage points over tri-ocean waters',
        '3,000-year-old Bhagavathy Amman Temple',
        'Padmanabhapuram Palace wooden architecture excursion',
      ],
      popularCircuit: 'Rameswaram → Kanyakumari → Kovalam',
    },
    {
      id: 'varkala',
      name: 'Varkala & Kovalam',
      state: 'Kerala',
      region: 'kerala-backwaters',
      regionLabel: 'Kerala Backwaters & Coast',
      subtitle: 'Red laterite sea cliffs, golden sands & coastal Ayurvedic healing',
      description:
        'Kerala’s unique coastal gem where dramatic 15-metre red sandstone cliffs plunge directly into the turquoise Arabian Sea. Dotted with cliffside cafes, yoga ashrams, and natural mineral springs, Varkala offers relaxation with world-class Ayurvedic wellness.',
      image: DESTINATION_IMAGES.varkalaCliff,
      searchQuery: 'Varkala',
      idealDuration: '2–3 Days',
      bestMonths: 'September to April',
      elevationOrVibe: 'Clifftop Coast · Arabian Sea Sunset',
      highlights: [
        'North Cliff panoramic sunset boardwalk',
        'Natural mineral spring bath at Papanasam Beach',
        'Authentic Panchakarma Ayurvedic wellness consultation',
        'Janardhana Swami 2,000-year-old temple visit',
      ],
      popularCircuit: 'Alleppey → Varkala → Kovalam → Trivandrum',
    },
    {
      id: 'kochi',
      name: 'Fort Kochi & Ernakulam',
      state: 'Kerala',
      region: 'kerala-backwaters',
      regionLabel: 'Kerala Backwaters & Coast',
      subtitle: 'Historic spice port, colonial heritage & giant Chinese fishing nets',
      description:
        'The historic Gateway to South India, where Portuguese, Dutch, British, and Arab merchants traded cardamom and black gold for centuries. Walk quiet cobbled lanes, admire 14th-century Chinese fishing nets, and browse spice warehouses and Jewish synagogue antiques.',
      image: DESTINATION_IMAGES.kochiHarbor,
      searchQuery: 'Kochi',
      idealDuration: '2 Days',
      bestMonths: 'October to April',
      elevationOrVibe: 'Historic Port · Spice Capital',
      highlights: [
        'Cantilevered Chinese fishing nets at harbor sunset',
        'St. Francis Church — oldest European church in India',
        'Mattancherry Palace murals & Jew Town spice bazaar',
        'Live Kathakali dance performance with backstage makeup',
      ],
      popularCircuit: 'Kochi Arrival → Munnar → Thekkady → Alleppey',
    },
  ];

  // Filter destinations based on selected region & search
  const filteredDestinations = destinations.filter((item) => {
    const matchesRegion =
      activeRegionFilter === 'all' || item.region === activeRegionFilter;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  // Calculate live matching package counts for each destination
  const getPackageCountForDestination = (query: string): number => {
    return packages.filter(
      (pkg) =>
        pkg.destination.toLowerCase().includes(query.toLowerCase()) ||
        pkg.title.toLowerCase().includes(query.toLowerCase())
    ).length;
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO HEADER */}
      <section className="bg-[#173D32] text-white pt-16 pb-20 border-b border-[#B89A56]/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#B89A56]/20 border border-[#B89A56]/30 text-[#B89A56] text-xs font-semibold tracking-wider uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>Regional Circuit Guide · South India Operations</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance leading-tight">
              South India Destinations & Travel Circuits
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              Explore handpicked destinations across Kerala and Tamil Nadu. From mist-draped Western Ghat tea estates and private backwater houseboats to ancient Dravidian stone temples and coastal headlands.
            </p>
          </div>

          {/* Interactive Search & Region Filter Bar */}
          <div className="mt-10 bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/15 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-white/50" />
                <input
                  type="text"
                  placeholder="Search destinations by name, wildlife, temples, backwaters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-white/15 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#B89A56] transition-colors"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-white/70 hover:text-white px-3 py-2 underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Region Filter Segmented Tabs */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10 text-xs">
              {[
                { id: 'all', label: 'All Regions (8)' },
                { id: 'kerala-backwaters', label: 'Kerala Backwaters & Coast' },
                { id: 'hills-tea', label: 'Western Ghats & Tea Hills' },
                { id: 'tamilnadu-heritage', label: 'Tamil Nadu Heritage & Temples' },
                { id: 'wildlife-rainforest', label: 'Wildlife & Rainforests' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRegionFilter(tab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    activeRegionFilter === tab.id
                      ? 'bg-[#B89A56] text-[#173D32] font-semibold shadow-sm'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN DESTINATIONS GRID */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#173D32]/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold">
              Curated Geographies
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#173D32] mt-1">
              Featured Regional Destinations
            </h2>
          </div>
          <span className="text-xs text-[#252525]/60">
            Showing <strong className="text-[#173D32]">{filteredDestinations.length}</strong> of {destinations.length} destinations
          </span>
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-3">
            <Compass className="w-10 h-10 text-[#B89A56] mx-auto" />
            <h3 className="font-display text-lg font-bold text-[#173D32]">
              No destinations match your search
            </h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              Try searching for "Munnar", "Houseboat", "Temple", or reset your region filter.
            </p>
            <button
              onClick={() => {
                setActiveRegionFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredDestinations.map((dest) => {
              const livePackageCount = getPackageCountForDestination(dest.searchQuery);
              return (
                <div
                  key={dest.id}
                  className="bg-white rounded-xl border border-[#173D32]/10 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Aspect Banner with Scrim and Badges */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                      <img
                        src={dest.image}
                        alt={`${dest.name}, ${dest.state}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                        <span className="px-2.5 py-1 rounded bg-[#173D32]/85 backdrop-blur-md text-[#B89A56] font-semibold text-[11px] border border-[#B89A56]/30">
                          {dest.regionLabel}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-white/90 text-[11px]">
                          {dest.state}
                        </span>
                      </div>

                      {/* Bottom Banner Content */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-2 text-xs text-[#B89A56] font-medium mb-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{dest.elevationOrVibe}</span>
                        </div>
                        <h3 className="font-display text-2xl font-bold tracking-tight">
                          {dest.name}
                        </h3>
                        <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                          {dest.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 space-y-4">
                      {/* Description */}
                      <p className="text-xs text-[#252525]/80 leading-relaxed">
                        {dest.description}
                      </p>

                      {/* Travel Practicalities (Duration & Best Time) */}
                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#173D32]/10 bg-[#F8F7F2]/60 rounded-lg px-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#173D32] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#B89A56]" />
                            Ideal Duration
                          </span>
                          <span className="font-semibold text-[#252525] mt-0.5 block">
                            {dest.idealDuration}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#173D32] flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#B89A56]" />
                            Optimal Season
                          </span>
                          <span className="font-semibold text-[#252525] mt-0.5 block truncate">
                            {dest.bestMonths}
                          </span>
                        </div>
                      </div>

                      {/* Highlights List */}
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#173D32] font-bold block mb-2">
                          Key Experiences & Highlights
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#252525]/80">
                          {dest.highlights.map((h, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#173D32] shrink-0 mt-0.5" />
                              <span className="leading-tight">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Popular Circuit Link */}
                      <div className="text-[11px] text-[#252525]/70 pt-2">
                        <span className="font-semibold text-[#173D32]">Featured in Circuit: </span>
                        <span>{dest.popularCircuit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 py-4 bg-[#F8F7F2] border-t border-[#173D32]/10 flex items-center justify-between gap-3">
                    <button
                      onClick={() => openEnquiryModal({ destination: dest.name })}
                      className="text-xs font-semibold text-[#173D32] hover:text-[#B89A56] transition-colors flex items-center gap-1"
                    >
                      <span>Custom Circuit Enquiry</span>
                    </button>

                    <button
                      onClick={() =>
                        navigate('packages', { destination: dest.searchQuery })
                      }
                      className="px-4 py-2 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Explore Packages</span>
                      {livePackageCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] rounded bg-[#B89A56] text-[#173D32] font-bold">
                          {livePackageCount}
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. CURATED SOUTH INDIA CIRCUITS SECTION */}
      <section className="bg-white border-y border-[#173D32]/10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold">
              Signature Travel Corridors
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#173D32] mt-1">
              Popular Multi-Destination Holiday Circuits
            </h2>
            <p className="text-xs text-[#252525]/70 mt-2 leading-relaxed">
              Our 48-member operations team in Kochi coordinates private chauffeurs, sanitized vehicles, and reserved accommodations seamlessly across state borders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Circuit 1 */}
            <div className="p-6 rounded-xl bg-[#F8F7F2] border border-[#173D32]/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#B89A56]">
                  6 Nights · 7 Days · Classic Kerala
                </div>
                <h3 className="font-display text-xl font-bold text-[#173D32]">
                  The Kerala Highlights Circuit
                </h3>
                <div className="text-xs font-semibold text-[#173D32]/80 bg-white p-2.5 rounded border border-[#173D32]/10">
                  Kochi → Munnar (2N) → Thekkady (1N) → Alleppey (1N Houseboat) → Kochi
                </div>
                <p className="text-xs text-[#252525]/70 leading-relaxed">
                  The quintessential introductory South India itinerary. Combines colonial Fort Kochi harbor, mist-draped Munnar tea peaks, Periyar wildlife sanctuary, and an overnight private houseboat cruise along Vembanad Lake.
                </p>
              </div>

              <div className="pt-4 border-t border-[#173D32]/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#173D32]">
                  From ₹24,900 / person
                </span>
                <button
                  onClick={() =>
                    navigate('packages', { destination: 'Munnar' })
                  }
                  className="text-xs font-bold text-[#B89A56] hover:underline flex items-center gap-1"
                >
                  <span>View Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Circuit 2 */}
            <div className="p-6 rounded-xl bg-[#F8F7F2] border border-[#173D32]/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#B89A56]">
                  5 Nights · 6 Days · Tamil Nadu Heritage
                </div>
                <h3 className="font-display text-xl font-bold text-[#173D32]">
                  Temple & Three Oceans Circuit
                </h3>
                <div className="text-xs font-semibold text-[#173D32]/80 bg-white p-2.5 rounded border border-[#173D32]/10">
                  Madurai (1N) → Rameswaram (2N) → Kanyakumari (1N) → Trivandrum (1N)
                </div>
                <p className="text-xs text-[#252525]/70 leading-relaxed">
                  A spiritual and cultural journey connecting 2,500-year-old Meenakshi Temple, the Pamban sea bridge, sacred shores of Dhanushkodi, and the tri-ocean sunset confluence at Cape Comorin.
                </p>
              </div>

              <div className="pt-4 border-t border-[#173D32]/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#173D32]">
                  From ₹28,500 / person
                </span>
                <button
                  onClick={() =>
                    navigate('packages', { destination: 'Tamil Nadu' })
                  }
                  className="text-xs font-bold text-[#B89A56] hover:underline flex items-center gap-1"
                >
                  <span>View Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Circuit 3 */}
            <div className="p-6 rounded-xl bg-[#F8F7F2] border border-[#173D32]/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#B89A56]">
                  4 Nights · 5 Days · Coastal Wellness
                </div>
                <h3 className="font-display text-xl font-bold text-[#173D32]">
                  Backwaters & Sunset Cliffs
                </h3>
                <div className="text-xs font-semibold text-[#173D32]/80 bg-white p-2.5 rounded border border-[#173D32]/10">
                  Kochi → Kumarakom (1N) → Alleppey Houseboat (1N) → Varkala Cliffs (2N)
                </div>
                <p className="text-xs text-[#252525]/70 leading-relaxed">
                  Designed for relaxation and rejuvenation. Slow-paced cruising through lotus canals, followed by clifftop ocean views, daily yoga, and authentic Ayurvedic herbal treatments overlooking the Arabian Sea.
                </p>
              </div>

              <div className="pt-4 border-t border-[#173D32]/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#173D32]">
                  From ₹21,800 / person
                </span>
                <button
                  onClick={() =>
                    openEnquiryModal({ destination: 'Varkala & Backwaters' })
                  }
                  className="text-xs font-bold text-[#B89A56] hover:underline flex items-center gap-1"
                >
                  <span>Request Custom Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEASONAL CLIMATE & BEST TIME TO VISIT */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold">
            Operational Knowledge
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#173D32] mt-1">
            When to Visit South India
          </h2>
          <p className="text-xs text-[#252525]/70 mt-2">
            South India enjoys distinct seasons each with its own charm, from cool tea hill breezes to monsoonal Ayurvedic benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl border border-[#173D32]/10 space-y-3">
            <div className="w-10 h-10 rounded bg-[#173D32]/10 text-[#173D32] flex items-center justify-center">
              <Sun className="w-5 h-5 text-[#B89A56]" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#173D32]">
              Peak Season (October – March)
            </h3>
            <div className="text-xs font-semibold text-[#B89A56]">
              22°C – 30°C · Clear Skies & Cool Nights
            </div>
            <p className="text-xs text-[#252525]/70 leading-relaxed">
              Ideal for all circuits. Pristine calm waters for Alleppey houseboats, comfortable daytime sightseeing in Madurai and Kanyakumari, and fresh crisp mornings in Munnar.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#173D32]/10 space-y-3">
            <div className="w-10 h-10 rounded bg-[#173D32]/10 text-[#173D32] flex items-center justify-center">
              <CloudRain className="w-5 h-5 text-[#173D32]" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#173D32]">
              Monsoon Season (June – September)
            </h3>
            <div className="text-xs font-semibold text-[#B89A56]">
              20°C – 28°C · Traditional Ayurveda Period
            </div>
            <p className="text-xs text-[#252525]/70 leading-relaxed">
              The ancient texts prescribe monsoon as the golden window for Ayurvedic Panchakarma rejuvenation due to open body pores. Waterfalls like Athirappilly thunder at full capacity.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#173D32]/10 space-y-3">
            <div className="w-10 h-10 rounded bg-[#173D32]/10 text-[#173D32] flex items-center justify-center">
              <Mountain className="w-5 h-5 text-[#B89A56]" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#173D32]">
              Summer Season (April – May)
            </h3>
            <div className="text-xs font-semibold text-[#B89A56]">
              16°C – 25°C in Hill Stations
            </div>
            <p className="text-xs text-[#252525]/70 leading-relaxed">
              While the coastal plains are warm, Munnar, Wayanad, and Ooty offer refreshing cool retreats. Wild animals frequently gather near Periyar Lake waterholes, offering fantastic wildlife sightings.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#173D32] rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-[#B89A56]/30 shadow-xl">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold">
              Personalized Circuit Planning
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Want a Tailored Multi-Destination Itinerary?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Tell us your preferred destinations, number of days, and travel month. Our Kochi travel consultants will craft a customized circuit with transparent seasonal pricing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => openEnquiryModal()}
              className="px-6 py-3 rounded-lg bg-[#B89A56] text-[#173D32] font-bold text-xs hover:bg-[#cbb06d] transition-all shadow-md text-center"
            >
              Request Custom Itinerary
            </button>
            <button
              onClick={() => navigate('packages')}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all text-center"
            >
              Browse All Packages
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
