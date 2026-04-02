import React, { useState, useEffect } from 'react';
import { FileText, Wand2, Microscope, UserPlus, MessageSquare, Check, X, AlertCircle, ChevronDown, Inbox, Trash2, Paperclip, Mail, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SmartInput() {
  const { projects, addProject } = useStore();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'inbox'
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  
  // Pending Inbox State
  const [pendingIngestions, setPendingIngestions] = useState([]);
  const [activeIngestionId, setActiveIngestionId] = useState(null);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Local state for editing the result before saving
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchPendingInbox();
  }, []);

  const fetchPendingInbox = async () => {
    setIsLoadingInbox(true);
    try {
      const data = await api.getPendingIngestions();
      setPendingIngestions(data);
    } catch (error) {
      console.error("Failed to fetch inbox:", error);
    }
    setIsLoadingInbox(false);
  };

  const handleSyncMail = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await api.syncIngestion();
      setSyncResult(result);
      // Refresh the list after sync
      await fetchPendingInbox();
    } catch (error) {
      setSyncResult({ error: error.message });
    }
    setIsSyncing(false);
  };

  const handleAIParse = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setParsedResult(null);
    setEditData(null);
    setActiveIngestionId(null);

    try {
      // Phase 33: Universal extraction (Mixed Project/Contact/History)
      const data = await api.extractUniversal(inputText);
      // Backend returns { status, results, raw_ai_output }
      setParsedResult(data.raw_ai_output);
      setEditData(data.raw_ai_output);
    } catch (error) {
      console.error("AI Parse failed:", error);
      alert(`AI extraction failed:\n${error.message || "Unknown error"}`);
    }
    setIsAnalyzing(false);
  };

  const handleReviewInboxItem = (item) => {
    setActiveTab('manual');
    setParsedResult(item.ai_extracted_payload);
    setEditData(item.ai_extracted_payload);
    setActiveIngestionId(item.id);
    setInputText(item.raw_content);
    
    // Auto-scroll to review form
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleDeleteIngestion = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Discard this item?")) return;
    try {
      await api.deleteIngestion(id);
      setPendingIngestions(prev => prev.filter(item => item.id !== id));
      if (activeIngestionId === id) {
        setParsedResult(null);
        setEditData(null);
        setActiveIngestionId(null);
      }
    } catch (error) {
      alert("Discard failed");
    }
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      // Re-trigger global sync with potentially edited data (though current UI edits are read-only-ish for now)
      await api.extractUniversal(inputText); 
      showMessage('success', '全站同步成功: Project, Contacts, and History updated!');

      if (activeIngestionId) {
        try {
          await api.processIngestion(activeIngestionId);
        } catch (processErr) {
          console.warn("Could not mark ingestion as processed:", processErr.message);
        }
        setPendingIngestions(prev => prev.filter(item => item.id !== activeIngestionId));
        setActiveIngestionId(null);
      }

      // Reset after success
      setParsedResult(null);
      setEditData(null);
      setInputText('');
    } catch (error) {
      console.error("Save failed:", error);
      showMessage('error', `Save failed: ${error.message}`);
    }
    setIsSaving(false);
  };

  const fillTestData = () => {
    setInputText("Minutes from Pfizer meeting (Oct 12). \n\nMet with Dr. Emily Watson (Chief Medical Officer) and Dr. Thomas Wayne (BD Lead). \n\nDiscussed Project Helios. Pfizer wants to proceed to Phase II diligence regarding the ADC asset. Emily mentioned she previously worked at Novartis for 8 years and Roche for 3 years.");
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      {message.text && (
        <div className={`fixed top-20 right-8 z-50 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-right-4 border shadow-xl transition-colors ${
          message.type === 'success' 
            ? 'bg-ui-success/10 text-ui-success border-ui-success/20 backdrop-blur-md' 
            : 'bg-ui-error/10 text-ui-error border-ui-error/20 backdrop-blur-md'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ui-text mb-2">Smart Input</h2>
            <p className="text-ui-text-muted max-w-xl text-sm leading-relaxed">Multi-entity extraction engine. Paste raw transcripts or notes and let AI structure your BD intelligence.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-ui-hover p-1 rounded-xl border border-ui-border transition-colors">
            <button 
                onClick={() => setActiveTab('manual')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-ui-card text-ui-accent shadow-sm' : 'text-ui-text-muted hover:text-ui-text'}`}
            >
                <FileText className="w-4 h-4" />
                Manual Extract
            </button>
            <button 
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'inbox' ? 'bg-ui-card text-ui-accent shadow-sm' : 'text-ui-text-muted hover:text-ui-text'}`}
            >
                <Inbox className="w-4 h-4" />
                AI Inbox
                {pendingIngestions.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-bounce-slow shadow-sm">
                        {pendingIngestions.length}
                    </span>
                )}
            </button>
        </div>
      </div>

      {activeTab === 'manual' ? (
        <section className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-ui-accent/20 to-transparent rounded-2xl blur opacity-40 transition duration-1000"></div>
            <div className="relative bg-ui-input rounded-xl shadow-sm overflow-hidden border border-ui-input-border transition-colors">
              <div className="flex items-center justify-between px-6 py-4 bg-ui-sidebar border-b border-ui-border transition-colors">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-ui-accent" />
                  <span className="text-xs font-bold uppercase tracking-wider text-ui-accent">Mixed Intelligence Input</span>
                </div>
                <button 
                  onClick={fillTestData} 
                  className="text-[10px] font-bold text-ui-accent hover:bg-ui-accent/10 px-2 py-1 rounded transition-colors"
                >
                  Fill Mixed Sample
                </button>
              </div>
              <textarea 
                className="w-full h-48 p-6 bg-transparent border-none focus:ring-0 text-ui-text resize-none placeholder:text-ui-text-muted/50 leading-relaxed focus:outline-none transition-colors" 
                placeholder="Paste an email, call transcript, or meeting minutes containing projects and contacts..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleAIParse}
              disabled={isAnalyzing || !inputText.trim() || !isAdmin}
              className="flex flex-col items-center gap-2"
            >
              <div className={`flex items-center gap-2 bg-ui-accent text-white px-10 py-3.5 rounded-full font-bold hover:opacity-90 transition-all ${(!isAdmin || isAnalyzing || !inputText.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Wand2 className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'AI Guessing...' : 'AI Extract & Review'}</span>
              </div>
              {!isAdmin && <span className="text-[10px] text-ui-text-muted font-bold mt-1 uppercase tracking-tighter">Admin Privileges Required to Extract</span>}
            </button>
          </div>
        </section>
      ) : (
        <section className="animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-bold text-ui-text-muted uppercase tracking-widest">
              {pendingIngestions.length} Pending Records
            </span>
            <div className="flex items-center gap-3">
              <button onClick={fetchPendingInbox} className="text-xs font-bold text-ui-text-muted hover:text-ui-text transition-colors">Refresh</button>
              <button
                onClick={handleSyncMail}
                disabled={isSyncing || !isAdmin}
                className={`flex items-center gap-1.5 bg-ui-accent text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:opacity-90 transition-all ${(isSyncing || !isAdmin) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Mail className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Zoho Mail'}
              </button>
            </div>
          </div>

          {syncResult && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${syncResult.error ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}>
              {syncResult.error ? <X className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              {syncResult.error || syncResult.message}
            </div>
          )}

          {isLoadingInbox ? (
            <div className="bg-ui-card rounded-2xl border border-ui-border p-20 flex flex-col items-center justify-center text-ui-text-muted transition-colors">
              <div className="w-12 h-12 border-4 border-ui-border border-t-ui-accent rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Loading Inbox...</p>
            </div>
          ) : pendingIngestions.length === 0 ? (
            <div className="bg-ui-bg rounded-2xl border-2 border-dashed border-ui-border p-20 flex flex-col items-center justify-center text-ui-text-muted transition-colors">
              <Inbox className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">No items awaiting review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingIngestions.map(item => (
                <div key={item.id} className="bg-ui-card rounded-xl border border-ui-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-ui-accent/50 transition-colors group shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-ui-accent/10 p-3 rounded-xl transition-colors">
                      {item.source_type === 'email' ? <Mail className="w-6 h-6 text-ui-accent" /> : <Wand2 className="w-6 h-6 text-ui-accent" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-ui-accent/10 text-ui-accent transition-colors">{item.entity_type || 'Mixed'}</span>
                        <span className="text-xs text-ui-text-muted font-medium transition-colors">{item.created_at}</span>
                      </div>
                      <h4 className="font-bold text-ui-text mb-1 transition-colors">{item.subject || 'Automated Catch-all'}</h4>
                      <p className="text-xs text-ui-text-muted line-clamp-1 mb-2 transition-colors">From: <span className="font-bold text-ui-text">{item.sender_email}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      disabled={!isAdmin}
                      onClick={(e) => handleDeleteIngestion(item.id, e)}
                      className={`p-2.5 text-ui-text-muted rounded-lg transition-all ${!isAdmin ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReviewInboxItem(item)}
                      className="bg-ui-accent text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      Review
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* UNIFIED REVIEW & CONFIRM SECTION (Phase 33) */}
      {parsedResult && editData && (
        <section className="mt-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-ui-accent/10 p-2 rounded-full transition-colors"><Wand2 className="w-4 h-4 text-ui-accent" /></div>
                <div>
                    <h3 className="text-lg font-bold text-ui-text">Intelligence Extraction Preview</h3>
                    <p className="text-xs text-ui-text-muted font-medium italic">Universal AI has mapped your input to the following modules.</p>
                 </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => { setParsedResult(null); setActiveIngestionId(null); }} className="p-2 text-ui-text-muted hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="bg-ui-card rounded-2xl border-2 border-ui-accent/20 shadow-xl shadow-ui-accent/5 p-8 relative overflow-hidden transition-colors">
            {activeIngestionId && (
                <div className="mb-8 p-4 bg-ui-accent/5 border border-ui-accent/10 rounded-xl flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-ui-accent" />
                        <span className="text-xs font-bold text-ui-accent uppercase tracking-tight">Processing Inbox Item #{activeIngestionId}</span>
                    </div>
                </div>
            )}
            
            <div className="space-y-10">
                {/* 1. Project Section */}
                {editData.update_project && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <Microscope className="w-4 h-4 text-ui-accent" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-ui-text-muted">Target Project Update</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-ui-sidebar p-5 rounded-xl border border-ui-border transition-colors">
                            <div>
                                <label className="text-[9px] font-bold text-ui-text-muted uppercase block mb-1">Company</label>
                                <p className="text-sm font-black text-ui-text">{editData.update_project.company || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-ui-text-muted uppercase block mb-1">Pipeline Asset</label>
                                <p className="text-sm font-bold text-ui-accent">{editData.update_project.pipeline || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-ui-text-muted uppercase block mb-1">Current Stage</label>
                                <span className="text-[10px] bg-ui-accent/10 text-ui-accent px-2 py-0.5 rounded-full font-bold">{editData.update_project.stage || 'Detected'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Contacts Section */}
                {editData.upsert_contacts && editData.upsert_contacts.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                        <div className="flex items-center gap-2 mb-4">
                            <UserPlus className="w-4 h-4 text-ui-accent" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-ui-text-muted">People & Network ({editData.upsert_contacts.length})</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editData.upsert_contacts.map((contact, idx) => (
                                <div key={idx} className="bg-ui-sidebar p-4 rounded-xl border border-ui-border flex items-center gap-4 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-ui-accent/10 flex items-center justify-center text-ui-accent font-black text-xs transition-colors">
                                        {contact.name?.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-ui-text">{contact.name}</p>
                                        <p className="text-[10px] text-ui-text-muted font-bold leading-tight">{contact.currentTitle} @ {contact.currentCompany}</p>
                                    </div>
                                    <span className="text-[8px] bg-ui-sidebar border border-ui-border px-1.5 py-0.5 rounded text-ui-text-muted uppercase font-black transition-colors">{contact.functionArea || 'BD'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Timeline/History Section */}
                {editData.add_timeline_event && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="w-4 h-4 text-ui-accent" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-ui-text-muted">Footprint & Timeline Metadata</h4>
                        </div>
                        <div className="bg-ui-sidebar p-5 rounded-xl border border-ui-border transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="text-sm font-black text-ui-text">{editData.add_timeline_event.title}</h5>
                                <span className="text-[10px] font-bold text-ui-text-muted">{editData.add_timeline_event.date}</span>
                            </div>
                            <p className="text-xs text-ui-text-muted leading-relaxed line-clamp-2 italic">\"{editData.add_timeline_event.desc}\"</p>
                        </div>
                    </div>
                )}
            </div>

            {/* CONFIRM BUTTON */}
            <div className="mt-12 pt-10 border-t border-ui-border flex justify-end gap-3 transition-colors">
                <button 
                  onClick={() => { setParsedResult(null); setActiveIngestionId(null); }}
                  className="px-6 py-2.5 text-sm font-bold text-ui-text-muted hover:text-ui-text transition-colors"
                >
                    Discard
                </button>
                <button 
                    onClick={handleConfirmSave}
                    disabled={isSaving || !isAdmin}
                    className={`flex items-center gap-2 bg-gradient-to-r from-ui-accent to-ui-accent/80 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-ui-accent/20 transition-all ${(!isAdmin || isSaving) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[0.98]'}`}
                >
                    {isSaving ? <Wand2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>One-Click Global Sync</span>
                </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
