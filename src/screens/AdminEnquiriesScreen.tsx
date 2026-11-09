import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Enquiry } from '../types';
import { EnquiryDetailModal } from '../components/admin/EnquiryDetailModal';
import {
  Inbox,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface AdminEnquiriesScreenProps {
  selectedEnquiryId?: string | null;
  onClearSelectedEnquiry?: () => void;
}

export const AdminEnquiriesScreen: React.FC<AdminEnquiriesScreenProps> = ({
  selectedEnquiryId = null,
  onClearSelectedEnquiry,
}) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeEnquiryId, setActiveEnquiryId] = useState<string | null>(selectedEnquiryId);

  useEffect(() => {
    if (selectedEnquiryId) {
      setActiveEnquiryId(selectedEnquiryId);
    }
  }, [selectedEnquiryId]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminEnquiries({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setEnquiries(res.enquiries);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEnquiries();
  };

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
    <div className="p-8 space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#B89A56] font-semibold">
            Centralized Ingestion
          </span>
          <h2 className="font-display text-2xl font-bold text-[#173D32]">
            Inbound Travel Enquiries Inbox
          </h2>
        </div>
        <button
          onClick={fetchEnquiries}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded border border-[#173D32]/20 text-[#173D32] hover:bg-[#173D32]/5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#173D32]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status filters */}
        <div className="flex items-center gap-1 p-1 bg-[#F8F7F2] rounded-lg text-xs w-full sm:w-auto overflow-x-auto">
          {['All', 'New', 'Under Review', 'Contacted', 'Qualified', 'Closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
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
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#252525]/40" />
            <input
              type="text"
              placeholder="Search customer name or destination..."
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

      {/* Enquiries Table (Section 13) */}
      <div className="bg-white rounded-xl border border-[#173D32]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#252525]/70 border-b border-neutral-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Travel Date</th>
                <th className="py-3 px-4">Travellers</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-neutral-400">
                    Loading inbound enquiries...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-neutral-400">
                    No enquiries found under this filter.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => setActiveEnquiryId(enq.id)}
                    className="hover:bg-[#F8F7F2]/40 transition-colors cursor-pointer"
                  >
                    {/* Customer */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#173D32]">{enq.customerName}</div>
                      <div className="text-[11px] text-[#252525]/60">{enq.email}</div>
                    </td>

                    {/* Destination */}
                    <td className="py-4 px-4 font-medium text-[#252525]">
                      {enq.destination}
                    </td>

                    {/* Travel Date */}
                    <td className="py-4 px-4 text-[#252525]/80 whitespace-nowrap">
                      {enq.travelDate}
                    </td>

                    {/* Travellers */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#173D32]">{enq.adults} Adults</span>
                      {enq.children > 0 && (
                        <span className="text-[11px] text-[#252525]/60 block">{enq.children} Kids</span>
                      )}
                    </td>

                    {/* Budget */}
                    <td className="py-4 px-4 font-mono font-bold text-[#173D32] whitespace-nowrap">
                      ₹{enq.budget.toLocaleString('en-IN')}
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 text-[11px] text-[#252525]/60 whitespace-nowrap">
                      {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadge(
                          enq.status
                        )}`}
                      >
                        {enq.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEnquiryId(enq.id);
                        }}
                        className="px-3 py-1 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25] flex items-center gap-1.5 ml-auto shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-[#B89A56]" />
                        <span>Inspect Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Detail Inspection Modal (Section 13 A-G) */}
      {activeEnquiryId && (
        <EnquiryDetailModal
          enquiryId={activeEnquiryId}
          isOpen={Boolean(activeEnquiryId)}
          onClose={() => {
            setActiveEnquiryId(null);
            onClearSelectedEnquiry?.();
          }}
          onUpdated={fetchEnquiries}
        />
      )}
    </div>
  );
};
