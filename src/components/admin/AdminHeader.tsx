import React from 'react';
import { Database, Sparkles, ShieldCheck } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  systemStatus?: {
    database: any;
    ai: any;
  };
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, systemStatus }) => {
  const isMongoConnected = systemStatus?.database?.connectedToMongo;
  const isGroqActive = systemStatus?.ai?.groqConfigured;

  return (
    <div className="bg-white border-b border-[#173D32]/10 px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#173D32]">{title}</h1>
        {subtitle && <p className="text-xs text-[#252525]/60 mt-0.5">{subtitle}</p>}
      </div>

      {/* Live System Diagnostics Badges */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Database Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-[#F8F7F2] text-[#252525]/80">
          <Database className={`w-3.5 h-3.5 ${isMongoConnected ? 'text-emerald-700' : 'text-[#B89A56]'}`} />
          <span>
            {isMongoConnected ? 'MongoDB Atlas (Live)' : 'Persistent Storage (Atlas Ready)'}
          </span>
        </div>

        {/* AI Engine Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-[#F8F7F2] text-[#252525]/80">
          <Sparkles className={`w-3.5 h-3.5 ${isGroqActive ? 'text-emerald-700' : 'text-[#B89A56]'}`} />
          <span>
            {isGroqActive ? 'Groq LLaMA 3.3 (Active)' : 'Built-in NLP Extractor'}
          </span>
        </div>

        {/* Role badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#173D32] text-white font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B89A56]" />
          <span>Staff Admin</span>
        </div>
      </div>
    </div>
  );
};
