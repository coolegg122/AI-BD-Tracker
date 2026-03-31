import React, { useEffect, useState } from 'react';
import { X, Calendar, MessageSquare, FileText, CheckCircle2, Clock, Mail, Phone, Users, History, ChevronDown, ChevronUp, Link, Download, Microscope } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

export default function ProjectSlideOver() {
  const { selectedOverviewProject, closeProjectOverview } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, details, documents

  useEffect(() => {
    if (selectedOverviewProject) {
      setTimeout(() => setIsVisible(true), 10);
      setExpandedEventId(null); 
      setActiveTab('timeline');
      fetchHistory(selectedOverviewProject.id);
      fetchAttachments(selectedOverviewProject.id);
    } else {
      setIsVisible(false);
      setHistoryData([]);
    }
  }, [selectedOverviewProject]);

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
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeProjectOverview}
      ></div>
      
      <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold tracking-wider rounded-md">
                {project.stage || 'Pipeline'}
              </span>
              <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${project.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {project.status === 'overdue' ? 'Stalled / Action Req.' : 'Active'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">{project.company}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">{project.pipeline}</p>
          </div>
          <button onClick={closeProjectOverview} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white px-6 border-b border-slate-200 shrink-0">
          {[
            { id: 'timeline', label: 'Timeline', icon: History },
            { id: 'details', label: 'Deep Dive', icon: Microscope },
            { id: 'documents', label: 'Documents', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 text-xs font-bold transition-all border-b-2 -mb-[1px] ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f7f9fb]">
          
          {activeTab === 'timeline' && (
            <>
              <div className="mb-8">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Future Milestones
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden ring-1 ring-blue-500/10 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{project.tasks && project.tasks.length > 0 ? project.tasks[0].desc : 'Determine Next Action'}</h4>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">Next Step</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                        <Calendar className="w-3.5 h-3.5" />
                        Target: {project.nextFollowUp || 'TBD'}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                        <Users className="w-3.5 h-3.5" />
                        Responsibility: Deal Team
                      </div>
                    </div>
                  </div>

                  {project.tasks && project.tasks.slice(1).map((t, i) => (
                    <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm relative pl-4 opacity-70">
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 rounded-l-xl"></div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{t.desc}</h4>
                        <span className="text-[9px] font-bold text-slate-400">{t.date}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase">{t.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  Historical Footprints
                </h3>
                
                <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                  <div className="relative pb-2">
                    <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-green-500 bg-white shadow-[0_0_0_4px_white]"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{project.lastContactDate || 'Recently'}</span>
                    <div className="mt-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-xs text-slate-800">Latest CRM Sync Entry</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">System tracked an update via AI Intake module.</p>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-4 text-xs font-bold text-slate-500 animate-pulse">Loading Footprints...</div>
                  ) : historyData.length === 0 ? (
                    <div className="text-center py-4 text-xs font-medium text-slate-400">No footprints recorded yet.</div>
                  ) : historyData.map((item) => {
                    const isExpanded = expandedEventId === item.id;
                    return (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-[1.35rem] top-1 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center -translate-x-1.5 shadow-[0_0_0_4px_white] z-10">
                          {getIcon(item.type)}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{item.date}</span>
                        
                        <div 
                          className={`bg-white rounded-xl border ${isExpanded ? 'border-blue-300 shadow-md ring-1 ring-blue-500/10' : 'border-slate-200 shadow-sm opacity-90 hover:opacity-100 hover:border-slate-300'} transition-all cursor-pointer overflow-hidden`}
                          onClick={() => handleToggleExpand(item.id)}
                        >
                          <div className="p-3.5 flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-xs text-slate-800">{item.title}</h4>
                              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
                            </div>
                            <div className="text-slate-300 ml-3 shrink-0">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="bg-slate-50 border-t border-slate-100 p-4 text-xs animate-in slide-in-from-top-2 fade-in duration-200">
                              {item.type === 'email' && (
                                <div className="space-y-3">
                                  <div className="bg-white border border-slate-200 rounded p-2">
                                    <div className="text-[10px] text-slate-500 mb-1"><span className="font-bold text-slate-700">From:</span> {item.details.from}</div>
                                    <div className="text-[10px] text-slate-500 mb-1"><span className="font-bold text-slate-700">To:</span> {item.details.to}</div>
                                    <div className="text-[10px] text-slate-500"><span className="font-bold text-slate-700">Subject:</span> {item.details.subject}</div>
                                  </div>
                                  <div className="text-slate-700 whitespace-pre-line leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                                    {item.details.body}
                                  </div>
                                </div>
                              )}

                              {item.type === 'document' && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between bg-red-50 text-red-700 px-3 py-2 rounded border border-red-100">
                                    <span className="font-bold">Expiry Date</span>
                                    <span className="font-extrabold">{item.details.expiryDate}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="bg-white p-2 rounded border border-slate-200">
                                      <span className="text-slate-400 block mb-0.5">Document ID</span>
                                      <span className="font-bold text-slate-700">{item.details.docId}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-slate-200">
                                      <span className="text-slate-400 block mb-0.5">Legal Status</span>
                                      <span className="font-bold text-green-700">{item.details.status}</span>
                                    </div>
                                  </div>
                                  <a href={item.details.url || "#"} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm transition-colors cursor-pointer">
                                    <Download className="w-3.5 h-3.5" /> Download Original PDF
                                  </a>
                                </div>
                              )}

                              {(item.type === 'meeting' || item.type === 'call') && (
                                <div className="space-y-3">
                                  <div className="bg-white p-2.5 rounded border border-slate-200">
                                    <div className="flex items-center gap-1.5 text-blue-700 font-bold mb-1 border-b border-slate-100 pb-1.5">
                                      <Users className="w-3.5 h-3.5" /> Attendees
                                    </div>
                                    <div className="text-[10px] text-slate-600 tracking-tight">{item.details.attendees}</div>
                                  </div>
                                  <div className="bg-yellow-50 p-2.5 rounded border border-yellow-200/50">
                                    <div className="font-bold text-yellow-800 mb-1 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Key Takeaways
                                    </div>
                                    <div className="text-[11px] text-yellow-900/80 whitespace-pre-line leading-relaxed">
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
                    <div className="absolute -left-[1.35rem] top-3 w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-white"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inception</span>
                    <p className="text-[11px] font-bold text-slate-600 mt-0.5">Project Created via DB Scan</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               {Object.entries(project.details || {}).length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 mt-8">
                    <Microscope className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400">No deep intelligence extracted yet.</p>
                 </div>
               ) : (
                 Object.entries(project.details).map(([category, content]) => (
                   <div key={category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                         <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{category}</h4>
                         <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      </div>
                      <div className="p-4">
                         {typeof content === 'object' && content !== null ? (
                           <div className="grid grid-cols-2 gap-4">
                              {Object.entries(content).map(([key, val]) => (
                                <div key={key}>
                                   <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">{key.replace(/_/g, ' ')}</label>
                                   <span className="text-xs font-bold text-slate-700">{val || '--'}</span>
                                </div>
                              ))}
                           </div>
                         ) : (
                           <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{content}</p>
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
                 <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 mt-8">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400">No documents archived yet.</p>
                 </div>
               ) : (
                <div className="grid grid-cols-1 gap-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${att.file_type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{att.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-blue-500 uppercase px-1.5 py-0.5 bg-blue-50 rounded">{att.category}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{att.file_type} • {att.uploaded_at}</span>
                          </div>
                        </div>
                      </div>
                      <a href={att.url || '#'} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
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
