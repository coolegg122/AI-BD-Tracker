import React, { useEffect, useState } from 'react';
import { X, Wand2, ArrowRight, ShieldAlert, Target, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AIAnalysisModal() {
  const { selectedAlertForAnalysis, closeAlertAnalysis } = useStore();
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    if (selectedAlertForAnalysis) {
      setLoading(true);
      setVisibleItems(0);
      
      // Simulate AI thinking time
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedAlertForAnalysis]);

  useEffect(() => {
    if (!loading && selectedAlertForAnalysis) {
      // Simulate streaming list items one by one
      const interval = setInterval(() => {
        setVisibleItems(v => {
          if (v < 3) return v + 1;
          clearInterval(interval);
          return v;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading, selectedAlertForAnalysis]);

  if (!selectedAlertForAnalysis) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all overflow-y-auto">
      <div 
        className="bg-ui-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-ui-border"
      >
        <div className="bg-gradient-to-r from-slate-800 to-slate-950 px-6 py-5 flex justify-between items-center relative overflow-hidden transition-colors">
          {/* subtle background animation */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-ui-accent/20 p-2.5 rounded-xl backdrop-blur-md transition-colors">
              <Wand2 className="w-5 h-5 text-ui-accent" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight transition-colors">AI Strategic Analysis</h3>
              <p className="text-slate-400 text-xs font-medium transition-colors">Processing Clinical Intelligence Alert...</p>
            </div>
          </div>
          <button 
            onClick={closeAlertAnalysis} 
            className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 min-h-[300px] bg-ui-card transition-colors">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-ui-accent/10 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-ui-accent border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <Wand2 className="w-5 h-5 text-ui-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-ui-accent animate-pulse">Running competitive impact models...</p>
              <p className="text-xs text-ui-text-muted">Cross-referencing FDA citations with internal portfolio.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-ui-accent/5 border border-ui-accent/10 rounded-xl p-4 text-sm text-ui-text font-medium leading-relaxed transition-colors">
                Based on historical precedent, FDA 483 citations related to aseptic manufacturing (as seen with Vertex's contractor) typically cause a <span className="font-bold underline decoration-ui-accent/30 text-ui-accent">6 to 9 month delay</span> in PDUFA timelines.
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-ui-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-ui-accent" /> 
                  Strategic Action Plan
                </h4>
                
                <ul className="space-y-3">
                  <li className={`flex gap-3 items-start transition-opacity duration-500 ${visibleItems >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                    <div>
                      <p className="text-sm font-bold text-ui-text">Accelerate Project Helios Timeline</p>
                      <p className="text-xs text-ui-text-muted mt-0.5">We now have a brief window to achieve first-in-class status. Recommend pulling forward the Phase II interim analysis by 4 weeks.</p>
                    </div>
                  </li>
                  <li className={`flex gap-3 items-start transition-opacity duration-500 ${visibleItems >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-6 h-6 rounded-full bg-ui-accent/10 text-ui-accent flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                    <div>
                      <p className="text-sm font-bold text-ui-text">Target Clinical Trial Sites</p>
                      <p className="text-xs text-ui-text-muted mt-0.5">Competitor sites may halt enrollment. Instruct our CRO to immediately reach out to Top 10 recruiting sites to capture displaced patients.</p>
                    </div>
                  </li>
                   <li className={`flex gap-3 items-start transition-all duration-500 ${visibleItems >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-6 h-6 rounded-full bg-ui-warning/10 text-ui-warning flex items-center justify-center shrink-0 mt-0.5"><ShieldAlert className="w-3.5 h-3.5" /></div>
                    <div>
                      <p className="text-sm font-bold text-ui-text">Review our own CDMO</p>
                      <p className="text-xs text-ui-text-muted mt-0.5">Ensure our manufacturing partner is strictly compliant to avoid similar systemic FDA scrutiny in aseptic fill-finish.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className={`mt-6 pt-6 border-t border-ui-border flex justify-end gap-3 transition-opacity duration-500 ${visibleItems >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <button onClick={closeAlertAnalysis} className="px-4 py-2 text-sm font-bold text-ui-text-muted hover:bg-ui-hover rounded-lg transition-colors">Close Assessment</button>
                 <button className="px-5 py-2 text-sm font-bold text-white bg-ui-accent hover:bg-ui-accent/90 rounded-lg shadow-sm transition-all flex items-center gap-2">
                   Draft Directives <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
