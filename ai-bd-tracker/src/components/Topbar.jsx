import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Wand2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { notifications, markNotificationRead } = useStore();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 z-30 shadow-sm border-b border-slate-200/50 relative">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            placeholder="Search pipeline, assets, or stakeholders..."
            type="text"
            onKeyDown={(e) => {
              if(e.key === 'Enter') alert('Mock Search triggered: ' + e.target.value);
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-6 relative">
        <div className="flex items-center gap-4">
          <button
            className="text-slate-500 hover:text-blue-700 transition-colors relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-20 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                <span className="font-bold text-sm">Notifications ({unreadCount})</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-xs text-slate-900">{n.title}</span>
                        <span className="text-[9px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500">{n.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <button className="text-slate-500 hover:text-blue-700 transition-colors" onClick={() => alert("Help Center Modal Simulator")}>
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-200 transition-all" onClick={() => alert("Triggering Global AI Agent...")}>
            <Wand2 className="w-4 h-4" />
            AI Insights
          </button>
        </div>
        <div className="h-8 w-[1px] bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 mt-1">{user?.role || 'BD Team'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {user?.initials || user?.name?.substring(0, 2)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
