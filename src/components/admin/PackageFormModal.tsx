import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TravelPackage, SeasonalPrice, ItineraryDay } from '../../types';
import { DESTINATION_IMAGES } from '../../assets/images';
import { X, Plus, Trash2, Save, Send, AlertCircle, Eye, Check } from 'lucide-react';

interface PackageFormModalProps {
  pkg?: TravelPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onPreviewDraft?: (slug: string) => void;
}

export const PackageFormModal: React.FC<PackageFormModalProps> = ({
  pkg,
  isOpen,
  onClose,
  onSaved,
  onPreviewDraft,
}) => {
  const isEditing = Boolean(pkg);

  const [formData, setFormData] = useState({
    packageId: '',
    title: '',
    slug: '',
    destination: '',
    description: '',
    days: 6,
    nights: 5,
    hotelCategory: '4 star',
    photos: [DESTINATION_IMAGES.alleppeyHouseboat, DESTINATION_IMAGES.munnarTea],
    gstInformation: '5% GST applicable on all bookings',
    pricingBasis: 'Per person on twin-sharing basis',
    seoTitle: '',
    seoDescription: '',
    changeSummary: '',
  });

  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([
    {
      id: 'sp_1',
      seasonName: 'Peak Season',
      startMonth: 'October',
      endMonth: 'March',
      pricePerPerson: 32500,
      hotelCategory: '4 star',
      pricingBasis: 'Twin-sharing basis',
      gstInformation: '5% GST applicable',
    },
    {
      id: 'sp_2',
      seasonName: 'Monsoon Season',
      startMonth: 'June',
      endMonth: 'September',
      pricePerPerson: 24900,
      hotelCategory: '4 star',
      pricingBasis: 'Twin-sharing basis',
      gstInformation: '5% GST applicable',
    },
  ]);

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    {
      day: 1,
      title: 'Arrival & Scenic Transfer',
      description: 'Chauffeur airport reception and drive past waterfalls to your luxury resort.',
      mealsIncluded: 'Dinner',
      overnightStay: 'Hill Resort (4 Star)',
    },
    {
      day: 2,
      title: 'Plantations & Nature Sanctuary',
      description: 'Guided tour of rolling tea hills and national park wildlife.',
      mealsIncluded: 'Breakfast & Dinner',
      overnightStay: 'Hill Resort (4 Star)',
    },
  ]);

  const [inclusions, setInclusions] = useState<string[]>([
    'Accommodation in verified 4-star resorts on twin-sharing basis',
    'Private air-conditioned car with courteous professional chauffeur',
    'Daily buffet breakfast and dinner',
    'All fuel, toll, parking and driver allowances',
  ]);

  const [exclusions, setExclusions] = useState<string[]>([
    'Airfare / train fare to destination',
    'Personal expenses and optional monument entry tickets',
  ]);

  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pkg) {
      setFormData({
        packageId: pkg.packageId,
        title: pkg.title,
        slug: pkg.slug,
        destination: pkg.destination,
        description: pkg.description,
        days: pkg.days,
        nights: pkg.nights,
        hotelCategory: pkg.hotelCategory,
        photos: pkg.photos || [DESTINATION_IMAGES.alleppeyHouseboat],
        gstInformation: pkg.gstInformation || '5% GST applicable on all bookings',
        pricingBasis: pkg.pricingBasis || 'Per person on twin-sharing basis',
        seoTitle: pkg.seoTitle || '',
        seoDescription: pkg.seoDescription || '',
        changeSummary: '',
      });
      setSeasonalPrices(pkg.seasonalPrices || []);
      setItinerary(pkg.itinerary || []);
      setInclusions(pkg.inclusions || []);
      setExclusions(pkg.exclusions || []);
    }
  }, [pkg, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.packageId.trim()) errs.packageId = 'Package ID is required';
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.slug.trim()) errs.slug = 'Slug is required';
    if (!formData.destination.trim()) errs.destination = 'Destination is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (formData.days < 1) errs.days = 'Days must be at least 1';
    if (seasonalPrices.length === 0) errs.seasonalPrices = 'At least one seasonal price record is required';

    // Validate seasonal pricing prices
    for (const sp of seasonalPrices) {
      if (sp.pricePerPerson <= 0) {
        errs.seasonalPrices = `Price for "${sp.seasonName}" must be greater than zero.`;
      }
    }

    return errs;
  };

  const handleSaveDraft = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        seasonalPrices,
        itinerary,
        inclusions,
        exclusions,
        status: 'draft',
      };

      if (isEditing && pkg) {
        await api.updatePackageDraft(pkg.id, payload, formData.changeSummary || 'Staff draft revision');
      } else {
        await api.createPackage(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setErrors({ global: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      if (isEditing && pkg) {
        // Save draft first then publish
        await api.updatePackageDraft(pkg.id, {
          ...formData,
          seasonalPrices,
          itinerary,
          inclusions,
          exclusions,
        }, formData.changeSummary || 'Pre-publish update');
        await api.publishPackage(pkg.id);
      } else {
        const res = await api.createPackage({
          ...formData,
          seasonalPrices,
          itinerary,
          inclusions,
          exclusions,
          status: 'published',
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setErrors({ global: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  // Seasonal Pricing Helpers
  const addSeasonalPrice = () => {
    setSeasonalPrices([
      ...seasonalPrices,
      {
        id: `sp_${Date.now()}`,
        seasonName: 'Special Season',
        startMonth: 'April',
        endMonth: 'May',
        pricePerPerson: 25000,
        hotelCategory: formData.hotelCategory,
        pricingBasis: 'Twin-sharing basis',
        gstInformation: '5% GST applicable',
      },
    ]);
  };

  const updateSeasonalPrice = (index: number, field: keyof SeasonalPrice, value: any) => {
    const copy = [...seasonalPrices];
    (copy[index] as any)[field] = value;
    setSeasonalPrices(copy);
  };

  const removeSeasonalPrice = (index: number) => {
    setSeasonalPrices(seasonalPrices.filter((_, i) => i !== index));
  };

  // Itinerary Helpers
  const addItineraryDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      {
        day: nextDay,
        title: `Day ${nextDay} Itinerary`,
        description: 'Explore scenic attractions with private chauffeur.',
        mealsIncluded: 'Breakfast',
        overnightStay: 'Hotel / Resort',
      },
    ]);
  };

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: any) => {
    const copy = [...itinerary];
    (copy[index] as any)[field] = value;
    setItinerary(copy);
  };

  const removeItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }));
    setItinerary(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-[#173D32]/10 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#173D32] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#B89A56] font-semibold">
              Package Management CMS
            </span>
            <h2 className="font-display text-xl font-bold">
              {isEditing ? `Edit Package: ${pkg?.title}` : 'Create New Holiday Package'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {errors.global && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.global}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-bold text-[#173D32] border-b pb-1">
              1. Basic Package Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#173D32] mb-1">
                  Package ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PKG-KL-07"
                  value={formData.packageId}
                  onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-neutral-300 font-mono"
                />
                {errors.packageId && <p className="text-red-600 mt-0.5">{errors.packageId}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#173D32] mb-1">
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Munnar, Thekkady and Alleppey houseboat"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setFormData({
                      ...formData,
                      title,
                      slug: isEditing ? formData.slug : autoSlug,
                    });
                  }}
                  className="w-full px-3 py-2 rounded border border-neutral-300"
                />
                {errors.title && <p className="text-red-600 mt-0.5">{errors.title}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#173D32] mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-neutral-300 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#173D32] mb-1">
                  Destination Corridor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Munnar, Thekkady, Alleppey, Kerala"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-neutral-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#173D32] mb-1">
                  Hotel Category Rating
                </label>
                <select
                  value={formData.hotelCategory}
                  onChange={(e) => setFormData({ ...formData, hotelCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-neutral-300 bg-white"
                >
                  <option value="3 star">3 Star Deluxe</option>
                  <option value="4 star">4 Star Premium</option>
                  <option value="5 star">5 Star Luxury</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#173D32] mb-1">Days</label>
                <input
                  type="number"
                  min={1}
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded border border-neutral-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#173D32] mb-1">Nights</label>
                <input
                  type="number"
                  min={0}
                  value={formData.nights}
                  onChange={(e) => setFormData({ ...formData, nights: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded border border-neutral-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#173D32] mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded border border-neutral-300"
              />
            </div>
          </div>

          {/* Section 2: SEASONAL PRICING BUILDER (Section 11) */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-[#173D32]">
                  2. Seasonal Pricing Matrix
                </h3>
                <p className="text-[11px] text-[#252525]/60">
                  Allow editors to update seasonal prices without changing code.
                </p>
              </div>
              <button
                type="button"
                onClick={addSeasonalPrice}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#173D32]/10 text-[#173D32] hover:bg-[#173D32]/20 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Season Record</span>
              </button>
            </div>

            {errors.seasonalPrices && (
              <p className="text-red-600 text-xs">{errors.seasonalPrices}</p>
            )}

            <div className="space-y-3">
              {seasonalPrices.map((sp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-neutral-200 bg-[#F8F7F2]/50 grid grid-cols-1 sm:grid-cols-6 gap-3 items-end"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-[#173D32] mb-0.5">
                      Season Name
                    </label>
                    <input
                      type="text"
                      value={sp.seasonName}
                      onChange={(e) => updateSeasonalPrice(idx, 'seasonName', e.target.value)}
                      placeholder="e.g. Peak Season"
                      className="w-full px-2 py-1.5 rounded border border-neutral-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#173D32] mb-0.5">
                      Start Month
                    </label>
                    <input
                      type="text"
                      value={sp.startMonth}
                      onChange={(e) => updateSeasonalPrice(idx, 'startMonth', e.target.value)}
                      placeholder="e.g. October"
                      className="w-full px-2 py-1.5 rounded border border-neutral-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#173D32] mb-0.5">
                      End Month
                    </label>
                    <input
                      type="text"
                      value={sp.endMonth}
                      onChange={(e) => updateSeasonalPrice(idx, 'endMonth', e.target.value)}
                      placeholder="e.g. March"
                      className="w-full px-2 py-1.5 rounded border border-neutral-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#173D32] mb-0.5">
                      Price/Person (₹)
                    </label>
                    <input
                      type="number"
                      step={500}
                      value={sp.pricePerPerson}
                      onChange={(e) => updateSeasonalPrice(idx, 'pricePerPerson', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSeasonalPrice(idx)}
                      disabled={seasonalPrices.length <= 1}
                      className="p-1.5 text-red-500 hover:text-red-700 disabled:opacity-30"
                      title="Remove Season"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-[#173D32] mb-1">
                  Pricing Basis
                </label>
                <input
                  type="text"
                  value={formData.pricingBasis}
                  onChange={(e) => setFormData({ ...formData, pricingBasis: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-neutral-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#173D32] mb-1">
                  GST Information
                </label>
                <input
                  type="text"
                  value={formData.gstInformation}
                  onChange={(e) => setFormData({ ...formData, gstInformation: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-neutral-300"
                />
              </div>
            </div>
          </div>

          {/* Section 3: ITINERARY BUILDER */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-[#173D32]">
                  3. Day-Wise Itinerary Plan
                </h3>
              </div>
              <button
                type="button"
                onClick={addItineraryDay}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#173D32]/10 text-[#173D32] hover:bg-[#173D32]/20 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day</span>
              </button>
            </div>

            <div className="space-y-3">
              {itinerary.map((day, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-neutral-200 space-y-2 bg-neutral-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#173D32]">Day {day.day}</span>
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(idx)}
                      disabled={itinerary.length <= 1}
                      className="text-red-500 hover:text-red-700 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Day title"
                    value={day.title}
                    onChange={(e) => updateItineraryDay(idx, 'title', e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-neutral-300 bg-white font-medium"
                  />
                  <textarea
                    rows={2}
                    placeholder="Day description"
                    value={day.description}
                    onChange={(e) => updateItineraryDay(idx, 'description', e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-neutral-300 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Version Changelog Note */}
          {isEditing && (
            <div className="pt-4 border-t space-y-1">
              <label className="block font-semibold text-[#173D32]">
                Change Summary (Preserved in immutable version history)
              </label>
              <input
                type="text"
                placeholder="e.g. Updated peak season tariff and added deluxe houseboat amenity notes"
                value={formData.changeSummary}
                onChange={(e) => setFormData({ ...formData, changeSummary: e.target.value })}
                className="w-full px-3 py-2 rounded border border-neutral-300"
              />
            </div>
          )}
        </div>

        {/* Modal Action Footer (Draft / Preview / Publish) */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[#252525]/60">
            {isEditing ? (
              <span>Draft will NOT overwrite the currently published version until published.</span>
            ) : (
              <span>New packages can be saved as a draft first or published immediately.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            >
              Cancel
            </button>

            {isEditing && onPreviewDraft && (
              <button
                type="button"
                onClick={() => {
                  onPreviewDraft(formData.slug);
                  onClose();
                }}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded border border-[#B89A56] text-[#173D32] hover:bg-[#B89A56]/10"
              >
                <Eye className="w-3.5 h-3.5 text-[#B89A56]" />
                <span>Preview Draft</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-[#B89A56] text-[#173D32] hover:bg-[#a38746] transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft Snapshot</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#122e25] transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish to Live Site</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
