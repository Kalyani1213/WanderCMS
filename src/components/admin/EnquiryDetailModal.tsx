import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Enquiry, AIExtraction, PackageMatch, EnquiryReply } from '../../types';
import {
  X,
  Sparkles,
  Edit3,
  CheckCircle2,
  Send,
  AlertTriangle,
  RotateCw,
  MessageSquare,
  UserCheck,
  Check,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  Tag,
  Shield,
  FileText,
} from 'lucide-react';

interface EnquiryDetailModalProps {
  enquiryId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const EnquiryDetailModal: React.FC<EnquiryDetailModalProps> = ({
  enquiryId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [aiExtraction, setAiExtraction] = useState<AIExtraction | null>(null);
  const [packageMatches, setPackageMatches] = useState<PackageMatch[]>([]);
  const [replyDraft, setReplyDraft] = useState<EnquiryReply | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable Extraction State
  const [isEditingExtraction, setIsEditingExtraction] = useState(false);
  const [editableFields, setEditableFields] = useState<any>({});
  const [savingExtraction, setSavingExtraction] = useState(false);

  // Editable Reply Draft State
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [editableReplyText, setEditableReplyText] = useState('');
  const [approvingReply, setApprovingReply] = useState(false);

  // Internal Note State
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [retryingAI, setRetryingAI] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.getEnquiryDetail(enquiryId);
      setEnquiry(res.enquiry);
      setAiExtraction(res.aiExtraction);
      setPackageMatches(res.packageMatches);
      setReplyDraft(res.replyDraft);
      setEditableFields(res.aiExtraction?.extractedFields || {});
      setEditableReplyText(res.replyDraft?.draftContent || '');
    } catch (err) {
      console.error('Failed to load enquiry detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && enquiryId) {
      fetchDetail();
    }
  }, [enquiryId, isOpen]);

  if (!isOpen) return null;

  // Handle Save Corrected Extraction (Section 13.C)
  const handleSaveExtraction = async () => {
    setSavingExtraction(true);
    try {
      const res = await api.updateAIExtraction(enquiryId, {
        updatedFields: editableFields,
      });
      setAiExtraction(res.aiExtraction);
      setPackageMatches(res.packageMatches);
      setIsEditingExtraction(false);
      onUpdated();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingExtraction(false);
    }
  };

  // Handle Retry AI Extraction (Section 14.D)
  const handleRetryAI = async () => {
    setRetryingAI(true);
    try {
      const res = await api.updateAIExtraction(enquiryId, { recompute: true });
      setAiExtraction(res.aiExtraction);
      setPackageMatches(res.packageMatches);
      setEditableFields(res.aiExtraction.extractedFields);
      onUpdated();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setRetryingAI(false);
    }
  };

  // Handle Save Reply Draft (Section 13.E)
  const handleSaveReplyDraft = async () => {
    try {
      const res = await api.updateReplyDraft(enquiryId, editableReplyText);
      setReplyDraft(res.replyDraft);
      setIsEditingReply(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Handle Approve Reply (Section 13.E & 14.C: Consultant approval compulsory)
  const handleApproveReply = async () => {
    if (!confirm('Approve this reply draft and mark enquiry as Contacted?')) return;
    setApprovingReply(true);
    try {
      const res = await api.approveReplyDraft(enquiryId);
      setReplyDraft(res.replyDraft);
      if (enquiry) {
        setEnquiry({ ...enquiry, status: 'Contacted' });
      }
      onUpdated();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setApprovingReply(false);
    }
  };

  // Handle Status Update (Section 13.G)
  const handleStatusChange = async (newStatus: Enquiry['status']) => {
    setUpdatingStatus(true);
    try {
      const res = await api.updateEnquiryStatus(enquiryId, newStatus);
      setEnquiry(res.enquiry);
      onUpdated();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Add Internal Note (Section 13.F)
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await api.addEnquiryNote(enquiryId, noteText.trim());
      setEnquiry(res.enquiry);
      setNoteText('');
      onUpdated();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-[#173D32]/10 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#173D32] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#B89A56] flex items-center justify-center text-[#173D32] font-bold text-xs">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold">
                  Enquiry #{enquiry?.id.slice(-6)}: {enquiry?.customerName}
                </h2>
                <span className="text-[11px] font-mono text-[#B89A56]">
                  {enquiry?.destination}
                </span>
              </div>
              <span className="text-[11px] text-white/70">
                Logged {enquiry?.createdAt && new Date(enquiry.createdAt).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Dropdown (Section 13.G) */}
            <select
              disabled={updatingStatus || !enquiry}
              value={enquiry?.status || 'New'}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded bg-white/10 text-white border border-white/20 focus:outline-none focus:bg-white focus:text-[#173D32]"
            >
              <option value="New" className="text-black">New</option>
              <option value="Under Review" className="text-black">Under Review</option>
              <option value="Contacted" className="text-black">Contacted</option>
              <option value="Qualified" className="text-black">Qualified</option>
              <option value="Closed" className="text-black">Closed</option>
            </select>

            <button
              onClick={onClose}
              className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        {loading || !enquiry ? (
          <div className="p-8 text-center space-y-3">
            <RotateCw className="w-6 h-6 animate-spin text-[#173D32] mx-auto" />
            <p className="text-xs text-neutral-500">Loading enquiry dossier and AI extractions...</p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
            {/* Top Grid: A. Customer Details & B. Original Message */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* A. CUSTOMER DETAILS */}
              <div className="p-4 rounded-lg bg-[#F8F7F2] border border-[#173D32]/10 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#173D32]/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#173D32]">
                    A. Customer Details
                  </span>
                  <span className="font-mono text-[11px] text-[#252525]/60">{enquiry.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#252525]/50 block text-[10px]">Customer:</span>
                    <span className="font-semibold text-[#173D32]">{enquiry.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[#252525]/50 block text-[10px]">Email:</span>
                    <span className="text-[#252525] truncate block">{enquiry.email}</span>
                  </div>
                  <div>
                    <span className="text-[#252525]/50 block text-[10px]">Phone:</span>
                    <span className="font-mono">{enquiry.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#252525]/50 block text-[10px]">Travel Date:</span>
                    <span>{enquiry.travelDate}</span>
                  </div>
                  <div>
                    <span className="text-[#252525]/50 block text-[10px]">Traveller Pax:</span>
                    <span className="font-semibold">{enquiry.adults} Adults, {enquiry.children} Children</span>
                  </div>
                  <div>
                    <span className="text-[#252525]/50 block text-[10px]">Declared Budget:</span>
                    <span className="font-mono font-bold text-emerald-800">
                      ₹{enquiry.budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#173D32]/10 flex items-center justify-between text-[11px]">
                  <span className="text-[#252525]/60">WhatsApp Follow-up Consent:</span>
                  <span className={`font-semibold ${enquiry.whatsappConsent ? 'text-emerald-700' : 'text-neutral-500'}`}>
                    {enquiry.whatsappConsent ? '✓ Consented' : 'No Consent'}
                  </span>
                </div>
              </div>

              {/* B. ORIGINAL CUSTOMER MESSAGE (Section 13.B) */}
              <div className="p-4 rounded-lg bg-white border border-neutral-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#173D32] pb-2 border-b">
                    B. Original Customer Message (Preserved Exact)
                  </div>
                  <div className="p-3 my-2 rounded bg-neutral-50 border border-neutral-100 italic text-neutral-800 text-xs font-serif leading-relaxed">
                    "{enquiry.originalMessage}"
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-1">
                  <span>Acknowledged: {enquiry.acknowledgementStatus}</span>
                  <span>Direct Web Ingestion</span>
                </div>
              </div>
            </div>

            {/* C. AI EXTRACTION SECTION (Section 13.C & 14.A) */}
            <div className="p-4 rounded-lg border border-[#B89A56]/40 bg-[#B89A56]/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B89A56]" />
                  <span className="font-display font-bold text-sm text-[#173D32]">
                    C. AI Requirements Extraction
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      aiExtraction?.processingStatus === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : aiExtraction?.processingStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {aiExtraction?.processingStatus} ({aiExtraction?.provider || 'engine'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetryAI}
                    disabled={retryingAI}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border border-[#173D32]/30 text-[#173D32] hover:bg-[#173D32]/10"
                    title="Retry AI Extraction"
                  >
                    <RotateCw className={`w-3 h-3 ${retryingAI ? 'animate-spin' : ''}`} />
                    <span>Retry Extraction</span>
                  </button>

                  <button
                    onClick={() => setIsEditingExtraction(!isEditingExtraction)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25]"
                  >
                    <Edit3 className="w-3 h-3 text-[#B89A56]" />
                    <span>{isEditingExtraction ? 'Cancel Edit' : 'Correct Extracted Fields'}</span>
                  </button>
                </div>
              </div>

              {/* Error details if failed */}
              {aiExtraction?.errorDetails && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{aiExtraction.errorDetails}</span>
                </div>
              )}

              {/* Extracted Fields Display / Edit */}
              {isEditingExtraction ? (
                /* Inline Edit Mode */
                <div className="bg-white p-4 rounded-lg border border-neutral-300 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#173D32] mb-0.5">
                        Destination
                      </label>
                      <input
                        type="text"
                        value={editableFields.destination || ''}
                        onChange={(e) => setEditableFields({ ...editableFields, destination: e.target.value })}
                        className="w-full p-1.5 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#173D32] mb-0.5">
                        Adults
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={editableFields.adults || 1}
                        onChange={(e) => setEditableFields({ ...editableFields, adults: parseInt(e.target.value) || 1 })}
                        className="w-full p-1.5 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#173D32] mb-0.5">
                        Children
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editableFields.children || 0}
                        onChange={(e) => setEditableFields({ ...editableFields, children: parseInt(e.target.value) || 0 })}
                        className="w-full p-1.5 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#173D32] mb-0.5">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={editableFields.duration || ''}
                        onChange={(e) => setEditableFields({ ...editableFields, duration: e.target.value })}
                        className="w-full p-1.5 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#173D32] mb-0.5">
                        Travel Month
                      </label>
                      <input
                        type="text"
                        value={editableFields.travelMonth || ''}
                        onChange={(e) => setEditableFields({ ...editableFields, travelMonth: e.target.value })}
                        className="w-full p-1.5 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#173D32] mb-0.5">
                        Budget (₹)
                      </label>
                      <input
                        type="number"
                        value={editableFields.budget || 0}
                        onChange={(e) => setEditableFields({ ...editableFields, budget: parseInt(e.target.value) || 0 })}
                        className="w-full p-1.5 border rounded font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#173D32] mb-0.5">
                      Special Requirements (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={(editableFields.requirements || []).join(', ')}
                      onChange={(e) => setEditableFields({
                        ...editableFields,
                        requirements: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })}
                      className="w-full p-1.5 border rounded"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      onClick={() => setIsEditingExtraction(false)}
                      className="px-3 py-1.5 rounded border border-neutral-300 text-neutral-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveExtraction}
                      disabled={savingExtraction}
                      className="px-4 py-1.5 rounded bg-[#173D32] text-white font-semibold"
                    >
                      {savingExtraction ? 'Saving...' : 'Save & Re-rank Recommendations'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Read-Only Extracted Cards */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-neutral-200">
                  <div>
                    <span className="text-[10px] text-[#252525]/50 block">Destination:</span>
                    <span className="font-semibold text-[#173D32]">{aiExtraction?.extractedFields.destination}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#252525]/50 block">Pax Breakdown:</span>
                    <span>{aiExtraction?.extractedFields.adults} Adults · {aiExtraction?.extractedFields.children} Kids</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#252525]/50 block">Duration / Month:</span>
                    <span>{aiExtraction?.extractedFields.duration} in {aiExtraction?.extractedFields.travelMonth}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#252525]/50 block">Extracted Budget:</span>
                    <span className="font-mono font-bold text-emerald-800">
                      ₹{aiExtraction?.extractedFields.budget?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-4 pt-1 border-t border-neutral-100 flex items-center gap-1.5">
                    <span className="text-[10px] text-[#252525]/50 shrink-0">Tagged Requirements:</span>
                    <div className="flex flex-wrap gap-1">
                      {aiExtraction?.extractedFields.requirements?.map((req, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium text-[10px]">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Audit history of corrections if any */}
              {aiExtraction?.correctionHistory && aiExtraction.correctionHistory.length > 0 && (
                <div className="text-[10px] text-neutral-500 pt-1">
                  <strong>Correction Log:</strong>{' '}
                  {aiExtraction.correctionHistory.map((c, i) => (
                    <span key={i} className="mr-2">
                      {c.field} changed by {c.correctedBy} ({new Date(c.correctedAt).toLocaleTimeString('en-IN')})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* D. PACKAGE SUGGESTIONS (Section 13.D & 14.B: Deterministic Top 3 matches) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-[#173D32]">
                    D. Top 3 Recommended Packages (Deterministic 100-Point Match)
                  </h3>
                  <p className="text-[11px] text-[#252525]/60">
                    Calculated from actual published database tariffs and requirement compatibility.
                  </p>
                </div>
              </div>

              {packageMatches.length === 0 ? (
                <div className="p-4 rounded-lg bg-neutral-50 text-neutral-500 text-center">
                  No matching published packages found in catalog.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {packageMatches.map((m, idx) => (
                    <div
                      key={m.packageId}
                      className={`p-4 rounded-lg border space-y-2 flex flex-col justify-between ${
                        idx === 0
                          ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-500/30'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-bold text-[#173D32]">
                            {m.packageId}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#173D32] text-white font-mono font-bold text-[10px]">
                            {m.score}/100 Match
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-sm text-[#173D32] line-clamp-1">
                          {m.packageTitle}
                        </h4>

                        <div className="text-[11px] text-[#252525]/70 mt-1">
                          {m.destination} · {m.duration}
                        </div>

                        {/* Database Price */}
                        <div className="mt-2 pt-2 border-t border-neutral-100 flex items-baseline justify-between font-mono">
                          <span className="text-[10px] text-[#252525]/50">Database Tariff:</span>
                          <span className="font-bold text-[#173D32] text-sm">
                            ₹{m.databasePrice.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Match reasons */}
                        <div className="mt-2 space-y-1">
                          {m.matchReasons.map((r, i) => (
                            <div key={i} className="text-[10px] text-emerald-800 flex items-start gap-1">
                              <span className="text-emerald-700 font-bold shrink-0">✓</span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 text-[10px] text-[#252525]/50 italic">
                        {m.pricingBasis} ({m.gstInformation})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* E. AI REPLY DRAFT (Section 13.E & 14.C: Editable & Human Approval) */}
            <div className="p-4 rounded-lg border border-[#173D32]/15 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-[#173D32]">
                    E. Customer Reply Draft (Human Consultant Approval Required)
                  </h3>
                  <p className="text-[11px] text-[#252525]/60">
                    Draft automatically prepared with verified database package rates.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingReply(!isEditingReply)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingReply ? 'Cancel Edit' : 'Edit Draft'}</span>
                  </button>

                  <button
                    onClick={handleApproveReply}
                    disabled={approvingReply || replyDraft?.approvalStatus === 'approved'}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
                      replyDraft?.approvalStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {replyDraft?.approvalStatus === 'approved' ? 'Approved & Ready' : 'Approve Draft'}
                    </span>
                  </button>
                </div>
              </div>

              {isEditingReply ? (
                <div className="space-y-2">
                  <textarea
                    rows={8}
                    value={editableReplyText}
                    onChange={(e) => setEditableReplyText(e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded border border-neutral-300 focus:outline-none focus:border-[#173D32]"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveReplyDraft}
                      className="px-4 py-1.5 rounded bg-[#173D32] text-white text-xs font-semibold"
                    >
                      Save Edited Draft
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[#F8F7F2] border border-neutral-200 whitespace-pre-line text-xs font-serif leading-relaxed text-[#252525]">
                  {replyDraft?.draftContent}
                </div>
              )}

              {replyDraft?.approvedBy && (
                <div className="text-[10px] text-emerald-800 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Approved by {replyDraft.approvedBy} on {new Date(replyDraft.approvedAt!).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* F. INTERNAL NOTES (Section 13.F) */}
            <div className="p-4 rounded-lg border border-neutral-200 bg-white space-y-3">
              <h3 className="font-display font-bold text-sm text-[#173D32]">
                F. Staff Internal Notes & Audit History
              </h3>

              <div className="space-y-2">
                {enquiry.internalNotes && enquiry.internalNotes.length > 0 ? (
                  enquiry.internalNotes.map((note) => (
                    <div key={note.id} className="p-2.5 rounded bg-neutral-50 border border-neutral-100 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                        <strong className="text-[#173D32]">{note.author}</strong>
                        <span>{new Date(note.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[#252525]">{note.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-400 italic text-[11px]">No internal notes logged yet.</p>
                )}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add an internal note (e.g. called customer on WhatsApp, preferred vegetarian lunch)..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded border border-neutral-300"
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="px-4 py-1.5 rounded bg-[#173D32] text-white font-semibold disabled:opacity-40"
                >
                  {addingNote ? 'Saving...' : 'Add Note'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25]"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
