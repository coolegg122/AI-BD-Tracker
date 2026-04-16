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
    <aside className="w-64 flex-shrink-0 bg-ui-sidebar flex flex-col border-r border-ui-border z-20 transition-colors duration-300">
      <div className="flex flex-col h-full py-6">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ui-accent flex items-center justify-center text-white shadow-sm ring-2 ring-ui-accent/20 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-ui-text leading-tight tracking-tight">AI-BD Tracker</h1>
              <p className="text-[10px] uppercase tracking-widest text-ui-accent font-bold mt-0.5">Clinical Architect</p>
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
                  ? 'bg-ui-card text-ui-accent font-bold shadow-sm border-l-4 border-ui-accent'
                  : 'text-ui-text-muted hover:bg-ui-hover'
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
                ? 'bg-ui-card text-ui-accent font-bold shadow-sm border-l-4 border-ui-accent'
                : 'text-ui-text-muted hover:bg-ui-hover hover:text-ui-text transition-colors'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className={`w-5 h-5 ${isConferencesActive ? 'text-ui-accent' : ''}`} />
                <span className={isConferencesActive ? 'font-bold text-ui-text' : ''}>Conferences</span>
              </div>
              {conferencesExpanded ? (
                <ChevronDown className="w-4 h-4 text-ui-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-ui-text-muted" />
              )}
            </button>
            {conferencesExpanded && (
              <div className="mt-1 space-y-1 relative">
                {/* Visual connecting line for sub-menu */}
                <div className="absolute left-6 top-0 bottom-4 w-px bg-ui-border"></div>

                {conferenceSubItems.map((subItem) => (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2 py-2 pr-4 pl-10 rounded-lg transition-all duration-200 text-[13px] relative ${
                        isActive
                        ? 'bg-ui-accent/10 text-ui-accent font-extrabold shadow-sm'
                        : 'text-ui-text-muted hover:bg-ui-hover hover:text-ui-text'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`absolute left-[23px] top-1/2 -translate-y-1/2 w-3 h-px ${isActive ? 'bg-ui-accent' : 'bg-ui-border'}`}></div>
                        <span className={isActive ? 'relative z-10' : ''}>{subItem.label}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ui-accent"></div>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="mt-auto px-3 pt-6 border-t border-ui-border">
          <button 
            onClick={() => navigate('/settings')} 
            className="w-full flex items-center gap-3 px-4 py-3 text-ui-text-muted hover:bg-ui-hover rounded-lg transition-colors text-sm font-medium"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <div className="w-full flex items-center gap-3 px-4 py-3 text-ui-text-muted hover:bg-ui-hover rounded-lg transition-colors text-sm font-medium mt-1">
            <div className="w-6 h-6 rounded-full bg-ui-accent flex items-center justify-center text-[10px] text-white font-bold">
              {user.initials || user.name?.substring(0, 2)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs font-bold text-ui-text">{user.name}</div>
              <div className="truncate text-[10px] text-ui-text-muted">{user.role}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-ui-text-muted hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
