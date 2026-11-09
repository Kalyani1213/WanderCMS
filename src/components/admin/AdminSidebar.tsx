import React from 'react';
import {
  LayoutDashboard,
  Package,
  Inbox,
  LogOut,
  ExternalLink,
  Compass,
  Cpu,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  navigate: (route: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, setTab, navigate }) => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('home');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'packages', label: 'Package CMS', icon: Package },
    { id: 'enquiries', label: 'Enquiry Inbox', icon: Inbox },
    { id: 'activity', label: 'Activity Logs', icon: History },
    { id: 'system', label: 'System & AI Health', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-[#173D32] text-white flex flex-col justify-between shrink-0 min-h-[calc(100vh-5rem)] border-r border-white/10">
      <div className="p-6 space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 pb-6 border-b border-white/10">
          <div className="w-8 h-8 rounded bg-[#B89A56] flex items-center justify-center text-[#173D32] shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-white block leading-tight">
              WANDERCMS
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#B89A56] font-semibold">
              Operations Hub
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium transition-colors text-left ${
                  active
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#B89A56]' : 'text-white/50'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & actions */}
      <div className="p-6 border-t border-white/10 space-y-3">
        <div className="text-xs">
          <div className="font-semibold text-white truncate">{user?.name || 'Staff Admin'}</div>
          <div className="text-[11px] text-[#B89A56] truncate">{user?.email}</div>
        </div>

        <div className="pt-2 space-y-1">
          <button
            onClick={() => navigate('home')}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] rounded bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/60" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] rounded text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
