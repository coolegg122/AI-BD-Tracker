import React, { useState, useEffect } from 'react';
import { FileText, Wand2, Microscope, UserPlus, MessageSquare, Check, X, AlertCircle, ChevronDown, Inbox, Trash2, Paperclip, Mail, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

export default function SmartInput() {
  const { projects, addProject } = useStore();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'inbox'
  const [inputText, setInputText] = useState('');
  const [extractType, setExtractType] = useState('project'); // project, contact, meeting_note
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [linkedProjectId, setLinkedProjectId] = useState('');
  
  // Pending Inbox State
  const [pendingIngestions, setPendingIngestions] = useState([]);
  const [activeIngestionId, setActiveIngestionId] = useState(null);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

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

  useEffect(() => {
    // If we're on meeting_note, try to match suspected_project_name to an existing project
    if (extractType === 'meeting_note' && parsedResult?.suspected_project_name) {
        const matched = projects.find(p => 
            p.company.toLowerCase().includes(parsedResult.suspected_project_name.toLowerCase()) ||
            parsedResult.suspected_project_name.toLowerCase().includes(p.company.toLowerCase())
        );
        if (matched) setLinkedProjectId(matched.id);
    }
  }, [parsedResult, extractType, projects]);

  const handleAIParse = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setParsedResult(null);
    setEditData(null);
    setActiveIngestionId(null);

    try {
      const data = await api.extractInfo(inputText, extractType);
      setParsedResult(data);
      setEditData(data); // Initialize editable form with AI guess
    } catch (error) {
      console.error("AI Parse failed:", error);
      alert(`AI extraction failed:\n${error.message || "Unknown error"}`);
    }
    setIsAnalyzing(false);
  };

  const handleReviewInboxItem = (item) => {
    setActiveTab('manual');
    setExtractType(item.entity_type || 'project');
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
      if (extractType === 'project') {
        const saved = await api.createProject(editData);
        addProject(saved);
        alert("Project archived successfully!");
      } else if (extractType === 'contact') {
        await api.createContact(editData);
        alert("Key Contact added to CRM!");
      } else if (extractType === 'meeting_note') {
        if (!linkedProjectId) {
            alert("Please select a project to associate this note with.");
            setIsSaving(false);
            return;
        }
        await api.createProjectHistory(linkedProjectId, {
            type: editData.type || 'meeting',
            title: editData.title,
            date: editData.date,
            desc: editData.desc,
            details: {}
        });
        alert("Meeting note synced to project history!");
      }

      // If this came from the inbox, mark as processed (non-blocking: don't fail the whole save if this call fails)
      if (activeIngestionId) {
        try {
          await api.processIngestion(activeIngestionId);
        } catch (processErr) {
          // Log but don't block success - project was saved, just inbox cleanup failed
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
      const msg = error.message || "Unknown error";
      alert(`Failed to save:\n${msg}`);
    }
    setIsSaving(false);
  };

  // Helper for dynamic details
  const updateDetail = (key, value) => {
    if (!editData) return;
    setEditData({
      ...editData,
      details: {
        ...(editData.details || {}),
        [key]: value
      }
    });
  };

  const removeDetail = (key) => {
    if (!editData) return;
    const newDetails = { ...(editData.details || {}) };
    delete newDetails[key];
    setEditData({
      ...editData,
      details: newDetails
    });
  };

  const addDetail = () => {
    if (!editData) return;
    const newKey = `field_${Object.keys(editData.details || {}).length + 1}`;
    updateDetail(newKey, "");
  };

  const fillTestData = () => {
    if (extractType === 'project') {
        setInputText("FWD: Ipsen Pharma Discussion. \n\nHi team, just got off the call with Ipsen regarding the expansion study. They are very keen. We need to circulate the NDA by Tuesday.");
    } else if (extractType === 'contact') {
        setInputText("Met Sarah Jenkins at JPM. She is the VP of BD at Novartis. Sarah.jenkins@novartis.com. Previously at Roche for 5 years.");
    } else if (extractType === 'meeting_note') {
        setInputText("Minutes from Pfizer meeting (Oct 12): Discussed the Phase III data readout. They had concerns about the toxicity profile in cohort B but agreed to proceed with the term sheet draft.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Smart Input</h2>
            <p className="text-slate-500 max-w-xl text-sm leading-relaxed">Multi-entity extraction engine. Paste raw transcripts or notes and let AI structure your BD intelligence.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
                onClick={() => setActiveTab('manual')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <FileText className="w-4 h-4" />
                Manual Extract
            </button>
            <button 
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'inbox' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <Inbox className="w-4 h-4" />
                AI Inbox
                {pendingIngestions.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-bounce-slow">
                        {pendingIngestions.length}
                    </span>
                )}
            </button>
        </div>
      </div>

      {activeTab === 'manual' ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
                 {/* Type Selector */}
                <div className="flex bg-slate-200/50 p-1 rounded-lg">
                    {[
                        { id: 'project', label: 'Project', icon: Microscope },
                        { id: 'contact', label: 'Contact', icon: UserPlus },
                        { id: 'meeting_note', label: 'Meeting Note', icon: MessageSquare }
                    ].map(t => (
                        <button 
                            key={t.id}
                            onClick={() => { setExtractType(t.id); setParsedResult(null); }}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${extractType === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <t.icon className="w-3 h-3" />
                            {t.label}
                        </button>
                    ))}
                </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-2xl blur opacity-40 transition duration-1000"></div>
            <div className="relative bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Raw Input Source</span>
                </div>
                <button 
                  onClick={fillTestData} 
                  className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                >
                  Fill Sample {extractType}
                </button>
              </div>
              <textarea 
                className="w-full h-48 p-6 bg-transparent border-none focus:ring-0 text-slate-800 resize-none placeholder:text-slate-400 leading-relaxed focus:outline-none" 
                placeholder={`Paste ${extractType} details here...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleAIParse}
              disabled={isAnalyzing || !inputText.trim()}
              className="flex items-center gap-2 bg-slate-900 text-white px-10 py-3.5 rounded-full font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <Wand2 className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'AI Guessing...' : 'AI Extract & Review'}</span>
            </button>
          </div>
        </section>
      ) : (
        <section className="animate-in slide-in-from-right-4 duration-300">
          {/* Always-visible toolbar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {pendingIngestions.length} Pending Records
            </span>
            <div className="flex items-center gap-3">
              <button onClick={fetchPendingInbox} className="text-xs font-bold text-slate-500 hover:text-slate-800">Refresh</button>
              <button
                onClick={handleSyncMail}
                disabled={isSyncing}
                className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <Mail className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Zoho Mail'}
              </button>
            </div>
          </div>

          {/* Sync result feedback */}
          {syncResult && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 ${syncResult.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {syncResult.error ? <X className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              {syncResult.error || syncResult.message}
            </div>
          )}

          {isLoadingInbox ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Loading Inbox...</p>
            </div>
          ) : pendingIngestions.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-slate-400">
              <Inbox className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">No items awaiting review.</p>
              <p className="text-xs mt-1">Send an email to <span className="font-mono font-bold text-slate-600">bdtracker212@zohomail.com</span> and click "Sync".</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                  {pendingIngestions.map(item => (
                      <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-300 transition-colors group shadow-sm">
                          <div className="flex items-start gap-4">
                              <div className="bg-blue-50 p-3 rounded-xl">
                                  {item.source_type === 'email' ? <Mail className="w-6 h-6 text-blue-600" /> : <Wand2 className="w-6 h-6 text-blue-600" />}
                              </div>
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">{item.entity_type || 'project'}</span>
                                      <span className="text-xs text-slate-400 font-medium">{item.created_at}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-900 mb-1">{item.subject || 'Automated Catch-all'}</h4>
                                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">From: <span className="font-bold text-slate-700">{item.sender_email}</span></p>
                                  {item.attachments && item.attachments.length > 0 && (
                                      <div className="flex flex-wrap gap-2">
                                          {item.attachments.map((file, idx) => (
                                              <span key={idx} className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                                                  <Paperclip className="w-2.5 h-2.5" />
                                                  {file}
                                              </span>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <button
                                  onClick={(e) => handleDeleteIngestion(item.id, e)}
                                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                  <Trash2 className="w-5 h-5" />
                              </button>
                              <button
                                  onClick={() => handleReviewInboxItem(item)}
                                  className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition-all flex items-center gap-2"
                              >
                                  Review & Confirm
                                  <Check className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* REVIEW & CONFIRM SECTION */}
      {parsedResult && editData && (
        <section className="mt-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full"><Wand2 className="w-4 h-4 text-orange-600" /></div>
                <div>
                   <h3 className="text-lg font-bold">AI Extraction Preview</h3>
                   <p className="text-xs text-slate-500 font-medium italic">Please review and correct the AI's "guesses" before archiving.</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => { setParsedResult(null); setActiveIngestionId(null); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-orange-100 shadow-xl shadow-orange-900/5 p-8 relative overflow-hidden">
            {activeIngestionId && (
                <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-bold text-orange-800 uppercase tracking-tight">Processing Inbox Item #{activeIngestionId}</span>
                    </div>
                    <span className="text-[10px] font-bold text-orange-400 italic">Confirmation will clear this from your inbox</span>
                </div>
            )}
            
            {/* TYPE SPECIFIC FORMS */}
            {extractType === 'project' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Company Name</label>
                            <input 
                                className="w-full text-xl font-extrabold text-blue-700 bg-blue-50/30 border-b-2 border-blue-100 focus:border-blue-500 focus:outline-none py-1"
                                value={editData.company}
                                onChange={(e) => setEditData({...editData, company: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pipeline Asset</label>
                            <input 
                                className="w-full font-bold text-slate-800 border-b border-slate-200 focus:border-blue-500 focus:outline-none py-1"
                                value={editData.pipeline}
                                onChange={(e) => setEditData({...editData, pipeline: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Stage</label>
                            <select 
                                className="w-full font-bold text-slate-800 border-b border-slate-200 focus:border-blue-500 focus:outline-none py-1 bg-transparent"
                                value={editData.stage}
                                onChange={(e) => setEditData({...editData, stage: e.target.value})}
                            >
                                <option>Initial Contact</option>
                                <option>CDA Signed</option>
                                <option>Due Diligence</option>
                                <option>Term Sheet</option>
                                <option>Negotiation</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Next Follow-up</label>
                            <input 
                                type="date"
                                className="w-full font-bold text-slate-800 border-b border-slate-200 focus:border-blue-500 focus:outline-none py-1"
                                value={editData.nextFollowUp || ''}
                                onChange={(e) => setEditData({...editData, nextFollowUp: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            )}

            {extractType === 'contact' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                            <input 
                                className="w-full text-xl font-extrabold text-indigo-700 bg-indigo-50/30 border-b-2 border-indigo-100 focus:border-indigo-500 focus:outline-none py-1"
                                value={editData.name}
                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Organization</label>
                            <input 
                                className="w-full font-bold text-slate-800 border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
                                value={editData.currentCompany}
                                onChange={(e) => setEditData({...editData, currentCompany: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Job Title</label>
                            <input 
                                className="w-full font-bold text-slate-800 border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
                                value={editData.currentTitle}
                                onChange={(e) => setEditData({...editData, currentTitle: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email (Work)</label>
                            <input 
                                className="w-full font-bold text-slate-800 border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
                                value={editData.email}
                                onChange={(e) => setEditData({...editData, email: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SHARED DYNAMIC DETAILS SECTION */}
            {(editData.details || Object.keys(editData.details || {}).length > 0 || true) && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Extra Extracted Details</label>
                        <button 
                            onClick={addDetail}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                        >
                            <Plus className="w-3 h-3" /> Add Detail
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(editData.details || {}).map(([key, value]) => (
                            <div key={key} className="flex items-end gap-2 group">
                                <div className="flex-1">
                                    <input 
                                        className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1 bg-transparent border-none outline-none focus:text-blue-500 w-full"
                                        value={key}
                                        onChange={(e) => {
                                            const newKey = e.target.value;
                                            const newDetails = { ...editData.details };
                                            const val = newDetails[key];
                                            delete newDetails[key];
                                            newDetails[newKey] = val;
                                            setEditData({...editData, details: newDetails});
                                        }}
                                    />
                                    <input 
                                        className="w-full font-medium text-slate-700 border-b border-dashed border-slate-200 focus:border-blue-400 focus:outline-none py-1 bg-transparent"
                                        value={typeof value === 'object' ? JSON.stringify(value) : value}
                                        onChange={(e) => updateDetail(key, e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={() => removeDetail(key)}
                                    className="p-1.5 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {Object.keys(editData.details || {}).length === 0 && (
                        <p className="text-[11px] text-slate-400 italic">No extra clinical or contact details detected. Add some manually if needed.</p>
                    )}
                </div>
            )}

            {extractType === 'meeting_note' && (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">AI Association Guess</p>
                            <p className="text-xs text-blue-700 mb-3">AI identified this note relates to: <span className="font-bold underline">"{parsedResult.suspected_project_name}"</span></p>
                            
                            <label className="text-[10px] font-bold text-blue-800 uppercase block mb-1">Link to Project</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-white border border-blue-200 rounded-lg py-2 px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={linkedProjectId}
                                    onChange={(e) => setLinkedProjectId(e.target.value)}
                                >
                                    <option value="">-- Choose Project --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.company} ({p.pipeline})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Summary Title</label>
                            <input 
                                className="w-full text-lg font-bold text-slate-900 border-b border-slate-200 focus:border-blue-500 focus:outline-none py-1"
                                value={editData.title}
                                onChange={(e) => setEditData({...editData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Interaction Date</label>
                            <input 
                                type="date"
                                className="w-full font-bold text-slate-800 border-b border-slate-200 focus:border-blue-500 focus:outline-none py-1"
                                value={editData.date || ''}
                                onChange={(e) => setEditData({...editData, date: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Key Takeaways</label>
                        <textarea 
                            className="w-full h-24 p-3 bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm leading-relaxed"
                            value={editData.desc}
                            onChange={(e) => setEditData({...editData, desc: e.target.value})}
                        />
                    </div>
                </div>
            )}

            {/* SHARED CONFIRM BUTTON */}
            <div className="mt-10 pt-10 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => { setParsedResult(null); setActiveIngestionId(null); }}
                  className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800"
                >
                    Discard
                </button>
                <button 
                    onClick={handleConfirmSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {isSaving ? <Wand2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Confirm & Archive to Database</span>
                </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
