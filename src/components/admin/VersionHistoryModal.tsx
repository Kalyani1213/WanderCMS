import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PackageVersion } from '../../types';
import { X, History, CheckCircle, Clock, FileText } from 'lucide-react';

interface VersionHistoryModalProps {
  packageId: string;
  isOpen: boolean;
  onClose: () => void;
  onPreviewVersion?: (version: PackageVersion) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  packageId,
  isOpen,
  onClose,
}) => {
  const [versions, setVersions] = useState<PackageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<PackageVersion | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const res = await api.getPackageVersions(packageId);
        setVersions(res.versions);
        if (res.versions.length > 0) {
          setSelectedVersion(res.versions[0]);
        }
      } catch (err) {
        console.error('Failed to load package versions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [packageId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-[#173D32]/10 overflow-hidden my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#173D32] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#B89A56]" />
            <div>
              <h2 className="font-display text-lg font-bold">Immutable Version History</h2>
              <span className="text-[11px] text-[#B89A56] font-mono">Package: {packageId}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Versions List Column */}
          <div className="md:col-span-1 border-r border-neutral-100 pr-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-[#173D32] font-bold">
              Archived Snapshots ({versions.length})
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 bg-neutral-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {versions.map((ver) => {
                  const isSelected = selectedVersion?.id === ver.id;
                  return (
                    <div
                      key={ver.id}
                      onClick={() => setSelectedVersion(ver)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#173D32] bg-[#173D32]/5 font-semibold'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[#173D32] font-bold">
                          v{ver.versionNumber}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                            ver.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ver.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#252525]/70 line-clamp-1">
                        {ver.changeSummary || 'Content update'}
                      </p>
                      <div className="text-[10px] text-[#252525]/50 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#B89A56]" />
                        <span>{new Date(ver.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Version Snapshot Detail Column */}
          <div className="md:col-span-2 space-y-4">
            {selectedVersion ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#F8F7F2] border border-[#173D32]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base text-[#173D32]">
                      Version {selectedVersion.versionNumber} Snapshot
                    </span>
                    <span className="text-xs font-mono text-[#252525]/60">
                      Editor ID: {selectedVersion.editorId}
                    </span>
                  </div>
                  <p className="text-xs text-[#252525]/80">
                    <strong>Change Summary:</strong> {selectedVersion.changeSummary || 'None provided'}
                  </p>
                  {selectedVersion.publishedAt && (
                    <div className="text-xs text-emerald-800 font-medium">
                      Published to live catalog on: {new Date(selectedVersion.publishedAt).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                {/* Content Snapshot Preview */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-[#173D32] font-bold">
                    Snapshot Package Details
                  </h4>
                  <div className="p-4 rounded-lg border border-neutral-200 text-xs space-y-3">
                    <div>
                      <span className="text-[#252525]/50 block text-[10px]">Title:</span>
                      <div className="font-semibold text-sm text-[#173D32]">
                        {selectedVersion.contentSnapshot.title}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#252525]/50 block text-[10px]">Destination:</span>
                        <span>{selectedVersion.contentSnapshot.destination}</span>
                      </div>
                      <div>
                        <span className="text-[#252525]/50 block text-[10px]">Duration:</span>
                        <span>{selectedVersion.contentSnapshot.days} Days / {selectedVersion.contentSnapshot.nights} Nights</span>
                      </div>
                    </div>

                    {/* Seasonal Tariffs at that version */}
                    <div>
                      <span className="text-[#252525]/50 block text-[10px] mb-1">Seasonal Tariffs:</span>
                      <div className="space-y-1">
                        {selectedVersion.contentSnapshot.seasonalPrices?.map((sp: any, idx: number) => (
                          <div key={idx} className="p-2 rounded bg-neutral-50 flex items-center justify-between text-xs font-mono">
                            <span>{sp.seasonName} ({sp.startMonth} - {sp.endMonth})</span>
                            <span className="font-bold text-[#173D32]">₹{sp.pricePerPerson.toLocaleString('en-IN')} / person</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[#252525]/50 block text-[10px] mb-1">Itinerary Count:</span>
                      <span className="font-medium">{selectedVersion.contentSnapshot.itinerary?.length || 0} Scheduled Days</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[#252525]/50">
                Select a version to inspect its immutable snapshot.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
