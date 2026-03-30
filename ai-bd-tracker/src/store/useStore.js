import { create } from 'zustand';

const STAGES = [
  { id: 'Initial Contact', label: 'Initial Contact', color: 'bg-slate-400' },
  { id: 'CDA Signed', label: 'CDA Signed', color: 'bg-indigo-500' },
  { id: 'Due Diligence', label: 'DD', color: 'bg-orange-500' },
  { id: 'Term Sheet', label: 'Term Sheet', color: 'bg-blue-600' },
  { id: 'Negotiation', label: 'Negotiation', color: 'bg-blue-800' }
];

const initialCatalysts = [
  { id: 1, competitor: 'Vertex Pharma', asset: 'VX-548 (Pain)', event: 'Phase III Top-line data release.', date: 'Oct 23', impact: 'High' },
  { id: 2, competitor: 'Merck & Co.', asset: 'Keytruda sBLA', event: 'FDA PDUFA Date: early-stage NSCLC.', date: 'Oct 25', impact: 'Medium' }
];

export const useStore = create((set) => ({
  user: null,
  projects: [],
  contacts: [],
  dashboardData: null,
  scheduleData: null,
  notifications: [],
  selectedOverviewProject: null, // Phase 6: Timeline modal
  stages: STAGES,
  appId: typeof __app_id !== 'undefined' ? __app_id : 'default-app-id',
  
  setUser: (user) => set({ user }),
  setProjects: (projects) => set({ projects }),
  setContacts: (contacts) => set({ contacts }),
  setDashboardData: (data) => set({ dashboardData: data }),
  setScheduleData: (data) => set({ scheduleData: data }),
  setNotifications: (data) => set({ notifications: data }),
  
  openProjectOverview: (project) => set({ selectedOverviewProject: project }),
  closeProjectOverview: () => set({ selectedOverviewProject: null }),
  
  selectedAlertForAnalysis: null,
  openAlertAnalysis: (alertId) => set({ selectedAlertForAnalysis: alertId }),
  closeAlertAnalysis: () => set({ selectedAlertForAnalysis: null }),
  
  dismissAlert: (alertId) => set((state) => {
    if (!state.dashboardData || !state.dashboardData.alerts) return state;
    return {
      dashboardData: {
        ...state.dashboardData,
        alerts: state.dashboardData.alerts.filter(a => a.id !== alertId)
      }
    };
  }),

  markNotificationRead: (notifId) => set((state) => ({
    notifications: state.notifications.map(n => n.id === notifId ? { ...n, read: true } : n)
  })),

  updateProjectStage: (projectId, newStage) => set((state) => ({
    projects: state.projects.map(p => p.id === projectId ? { ...p, stage: newStage } : p)
  })),
  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects]
  })),
}));
