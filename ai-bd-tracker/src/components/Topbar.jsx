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
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-8 z-30 shadow-sm border-b border-slate-200/50 dark:border-slate-800 relative transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all dark:text-white dark:placeholder-slate-500"
            placeholder="Search pipeline, assets, or stakeholders..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
          />
          
          {showSearchResults && (
            <div className="absolute top-11 left-0 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 max-h-96 overflow-y-auto animate-in slide-in-from-top-2">
              <div className="p-2">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No matches found for "{searchQuery}"</div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-700">
                    {searchResults.map((result, idx) => (
                      <button
                        key={`${result.type}-${result.id}-${idx}`}
                        className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors rounded-lg"
                        onClick={() => handleSearchResultClick(result)}
                      >
                        <div className={`p-2 rounded-lg ${result.type === 'project' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30'}`}>
                          {result.type === 'project' ? <Briefcase className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{result.title}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-tight font-medium">{result.subtitle || result.type}</div>
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
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-slate-900"></span>}
            </button>

            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in slide-in-from-top-2">
                <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-4 py-3 flex justify-between items-center">
                  <span className="font-bold text-sm dark:text-white">Notifications ({unreadCount})</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</span>
                          <span className="text-[9px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{n.desc}</p>
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
              <div className="absolute top-12 right-0 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 p-4 animate-in slide-in-from-top-2">
                <h4 className="text-sm font-bold mb-3 dark:text-white">Help Center</h4>
                <div className="space-y-3">
                  <button className="w-full text-left text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium flex items-center gap-2" onClick={() => navigate('/')}>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    Using Smart Input
                  </button>
                  <button className="w-full text-left text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium flex items-center gap-2" onClick={() => navigate('/pipeline')}>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    Managing your Pipeline
                  </button>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-[10px] text-slate-400">
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
              className="flex items-center gap-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all" 
              onClick={() => setShowAIInsights(!showAIInsights)}
            >
              <Wand2 className="w-4 h-4" />
              AI Insights
            </button>
            
            {showAIInsights && (
              <div className="absolute top-12 right-0 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 p-4 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold dark:text-white">Active Intelligence</h4>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">LIVE</span>
                </div>
                <div className="space-y-4">
                  {dashboardData?.alerts?.length > 0 ? (
                    dashboardData.alerts.slice(0, 2).map(alert => (
                      <div key={alert.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                        <p className="text-[11px] font-bold text-blue-600 mb-1">{alert.type.toUpperCase()}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{alert.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No active insights at the moment.</p>
                  )}
                  <button className="w-full py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/50" onClick={() => {setShowAIInsights(false); navigate('/dashboard');}}>
                    Review Full Matrix
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

        {/* User Menu */}
        <div className="relative">
          <button 
            className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-lg transition-colors group"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 mt-1">{user?.role || 'BD Team'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white dark:ring-slate-900 group-hover:scale-105 transition-transform">
              {user?.initials || user?.name?.substring(0, 2)?.toUpperCase() || 'U'}
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute top-12 right-0 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 py-1 animate-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700">
                <p className="text-sm font-bold dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="p-1">
                <button 
                  onClick={() => {setShowUserMenu(false); navigate('/settings');}}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button 
                  onClick={() => {setShowUserMenu(false); toggleTheme();}}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
              <div className="p-1 border-t border-slate-50 dark:border-slate-700">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
