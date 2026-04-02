import React, { useState, useMemo } from 'react';
import { Layers, Building2, ChevronDown, ChevronRight, Clock, MessageSquare, AlertCircle, CheckCircle2, Network, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import IntelligenceModal from '../components/IntelligenceModal';

export default function Pipeline() {
  const { projects, stages, openProjectOverview } = useStore();
  const [activeTab, setActiveTab] = useState('by_project'); // 'by_project' or 'by_company'
  const [openSections, setOpenSections] = useState({});
  const [intelligenceCompany, setIntelligenceCompany] = useState(null);

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Process data for View 1: By Pipeline Asset
  const groupedByProject = useMemo(() => {
    const groups = {};
    projects.forEach(p => {
      const pipeline = p.pipeline || 'Unassigned Asset';
      if (!groups[pipeline]) groups[pipeline] = [];
      groups[pipeline].push(p);
    });
    return groups;
  }, [projects]);

  // Process data for View 2: By External Company
  const groupedByCompany = useMemo(() => {
    const groups = {};
    projects.forEach(p => {
      const company = p.company || 'Unknown Company';
      if (!groups[company]) groups[company] = [];
      groups[company].push(p);
    });
    return groups;
  }, [projects]);

  const getStageColor = (stageId) => {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.color : 'bg-slate-300';
  };

  const getFeedbackSummary = (p) => {
    if (p.tasks && p.tasks.length > 0) {
      return p.tasks[0].desc || p.tasks[0].title;
    }
    if (p.nextFollowUp) {
      return `Waiting for follow-up on ${p.nextFollowUp}`;
    }
    return "Initial assessment pending.";
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Header and Pivot Controls */}
      <div className="mb-8 shrink-0">
        <div className="flex justify-between items-end mb-6">
          <div>
            <nav className="flex items-center gap-1.5 text-[10px] font-bold text-ui-text-muted mb-2 uppercase tracking-widest">
              <span>Intelligence</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-ui-accent">Pipeline Matrix</span>
            </nav>
            <h2 className="text-3xl font-extrabold text-ui-text tracking-tight">Deal Tracker 360°</h2>
            <p className="text-ui-text-muted text-sm mt-1">Multi-dimensional tracking of all external engagements.</p>
          </div>
          <div className="bg-ui-hover p-1 rounded-xl flex text-sm font-bold shadow-inner transition-colors">
            <button 
              onClick={() => setActiveTab('by_project')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === 'by_project' ? 'bg-ui-card text-ui-accent shadow-sm' : 'text-ui-text-muted hover:text-ui-text'
              }`}
            >
              <Layers className="w-4 h-4" /> By Project Asset
            </button>
            <button 
              onClick={() => setActiveTab('by_company')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === 'by_company' ? 'bg-ui-card text-ui-accent shadow-sm' : 'text-ui-text-muted hover:text-ui-text'
              }`}
            >
              <Building2 className="w-4 h-4" /> By External Partner
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12 pr-2">
        
        {projects.length === 0 && (
           <div className="text-center py-20 bg-ui-card rounded-2xl border border-ui-border shadow-sm transition-colors">
             <Network className="w-12 h-12 text-ui-text-muted opacity-30 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-ui-text">No projects actively tracked</h3>
             <p className="text-ui-text-muted text-sm mt-2">Extract BD memos via Smart Input to populate the matrix.</p>
           </div>
        )}

        {/* =========================================
            VIEW 1: GROUPED BY PIPELINE ASSET
            ========================================= */}
        {activeTab === 'by_project' && Object.entries(groupedByProject).map(([pipelineName, projList]) => {
          const isOpen = openSections[`proj_${pipelineName}`] !== false; // default open
          return (
            <div key={pipelineName} className="mb-6 bg-ui-card rounded-2xl border border-ui-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 transition-colors">
              <button 
                onClick={() => toggleSection(`proj_${pipelineName}`)}
                className="w-full flex items-center justify-between p-5 bg-ui-bg hover:bg-ui-hover transition-colors border-b border-ui-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-ui-accent/10 text-ui-accent flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-extrabold text-ui-text">{pipelineName}</h3>
                    <p className="text-xs font-bold text-ui-text-muted uppercase tracking-widest mt-0.5">
                      Engaging {projList.length} Partner{projList.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {isOpen ? <ChevronDown className="w-5 h-5 text-ui-text-muted" /> : <ChevronRight className="w-5 h-5 text-ui-text-muted" />}
              </button>

              {isOpen && (
                <div className="p-6">
                  {stages.map(stage => {
                    const stageProjects = projList.filter(p => (p.stage || 'Initial Contact') === stage.id);
                    if (stageProjects.length === 0) return null;
                    
                    return (
                      <div key={stage.id} className="mb-8 last:mb-0 relative">
                        <div className="flex items-center gap-3 mb-4 sticky top-0 bg-ui-card z-10 py-1 transition-colors">
                           <span className={`w-3 h-3 rounded-full ${stage.color} shadow-sm`}></span>
                           <h4 className="text-sm font-extrabold text-ui-text uppercase tracking-widest">{stage.label}</h4>
                           <span className="text-[10px] font-bold text-ui-text-muted bg-ui-bg px-2 py-0.5 rounded-full">{stageProjects.length}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {stageProjects.map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => openProjectOverview(p)}
                              className="flex gap-4 p-4 rounded-xl border border-ui-border bg-ui-bg/50 hover:bg-ui-card hover:border-ui-accent/50 hover:shadow-md transition-all group cursor-pointer"
                            >
                              <div className="w-10 h-10 rounded-full bg-ui-accent/10 border-2 border-ui-card shadow-sm flex items-center justify-center font-bold text-ui-accent shrink-0">
                                {p.company?.substring(0,2).toUpperCase() || '??'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-3">
                                    <h5 className="font-bold text-ui-text group-hover:text-ui-accent transition-colors truncate max-w-[120px]" title={p.company}>{p.company}</h5>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setIntelligenceCompany(p.company); }}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-ui-accent text-white rounded-md text-[9px] font-extrabold uppercase tracking-wider shadow-sm shadow-ui-accent/20 transition-all hover:scale-105 shrink-0"
                                    >
                                      <Sparkles className="w-3 h-3" /> AI Dossier
                                    </button>
                                  </div>
                                  <span className="text-[10px] font-bold text-ui-text-muted whitespace-nowrap ml-2"><Clock className="w-3 h-3 inline mr-1 -mt-0.5"/>{p.lastContactDate || 'Recently'}</span>
                                </div>
                                <div className="flex items-start gap-2 mt-2 bg-ui-card p-2.5 rounded-lg border border-ui-border transition-colors">
                                  <MessageSquare className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                  <p className="text-xs font-medium text-ui-text-muted leading-relaxed italic line-clamp-2">
                                    "{getFeedbackSummary(p)}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* =========================================
            VIEW 2: GROUPED BY EXTERNAL COMPANY
            ========================================= */}
        {activeTab === 'by_company' && Object.entries(groupedByCompany).map(([companyName, projList]) => {
          const isOpen = openSections[`comp_${companyName}`] !== false; // default open
          
          return (
            <div key={companyName} className="mb-6 bg-ui-card rounded-2xl border border-ui-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 transition-colors">
               <button 
                onClick={() => toggleSection(`comp_${companyName}`)}
                className="w-full flex items-center justify-between p-5 bg-ui-accent/5 hover:bg-ui-accent/10 transition-colors border-b border-ui-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-ui-accent text-white flex items-center justify-center shadow-sm">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                     <div className="flex items-center gap-4">
                      <h3 className="text-lg font-extrabold text-ui-text">{companyName}</h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIntelligenceCompany(companyName); }}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-ui-accent hover:opacity-90 text-white text-[11px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md shadow-ui-accent/20 hover:scale-105"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> View AI Deep Dive
                      </button>
                    </div>
                    <p className="text-xs font-bold text-ui-accent uppercase tracking-widest mt-0.5 transition-colors">
                      {projList.length} Interfacing Track{projList.length > 1 ? 's' : ''}
                    </p>
                  </div>
                 </div>
                {isOpen ? <ChevronDown className="w-5 h-5 text-ui-text-muted transition-colors" /> : <ChevronRight className="w-5 h-5 text-ui-text-muted transition-colors" />}
              </button>

              {isOpen && (
                <div className="p-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ui-bg border-b border-ui-border text-[10px] font-bold text-ui-text-muted uppercase tracking-widest transition-colors">
                        <th className="p-4 pl-6 w-1/4">Internal Asset</th>
                        <th className="p-4 w-1/5">Current Stage</th>
                        <th className="p-4 w-1/3">Latest Directives & Feedback</th>
                        <th className="p-4 pr-6 w-1/6">Next Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ui-border transition-colors">
                      {projList.map(p => (
                        <tr 
                          key={p.id} 
                          onClick={() => openProjectOverview(p)}
                          className="hover:bg-ui-hover transition-colors group cursor-pointer"
                        >
                          <td className="p-4 pl-6 align-top">
                            <div className="font-bold text-sm text-ui-text">{p.pipeline}</div>
                            <div className="text-[10px] font-bold text-ui-text-muted mt-1 uppercase">ID: PROJ-{p.id}</div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${getStageColor(p.stage || 'Initial Contact')}`}></span>
                              <span className="text-xs font-bold text-ui-text">{p.stage || 'Initial Contact'}</span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <p className="text-xs font-medium text-ui-text-muted leading-relaxed bg-ui-card p-2 border border-ui-border rounded-md shadow-sm">
                              {getFeedbackSummary(p)}
                            </p>
                          </td>
                          <td className="p-4 pr-6 align-top">
                            {p.nextFollowUp ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-ui-text transition-colors">{p.nextFollowUp}</span>
                                <span className="text-[9px] font-bold text-orange-600 bg-orange-100/20 px-2 py-0.5 rounded-full inline-block w-fit">Follow Up</span>
                              </div>
                            ) : (
                              <span className="text-xs text-ui-text-muted italic transition-colors">No dates set</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* Intelligence Modal Overlay */}
      {intelligenceCompany && (
        <IntelligenceModal 
           companyName={intelligenceCompany} 
           onClose={() => setIntelligenceCompany(null)} 
        />
      )}

    </div>
  );
}
