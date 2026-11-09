import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import {
  Package,
  Globe,
  FileEdit,
  Inbox,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardScreenProps {
  onSelectEnquiry: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onSelectEnquiry,
  onNavigateTab,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.getDashboardStats();
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading || !stats) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-neutral-200 rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-neutral-200 rounded-lg" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Packages', value: stats.totalPackages, icon: Package, color: 'text-[#173D32]' },
    { label: 'Published Live', value: stats.publishedPackages, icon: Globe, color: 'text-emerald-700' },
    { label: 'Draft Packages', value: stats.draftPackages, icon: FileEdit, color: 'text-[#B89A56]' },
    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: Inbox, color: 'text-[#173D32]' },
    { label: 'New Enquiries', value: stats.newEnquiries, icon: Clock, color: 'text-blue-700' },
    { label: 'Pending Review', value: stats.pendingEnquiries, icon: CheckCircle2, color: 'text-amber-700' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Contacted':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Qualified':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Closed':
        return 'bg-neutral-100 text-neutral-700 border-neutral-300';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#B89A56] font-semibold">
            Live Database Metrics
          </span>
          <h2 className="font-display text-xl font-bold text-[#173D32]">
            Tour Operations Overview
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#173D32]/20 text-[#173D32] hover:bg-[#173D32]/5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* DASHBOARD STATS CARDS (Section 10: calculated from DB queries) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-white border border-[#173D32]/10 shadow-sm space-y-2 hover:shadow transition-shadow"
            >
              <div className="flex items-center justify-between text-[#252525]/60 text-xs font-medium">
                <span className="truncate">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color} shrink-0`} />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#173D32]">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Grid: Recent Enquiries & Packages Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enquiries (Section 10) */}
        <div className="bg-white rounded-xl border border-[#173D32]/10 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-display text-base font-bold text-[#173D32]">
                Recent Inbound Enquiries
              </h3>
              <p className="text-xs text-[#252525]/60">
                Customer requirements parsed by AI engine
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('enquiries')}
              className="text-xs font-semibold text-[#173D32] hover:text-[#B89A56] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#252525]/50 border-b border-neutral-100 font-medium">
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Destination</th>
                  <th className="pb-2">Budget</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {stats.recentEnquiries.map((enq: any) => (
                  <tr key={enq.id} className="hover:bg-[#F8F7F2]/50 transition-colors">
                    <td className="py-3">
                      <div className="font-semibold text-[#173D32]">{enq.customerName}</div>
                      <div className="text-[11px] text-[#252525]/50">{enq.email}</div>
                    </td>
                    <td className="py-3 text-[#252525]/80">{enq.destination}</td>
                    <td className="py-3 font-mono tabular-nums font-semibold text-[#173D32]">
                      ₹{enq.budget.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadge(enq.status)}`}>
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectEnquiry(enq.id)}
                        className="px-2.5 py-1 text-[11px] rounded bg-[#173D32] text-white hover:bg-[#122e25] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Package Overview (Section 10) */}
        <div className="bg-white rounded-xl border border-[#173D32]/10 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-display text-base font-bold text-[#173D32]">
                Package Catalog Overview
              </h3>
              <p className="text-xs text-[#252525]/60">
                Live published and unpublished draft packages
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('packages')}
              className="text-xs font-semibold text-[#173D32] hover:text-[#B89A56] flex items-center gap-1 transition-colors"
            >
              <span>Manage CMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#252525]/50 border-b border-neutral-100 font-medium">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Tariff</th>
                  <th className="pb-2 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {stats.packagesOverview.map((pkg: any) => (
                  <tr key={pkg.id} className="hover:bg-[#F8F7F2]/50 transition-colors">
                    <td className="py-3 font-mono text-[11px] font-bold text-[#173D32]">
                      {pkg.packageId}
                    </td>
                    <td className="py-3 font-medium text-[#252525] truncate max-w-[180px]">
                      {pkg.title}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          pkg.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {pkg.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-semibold text-[#173D32]">
                      ₹{pkg.startingPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right text-[11px] text-[#252525]/60">
                      {new Date(pkg.updatedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
