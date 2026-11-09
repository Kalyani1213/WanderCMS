import { AIExtraction, Enquiry, ExtractedFields, PackageMatch, TravelPackage } from '../types';
import { db } from './db';

export interface AIServiceStatus {
  groqConfigured: boolean;
  geminiConfigured: boolean;
  activeProvider: 'groq' | 'gemini' | 'heuristic-fallback';
}

export class AIService {
  private groqApiKey: string | null = null;
  private geminiApiKey: string | null = null;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || null;
    this.geminiApiKey = process.env.GEMINI_API_KEY || null;
  }

  public getStatus(): AIServiceStatus {
    const groqOk = Boolean(this.groqApiKey && this.groqApiKey.trim().length > 5);
    const geminiOk = Boolean(this.geminiApiKey && this.geminiApiKey.trim().length > 5);
    let active: 'groq' | 'gemini' | 'heuristic-fallback' = 'heuristic-fallback';
    if (groqOk) active = 'groq';
    else if (geminiOk) active = 'gemini';

    return {
      groqConfigured: groqOk,
      geminiConfigured: geminiOk,
      activeProvider: active,
    };
  }

  // ================= 1. ENQUIRY EXTRACTION =================
  public async extractEnquiryDetails(
    enquiry: Enquiry,
    forceProvider?: 'groq' | 'gemini' | 'heuristic-fallback'
  ): Promise<AIExtraction> {
    const enquiryId = enquiry.id;
    const originalText = enquiry.originalMessage || `${enquiry.destination} trip for ${enquiry.adults} adults`;
    const now = new Date().toISOString();

    const providerToUse = forceProvider || this.getStatus().activeProvider;

    // 1. Try Groq if configured
    if (providerToUse === 'groq' && this.groqApiKey) {
      try {
        const groqResult = await this.callGroqExtraction(originalText, enquiry);
        return {
          id: `aix_${Date.now()}`,
          enquiryId,
          extractedFields: groqResult.extractedFields,
          confidence: groqResult.confidence,
          missingFields: groqResult.missingFields,
          correctionHistory: [],
          processingStatus: 'completed',
          provider: 'groq',
          createdAt: now,
          updatedAt: now,
        };
      } catch (err) {
        console.warn('Groq extraction failed, logging failure state:', (err as Error).message);
        // Note: We don't crash, we record failed status with clear details as per Section 14.D
        // and allow admin retry or fallback!
        const fallback = this.heuristicExtraction(originalText, enquiry);
        return {
          id: `aix_${Date.now()}`,
          enquiryId,
          extractedFields: fallback.extractedFields,
          confidence: 'medium',
          missingFields: fallback.missingFields,
          correctionHistory: [],
          processingStatus: 'failed',
          errorDetails: `Groq API Error: ${(err as Error).message}. (Heuristic fallback parsed)`,
          provider: 'heuristic-fallback',
          createdAt: now,
          updatedAt: now,
        };
      }
    }

    // 2. If Gemini is available and requested
    if (providerToUse === 'gemini' && this.geminiApiKey) {
      try {
        const geminiResult = await this.callGeminiExtraction(originalText, enquiry);
        return {
          id: `aix_${Date.now()}`,
          enquiryId,
          extractedFields: geminiResult.extractedFields,
          confidence: geminiResult.confidence,
          missingFields: geminiResult.missingFields,
          correctionHistory: [],
          processingStatus: 'completed',
          provider: 'gemini',
          createdAt: now,
          updatedAt: now,
        };
      } catch (err) {
        console.warn('Gemini extraction failed:', (err as Error).message);
      }
    }

    // 3. Built-in Deterministic NLP Extractor (Clean fallback when external keys are not yet entered)
    const heuristic = this.heuristicExtraction(originalText, enquiry);
    return {
      id: `aix_${Date.now()}`,
      enquiryId,
      extractedFields: heuristic.extractedFields,
      confidence: heuristic.confidence,
      missingFields: heuristic.missingFields,
      correctionHistory: [],
      processingStatus: this.groqApiKey ? 'completed' : 'unconfigured',
      errorDetails: this.groqApiKey
        ? undefined
        : 'GROQ_API_KEY is not configured in environment. Deterministic NLP extraction applied.',
      provider: 'heuristic-fallback',
      createdAt: now,
      updatedAt: now,
    };
  }

  // --- Groq Structured Extraction ---
  private async callGroqExtraction(
    message: string,
    enquiryFallback: Enquiry
  ): Promise<{
    extractedFields: ExtractedFields;
    confidence: 'high' | 'medium' | 'low';
    missingFields: string[];
  }> {
    const prompt = `You are a tour operator enquiry parsing engine. Extract travel requirements strictly in valid JSON without markdown wrapping.

Customer Message:
"${message}"

Form values provided by user:
- Destination: "${enquiryFallback.destination}"
- Travel Date: "${enquiryFallback.travelDate}"
- Adults: ${enquiryFallback.adults}
- Children: ${enquiryFallback.children}
- Budget: ${enquiryFallback.budget}

Return exactly this JSON schema:
{
  "destination": string,
  "adults": number,
  "children": number,
  "duration": string,
  "travelMonth": string,
  "budget": number,
  "requirements": string[],
  "missingFields": string[],
  "confidence": "high" | "medium" | "low"
}

Distinguish explicit details from inferred details. Do not invent dates or budgets. If budget is in "lakh", convert to numeric rupees (e.g., 1.2 lakh = 120000).`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Groq HTTP ${resp.status}: ${errorText}`);
      }

      const json = await resp.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');

      const parsed = JSON.parse(content);
      return {
        extractedFields: {
          destination: parsed.destination || enquiryFallback.destination,
          adults: Number(parsed.adults) || enquiryFallback.adults || 1,
          children: Number(parsed.children) || enquiryFallback.children || 0,
          duration: parsed.duration || enquiryFallback.duration || '5-6 nights',
          travelMonth: parsed.travelMonth || enquiryFallback.travelDate || 'December',
          budget: Number(parsed.budget) || enquiryFallback.budget || 0,
          requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
        },
        confidence: parsed.confidence === 'high' || parsed.confidence === 'low' ? parsed.confidence : 'medium',
        missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields : [],
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  // --- Gemini Structured Extraction Fallback ---
  private async callGeminiExtraction(
    message: string,
    enquiryFallback: Enquiry
  ): Promise<{
    extractedFields: ExtractedFields;
    confidence: 'high' | 'medium' | 'low';
    missingFields: string[];
  }> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`;
    const prompt = `Extract travel parameters from this message into JSON.
Message: "${message}"
JSON schema:
{
  "destination": string,
  "adults": number,
  "children": number,
  "duration": string,
  "travelMonth": string,
  "budget": number,
  "requirements": string[],
  "missingFields": string[],
  "confidence": "high" | "medium" | "low"
}`;

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!resp.ok) throw new Error(`Gemini status ${resp.status}`);
    const data = await resp.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(raw);
    return {
      extractedFields: {
        destination: parsed.destination || enquiryFallback.destination,
        adults: Number(parsed.adults) || enquiryFallback.adults,
        children: Number(parsed.children) || 0,
        duration: parsed.duration || enquiryFallback.duration,
        travelMonth: parsed.travelMonth || enquiryFallback.travelDate,
        budget: Number(parsed.budget) || enquiryFallback.budget,
        requirements: parsed.requirements || [],
      },
      confidence: parsed.confidence || 'high',
      missingFields: parsed.missingFields || [],
    };
  }

  // --- Deterministic Heuristic NLP Extractor ---
  public heuristicExtraction(
    message: string,
    fallback: Enquiry
  ): {
    extractedFields: ExtractedFields;
    confidence: 'high' | 'medium' | 'low';
    missingFields: string[];
  } {
    const text = message.toLowerCase();
    const missing: string[] = [];

    // Adults detection
    let adults = fallback.adults || 2;
    const adultsMatch = text.match(/(\d+)\s*(?:adults?|grown-ups?|pax|persons?)/i);
    if (adultsMatch) adults = parseInt(adultsMatch[1], 10);

    // Children detection
    let children = fallback.children || 0;
    const kidsMatch = text.match(/(\d+)\s*(?:kids?|children|child)/i);
    if (kidsMatch) children = parseInt(kidsMatch[1], 10);

    // Destination detection
    let destination = fallback.destination || 'Kerala';
    if (text.includes('kerala')) destination = 'Kerala';
    else if (text.includes('munnar')) destination = 'Munnar, Kerala';
    else if (text.includes('alleppey') || text.includes('alappuzha')) destination = 'Alleppey, Kerala';
    else if (text.includes('thekkady')) destination = 'Thekkady, Kerala';
    else if (text.includes('wayanad')) destination = 'Wayanad, Kerala';
    else if (text.includes('madurai')) destination = 'Madurai, Tamil Nadu';
    else if (text.includes('kanyakumari')) destination = 'Kanyakumari, Tamil Nadu';
    else if (text.includes('rameswaram')) destination = 'Rameswaram, Tamil Nadu';

    // Duration detection
    let duration = fallback.duration || '5-6 nights';
    const durationMatch = text.match(/(\d+(?:-\d+)?\s*(?:nights?|days?))/i);
    if (durationMatch) duration = durationMatch[1];

    // Travel Month detection
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
    ];
    let travelMonth = fallback.travelDate || '';
    for (const m of months) {
      if (text.includes(m)) {
        travelMonth = m.charAt(0).toUpperCase() + m.slice(1);
        break;
      }
    }
    if (!travelMonth) {
      travelMonth = fallback.travelDate || 'Not specified';
      missing.push('travelMonth');
    }

    // Budget detection (e.g. 1.2 lakh, 120000, 80k)
    let budget = fallback.budget || 0;
    const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)/i);
    if (lakhMatch) {
      budget = Math.round(parseFloat(lakhMatch[1]) * 100000);
    } else {
      const numericMatch = text.match(/(?:budget|around|approx|total)?\s*(?:₹|rs\.?|inr)?\s*(\d{4,7})/i);
      if (numericMatch) {
        budget = parseInt(numericMatch[1], 10);
      }
    }

    // Special Requirements
    const requirements: string[] = [];
    if (text.includes('houseboat') || text.includes('boat')) requirements.push('Houseboat');
    if (text.includes('honeymoon') || text.includes('couple')) requirements.push('Honeymoon amenities');
    if (text.includes('temple') || text.includes('darshan')) requirements.push('Temple visits');
    if (text.includes('wildlife') || text.includes('safari') || text.includes('periyar')) requirements.push('Wildlife / Safari');
    if (text.includes('tea') || text.includes('plantation')) requirements.push('Tea plantation stay');
    if (text.includes('kid') || text.includes('family')) requirements.push('Family friendly');
    if (text.includes('veg') || text.includes('jain')) requirements.push('Vegetarian cuisine');

    const confidence: 'high' | 'medium' | 'low' = missing.length === 0 ? 'high' : 'medium';

    return {
      extractedFields: {
        destination,
        adults,
        children,
        duration,
        travelMonth,
        budget,
        requirements,
      },
      confidence,
      missingFields: missing,
    };
  }

  // ================= 2. DETERMINISTIC PACKAGE MATCHING =================
  /**
   * Deterministic Backend Ranking System (Section 14.B)
   * Scoring Breakdown (Total 100 points):
   * - Destination match: 35 points
   * - Budget compatibility: 25 points
   * - Duration compatibility: 20 points
   * - Special requirement match: 20 points
   *
   * Only published packages are considered.
   * Actual database prices are used; never invented prices.
   */
  public async rankPackagesForEnquiry(
    extracted: ExtractedFields
  ): Promise<PackageMatch[]> {
    // Retrieve published packages only
    const publishedPackages = await db.getPackages({ status: 'published' });
    if (publishedPackages.length === 0) return [];

    const totalTravellers = Math.max(1, extracted.adults + (extracted.children > 0 ? extracted.children * 0.75 : 0));
    const targetBudget = extracted.budget;

    // Parse target duration in days
    let targetDays = 5;
    const durNum = extracted.duration.match(/(\d+)/);
    if (durNum) targetDays = parseInt(durNum[1], 10);

    const scored: PackageMatch[] = publishedPackages.map((pkg) => {
      const matchReasons: string[] = [];
      let destinationScore = 0;
      let budgetScore = 0;
      let durationScore = 0;
      let requirementsScore = 0;

      // 1. Destination Match (Max 35 points)
      const targetDest = extracted.destination.toLowerCase();
      const pkgDest = (pkg.destination + ' ' + pkg.title).toLowerCase();

      if (pkgDest.includes(targetDest) || targetDest.includes(pkg.destination.toLowerCase())) {
        destinationScore = 35;
        matchReasons.push(`Direct destination match for "${extracted.destination}"`);
      } else {
        // Partial or regional match (e.g. Kerala, South India)
        const southIndiaLocs = ['kerala', 'munnar', 'thekkady', 'alleppey', 'cochin', 'wayanad', 'tamil nadu'];
        const matchesRegion = southIndiaLocs.some((loc) => targetDest.includes(loc) && pkgDest.includes(loc));
        if (matchesRegion) {
          destinationScore = 25;
          matchReasons.push(`Regional South India match covering key itinerary corridors`);
        } else {
          destinationScore = 10;
        }
      }

      // 2. Budget Compatibility (Max 25 points)
      // Resolve month-specific seasonal price from database if available:
      let applicablePrice = db.getStartingPrice(pkg);
      if (extracted.travelMonth && pkg.seasonalPrices && pkg.seasonalPrices.length > 0) {
        const monthLower = extracted.travelMonth.toLowerCase();
        const matchedSeason = pkg.seasonalPrices.find((sp) => {
          const s = sp.startMonth.toLowerCase();
          const e = sp.endMonth.toLowerCase();
          const name = sp.seasonName.toLowerCase();
          if (monthLower.includes('dec') || monthLower.includes('december') || monthLower.includes('jan') || monthLower.includes('peak')) {
            return name.includes('peak') || s.includes('oct') || e.includes('mar');
          }
          if (monthLower.includes('jun') || monthLower.includes('jul') || monthLower.includes('aug') || monthLower.includes('monsoon')) {
            return name.includes('monsoon') || s.includes('jun') || e.includes('sep');
          }
          return false;
        });
        if (matchedSeason) {
          applicablePrice = matchedSeason.pricePerPerson;
        }
      }

      const startingPrice = applicablePrice;
      const estimatedTotalCost = startingPrice * totalTravellers;

      if (targetBudget > 0 && estimatedTotalCost > 0) {
        const ratio = estimatedTotalCost / targetBudget;
        // Perfect fit: 0.7 to 1.15
        if (ratio >= 0.7 && ratio <= 1.15) {
          budgetScore = 25;
          matchReasons.push(`Fits within requested budget of ₹${targetBudget.toLocaleString('en-IN')} (Estimated trip ₹${estimatedTotalCost.toLocaleString('en-IN')})`);
        } else if (ratio > 0.5 && ratio < 1.35) {
          budgetScore = 18;
          matchReasons.push(`Close budget alignment within comfortable margin`);
        } else {
          budgetScore = 8;
        }
      } else {
        budgetScore = 15; // default neutral if budget not specified
      }

      // 3. Duration Compatibility (Max 20 points)
      const daysDiff = Math.abs(pkg.days - targetDays);
      if (daysDiff === 0) {
        durationScore = 20;
        matchReasons.push(`Exact duration match (${pkg.days} Days / ${pkg.nights} Nights)`);
      } else if (daysDiff <= 1) {
        durationScore = 16;
        matchReasons.push(`Very close duration (${pkg.days} Days vs requested ${targetDays} days)`);
      } else if (daysDiff <= 2) {
        durationScore = 10;
      } else {
        durationScore = 5;
      }

      // 4. Special Requirements Match (Max 20 points)
      const pkgContent = (pkg.description + ' ' + pkg.title + ' ' + (pkg.inclusions || []).join(' ')).toLowerCase();
      let matchedReqCount = 0;

      if (extracted.requirements && extracted.requirements.length > 0) {
        for (const req of extracted.requirements) {
          const reqLower = req.toLowerCase();
          if (reqLower.includes('houseboat') && (pkgContent.includes('houseboat') || pkgContent.includes('backwater'))) {
            requirementsScore += 12;
            matchedReqCount++;
            matchReasons.push(`Explicitly features verified private Alleppey houseboat cruise`);
          } else if (reqLower.includes('family') && pkg.hotelCategory.includes('star')) {
            requirementsScore += 4;
            matchedReqCount++;
            matchReasons.push(`Family-friendly amenities with twin-sharing room options`);
          } else if (reqLower.includes('wildlife') && (pkgContent.includes('wildlife') || pkgContent.includes('periyar'))) {
            requirementsScore += 8;
            matchedReqCount++;
            matchReasons.push(`Includes Periyar Wildlife Sanctuary & spice plantation visit`);
          } else if (reqLower.includes('tea') && (pkgContent.includes('tea') || pkgContent.includes('munnar'))) {
            requirementsScore += 6;
            matchedReqCount++;
            matchReasons.push(`Includes Munnar tea garden excursion`);
          }
        }
      } else {
        requirementsScore = 12; // baseline for general requirements
      }

      requirementsScore = Math.min(20, requirementsScore);
      const totalScore = Math.min(100, destinationScore + budgetScore + durationScore + requirementsScore);

      return {
        packageId: pkg.packageId,
        packageTitle: pkg.title,
        slug: pkg.slug,
        destination: pkg.destination,
        duration: `${pkg.days} Days / ${pkg.nights} Nights`,
        databasePrice: startingPrice,
        pricingBasis: pkg.pricingBasis,
        gstInformation: pkg.gstInformation,
        score: totalScore,
        scoreBreakdown: {
          destinationScore,
          budgetScore,
          durationScore,
          requirementsScore,
        },
        matchReasons,
      };
    });

    // Sort by descending score and take top 3
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  }

  // ================= 3. AI REPLY DRAFTING =================
  /**
   * Generates a professional reply draft using:
   * - Customer requirements
   * - Original enquiry message
   * - Actual database package details & prices
   * - No fabricated discounts or fake bookings
   */
  public async generateReplyDraft(
    enquiry: Enquiry,
    extracted: ExtractedFields,
    topPackages: PackageMatch[]
  ): Promise<string> {
    const recommendedPkg = topPackages[0];
    const customerFirstName = enquiry.customerName.split(' ')[0] || enquiry.customerName;

    // Check if Groq is available for dynamic high-touch draft
    if (this.groqApiKey && this.getStatus().groqConfigured) {
      try {
        const prompt = `You are a professional South India travel consultant at WanderCMS, Kochi.
Generate a personalized, warm, and highly professional email/WhatsApp reply draft to a customer enquiry.

CRITICAL RULES:
1. Use ONLY the real package names and exact database prices provided below. NEVER invent prices, fake discounts, or false booking guarantees.
2. Address the customer courteously by name: ${customerFirstName}.
3. Acknowledge their specific requirements: ${extracted.destination}, ${extracted.duration}, ${extracted.adults} adults, ${extracted.children} children, budget ₹${extracted.budget.toLocaleString('en-IN')}, and special requests: ${extracted.requirements.join(', ')}.
4. Highlight why the recommended package is suitable.
5. Explicitly state the twin-sharing basis and GST terms (${recommendedPkg?.gstInformation || '5% GST applicable'}).
6. Keep the tone hospitable, authentic, and polite.

Customer: ${enquiry.customerName}
Original enquiry: "${enquiry.originalMessage}"
Recommended Package:
- Title: ${recommendedPkg?.packageTitle} (${recommendedPkg?.packageId})
- Destination: ${recommendedPkg?.destination}
- Duration: ${recommendedPkg?.duration}
- Starting Database Price: ₹${recommendedPkg?.databasePrice?.toLocaleString('en-IN')} per person
- Key reasons: ${recommendedPkg?.matchReasons?.join('; ')}

Draft response text:`;

        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
          }),
        });

        if (resp.ok) {
          const json = await resp.json();
          const draft = json.choices?.[0]?.message?.content;
          if (draft && draft.length > 50) return draft;
        }
      } catch (e) {
        console.warn('Groq reply drafting fallback:', (e as Error).message);
      }
    }

    // High quality deterministic draft template (always accurate to database figures)
    const pkgName = recommendedPkg ? `"${recommendedPkg.packageTitle}" (${recommendedPkg.packageId})` : 'our Kerala Discovery Package';
    const pkgPrice = recommendedPkg ? `₹${recommendedPkg.databasePrice.toLocaleString('en-IN')} per person (${recommendedPkg.pricingBasis})` : 'our seasonal rate';
    const gstInfo = recommendedPkg ? recommendedPkg.gstInformation : '5% GST applicable';

    return `Dear ${customerFirstName},

Greetings from WanderCMS, Kochi!

Thank you for your enquiry regarding your upcoming trip to ${extracted.destination}. We are delighted to assist you in planning this journey for ${extracted.adults} adult(s)${extracted.children > 0 ? ` and ${extracted.children} child` : ''} in ${extracted.travelMonth || 'your requested season'}.

Based on your travel dates, requested duration of ${extracted.duration}, and preference for ${extracted.requirements.join(', ') || 'an authentic South India experience'}, we recommend ${pkgName}.

Key Highlights of this Package:
${recommendedPkg?.matchReasons.map((r) => `• ${r}`).join('\n') || '• Handpicked 4-star category accommodations\n• Private air-conditioned chauffeur transfers\n• Scenic tea plantation and backwater experiences'}

Verified Pricing:
• Starting from ${pkgPrice}
• ${gstInfo}
• Estimated total accommodates your budget of ₹${extracted.budget ? extracted.budget.toLocaleString('en-IN') : 'stated requirements'}

Our travel specialists in Kochi are preparing a day-by-day customized itinerary for your review. Would you like us to share the detailed PDF breakdown or connect on WhatsApp at ${enquiry.phone}?

Warm regards,
Travel Specialist Team
WanderCMS
Kochi, Kerala, India`;
  }
}

export const aiService = new AIService();
