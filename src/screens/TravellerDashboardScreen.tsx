import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Enquiry, AIExtraction, EnquiryReply } from '../types';
import {
  Compass,
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  FileText,
  MessageCircle,
  ArrowRight,
  LogOut,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Mail,
  Send,
  Copy,
  Check,
  Printer,
  X,
} from 'lucide-react';

interface TravellerDashboardScreenProps {
  navigate: (route: string, params?: Record<string, string>) => void;
  openEnquiryModal: (prefill?: any) => void;
}

export const TravellerDashboardScreen: React.FC<TravellerDashboardScreenProps> = ({
  navigate,
  openEnquiryModal,
}) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    traveller: any;
    totalEnquiries: number;
    enquiries: {
      enquiry: Enquiry;
      extraction: AIExtraction | null;
      reply: EnquiryReply | null;
    }[];
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Send to Gmail Modal State
  const [emailModalData, setEmailModalData] = useState<{
    enquiry: Enquiry;
    reply: EnquiryReply | null;
  } | null>(null);
  const [recipientGmail, setRecipientGmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sentHistory, setSentHistory] = useState<Record<string, { email: string; timestamp: string }>>({});

  const fetchData = async () => {
    try {
      const res = await api.getTravellerDashboard();
      setData(res);
    } catch (e) {
      console.error('Failed to load traveller dashboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSignOut = async () => {
    await logout();
    navigate('home');
  };

  const openEmailModal = (enquiry: Enquiry, reply: EnquiryReply | null) => {
    setEmailModalData({ enquiry, reply });
    setRecipientGmail(user?.email || enquiry.email || '');
    setEmailSuccessMessage(null);
    setEmailErrorMessage(null);
    setCopied(false);
  };

  const closeEmailModal = () => {
    setEmailModalData(null);
    setEmailSuccessMessage(null);
    setEmailErrorMessage(null);
  };

  const formatVoucherText = (enquiry: Enquiry, reply: EnquiryReply | null) => {
    const refCode = enquiry.id.replace('enq_', 'ENQ-').toUpperCase();
    return `WANDERCMS TOUR OPERATIONS - OFFICIAL BOOKING & QUOTATION VOUCHER
============================================================
Tour Operator Operations Centre: Marine Drive, Ernakulam, Kochi, Kerala 682011
Phone: +91 (0484) 238-0000 | Email: holidays@wandercms.com
Govt. of Kerala Tourism Reg. #KL-TO-4829

BOOKING REFERENCE: ${refCode}
Client Name: ${enquiry.customerName}
Registered Email: ${enquiry.email}
Phone / WhatsApp: ${enquiry.phone}

TRIP SPECIFICATIONS:
- Destination: ${enquiry.destination}
- Travel Season: ${enquiry.travelDate}
- Duration: ${enquiry.duration}
- Party Size: ${enquiry.adults} Adults ${enquiry.children > 0 ? `+ ${enquiry.children} Child` : ''}
- Approx Budget: ₹${enquiry.budget.toLocaleString('en-IN')}

CLIENT REQUIREMENT:
"${enquiry.originalMessage}"

${reply ? `OFFICIAL QUOTATION & VERIFIED ITINERARY:
------------------------------------------------------------
${reply.draftContent}
` : 'Status: Under review by senior destination planner in Kochi.'}

------------------------------------------------------------
WanderCMS Tour Operations · Central Reservations Desk
Marine Drive, Kochi, Kerala · holidays@wandercms.com`;
  };

  const handleSendEmail = async () => {
    if (!emailModalData) return;
    if (!recipientGmail || !recipientGmail.includes('@')) {
      setEmailErrorMessage('Please enter a valid Gmail / email address.');
      return;
    }

    setSendingEmail(true);
    setEmailErrorMessage(null);
    setEmailSuccessMessage(null);

    try {
      const res = await api.sendEmailSummary(emailModalData.enquiry.id, recipientGmail);
      const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setSentHistory((prev) => ({
        ...prev,
        [emailModalData.enquiry.id]: { email: recipientGmail, timestamp },
      }));
      setEmailSuccessMessage(res.message || `Booking summary sent to ${recipientGmail}!`);
    } catch (err) {
      setEmailErrorMessage((err as Error).message || 'Failed to dispatch email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyVoucher = () => {
    if (!emailModalData) return;
    const text = formatVoucherText(emailModalData.enquiry, emailModalData.reply);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-6 animate-pulse">
        <div className="h-24 bg-neutral-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-neutral-200 rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-neutral-200 rounded-xl" />
      </div>
    );
  }

  const enquiries = data?.enquiries || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* 1. Header Profile Banner */}
      <div className="bg-[#173D32] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-[#B89A56]/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#B89A56]/20 border border-[#B89A56]/40 text-[#B89A56] text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Traveller Holiday Portal</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-white/80 text-xs sm:text-sm font-light">
            Track your South India travel enquiries, customized quotations, and verified itineraries managed by our Kochi operations team.
          </p>
          <div className="text-[11px] text-[#B89A56] pt-1">
            Registered Email: {user?.email}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => openEnquiryModal()}
            className="px-4 py-2.5 rounded-lg bg-[#B89A56] text-[#173D32] font-semibold text-xs hover:bg-[#cbb06d] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Circuit</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleSignOut}
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#173D32]/10 shadow-sm space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-[#173D32] font-bold">
            Active Travel Enquiries
          </div>
          <div className="font-mono text-3xl font-bold text-[#173D32]">
            {enquiries.length}
          </div>
          <div className="text-[11px] text-[#252525]/60">
            {enquiries.length > 0 ? 'Managed by Kochi operations' : 'No enquiries yet'}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#173D32]/10 shadow-sm space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-[#173D32] font-bold">
            Personalized Quotations
          </div>
          <div className="font-mono text-3xl font-bold text-emerald-700">
            {enquiries.filter((e) => e.reply).length}
          </div>
          <div className="text-[11px] text-[#252525]/60">
            Verified twin-sharing tariffs with GST
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#173D32]/10 shadow-sm space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-[#173D32] font-bold">
            Dedicated Support
          </div>
          <div className="text-sm font-bold text-[#173D32] flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-4 h-4 text-[#B89A56]" />
            <span>Kochi Desk Specialist</span>
          </div>
          <div className="text-[11px] text-[#252525]/60">
            Chauffeur & resort coordination active
          </div>
        </div>
      </div>

      {/* 3. Enquiries & Quotes Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#173D32]/10">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#173D32]">
              Your Holiday Enquiries & Verified Quotes
            </h2>
            <p className="text-xs text-[#252525]/70 mt-0.5">
              Live status, AI requirements extraction audit, and official itineraries from our travel desk.
            </p>
          </div>
        </div>

        {enquiries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 space-y-4">
            <Compass className="w-12 h-12 text-[#B89A56] mx-auto stroke-[1.5]" />
            <h3 className="font-display text-xl font-bold text-[#173D32]">
              No active travel enquiries found
            </h3>
            <p className="text-xs text-[#252525]/70 max-w-md mx-auto">
              You haven't submitted any travel enquiries yet. Choose a holiday circuit from our catalog or submit a custom travel request to receive an itemized quotation.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => openEnquiryModal()}
                className="px-5 py-2.5 rounded-lg bg-[#173D32] text-white text-xs font-semibold hover:bg-[#122e25] transition-all"
              >
                Plan a Holiday
              </button>
              <button
                onClick={() => navigate('packages')}
                className="px-5 py-2.5 rounded-lg border border-[#173D32]/20 text-[#173D32] text-xs font-semibold hover:bg-[#173D32]/5 transition-all"
              >
                Explore Packages
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {enquiries.map((item) => {
              const { enquiry, extraction, reply } = item;
              return (
                <div
                  key={enquiry.id}
                  className="bg-white rounded-xl border border-[#173D32]/15 shadow-sm overflow-hidden space-y-5 p-6"
                >
                  {/* Top Bar with Reference Code and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#173D32] bg-[#173D32]/5 px-2 py-0.5 rounded">
                          {enquiry.id.replace('enq_', 'ENQ-').toUpperCase()}
                        </span>
                        <span className="text-xs text-[#252525]/60">·</span>
                        <span className="text-xs text-[#252525]/70">
                          Submitted on {new Date(enquiry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#173D32] mt-1">
                        Holiday Request: {enquiry.destination}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {sentHistory[enquiry.id] && (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sent to {sentHistory[enquiry.id].email}</span>
                        </span>
                      )}
                      <button
                        onClick={() => openEmailModal(enquiry, reply)}
                        className="px-3 py-1.5 rounded-lg bg-[#EA4335] text-white text-xs font-semibold hover:bg-[#d33426] transition-all flex items-center gap-1.5 shadow-sm"
                        title="Send booking details & quotation to your Gmail"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send to Gmail</span>
                      </button>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{reply ? 'Official Quotation Ready' : 'Under Review by Kochi Desk'}</span>
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Progress Indicator */}
                  <div className="p-4 rounded-lg bg-[#F8F7F2] border border-[#173D32]/10 space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#173D32] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#B89A56]" />
                      <span>Operations Workflow Timeline</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>1. Enquiry Logged</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>2. AI Ingested</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>3. Specialist Review</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-medium ${reply ? 'text-emerald-800' : 'text-neutral-400'}`}>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${reply ? 'text-emerald-600' : 'text-neutral-300'}`} />
                        <span>4. Quote Dispatched</span>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-y border-neutral-100 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-[#252525]/60 font-semibold block">
                        Travel Season
                      </span>
                      <span className="font-semibold text-[#173D32] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#B89A56]" />
                        {enquiry.travelDate}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-[#252525]/60 font-semibold block">
                        Duration & Group
                      </span>
                      <span className="font-semibold text-[#173D32] flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-[#B89A56]" />
                        {enquiry.adults} Adults {enquiry.children > 0 ? `+ ${enquiry.children} Child` : ''} · {enquiry.duration}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-[#252525]/60 font-semibold block">
                        Approx Budget
                      </span>
                      <span className="font-mono font-bold text-[#173D32] text-sm mt-0.5 block">
                        ₹{enquiry.budget.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-[#252525]/60 font-semibold block">
                        Assigned Desk
                      </span>
                      <span className="font-semibold text-[#173D32] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#B89A56]" />
                        Kochi Marine Drive HQ
                      </span>
                    </div>
                  </div>

                  {/* Original Message & Extracted Requirements */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#173D32]">
                      Original Request Message:
                    </span>
                    <p className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[#252525]/80 italic leading-relaxed">
                      "{enquiry.originalMessage}"
                    </p>
                  </div>

                  {/* Official Travel Desk Quotation / Reply Box */}
                  {reply && (
                    <div className="p-5 rounded-xl bg-[#173D32]/5 border border-[#173D32]/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-[#173D32] text-[#B89A56] flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#173D32]">
                              Official Quotation from WanderCMS Travel Specialist
                            </span>
                            <div className="text-[10px] text-[#252525]/60">
                              Prepared with verified twin-sharing rates & 5% GST
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEmailModal(enquiry, reply)}
                            className="px-3 py-1.5 rounded-lg bg-[#EA4335] text-white text-xs font-semibold hover:bg-[#d33426] transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email Voucher</span>
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                              `Hi WanderCMS Team, I am inquiring regarding my quotation for Reference Code ${enquiry.id.replace('enq_', 'ENQ-').toUpperCase()} (${enquiry.destination}).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition-all flex items-center gap-1 shadow-sm shrink-0"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chat on WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-white border border-[#173D32]/10 text-xs text-[#252525]/80 leading-relaxed whitespace-pre-line font-sans">
                        {reply.draftContent}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                        <span className="text-[11px] text-[#252525]/60">
                          Need modifications? Reply directly on WhatsApp or call our desk at +91 (0484) 238-0000.
                        </span>
                        <button
                          onClick={() => navigate('packages', { destination: enquiry.destination })}
                          className="text-[#173D32] hover:text-[#B89A56] font-bold flex items-center gap-1 text-xs"
                        >
                          <span>Explore Available Circuit Packages</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Booking Voucher to Gmail Modal */}
      {emailModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#173D32]/20 overflow-hidden my-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-[#173D32] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EA4335] text-white flex items-center justify-center shadow">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Send Booking Voucher to Gmail
                  </h3>
                  <p className="text-xs text-neutral-300">
                    Ref: {emailModalData.enquiry.id.replace('enq_', 'ENQ-').toUpperCase()} · {emailModalData.enquiry.destination}
                  </p>
                </div>
              </div>
              <button
                onClick={closeEmailModal}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-xs text-[#252525]/75 leading-relaxed">
                Send your official WanderCMS holiday quotation, trip specifications, verified twin-sharing pricing (with 5% GST), and Kochi operations desk contact details to any Gmail address.
              </p>

              {/* Status messages */}
              {emailSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{emailSuccessMessage}</span>
                </div>
              )}

              {emailErrorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{emailErrorMessage}</span>
                </div>
              )}

              {/* Recipient Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#173D32] uppercase tracking-wider">
                  Recipient Gmail / Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={recipientGmail}
                    onChange={(e) => setRecipientGmail(e.target.value)}
                    placeholder="e.g. traveller@gmail.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#EA4335] text-xs font-mono"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {user?.email && user.email !== recipientGmail && (
                      <button
                        type="button"
                        onClick={() => setRecipientGmail(user.email)}
                        className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-1 rounded font-sans transition-colors"
                      >
                        Use My Email
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#252525]/60">
                  Tip: You can send to any personal or group email (e.g. family members or co-travellers).
                </p>
              </div>

              {/* Voucher Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#173D32] text-[11px] uppercase tracking-wider">
                    Voucher Content Preview:
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Official WanderCMS Tour Operations Voucher
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto bg-neutral-900 text-neutral-200 rounded-xl p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-neutral-800 select-all">
                  {formatVoucherText(emailModalData.enquiry, emailModalData.reply)}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-[#F8F7F2] border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyVoucher}
                  className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Voucher</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Open in Gmail Web */}
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                    recipientGmail
                  )}&su=${encodeURIComponent(
                    `WanderCMS Tour Voucher: ${emailModalData.enquiry.id.replace('enq_', 'ENQ-').toUpperCase()} (${emailModalData.enquiry.destination})`
                  )}&body=${encodeURIComponent(
                    formatVoucherText(emailModalData.enquiry, emailModalData.reply)
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg border border-[#EA4335] text-[#EA4335] hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Open draft directly in Gmail Web"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Gmail Web</span>
                </a>

                {/* Instant Send to Email */}
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="px-4 py-2 rounded-lg bg-[#EA4335] hover:bg-[#d33426] text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Gmail</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
