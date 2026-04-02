import React, { useEffect, useState, useRef } from 'react';
import { X, Calendar, MessageSquare, FileText, CheckCircle2, Clock, Mail, Phone, Users, History, ChevronDown, ChevronUp, Link, Download, Microscope, Target, BrainCircuit, Sparkles, Send, ShieldAlert, ListChecks, MessageSquareQuote, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EditableField from './EditableField';

export default function ProjectSlideOver() {
  const { selectedOverviewProject, closeProjectOverview, stages, updateProject } = useStore();
  const { isAdmin } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, details, documents, prep
  const [prepData, setPrepData] = useState(null);
  const [isPrepLoading, setIsPrepLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (selectedOverviewProject) {
      setTimeout(() => setIsVisible(true), 10);
      setExpandedEventId(null); 
      setActiveTab('timeline');
      setPrepData(null);
      setChatHistory([]);
      setChatMessage('');
      fetchHistory(selectedOverviewProject.id);
      fetchAttachments(selectedOverviewProject.id);
    } else {
      setIsVisible(false);
      setHistoryData([]);
    }
  }, [selectedOverviewProject]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const fetchHistory = async (projectId) => {
    setIsLoading(true);
    try {
      const data = await api.getProjectHistory(projectId);
      setHistoryData(data);
    } catch (err) {
      console.error("Failed to load project history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttachments = async (projectId) => {
    try {
      const data = await api.getProjectAttachments(projectId);
      setAttachments(data);
    } catch (err) {
      console.error("Failed to load attachments:", err);
      setAttachments([]);
    }
  };

  const fetchPrep = async (force = false) => {
    if (!selectedOverviewProject) return;
    setIsPrepLoading(true);
    try {
      const data = await api.getNegotiationPrep(selectedOverviewProject.id, force);
      setPrepData(data);
    } catch (err) {
      console.error("Failed to load prep:", err);
    } finally {
      setIsPrepLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isSending || !selectedOverviewProject) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsSending(true);

    try {
      const res = await api.sendStrategistMessage(selectedOverviewProject.id, chatMessage, chatHistory);
      setChatHistory(prev => [...prev, { role: 'ai', content: res.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I lost my train of thought. Error connecting to strategist." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFieldUpdate = async (field, newValue) => {
    if (!selectedOverviewProject) return;
    try {
      // Logic for nested details update
      let updateData = { [field]: newValue };
      
      // If it's a detail nested update (formatted as 'details.category.key')
      if (field.startsWith('details.')) {
        const parts = field.split('.');
        const category = parts[1];
        const key = parts[2];
        const currentDetails = { ...(selectedOverviewProject.details || {}) };
        const categoryData = { ...(currentDetails[category] || {}) };
        categoryData[key] = newValue;
        currentDetails[category] = categoryData;
        updateData = { details: currentDetails };
      }

      await api.updateProject(selectedOverviewProject.id, updateData);
      updateProject(selectedOverviewProject.id, updateData);
    } catch (err) {
      console.error(`Failed to update project field ${field}:`, err);
      throw err;
    }
  };

  if (!selectedOverviewProject && !isVisible) return null;

  const project = selectedOverviewProject || {};

  const getIcon = (type) => {
    switch (type) {
      case 'meeting': return <VideoIcon/>;
      case 'document': return <FileText className="w-4 h-4"/>;
      case 'email': return <Mail className="w-4 h-4"/>;
      case 'call': return <Phone className="w-4 h-4"/>;
      default: return <History className="w-4 h-4" />;
    }
  };

  const handleToggleExpand = (id) => {
    setExpandedEventId(prev => prev === id ? null : id);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeProjectOverview}
      ></div>
      
      <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-ui-card shadow-2xl border-l border-ui-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col transition-colors ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-ui-border bg-ui-sidebar flex justify-between items-start shrink-0 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <EditableField
                value={project.stage}
                type="select"
                options={stages.map(s => ({ id: s.id, label: s.label }))}
                onSave={(val) => handleFieldUpdate('stage', val)}
                className="inline-block"
                textClassName="px-2.5 py-1 bg-ui-accent/10 text-ui-accent text-[10px] uppercase font-bold tracking-wider rounded-md"
              />
              <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-colors ${project.status === 'overdue' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                {project.status === 'overdue' ? 'Stalled / Action Req.' : 'Active'}
              </span>
            </div>
            <EditableField
              value={project.company}
              onSave={(val) => handleFieldUpdate('company', val)}
              textClassName="text-2xl font-extrabold text-ui-text"
              label="Company Name"
            />
            <EditableField
              value={project.pipeline}
              onSave={(val) => handleFieldUpdate('pipeline', val)}
              textClassName="text-sm font-medium text-ui-text-muted mt-1"
              label="Pipeline Asset"
            />
          </div>
          <button onClick={closeProjectOverview} className="p-2 text-ui-text-muted hover:text-ui-text hover:bg-ui-hover rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-ui-card px-6 border-b border-ui-border shrink-0 transition-colors">
          {[
            { id: 'timeline', label: 'Timeline', icon: History },
            { id: 'details', label: 'Deep Dive', icon: Microscope },
            { id: 'documents', label: 'Docs', icon: FileText },
            { id: 'prep', label: 'AI Strategy', icon: BrainCircuit }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'prep' && !prepData) {
                  fetchPrep();
                }
              }}
              className={`flex items-center gap-2 px-3 py-4 text-[11px] font-bold transition-all border-b-2 -mb-[1px] whitespace-nowrap ${activeTab === tab.id ? 'border-ui-accent text-ui-accent' : 'border-transparent text-ui-text-muted hover:text-ui-text'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-6 bg-ui-bg transition-colors">
          
          {activeTab === 'timeline' && (
            <>
              <div className="mb-8">
                <h3 className="text-sm font-extrabold text-ui-text uppercase tracking-widest mb-5 flex items-center gap-2 transition-colors">
                  <Clock className="w-4 h-4 text-ui-accent" />
                  Future Milestones
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-ui-card p-4 rounded-xl border border-ui-border shadow-sm relative overflow-hidden ring-1 ring-ui-accent/10 hover:shadow-md transition-all cursor-pointer">
                    <div className="absolute top-0 left-0 w-1 h-full bg-ui-accent"></div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-sm text-ui-text line-clamp-1">{project.tasks && project.tasks.length > 0 ? project.tasks[0].desc : 'Determine Next Action'}</h4>
                      <span className="text-[10px] font-bold text-ui-accent bg-ui-accent/10 px-2 py-1 rounded">Next Step</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-ui-text-muted">
                      <div className="flex items-center gap-1.5 bg-ui-hover px-2 py-1 rounded">
                        <Calendar className="w-3.5 h-3.5" />
                        Target: 
                        <EditableField
                          value={project.nextFollowUp || ''}
                          type="date"
                          onSave={(val) => handleFieldUpdate('nextFollowUp', val)}
                          textClassName="font-bold text-ui-accent"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 bg-ui-hover px-2 py-1 rounded transition-colors">
                        <Users className="w-3.5 h-3.5" />
                        Responsibility: Deal Team
                      </div>
                    </div>
                  </div>

                  {project.tasks && project.tasks.slice(1).map((t, i) => (
                    <div key={i} className="bg-ui-card p-3.5 rounded-xl border border-ui-border shadow-sm relative pl-4 transition-colors">
                      <div className="absolute top-0 left-0 w-1 h-full bg-ui-text-muted opacity-20 rounded-l-xl"></div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-xs text-ui-text line-clamp-1">{t.desc}</h4>
                        <span className="text-[9px] font-bold text-ui-text-muted">{t.date}</span>
                      </div>
                      <span className="text-[10px] text-ui-text-muted font-medium uppercase">{t.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-ui-text uppercase tracking-widest mb-5 flex items-center gap-2">
                  <History className="w-4 h-4 text-ui-text-muted opacity-50" />
                  Historical Footprints
                </h3>
                
                <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-ui-border transition-colors">
                  <div className="relative pb-2">
                    <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-green-500 bg-ui-card shadow-[0_0_0_4px_theme(colors.ui.card)]"></div>
                    <span className="text-[9px] font-bold text-ui-text-muted uppercase tracking-widest">{project.lastContactDate || 'Recently'}</span>
                    <div className="mt-1 bg-ui-card p-3.5 rounded-xl border border-ui-border shadow-sm">
                      <h4 className="font-bold text-xs text-ui-text">Latest CRM Sync Entry</h4>
                      <p className="text-[11px] text-ui-text-muted mt-1 leading-relaxed">System tracked an update via AI Intake module.</p>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-4 text-xs font-bold text-ui-text-muted animate-pulse transition-colors">Loading Footprints...</div>
                  ) : historyData.length === 0 ? (
                    <div className="text-center py-4 text-xs font-medium text-ui-text-muted transition-colors">No footprints recorded yet.</div>
                  ) : historyData.map((item) => {
                    const isExpanded = expandedEventId === item.id;
                    return (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-[1.35rem] top-1 w-6 h-6 rounded-full bg-ui-hover flex items-center justify-center -translate-x-1.5 shadow-[0_0_0_4px_theme(colors.ui.card)] z-10 transition-colors">
                          {getIcon(item.type)}
                        </div>
                        <span className="text-[9px] font-bold text-ui-text-muted uppercase tracking-widest block mb-1">{item.date}</span>
                        
                        <div 
                          className={`bg-ui-card rounded-xl border ${isExpanded ? 'border-ui-accent shadow-md ring-1 ring-ui-accent/10' : 'border-ui-border shadow-sm hover:border-ui-text-muted/30'} transition-all cursor-pointer overflow-hidden`}
                          onClick={() => handleToggleExpand(item.id)}
                        >
                          <div className="p-3.5 flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-xs text-ui-text">{item.title}</h4>
                              <p className="text-[11px] text-ui-text-muted mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
                            </div>
                            <div className="text-ui-text-muted opacity-30 ml-3 shrink-0">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="bg-ui-bg border-t border-ui-border p-4 text-xs animate-in slide-in-from-top-2 fade-in duration-200 transition-colors">
                              {item.type === 'email' && (
                                <div className="space-y-3">
                                  <div className="bg-ui-card border border-ui-border rounded p-2 transition-colors">
                                    <div className="text-[10px] text-ui-text-muted mb-1"><span className="font-bold text-ui-text">From:</span> {item.details.from}</div>
                                    <div className="text-[10px] text-ui-text-muted mb-1"><span className="font-bold text-ui-text">To:</span> {item.details.to}</div>
                                    <div className="text-[10px] text-ui-text-muted"><span className="font-bold text-ui-text">Subject:</span> {item.details.subject}</div>
                                  </div>
                                  <div className="text-ui-text whitespace-pre-line leading-relaxed italic border-l-2 border-ui-accent/30 pl-3">
                                    {item.details.body}
                                  </div>
                                </div>
                              )}

                              {item.type === 'document' && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between bg-red-500/10 text-red-600 px-3 py-2 rounded border border-red-500/20 transition-colors">
                                    <span className="font-bold text-xs uppercase">Expiry Date</span>
                                    <span className="font-extrabold">{item.details.expiryDate}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="bg-ui-card p-2 rounded border border-ui-border transition-colors">
                                      <span className="text-ui-text-muted block mb-0.5">Document ID</span>
                                      <span className="font-bold text-ui-text">{item.details.docId}</span>
                                    </div>
                                    <div className="bg-ui-card p-2 rounded border border-ui-border transition-colors">
                                      <span className="text-ui-text-muted block mb-0.5">Legal Status</span>
                                      <span className="font-bold text-green-600">{item.details.status}</span>
                                    </div>
                                  </div>
                                  <a href={item.details.url || "#"} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 mt-2 py-1.5 bg-ui-accent hover:bg-ui-accent/90 text-white font-bold rounded shadow-sm transition-all cursor-pointer">
                                    <Download className="w-3.5 h-3.5" /> Download Original PDF
                                  </a>
                                </div>
                              )}

                              {(item.type === 'meeting' || item.type === 'call') && (
                                <div className="space-y-3">
                                  <div className="bg-ui-card p-2.5 rounded border border-ui-border transition-colors">
                                    <div className="flex items-center gap-1.5 text-ui-accent font-bold mb-1 border-b border-ui-border pb-1.5 transition-colors">
                                      <Users className="w-3.5 h-3.5" /> Attendees
                                    </div>
                                    <div className="text-[10px] text-ui-text-muted tracking-tight">{item.details.attendees}</div>
                                  </div>
                                  <div className="bg-ui-accent/10 p-2.5 rounded border border-ui-accent/20 transition-colors">
                                    <div className="font-bold text-ui-accent mb-1 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Key Takeaways
                                    </div>
                                    <div className="text-[11px] text-ui-text opacity-80 whitespace-pre-line leading-relaxed">
                                      {item.details.minutes}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="relative pt-2">
                    <div className="absolute -left-[1.35rem] top-3 w-2.5 h-2.5 rounded-full border-2 border-ui-border bg-ui-card transition-colors"></div>
                    <span className="text-[9px] font-bold text-ui-text-muted uppercase tracking-widest">Inception</span>
                    <p className="text-[11px] font-bold text-ui-text-muted mt-0.5 opacity-80">Project Created via DB Scan</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               {Object.entries(project.details || {}).length === 0 ? (
                 <div className="text-center py-20 bg-ui-card rounded-2xl border border-ui-border mt-8">
                    <Microscope className="w-12 h-12 text-ui-text-muted opacity-20 mx-auto mb-4" />
                    <p className="text-sm font-bold text-ui-text-muted">No deep intelligence extracted yet.</p>
                 </div>
               ) : (
                 Object.entries(project.details).map(([category, content]) => (
                   <div key={category} className="bg-ui-card rounded-2xl border border-ui-border overflow-hidden shadow-sm transition-colors">
                      <div className="bg-ui-sidebar px-4 py-3 border-b border-ui-border flex items-center justify-between transition-colors">
                         <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest">{category}</h4>
                         <span className="w-2 h-2 rounded-full bg-ui-accent"></span>
                      </div>
                      <div className="p-4">
                         {typeof content === 'object' && content !== null ? (
                           <div className="grid grid-cols-2 gap-4">
                              {Object.entries(content).map(([key, val]) => (
                                <div key={key}>
                                   <label className="text-[9px] font-bold text-ui-text-muted uppercase block mb-1">{key.replace(/_/g, ' ')}</label>
                                   <EditableField
                                     value={val || ''}
                                     onSave={(newVal) => handleFieldUpdate(`details.${category}.${key}`, newVal)}
                                     textClassName="text-xs font-bold text-ui-text"
                                   />
                                </div>
                              ))}
                           </div>
                         ) : (
                           <p className="text-xs text-ui-text-muted font-medium leading-relaxed whitespace-pre-line">{content}</p>
                         )}
                      </div>
                   </div>
                 ))
               )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               {attachments.length === 0 ? (
                 <div className="text-center py-20 bg-ui-card rounded-2xl border border-ui-border mt-8 transition-colors">
                    <FileText className="w-12 h-12 text-ui-text-muted opacity-20 mx-auto mb-4" />
                    <p className="text-sm font-bold text-ui-text-muted">No documents archived yet.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="bg-ui-card p-4 rounded-xl border border-ui-border hover:border-ui-accent hover:shadow-md transition-all group flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg transition-colors ${att.file_type === 'PDF' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-ui-accent/10 text-ui-accent'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-ui-text">{att.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-ui-accent uppercase px-1.5 py-0.5 bg-ui-accent/10 rounded">{att.category}</span>
                            <span className="text-[10px] text-ui-text-muted font-bold">{att.file_type} • {att.uploaded_at}</span>
                          </div>
                        </div>
                      </div>
                      <a href={att.url || '#'} className="p-2 text-ui-text-muted hover:text-ui-accent hover:bg-ui-accent/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
               )}
            </div>
          )}

          {activeTab === 'prep' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
              {isPrepLoading && !prepData ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-ui-accent animate-spin mb-4" />
                  <p className="text-sm font-bold text-ui-text">AI Strategist Sythesizing Context...</p>
                  <p className="text-[11px] text-ui-text-muted mt-2">Correlating history, contacts, and intelligence.</p>
                </div>
              ) : prepData ? (
                <>
                  {/* Executive Summary */}
                  <div className="bg-ui-accent/5 border border-ui-accent/20 rounded-2xl p-5 relative overflow-hidden transition-colors">
                    <Sparkles className="absolute top-4 right-4 w-5 h-5 text-ui-accent/30" />
                    <h4 className="text-[11px] font-black text-ui-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Target className="w-4 h-4" /> Executive BD Briefing
                    </h4>
                    <p className="text-xs text-ui-text leading-relaxed font-medium">
                      {prepData.executive_summary}
                    </p>
                  </div>

                  {/* Contact Profiling */}
                  {prepData.contact_profiling && (
                    <div className="bg-ui-card rounded-2xl border border-ui-border p-5 transition-colors">
                       <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-ui-accent" /> Contact Profiling
                       </h4>
                       <p className="text-xs text-ui-text-muted font-medium leading-relaxed">
                         {prepData.contact_profiling}
                       </p>
                    </div>
                  )}

                  {/* Product Catalyst Alignment */}
                  {prepData.product_catalyst_alignment && (
                    <div className="bg-ui-card rounded-2xl border border-ui-border p-5 transition-colors">
                       <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-ui-success" /> Product-Catalyst Alignment
                       </h4>
                       <p className="text-xs text-ui-text-muted font-medium leading-relaxed">
                         {prepData.product_catalyst_alignment}
                       </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                     {/* Strategic Levers */}
                     <div className="bg-ui-card rounded-2xl border border-ui-border p-5 transition-colors">
                        <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest mb-4 flex items-center gap-2">
                           <ShieldAlert className="w-4 h-4 text-ui-warning" /> Negotiation Levers
                        </h4>
                        <div className="text-xs text-ui-text-muted font-medium bg-ui-bg p-3 rounded-xl border border-ui-border/50 leading-relaxed italic">
                           {prepData.negotiation_levers}
                        </div>
                     </div>

                     {/* Suggested Agenda */}
                     <div className="bg-ui-card rounded-2xl border border-ui-border p-5 transition-colors">
                        <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest mb-4 flex items-center gap-2 text-ui-success">
                           <ListChecks className="w-4 h-4" /> Proposed Meeting Agenda
                        </h4>
                        <ul className="space-y-2">
                           {(prepData.suggested_agenda || []).map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-xs font-bold text-ui-text transition-colors">
                                <span className="w-5 h-5 rounded bg-ui-success/10 text-ui-success flex items-center justify-center text-[10px] shrink-0 border border-ui-success/20">{i+1}</span>
                                {item}
                             </li>
                           ))}
                        </ul>
                     </div>
                  </div>

                  {/* Q&A Cheat Sheet */}
                  <div className="bg-ui-sidebar rounded-2xl border border-ui-border p-5 transition-colors">
                     <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest mb-5 flex items-center gap-2 opacity-70">
                        <MessageSquareQuote className="w-4 h-4" /> Anticipated Q&A Cheat Sheet
                     </h4>
                     <div className="space-y-4">
                        {(prepData.cheat_sheet || []).map((qa, i) => (
                          <div key={i} className="bg-ui-card rounded-xl p-4 border border-ui-border shadow-sm transition-colors">
                             <p className="text-xs font-black text-ui-text mb-2 flex gap-2">
                                <span className="text-ui-accent uppercase tracking-tighter shrink-0">Q:</span>
                                {qa.question}
                             </p>
                             <div className="text-[11px] text-ui-text-muted font-medium pl-5 border-l-2 border-ui-accent/20">
                                {qa.suggested_response}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Strategist Chat */}
                  <div className="bg-ui-card rounded-2xl border border-ui-border overflow-hidden shadow-xl transition-colors">
                    <div className="bg-ui-sidebar p-4 border-b border-ui-border flex items-center gap-2 transition-colors">
                       <BrainCircuit className="w-4 h-4 text-ui-accent" />
                       <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest">Chat with Strategist</h4>
                    </div>
                    
                    <div className="h-[250px] overflow-y-auto p-4 space-y-4 bg-ui-bg/50 transition-colors">
                       {chatHistory.length === 0 && (
                         <div className="text-center py-10 opacity-30">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-[10px] font-bold">Ask anything about this project...</p>
                         </div>
                       )}
                       {chatHistory.map((msg, i) => (
                         <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[11px] font-medium transition-colors ${msg.role === 'user' ? 'bg-ui-accent text-white rounded-tr-none' : 'bg-ui-sidebar border border-ui-border text-ui-text rounded-tl-none shadow-sm'}`}>
                               {msg.content}
                            </div>
                         </div>
                       ))}
                       {isSending && (
                         <div className="flex justify-start">
                           <div className="bg-ui-sidebar border border-ui-border rounded-2xl rounded-tl-none px-3.5 py-2 transition-colors">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-ui-accent" />
                           </div>
                         </div>
                       )}
                       <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleChatSubmit} className="p-3 bg-ui-sidebar border-t border-ui-border flex gap-2 transition-colors">
                       <input 
                         type="text" 
                         value={chatMessage}
                         onChange={(e) => setChatMessage(e.target.value)}
                         placeholder="Deep dive suggestion..."
                         className="flex-1 bg-ui-card border border-ui-border rounded-xl px-4 py-2 text-xs text-ui-text placeholder:text-ui-text-muted focus:ring-1 focus:ring-ui-accent focus:outline-none transition-all"
                       />
                       <button 
                         type="submit"
                         disabled={isSending || !chatMessage.trim()}
                         className="p-2.5 bg-ui-accent text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                       >
                          <Send className="w-4 h-4" />
                       </button>
                    </form>
                  </div>

                  <button 
                    onClick={() => isAdmin && fetchPrep(true)}
                    disabled={isPrepLoading || !isAdmin}
                    className={`w-full py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-dashed border-ui-border rounded-xl ${!isAdmin ? 'opacity-50 cursor-not-allowed text-ui-text-muted' : 'text-ui-text-muted hover:text-ui-accent'}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {isAdmin ? `Analysed: ${prepData.updated_at || 'Recently'} • Refresh Strategic Analysis` : 'Read-Only Mode: Analysis Refresh Disabled'}
                  </button>
                </>
              ) : (
                <div className="text-center py-20 bg-ui-card rounded-2xl border border-ui-border mt-8 transition-colors">
                   <Target className="w-12 h-12 text-ui-text-muted opacity-20 mx-auto mb-4" />
                   <p className="text-sm font-bold text-ui-text-muted">Strategist awaits orders.</p>
                   <button 
                     onClick={() => isAdmin && fetchPrep()} 
                     disabled={!isAdmin}
                     className={`mt-4 px-6 py-2 bg-ui-accent text-white text-[10px] font-bold uppercase rounded-lg shadow-sm ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     {isAdmin ? 'Initialize Analysis' : 'Admin Required for Analysis'}
                   </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

// Simple fallback icon component
function VideoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
  );
}
