import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SmartInput from './views/SmartInput';
import Dashboard from './views/Dashboard';
import Pipeline from './views/Pipeline';
import Schedule from './views/Schedule';
import Conferences from './views/Conferences';
import Contacts from './views/Contacts';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import SettingsPage from './views/SettingsPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public route component (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Layout component for protected routes
const ProtectedLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-ui-bg font-sans text-ui-text overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-ui-bg relative">
        <Topbar />
        <main className="flex-1 overflow-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

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
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <SmartInput />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/pipeline" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Pipeline />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Schedule />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/contacts" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Contacts />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <SettingsPage />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/conferences" element={<Navigate to="/conferences/jpm" replace />} />
        <Route path="/conferences/:category" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Conferences />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
