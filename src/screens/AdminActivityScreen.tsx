import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ActivityLog } from '../types';
import { History, Clock, User, Tag, RefreshCw } from 'lucide-react';

export const AdminActivityScreen: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getActivityLogs();
      setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#B89A56] font-semibold">
            Audit Trail
          </span>
          <h2 className="font-display text-2xl font-bold text-[#173D32]">
            Operations Activity History
          </h2>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-[#173D32]/20 text-[#173D32] hover:bg-[#173D32]/5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#173D32]/10 shadow-sm p-6">
        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading audit log...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">No activity recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg border border-neutral-100 bg-[#F8F7F2]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#173D32]/10 text-[#173D32] flex items-center justify-center shrink-0 mt-0.5">
                    <History className="w-4 h-4 text-[#B89A56]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#173D32]">{log.action}</div>
                    <div className="text-[11px] text-[#252525]/60 flex items-center gap-2 mt-0.5">
                      <span className="capitalize font-medium text-[#B89A56]">{log.entityType}</span>
                      <span>·</span>
                      <span className="font-mono">{log.entityId}</span>
                      <span>·</span>
                      <span>By: {log.userName || log.userId}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#252525]/50 whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#B89A56]" />
                  <span>{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
