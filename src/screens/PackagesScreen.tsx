import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TravelPackage } from '../types';
import { PackageCard } from '../components/public/PackageCard';
import { Search, Filter, Compass, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface PackagesScreenProps {
  initialDestination?: string;
  navigate: (route: string, params?: Record<string, string>) => void;
  openEnquiryModal: (prefill?: any) => void;
}

export const PackagesScreen: React.FC<PackagesScreenProps> = ({
  initialDestination = 'All',
  navigate,
  openEnquiryModal,
}) => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state (Section 7)
  const [search, setSearch] = useState('');
  const [destination, setDestination] = useState(initialDestination);
  const [hotelCategory, setHotelCategory] = useState('All');
  const [season, setSeason] = useState('All');
  const [sortBy, setSortBy] = useState('price-asc');

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.getPublishedPackages({
        search: search.trim() || undefined,
        destination: destination !== 'All' ? destination : undefined,
        hotelCategory: hotelCategory !== 'All' ? hotelCategory : undefined,
        season: season !== 'All' ? season : undefined,
        sortBy,
      });
      setPackages(res.packages);
    } catch (err) {
      console.error('Failed to query packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [destination, hotelCategory, season, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPackages();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDestination('All');
    setHotelCategory('All');
    setSeason('All');
    setSortBy('price-asc');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[#173D32]/10 pb-6">
        <span className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold">
          South India Holiday Catalog
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#173D32] mt-1">
          Explore Holiday Packages
        </h1>
        <p className="text-sm text-[#252525]/70 mt-2 max-w-2xl">
          All packages feature verified twin-sharing tariffs, transparent GST calculations, and handpicked local accommodations across Kerala and Tamil Nadu.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-[#173D32]/10 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#252525]/40" />
            <input
              type="text"
              placeholder="Search by package title, houseboat, destination, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#173D32]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#173D32] text-white hover:bg-[#122e25] transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-neutral-100 text-xs">
          {/* Destination */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#173D32] font-bold mb-1">
              Destination
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-2 text-xs rounded border border-neutral-200 bg-[#F8F7F2]/50 text-[#252525]"
            >
              <option value="All">All Destinations</option>
              <option value="Munnar">Munnar</option>
              <option value="Alleppey">Alleppey Backwaters</option>
              <option value="Thekkady">Thekkady</option>
              <option value="Wayanad">Wayanad</option>
              <option value="Tamil Nadu">Tamil Nadu (Madurai/Rameswaram)</option>
            </select>
          </div>

          {/* Hotel Category */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#173D32] font-bold mb-1">
              Hotel Category
            </label>
            <select
              value={hotelCategory}
              onChange={(e) => setHotelCategory(e.target.value)}
              className="w-full p-2 text-xs rounded border border-neutral-200 bg-[#F8F7F2]/50 text-[#252525]"
            >
              <option value="All">All Hotel Ratings</option>
              <option value="3 star">3 Star Deluxe</option>
              <option value="4 star">4 Star Premium</option>
              <option value="5 star">5 Star Luxury</option>
            </select>
          </div>

          {/* Season */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#173D32] font-bold mb-1">
              Season Tariff
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full p-2 text-xs rounded border border-neutral-200 bg-[#F8F7F2]/50 text-[#252525]"
            >
              <option value="All">All Seasons</option>
              <option value="Peak">Peak Season (Oct–Mar)</option>
              <option value="Monsoon">Monsoon Season (Jun–Sep)</option>
              <option value="All Year">All Year Regular</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#173D32] font-bold mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 text-xs rounded border border-neutral-200 bg-[#F8F7F2]/50 text-[#252525]"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="duration">Duration (Days)</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Filter status summary */}
        <div className="flex items-center justify-between text-xs text-[#252525]/60 pt-1">
          <span>
            Showing <strong className="text-[#173D32]">{packages.length}</strong> published packages
          </span>
          {(destination !== 'All' || hotelCategory !== 'All' || season !== 'All' || search) && (
            <button
              onClick={handleResetFilters}
              className="text-[#B89A56] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Package Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-lg bg-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-4">
          <Compass className="w-12 h-12 text-[#B89A56] mx-auto stroke-[1.5]" />
          <h3 className="font-display text-xl font-bold text-[#173D32]">
            No matching packages found
          </h3>
          <p className="text-xs text-[#252525]/70 max-w-md mx-auto">
            We couldn't find published packages matching your criteria. Try adjusting your destination, season filter, or clear your search term.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25] transition-colors"
          >
            Clear All Filters
          </button>
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
    </div>
  );
};
