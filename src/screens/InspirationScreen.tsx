import React from 'react';
import { DESTINATION_IMAGES } from '../assets/images';
import { ArrowRight, Compass, Calendar, Clock } from 'lucide-react';

interface InspirationScreenProps {
  navigate: (route: string, params?: Record<string, string>) => void;
  openEnquiryModal: (prefill?: any) => void;
}

export const InspirationScreen: React.FC<InspirationScreenProps> = ({ navigate, openEnquiryModal }) => {
  const articles = [
    {
      id: 'guide-houseboat',
      title: 'A Discerning Guide to Private Houseboat Charters in Alleppey',
      subtitle: 'Understanding hull architecture, crew etiquette, food preparation, and nocturnal docking in Kerala backwaters.',
      readTime: '6 min read',
      image: DESTINATION_IMAGES.alleppeyHouseboat,
      category: 'Backwater Navigation',
      linkedPackageSlug: 'munnar-thekkady-alleppey-houseboat',
      content: `The traditional Kerala kettuvallam—once used to transport rice and spices across the lake network of Kuttanad—has evolved into one of the world's most tranquil luxury travel accommodations. 
      
When booking a private charter with WanderCMS, your vessel is entirely exclusive to your party. Our boats feature tied bamboo hulls treated with fish oil and neem resin, powered by silent outboard motors with private bedrooms, ensuite washrooms, and shaded front viewing decks.

Meals on board are prepared fresh by your dedicated onboard chef: spiced pearl spot (Karimeen Pollichathu), fragrant red rice, avial, and evening tapioca chips served with cardamom tea as the sun sets over Vembanad Lake.`,
    },
    {
      id: 'guide-munnar',
      title: 'Munnar & Thekkady: Tracking the High Ranges of the Western Ghats',
      subtitle: 'From mist-laden Nilgiri tea estates to spice gardens and Periyar wildlife sanctuaries.',
      readTime: '5 min read',
      image: DESTINATION_IMAGES.munnarTea,
      category: 'High Altitude Flora',
      linkedPackageSlug: 'munnar-thekkady-alleppey-houseboat',
      content: `Perched at 1,600 metres above sea level, Munnar's undulating hills host some of the world's highest tea plantations. The morning air carries the aroma of crushed camphor and fresh leaf tips.
      
A morning journey to Eravikulam National Park offers a glimpse of the rare Nilgiri Tahr mountain goat against the granite cliffs of Anamudi. Proceeding south toward Thekkady, the landscape shifts from trimmed tea carpets into the dense evergreen canopies of the Periyar Tiger Reserve, home to wild elephant herds, sambar deer, and cardamom estates.`,
    },
    {
      id: 'guide-temples',
      title: 'Dravidian Gopurams: The Sacred Corridor of Madurai and Rameswaram',
      subtitle: 'The engineering marvel of 1000-pillar corridors and sea-spanning bridges in Tamil Nadu.',
      readTime: '7 min read',
      image: DESTINATION_IMAGES.maduraiTemple,
      category: 'Heritage Architecture',
      linkedPackageSlug: 'madurai-rameswaram-kanyakumari',
      content: `Rising high above the ancient street grid of Madurai, the 14 multi-tiered gopurams of Meenakshi Amman Temple represent the zenith of Nayak period stone carving, depicting thousands of celestial dancers, deities, and mythic beasts.
      
Further east, crossing the historic Pamban Railway Bridge across the Palk Strait reveals the sacred island of Rameswaram, where the Ramanathaswamy Temple features the longest pillared corridor in the world with over 1,200 carved sandstone pillars.`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#173D32]/10 pb-6">
        <span className="text-xs uppercase tracking-widest text-[#B89A56] font-semibold">
          Editorial Travel Perspectives
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#173D32] mt-1">
          Travel Inspiration & South India Guides
        </h1>
        <p className="text-sm text-[#252525]/70 mt-2 max-w-2xl">
          Deep-dive destination insights from our Kochi-based tour specialists, directly connecting you to thoughtfully curated travel packages.
        </p>
      </div>

      {/* Featured Guide Banner */}
      <div className="rounded-xl overflow-hidden border border-[#173D32]/10 bg-white grid grid-cols-1 lg:grid-cols-2 shadow-sm">
        <div className="aspect-[16/10] lg:aspect-auto w-full bg-neutral-100">
          <img
            src={DESTINATION_IMAGES.heroKerala}
            alt="Western Ghats Guide"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-[#B89A56] font-semibold">
              Featured Insight · 8 min read
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#173D32] leading-tight">
              The Seasonal Rhythm of God’s Own Country: Peak Winter vs Monsoon Ayurveda
            </h2>
            <p className="text-xs sm:text-sm text-[#252525]/80 leading-relaxed font-light">
              Why Kerala changes completely between October's cool mountain breezes and June's restorative Southwest Monsoon showers. Learn how to select the right season for your family holiday.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <button
              onClick={() => navigate('packages')}
              className="text-xs font-semibold text-[#173D32] hover:text-[#B89A56] flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Seasonal Packages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openEnquiryModal({ destination: 'Kerala' })}
              className="px-4 py-2 rounded bg-[#173D32] text-white text-xs font-semibold hover:bg-[#122e25]"
            >
              Plan Journey
            </button>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((art) => (
          <div
            key={art.id}
            className="rounded-xl overflow-hidden border border-[#173D32]/10 bg-white flex flex-col justify-between hover:border-[#B89A56]/60 transition-all hover:shadow-md"
          >
            <div>
              <div className="aspect-[16/10] w-full bg-neutral-100 overflow-hidden">
                <img
                  src={art.image}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="p-6 space-y-3">
                <div className="text-[11px] text-[#B89A56] font-semibold uppercase tracking-wider">
                  {art.category} · {art.readTime}
                </div>

                <h3 className="font-display text-lg font-bold text-[#173D32] leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-[#252525]/75 line-clamp-3 leading-relaxed">
                  {art.subtitle}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-neutral-100 flex items-center justify-between mt-4">
              <button
                onClick={() => navigate('package-detail', { slug: art.linkedPackageSlug })}
                className="text-xs font-semibold text-[#173D32] hover:text-[#B89A56] flex items-center gap-1 transition-colors"
              >
                <span>View Related Tour</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
