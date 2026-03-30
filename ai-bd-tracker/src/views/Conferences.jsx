import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Globe, MapPin, Clock, CalendarDays, Crosshair, Users, Info, Building2, Briefcase, ShieldAlert, Archive, Sparkles, Filter } from 'lucide-react';

const themeMap = {
  blue: {
    banner: 'bg-gradient-to-br from-blue-900 to-blue-950 border-b border-blue-800',
    iconHover: 'text-blue-500',
    iconActive: 'text-blue-600',
    pillTarget: 'bg-blue-100 text-blue-800',
  },
  emerald: {
    banner: 'bg-gradient-to-br from-emerald-900 to-emerald-950 border-b border-emerald-800',
    iconHover: 'text-emerald-500',
    iconActive: 'text-emerald-500',
    pillTarget: 'bg-emerald-100 text-emerald-800',
  },
  indigo: {
    banner: 'bg-gradient-to-br from-indigo-900 to-indigo-950 border-b border-indigo-800',
    iconHover: 'text-indigo-500',
    iconActive: 'text-indigo-500',
    pillTarget: 'bg-indigo-100 text-indigo-800',
  },
  orange: {
    banner: 'bg-gradient-to-br from-orange-900 to-orange-950 border-b border-orange-800',
    iconHover: 'text-orange-500',
    iconActive: 'text-orange-600',
    pillTarget: 'bg-orange-100 text-orange-900',
  },
  slate: {
    banner: 'bg-gradient-to-br from-slate-700 to-slate-900 border-b border-slate-700',
    iconHover: 'text-slate-400',
    iconActive: 'text-slate-500',
    pillTarget: 'bg-slate-100 text-slate-700',
  }
};

const logoMap = {
  JPM: "/logos/jpm.png",
  AACR: "/logos/aacr.png",
  ASCO: "/logos/asco.png",
  ESMO: "/logos/esmo.png"
};

const mockConferences = [
  {
    id: 'jpm2027', type: 'JPM', isHistorical: false, acronym: 'JPM 2027', name: '45th Annual J.P. Morgan Healthcare Conference', date: 'January 11-14, 2027', location: 'Westin St. Francis, San Francisco, CA', timezoneInfo: 'PST (UTC-8) | 16 hrs behind Beijing', color: 'blue',
    objectives: ['Secure Series B lead investor (Target: $50M).', 'Finalize global out-licensing terms for Project Helios.'],
    delegation: [{ name: 'Dr. Alex Mercer', title: 'CEO', role: 'Executive Sponsor & Deal Closer' }, { name: 'Elena Rostova', title: 'CBO', role: 'Lead Negotiator' }],
    meetings: [{ id: 'm1', partner: 'Pfizer', time: 'Jan 12, 10:00 AM PST (Jan 13, 02:00 AM Beijing)', focus: 'Project Helios Licensing', goal: 'Push for $30M upfront payment.', ourAttendees: ['Alex Mercer'], counterparties: [{ name: 'Dr. Sarah Jenkins', title: 'SVP, Global BD', bio: 'Veteran deal-maker. Deeply analytical.' }] }]
  },
  {
    id: 'jpm2026', type: 'JPM', isHistorical: true, acronym: 'JPM 2026', name: '44th Annual J.P. Morgan Healthcare Conference', date: 'January 12-15, 2026', location: 'San Francisco, CA', timezoneInfo: 'PST (UTC-8)', color: 'slate',
    objectives: ['Series A Extension Pitching'],
    delegation: [{ name: 'Dr. Alex Mercer', title: 'CEO', role: 'Lead' }],
    meetings: [{ id: 'm-j26', partner: 'Sequoia Capital', time: 'Jan 13, 13:00 PST', focus: 'Series A+', goal: 'Closed $15M extension.', ourAttendees: ['Alex Mercer'], counterparties: [{name: 'James Henderson', title: 'Partner', bio:'Lead investor of Series A.'}] }]
  },
  {
    id: 'aacr2027', type: 'AACR', isHistorical: false, acronym: 'AACR 2027', name: 'American Association for Cancer Research Annual Meeting', date: 'April 10-14, 2027', location: 'Orange County Convention Center, Orlando, FL', timezoneInfo: 'EDT (UTC-4) | 12 hrs behind Beijing', color: 'emerald',
    objectives: ['Scout novel ADC platform technologies.', 'Present late-breaking abstract on BDX-402 efficacy.'],
    delegation: [{ name: 'Dr. Chen Wei', title: 'CMO', role: 'Presenter' }],
    meetings: []
  },
  {
    id: 'asco2027', type: 'ASCO', isHistorical: false, acronym: 'ASCO 2027', name: 'American Society of Clinical Oncology Annual Meeting', date: 'June 4-8, 2027', location: 'McCormick Place, Chicago, IL', timezoneInfo: 'CDT (UTC-5) | 13 hrs behind Beijing', color: 'indigo',
    objectives: ['Oral presentation for Project Helios Phase 2a interim data.', 'Poach key KOLs from competing trials.'],
    delegation: [{ name: 'Dr. Chen Wei', title: 'CMO', role: 'KOL Whisperer' }, { name: 'Elena Rostova', title: 'CBO', role: 'Partnering' }],
    meetings: [{ id: 'm3', partner: 'Merck & Co.', time: 'June 5, 03:00 PM CDT (June 6, 04:00 AM Beijing)', focus: 'Combo Trial Feasibility', goal: 'Secure free drug supply agreement for Keytruda combo arm.', ourAttendees: ['Dr. Chen Wei', 'Elena Rostova'], counterparties: [{ name: 'Dr. Amanda Lewis', title: 'Global Clinical Lead', bio: 'Extremely protective of Keytruda combo rationale.' }] }]
  },
  {
    id: 'asco2024', type: 'ASCO', isHistorical: true, acronym: 'ASCO 2024', name: 'ASCO Annual Meeting 2024', date: 'May 31 - June 4, 2024', location: 'Chicago, IL', timezoneInfo: 'CDT (UTC-5)', color: 'slate',
    objectives: ['Initial Ph1 Data Readout'],
    delegation: [{ name: 'Dr. Chen Wei', title: 'CMO', role: 'Presenter' }],
    meetings: []
  },
  {
    id: 'esmo2026', type: 'ESMO', isHistorical: false, acronym: 'ESMO 2026', name: 'European Society for Medical Oncology Congress', date: 'Oct 15-19, 2026', location: 'Fira Barcelona Gran Via, Spain', timezoneInfo: 'CEST (UTC+2) | 6 hrs behind Beijing', color: 'orange',
    objectives: ['Expand European BD network for Asset BDX-402 out-licensing.'],
    delegation: [{ name: 'Elena Rostova', title: 'CBO', role: 'EU Partnering Pipeline' }],
    meetings: [{ id: 'm4', partner: 'Novartis', time: 'Oct 16, 11:00 AM CEST (Oct 16, 05:00 PM Beijing)', focus: 'BDX-402 EU Rights', goal: 'Present pre-clinical superiority data vs standard of care.', ourAttendees: ['Elena Rostova'], counterparties: [{ name: 'Dr. Klaus Richter', title: 'Head of Solid Tumors', bio: 'Highly academic and rigorous. Dislikes aggressive sales pitches.' }] }]
  }
];

export default function Conferences() {
  const { category } = useParams();
  
  // Default to JPM if missing or invalid
  if (!category || !['jpm', 'aacr', 'asco', 'esmo'].includes(category.toLowerCase())) {
    return <Navigate to="/conferences/jpm" replace />;
  }

  const currentCategory = category.toUpperCase();
  const categoryConferences = mockConferences.filter(c => c.type === currentCategory);
  
  const [activeConfId, setActiveConfId] = useState('');

  // Auto-select the first (most recent/upcoming) conference when category changes
  useEffect(() => {
    if (categoryConferences.length > 0) {
      setActiveConfId(categoryConferences[0].id);
    }
  }, [currentCategory]);

  const activeConf = mockConferences.find(c => c.id === activeConfId) || categoryConferences[0];

  if (!activeConf) {
    return <div className="p-8 text-slate-500">No data found for this circuit.</div>;
  }

  const currentTheme = activeConf.isHistorical ? themeMap.slate : themeMap[activeConf.color];

  return (
    <div className="flex-1 overflow-y-auto bg-[#f7f9fb] animate-in fade-in duration-300">
      
      {/* Massive 100% Width Header */}
      <div className={`${currentTheme.banner} p-8 md:p-12 text-white relative overflow-hidden shadow-sm transition-colors duration-500`}>
         <div className="absolute top-0 right-0 w-full h-full bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="relative z-10 max-w-7xl mx-auto">
           {/* Top Navigation Tabs for Year/Event Switching */}
           <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
             {categoryConferences.map(conf => {
               const isSelected = conf.id === activeConfId;
               return (
                 <button
                   key={conf.id}
                   onClick={() => setActiveConfId(conf.id)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                     isSelected 
                     ? 'bg-white text-slate-900 border-white shadow-md scale-105' 
                     : 'bg-black/20 text-white/70 border-white/20 hover:bg-black/40 hover:text-white'
                   }`}
                 >
                   {conf.isHistorical ? <Archive className={`w-4 h-4 ${isSelected ? 'text-slate-500' : ''}`} /> : <Sparkles className={`w-4 h-4 ${isSelected ? themeMap[conf.color].iconActive : ''}`} />}
                   {conf.acronym}
                   {conf.isHistorical && <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ${isSelected ? 'bg-slate-200 text-slate-600' : 'bg-black/30 text-white/50'}`}>Archive</span>}
                 </button>
               )
             })}
           </div>

           <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
             <div>
               <div className="flex items-center gap-3 text-white/80 text-sm font-extrabold uppercase tracking-widest mb-4">
                 {activeConf.isHistorical ? <Archive className="w-5 h-5" /> : <Globe className="w-5 h-5" />} 
                 {currentCategory} GLOBAL PARTNERING CIRCUIT
               </div>
               
               <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">{activeConf.name}</h1>
               
               <div className="flex flex-wrap gap-4 mt-8">
                 <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                   <CalendarDays className="w-4 h-4 text-blue-300" /> {activeConf.date}
                 </div>
                 <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                   <MapPin className="w-4 h-4 text-orange-300" /> {activeConf.location}
                 </div>
                 {!activeConf.isHistorical && (
                   <div className="flex items-center gap-2 bg-orange-500/30 backdrop-blur-md text-orange-100 px-4 py-2 rounded-xl text-sm font-bold border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                     <Clock className="w-4 h-4" /> {activeConf.timezoneInfo}
                   </div>
                 )}
               </div>
             </div>

             {/* Partner/Conference Extracted Logo Image */}
             {logoMap[activeConf.type] && (
               <div className="shrink-0 animate-in fade-in zoom-in duration-700">
                 <div className="bg-white/95 p-3 sm:p-4 rounded-2xl shadow-2xl ring-1 ring-white/20 hover:scale-105 transition-transform">
                   <img 
                     src={logoMap[activeConf.type]} 
                     alt={`${activeConf.type} Logo`}
                     className="max-w-[140px] sm:max-w-[180px] max-h-[70px] sm:max-h-[90px] object-contain drop-shadow-sm" 
                   />
                 </div>
               </div>
             )}
           </div>

         </div>
      </div>

      {/* Main Content Area filling the entire width */}
      <div className="p-8 md:p-12 max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">
              <Crosshair className={`w-5 h-5 ${activeConf.isHistorical ? 'text-slate-400' : 'text-red-500'}`} /> {activeConf.isHistorical ? 'Retrospective Goals' : 'Operational Objectives'}
            </h3>
            <ul className="space-y-5">
              {activeConf.objectives.map((obj, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${activeConf.isHistorical ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-600'}`}>
                    {i+1}
                  </div>
                  <p className={`text-base font-medium ${activeConf.isHistorical ? 'text-slate-500' : 'text-slate-800'} leading-relaxed pt-1`}>{obj}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">
              <Users className={`w-5 h-5 ${activeConf.isHistorical ? 'text-slate-400' : 'text-blue-500'}`} /> {activeConf.isHistorical ? 'Attendees of Record' : 'Our Delegation'}
            </h3>
            <div className="space-y-5">
              {activeConf.delegation.map((del, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${activeConf.isHistorical ? 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 ring-2 ring-blue-500/20'} flex items-center justify-center font-bold text-lg shrink-0 uppercase shadow-sm`}>
                    {del.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                  </div>
                  <div>
                    <h4 className={`text-base font-bold ${activeConf.isHistorical ? 'text-slate-700' : 'text-slate-900'}`}>{del.name}</h4>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{del.title}</p>
                    <p className={`text-sm mt-1 font-medium ${activeConf.isHistorical ? 'text-slate-500' : 'text-blue-600'}`}>{del.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meetings Radar */}
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-6">
          {activeConf.isHistorical ? (
            <><Archive className="w-5 h-5 text-slate-500" /> Archived Encounters Dashboard</>
          ) : (
            <><ShieldAlert className="w-5 h-5 text-indigo-500" /> Tactical Meeting Radar</>
          )}
        </h3>
        
        <div className="space-y-6">
          {activeConf.meetings.length === 0 && (
             <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
               <Filter className="w-8 h-8 text-slate-300 mx-auto mb-3" />
               <p className="text-base text-slate-500 font-medium">No recorded meetings for this particular milestone.</p>
             </div>
          )}

          {activeConf.meetings.map(meeting => (
            <div key={meeting.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <div className="bg-slate-50 w-full p-6 lg:flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg shrink-0 ring-1 ring-black/10">
                     <Building2 className="w-7 h-7 text-white" />
                   </div>
                   <div>
                     <div className="flex items-center gap-3 mb-1.5">
                       <h4 className="text-2xl font-extrabold text-slate-900">{meeting.partner}</h4>
                       <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">{meeting.focus}</span>
                     </div>
                     <div className={`flex items-center gap-2 text-sm font-bold px-2.5 py-1 rounded inline-flex ${activeConf.isHistorical ? 'text-slate-600 bg-slate-200/50' : 'text-orange-700 bg-orange-100 ring-1 ring-orange-500/20'}`}>
                       <Clock className="w-4 h-4" /> {meeting.time}
                     </div>
                   </div>
                </div>
                
                <div className="mt-5 lg:mt-0 lg:text-right border-l-2 lg:border-l lg:border-slate-200 pl-6">
                   <p className="text-[11px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">Our Attendees</p>
                   <p className="text-base font-extrabold text-slate-700">{meeting.ourAttendees.join(', ')}</p>
                </div>
              </div>

              <div className="p-8 lg:flex gap-10">
                <div className="lg:w-1/3 mb-8 lg:mb-0">
                  <p className={`text-[11px] uppercase font-bold tracking-widest mb-3 flex items-center gap-2 ${activeConf.isHistorical ? 'text-slate-500' : 'text-indigo-600'}`}>
                    <Crosshair className="w-4 h-4" /> Core Objective
                  </p>
                  <p className={`text-base text-slate-800 font-medium leading-relaxed border p-6 rounded-2xl shadow-inner ${activeConf.isHistorical ? 'bg-slate-50/80 border-slate-100' : 'bg-indigo-50/50 border-indigo-100/60'}`}>
                    {meeting.goal}
                  </p>
                </div>

                <div className="lg:w-2/3">
                  <p className="text-[11px] uppercase font-bold text-slate-400 tracking-widest mb-5 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Opponent Dossier
                  </p>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {meeting.counterparties.map((cp, idx) => (
                       <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 ring-1 ring-slate-900/5 hover:border-blue-200 transition-colors">
                         <div className="flex gap-4">
                           <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-extrabold text-slate-500 shrink-0 text-lg">
                             {cp.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                           </div>
                           <div className="flex-1">
                             <div className="flex flex-col mb-3">
                               <h5 className="font-extrabold text-slate-900 text-base">{cp.name}</h5>
                               <span className="text-xs font-bold text-slate-500">{cp.title}</span>
                             </div>
                             <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl text-sm text-slate-600 font-medium italic border-l-4 border-slate-300">
                               <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                               <p className="leading-snug">{cp.bio}</p>
                             </div>
                           </div>
                         </div>
                       </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
