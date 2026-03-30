import React, { useState, useMemo, useEffect } from 'react';
import { Search, Mail, Phone, Globe, Building2, Briefcase, MapPin, CalendarDays, History, ChevronRight, UserCircle2, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Contacts() {
  const { contacts } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Auto-select first contact when loaded
  useEffect(() => {
    if (contacts.length > 0 && !selectedContactId) {
       setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.currentCompany.toLowerCase().includes(q) || 
      c.currentTitle.toLowerCase().includes(q)
    );
  }, [searchQuery, contacts]);

  const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  if (contacts.length === 0) {
    return (
      <div className="flex bg-[#f7f9fb] h-full items-center justify-center p-8">
         <div className="text-center">
            <UserCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-700">Loading Key Contacts...</h2>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Connecting to the backend intelligence database. Ensure your FastAPI server is running.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#f7f9fb] h-full overflow-hidden">
      
      {/* LEFT PANE: Directory List */}
      <div className="w-[380px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full z-10 shadow-[2px_0_15px_rgba(0,0,0,0.02)]">
        
        {/* Search Header */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Key Contacts</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search names, companies, titles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredContacts.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">No contacts found matching "{searchQuery}"</div>
          )}
          {filteredContacts.map(contact => {
            const isSelected = contact.id === selectedContactId;
            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border flex items-center gap-4 ${
                  isSelected 
                    ? 'bg-indigo-50/50 border-indigo-200 shadow-sm ring-1 ring-indigo-500/10' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="relative shrink-0">
                  <img 
                    src={contact.photoUrl} 
                    alt={contact.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {contact.name}
                  </h3>
                  <div className="text-sm font-medium text-slate-500 truncate mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {contact.currentCompany}
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* RIGHT PANE: Counterparty Dossier */}
      <div className="flex-1 h-full overflow-y-auto bg-[#f8fafd] relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 overflow-hidden">
           <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-20">
          
          {/* Main Profile Header Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 mb-8 relative">
             <div className="flex flex-col md:flex-row gap-8 items-start">
               
               {/* Large Avatar */}
               <div className="shrink-0 -mt-20">
                 <div className="p-2 bg-white rounded-full shadow-lg ring-1 ring-slate-200 inline-block">
                   <img 
                     src={activeContact.photoUrl} 
                     alt={activeContact.name} 
                     className="w-36 h-36 rounded-full object-cover shadow-inner"
                   />
                 </div>
               </div>

               <div className="flex-1 pt-2">
                 <div className="flex flex-wrap items-center gap-3 mb-2">
                   <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider rounded-full">
                     {activeContact.functionArea}
                   </span>
                   <span className="flex items-center gap-1 text-sm font-medium text-slate-500">
                     <MapPin className="w-4 h-4" /> {activeContact.location}
                   </span>
                 </div>
                 
                 <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                   {activeContact.name}
                 </h1>
                 
                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-lg">
                   <span className="font-bold text-slate-700 flex items-center gap-2">
                     <Building2 className="w-5 h-5 text-indigo-500" />
                     {activeContact.currentCompany}
                   </span>
                   <span className="hidden sm:inline text-slate-300">|</span>
                   <span className="font-medium text-slate-500">
                     {activeContact.currentTitle}
                   </span>
                 </div>
               </div>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4">
               <a href={`mailto:${activeContact.email}`} className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition-colors ring-1 ring-blue-200">
                  <Mail className="w-4 h-4" /> {activeContact.email}
               </a>
               <a href={`tel:${activeContact.phone}`} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition-colors ring-1 ring-slate-200">
                  <Phone className="w-4 h-4" /> {activeContact.phone}
               </a>
               <a href={`https://${activeContact.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-sm font-bold transition-colors ring-1 ring-sky-200">
                  <Globe className="w-4 h-4" /> LinkedIn
               </a>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Middle Column: Bio & Interactions */}
             <div className="lg:col-span-2 space-y-8">
               {/* Psychological Profile / Bio */}
               <div className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-200 border-t-4 border-t-indigo-500">
                 <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-4">
                   <Activity className="w-5 h-5 text-indigo-500" /> Executive Profile & Tactics
                 </h3>
                 <p className="text-slate-600 font-medium leading-relaxed text-lg">
                   {activeContact.profile}
                 </p>
               </div>

               {/* Met At / Associated Conferences */}
               <div className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-200">
                 <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-5">
                   <CalendarDays className="w-5 h-5 text-orange-500" /> Encounter Footprints
                 </h3>
                 <div className="flex flex-wrap gap-3">
                   {activeContact.metAt.map((conf, idx) => (
                     <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold border border-slate-200 flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-slate-400"></div> {conf}
                     </span>
                   ))}
                 </div>
               </div>
             </div>

             {/* Right Column: Career History Timeline */}
             <div className="lg:col-span-1">
               <div className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-200 h-full">
                 <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-8">
                   <History className="w-5 h-5 text-slate-500" /> Career Trajectory
                 </h3>
                 
                 <div className="relative border-l-2 border-slate-100 pl-6 pb-2 space-y-8">
                   {activeContact.careerHistory.map((job, idx) => (
                     <div key={job.id} className="relative">
                       {/* Timeline dot */}
                       <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                         job.isCurrent ? 'bg-indigo-500 ring-2 ring-indigo-200' : 'bg-slate-300'
                       }`}></div>
                       
                       <div className="mb-1">
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${
                           job.isCurrent ? 'text-indigo-600' : 'text-slate-400'
                         }`}>
                           {job.dateRange}
                         </span>
                       </div>
                       <h4 className={`text-base font-extrabold ${job.isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                         {job.company}
                       </h4>
                       <p className={`text-sm mt-0.5 font-medium ${job.isCurrent ? 'text-slate-600' : 'text-slate-500'}`}>
                         {job.title}
                       </p>
                     </div>
                   ))}
                 </div>

               </div>
             </div>

          </div>

        </div>
      </div>

    </div>
  );
}
