import React, { useState, useEffect } from 'react';
import { FileText, Wand2, Microscope, UserPlus, MessageSquare, Check, X, AlertCircle, ChevronDown, Inbox, Trash2, Paperclip, Mail, Plus, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SmartInput() {
  const { deals, addDeal, setDeals, setContacts, setDashboardData } = useStore();
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
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedArchive, setSelectedArchive] = useState(null);


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  useEffect(() => {
    fetchPendingInbox();
    fetchHistory();
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

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await api.getSmartInputHistory();
      setHistory(data);
      // Expand the first group by default
      const groups = groupHistory(data);
      if (Object.keys(groups).length > 0) {
        setExpandedGroups({ [Object.keys(groups)[0]]: true });
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
    setIsLoadingHistory(false);
  };

  const groupHistory = (items) => {
    const groups = {};
    const now = new Date();
    
    items.forEach(item => {
      const date = new Date(item.created_at.replace(' ', 'T'));
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      let groupName = "";
      if (diffDays < 7) {
        groupName = "This Week";
      } else if (diffDays < 14) {
        groupName = "Last Week";
      } else {
        groupName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    });
    
    return groups;
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
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
      
      // Save Archive Data explicitly
      try {
        await api.saveSmartInputArchive({
          raw_text: inputText,
          source_type: activeIngestionId ? 'email' : 'manual',
          entities_summary: {
             deal: editData?.update_deal?.company || null,
             contacts: editData?.upsert_contacts?.map(c => c.name) || [],
             assets: editData?.upsert_assets?.map(a => a.name) || []
          }
        });
      } catch (err) {
        console.error("Archive Failed:", err);
      }

      showMessage('success', 'Global Sync Successful!');

      // Refresh global store data so other views reflect the new data immediately
      try {
        const [updatedDeals, updatedContacts, updatedDashboard] = await Promise.all([
          api.getDeals(),
          api.getContacts(),
          api.getDashboardMock()
        ]);
        setDeals(updatedDeals);
        setContacts(updatedContacts);
        setDashboardData(updatedDashboard);
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
      fetchHistory(); // Refresh history
    } catch (error) {

      showMessage('error', `Sync failed: ${error.message}`);
    }
    setIsSaving(false);
  };

  const fillTestData = () => {
    setInputText("Minutes from Pfizer meeting (Oct 12). \n\nMet with Dr. Emily Watson (Chief Medical Officer) and Dr. Thomas Wayne (BD Lead). \n\nDiscussed Deal Helios. Pfizer wants to proceed to Phase II diligence regarding the ADC asset. Emily mentioned she previously worked at Novartis for 8 years and Roche for 3 years.");
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
          <h2 className="text-3xl font-extrabold tracking-tight text-ui-text mb-2">Smart Intake</h2>
          <p className="text-ui-text-muted max-w-xl text-sm leading-relaxed">Multi-entity extraction engine. Structure unstructured intelligence into Deals, Assets, and Network.</p>
        </div>
        
        <div className="flex bg-ui-hover p-1 rounded-xl border border-ui-border transition-colors">
          <button onClick={() => setActiveTab('manual')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-ui-card text-ui-accent shadow-sm' : 'text-ui-text-muted hover:text-ui-text'}`}>
            <FileText className="w-4 h-4" /> Manual Extract
          </button>
          <button onClick={() => setActiveTab('inbox')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'inbox' ? 'bg-ui-card text-ui-accent shadow-sm' : 'text-ui-text-muted hover:text-ui-text'}`}>
            <Inbox className="w-4 h-4" /> AI Inbox
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-ui-card text-ui-accent shadow-sm' : 'text-ui-text-muted hover:text-ui-text'}`}>
            <MessageSquare className="w-4 h-4" /> History
          </button>
        </div>

      </div>

      {activeTab === 'manual' ? (
        <section className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-ui-accent/20 to-transparent rounded-2xl blur opacity-40 transition duration-1000"></div>
            <div className="relative bg-ui-input rounded-xl shadow-sm overflow-hidden border border-ui-border transition-colors">
              <div className="flex items-center justify-between px-6 py-4 bg-ui-sidebar border-b border-ui-border transition-colors">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-ui-accent" />
                  <span className="text-xs font-bold uppercase tracking-wider text-ui-accent">Mixed Intelligence Input</span>
                </div>
                <button onClick={fillTestData} className="text-[10px] font-bold text-ui-accent hover:bg-ui-accent/10 px-2 py-1 rounded transition-colors">Fill Sample</button>
              </div>
              <textarea className="w-full h-48 p-6 bg-transparent border-none focus:ring-0 text-ui-text resize-none placeholder:text-ui-text-muted/50 focus:outline-none" placeholder="Paste an email, call transcript, or meeting notes..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={handleAIParse} disabled={isAnalyzing || !inputText.trim() || !isAdmin} className="flex flex-col items-center gap-2">
              <div className={`flex items-center gap-2 bg-ui-accent text-white px-10 py-3.5 rounded-full font-bold hover:shadow-lg transition-all ${(!isAdmin || isAnalyzing || !inputText.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Wand2 className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Extracting Entities...' : 'Extract Intelligence'}</span>
              </div>
            </button>
          </div>
        </section>
      ) : activeTab === 'inbox' ? (
        <section className="space-y-4 animate-in slide-in-from-right-4 duration-300">
           <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-bold text-ui-text-muted uppercase tracking-widest">{pendingIngestions.length} Pending Records</span>
               <button onClick={handleSyncMail} disabled={isSyncing || !isAdmin} className="flex items-center gap-1.5 bg-ui-accent text-white text-xs font-bold px-4 py-1.5 rounded-lg"><Mail className="w-3.5 h-3.5" /> Sync Remote</button>
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
                  <button onClick={() => handleReviewInboxItem(item)} className="bg-ui-accent text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">Map Intelligence <Check className="w-4 h-4" /></button>
                </div>
             </div>
           ))}
           {pendingIngestions.length === 0 && (
             <div className="text-center py-20 bg-ui-sidebar rounded-2xl border-2 border-dashed border-ui-border">
               <Inbox className="w-12 h-12 text-ui-text-muted mx-auto mb-4 opacity-20" />
               <p className="text-ui-text-muted font-bold text-sm">Your AI Inbox is clean.</p>
             </div>
           )}
        </section>
      ) : (
        <section className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ui-text-muted uppercase tracking-widest">{history.length} Archived Inputs</span>
            <button onClick={fetchHistory} className="text-xs font-bold text-ui-accent flex items-center gap-1 hover:underline">
              <Plus className="w-3 h-3 rotate-45" /> Refresh
            </button>
          </div>
          
          {Object.entries(groupHistory(history)).map(([groupName, items]) => (
            <div key={groupName} className="space-y-2">
              <button 
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between py-2 border-b border-ui-border hover:bg-ui-hover transition-colors rounded-t-lg px-2"
              >
                <span className="text-xs font-black uppercase text-ui-text-muted tracking-widest">{groupName}</span>
                <ChevronDown className={`w-4 h-4 text-ui-text-muted transition-transform duration-300 ${expandedGroups[groupName] ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedGroups[groupName] && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedArchive(item)}
                      className="group bg-ui-card rounded-xl border border-ui-border p-4 flex justify-between items-center transition-all hover:border-ui-accent/50 cursor-pointer hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${item.source_type === 'email' ? 'bg-blue-500/10 text-blue-500' : 'bg-ui-accent/10 text-ui-accent'}`}>
                          {item.source_type === 'email' ? <Mail className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ui-accent opacity-80">{item.source_type}</span>
                            <span className="text-[10px] font-medium text-ui-text-muted">• {item.created_at}</span>
                          </div>
                          <h4 className="text-sm font-bold text-ui-text line-clamp-1">
                            {item.entities_summary?.deal || item.entities_summary?.subject || 'Structured Intelligence Extraction'}
                          </h4>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-ui-text-muted -rotate-90 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {history.length === 0 && !isLoadingHistory && (
            <div className="text-center py-20 bg-ui-sidebar rounded-2xl border-2 border-dashed border-ui-border">
              <MessageSquare className="w-12 h-12 text-ui-text-muted mx-auto mb-4 opacity-20" />
              <p className="text-ui-text-muted font-bold text-sm">No historical records found. Start extracting to build your intelligence archive.</p>
            </div>
          )}
        </section>
      )}


      {selectedArchive && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedArchive(null)}>
          <div className="bg-ui-card w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden border border-ui-border flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-ui-sidebar border-b border-ui-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ui-accent/10 text-ui-accent rounded-lg">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-ui-text">Raw Archive Detail</h3>
                  <p className="text-[10px] font-bold text-ui-text-muted uppercase">{selectedArchive.created_at} • {selectedArchive.source_type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedArchive(null)} className="p-2 hover:bg-ui-hover rounded-full transition-colors text-ui-text-muted"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="bg-ui-input p-6 rounded-xl border border-ui-border font-mono text-sm leading-relaxed whitespace-pre-wrap text-ui-text">
                {selectedArchive.raw_text}
              </div>

              {selectedArchive.entities_summary && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-black uppercase text-ui-text-muted tracking-widest border-b border-ui-border pb-2">Extracted Entities</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedArchive.entities_summary.deal && (
                      <div className="bg-ui-sidebar p-3 rounded-lg border border-ui-border">
                        <label className="text-[9px] font-black uppercase text-ui-text-muted block mb-1">Target Deal</label>
                        <p className="text-sm font-bold text-ui-accent">{selectedArchive.entities_summary.deal}</p>
                      </div>
                    )}
                    {selectedArchive.entities_summary.contacts && selectedArchive.entities_summary.contacts.length > 0 && (
                      <div className="bg-ui-sidebar p-3 rounded-lg border border-ui-border">
                        <label className="text-[9px] font-black uppercase text-ui-text-muted block mb-1">Affected Contacts</label>
                        <p className="text-xs font-medium text-ui-text">{selectedArchive.entities_summary.contacts.join(', ')}</p>
                      </div>
                    )}
                    {selectedArchive.entities_summary.assets && selectedArchive.entities_summary.assets.length > 0 && (
                      <div className="bg-ui-sidebar p-3 rounded-lg border border-ui-border col-span-2">
                        <label className="text-[9px] font-black uppercase text-ui-text-muted block mb-1">Linked Assets</label>
                        <p className="text-xs font-medium text-ui-text">{selectedArchive.entities_summary.assets.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {parsedResult && editData && (
        <section className="mt-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 border-l-4 border-ui-accent pl-4">
                <div>
                    <h3 className="text-lg font-bold text-ui-text">Intelligence Preview</h3>
                    <p className="text-xs text-ui-text-muted font-medium italic">Universal AI has mapped your input to the following Deal modules.</p>
                </div>
            </div>
            <button onClick={() => { setParsedResult(null); setActiveIngestionId(null); }} className="text-ui-text-muted hover:text-red-500"><X className="w-5 h-5" /></button>
          </div>

          <div className="bg-ui-card rounded-2xl border-2 border-ui-accent/20 shadow-xl p-8 space-y-10">
            {editData.update_deal && (
                <div className="animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-4"><Microscope className="w-4 h-4 text-ui-accent" /><h4 className="text-xs font-black uppercase text-ui-text-muted">Target Deal Alignment</h4></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-ui-sidebar p-5 rounded-xl border border-ui-border">
                        <div><label className="text-[9px] font-bold text-ui-text-muted uppercase block">Company</label><p className="text-sm font-black text-ui-text">{editData.update_deal.company || 'N/A'}</p></div>
                        <div><label className="text-[9px] font-bold text-ui-text-muted uppercase block">Engagement Focus</label><p className="text-sm font-bold text-ui-accent">{editData.update_deal.pipeline || 'N/A'}</p></div>
                        <div><label className="text-[9px] font-bold text-ui-text-muted uppercase block">Stage</label><span className="text-[10px] bg-ui-accent/10 text-ui-accent px-2 py-0.5 rounded-full font-bold">{editData.update_deal.stage || 'Detected'}</span></div>
                    </div>
                </div>
            )}

            {editData.upsert_contacts && editData.upsert_contacts.length > 0 && (
                <div className="animate-in fade-in duration-500 delay-100">
                    <div className="flex items-center gap-2 mb-4"><UserPlus className="w-4 h-4 text-ui-accent" /><h4 className="text-xs font-black uppercase text-ui-text-muted">Network Intelligence ({editData.upsert_contacts.length})</h4></div>
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

            {editData.upsert_assets && editData.upsert_assets.length > 0 && (
                <div className="animate-in fade-in duration-500 delay-150">
                    <div className="flex items-center gap-2 mb-4"><Layers className="w-4 h-4 text-ui-accent" /><h4 className="text-xs font-black uppercase text-ui-text-muted">Asset Cataloging ({editData.upsert_assets.length})</h4></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editData.upsert_assets.map((asset, idx) => (
                            <div key={idx} className="bg-ui-sidebar p-4 rounded-xl border border-ui-border flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-ui-accent/10 flex items-center justify-center text-ui-accent font-black text-[10px]">{asset.code || 'AS'}</div>
                                <div className="flex-1"><p className="text-xs font-black text-ui-text">{asset.name}</p><p className="text-[9px] text-ui-text-muted font-bold">{asset.category}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {editData.add_timeline_event && (
                <div className="animate-in fade-in duration-500 delay-200">
                    <div className="flex items-center gap-2 mb-4"><MessageSquare className="w-4 h-4 text-ui-accent" /><h4 className="text-xs font-black uppercase text-ui-text-muted">Engagement Footprint</h4></div>
                    <div className="bg-ui-sidebar p-5 rounded-xl border border-ui-border">
                        <div className="flex justify-between mb-2"><h5 className="text-sm font-black text-ui-text">{editData.add_timeline_event.title}</h5><span className="text-[10px] font-bold text-ui-text-muted">{editData.add_timeline_event.date}</span></div>
                        <p className="text-xs text-ui-text-muted leading-relaxed italic line-clamp-2">"{editData.add_timeline_event.desc}"</p>
                    </div>
                </div>
            )}

            <div className="mt-8 pt-8 border-t border-ui-border flex justify-end gap-3">
                <button onClick={() => { setParsedResult(null); setActiveIngestionId(null); }} className="px-6 py-2.5 text-sm font-bold text-ui-text-muted">Discard</button>
                <button onClick={handleConfirmSave} disabled={isSaving || !isAdmin} className="flex items-center gap-2 bg-ui-accent text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-ui-accent/20">
                    {isSaving ? <Wand2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Commit to Intelligence
                </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
