import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TravelPackage, getStartingPrice } from '../types';
import { PackageFormModal } from '../components/admin/PackageFormModal';
import { VersionHistoryModal } from '../components/admin/VersionHistoryModal';
import {
  Package,
  Plus,
  Search,
  FileEdit,
  Copy,
  Archive,
  History,
  Eye,
  Send,
  Star,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface AdminPackagesScreenProps {
  navigate: (route: string, params?: Record<string, string>) => void;
}

export const AdminPackagesScreen: React.FC<AdminPackagesScreenProps> = ({ navigate }) => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<TravelPackage | null>(null);
  const [versionHistoryPackageId, setVersionHistoryPackageId] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminPackages({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setPackages(res.packages);
    } catch (err) {
      console.error('Failed to load admin packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPackages();
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm('Duplicate this package into a new draft copy?')) return;
    try {
      await api.duplicatePackage(id);
      fetchPackages();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handlePublishDirect = async (id: string, title: string) => {
    if (!confirm(`Publish "${title}" to the public live website?`)) return;
    try {
      await api.publishPackage(id);
      fetchPackages();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pkg: TravelPackage) => {
    setEditingPkg(pkg);
    setIsFormOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#B89A56] font-semibold">
            Content Management System
          </span>
          <h2 className="font-display text-2xl font-bold text-[#173D32]">
            Holiday Package Catalog & Tariffs
          </h2>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#173D32] text-white hover:bg-[#122e25] text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#B89A56]" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#173D32]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#F8F7F2] rounded-lg text-xs w-full sm:w-auto">
          {(['all', 'published', 'draft', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-white text-[#173D32] shadow-sm font-semibold'
                  : 'text-[#252525]/70 hover:text-[#173D32]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#252525]/40" />
            <input
              type="text"
              placeholder="Search package code, destination, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-neutral-300 focus:outline-none focus:border-[#173D32]"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium rounded bg-[#173D32] text-white hover:bg-[#122e25]"
          >
            Find
          </button>
        </form>
      </div>

      {/* Packages Table (Section 6 & 11) */}
      <div className="bg-white rounded-xl border border-[#173D32]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#252525]/70 border-b border-neutral-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Title & Destination</th>
                <th className="py-3 px-4">Duration & Rating</th>
                <th className="py-3 px-4">Active Seasons</th>
                <th className="py-3 px-4">Base Tariff</th>
                <th className="py-3 px-4">Status & Versions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400">
                    Loading package records...
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400">
                    No packages found matching the selected filter.
                  </td>
                </tr>
              ) : (
                packages.map((pkg: TravelPackage) => {
                  const startingPrice = getStartingPrice(pkg);
                  return (
                    <tr key={pkg.id} className="hover:bg-[#F8F7F2]/40 transition-colors">
                      {/* Code */}
                      <td className="py-4 px-4 font-mono font-bold text-[#173D32]">
                        {pkg.packageId}
                      </td>

                      {/* Title & Destination */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-bold text-[#173D32] line-clamp-1">{pkg.title}</div>
                        <div className="text-[11px] text-[#252525]/60 truncate">{pkg.destination}</div>
                      </td>

                      {/* Duration & Rating */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#173D32]">{pkg.days}D / {pkg.nights}N</div>
                        <div className="text-[11px] text-[#252525]/60 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#B89A56] text-[#B89A56]" />
                          <span>{pkg.hotelCategory}</span>
                        </div>
                      </td>

                      {/* Seasons */}
                      <td className="py-4 px-4 text-[11px] text-[#252525]/75">
                        <div className="space-y-0.5">
                          {pkg.seasonalPrices?.map((sp: any, i: number) => (
                            <div key={i} className="truncate">
                              <span className="font-medium text-[#173D32]">{sp.seasonName}:</span>{' '}
                              <span>₹{sp.pricePerPerson.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Base Tariff */}
                      <td className="py-4 px-4 font-mono font-bold text-sm text-[#173D32] whitespace-nowrap">
                        ₹{startingPrice.toLocaleString('en-IN')}
                        <span className="block text-[10px] font-sans font-normal text-[#252525]/50">
                          / person
                        </span>
                      </td>

                      {/* Status & Versions */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                              pkg.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {pkg.status}
                          </span>
                          <div className="text-[10px] text-[#252525]/60 font-mono">
                            v{pkg.currentPublishedVersion ? `pub-${pkg.currentPublishedVersion}` : 'unpub'} / draft-{pkg.currentDraftVersion || 1}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Draft Button */}
                          <button
                            onClick={() => navigate('package-detail', { slug: pkg.slug, preview: 'true' })}
                            className="p-1.5 rounded hover:bg-neutral-100 text-[#173D32]"
                            title="Preview Draft"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Version History Button (Screen 7) */}
                          <button
                            onClick={() => setVersionHistoryPackageId(pkg.packageId)}
                            className="p-1.5 rounded hover:bg-neutral-100 text-[#B89A56]"
                            title="Version History"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(pkg)}
                            className="p-1.5 rounded hover:bg-neutral-100 text-[#173D32]"
                            title="Edit Package"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => handleDuplicate(pkg.id)}
                            className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600"
                            title="Duplicate Package"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Publish Direct Button */}
                          {pkg.status === 'draft' && (
                            <button
                              onClick={() => handlePublishDirect(pkg.id, pkg.title)}
                              className="px-2 py-1 rounded bg-emerald-700 text-white text-[11px] hover:bg-emerald-800 flex items-center gap-1"
                              title="Publish Draft to Live Website"
                            >
                              <Send className="w-3 h-3" />
                              <span>Publish</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Form Modal (Screen 6) */}
      <PackageFormModal
        isOpen={isFormOpen}
        pkg={editingPkg}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchPackages}
        onPreviewDraft={(slug: string) => navigate('package-detail', { slug, preview: 'true' })}
      />

      {/* Version History Modal (Screen 7) */}
      {versionHistoryPackageId && (
        <VersionHistoryModal
          packageId={versionHistoryPackageId}
          isOpen={Boolean(versionHistoryPackageId)}
          onClose={() => setVersionHistoryPackageId(null)}
        />
      )}
    </div>
  );
};
