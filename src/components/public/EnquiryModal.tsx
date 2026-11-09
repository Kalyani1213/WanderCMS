import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, Clock, ShieldCheck, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: {
    destination?: string;
    packageTitle?: string;
    duration?: string;
    budget?: number;
  };
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose, prefill }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    destination: prefill?.destination || 'Kerala',
    travelDate: 'December 2026',
    adults: 2,
    children: 0,
    duration: prefill?.duration || '5-6 nights',
    budget: prefill?.budget || 120000,
    specialRequirements: prefill?.packageTitle ? `Interested in: ${prefill.packageTitle}. Houseboat stay requested.` : '',
    whatsappConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<{
    enquiryId: string;
    acknowledgement: {
      message: string;
      timestamp: string;
      status: string;
      externalDelivery: string;
    };
  } | null>(null);

  const handleResetAndClose = () => {
    setSuccessData(null);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleResetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerName.trim()) errs.customerName = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 7) errs.phone = 'Valid phone number is required';
    if (!formData.destination.trim()) errs.destination = 'Destination is required';
    if (!formData.travelDate.trim()) errs.travelDate = 'Travel date is required';
    if (formData.adults < 1) errs.adults = 'Adults must be at least 1';
    if (formData.children < 0) errs.children = 'Children cannot be negative';
    if (formData.budget <= 0) errs.budget = 'Please enter a valid positive budget';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await api.submitEnquiry({
        ...formData,
        originalMessage: `Hi, ${formData.adults} adults and ${formData.children} kids, ${formData.destination} ${formData.duration} in ${formData.travelDate}, budget around ₹${formData.budget.toLocaleString('en-IN')}. Notes: ${formData.specialRequirements}`,
      });

      setSuccessData({
        enquiryId: res.enquiryId,
        acknowledgement: res.acknowledgement,
      });
    } catch (err) {
      setErrors({ global: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#173D32]/10 overflow-hidden my-8">
        {/* Header with Back Button */}
        <div className="bg-[#173D32] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="p-1.5 -ml-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="border-l border-white/20 pl-3">
              <div className="text-[10px] uppercase tracking-wider text-[#B89A56] font-semibold">
                WanderCMS Travel Desk
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold leading-tight">
                {prefill?.packageTitle ? `Enquire: ${prefill.packageTitle}` : 'Plan Your South India Journey'}
              </h2>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {successData ? (
            /* Screen 4 Success & In-App Acknowledgement State (Section 15) */
            <div className="space-y-6 py-2">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-emerald-950 text-base">
                    Enquiry Successfully Received!
                  </h3>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    {successData.acknowledgement.message}
                  </p>
                </div>
              </div>

              {/* Acknowledgement Audit Details */}
              <div className="rounded-lg border border-[#173D32]/10 p-4 space-y-3 bg-[#F8F7F2]">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#173D32]/10">
                  <span className="text-[#252525]/60 font-medium">Reference Code:</span>
                  <span className="font-mono font-bold text-[#173D32]">
                    {successData.enquiryId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#173D32]/10">
                  <span className="text-[#252525]/60 font-medium">Logged Timestamp:</span>
                  <span className="font-mono text-[#252525]/80">
                    {new Date(successData.acknowledgement.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#173D32]/10">
                  <span className="text-[#252525]/60 font-medium">In-App Acknowledgement:</span>
                  <span className="font-semibold text-emerald-700">
                    {successData.acknowledgement.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#252525]/60 font-medium">External Gateway Delivery:</span>
                  <span className="text-[#252525]/60 italic">
                    {successData.acknowledgement.externalDelivery}
                  </span>
                </div>
              </div>

              {/* AI Ingestion confirmation badge */}
              <div className="flex items-center gap-2 text-xs text-[#173D32] bg-[#B89A56]/10 px-3 py-2 rounded border border-[#B89A56]/30">
                <Sparkles className="w-4 h-4 text-[#B89A56] shrink-0" />
                <span>
                  Requirements auto-extracted by AI and queued for human travel consultant review in Kochi.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 text-xs font-semibold rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Packages</span>
                </button>
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25] transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Enquiry Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.global && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.global}</span>
                </div>
              )}

              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded border ${
                      errors.customerName ? 'border-red-500' : 'border-neutral-300'
                    } focus:outline-none focus:border-[#173D32] bg-white`}
                  />
                  {errors.customerName && <p className="text-[11px] text-red-600 mt-0.5">{errors.customerName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded border ${
                      errors.email ? 'border-red-500' : 'border-neutral-300'
                    } focus:outline-none focus:border-[#173D32] bg-white`}
                  />
                  {errors.email && <p className="text-[11px] text-red-600 mt-0.5">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Phone & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98201 44521"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded border ${
                      errors.phone ? 'border-red-500' : 'border-neutral-300'
                    } focus:outline-none focus:border-[#173D32] bg-white`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-600 mt-0.5">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kerala, Munnar & Alleppey"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded border border-neutral-300 focus:outline-none focus:border-[#173D32] bg-white"
                  />
                </div>
              </div>

              {/* Row 3: Travel Date & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Travel Month / Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. December 2026 or 15-22 Dec"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded border border-neutral-300 focus:outline-none focus:border-[#173D32] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Trip Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded border border-neutral-300 focus:outline-none focus:border-[#173D32] bg-white"
                  >
                    <option value="3-4 nights">3-4 nights</option>
                    <option value="5-6 nights">5-6 nights (Recommended)</option>
                    <option value="7-8 nights">7-8 nights</option>
                    <option value="9+ nights">9+ nights Grand South Tour</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Adults, Children, Total Budget */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Adults <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm rounded border border-neutral-300 focus:outline-none focus:border-[#173D32] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded border border-neutral-300 focus:outline-none focus:border-[#173D32] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Approx Budget (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step={5000}
                    min={10000}
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm font-mono rounded border border-neutral-300 focus:outline-none focus:border-[#173D32] bg-white"
                  />
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <label className="block text-xs font-semibold text-[#173D32] mb-1">
                  Specific Requirements or Requests
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Private air-conditioned houseboat a must, vegetarian meals, hill resort with view..."
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded border border-neutral-300 focus:outline-none focus:border-[#173D32] bg-white"
                />
              </div>

              {/* WhatsApp Consent (Not mandatory) */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-[#252525]/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.whatsappConsent}
                    onChange={(e) => setFormData({ ...formData, whatsappConsent: e.target.checked })}
                    className="mt-0.5 rounded border-neutral-300 text-[#173D32] focus:ring-[#173D32]"
                  />
                  <span>
                    I consent to receiving holiday quote updates and itinerary details via WhatsApp.
                    <span className="text-[11px] text-[#252525]/50 block">
                      (Optional. We never send unsolicited spam.)
                    </span>
                  </span>
                </label>
              </div>

              {/* Action Buttons: Back + Submit Enquiry */}
              <div className="pt-4 border-t border-[#173D32]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-[#252525]/60 order-2 sm:order-1">
                  Direct tariff from local Kochi tour operator
                </span>
                <div className="flex items-center gap-2.5 order-1 sm:order-2 justify-end">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25] disabled:opacity-50 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    {loading ? (
                      <span>Processing Enquiry...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Travel Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
