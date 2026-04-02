import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, Wand2, X, ChevronDown, User, Settings, LogOut, Moon, Sun, Loader2, Globe, Users, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export default function Topbar() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, dashboardData, openProjectOverview } = useStore();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle click outside for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        setShowSearchResults(true);
        try {
          const results = await api.searchGlobal(searchQuery);
          setSearchResults(results);
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchResultClick = (result) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (result.type === 'project') {
      openProjectOverview({ id: result.id, company: result.title }); // Simplified object for modal trigger
    } else {
      navigate('/contacts');
    }
  };

  return (
    <header className="h-16 bg-ui-card/80 backdrop-blur-xl flex items-center justify-between px-8 z-30 shadow-sm border-b border-ui-border relative transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-text-muted" />
          <input
            className="w-full bg-ui-input border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-ui-accent/20 focus:outline-none transition-all text-ui-text placeholder-ui-text-muted"
            placeholder="Search pipeline, assets, or stakeholders..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
          />
          
          {showSearchResults && (
            <div className="absolute top-11 left-0 w-full bg-ui-card rounded-xl shadow-xl border border-ui-border overflow-hidden z-50 max-h-96 overflow-y-auto animate-in slide-in-from-top-2">
              <div className="p-2">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-ui-text-muted flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-ui-text-muted">No matches found for "{searchQuery}"</div>
                ) : (
                  <div className="divide-y divide-ui-border">
                    {searchResults.map((result, idx) => (
                      <button
                        key={`${result.type}-${result.id}-${idx}`}
                        className="w-full text-left p-3 hover:bg-ui-hover flex items-center gap-3 transition-colors rounded-lg"
                        onClick={() => handleSearchResultClick(result)}
                      >
                        <div className={`p-2 rounded-lg bg-ui-accent/10 text-ui-accent`}>
                          {result.type === 'project' ? <Briefcase className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-ui-text leading-none mb-1">{result.title}</div>
                          <div className="text-[10px] text-ui-text-muted uppercase tracking-tight font-medium">{result.subtitle || result.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 relative">
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              className="text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 transition-colors relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5 transition-colors" />
              {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-ui-error rounded-full border-2 border-ui-card transition-colors"></span>}
            </button>

            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-ui-card rounded-xl shadow-xl border border-ui-border overflow-hidden z-50 animate-in slide-in-from-top-2">
                <div className="bg-ui-bg dark:bg-ui-sidebar border-b border-ui-border px-4 py-3 flex justify-between items-center">
                  <span className="font-bold text-sm text-ui-text">Notifications ({unreadCount})</span>
                  <button onClick={() => setShowNotifications(false)} className="text-ui-text-muted hover:text-ui-text transition-colors"><X className="w-4 h-4"/></button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-ui-text-muted">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-4 border-b border-ui-border hover:bg-ui-hover cursor-pointer transition-colors ${!n.read ? 'bg-ui-accent/5' : ''}`}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs text-ui-text">{n.title}</span>
                          <span className="text-[9px] text-ui-text-muted">{n.time}</span>
                        </div>
                        <p className="text-xs text-ui-text-muted">{n.desc}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="relative">
            <button 
              className="text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 transition-colors" 
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            
            {showHelp && (
              <div className="absolute top-12 right-0 w-64 bg-ui-card rounded-xl shadow-xl border border-ui-border overflow-hidden z-50 p-4 animate-in slide-in-from-top-2">
                <h4 className="text-sm font-bold mb-3 text-ui-text">Help Center</h4>
                <div className="space-y-3">
                  <button className="w-full text-left text-xs text-ui-text-muted hover:text-ui-accent transition-colors font-medium flex items-center gap-2" onClick={() => navigate('/')}>
                    <div className="w-1.5 h-1.5 rounded-full bg-ui-accent"></div>
                    Using Smart Input
                  </button>
                  <button className="w-full text-left text-xs text-ui-text-muted hover:text-ui-accent transition-colors font-medium flex items-center gap-2" onClick={() => navigate('/pipeline')}>
                    <div className="w-1.5 h-1.5 rounded-full bg-ui-accent"></div>
                    Managing your Pipeline
                  </button>
                  <div className="pt-3 border-t border-ui-border flex justify-between items-center text-[10px] text-ui-text-muted transition-colors">
                    <span>Version 1.0.0</span>
                    <button className="font-bold hover:underline" onClick={() => {setShowHelp(false); navigate('/settings');}}>System Logs</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="relative">
            <button 
              className="flex items-center gap-2 bg-ui-accent/10 text-ui-accent px-4 py-1.5 rounded-full text-xs font-bold hover:bg-ui-accent/20 transition-all border border-ui-accent/20" 
              onClick={() => setShowAIInsights(!showAIInsights)}
            >
              <Wand2 className="w-4 h-4" />
              AI Insights
            </button>
            
            {showAIInsights && (
              <div className="absolute top-12 right-0 w-72 bg-ui-card rounded-xl shadow-xl border border-ui-border overflow-hidden z-50 p-4 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-ui-text transition-colors">Active Intelligence</h4>
                  <span className="text-[10px] bg-ui-warning/20 text-ui-warning px-2 py-0.5 rounded-full font-bold transition-colors">LIVE</span>
                </div>
                <div className="space-y-4">
                  {dashboardData?.alerts?.length > 0 ? (
                    dashboardData.alerts.slice(0, 2).map(alert => (
                      <div key={alert.id} className="p-3 bg-ui-bg rounded-lg border border-ui-border transition-colors">
                        <p className="text-[11px] font-bold text-ui-accent mb-1">{alert.type.toUpperCase()}</p>
                        <p className="text-xs text-ui-text-muted line-clamp-2">{alert.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-ui-text-muted text-center py-4 italic">No active insights at the moment.</p>
                  )}
                  <button className="w-full py-2 text-xs font-bold text-ui-accent hover:bg-ui-hover rounded-lg transition-colors border border-ui-accent/20" onClick={() => {setShowAIInsights(false); navigate('/dashboard');}}>
                    Review Full Matrix
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-ui-border"></div>

        {/* User Menu */}
        <div className="relative">
          <button 
            className="flex items-center gap-3 hover:bg-ui-hover p-1 rounded-lg transition-colors group"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-ui-text leading-none">{user?.name || 'User'}</p>
              <p className="text-[10px] text-ui-text-muted mt-1">{user?.role || 'BD Team'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-ui-accent text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-ui-card group-hover:scale-105 transition-transform">
              {user?.initials || user?.name?.substring(0, 2)?.toUpperCase() || 'U'}
            </div>
            <ChevronDown className={`w-3 h-3 text-ui-text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute top-12 right-0 w-56 bg-ui-card rounded-xl shadow-xl border border-ui-border overflow-hidden z-50 py-1 animate-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-ui-border transition-colors">
                <p className="text-sm font-bold text-ui-text">{user?.name}</p>
                <p className="text-xs text-ui-text-muted">{user?.email}</p>
              </div>
              <div className="p-1">
                <button 
                  onClick={() => {setShowUserMenu(false); navigate('/settings');}}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ui-text-muted hover:bg-ui-hover rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button 
                  onClick={() => {setShowUserMenu(false); toggleTheme();}}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ui-text-muted hover:bg-ui-hover rounded-lg transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
              <div className="p-1 border-t border-ui-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ui-error hover:bg-ui-error/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
