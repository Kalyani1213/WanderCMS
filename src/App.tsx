import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { HomeScreen } from './screens/HomeScreen';
import { PackagesScreen } from './screens/PackagesScreen';
import { DestinationsScreen } from './screens/DestinationsScreen';
import { PackageDetailScreen } from './screens/PackageDetailScreen';
import { InspirationScreen } from './screens/InspirationScreen';
import { AboutScreen } from './screens/AboutScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { AdminPackagesScreen } from './screens/AdminPackagesScreen';
import { AdminEnquiriesScreen } from './screens/AdminEnquiriesScreen';
import { AdminActivityScreen } from './screens/AdminActivityScreen';
import { AdminSystemScreen } from './screens/AdminSystemScreen';
import { TravellerDashboardScreen } from './screens/TravellerDashboardScreen';
import { EnquiryModal } from './components/public/EnquiryModal';
import { api } from './services/api';

function parseLocation(): { route: string; params: Record<string, string> } {
  if (typeof window === 'undefined') return { route: 'home', params: {} };

  try {
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace(/^#\/?/, '');

    // Check direct query parameter: ?package=slug or ?pkg=slug or ?slug=slug
    const pkgQuery = searchParams.get('package') || searchParams.get('pkg') || searchParams.get('slug');
    if (pkgQuery) {
      return {
        route: 'package-detail',
        params: { slug: pkgQuery, preview: searchParams.get('preview') || 'false' },
      };
    }

    // Check pathname: /packages/:slug or /package/:slug
    const parts = pathname.split('/');
    if ((parts[0] === 'packages' || parts[0] === 'package') && parts[1]) {
      return {
        route: 'package-detail',
        params: { slug: parts[1], preview: searchParams.get('preview') || 'false' },
      };
    }

    // Check hash: #packages/:slug or #package/:slug
    const hashParts = hash.split('/');
    if ((hashParts[0] === 'packages' || hashParts[0] === 'package') && hashParts[1]) {
      return {
        route: 'package-detail',
        params: { slug: hashParts[1], preview: searchParams.get('preview') || 'false' },
      };
    }

    if (pathname === 'packages' || searchParams.get('page') === 'packages' || hash === 'packages') {
      return {
        route: 'packages',
        params: { destination: searchParams.get('destination') || 'All' },
      };
    }

    if (pathname === 'destinations' || searchParams.get('page') === 'destinations' || hash === 'destinations') {
      return { route: 'destinations', params: {} };
    }

    if (pathname === 'inspiration' || searchParams.get('page') === 'inspiration' || hash === 'inspiration') {
      return { route: 'inspiration', params: {} };
    }

    if (pathname === 'about' || searchParams.get('page') === 'about' || hash === 'about') {
      return { route: 'about', params: {} };
    }

    if (pathname === 'login' || searchParams.get('page') === 'login' || hash === 'login') {
      return { route: 'login', params: {} };
    }

    if (
      pathname === 'traveller-dashboard' ||
      pathname === 'traveller' ||
      searchParams.get('page') === 'traveller-dashboard' ||
      searchParams.get('page') === 'traveller' ||
      hash === 'traveller-dashboard' ||
      hash === 'traveller'
    ) {
      return { route: 'traveller-dashboard', params: {} };
    }

    if (pathname.startsWith('admin') || searchParams.get('page') === 'admin' || hash.startsWith('admin')) {
      return { route: 'admin-dashboard', params: {} };
    }
  } catch (e) {
    console.error('Error parsing location:', e);
  }

  return { route: 'home', params: {} };
}

function buildUrl(route: string, params: Record<string, string> = {}): string {
  if (route === 'package-detail' && params.slug) {
    const previewQuery = params.preview === 'true' ? '?preview=true' : '';
    return `/packages/${params.slug}${previewQuery}`;
  }
  if (route === 'packages') {
    return params.destination && params.destination !== 'All'
      ? `/packages?destination=${encodeURIComponent(params.destination)}`
      : '/packages';
  }
  if (route === 'destinations') return '/destinations';
  if (route === 'inspiration') return '/inspiration';
  if (route === 'about') return '/about';
  if (route === 'login') return '/login';
  if (route === 'traveller-dashboard') return '/traveller-dashboard';
  if (route.startsWith('admin')) return '/admin';
  return '/';
}

export function WanderApp() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Navigation State hydrated directly from URL pathname/query
  const initialLoc = parseLocation();
  const [currentRoute, setCurrentRoute] = useState<string>(initialLoc.route);
  const [routeParams, setRouteParams] = useState<Record<string, string>>(initialLoc.params);
  const [adminTab, setAdminTab] = useState<string>('overview');

  // Sync with browser history (Back / Forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const { route, params } = parseLocation();
      setCurrentRoute(route);
      setRouteParams(params);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Enquiry Modal State
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryPrefill, setEnquiryPrefill] = useState<any>(null);

  // Inspector shortcut from dashboard to enquiries
  const [inspectorEnquiryId, setInspectorEnquiryId] = useState<string | null>(null);

  // System Diagnostics
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    const fetchSystem = async () => {
      try {
        const res = await api.getSystemStatus();
        setSystemStatus(res);
      } catch (e) {
        // non-fatal
      }
    };
    fetchSystem();
  }, []);

  const navigate = (route: string, params: Record<string, string> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    const targetUrl = buildUrl(route, params);
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState({ route, params }, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEnquiryModal = (prefill?: any) => {
    setEnquiryPrefill(prefill || null);
    setIsEnquiryModalOpen(true);
  };

  // Admin routing guard
  const isAdminRoute = currentRoute.startsWith('admin');
  if (isAdminRoute && !authLoading && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
        <Navbar currentRoute={currentRoute} navigate={navigate} openEnquiryModal={openEnquiryModal} />
        <LoginScreen navigate={navigate} />
        <Footer navigate={navigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2] text-[#252525] antialiased">
      {isAdminRoute ? (
        /* ================= ADMIN CONSOLE VIEW ================= */
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex">
            {/* Admin Sidebar */}
            <AdminSidebar currentTab={adminTab} setTab={setAdminTab} navigate={navigate} />

            {/* Admin Content Area */}
            <main className="flex-1 bg-[#F8F7F2] flex flex-col overflow-y-auto">
              <AdminHeader
                title={
                  adminTab === 'overview'
                    ? 'Tour Operations Command Center'
                    : adminTab === 'packages'
                    ? 'Travel Packages CMS'
                    : adminTab === 'enquiries'
                    ? 'Inbound Enquiries & AI Extraction'
                    : adminTab === 'activity'
                    ? 'Activity History & Audit'
                    : 'System Architecture & AI Status'
                }
                subtitle="Centralized management of packages, seasonal tariffs, and customer requirements"
                systemStatus={systemStatus}
              />

              <div className="flex-1">
                {adminTab === 'overview' && (
                  <AdminDashboardScreen
                    onSelectEnquiry={(id) => {
                      setInspectorEnquiryId(id);
                      setAdminTab('enquiries');
                    }}
                    onNavigateTab={(tab) => setAdminTab(tab)}
                  />
                )}

                {adminTab === 'packages' && <AdminPackagesScreen navigate={navigate} />}

                {adminTab === 'enquiries' && (
                  <AdminEnquiriesScreen
                    selectedEnquiryId={inspectorEnquiryId}
                    onClearSelectedEnquiry={() => setInspectorEnquiryId(null)}
                  />
                )}

                {adminTab === 'activity' && <AdminActivityScreen />}

                {adminTab === 'system' && <AdminSystemScreen />}
              </div>
            </main>
          </div>
        </div>
      ) : (
        /* ================= PUBLIC TRAVEL WEBSITE VIEW ================= */
        <div className="flex-1 flex flex-col">
          <Navbar
            currentRoute={currentRoute}
            navigate={navigate}
            openEnquiryModal={openEnquiryModal}
          />

          <main className="flex-1">
            {currentRoute === 'home' && (
              <HomeScreen navigate={navigate} openEnquiryModal={openEnquiryModal} />
            )}

            {currentRoute === 'packages' && (
              <PackagesScreen
                initialDestination={routeParams.destination || 'All'}
                navigate={navigate}
                openEnquiryModal={openEnquiryModal}
              />
            )}

            {currentRoute === 'destinations' && (
              <DestinationsScreen
                navigate={navigate}
                openEnquiryModal={openEnquiryModal}
              />
            )}

            {currentRoute === 'package-detail' && (
              <PackageDetailScreen
                slug={routeParams.slug || 'munnar-thekkady-alleppey-houseboat'}
                isPreview={routeParams.preview === 'true'}
                navigate={navigate}
                openEnquiryModal={openEnquiryModal}
              />
            )}

            {currentRoute === 'inspiration' && (
              <InspirationScreen navigate={navigate} openEnquiryModal={openEnquiryModal} />
            )}

            {currentRoute === 'about' && (
              <AboutScreen navigate={navigate} openEnquiryModal={() => openEnquiryModal()} />
            )}

            {currentRoute === 'traveller-dashboard' && (
              user ? (
                <TravellerDashboardScreen
                  navigate={navigate}
                  openEnquiryModal={openEnquiryModal}
                />
              ) : (
                <LoginScreen navigate={navigate} />
              )
            )}

            {currentRoute === 'login' && <LoginScreen navigate={navigate} />}
          </main>

          <Footer navigate={navigate} />
        </div>
      )}

      {/* Global Enquiry Submission Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        prefill={enquiryPrefill}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WanderApp />
    </AuthProvider>
  );
}
