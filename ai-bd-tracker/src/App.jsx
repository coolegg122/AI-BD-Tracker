import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SmartInput from './views/SmartInput';
import Dashboard from './views/Dashboard';
import Pipeline from './views/Pipeline';
import Schedule from './views/Schedule';
import Conferences from './views/Conferences';
import Contacts from './views/Contacts';

export default function App() {
  const { setProjects, setContacts, setDashboardData, setScheduleData, setNotifications } = useStore();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects from backend:", err);
      }
    };
    
    const loadContacts = async () => {
      try {
        const data = await api.getContacts();
        setContacts(data);
      } catch (err) {
        console.error("Failed to load contacts from backend:", err);
      }
    };
    
    const loadMockData = async () => {
      try {
        setDashboardData(await api.getDashboardMock());
        setScheduleData(await api.getScheduleMock());
        setNotifications(await api.getNotificationsMock());
      } catch (err) {
        console.error("Failed to load mock UI data:", err);
      }
    };

    loadProjects();
    loadContacts();
    loadMockData();
  }, [setProjects, setContacts, setDashboardData, setScheduleData, setNotifications]);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-[#f7f9fb] relative">
          <Topbar />
          <main className="flex-1 overflow-auto p-8 relative">
            <Routes>
              <Route path="/" element={<SmartInput />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/conferences" element={<Navigate to="/conferences/jpm" replace />} />
              <Route path="/conferences/:category" element={<Conferences />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
