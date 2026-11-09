import {
  TravelPackage,
  PackageVersion,
  Enquiry,
  AIExtraction,
  EnquiryReply,
  DashboardStats,
  User,
  PackageMatch,
} from '../types';

const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('wandercms_token') : null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('wandercms_token', token);
    } else {
      localStorage.removeItem('wandercms_token');
    }
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data;
  }

  // ================= AUTH =================
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async travellerLookup(email: string, enquiryId?: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/traveller-lookup', {
      method: 'POST',
      body: JSON.stringify({ email, enquiryId }),
    });
    this.setToken(res.token);
    return res;
  }

  async getTravellerDashboard(): Promise<{
    traveller: User;
    totalEnquiries: number;
    enquiries: {
      enquiry: Enquiry;
      extraction: AIExtraction | null;
      reply: EnquiryReply | null;
    }[];
  }> {
    return this.request<{
      traveller: User;
      totalEnquiries: number;
      enquiries: {
        enquiry: Enquiry;
        extraction: AIExtraction | null;
        reply: EnquiryReply | null;
      }[];
    }>('/traveller/dashboard');
  }

  async sendEmailSummary(enquiryId: string, recipientEmail: string): Promise<{
    success: boolean;
    message: string;
    sentAt: string;
    recipientEmail: string;
  }> {
    return this.request('/traveller/send-email-summary', {
      method: 'POST',
      body: JSON.stringify({ enquiryId, recipientEmail }),
    });
  }

  // ================= PACKAGES (PUBLIC) =================
  async getPublishedPackages(params?: {
    search?: string;
    destination?: string;
    duration?: string;
    hotelCategory?: string;
    season?: string;
    sortBy?: string;
  }): Promise<{ packages: TravelPackage[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.destination && params.destination !== 'All') query.set('destination', params.destination);
    if (params?.duration && params.duration !== 'All') query.set('duration', params.duration);
    if (params?.hotelCategory && params.hotelCategory !== 'All') query.set('hotelCategory', params.hotelCategory);
    if (params?.season && params.season !== 'All') query.set('season', params.season);
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ packages: TravelPackage[]; count: number }>(`/packages${queryString}`);
  }

  async getPackageBySlug(slug: string, preview = false): Promise<{ package: TravelPackage }> {
    const query = preview ? '?preview=true' : '';
    return this.request<{ package: TravelPackage }>(`/packages/${slug}${query}`);
  }

  // ================= ENQUIRIES (PUBLIC) =================
  async submitEnquiry(payload: {
    customerName: string;
    email: string;
    phone: string;
    destination: string;
    travelDate: string;
    adults: number;
    children: number;
    duration: string;
    budget: number;
    specialRequirements?: string;
    originalMessage?: string;
    whatsappConsent: boolean;
  }): Promise<{
    success: boolean;
    enquiryId: string;
    acknowledgement: {
      message: string;
      timestamp: string;
      status: string;
      externalDelivery: string;
    };
    message: string;
  }> {
    return this.request('/enquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ================= ADMIN DASHBOARD =================
  async getDashboardStats(): Promise<{
    stats: DashboardStats;
    systemStatus: {
      database: any;
      ai: any;
    };
  }> {
    return this.request('/admin/dashboard');
  }

  // ================= ADMIN PACKAGES & CMS =================
  async getAdminPackages(params?: { status?: string; search?: string }): Promise<{ packages: TravelPackage[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/admin/packages${queryString}`);
  }

  async createPackage(pkg: Partial<TravelPackage>): Promise<{ package: TravelPackage }> {
    return this.request('/admin/packages', {
      method: 'POST',
      body: JSON.stringify(pkg),
    });
  }

  async updatePackageDraft(id: string, updates: Partial<TravelPackage>, changeSummary?: string): Promise<{ package: TravelPackage }> {
    return this.request(`/admin/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, changeSummary }),
    });
  }

  async publishPackage(id: string): Promise<{ package: TravelPackage; message: string }> {
    return this.request(`/admin/packages/${id}/publish`, {
      method: 'POST',
    });
  }

  async duplicatePackage(id: string): Promise<{ package: TravelPackage }> {
    return this.request(`/admin/packages/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async getPackageVersions(packageId: string): Promise<{ versions: PackageVersion[] }> {
    return this.request(`/admin/packages/${packageId}/versions`);
  }

  // ================= ADMIN ENQUIRIES =================
  async getAdminEnquiries(params?: { status?: string; search?: string }): Promise<{ enquiries: Enquiry[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/admin/enquiries${queryString}`);
  }

  async getEnquiryDetail(id: string): Promise<{
    enquiry: Enquiry;
    aiExtraction: AIExtraction;
    packageMatches: PackageMatch[];
    replyDraft: EnquiryReply;
  }> {
    return this.request(`/admin/enquiries/${id}`);
  }

  async updateEnquiryStatus(id: string, status: Enquiry['status']): Promise<{ enquiry: Enquiry }> {
    return this.request(`/admin/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async addEnquiryNote(id: string, text: string): Promise<{ enquiry: Enquiry }> {
    return this.request(`/admin/enquiries/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async updateAIExtraction(
    id: string,
    options: { recompute?: boolean; updatedFields?: any }
  ): Promise<{ aiExtraction: AIExtraction; packageMatches: PackageMatch[] }> {
    return this.request(`/admin/enquiries/${id}/ai-extract`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async updateReplyDraft(id: string, draftContent: string): Promise<{ replyDraft: EnquiryReply }> {
    return this.request(`/admin/enquiries/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify({ draftContent }),
    });
  }

  async approveReplyDraft(id: string): Promise<{ replyDraft: EnquiryReply; message: string }> {
    return this.request(`/admin/enquiries/${id}/reply/approve`, {
      method: 'POST',
    });
  }

  async getActivityLogs(): Promise<{ logs: any[] }> {
    return this.request('/admin/activity-logs');
  }

  async reseedData(): Promise<{ success: boolean; message: string }> {
    return this.request('/admin/seed', { method: 'POST' });
  }

  async getSystemStatus(): Promise<any> {
    return this.request('/system/status');
  }
}

export const api = new ApiService();
