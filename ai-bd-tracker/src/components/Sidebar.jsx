import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, GitMerge, Settings, Wand2, CalendarDays, Globe, ChevronDown, ChevronRight, CornerDownRight, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [conferencesExpanded, setConferencesExpanded] = useState(true);

  const isConferencesActive = location.pathname.startsWith('/conferences');

  const navItems = [
    { to: "/", icon: Wand2, label: "Smart Input" },
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/pipeline", icon: GitMerge, label: "Pipeline" },
    { to: "/schedule", icon: CalendarDays, label: "Schedule" },
    { to: "/contacts", icon: Users, label: "Key Contacts" },
  ];

  const conferenceSubItems = [
    { to: "/conferences/jpm", label: "JPM Healthcare" },
    { to: "/conferences/aacr", label: "AACR Cancer" },
    { to: "/conferences/asco", label: "ASCO Oncology" },
    { to: "/conferences/esmo", label: "ESMO Med" },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null; // Don't render sidebar if user is not authenticated
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-100 flex flex-col border-r border-slate-200/60 z-20">
      <div className="flex flex-col h-full py-6">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">AI-BD Tracker</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mt-0.5">Clinical Architect</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 font-medium text-sm overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                  ? 'bg-white text-blue-800 font-bold shadow-sm border-l-4 border-blue-700'
                  : 'text-slate-600 hover:bg-slate-200/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Special Expandable Conferences Navigation */}
          <div className="pt-2 pb-1">
            <button
              onClick={() => setConferencesExpanded(!conferencesExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                isConferencesActive && !conferencesExpanded
                ? 'bg-white text-blue-800 font-bold shadow-sm border-l-4 border-blue-700'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className={`w-5 h-5 ${isConferencesActive ? 'text-blue-600' : ''}`} />
                <span className={isConferencesActive ? 'font-bold text-slate-900' : ''}>Conferences</span>
              </div>
              {conferencesExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {conferencesExpanded && (
              <div className="mt-1 space-y-1 relative">
                {/* Visual connecting line for sub-menu */}
                <div className="absolute left-6 top-0 bottom-4 w-px bg-slate-200"></div>

                {conferenceSubItems.map((subItem) => (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2 py-2 pr-4 pl-10 rounded-lg transition-all duration-200 text-[13px] relative ${
                        isActive
                        ? 'bg-blue-50/50 text-blue-700 font-extrabold shadow-sm'
                        : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`absolute left-[23px] top-1/2 -translate-y-1/2 w-3 h-px ${isActive ? 'bg-blue-400' : 'bg-slate-200'}`}></div>
                        <span className={isActive ? 'relative z-10' : ''}>{subItem.label}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="mt-auto px-3 pt-6 border-t border-slate-200/50">
          <button 
            onClick={() => navigate('/settings')} 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors text-sm font-medium"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <div className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors text-sm font-medium mt-1">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
              {user.initials || user.name?.substring(0, 2)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs font-bold">{user.name}</div>
              <div className="truncate text-[10px] text-slate-500">{user.role}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
