import React, { useState } from 'react';
import { FileText, Wand2, Microscope } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

export default function SmartInput() {
  const { addProject } = useStore();
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);

  const handleAIParse = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setParsedResult(null);

    try {
      // 1. Call Backend API to extract info
      const extractedData = await api.extractProjects(inputText);
      
      // 2. Call Backend API to save project
      const savedProject = await api.createProject(extractedData);
      
      setParsedResult(savedProject);
      addProject(savedProject); // Use Zustand's built-in addProject method
      
    } catch (error) {
      console.error("AI Parse failed:", error);
      // Fallback for UI visualization if backend fails (dev mode only)
      alert("Backend API is not reachable. Please start the FastAPI server.");
    }

    setIsAnalyzing(false);
    setInputText('');
  };

  const fillTestData = () => {
    setInputText("FWD: Ipsen Pharma Discussion. \n\nHi team, just got off the call with Ipsen regarding the CABOMETYX® expansion study. They are very keen. We need to circulate the NDA for internal legal review by EOD Tuesday. Also, please update the deal model with the new Phase II patient enrollment figures they shared. Let's aim to close initial diligence in 3 days.");
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Smart Input</h2>
        <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">Paste raw text from unstructured sources to automatically extract clinical trial data, deal terms, and follow-up tasks using our architectural AI.</p>
      </div>

      <section className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-orange-50 rounded-2xl blur opacity-40 transition duration-1000"></div>
          <div className="relative bg-white rounded-xl shadow-sm overflow-hidden transition-all border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Source Content</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium bg-slate-200 px-2 py-1 rounded">Markdown Supported</span>
            </div>
            <textarea 
              className="w-full h-56 p-6 bg-transparent border-none focus:ring-0 text-slate-800 resize-none placeholder:text-slate-400 leading-relaxed focus:outline-none" 
              placeholder="Paste email threads, WeChat chat logs, or meeting minutes here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 mr-2">QUICK TEST:</span>
            <button onClick={fillTestData} className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors border border-slate-200 shadow-sm">
              J&J Minutes
            </button>
            <button onClick={fillTestData} className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors border border-slate-200 shadow-sm">
              Ipsen WeChat
            </button>
          </div>
          <button 
            onClick={handleAIParse}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-br from-blue-700 to-blue-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-blue-900/20 hover:scale-[0.98] transition-all disabled:opacity-70"
          >
            <Wand2 className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Extracting via AI...' : 'AI One-click Extract & Archive'}</span>
          </button>
        </div>
      </section>

      {parsedResult && (
        <section className="mt-12 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <Wand2 className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold">Latest Extraction Preview</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Organization</label>
                  <h4 className="text-2xl font-extrabold text-blue-700">{parsedResult.company}</h4>
                </div>
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider">
                  Phase IIb
                </div>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pipeline Project</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                      <Microscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{parsedResult.pipeline}</p>
                      <p className="text-xs text-slate-500">Oncology • Small Molecule</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Next Action Items</label>
                  <ul className="space-y-3">
                    {parsedResult.tasks?.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-3 group">
                        <div className="mt-1 w-4 h-4 rounded-full border-2 border-blue-200 flex items-center justify-center"></div>
                        <span className="text-sm text-slate-800">{task.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Critical Deadline</label>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-red-600">12</span>
                  <div className="mb-1">
                    <p className="text-xs font-bold leading-none">OCTOBER</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{parsedResult.nextFollowUp}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Deal Progress</label>
                <div className="relative h-2 bg-slate-200 rounded-full mb-6">
                  <div className="absolute left-0 top-0 h-full bg-blue-600 rounded-full" style={{width: '20%'}}></div>
                  <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 border-4 border-white rounded-full shadow-md"></div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <span className="text-blue-600">CONTACT</span>
                  <span>DUE DILIGENCE</span>
                  <span>CLOSING</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
