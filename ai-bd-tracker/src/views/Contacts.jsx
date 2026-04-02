import React, { useState, useMemo, useEffect } from 'react';
import { Search, Mail, Phone, Globe, Building2, Briefcase, MapPin, CalendarDays, History, ChevronRight, UserCircle2, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import EditableField from '../components/EditableField';

export default function Contacts() {
  const { contacts, projects, updateContact, contactsLoaded } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [groupBy, setGroupBy] = useState('all'); // 'all', 'company', 'function'

  // Auto-select first contact when loaded
  useEffect(() => {
    if (contacts.length > 0 && !selectedContactId) {
       setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return contacts.filter(c => 
      (c.name || '').toLowerCase().includes(q) || 
      (c.currentCompany || '').toLowerCase().includes(q) || 
      (c.currentTitle || '').toLowerCase().includes(q)
    );
  }, [searchQuery, contacts]);

  const groupedContacts = useMemo(() => {
    if (groupBy === 'all') return { 'All Contacts': filteredContacts };
    
    const groups = {};
    
    if (groupBy === 'project' && projects) {
      // Find which projects each contact belongs to via history attendees
      filteredContacts.forEach(c => {
        let matched = false;
        projects.forEach(p => {
          // This is a simple heuristic: if the contact is met at a project, or name match in history
          const nameMatch = (p.history || []).some(h => 
            Array.isArray(h.details?.attendees) && 
            h.details.attendees.some(a => 
              (typeof a === 'object' && a.name?.toLowerCase() === c.name.toLowerCase()) ||
              (typeof a === 'string' && a.toLowerCase().includes(c.name.toLowerCase()))
            )
          );
          
          if (nameMatch) {
            const groupKey = p.company + " - " + p.pipeline;
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(c);
            matched = true;
          }
        });
        
        if (!matched) {
          if (!groups['Other / Indirect']) groups['Other / Indirect'] = [];
          groups['Other / Indirect'].push(c);
        }
      });
    } else {
      filteredContacts.forEach(c => {
        const key = groupBy === 'company' ? c.currentCompany : c.functionArea;
        if (!groups[key]) groups[key] = [];
        groups[key].push(c);
      });
    }
    
    // Sort group names
    return Object.fromEntries(Object.entries(groups).sort());
  }, [filteredContacts, groupBy, projects]);

  const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  const handleFieldUpdate = async (field, newValue) => {
    if (!activeContact) return;
    try {
      const updateData = { [field]: newValue };
      await api.updateContact(activeContact.id, updateData);
      updateContact(activeContact.id, updateData);
    } catch (err) {
      console.error(`Failed to update contact field ${field}:`, err);
      throw err;
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="flex bg-ui-bg h-full items-center justify-center p-8 transition-colors">
         <div className="text-center">
            <UserCircle2 className="w-16 h-16 text-ui-text-muted mx-auto mb-4 animate-pulse opacity-20" />
            <h2 className="text-xl font-bold text-ui-text">{contactsLoaded ? 'No Key Contacts Yet' : 'Loading Key Contacts...'}</h2>
            <p className="text-ui-text-muted max-w-sm mx-auto mt-2">{contactsLoaded ? 'Use Smart Input to add contacts from meeting notes or emails.' : 'Connecting to the backend intelligence database. Ensure your FastAPI server is running.'}</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex bg-ui-bg h-full overflow-hidden transition-colors">
      
      {/* LEFT PANE: Directory List */}
      <div className="w-[380px] shrink-0 border-r border-ui-border bg-ui-card flex flex-col h-full z-10 shadow-[2px_0_15px_rgba(0,0,0,0.02)] transition-colors">
        
        {/* Search & Group Header */}
        <div className="p-6 border-b border-ui-border bg-ui-card transition-colors">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-6 h-6 text-ui-accent" />
            <h1 className="text-xl font-extrabold text-ui-text tracking-tight transition-colors">Key Contacts</h1>
          </div>
          
          <div className="flex p-1 bg-ui-bg rounded-xl mb-4 border border-ui-border transition-colors">
            {['all', 'company', 'function', 'project'].map((mode) => (
              <button
                key={mode}
                onClick={() => setGroupBy(mode)}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  groupBy === mode 
                    ? 'bg-ui-card text-ui-accent shadow-sm ring-1 ring-ui-border' 
                    : 'text-ui-text-muted hover:text-ui-text'
                }`}
              >
                {mode === 'all' ? 'A-Z' : mode}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-text-muted" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-ui-input border border-ui-input-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-ui-accent/20 focus:border-ui-accent transition-all font-medium text-ui-text placeholder:text-ui-text-muted/50"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(groupedContacts).length === 0 && (
            <div className="text-center py-10 text-ui-text-muted text-sm transition-colors">No matches found.</div>
          )}
          
          {Object.entries(groupedContacts).map(([groupName, list]) => (
            <div key={groupName} className="space-y-2">
              {groupBy !== 'all' && (
                <div className="flex items-center gap-2 px-2 mb-3">
                  <div className="h-px bg-ui-border flex-1"></div>
                  <span className="text-[10px] font-black text-ui-text-muted uppercase tracking-tighter whitespace-nowrap bg-ui-bg px-2 py-0.5 rounded-full border border-ui-border transition-colors">
                    {groupName || 'Unclassified'}
                  </span>
                  <div className="h-px bg-ui-border flex-1"></div>
                </div>
              )}
              
              {list.map(contact => {
                const isSelected = contact.id === selectedContactId;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all duration-200 border flex items-center gap-3 ${
                      isSelected 
                        ? 'bg-ui-accent/10 border-ui-accent/30 shadow-sm ring-1 ring-ui-accent/10' 
                        : 'bg-ui-card border-transparent hover:bg-ui-hover hover:border-ui-border'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {contact.photoUrl ? (
                        <img 
                          src={contact.photoUrl} 
                          alt={contact.name} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-ui-accent/20 flex items-center justify-center text-ui-accent font-black text-xs border-2 border-white shadow-sm">
                          {(contact.name || '??').split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-sm truncate transition-colors ${isSelected ? 'text-ui-accent' : 'text-ui-text'}`}>
                        {contact.name}
                      </h3>
                      <div className="text-[11px] font-medium text-ui-text-muted truncate mt-0.5 flex items-center gap-1.5 transition-colors">
                        <Briefcase className="w-3 h-3 opacity-50" />
                        {contact.currentTitle}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: Counterparty Dossier */}
      <div className="flex-1 h-full overflow-y-auto bg-ui-bg relative transition-colors duration-500">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-br from-slate-800 to-slate-950 overflow-hidden transition-colors duration-500">
           <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-20">
          
          {/* Main Profile Header Card */}
          <div className="bg-ui-card rounded-3xl p-8 shadow-xl ring-1 ring-ui-border mb-8 relative transition-colors">
             <div className="flex flex-col md:flex-row gap-8 items-start">
               
               {/* Large Avatar */}
               <div className="shrink-0 -mt-20">
                 <div className="p-2 bg-ui-card rounded-full shadow-lg ring-1 ring-ui-border inline-block transition-colors">
                   {activeContact.photoUrl ? (
                     <img 
                       src={activeContact.photoUrl} 
                       alt={activeContact.name} 
                       className="w-36 h-36 rounded-full object-cover shadow-inner"
                     />
                   ) : (
                     <div className="w-36 h-36 rounded-full bg-gradient-to-br from-ui-accent/30 to-ui-accent/10 flex items-center justify-center text-ui-accent font-black text-4xl shadow-inner">
                       {(activeContact.name || '??').split(' ').map(n => n[0]).join('').slice(0,2)}
                     </div>
                   )}
                 </div>
               </div>

               <div className="flex-1 pt-2">
                 <div className="flex flex-wrap items-center gap-3 mb-2">
                   <EditableField
                     value={activeContact.functionArea}
                     onSave={(val) => handleFieldUpdate('functionArea', val)}
                     textClassName="px-3 py-1 bg-ui-accent/10 text-ui-accent text-xs font-bold uppercase tracking-wider rounded-full"
                   />
                   <span className="flex items-center gap-1 text-sm font-medium text-ui-text-muted">
                     <MapPin className="w-4 h-4" /> 
                     <EditableField
                       value={activeContact.location}
                       onSave={(val) => handleFieldUpdate('location', val)}
                       textClassName="inline-block"
                     />
                   </span>
                 </div>
                 
                 <EditableField
                   value={activeContact.name}
                   onSave={(val) => handleFieldUpdate('name', val)}
                   textClassName="text-4xl font-extrabold text-ui-text tracking-tight mb-2"
                 />
                 
                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-lg">
                   <span className="font-bold text-ui-text flex items-center gap-2 transition-colors">
                     <Building2 className="w-5 h-5 text-ui-accent" />
                     <EditableField
                       value={activeContact.currentCompany}
                       onSave={(val) => handleFieldUpdate('currentCompany', val)}
                       textClassName="inline-block"
                     />
                   </span>
                   <span className="hidden sm:inline text-ui-border">|</span>
                   <EditableField
                     value={activeContact.currentTitle}
                     onSave={(val) => handleFieldUpdate('currentTitle', val)}
                     textClassName="font-medium text-ui-text-muted transition-colors whitespace-pre-wrap"
                   />
                 </div>
               </div>
             </div>

             <div className="mt-8 pt-6 border-t border-ui-border flex flex-wrap gap-4 transition-colors">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-ui-accent/10 text-ui-accent rounded-xl text-sm font-bold transition-all ring-1 ring-ui-accent/20">
                   <Mail className="w-4 h-4 shrink-0" /> 
                   <EditableField
                      value={activeContact.email}
                      onSave={(val) => handleFieldUpdate('email', val)}
                      textClassName="inline-block"
                   />
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-ui-bg text-ui-text rounded-xl text-sm font-bold transition-all ring-1 ring-ui-border">
                   <Phone className="w-4 h-4 shrink-0" /> 
                   <EditableField
                      value={activeContact.phone}
                      onSave={(val) => handleFieldUpdate('phone', val)}
                      textClassName="inline-block"
                   />
                </div>
                <a href={`https://${activeContact.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-ui-accent/10 hover:bg-ui-accent/20 text-ui-accent rounded-xl text-sm font-bold transition-all ring-1 ring-ui-accent/20">
                   <Globe className="w-4 h-4" /> LinkedIn
                </a>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Middle Column: Bio & Interactions */}
             <div className="lg:col-span-2 space-y-8">
               {/* Psychological Profile / Bio */}
               <div className="bg-ui-card rounded-3xl p-8 shadow-sm ring-1 ring-ui-border border-t-4 border-t-ui-accent transition-all duration-500">
                 <h3 className="flex items-center gap-2 text-sm font-extrabold text-ui-text uppercase tracking-widest mb-4">
                   <Activity className="w-5 h-5 text-ui-accent" /> Executive Profile & Tactics
                 </h3>
                 <EditableField
                   value={activeContact.profile}
                   type="textarea"
                   onSave={(val) => handleFieldUpdate('profile', val)}
                   textClassName="text-ui-text-muted font-medium leading-relaxed text-lg block w-full"
                 />
               </div>

               {/* Met At / Associated Conferences */}
               <div className="bg-ui-card rounded-3xl p-8 shadow-sm ring-1 ring-ui-border transition-colors">
                 <h3 className="flex items-center gap-2 text-sm font-extrabold text-ui-text uppercase tracking-widest mb-5">
                   <CalendarDays className="w-5 h-5 text-ui-accent" /> Encounter Footprints
                 </h3>
                 <div className="flex flex-wrap gap-3">
                   {(activeContact.metAt || []).map((conf, idx) => (
                     <span key={idx} className="px-4 py-2 bg-ui-bg text-ui-text rounded-xl text-sm font-bold border border-ui-border flex items-center gap-2 transition-colors">
                       <div className="w-2 h-2 rounded-full bg-ui-text-muted"></div> {conf}
                     </span>
                   ))}
                 </div>
               </div>
             </div>

             {/* Right Column: Career History Timeline */}
             <div className="lg:col-span-1">
               <div className="bg-ui-card rounded-3xl p-8 shadow-sm ring-1 ring-ui-border h-full transition-colors">
                 <h3 className="flex items-center gap-2 text-sm font-extrabold text-ui-text uppercase tracking-widest mb-8">
                   <History className="w-5 h-5 text-ui-text-muted" /> Career Trajectory
                 </h3>
                 
                 <div className="relative border-l-2 border-ui-border pl-6 pb-2 space-y-8 transition-colors">
                   {(activeContact.careerHistory || []).map((job, idx) => (
                     <div key={job.id} className="relative">
                       {/* Timeline dot */}
                       <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-ui-card shadow-sm transition-all ${
                         job.isCurrent ? 'bg-ui-accent ring-2 ring-ui-accent/20' : 'bg-ui-text-muted opacity-30'
                       }`}></div>
                       
                       <div className="mb-1">
                         <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                           job.isCurrent ? 'text-ui-accent' : 'text-ui-text-muted'
                         }`}>
                           {job.dateRange}
                         </span>
                       </div>
                       <h4 className={`text-base font-extrabold ${job.isCurrent ? 'text-ui-text' : 'text-ui-text-muted'}`}>
                         {job.company}
                       </h4>
                       <p className={`text-sm mt-0.5 font-medium ${job.isCurrent ? 'text-ui-text-muted' : 'text-ui-text-muted opacity-80'}`}>
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
