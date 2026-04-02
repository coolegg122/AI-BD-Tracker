import React, { useState, useEffect } from 'react';
import { FileText, Wand2, Microscope, UserPlus, MessageSquare, Check, X, AlertCircle, ChevronDown, Inbox, Trash2, Paperclip, Mail, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SmartInput() {
  const { projects, addProject, setProjects, setContacts } = useStore();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('manual');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [editData, setEditData] = useState(null);
  
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
      const data = await api.extractUniversal(inputText);
      setParsedResult(data.raw_ai_output);
      setEditData(data.raw_ai_output);
    } catch (error) {
      console.error("AI Parse failed:", error);
      alert(`AI extraction failed: ${error.message || "Unknown error"}`);
    }
    setIsAnalyzing(false);
  };

  const handleReviewInboxItem = (item) => {
    setActiveTab('manual');
    setParsedResult(item.ai_extracted_payload);
    setEditData(item.ai_extracted_payload);
    setActiveIngestionId(item.id);
    setInputText(item.raw_content);
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
      await api.extractUniversal(inputText); 
      showMessage('success', 'Global Sync Successful!');

      // Refresh global store data so other views reflect the new data immediately
      try {
        const [updatedProjects, updatedContacts] = await Promise.all([
          api.getProjects(),
          api.getContacts()
        ]);
        setProjects(updatedProjects);
        setContacts(updatedContacts);
      } catch (refreshErr) {
        console.error("Failed to refresh store after sync:", refreshErr);
      }

      if (activeIngestionId) {
        try { await api.processIngestion(activeIngestionId); } catch (err) {}
        setPendingIngestions(prev => prev.filter(item => item.id !== activeIngestionId));
        setActiveIngestionId(null);
      }

      setParsedResult(null);
      setEditData(null);
      setInputText('');
    } catch (error) {
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
          message.type === 'success' ? 'bg-ui-success/10 text-ui-success border-ui-success/20 backdrop-blur-md' : 'bg-ui-error/10 text-ui-error border-ui-error/20 backdrop-blur-md'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-ui-text mb-2">Smart Input</h2>
          <p className="text-ui-text-muted max-w-xl text-sm leading-relaxed">Multi-entity extraction engine. Paste raw transcripts and let AI structure your intelligence.</p>
        </div>
        
        <div className="flex bg-ui-hover p-1 rounded-xl border border-ui-border transition-colors">
          <button onClick={() => setActiveTab('manual')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-ui-card text-ui-accent shadow-sm' : 'text-ui-text-muted hover:text-ui-text'}`}>
            <FileText className="w-4 h-4" /> Manual Extract
          </button>
          <button onClick={() => setActiveTab('inbox')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'inbox' ? 'bg-ui-card text-ui-accent shadow-sm' : 'text-ui-text-muted hover:text-ui-text'}`}>
            <Inbox className="w-4 h-4" /> AI Inbox
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
                <button onClick={fillTestData} className="text-[10px] font-bold text-ui-accent hover:bg-ui-accent/10 px-2 py-1 rounded transition-colors">Fill Mixed Sample</button>
              </div>
              <textarea className="w-full h-48 p-6 bg-transparent border-none focus:ring-0 text-ui-text resize-none placeholder:text-ui-text-muted/50 focus:outline-none" placeholder="Paste an email or transcript..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={handleAIParse} disabled={isAnalyzing || !inputText.trim() || !isAdmin} className="flex flex-col items-center gap-2">
              <div className={`flex items-center gap-2 bg-ui-accent text-white px-10 py-3.5 rounded-full font-bold hover:opacity-90 transition-all ${(!isAdmin || isAnalyzing || !inputText.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Wand2 className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'AI Guessing...' : 'AI Extract & Review'}</span>
              </div>
            </button>
          </div>
        </section>
      ) : (
        <section className="space-y-4 animate-in slide-in-from-right-4 duration-300">
           <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-bold text-ui-text-muted uppercase tracking-widest">{pendingIngestions.length} Pending Records</span>
               <button onClick={handleSyncMail} disabled={isSyncing || !isAdmin} className="flex items-center gap-1.5 bg-ui-accent text-white text-xs font-bold px-4 py-1.5 rounded-lg"><Mail className="w-3.5 h-3.5" /> Sync Zoho</button>
           </div>
           {pendingIngestions.map(item => (
             <div key={item.id} className="bg-ui-card rounded-xl border border-ui-border p-6 flex justify-between items-center transition-colors hover:border-ui-accent/50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-ui-accent/10 p-3 rounded-xl text-ui-accent"><Mail className="w-6 h-6" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-ui-accent mb-1">{item.entity_type || 'Mixed'}</p>
                    <h4 className="font-bold text-ui-text">{item.subject || 'Automated Catch-all'}</h4>
                    <p className="text-xs text-ui-text-muted font-medium">From: {item.sender_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={(e) => handleDeleteIngestion(item.id, e)} className="p-2.5 text-ui-text-muted rounded-lg hover:text-red-500 hover:bg-red-50"><Trash2 className="w-5 h-5" /></button>
                  <button onClick={() => handleReviewInboxItem(item)} className="bg-ui-accent text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">Review <Check className="w-4 h-4" /></button>
                </div>
             </div>
           ))}
        </section>
      )}

      {parsedResult && editData && (
        <section className="mt-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 border-l-4 border-ui-accent pl-4">
                <div>
                    <h3 className="text-lg font-bold text-ui-text">Intelligence Preview</h3>
                    <p className="text-xs text-ui-text-muted font-medium italic">Universal AI has mapped your input to the following modules.</p>
                </div>
            </div>
            <button onClick={() => { setParsedResult(null); setActiveIngestionId(null); }} className="text-ui-text-muted hover:text-red-500"><X className="w-5 h-5" /></button>
          </div>

          <div className="bg-ui-card rounded-2xl border-2 border-ui-accent/20 shadow-xl p-8 space-y-10">
            {editData.update_project && (
                <div className="animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-4"><Microscope className="w-4 h-4 text-ui-accent" /><h4 className="text-xs font-black uppercase text-ui-text-muted">Target Project Update</h4></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-ui-sidebar p-5 rounded-xl border border-ui-border">
                        <div><label className="text-[9px] font-bold text-ui-text-muted uppercase block">Company</label><p className="text-sm font-black text-ui-text">{editData.update_project.company || 'N/A'}</p></div>
                        <div><label className="text-[9px] font-bold text-ui-text-muted uppercase block">Pipeline</label><p className="text-sm font-bold text-ui-accent">{editData.update_project.pipeline || 'N/A'}</p></div>
                        <div><label className="text-[9px] font-bold text-ui-text-muted uppercase block">Stage</label><span className="text-[10px] bg-ui-accent/10 text-ui-accent px-2 py-0.5 rounded-full font-bold">{editData.update_project.stage || 'Detected'}</span></div>
                    </div>
                </div>
            )}

            {editData.upsert_contacts && editData.upsert_contacts.length > 0 && (
                <div className="animate-in fade-in duration-500 delay-100">
                    <div className="flex items-center gap-2 mb-4"><UserPlus className="w-4 h-4 text-ui-accent" /><h4 className="text-xs font-black uppercase text-ui-text-muted">People & Network ({editData.upsert_contacts.length})</h4></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editData.upsert_contacts.map((contact, idx) => (
                            <div key={idx} className="bg-ui-sidebar p-4 rounded-xl border border-ui-border flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-ui-accent/10 flex items-center justify-center text-ui-accent font-black text-[10px]">{contact.name?.split(' ').map(n => n[0]).join('')}</div>
                                <div className="flex-1"><p className="text-xs font-black text-ui-text">{contact.name}</p><p className="text-[9px] text-ui-text-muted font-bold">{contact.currentTitle} @ {contact.currentCompany}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {editData.add_timeline_event && (
                <div className="animate-in fade-in duration-500 delay-200">
                    <div className="flex items-center gap-2 mb-4"><MessageSquare className="w-4 h-4 text-ui-accent" /><h4 className="text-xs font-black uppercase text-ui-text-muted">History Footprint</h4></div>
                    <div className="bg-ui-sidebar p-5 rounded-xl border border-ui-border">
                        <div className="flex justify-between mb-2"><h5 className="text-sm font-black text-ui-text">{editData.add_timeline_event.title}</h5><span className="text-[10px] font-bold text-ui-text-muted">{editData.add_timeline_event.date}</span></div>
                        <p className="text-xs text-ui-text-muted leading-relaxed italic line-clamp-2">"{editData.add_timeline_event.desc}"</p>
                    </div>
                </div>
            )}

            <div className="mt-8 pt-8 border-t border-ui-border flex justify-end gap-3">
                <button onClick={() => { setParsedResult(null); setActiveIngestionId(null); }} className="px-6 py-2.5 text-sm font-bold text-ui-text-muted">Discard</button>
                <button onClick={handleConfirmSave} disabled={isSaving || !isAdmin} className="flex items-center gap-2 bg-ui-accent text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-ui-accent/20">
                    {isSaving ? <Wand2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} One-Click Sync
                </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
