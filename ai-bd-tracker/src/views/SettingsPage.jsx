import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Palette, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

const SettingsPage = () => {
  const { user, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    initials: user?.initials || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifPrefs, setNotifPrefs] = useState({
    email_alerts: true,
    pipeline_updates: true,
    meeting_reminders: true,
    ai_insights: true,
    ...(user?.notification_prefs || {})
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials
      });
      setNotifPrefs({
        email_alerts: true,
        pipeline_updates: true,
        meeting_reminders: true,
        ai_insights: true,
        ...(user.notification_prefs || {})
      });
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await updateUserProfile(profileData);
      if (result.success) {
        showMessage('success', 'Profile updated successfully!');
      } else {
        showMessage('error', result.message || 'Failed to update profile');
      }
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    setIsSaving(true);
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      showMessage('success', 'Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotifUpdate = async () => {
    setIsSaving(true);
    try {
      const result = await api.updatePreferences({ notification_prefs: notifPrefs });
      if (result) {
        // AuthContext updateUserProfile would be ideal here if it had a way to just refresh user
        // For now, we assume backend saved it.
        showMessage('success', 'Notification preferences saved!');
      }
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1 dark:text-white">Settings</h2>
        <p className="text-slate-500 font-medium text-sm dark:text-slate-400">Manage your account preferences and system configuration.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1 dark:text-white">Profile Information</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal details and how others see you.</p>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Full Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Initials</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={profileData.initials}
                      maxLength="3"
                      onChange={(e) => setProfileData({...profileData, initials: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none opacity-60 cursor-not-allowed"
                    value={profileData.email}
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Role</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={profileData.role}
                    onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1 dark:text-white">Security</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Keep your account secure by changing your password regularly.</p>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1 dark:text-white">Notification Preferences</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Control which alerts and updates you receive.</p>
              </div>
              <div className="space-y-4 max-w-lg">
                {[
                  { key: 'email_alerts', label: 'Email Alerts', desc: 'Summary of critical pipeline activity delivered to your inbox.' },
                  { key: 'pipeline_updates', label: 'Pipeline Updates', desc: 'Real-time notifications when projects change stages.' },
                  { key: 'meeting_reminders', label: 'Meeting Reminders', desc: 'Alerts before upcoming stakeholder calls or events.' },
                  { key: 'ai_insights', label: 'AI Insights', desc: 'Proactive intelligence discovered by the AI Engine.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs({...notifPrefs, [item.key]: !notifPrefs[item.key]})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        notifPrefs[item.key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifPrefs[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleNotifUpdate}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all mt-4 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1 dark:text-white">Appearance</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Customize the look and feel of your workspace.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <button
                  onClick={() => toggleTheme('light')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'light' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <div className="w-full aspect-video bg-white rounded-md border border-slate-200 mb-2 p-2 space-y-1">
                    <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                    <div className="h-4 w-full bg-slate-50 rounded"></div>
                  </div>
                  <span className="text-sm font-bold dark:text-white">Light Mode</span>
                </button>
                <button
                  onClick={() => toggleTheme('dark')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'dark' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <div className="w-full aspect-video bg-slate-900 rounded-md border border-slate-800 mb-2 p-2 space-y-1">
                    <div className="h-2 w-1/2 bg-slate-800 rounded"></div>
                    <div className="h-4 w-full bg-slate-800 rounded"></div>
                  </div>
                  <span className="text-sm font-bold dark:text-white">Dark Mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 dark:text-slate-400">System Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Version</p>
            <p className="text-sm font-bold dark:text-white">1.0.0-PRO</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Engine</p>
            <p className="text-sm font-bold dark:text-white">Gemini 1.5 Flash</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Environment</p>
            <p className="text-sm font-bold dark:text-white">Production (Cloud)</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Database</p>
            <p className="text-sm font-bold dark:text-white">Supabase PG</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
