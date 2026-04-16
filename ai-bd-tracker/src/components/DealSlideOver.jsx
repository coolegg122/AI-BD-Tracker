import React, { useEffect, useState, useRef } from 'react';
import { 
  X, Calendar, MessageSquare, FileText, CheckCircle2, Clock, Mail, Phone, 
  Users, History, ChevronDown, ChevronUp, Link, Download, Microscope, 
  Target, BrainCircuit, Sparkles, Send, ShieldAlert, ListChecks, 
  MessageSquareQuote, Loader2, Layers, Gavel, DollarSign, Globe, ExternalLink, Plus,
  TrendingUp, AlertTriangle, ShieldCheck, Video
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EditableField from './EditableField';

export default function DealSlideOver() {
  const { 
    selectedOverviewDeal, closeDealOverview, stages, 
    updateDealEconomics, addDealAgreement, updateDealAgreement, updateDealDueDiligence,
    updateDeal, users: storeUsers
  } = useStore();
  const { isAdmin } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, economics, legal, details, documents, prep
  const [prepData, setPrepData] = useState(null);
  const [isPrepLoading, setIsPrepLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState([]);
  const chatEndRef = useRef(null);

  // For New Agreement Modal/Inline
  const [showAddAgreement, setShowAddAgreement] = useState(false);
  const [newAgreement, setNewAgreement] = useState({ agreement_type: 'NDA', status: 'In Review' });

  useEffect(() => {
    if (selectedOverviewDeal) {
      setTimeout(() => setIsVisible(true), 10);
      setExpandedEventId(null); 
      // Keep active tab if it's one of the valid ones
      if (!['timeline', 'economics', 'legal', 'details', 'documents', 'prep'].includes(activeTab)) {
        setActiveTab('timeline');
      }
      setPrepData(null);
      setChatHistory([]);
      setChatMessage('');
      fetchHistory(selectedOverviewDeal.id);
      fetchAttachments(selectedOverviewDeal.id);
      if (isAdmin) fetchUsers();
    } else {
      setIsVisible(false);
      setHistoryData([]);
    }
  }, [selectedOverviewDeal]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const fetchHistory = async (dealId) => {
    setIsLoading(true);
    try {
      const data = await api.getDealHistory(dealId);
      setHistoryData(data);
    } catch (err) {
      console.error("Failed to load deal history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load user list:", err);
    }
  };

  const fetchAttachments = async (dealId) => {
    try {
      const data = await api.getDealAttachments(dealId);
      setAttachments(data);
    } catch (err) {
      console.error("Failed to load attachments:", err);
      setAttachments([]);
    }
  };

  const fetchPrep = async (force = false) => {
    if (!selectedOverviewDeal) return;
    setIsPrepLoading(true);
    try {
      const data = await api.getNegotiationPrep(selectedOverviewDeal.id, force);
      setPrepData(data);
    } catch (err) {
      console.error("Failed to load prep:", err);
    } finally {
      setIsPrepLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isSending || !selectedOverviewDeal) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsSending(true);

    try {
      const res = await api.sendStrategistMessage(selectedOverviewDeal.id, chatMessage, chatHistory);
      setChatHistory(prev => [...prev, { role: 'ai', content: res.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I lost my train of thought. Error connecting to strategist." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFieldUpdate = async (field, newValue) => {
    if (!selectedOverviewDeal) return;
    try {
      let updateData = { [field]: newValue };
      
      if (field.startsWith('details.')) {
        const parts = field.split('.');
        const category = parts[1];
        const key = parts[2];
        const currentDetails = { ...(selectedOverviewDeal.details || {}) };
        const categoryData = { ...(currentDetails[category] || {}) };
        categoryData[key] = newValue;
        currentDetails[category] = categoryData;
        updateData = { details: currentDetails };
      }

      await api.updateDeal(selectedOverviewDeal.id, updateData);
      updateDeal(selectedOverviewDeal.id, updateData);
    } catch (err) {
      console.error(`Failed to update deal field ${field}:`, err);
      throw err;
    }
  };

  // Phase 2 Specific Handlers
  const handleEconomicsUpdate = async (field, value) => {
    try {
      const updated = await api.updateDealEconomics(selectedOverviewDeal.id, { [field]: value });
      updateDealEconomics(selectedOverviewDeal.id, updated);
    } catch (err) {
      console.error("Failed to update economics:", err);
    }
  };

  const handleAddAgreement = async () => {
    try {
      const added = await api.addDealAgreement(selectedOverviewDeal.id, newAgreement);
      addDealAgreement(selectedOverviewDeal.id, added);
      setShowAddAgreement(false);
      setNewAgreement({ agreement_type: 'NDA', status: 'In Review' });
    } catch (err) {
      console.error("Failed to add agreement:", err);
    }
  };

  const handleAgreementUpdate = async (agreementId, field, value) => {
    try {
      const updated = await api.updateDealAgreement(selectedOverviewDeal.id, agreementId, { [field]: value });
      updateDealAgreement(selectedOverviewDeal.id, agreementId, updated);
    } catch (err) {
      console.error("Failed to update agreement:", err);
    }
  };

  const handleDDUpdate = async (field, value) => {
    try {
      const updated = await api.updateDealDueDiligence(selectedOverviewDeal.id, { [field]: value });
      updateDealDueDiligence(selectedOverviewDeal.id, updated);
    } catch (err) {
      console.error("Failed to update due diligence:", err);
    }
  };

  if (!selectedOverviewDeal && !isVisible) return null;

  const deal = selectedOverviewDeal || {};

  const getIcon = (type) => {
    switch (type) {
      case 'meeting': return <Video className="w-4 h-4"/>;
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
        onClick={closeDealOverview}
      ></div>
      
      <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-ui-card shadow-2xl border-l border-ui-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col transition-colors ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-ui-border bg-ui-sidebar flex justify-between items-start shrink-0 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <EditableField
                value={deal.stage}
                type="select"
                options={stages.map(s => ({ id: s.id, label: s.label }))}
                onSave={(val) => handleFieldUpdate('stage', val)}
                className="inline-block"
                textClassName="px-2.5 py-1 bg-ui-accent/10 text-ui-accent text-[10px] uppercase font-bold tracking-wider rounded-md"
              />
              <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-colors ${deal.status === 'overdue' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                {deal.status === 'overdue' ? 'Stalled / Action Req.' : 'Active'}
              </span>
              {deal.due_diligence?.status && (
                <span className="px-2 py-1 bg-amber-500/10 text-amber-600 text-[10px] uppercase font-bold rounded-md">
                   DD: {deal.due_diligence.status}
                </span>
              )}
            </div>
            <EditableField
              value={deal.company}
              onSave={(val) => handleFieldUpdate('company', val)}
              textClassName="text-2xl font-extrabold text-ui-text"
              label="Company Name"
            />
            <div className="flex items-center gap-3 mt-1">
              <EditableField
                value={deal.pipeline}
                onSave={(val) => handleFieldUpdate('pipeline', val)}
                textClassName="text-sm font-medium text-ui-text-muted"
                label="Engagement Focus"
              />
              {deal.economics?.total_deal_value && (
                <span className="text-xs font-black text-ui-accent bg-ui-accent/5 px-2 py-0.5 rounded border border-ui-accent/10 whitespace-nowrap">
                   {deal.economics.currency || '$'}{deal.economics.total_deal_value}
                </span>
              )}
            </div>
          </div>
          <button onClick={closeDealOverview} className="p-2 text-ui-text-muted hover:text-ui-text hover:bg-ui-hover rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-ui-card px-4 border-b border-ui-border shrink-0 transition-colors overflow-x-auto no-scrollbar">
          {[
            { id: 'timeline', label: 'Timeline', icon: History },
            { id: 'economics', label: 'Economics', icon: DollarSign },
            { id: 'legal', label: 'Legal & DD', icon: Gavel },
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
                       <h4 className="font-bold text-sm text-ui-text line-clamp-1">{deal.tasks && deal.tasks.length > 0 ? deal.tasks[0].desc : 'Determine Next Action'}</h4>
                       <span className="text-[10px] font-bold text-ui-accent bg-ui-accent/10 px-2 py-1 rounded">Next Step</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-ui-text-muted">
                      <div className="flex items-center gap-1.5 bg-ui-hover px-2 py-1 rounded">
                        <Calendar className="w-3.5 h-3.5" />
                        Target: 
                        <EditableField
                          value={deal.nextFollowUp || ''}
                          type="date"
                          onSave={(val) => handleFieldUpdate('nextFollowUp', val)}
                          textClassName="font-bold text-ui-accent"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 bg-ui-hover px-2 py-1 rounded transition-colors">
                        <Users className="w-3.5 h-3.5" />
                        Responsibility: 
                        <EditableField
                          value={deal.owner?.id || ''}
                          type="select"
                          options={users.map(u => ({ id: u.id, label: u.name }))}
                          onSave={(val) => handleFieldUpdate('owner_id', val ? parseInt(val) : null)}
                          textClassName="font-bold text-ui-text"
                          label="Deal Lead"
                          placeholder="Deal Team"
                        />
                      </div>
                    </div>
                  </div>

                  {deal.tasks && deal.tasks.slice(1).map((t, i) => (
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
                  Engagement History
                </h3>
                
                <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-ui-border transition-colors">
                  <div className="relative pb-2">
                    <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-green-500 bg-ui-card shadow-[0_0_0_4px_theme(colors.ui.card)]"></div>
                    <span className="text-[9px] font-bold text-ui-text-muted uppercase tracking-widest">{deal.lastContactDate || 'Recently'}</span>
                    <div className="mt-1 bg-ui-card p-3.5 rounded-xl border border-ui-border shadow-sm">
                      <h4 className="font-bold text-xs text-ui-text">Latest Intelligence Intake</h4>
                      <p className="text-[11px] text-ui-text-muted mt-1 leading-relaxed">System tracked an update via AI analysis engine.</p>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-4 text-xs font-bold text-ui-text-muted animate-pulse transition-colors">Loading History...</div>
                  ) : historyData.length === 0 ? (
                    <div className="text-center py-4 text-xs font-medium text-ui-text-muted transition-colors">No engagement history recorded yet.</div>
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
                                    <div className="flex items-center gap-1.5 text-ui-accent font-bold mb-2 border-b border-ui-border pb-1.5 transition-colors">
                                      <Users className="w-3.5 h-3.5" /> Attendees
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {Array.isArray(item.details.attendees) ? (
                                        item.details.attendees.map((attendee, idx) => {
                                          const matchedContact = typeof attendee === 'object' 
                                            ? (storeUsers || []).find(c => 
                                                c.name.toLowerCase() === attendee.name?.toLowerCase() ||
                                                (attendee.name && c.name.toLowerCase().includes(attendee.name.toLowerCase()))
                                              )
                                            : null;

                                          if (matchedContact) {
                                            return (
                                              <div 
                                                key={idx} 
                                                className="flex items-center gap-2 p-1 pr-3 bg-ui-bg rounded-lg border border-ui-border shadow-sm group/contact transition-all hover:border-ui-accent/30"
                                              >
                                                <img 
                                                   src={matchedContact.photoUrl} 
                                                  className="w-6 h-6 rounded-md object-cover grayscale group-hover/contact:grayscale-0 transition-all" 
                                                  alt="" 
                                                />
                                                <div className="min-w-0">
                                                  <div className="text-[10px] font-bold text-ui-text truncate">{matchedContact.name}</div>
                                                  <div className="text-[8px] font-medium text-ui-text-muted truncate uppercase tracking-tighter">
                                                    {matchedContact.currentTitle} • {matchedContact.functionArea}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }

                                          return (
                                            <div key={idx} className="px-2 py-1 bg-ui-bg rounded-md border border-ui-border text-[9px] font-bold text-ui-text-muted transition-colors">
                                              {typeof attendee === 'object' ? `${attendee.name}${attendee.title ? ` (${attendee.title})` : ''}` : attendee}
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <div className="text-[10px] text-ui-text-muted tracking-tight">{item.details.attendees}</div>
                                      )}
                                    </div>
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
                    <p className="text-[11px] font-bold text-ui-text-muted mt-0.5 opacity-80">Deal Created via Smart Intake</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'economics' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-ui-card p-5 rounded-2xl border border-ui-border shadow-sm">
                     <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
                           <DollarSign className="w-4 h-4" />
                        </div>
                        <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest leading-none">Valuation</h4>
                     </div>
                     <div className="space-y-4">
                        <div>
                           <label className="text-[9px] font-bold text-ui-text-muted uppercase block mb-1">Upfront Payment</label>
                           <EditableField
                              value={deal.economics?.upfront || '0'}
                              onSave={(val) => handleEconomicsUpdate('upfront', val)}
                              textClassName="text-lg font-black text-ui-text"
                           />
                        </div>
                        <div>
                           <label className="text-[9px] font-bold text-ui-text-muted uppercase block mb-1">Royalties (%)</label>
                           <EditableField
                              value={deal.economics?.royalties || 'N/A'}
                              onSave={(val) => handleEconomicsUpdate('royalties', val)}
                              textClassName="text-sm font-bold text-ui-text"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="bg-ui-card p-5 rounded-2xl border border-ui-border shadow-sm">
                     <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-ui-accent/10 rounded-lg text-ui-accent">
                           <TrendingUp className="w-4 h-4" />
                        </div>
                        <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest leading-none">Success Odds</h4>
                     </div>
                     <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)]">
                        <div className="relative w-24 h-24 mb-3">
                           <svg className="w-full h-full transform -rotate-90">
                              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-ui-border"/>
                              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - (deal.economics?.pos || 0) / 100)} className="text-ui-accent transition-all duration-1000"/>
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-xl font-black text-ui-text">{deal.economics?.pos || 0}%</span>
                              <span className="text-[8px] font-bold text-ui-text-muted uppercase">POS</span>
                           </div>
                        </div>
                        <EditableField
                           value={deal.economics?.pos || 0}
                           type="number"
                           onSave={(val) => handleEconomicsUpdate('pos', parseInt(val))}
                           textClassName="text-[10px] font-bold text-ui-accent hover:underline"
                           placeholder="Edit POS"
                        />
                     </div>
                  </div>
               </div>

               <div className="bg-ui-card rounded-2xl border border-ui-border overflow-hidden shadow-sm">
                  <div className="bg-ui-sidebar px-4 py-3 border-b border-ui-border flex items-center justify-between">
                     <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest">Milestone Structure</h4>
                     <label className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-ui-text-muted uppercase">Currency:</span>
                        <EditableField
                           value={deal.economics?.currency || 'USD'}
                           onSave={(val) => handleEconomicsUpdate('currency', val)}
                           textClassName="text-[10px] font-black text-ui-accent"
                        />
                     </label>
                  </div>
                  <div className="p-5">
                     <label className="text-[9px] font-bold text-ui-text-muted uppercase block mb-2">Milestones Details</label>
                     <EditableField
                        value={deal.economics?.milestones || ''}
                        type="textarea"
                        onSave={(val) => handleEconomicsUpdate('milestones', val)}
                        textClassName="text-xs text-ui-text font-medium leading-relaxed whitespace-pre-line block min-h-[100px]"
                        placeholder="Define milestones (Development, Regulatory, Sales targets)..."
                     />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               {/* Agreements Tracking */}
               <div className="bg-ui-card rounded-2xl border border-ui-border overflow-hidden shadow-sm">
                  <div className="bg-ui-sidebar px-4 py-3 border-b border-ui-border flex items-center justify-between">
                     <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> Legal Agreements
                     </h4>
                     <button 
                        onClick={() => setShowAddAgreement(true)}
                        className="p-1 text-ui-accent hover:bg-ui-accent/10 rounded-lg transition-all"
                     >
                        <Plus className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="p-4 space-y-3">
                     {deal.agreements && deal.agreements.length > 0 ? (
                        deal.agreements.map((ag) => (
                           <div key={ag.id} className="p-4 bg-ui-bg rounded-xl border border-ui-border hover:border-ui-accent/30 transition-all flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-lg ${ag.status === 'Signed' ? 'bg-green-500/10 text-green-600' : 'bg-ui-accent/10 text-ui-accent'}`}>
                                    <Gavel className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <div className="text-xs font-bold text-ui-text">{ag.agreement_type}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${ag.status === 'Signed' ? 'bg-green-500/10 text-green-600' : 'bg-ui-accent/10 text-ui-accent'}`}>
                                          {ag.status}
                                       </span>
                                       {ag.effective_date && (
                                          <span className="text-[9px] text-ui-text-muted font-bold tracking-tight">Eff: {ag.effective_date}</span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <EditableField
                                    value={ag.status}
                                    type="select"
                                    options={[
                                       { id: 'In Review', label: 'In Review' },
                                       { id: 'Negotiating', label: 'Negotiating' },
                                       { id: 'Signed', label: 'Signed' },
                                       { id: 'Expired', label: 'Expired' }
                                    ]}
                                    onSave={(val) => handleAgreementUpdate(ag.id, 'status', val)}
                                    textClassName="text-[10px] font-black text-ui-text-muted hover:text-ui-accent"
                                 />
                              </div>
                           </div>
                        ))
                     ) : (
                        <p className="text-[11px] text-ui-text-muted font-medium italic text-center py-4">No legal tracks established.</p>
                     )}

                     {showAddAgreement && (
                        <div className="p-4 bg-ui-sidebar rounded-xl border border-ui-accent/30 animate-in slide-in-from-top-2">
                           <div className="grid grid-cols-2 gap-3 mb-4">
                              <div>
                                 <label className="text-[8px] font-bold text-ui-text-muted uppercase mb-1 block">Type</label>
                                 <select 
                                    className="w-full bg-ui-card border border-ui-border rounded px-2 py-1.5 text-xs text-ui-text"
                                    value={newAgreement.agreement_type}
                                    onChange={(e) => setNewAgreement({...newAgreement, agreement_type: e.target.value})}
                                 >
                                    <option value="NDA">NDA</option>
                                    <option value="CDA">CDA</option>
                                    <option value="Term Sheet">Term Sheet</option>
                                    <option value="Definitive Agreement">Definitive Agreement</option>
                                    <option value="Amendment">Amendment</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="text-[8px] font-bold text-ui-text-muted uppercase mb-1 block">Status</label>
                                 <select 
                                    className="w-full bg-ui-card border border-ui-border rounded px-2 py-1.5 text-xs text-ui-text"
                                    value={newAgreement.status}
                                    onChange={(e) => setNewAgreement({...newAgreement, status: e.target.value})}
                                 >
                                    <option value="In Review">In Review</option>
                                    <option value="Negotiating">Negotiating</option>
                                    <option value="Signed">Signed</option>
                                 </select>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={handleAddAgreement} className="flex-1 py-1.5 bg-ui-accent text-white text-[10px] font-black uppercase rounded shadow-sm">Save Agreement</button>
                              <button onClick={() => setShowAddAgreement(false)} className="px-3 py-1.5 border border-ui-border text-ui-text-muted text-[10px] font-bold uppercase rounded">Cancel</button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Due Diligence Tracker */}
               <div className="bg-ui-card rounded-2xl border border-ui-border overflow-hidden shadow-sm">
                  <div className="bg-ui-sidebar px-4 py-3 border-b border-ui-border flex items-center justify-between">
                     <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest flex items-center gap-2">
                        <Microscope className="w-3.5 h-3.5" /> Due Diligence Status
                     </h4>
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${deal.due_diligence?.status === 'Clean' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {deal.due_diligence?.status || 'Pending'}
                     </span>
                  </div>
                  <div className="p-5 space-y-5">
                     <div className="flex items-center justify-between p-3 bg-ui-accent/5 rounded-xl border border-ui-accent/10">
                        <div className="flex items-center gap-3">
                           <Globe className="w-4 h-4 text-ui-accent" />
                           <div className="text-[11px] font-bold text-ui-text">Virtual Data Room (VDR)</div>
                        </div>
                        {deal.due_diligence?.vdr_link ? (
                           <a href={deal.due_diligence.vdr_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-black text-ui-accent hover:underline">
                              Access VDR <ExternalLink className="w-3 h-3" />
                           </a>
                        ) : (
                           <EditableField
                              value=""
                              onSave={(val) => handleDDUpdate('vdr_link', val)}
                              textClassName="text-[10px] font-bold text-ui-text-muted italic"
                              placeholder="Insert VDR Link"
                           />
                        )}
                     </div>

                     <div>
                        <div className="flex items-center gap-2 mb-3">
                           <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                           <h5 className="text-[10px] font-black text-ui-text uppercase tracking-widest">Key Risk Assessment</h5>
                        </div>
                        <div className="bg-ui-bg p-4 rounded-xl border border-ui-border min-h-[80px]">
                           <EditableField
                              value={deal.due_diligence?.key_risks ? JSON.stringify(deal.due_diligence.key_risks, null, 2) : ''}
                              type="textarea"
                              onSave={(val) => {
                                 try {
                                    handleDDUpdate('key_risks', JSON.parse(val));
                                 } catch(e) {
                                    handleDDUpdate('key_risks', [{ note: val }]);
                                 }
                              }}
                              textClassName="text-[11px] text-ui-text font-medium leading-relaxed whitespace-pre-line block"
                              placeholder="Describe critical risks found during DD..."
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               
               {/* NEW: Associated Assets Section */}
               <div className="bg-ui-card rounded-2xl border border-ui-border overflow-hidden shadow-sm transition-colors mb-6">
                  <div className="bg-ui-accent/5 px-4 py-3 border-b border-ui-border flex items-center justify-between transition-colors">
                     <h4 className="text-[11px] font-black text-ui-accent uppercase tracking-widest flex items-center gap-2">
                       <Layers className="w-3.5 h-3.5" /> Key Interfacing Assets
                     </h4>
                  </div>
                  <div className="p-4">
                     {deal.assets && deal.assets.length > 0 ? (
                       <div className="space-y-3">
                         {deal.assets.map(asset => (
                           <div key={asset.id} className="flex items-center justify-between p-3 bg-ui-bg rounded-xl border border-ui-border hover:border-ui-accent/30 transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-ui-accent/10 text-ui-accent flex items-center justify-center font-bold text-[10px]">
                                   {asset.code || 'AS'}
                                </div>
                                <div>
                                   <div className="text-xs font-bold text-ui-text">{asset.name}</div>
                                   <div className="text-[10px] text-ui-text-muted uppercase tracking-tighter">{asset.category}</div>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold text-ui-text-muted opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black">Active</span>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <p className="text-[11px] text-ui-text-muted font-medium italic">No assets linked to this engagement yet.</p>
                     )}
                  </div>
               </div>

               {Object.entries(deal.details || {}).length === 0 ? (
                 <div className="text-center py-20 bg-ui-card rounded-2xl border border-ui-border mt-8">
                    <Microscope className="w-12 h-12 text-ui-text-muted opacity-20 mx-auto mb-4" />
                    <p className="text-sm font-bold text-ui-text-muted">No deep intelligence extracted yet.</p>
                 </div>
               ) : (
                 Object.entries(deal.details).map(([category, content]) => (
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
                       <Target className="w-4 h-4" /> Executive Briefing
                    </h4>
                    <p className="text-xs text-ui-text leading-relaxed font-medium">
                      {prepData.executive_summary}
                    </p>
                  </div>

                  {/* Contact Profiling */}
                  {prepData.contact_profiling && (
                    <div className="bg-ui-card rounded-2xl border border-ui-border p-5 transition-colors">
                       <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-ui-accent" /> Contact Intelligence
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
                          <Sparkles className="w-4 h-4 text-ui-success" /> Asset Synergy Alignment
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
                           <ShieldAlert className="w-4 h-4 text-ui-warning" /> Strategic Levers
                        </h4>
                        <div className="text-xs text-ui-text-muted font-medium bg-ui-bg p-3 rounded-xl border border-ui-border/50 leading-relaxed italic">
                           {prepData.negotiation_levers}
                        </div>
                     </div>

                     {/* Suggested Agenda */}
                     <div className="bg-ui-card rounded-2xl border border-ui-border p-5 transition-colors">
                        <h4 className="text-[11px] font-black text-ui-text uppercase tracking-widest mb-4 flex items-center gap-2 text-ui-success">
                           <ListChecks className="w-4 h-4" /> Proposed Session Agenda
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
                            <p className="text-[10px] font-bold">Ask anything about this deal...</p>
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
                         placeholder="Strategic inquiry..."
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
                    {isAdmin ? `Analysed: ${prepData.updated_at || 'Recently'} • Refresh Strategy` : 'Read-Only Mode: Strategic Refresh Disabled'}
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
