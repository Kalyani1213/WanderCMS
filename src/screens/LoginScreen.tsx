import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Lock,
  Mail,
  ShieldAlert,
  Check,
  User,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface LoginScreenProps {
  navigate: (route: string, params?: Record<string, string>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigate }) => {
  const { login, register } = useAuth();
  
  // Portal Tab: 'traveller' | 'staff'
  const [activePortal, setActivePortal] = useState<'traveller' | 'staff'>('traveller');

  // Traveller sub-mode: 'signin' | 'register'
  const [travellerMode, setTravellerMode] = useState<'signin' | 'register'>('signin');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('admin-dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTravellerPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('traveller-dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTravellerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(fullName || email.split('@')[0], email, password);
      navigate('traveller-dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@wandercms.com');
    setPassword('admin123');
    setError(null);
  };

  const fillDemoTraveller = () => {
    setTravellerMode('signin');
    setEmail('vikram.malhotra@gmail.com');
    setPassword('traveller123');
    setError(null);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#173D32]/10 overflow-hidden">
        
        {/* Top Portal Switch Tabs */}
        <div className="grid grid-cols-2 bg-[#F8F7F2] p-1.5 border-b border-[#173D32]/10">
          <button
            type="button"
            onClick={() => {
              setActivePortal('traveller');
              setError(null);
            }}
            className={`py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activePortal === 'traveller'
                ? 'bg-white text-[#173D32] shadow-sm font-bold border border-[#173D32]/10'
                : 'text-[#252525]/60 hover:text-[#173D32]'
            }`}
          >
            <User className="w-4 h-4 text-[#B89A56]" />
            <span>Traveller Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortal('staff');
              setError(null);
            }}
            className={`py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activePortal === 'staff'
                ? 'bg-white text-[#173D32] shadow-sm font-bold border border-[#173D32]/10'
                : 'text-[#252525]/60 hover:text-[#173D32]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#173D32]" />
            <span>Staff Operations</span>
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-11 h-11 rounded-full bg-[#173D32] text-[#B89A56] flex items-center justify-center mx-auto shadow-sm">
              <Compass className="w-5 h-5" />
            </div>

            <h1 className="font-display text-2xl font-bold text-[#173D32]">
              {activePortal === 'traveller' ? 'Traveller Sign In' : 'Staff Operations Portal'}
            </h1>

            <p className="text-xs text-[#252525]/65">
              {activePortal === 'traveller'
                ? 'Access your holiday enquiries, customized quotations, and verified itineraries.'
                : 'Sign in to manage travel packages, seasonal tariffs, and customer inbox.'}
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= TAB 1: TRAVELLER PORTAL ================= */}
          {activePortal === 'traveller' && (
            <div className="space-y-4">
              {/* Sub-toggle: Sign In vs Register */}
              <div className="grid grid-cols-2 bg-[#F8F7F2] p-1 rounded-lg border border-[#173D32]/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setTravellerMode('signin');
                    setError(null);
                  }}
                  className={`py-1.5 rounded-md transition-all ${
                    travellerMode === 'signin'
                      ? 'bg-white text-[#173D32] shadow-xs font-bold'
                      : 'text-[#252525]/60 hover:text-[#173D32]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTravellerMode('register');
                    setError(null);
                  }}
                  className={`py-1.5 rounded-md transition-all ${
                    travellerMode === 'register'
                      ? 'bg-white text-[#173D32] shadow-xs font-bold'
                      : 'text-[#252525]/60 hover:text-[#173D32]'
                  }`}
                >
                  Register
                </button>
              </div>

              {travellerMode === 'signin' ? (
                /* Traveller Sign In Form */
                <form onSubmit={handleTravellerPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#173D32] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-[#252525]/40" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#173D32]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#173D32] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-[#252525]/40" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#173D32]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#173D32] hover:bg-[#122e25] rounded-lg transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In as Traveller'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTravellerMode('register');
                        setError(null);
                      }}
                      className="text-xs text-[#B89A56] hover:underline font-medium"
                    >
                      New traveller? Register →
                    </button>
                  </div>
                </form>
              ) : (
                /* Traveller Register Form */
                <form onSubmit={handleTravellerRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#173D32] mb-1">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-[#252525]/40" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kalyani Lalugani"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#173D32]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#173D32] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-[#252525]/40" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#173D32]"
                      />
                    </div>
                    <span className="text-[10px] text-[#252525]/60 mt-0.5 block">
                      Enquiries submitted with this email will automatically sync to your portal.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#173D32] mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-[#252525]/40" />
                      <input
                        type="password"
                        required
                        placeholder="At least 4 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#173D32]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#173D32] hover:bg-[#122e25] rounded-lg transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <span>{loading ? 'Creating Account...' : 'Register as Traveller'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTravellerMode('signin');
                        setError(null);
                      }}
                      className="text-xs text-[#B89A56] hover:underline font-medium"
                    >
                      Already registered? Sign In →
                    </button>
                  </div>
                </form>
              )}

              {/* Demo Traveller Shortcut */}
              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#252525]/70">
                  <span className="text-[11px] font-medium">Or Use Sample Demo Traveller:</span>
                  <button
                    type="button"
                    onClick={fillDemoTraveller}
                    className="text-[#B89A56] hover:underline font-semibold flex items-center gap-1 text-xs"
                  >
                    <span>Auto-fill Demo</span>
                    <Check className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-2.5 rounded bg-[#F8F7F2] border border-[#173D32]/10 text-[11px] font-mono text-[#252525]/80 space-y-0.5">
                  <div>Name: <strong className="text-[#173D32]">Vikram Malhotra</strong></div>
                  <div>Email: <strong className="text-[#173D32]">vikram.malhotra@gmail.com</strong></div>
                  <div>Password: <strong className="text-[#173D32]">traveller123</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: STAFF OPERATIONS ================= */}
          {activePortal === 'staff' && (
            <div className="space-y-4">
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-[#252525]/40" />
                    <input
                      type="email"
                      required
                      placeholder="admin@wandercms.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#173D32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173D32] mb-1">
                    Staff Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-[#252525]/40" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#173D32]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#173D32] hover:bg-[#122e25] rounded-lg transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Operations CMS'}
                </button>
              </form>

              {/* Demo Admin Shortcut */}
              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#252525]/70">
                  <span className="text-[11px] font-medium">Demo Admin Credentials:</span>
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="text-[#B89A56] hover:underline font-semibold flex items-center gap-1 text-xs"
                  >
                    <span>Auto-fill Demo</span>
                    <Check className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-2.5 rounded bg-[#F8F7F2] border border-[#173D32]/10 text-[11px] font-mono text-[#252525]/80 space-y-0.5">
                  <div>Email: <strong className="text-[#173D32]">admin@wandercms.com</strong></div>
                  <div>Password: <strong className="text-[#173D32]">admin123</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
