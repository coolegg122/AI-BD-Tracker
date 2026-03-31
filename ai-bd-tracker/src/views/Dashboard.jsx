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
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Executive Overview</h2>
        <p className="text-slate-500 font-medium text-sm">Pipeline health and prioritized action items for Week 42.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 p-6 rounded-xl bg-white flex flex-col justify-between shadow-sm border-l-4 border-blue-600">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Active Projects</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-blue-700">{projects.length > 0 ? projects.length : metrics.activeProjects}</span>
            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded">+3 this month</span>
          </div>
        </div>
        <div className="col-span-1 p-6 rounded-xl bg-white flex flex-col justify-between shadow-sm border-l-4 border-orange-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Dormant Projects</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-orange-600">0{projects.filter(p => p.status==='dormant').length || metrics.dormantProjects}</span>
            <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-1 rounded">&gt; 14 days idle</span>
          </div>
        </div>
        <div className="col-span-1 p-6 rounded-xl bg-white flex flex-col justify-between shadow-sm border-l-4 border-indigo-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Follow-ups This Week</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-indigo-700">{metrics.followUpsThisWeek}</span>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white focus:outline-none"></div>
              <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white focus:outline-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 19: PIPELINE INTELLIGENCE VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Deal Funnel & Stages</h3>
          </div>
          <ProjectFunnel projects={projects} />
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold">Portfolio Momentum</h3>
          </div>
          <PortfolioTrend />
        </div>
      </div>

      {/* PHASE 6: MASTER PIPELINE OVERVIEW */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Master BD Timeline</h3>
          </div>
          <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase" onClick={() => navigate('/pipeline')}>View Full Roster</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No BD projects extracted yet. Use Smart Input to build your pipeline.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projects.map(p => (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => openProjectOverview(p)}
                >
                  <div className="w-1/3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 font-bold text-xs ring-1 ring-blue-100">
                      {p.company?.substring(0,2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">{p.company || 'Unnamed Company'}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{p.pipeline || 'No Pipeline Defined'}</p>
                    </div>
                  </div>

                  <div className="w-1/4 hidden md:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-bold text-slate-700 tracking-tight">{p.stage || 'Initial'}</span>
                  </div>

                  <div className="w-1/4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Next Check-in</p>
                     <p className="text-xs font-medium text-slate-900">{p.nextFollowUp || 'TBD'}</p>
                  </div>

                  <div className="flex items-center justify-end w-12 text-slate-300 group-hover:text-blue-500 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold">Upcoming Meetings</h3>
            </div>
            <button className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded hover:bg-slate-200" onClick={() => navigate('/schedule')}>Next 7 Days</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border-l-4 border-blue-500 border border-slate-100 cursor-pointer" onClick={() => navigate('/schedule')}>
              <div className="text-center min-w-[40px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Oct</p>
                <p className="text-xl font-extrabold text-blue-600">22</p>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">Pfizer Alliance Review</h4>
                <p className="text-xs text-slate-500">10:00 AM • Strategic Planning</p>
              </div>
              <Video className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold">Competitor Catalysts</h3>
            </div>
            <button className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded hover:bg-slate-200" onClick={() => navigate('/schedule')}>Next 7 Days</button>
          </div>
          <div className="space-y-4">
            {catalysts.map((cat, idx) => (
              <div key={cat.id} className={`flex items-start gap-4 p-3 bg-slate-50 rounded-xl border-l-4 border border-slate-100 ${idx === 0 ? 'border-l-orange-500' : 'border-l-indigo-500'}`}>
                <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {idx === 0 ? <Microscope className="w-4 h-4" /> : <Gavel className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-slate-900">{cat.competitor}</h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${idx === 0 ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-600'}`}>{cat.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{cat.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {alerts.map(alertItem => (
            <div key={alertItem.id} className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden animate-in fade-in zoom-in-95">
              <div className="flex gap-4 items-start relative z-10">
                <div className="bg-white p-2.5 rounded-full shadow-sm">
                  <Wand2 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h5 className="text-[11px] font-extrabold text-blue-700 mb-1 uppercase tracking-tight">{alertItem.type} Alert</h5>
                  <p className="text-slate-800 text-xs leading-relaxed mb-3 font-medium">
                    "{alertItem.content}"
                  </p>
                  <div className="flex gap-3 mt-4 items-center">
                    <button className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded shadow-sm transition-colors" onClick={() => openAlertAnalysis(alertItem.id)}>
                      {alertItem.action || 'Analyze Impact'}
                    </button>
                    <button className="text-[10px] font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5" onClick={() => dismissAlert(alertItem.id)}>Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 h-full border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Recent Dynamics</h3>
            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {dynamics.slice(0, 3).map(dyn => (
                <div key={dyn.id} className={`relative pl-8 ${dyn.opacity || ''} group`}>
                  <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white transition-transform group-hover:scale-110
                    ${dyn.type === 'email' ? 'bg-blue-600' : dyn.type === 'call' ? 'bg-orange-500' : 'bg-slate-400'}
                  `}>
                    {dyn.type === 'email' && <Mail className="w-3 h-3" />}
                    {dyn.type === 'call' && <Phone className="w-3 h-3" />}
                    {dyn.type === 'internal' && <DoorOpen className="w-3 h-3" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">{dyn.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{dyn.desc}</p>
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
