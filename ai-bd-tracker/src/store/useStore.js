import { create } from 'zustand';
import { STAGES } from '../mocks/demoData';


export const useStore = create((set) => ({
  user: null,
  deals: [],
  assets: [],
  contacts: [],
  dashboardData: null,
  scheduleData: null,
  notifications: [],
  contactsLoaded: false,
  selectedOverviewDeal: null, // Refactored from Project
  stages: STAGES,
  appId: typeof __app_id !== 'undefined' ? __app_id : 'default-app-id',
  
  setUser: (user) => set({ user }),
  setDeals: (deals) => set({ deals }),
  setAssets: (assets) => set({ assets }),
  setContacts: (contacts) => set({ contacts, contactsLoaded: true }),
  setDashboardData: (data) => set({ dashboardData: data }),
  setScheduleData: (data) => set({ scheduleData: data }),
  setNotifications: (data) => set({ notifications: data }),
  
  openDealOverview: (deal) => set({ selectedOverviewDeal: deal }),
  closeDealOverview: () => set({ selectedOverviewDeal: null }),
  
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

  updateDealStage: (dealId, newStage) => set((state) => ({
    deals: state.deals.map(d => d.id === dealId ? { ...d, stage: newStage } : d)
  })),
  // Phase 31: Generic updates
  updateDeal: (dealId, updatedFields) => set((state) => ({
    deals: state.deals.map(d => d.id === dealId ? { ...d, ...updatedFields } : d),
    // Update selectedOverviewDeal if it matches
    selectedOverviewDeal: state.selectedOverviewDeal?.id === dealId 
      ? { ...state.selectedOverviewDeal, ...updatedFields }
      : state.selectedOverviewDeal
  })),
  updateContact: (contactId, updatedFields) => set((state) => ({
    contacts: state.contacts.map(c => c.id === contactId ? { ...c, ...updatedFields } : c)
  })),
  addDeal: (deal) => set((state) => ({
    deals: [deal, ...state.deals]
  })),

  // Phase 2: Professional BD Actions
  updateDealEconomics: (dealId, economics) => set((state) => ({
    deals: state.deals.map(d => d.id === dealId ? { ...d, economics } : d),
    selectedOverviewDeal: state.selectedOverviewDeal?.id === dealId 
      ? { ...state.selectedOverviewDeal, economics }
      : state.selectedOverviewDeal
  })),
  addDealAgreement: (dealId, agreement) => set((state) => ({
    deals: state.deals.map(d => d.id === dealId 
      ? { ...d, agreements: [...(d.agreements || []), agreement] } 
      : d
    ),
    selectedOverviewDeal: state.selectedOverviewDeal?.id === dealId 
      ? { 
          ...state.selectedOverviewDeal, 
          agreements: [...(state.selectedOverviewDeal.agreements || []), agreement] 
        }
      : state.selectedOverviewDeal
  })),
  updateDealAgreement: (dealId, agreementId, updatedAgreement) => set((state) => ({
    deals: state.deals.map(d => d.id === dealId 
      ? { ...d, agreements: (d.agreements || []).map(a => a.id === agreementId ? updatedAgreement : a) } 
      : d
    ),
    selectedOverviewDeal: state.selectedOverviewDeal?.id === dealId 
      ? { 
          ...state.selectedOverviewDeal, 
          agreements: (state.selectedOverviewDeal.agreements || []).map(a => a.id === agreementId ? updatedAgreement : a) 
        }
      : state.selectedOverviewDeal
  })),
  updateDealDueDiligence: (dealId, due_diligence) => set((state) => ({
    deals: state.deals.map(d => d.id === dealId ? { ...d, due_diligence } : d),
    selectedOverviewDeal: state.selectedOverviewDeal?.id === dealId 
      ? { ...state.selectedOverviewDeal, due_diligence }
      : state.selectedOverviewDeal
  })),
}));
