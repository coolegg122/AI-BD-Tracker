import React from 'react';
import { CalendarDays, Video, MoreHorizontal, Rocket, Microscope, Gavel, Zap, FileText, Mail, History, Phone, DoorOpen, Wand2, ChevronRight, Activity, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ProjectSlideOver from '../components/ProjectSlideOver';
import AIAnalysisModal from '../components/AIAnalysisModal';
import ProjectFunnel from '../components/charts/ProjectFunnel';
import PortfolioTrend from '../components/charts/PortfolioTrend';

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, dashboardData, dismissAlert, openProjectOverview, openAlertAnalysis } = useStore();

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Syncing Executive Dashboard...</p>
      </div>
    );
  }

  const { catalysts, alerts, dynamics, metrics } = dashboardData;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 relative">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-ui-text mb-1">Executive Overview</h2>
        <p className="text-ui-text-muted font-medium text-sm">Pipeline health and prioritized action items for Week 42.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 p-6 rounded-xl bg-ui-card flex flex-col justify-between shadow-sm border-l-4 border-blue-600 transition-colors">
          <p className="text-[10px] font-bold text-ui-text-muted uppercase tracking-wider mb-2">Total Active Projects</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-400">{projects.length > 0 ? projects.length : metrics.activeProjects}</span>
            <span className="text-[10px] font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">+3 this month</span>
          </div>
        </div>
        <div className="col-span-1 p-6 rounded-xl bg-ui-card flex flex-col justify-between shadow-sm border-l-4 border-orange-500 transition-colors">
          <p className="text-[10px] font-bold text-ui-text-muted uppercase tracking-wider mb-2">Dormant Projects</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-orange-600">0{projects.filter(p => p.status==='dormant').length || metrics.dormantProjects}</span>
            <span className="text-[10px] font-bold text-orange-800 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded">&gt; 14 days idle</span>
          </div>
        </div>
        <div className="col-span-1 p-6 rounded-xl bg-ui-card flex flex-col justify-between shadow-sm border-l-4 border-indigo-500 transition-colors">
          <p className="text-[10px] font-bold text-ui-text-muted uppercase tracking-wider mb-2">Follow-ups This Week</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">{metrics.followUpsThisWeek}</span>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-ui-card focus:outline-none"></div>
              <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-ui-card focus:outline-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 19: PIPELINE INTELLIGENCE VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-ui-card rounded-2xl p-6 border border-ui-border shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-ui-text">Deal Funnel & Stages</h3>
          </div>
          <ProjectFunnel projects={projects} />
        </div>
        
        <div className="bg-ui-card rounded-2xl p-6 border border-ui-border shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-ui-text">Portfolio Momentum</h3>
          </div>
          <PortfolioTrend />
        </div>
      </div>

      {/* PHASE 6: MASTER PIPELINE OVERVIEW */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-ui-text">Master BD Timeline</h3>
          </div>
          <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase" onClick={() => navigate('/pipeline')}>View Full Roster</button>
        </div>
        
        <div className="bg-ui-card rounded-2xl border border-ui-border shadow-sm overflow-hidden transition-colors">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-ui-text-muted text-sm">No BD projects extracted yet. Use Smart Input to build your pipeline.</div>
          ) : (
            <div className="divide-y divide-ui-border">
              {projects.map(p => (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between p-4 hover:bg-ui-hover transition-colors cursor-pointer group"
                  onClick={() => openProjectOverview(p)}
                >
                  <div className="w-1/3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-bold text-xs ring-1 ring-blue-100 dark:ring-blue-800">
                      {p.company?.substring(0,2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ui-text group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{p.company || 'Unnamed Company'}</h4>
                      <p className="text-[11px] text-ui-text-muted line-clamp-1">{p.pipeline || 'No Pipeline Defined'}</p>
                    </div>
                  </div>

                  <div className="w-1/4 hidden md:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-bold text-ui-text tracking-tight">{p.stage || 'Initial'}</span>
                  </div>

                  <div className="w-1/4">
                     <p className="text-[10px] font-bold text-ui-text-muted uppercase tracking-wider mb-0.5">Next Check-in</p>
                     <p className="text-xs font-medium text-ui-text">{p.nextFollowUp || 'TBD'}</p>
                  </div>

                  <div className="flex items-center justify-end w-12 text-slate-300 dark:text-slate-700 group-hover:text-blue-500 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-ui-card rounded-2xl p-6 border border-ui-border shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-ui-text">Upcoming Meetings</h3>
            </div>
            <button className="text-[10px] font-bold text-ui-text-muted uppercase bg-ui-hover px-2 py-1 rounded hover:bg-ui-hover/80" onClick={() => navigate('/schedule')}>Next 7 Days</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-ui-bg rounded-xl border-l-4 border-blue-500 border border-ui-border cursor-pointer transition-colors" onClick={() => navigate('/schedule')}>
              <div className="text-center min-w-[40px]">
                <p className="text-[10px] font-bold text-ui-text-muted uppercase">Oct</p>
                <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">22</p>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-ui-text">Pfizer Alliance Review</h4>
                <p className="text-xs text-ui-text-muted">10:00 AM • Strategic Planning</p>
              </div>
              <Video className="w-4 h-4 text-ui-text-muted opacity-40" />
            </div>
          </div>
        </div>

        <div className="bg-ui-card rounded-2xl p-6 border border-ui-border shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-ui-text">Competitor Catalysts</h3>
            </div>
            <button className="text-[10px] font-bold text-ui-text-muted uppercase bg-ui-hover px-2 py-1 rounded hover:bg-ui-hover/80" onClick={() => navigate('/schedule')}>Next 7 Days</button>
          </div>
          <div className="space-y-4">
            {catalysts.map((cat, idx) => (
              <div key={cat.id} className={`flex items-start gap-4 p-3 bg-ui-bg rounded-xl border-l-4 border border-ui-border transition-colors ${idx === 0 ? 'border-l-orange-500' : 'border-l-indigo-500'}`}>
                <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                  {idx === 0 ? <Microscope className="w-4 h-4" /> : <Gavel className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-ui-text">{cat.competitor}</h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${idx === 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' : 'bg-ui-hover text-ui-text-muted'}`}>{cat.date}</span>
                  </div>
                  <p className="text-[11px] text-ui-text-muted line-clamp-1">{cat.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {alerts.map(alertItem => (
            <div key={alertItem.id} className="bg-gradient-to-r from-blue-50 to-ui-card dark:from-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900 shadow-sm relative overflow-hidden animate-in fade-in zoom-in-95 transition-colors">
              <div className="flex gap-4 items-start relative z-10">
                <div className="bg-ui-card p-2.5 rounded-full shadow-sm">
                  <Wand2 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h5 className="text-[11px] font-extrabold text-blue-700 dark:text-blue-400 mb-1 uppercase tracking-tight">{alertItem.type} Alert</h5>
                  <p className="text-ui-text text-xs leading-relaxed mb-3 font-medium">
                    "{alertItem.content}"
                  </p>
                  <div className="flex gap-3 mt-4 items-center">
                    <button className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded shadow-sm transition-colors" onClick={() => openAlertAnalysis(alertItem.id)}>
                      {alertItem.action || 'Analyze Impact'}
                    </button>
                    <button className="text-[10px] font-bold text-ui-text-muted hover:text-ui-text px-3 py-1.5" onClick={() => dismissAlert(alertItem.id)}>Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-ui-card rounded-2xl p-6 h-full border border-ui-border shadow-sm transition-colors">
            <h3 className="text-lg font-bold mb-6 text-ui-text">Recent Dynamics</h3>
            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-ui-border">
              {dynamics.slice(0, 3).map(dyn => (
                <div key={dyn.id} className={`relative pl-8 ${dyn.opacity || ''} group`}>
                  <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-ui-card transition-transform group-hover:scale-110
                    ${dyn.type === 'email' ? 'bg-blue-600' : dyn.type === 'call' ? 'bg-orange-500' : 'bg-slate-400'}
                  `}>
                    {dyn.type === 'email' && <Mail className="w-3 h-3" />}
                    {dyn.type === 'call' && <Phone className="w-3 h-3" />}
                    {dyn.type === 'internal' && <DoorOpen className="w-3 h-3" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-ui-text leading-tight">{dyn.title}</h5>
                    <p className="text-[11px] text-ui-text-muted mt-1 line-clamp-1">{dyn.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over component rendered at top level */}
      <ProjectSlideOver />
      <AIAnalysisModal />
    </div>
  );
}
