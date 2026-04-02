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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-ui-card rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-ui-border transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-ui-accent text-white shrink-0 relative overflow-hidden transition-colors">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 -translate-y-1/2"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 transition-colors">
              <Sparkles className="w-6 h-6 text-ui-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 transition-colors">
                <Building2 className="w-5 h-5 text-ui-accent/80" />
                {companyName}
              </h2>
              <p className="text-white/80 text-sm font-medium mt-0.5 tracking-wide flex items-center gap-2 transition-colors">
                {data && <span className="px-2 py-0.5 rounded text-[10px] bg-white/20 border border-white/30 uppercase tracking-widest text-white transition-colors">Cached</span>}
                AI Competitive Intelligence Dossier
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-white/20 rounded-full transition-all relative z-10 -mr-2"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-ui-bg transition-colors">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-ui-accent blur-xl opacity-20 rounded-full"></div>
                <Loader2 className="w-12 h-12 text-ui-accent animate-spin relative z-10" />
              </div>
              <p className="text-ui-text font-bold text-lg">Gathering Global Intelligence...</p>
              <p className="text-ui-text-muted text-sm mt-2 max-w-sm text-center italic">Consulting LLM engines and probing strategic datasets for {companyName}.</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-ui-error/10 text-ui-error rounded-2xl font-bold flex flex-col items-center justify-center py-12 border border-ui-error/20 shadow-sm">
               <X className="w-10 h-10 text-ui-error mb-4" />
               Failed to generate intelligence dossier. <br/>
               <span className="text-sm font-medium mt-2 text-ui-error/80">{error}</span>
            </div>
          ) : data ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Strategy & Focus Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* BD Strategy */}
                <div className="bg-ui-card p-6 rounded-2xl shadow-sm border border-ui-border relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-ui-accent rounded-bl-full -mr-4 -mt-4 opacity-5"></div>
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-ui-text uppercase tracking-widest mb-4">
                    <Target className="w-5 h-5 text-ui-accent" /> BD Strategy & Appetite
                  </h3>
                  <p className="text-ui-text-muted font-medium leading-relaxed relative z-10">
                    {data.bd_strategy || "No specific strategy profile extracted."}
                  </p>
                </div>

                 {/* Focus Areas */}
                <div className="bg-ui-card p-6 rounded-2xl shadow-sm border border-ui-border transition-colors">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-ui-text uppercase tracking-widest mb-5 transition-colors">
                    <Microscope className="w-5 h-5 text-ui-warning" /> Core Therapeutic Focus
                  </h3>
                  <div className="flex flex-wrap gap-2.5 transition-colors">
                    {data.focus_areas && data.focus_areas.length > 0 ? (
                       data.focus_areas.map((area, idx) => (
                         <span key={idx} className="px-4 py-2 bg-ui-warning/10 text-ui-warning rounded-xl text-sm font-bold border border-ui-warning/20 transition-colors">
                           {area}
                         </span>
                       ))
                    ) : (
                       <span className="text-ui-text-muted text-sm">No specific focus areas documented.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Patent Cliffs */}
              {data.patent_cliffs && data.patent_cliffs.length > 0 && (
                <div className="bg-ui-card p-6 rounded-2xl shadow-sm border border-ui-border border-l-4 border-l-ui-error transition-colors">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-ui-text uppercase tracking-widest mb-4 transition-colors">
                    <Network className="w-5 h-5 text-ui-error" /> Looming Patent Cliffs
                  </h3>
                  <ul className="space-y-3">
                    {data.patent_cliffs.map((cliff, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-ui-text-muted font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-ui-error mt-2 shrink-0"></span>
                        {cliff}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

               {/* Recent Deals Table */}
              <div className="bg-ui-card rounded-2xl shadow-sm border border-ui-border overflow-hidden transition-colors">
                <div className="p-6 border-b border-ui-border bg-ui-sidebar/50">
                   <h3 className="flex items-center gap-2 text-sm font-extrabold text-ui-text uppercase tracking-widest transition-colors">
                    <Briefcase className="w-5 h-5 text-ui-success" /> Recent Precedent Deals
                  </h3>
                </div>
                <div className="overflow-x-auto transition-colors">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ui-card text-xs uppercase tracking-wider text-ui-text-muted border-b border-ui-border transition-colors">
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-6 py-4 font-bold">Target / Partner</th>
                        <th className="px-6 py-4 font-bold">Type</th>
                        <th className="px-6 py-4 font-bold text-right">Deal Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ui-border transition-colors">
                       {data.recent_deals && data.recent_deals.length > 0 ? (
                        data.recent_deals.map((deal, idx) => (
                          <tr key={idx} className="hover:bg-ui-hover transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-ui-text-muted transition-colors">{deal.date}</td>
                            <td className="px-6 py-4 text-sm font-bold text-ui-text transition-colors">{deal.target}</td>
                            <td className="px-6 py-4 transition-colors">
                               <span className="inline-block px-3 py-1 bg-ui-success/10 text-ui-success rounded-lg text-xs font-bold border border-ui-success/20 transition-colors">
                                 {deal.deal_type}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-ui-text-muted text-right">{deal.value}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-ui-text-muted text-sm">No recent deals extracted.</td>
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
          <div className="bg-ui-sidebar px-8 py-4 border-t border-ui-border flex items-center justify-between shrink-0 transition-colors">
            <span className="text-xs font-medium text-ui-text-muted flex items-center gap-1.5 transition-colors">
               <Sparkles className="w-3.5 h-3.5 text-ui-accent" /> Generated by AI Architecture
            </span>
            <span className="text-xs font-medium text-ui-text-muted transition-colors">
               Last updated: {data.last_updated}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
