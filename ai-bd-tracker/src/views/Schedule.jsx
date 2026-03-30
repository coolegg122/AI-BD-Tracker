import React, { useState } from 'react';
import { Filter, Plus, ChevronLeft, ChevronRight, Microscope, Handshake, History, Video, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Schedule() {
  const { scheduleData } = useStore();
  const [currentMonth, setCurrentMonth] = useState("October 2026");
  const [viewMode, setViewMode] = useState("month");

  if (!scheduleData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Syncing Global Schedule...</p>
      </div>
    );
  }

  const { calendarEvents, catalysts, meetings, tasks } = scheduleData;

  // Simple mock array for days
  const calendarDays = [29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2];
  const daysData = calendarDays.map((day, i) => ({
    day,
    isCurrentMonth: i >= 2 && i <= 32
  }));
  const displayDays = viewMode === "month" ? daysData : daysData.slice(14, 21);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Calendar & Events</h1>
          <p className="text-slate-500 text-sm mt-1">Cross-functional timeline for active deal pipeline.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm" onClick={() => alert('Filter Schedule Modal')}>
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-blue-800" onClick={() => alert('Create New Event Modal')}>
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg text-slate-900">{currentMonth}</h3>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
                  <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight className="w-5 h-5"/></button>
                </div>
              </div>
              <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                <button onClick={() => setViewMode('month')} className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'month' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}>Month</button>
                <button onClick={() => setViewMode('week')} className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'week' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}>Week</button>
              </div>
            </div>
            <div className={`grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200`}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                 <div key={d} className="bg-slate-50 p-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">{d}</div>
              ))}
              {displayDays.map((item, i) => {
                const dayEvents = calendarEvents.filter(e => e.day === item.day && item.isCurrentMonth);
                return (
                 <div key={i} className={`p-2 text-xs font-medium ${viewMode === 'week' ? 'h-48' : 'h-24'} ${!item.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50'} transition-all cursor-pointer border-t border-slate-100`} onClick={() => alert(`View details for Oct ${item.day}`)}>
                   <span className={dayEvents.length > 0 ? "bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full" : ""}>{item.day}</span>
                   {dayEvents.map(evt => {
                     // Tailwind classes need to be static or safelisted. Using explicit maps for colors to prevent Vite arbitrarily dropping them.
                     const colorClasses = 
                        evt.color === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-700' :
                        evt.color === 'red' ? 'bg-red-50 border-red-500 text-red-700' :
                        'bg-blue-50 border-blue-500 text-blue-700';
                     return (
                       <div key={evt.id} className={`mt-1 border-l-2 p-1 rounded text-[9px] font-bold truncate ${colorClasses}`} title={evt.type}>
                         {evt.type}
                       </div>
                     )
                   })}
                 </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Microscope className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">Competitor Catalyst Events</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catalysts.map(cat => (
                <div key={cat.id} className={`bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-${cat.color}-500 shadow-sm hover:shadow-md cursor-pointer transition-shadow`} onClick={() => alert(`Analyze Catalyst: ${cat.company}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-bold uppercase tracking-widest bg-${cat.color}-100 px-2 py-0.5 rounded text-${cat.color}-800`}>{cat.type}</span>
                    <span className="text-[10px] font-bold text-slate-500">{cat.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{cat.company}</h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{cat.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm">Meeting Schedule</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">Today</span>
            </div>
            <div className="space-y-3">
              {meetings.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-white border border-dashed rounded-xl border-slate-300">No meetings scheduled</div>
              ) : (
                meetings.map(m => (
                  <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors" onClick={() => alert(`Launch Meeting: ${m.title}`)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-extrabold text-blue-600 uppercase">{m.status}</span>
                      <span className="text-[10px] font-medium text-slate-500">{m.time}</span>
                    </div>
                    <p className="font-bold text-sm text-slate-900">{m.title}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-slate-500">
                      <Video className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{m.type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-5">
              <History className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-sm">Task Timeline</h3>
            </div>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {tasks.length === 0 && <p className="text-xs text-slate-400">No upcoming tasks tracking</p>}
              {tasks.map(t => (
                <div key={t.id} className="relative group hover:cursor-pointer" onClick={() => alert(`View Task: ${t.title}`)}>
                  <div className={`absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-${t.color}-600 bg-white group-hover:bg-${t.color}-100`}></div>
                  <span className={`text-[9px] font-bold text-${t.color}-600 uppercase tracking-tighter`}>{t.due}</span>
                  <h4 className="font-bold text-xs mt-0.5 text-slate-900 group-hover:text-blue-600 transition-colors">{t.title}</h4>
                  {t.desc && <p className="text-[10px] text-slate-500 mt-1">{t.desc}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
