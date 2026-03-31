import React, { useEffect, useState } from 'react';
import { X, Network, Briefcase, Microscope, Target, Loader2, Sparkles, Building2 } from 'lucide-react';
import { api } from '../services/api';

export default function IntelligenceModal({ companyName, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyName) return;
    
    let isMounted = true;
    setLoading(true);
    
    api.getCompanyIntelligence(companyName)
      .then(res => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });
      
    return () => { isMounted = false; };
  }, [companyName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-indigo-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Sparkles className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                {companyName}
              </h2>
              <p className="text-indigo-200 text-sm font-medium mt-0.5 tracking-wide flex items-center gap-2">
                AI Competitive Intelligence Dossier
                {data && <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/30 border border-indigo-400/30 uppercase tracking-widest text-indigo-100">Cached</span>}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-white/20 rounded-full transition-colors relative z-10 -mr-2"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafd]">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
              </div>
              <p className="text-slate-600 font-bold text-lg">Gathering Global Intelligence...</p>
              <p className="text-slate-400 text-sm mt-2 max-w-sm text-center">Consulting LLM engines and probing strategic datasets for {companyName}.</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-2xl font-bold flex flex-col items-center justify-center py-12 border border-red-100 shadow-sm">
               <X className="w-10 h-10 text-red-500 mb-4" />
               Failed to generate intelligence dossier. <br/>
               <span className="text-sm font-medium mt-2 text-red-500/80">{error}</span>
            </div>
          ) : data ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Strategy & Focus Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* BD Strategy */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-4">
                    <Target className="w-5 h-5 text-indigo-500" /> BD Strategy & Appetite
                  </h3>
                  <p className="text-slate-600 font-medium leading-relaxed relative z-10">
                    {data.bd_strategy || "No specific strategy profile extracted."}
                  </p>
                </div>

                {/* Focus Areas */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-5">
                    <Microscope className="w-5 h-5 text-orange-500" /> Core Therapeutic Focus
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {data.focus_areas && data.focus_areas.length > 0 ? (
                       data.focus_areas.map((area, idx) => (
                         <span key={idx} className="px-4 py-2 bg-orange-50/80 text-orange-800 rounded-xl text-sm font-bold border border-orange-100">
                           {area}
                         </span>
                       ))
                    ) : (
                       <span className="text-slate-400 text-sm">No specific focus areas documented.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Patent Cliffs */}
              {data.patent_cliffs && data.patent_cliffs.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-red-400">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-4">
                    <Network className="w-5 h-5 text-red-500" /> Looming Patent Cliffs
                  </h3>
                  <ul className="space-y-3">
                    {data.patent_cliffs.map((cliff, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                        {cliff}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recent Deals Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-widest">
                    <Briefcase className="w-5 h-5 text-emerald-500" /> Recent Precedent Deals
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-6 py-4 font-bold">Target / Partner</th>
                        <th className="px-6 py-4 font-bold">Type</th>
                        <th className="px-6 py-4 font-bold text-right">Deal Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.recent_deals && data.recent_deals.length > 0 ? (
                        data.recent_deals.map((deal, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-500">{deal.date}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{deal.target}</td>
                            <td className="px-6 py-4">
                               <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                                 {deal.deal_type}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-700 text-right">{deal.value}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-sm">No recent deals extracted.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : null}
          
        </div>
        
        {/* Footer */}
        {data && (
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
               <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Generated by AI Architecture
            </span>
            <span className="text-xs font-medium text-slate-400">
               Last updated: {data.last_updated}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
