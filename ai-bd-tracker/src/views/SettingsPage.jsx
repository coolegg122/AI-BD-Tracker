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

  // User management states
  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    job_title: user?.job_title || '',
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
        job_title: user.job_title,
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

  useEffect(() => {
    if (activeTab === 'management' && user?.role === 'admin') {
      fetchUsers();
    }
  }, [activeTab, user]);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      showMessage('error', 'Failed to fetch users: ' + err.message);
    } finally {
      setIsUsersLoading(false);
    }
  };

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
        showMessage('success', '存储成功: Profile updated!');
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
      showMessage('success', '存储成功: Password changed!');
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
        showMessage('success', '存储成功: Notifications saved!');
      }
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.updateUser(userId, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showMessage('success', '存储成功: User role updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await api.updateUser(userId, { is_active: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: newStatus } : u));
      showMessage('success', `存储成功: User ${newStatus === 1 ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    ...(user?.role === 'admin' ? [{ id: 'management', label: 'User Management', icon: Bell }] : [])
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-ui-text mb-1 transition-colors">Settings</h2>
        <p className="text-ui-text-muted font-medium text-sm transition-colors">Manage your account preferences and system configuration.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 border transition-colors ${
          message.type === 'success' 
            ? 'bg-ui-success/10 text-ui-success border-ui-success/20' 
            : 'bg-ui-error/10 text-ui-error border-ui-error/20'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <div className="bg-ui-card rounded-2xl shadow-sm border border-ui-border overflow-hidden flex flex-col md:flex-row min-h-[500px] transition-colors">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-ui-sidebar border-r border-ui-border p-4 space-y-1 transition-colors">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-ui-accent text-white shadow-md'
                  : 'text-ui-text-muted hover:bg-ui-hover'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-ui-card transition-colors">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1 text-ui-text transition-colors">Profile Information</h3>
                <p className="text-sm text-ui-text-muted transition-colors">Update your personal details and how others see you.</p>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ui-text-muted uppercase">Full Name</label>
                    <input
                      type="text"
                      className="w-full bg-ui-input border border-ui-input-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text transition-colors"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ui-text-muted uppercase">Initials</label>
                    <input
                      type="text"
                      className="w-full bg-ui-input border border-ui-input-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text transition-colors"
                      value={profileData.initials}
                      maxLength="3"
                      onChange={(e) => setProfileData({...profileData, initials: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ui-text-muted uppercase">Email Address</label>
                  <input
                    type="email"
                    className="w-full bg-ui-input border border-ui-input-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none opacity-60 cursor-not-allowed text-ui-text"
                    value={profileData.email}
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ui-text-muted uppercase">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. BD Manager, CEO"
                    className="w-full bg-ui-input border border-ui-input-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text transition-colors"
                    value={profileData.job_title}
                    onChange={(e) => setProfileData({...profileData, job_title: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ui-text-muted uppercase">Role</label>
                  <input
                    type="text"
                    className="w-full bg-ui-input border border-ui-input-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text transition-colors opacity-60 cursor-not-allowed"
                    value={profileData.role}
                    disabled
                  />
                  <p className="text-[10px] text-ui-text-muted italic">Self-role modification disabled for safety.</p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-ui-accent text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-all flex items-center gap-2 hover:opacity-90 shadow-sm"
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
                <h3 className="text-lg font-bold mb-1 text-ui-text transition-colors">Security</h3>
                <p className="text-sm text-ui-text-muted transition-colors">Keep your account secure by changing your password regularly.</p>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ui-text-muted uppercase">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-ui-input border border-ui-input-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ui-text-muted uppercase">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-ui-input border border-ui-input-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ui-text-muted uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-ui-input border border-ui-input-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-ui-accent text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-all flex items-center gap-2 hover:opacity-90 shadow-sm"
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
                <h3 className="text-lg font-bold mb-1 text-ui-text transition-colors">Notification Preferences</h3>
                <p className="text-sm text-ui-text-muted transition-colors">Control which alerts and updates you receive.</p>
              </div>
              <div className="space-y-4 max-w-lg">
                {[
                  { key: 'email_alerts', label: 'Email Alerts', desc: 'Summary of critical pipeline activity delivered to your inbox.' },
                  { key: 'pipeline_updates', label: 'Pipeline Updates', desc: 'Real-time notifications when projects change stages.' },
                  { key: 'meeting_reminders', label: 'Meeting Reminders', desc: 'Alerts before upcoming stakeholder calls or events.' },
                  { key: 'ai_insights', label: 'AI Insights', desc: 'Proactive intelligence discovered by the AI Engine.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-ui-bg rounded-xl border border-ui-border transition-colors">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-ui-text">{item.label}</p>
                      <p className="text-xs text-ui-text-muted">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs({...notifPrefs, [item.key]: !notifPrefs[item.key]})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        notifPrefs[item.key] ? 'bg-ui-accent' : 'bg-ui-border'
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
                  className="bg-ui-accent text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-all mt-4 flex items-center gap-2 hover:opacity-90 shadow-sm"
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
                <h3 className="text-lg font-bold mb-1 text-ui-text transition-colors">Appearance</h3>
                <p className="text-sm text-ui-text-muted transition-colors">Customize the look and feel of your workspace.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <button
                  onClick={() => toggleTheme('light')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'light' ? 'border-ui-accent bg-ui-accent/5' : 'border-ui-border bg-ui-bg'
                  }`}
                >
                  <div className="w-full aspect-video bg-slate-50 dark:bg-slate-800 rounded-md border border-ui-border mb-2 p-2 space-y-1 transition-colors">
                    <div className="h-2 w-1/2 bg-ui-border rounded transition-colors"></div>
                    <div className="h-4 w-full bg-ui-border rounded transition-colors"></div>
                  </div>
                  <span className="text-sm font-bold text-ui-text">Light Mode</span>
                </button>
                <button
                  onClick={() => toggleTheme('dark')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'dark' ? 'border-ui-accent bg-ui-accent/5' : 'border-ui-border bg-ui-bg'
                  }`}
                >
                  <div className="w-full aspect-video bg-ui-sidebar rounded-md border border-ui-border mb-2 p-2 space-y-1">
                    <div className="h-2 w-1/2 bg-ui-border rounded"></div>
                    <div className="h-4 w-full bg-ui-border rounded"></div>
                  </div>
                  <span className="text-sm font-bold text-ui-text">Dark Mode</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'management' && user?.role === 'admin' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-bold mb-1 text-ui-text transition-colors">User Management</h3>
                <p className="text-sm text-ui-text-muted transition-colors">Manage team access levels and account status.</p>
              </div>

              {isUsersLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-ui-accent animate-spin mb-4" />
                  <p className="text-xs font-bold text-ui-text-muted">Loading team roster...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map(u => {
                    const isSelf = u.id === user.id;
                    return (
                      <div key={u.id} className="bg-ui-bg p-4 rounded-xl border border-ui-border flex items-center justify-between transition-colors hover:shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-ui-accent/20 text-ui-accent flex items-center justify-center text-xs font-black border border-ui-accent/20">
                            {u.initials || u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ui-text flex items-center gap-2">
                              {u.name}
                              {isSelf && <span className="text-[9px] bg-ui-accent text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">You</span>}
                            </p>
                            <p className="text-xs text-ui-text-muted">{u.job_title || 'No Title'} • {u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end gap-1">
                            <label className="text-[9px] font-black text-ui-text-muted uppercase tracking-widest leading-none">Role Assignment</label>
                            <select
                              value={u.role}
                              disabled={isSelf}
                              onChange={(e) => updateUserRole(u.id, e.target.value)}
                              className={`bg-ui-card border border-ui-border rounded-lg px-3 py-1.5 text-xs font-bold text-ui-text outline-none focus:ring-1 focus:ring-ui-accent transition-all ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-ui-accent/50'}`}
                            >
                              <option value="admin">Administrator</option>
                              <option value="guest">Guest / Read-Only</option>
                            </select>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <label className="text-[9px] font-black text-ui-text-muted uppercase tracking-widest leading-none">Status</label>
                            <button
                              disabled={isSelf}
                              onClick={() => toggleUserStatus(u.id, u.is_active)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isSelf ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${
                                u.is_active === 1 ? 'bg-ui-accent' : 'bg-ui-border'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  u.is_active === 1 ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-ui-card rounded-2xl border border-ui-border transition-colors">
        <h4 className="text-xs font-bold text-ui-text-muted uppercase mb-4">System Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-bold text-ui-text-muted uppercase tracking-widest transition-colors">Version</p>
            <p className="text-sm font-bold text-ui-text transition-colors">1.0.0-PRO</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-ui-text-muted uppercase tracking-widest transition-colors">Engine</p>
            <p className="text-sm font-bold text-ui-text transition-colors">Gemini 1.5 Flash</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-ui-text-muted uppercase tracking-widest transition-colors">Environment</p>
            <p className="text-sm font-bold text-ui-text transition-colors">Production (Cloud)</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-ui-text-muted uppercase tracking-widest transition-colors">Database</p>
            <p className="text-sm font-bold text-ui-text transition-colors">Supabase PG</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
