import React, { useState, useEffect } from 'react';
import {
  Activity, LayoutDashboard, GitMerge, Calendar, Settings, User,
  Search, Bell, HelpCircle, Wand2, TrendingUp, CalendarDays,
  Video, MoreHorizontal, Rocket, Microscope, Gavel, Zap,
  FileText, FlaskConical, Handshake, Mail, History, Phone,
  DoorOpen, Archive, Filter, Plus, ChevronLeft, ChevronRight,
  CalendarCheck, AlertCircle, Clock, X, CheckCircle2, ChevronDown
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';

// --- Firebase Initialization ---
let app, auth, db, appId;
try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ?__app_id : 'default-app-id';
} catch (error) {
  console.error("Firebase init failed:", error);
}

// --- 初始模拟数据 ---
const initialCatalysts = [
  { id: 1, competitor: 'Vertex Pharma', asset: 'VX-548 (Pain)', event: 'Phase III Top-line data release.', date: 'Oct 23', impact: 'High' },
  { id: 2, competitor: 'Merck & Co.', asset: 'Keytruda sBLA', event: 'FDA PDUFA Date: early-stage NSCLC.', date: 'Oct 25', impact: 'Medium' }
];

const initialProjects = [
  {
    id: 1, company: 'Solaris Biotech', pipeline: 'Rare Disease • Phase IIb', stage: 'Negotiation',
    lastContactDate: '3d ago', nextFollowUp: '2026-04-05', status: 'active',
    owner: { name: 'M. Knight', role: 'Lead Negotiator', initials: 'MK' },
    tasks: [{ type: 'meeting', desc: 'Solaris M&A: Initial Outreach', date: 'TBD', status: 'tentative' }]
  },
  {
    id: 2, company: 'Aurelius Vaccines', pipeline: 'Infectious Disease • Phase III', stage: 'Due Diligence',
    lastContactDate: '6d ago', nextFollowUp: '2026-03-20', status: 'overdue',
    owner: { name: 'R. Gupta', role: 'Clinical Lead', initials: 'RG' },
    tasks: [{ type: 'share', desc: 'Diligence report overdue. Awaiting legal sign-off.', date: '2026-03-20', status: 'overdue' }]
  },
  {
    id: 3, company: 'GenePath Therapeutics', pipeline: 'Gene Therapy • Phase II', stage: 'CDA Signed',
    lastContactDate: '1d ago', nextFollowUp: '2026-04-10', status: 'active',
    owner: { name: 'J. Doe', role: 'BD Manager', initials: 'JD' },
    tasks: [{ type: 'meeting', desc: 'Novartis Licensing - T1 Discussion', date: '14:00 - 15:00', status: 'confirmed' }]
  },
  {
    id: 4, company: 'Project Xylophone', pipeline: 'Neuro-Immunology • Phase I', stage: 'Initial Contact',
    lastContactDate: '3d ago', nextFollowUp: '2026-04-12', status: 'active',
    owner: { name: 'E. Chen', role: 'Analyst', initials: 'EC' },
    tasks: [{ type: 'share', desc: 'Review Phase II clinical results and CMC doc.', date: 'Due Tomorrow', status: 'pending' }]
  }
];

const STAGES = [
  { id: 'Initial Contact', label: 'Initial Contact', color: 'bg-slate-400' },
  { id: 'CDA Signed', label: 'CDA Signed', color: 'bg-indigo-500' },
  { id: 'Due Diligence', label: 'DD', color: 'bg-orange-500' },
  { id: 'Term Sheet', label: 'Term Sheet', color: 'bg-blue-600' },
  { id: 'Negotiation', label: 'Negotiation', color: 'bg-blue-800' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([]); // 初始为空，将从云端数据库拉取
  const [catalysts, setCatalysts] = useState(initialCatalysts);
  
  // Smart Input States
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  
  // Auth State
  const [user, setUser] = useState(null);

  // --- Firebase Auth & 数据同步 (Real Backend Integration) ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' &&__initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    // 监听当前用户的私有项目数据库
    const projectsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'projects');
    const unsub = onSnapshot(projectsRef, (snap) => {
      // 修复: 确保 id: d.id 写在 ...d.data() 之后，防止数据中的 mock id 覆盖真实文档 ID
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      // 如果数据库为空，灌入初始测试数据
      if (data.length === 0 && initialProjects.length > 0) {
        // 修复: 剔除硬编码的 mock ID 再写入数据库，完全依赖 Firebase 生成的文档 ID
        initialProjects.forEach(({ id, ...p }) => addDoc(projectsRef, p));
      } else {
        setProjects(data);
      }
    }, (err) => console.error(err));
    return () => unsub();
  }, [user]);

  // 后端：更新项目状态
  const updateProjectStage = async (projectId, newStage) => {
    if (user && db) {
      const projectRef = doc(db, 'artifacts', appId, 'users', user.uid, 'projects', projectId);
      await updateDoc(projectRef, { stage: newStage });
    } else {
      setProjects(projects.map(p => p.id === projectId ? { ...p, stage: newStage } : p));
    }
  };

  // 后端：真实的 AI 大模型解析 API 调用
  const handleAIParse = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setParsedResult(null);

    try {
      const apiKey = ""; // 环境变量自动注入
      const systemPrompt = `你是一个专业的医药BD助手。请从用户输入的沟通记录中提取项目信息。
      必须只返回一个符合以下结构的JSON对象：
      {
        "company": "公司名称",
        "pipeline": "管线或资产名称",
        "stage": "Initial Contact",
        "nextFollowUp": "YYYY-MM-DD (提取或推断的跟进时间)",
        "tasks": [
          { "type": "meeting" | "share" | "follow_up", "desc": "具体的待办事项描述", "date": "日期或 TBD", "status": "pending" | "tentative" | "confirmed" }
        ]
      }`;

      // 调用真实的 Gemini AI 接口
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: inputText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const extractedData = JSON.parse(data.candidates[0].content.parts[0].text);

      const newProject = {
        ...extractedData,
        lastContactDate: new Date().toISOString().split('T')[0],
        status: 'active',
        owner: { name: 'Alex Sterling', role: 'VP', initials: 'AS' }
      };

      // 存入云端数据库
      if (user && db) {
        const projectsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'projects');
        const docRef = await addDoc(projectsRef, newProject);
        setParsedResult({ ...newProject, id: docRef.id });
      } else {
        const newProjectWithId = { ...newProject, id: Date.now() };
        setParsedResult(newProjectWithId);
        setProjects(prev => [newProjectWithId, ...prev]);
      }
    } catch (error) {
      console.error("AI 解析失败:", error);
    }

    setIsAnalyzing(false);
    setInputText('');
  };

  const fillTestData = () => {
    setInputText("FWD: Ipsen Pharma Discussion. \n\nHi team, just got off the call with Ipsen regarding the CABOMETYX® expansion study. They are very keen. We need to circulate the NDA for internal legal review by EOD Tuesday. Also, please update the deal model with the new Phase II patient enrollment figures they shared. Let's aim to close initial diligence in 3 days.");
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

      {/* 侧边栏 (Sidebar) */}
      <aside className="w-64 flex-shrink-0 bg-slate-100 flex flex-col border-r border-slate-200/60 z-20">
        <div className="flex flex-col h-full py-6">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">AI-BD Tracker</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">Clinical Architect</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-3 space-y-1 font-medium text-sm">
            <button 
              onClick={() => setActiveTab('input')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'input' ? 'bg-white text-blue-800 font-bold shadow-sm border-l-4 border-blue-700' : 'text-slate-600 hover:bg-slate-200/50'}`}
            >
              <Wand2 className="w-5 h-5" />
              <span>Smart Input</span>
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-white text-blue-800 font-bold shadow-sm border-l-4 border-blue-700' : 'text-slate-600 hover:bg-slate-200/50'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('pipeline')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'pipeline' ? 'bg-white text-blue-800 font-bold shadow-sm border-l-4 border-blue-700' : 'text-slate-600 hover:bg-slate-200/50'}`}
            >
              <GitMerge className="w-5 h-5" />
              <span>Pipeline</span>
            </button>
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'schedule' ? 'bg-white text-blue-800 font-bold shadow-sm border-l-4 border-blue-700' : 'text-slate-600 hover:bg-slate-200/50'}`}
            >
              <CalendarDays className="w-5 h-5" />
              <span>Schedule</span>
            </button>
          </nav>
          
          <div className="mt-auto px-3 pt-6 border-t border-slate-200/50">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors text-sm font-medium">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors text-sm font-medium mt-1">
              <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px] text-white font-bold">AS</div>
              <span>Profile</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 右侧主区域 */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f7f9fb] relative">
        
        {/* 顶部导航条 (Topbar) */}
        <header className="h-16 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 z-30 shadow-sm border-b border-slate-200/50">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all" 
                placeholder="Search pipeline, assets, or stakeholders..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-blue-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
              </button>
              <button className="text-slate-500 hover:text-blue-700 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-200 transition-all">
                <Wand2 className="w-4 h-4" />
                AI Insights
              </button>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-none">Alex Sterling</p>
                <p className="text-[10px] text-slate-500 mt-1">VP, Business Development</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                AS
              </div>
            </div>
          </div>
        </header>

        {/* 主内容滚动区 */}
        <main className="flex-1 overflow-auto p-8 relative">
          
          {/* ==================== 1. Smart Input View ==================== */}
          {activeTab === 'input' && (
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
                    ></textarea>
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
                    {/* Main Card */}
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
                            {parsedResult.tasks.map((task, idx) => (
                              <li key={idx} className="flex items-start gap-3 group">
                                <div className="mt-1 w-4 h-4 rounded-full border-2 border-blue-200 flex items-center justify-center"></div>
                                <span className="text-sm text-slate-800">{task.desc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Meta Cards */}
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
          )}

          {/* ==================== 2. Dashboard View ==================== */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Executive Overview</h2>
                <p className="text-slate-500 font-medium text-sm">Pipeline health and prioritized action items for Week 42.</p>
              </div>

              {/* Stats Bento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-1 p-6 rounded-xl bg-white flex flex-col justify-between shadow-sm border-l-4 border-blue-600">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Active Projects</p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-extrabold text-blue-700">{projects.length}</span>
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded">+3 this month</span>
                  </div>
                </div>
                <div className="col-span-1 p-6 rounded-xl bg-white flex flex-col justify-between shadow-sm border-l-4 border-orange-500">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Dormant Projects</p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-extrabold text-orange-600">02</span>
                    <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-1 rounded">&gt; 14 days idle</span>
                  </div>
                </div>
                <div className="col-span-1 p-6 rounded-xl bg-white flex flex-col justify-between shadow-sm border-l-4 border-indigo-500">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Follow-ups This Week</p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-extrabold text-indigo-700">12</span>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                      <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meetings & Catalysts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold">Upcoming Meetings</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">Next 7 Days</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border-l-4 border-blue-500 border border-slate-100">
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
                    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border-l-4 border-slate-300 border border-slate-100">
                      <div className="text-center min-w-[40px]">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Oct</p>
                        <p className="text-xl font-extrabold text-slate-800">24</p>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">Series B Pitch: NovaLabs</h4>
                        <p className="text-xs text-slate-500">02:30 PM • Venture Capital</p>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-orange-500" />
                      <h3 className="text-lg font-bold">Competitor Catalysts</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">Next 7 Days</span>
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

              {/* Follow-ups & Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      <h3 className="text-lg font-bold">Smart Follow-ups</h3>
                    </div>
                    <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase">View All Critical</button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Render Overdue Projects */}
                    {projects.filter(p => p.status === 'overdue').map((p, idx) => (
                       <div key={idx} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 hover:border-blue-300 group flex items-start justify-between">
                         <div className="flex gap-4">
                           <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                             <FileText className="w-5 h-5" />
                           </div>
                           <div>
                             <div className="flex items-center gap-2 mb-1">
                               <h4 className="font-bold text-sm text-slate-900">{p.company}</h4>
                               <span className="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Stalled / Overdue</span>
                             </div>
                             <p className="text-xs text-slate-500 italic line-clamp-1">{p.tasks[0]?.desc}</p>
                           </div>
                         </div>
                         <button className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors shrink-0 border border-blue-200">
                           <Mail className="w-3.5 h-3.5" />
                           Follow-up
                         </button>
                       </div>
                    ))}
                  </div>

                  {/* AI Pulse Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden mt-6">
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="bg-white p-2.5 rounded-full shadow-sm">
                        <Wand2 className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-extrabold text-blue-700 mb-1 uppercase tracking-tight">Clinical Intelligence Alert</h5>
                        <p className="text-slate-800 text-xs leading-relaxed mb-3 font-medium">
                          "Analysis of recent FDA 483 citations suggests your competitor Vertex Pharma may be facing delays in the same therapeutic class as Project Helios. This increases our leverage for the upcoming partnership negotiation."
                        </p>
                        <div className="flex gap-3">
                          <button className="text-[10px] font-bold bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-200">Analyze Impact</button>
                          <button className="text-[10px] font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5">Dismiss</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-6 h-full border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold">Recent Dynamics</h3>
                      <History className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0.5 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white ring-4 ring-white">
                          <Mail className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-0.5">Today, 10:24 AM</p>
                          <h5 className="text-xs font-bold text-slate-800 leading-tight">Email sent to Pfizer BD</h5>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">Follow-up on the technical data package for Asset BDX-402.</p>
                        </div>
                      </div>

                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0.5 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white ring-4 ring-white">
                          <Phone className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-0.5">Yesterday</p>
                          <h5 className="text-xs font-bold text-slate-800 leading-tight">Call: Merck Venture Fund</h5>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">Discussion regarding Series B participation terms.</p>
                        </div>
                      </div>

                      <div className="relative pl-8 opacity-60">
                        <div className="absolute left-0 top-0.5 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-white ring-4 ring-white">
                          <DoorOpen className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-0.5">Oct 12</p>
                          <h5 className="text-xs font-bold text-slate-800 leading-tight">Internal Portfolio Review</h5>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">Quarterly alignment on focus areas.</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. Pipeline Kanban View ==================== */}
          {activeTab === 'pipeline' && (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex items-end justify-between mb-6 shrink-0">
                <div>
                  <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                    <span>Pipeline</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600">Deal Pipeline</span>
                  </nav>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Deal Pipeline</h2>
                </div>
                <div className="bg-white p-2.5 px-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Active Deals</p>
                    <p className="text-lg font-extrabold text-slate-800">{projects.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
                {STAGES.map(stage => (
                  <div key={stage.id} 
                       className="w-72 flex-shrink-0 flex flex-col gap-3"
                       onDragOver={(e) => e.preventDefault()}
                       onDrop={(e) => {
                         e.preventDefault();
                         const projectId = e.dataTransfer.getData("projectId");
                         if(projectId) updateProjectStage(projectId, stage.id);
                       }}
                  >
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${stage.color}`}></span>
                        <h3 className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">{stage.label}</h3>
                        <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600">
                          {projects.filter(p => p.stage === stage.id).length}
                        </span>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-pointer" />
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {projects.filter(p => p.stage === stage.id).map(project => (
                        <div key={project.id} 
                             draggable
                             onDragStart={(e) => e.dataTransfer.setData("projectId", project.id)}
                             className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing ${project.status === 'overdue' ? 'border-l-4 border-l-red-500' : ''}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${project.status === 'overdue' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                              {project.company.substring(0,2).toUpperCase()}
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-slate-300 hover:text-blue-600" />
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 mb-0.5">{project.company}</h4>
                          <p className="text-[10px] text-slate-500 font-medium mb-3">{project.pipeline}</p>
                          
                          {project.stage === 'Due Diligence' && (
                             <div className="w-full h-1 bg-slate-100 rounded-full mb-3 overflow-hidden">
                               <div className="bg-orange-500 h-full w-[65%] rounded-full"></div>
                             </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                                {project.owner.initials}
                              </div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase">{project.owner.name}</span>
                            </div>
                            
                            {project.status === 'overdue' ? (
                               <div className="flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded text-red-600">
                                 <AlertCircle className="w-3 h-3" />
                                 <span className="text-[9px] font-bold">Overdue</span>
                               </div>
                            ) : (
                               <span className="text-[9px] font-medium text-slate-400 flex items-center gap-0.5">
                                 <Clock className="w-3 h-3" /> {project.lastContactDate}
                               </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {projects.filter(p => p.stage === stage.id).length === 0 && (
                         <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs font-medium text-slate-400">
                           Drop to move
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 4. Schedule View ==================== */}
          {activeTab === 'schedule' && (
            <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
              <header className="mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Calendar & Events</h1>
                  <p className="text-slate-500 text-sm mt-1">Cross-functional timeline for active deal pipeline.</p>
                </div>
                <div className="flex gap-3">
                  <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-blue-800">
                    <Plus className="w-4 h-4" /> Create Event
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  {/* Calendar Widget mock */}
                  <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <h3 className="font-bold text-lg text-slate-900">October 2026</h3>
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
                          <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight className="w-5 h-5"/></button>
                        </div>
                      </div>
                      <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                        <button className="px-3 py-1 bg-white shadow-sm text-blue-700 rounded-md">Month</button>
                        <button className="px-3 py-1 text-slate-500 hover:text-slate-900">Week</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                         <div key={d} className="bg-slate-50 p-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">{d}</div>
                      ))}
                      {/* Fake days */}
                      {[29,30,1,2,3,4,5,6,7,8,9,10,11,12].map((day, i) => (
                         <div key={i} className={`h-24 p-2 text-xs font-medium ${i<2 ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-700'} ${day === 8 ? 'bg-blue-50/50' : ''}`}>
                           {day}
                           {day === 2 && <div className="mt-1 bg-blue-50 border-l-2 border-blue-500 p-1 rounded text-[9px] font-bold text-blue-700 truncate">Trial Readout</div>}
                           {day === 8 && <div className="mt-1 bg-orange-100 text-orange-800 p-1 rounded text-[9px] font-bold truncate">FDA PDUFA Date</div>}
                         </div>
                      ))}
                    </div>
                  </section>

                  {/* Competitor Catalysts Detailed */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Microscope className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-lg">Competitor Catalyst Events</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-orange-500 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-orange-100 px-2 py-0.5 rounded text-orange-800">Trial Readout</span>
                          <span className="text-[10px] font-bold text-slate-500">Oct 14</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">Pfizer Oncology: PH3 MBC</h4>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">Top-line data readout for Palbociclib combination. Critical impact on deal valuation.</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-blue-600 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded text-blue-800">FDA AdComm</span>
                          <span className="text-[10px] font-bold text-slate-500">Oct 22</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">Gilead: CAR-T Update</h4>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">AdComm meeting regarding manufacturing process changes for Yescarta.</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Meeting Schedule */}
                  <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-sm">Meeting Schedule</h3>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">Today</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-extrabold text-blue-600 uppercase">Confirmed</span>
                          <span className="text-[10px] font-medium text-slate-500">14:00 - 15:00</span>
                        </div>
                        <p className="font-bold text-sm text-slate-900">Novartis Licensing - T1</p>
                        <div className="flex items-center gap-1.5 mt-2 text-slate-500">
                          <Video className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Zoom Meeting</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Task Timeline */}
                  <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-5">
                      <History className="w-4 h-4 text-slate-600" />
                      <h3 className="font-bold text-sm">Task Timeline</h3>
                    </div>
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      <div className="relative">
                        <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white"></div>
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">Due Tomorrow</span>
                        <h4 className="font-bold text-xs mt-0.5 text-slate-900">Data Room Audit: Phoenix</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Review Phase II results and CMC docs.</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-white"></div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">In 3 Days</span>
                        <h4 className="font-bold text-xs mt-0.5 text-slate-900">Follow-up: Merck Alliance</h4>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
