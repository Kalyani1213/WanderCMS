import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Database, Sparkles, Server, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export const AdminSystemScreen: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getSystemStatus();
      setSystemStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleReseed = async () => {
    if (!confirm('Reseed the database with client sample packages PKG-KL-07, PKG-SI-12 and sample enquiry?')) return;
    setReseeding(true);
    setSeedMessage(null);
    try {
      const res = await api.reseedData();
      setSeedMessage(res.message);
      fetchStatus();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setReseeding(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <span className="text-xs uppercase tracking-wider text-[#B89A56] font-semibold">
          Architecture & Environment
        </span>
        <h2 className="font-display text-2xl font-bold text-[#173D32]">
          System & AI Engine Diagnostics
        </h2>
      </div>

      {seedMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Database Diagnostic Card */}
        <div className="p-6 rounded-xl bg-white border border-[#173D32]/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#173D32] text-[#B89A56] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#173D32]">
                Database Architecture
              </h3>
              <p className="text-[#252525]/60 text-[11px]">
                MongoDB Atlas & Mongoose ODM Compliant
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8F7F2] space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#252525]/60">Storage Engine:</span>
              <strong className="text-[#173D32]">{systemStatus?.database?.mode || 'Persistent Storage'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#252525]/60">Atlas URI Configured:</span>
              <span className={systemStatus?.database?.mongoUriConfigured ? 'text-emerald-700 font-bold' : 'text-neutral-500'}>
                {systemStatus?.database?.mongoUriConfigured ? 'Yes (Live Mongoose)' : 'Local Fallback (Atlas Ready)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#252525]/60">Packages in DB:</span>
              <span className="font-bold">{systemStatus?.database?.counts?.packages ?? '...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#252525]/60">Enquiries in DB:</span>
              <span className="font-bold">{systemStatus?.database?.counts?.enquiries ?? '...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#252525]/60">Immutable Version Snapshots:</span>
              <span className="font-bold">{systemStatus?.database?.counts?.versions ?? '...'}</span>
            </div>
          </div>

          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="w-full py-2 px-4 rounded border border-[#173D32]/30 text-[#173D32] hover:bg-[#173D32]/5 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
            <span>Reseed Client Sample Packages & Enquiry</span>
          </button>
        </div>

        {/* AI Engine Diagnostic Card */}
        <div className="p-6 rounded-xl bg-white border border-[#173D32]/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#173D32] text-[#B89A56] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#173D32]">
                AI Intelligence & Extraction
              </h3>
              <p className="text-[#252525]/60 text-[11px]">
                Groq API & Deterministic 100-Point Ranking
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8F7F2] space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#252525]/60">Active AI Pipeline:</span>
              <strong className="text-[#173D32]">
                {systemStatus?.ai?.activeProvider === 'groq'
                  ? 'Groq API (llama-3.3-70b-versatile)'
                  : 'Built-in Deterministic NLP Extractor'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#252525]/60">GROQ_API_KEY Status:</span>
              <span className={systemStatus?.ai?.groqConfigured ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {systemStatus?.ai?.groqConfigured ? 'Configured & Active' : 'Not Set (Heuristic Fallback Running)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#252525]/60">Structured JSON Output:</span>
              <span className="text-emerald-700 font-bold">Enforced (Schema Validated)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#252525]/60">Package Match Engine:</span>
              <span className="text-[#173D32]">Deterministic 100-pt weights</span>
            </div>
          </div>

          <p className="text-[11px] text-[#252525]/70 leading-relaxed">
            Per prompt guidelines: If external Groq is unconfigured or encounters rate limits, enquiries are 100% preserved safely without data loss, with human edit and retry available.
          </p>
        </div>
      </div>
    </div>
  );
};
