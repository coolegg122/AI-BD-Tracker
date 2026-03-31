import React, { useEffect, useState } from 'react';
import { X, Wand2, ArrowRight, ShieldAlert, Target } from 'lucide-react';
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 flex justify-between items-center relative overflow-hidden">
          {/* subtle background animation */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Wand2 className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">AI Strategic Analysis</h3>
              <p className="text-blue-200 text-xs font-medium">Processing Clinical Intelligence Alert...</p>
            </div>
          </div>
          <button 
            onClick={closeAlertAnalysis} 
            className="text-blue-200 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <Wand2 className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-indigo-800 animate-pulse">Running competitive impact models...</p>
              <p className="text-xs text-slate-400">Cross-referencing FDA citations with internal portfolio.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 font-medium leading-relaxed">
                Based on historical precedent, FDA 483 citations related to aseptic manufacturing (as seen with Vertex's contractor) typically cause a <span className="font-bold underline decoration-blue-300">6 to 9 month delay</span> in PDUFA timelines.
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4" /> 
                  Strategic Action Plan
                </h4>
                
                <ul className="space-y-3">
                  <li className={`flex gap-3 items-start transition-opacity duration-500 ${visibleItems >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Accelerate Project Helios Timeline</p>
                      <p className="text-xs text-slate-500 mt-0.5">We now have a brief window to achieve first-in-class status. Recommend pulling forward the Phase II interim analysis by 4 weeks.</p>
                    </div>
                  </li>
                  <li className={`flex gap-3 items-start transition-opacity duration-500 ${visibleItems >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Target Clinical Trial Sites</p>
                      <p className="text-xs text-slate-500 mt-0.5">Competitor sites may halt enrollment. Instruct our CRO to immediately reach out to Top 10 recruiting sites to capture displaced patients.</p>
                    </div>
                  </li>
                  <li className={`flex gap-3 items-start transition-opacity duration-500 ${visibleItems >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5"><ShieldAlert className="w-3.5 h-3.5" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Review our own CDMO</p>
                      <p className="text-xs text-slate-500 mt-0.5">Ensure our manufacturing partner is strictly compliant to avoid similar systemic FDA scrutiny in aseptic fill-finish.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className={`mt-6 pt-6 border-t border-slate-100 flex justify-end gap-3 transition-opacity duration-500 ${visibleItems >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <button onClick={closeAlertAnalysis} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Close Assessment</button>
                 <button className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2">
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
