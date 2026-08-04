import React, { useState, useEffect } from 'react';
import { Settings, Save, Palette, Bell, Shield, Database } from 'lucide-react';
import { Button } from '../ui/Button';

export function SettingsView() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [settings, setSettings] = useState({
    darkMode: true,
    accentColor: '#3b82f6',
    emailAlerts: true
  });

  const [password, setPassword] = useState({
    new: '',
    confirm: ''
  });

  const [vaultPassword, setVaultPasswordForm] = useState({
    old: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const [darkRes, accentRes, alertsRes] = await Promise.all([
        fetch(`${baseUrl}/api/settings/darkMode`, { credentials: 'include' }).catch(() => null),
        fetch(`${baseUrl}/api/settings/accentColor`, { credentials: 'include' }).catch(() => null),
        fetch(`${baseUrl}/api/settings/emailAlerts`, { credentials: 'include' }).catch(() => null)
      ]);

      const darkVal = darkRes?.ok ? await darkRes.json() : null;
      const accentVal = accentRes?.ok ? await accentRes.json() : null;
      const alertsVal = alertsRes?.ok ? await alertsRes.json() : null;

      setSettings({
        darkMode: darkVal !== null ? darkVal === 'true' : true,
        accentColor: accentVal || '#3b82f6',
        emailAlerts: alertsVal !== null ? alertsVal === 'true' : true
      });
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const saveSetting = (key: string, value: string) => 
        fetch(`${baseUrl}/api/settings`, { credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' },
          body: JSON.stringify({ key, value })
        });

      await Promise.all([
        saveSetting('darkMode', String(settings.darkMode)),
        saveSetting('accentColor', settings.accentColor),
        saveSetting('emailAlerts', String(settings.emailAlerts))
      ]);
      
      setMessage({ type: 'success', text: 'All settings saved successfully.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!password.new || password.new !== password.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match or are empty.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassword({ new: '', confirm: '' });
      setLoading(false);
    }, 1000);
  };

  const updateVaultPassword = async () => {
    if (!vaultPassword.new || vaultPassword.new !== vaultPassword.confirm) {
      setMessage({ type: 'error', text: 'Vault passwords do not match or are empty.' });
      return;
    }
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${baseUrl}/api/vault/change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrfToken') || ''
        },
        credentials: 'include',
        body: JSON.stringify({ oldPassword: vaultPassword.old, newPassword: vaultPassword.new })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Vault password updated successfully!' });
        setVaultPasswordForm({ old: '', new: '', confirm: '' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update vault password.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-admin-card rounded-xl border border-admin-border">
            <Settings className="h-6 w-6 text-admin-primary" />
          </div>
          System Settings
        </h1>
        <p className="mt-2 text-admin-text-secondary">Configure your portfolio portal and preferences</p>
      </div>
      
      {message && (
        <div className={`rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-admin-success/10 text-admin-success' : 'bg-admin-danger/10 text-admin-danger'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance Settings */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="h-5 w-5 text-admin-primary" />
            <h2 className="text-xl font-bold text-white">Appearance</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Dark Mode</p>
                <p className="text-sm text-admin-text-secondary">Toggle dark mode for the admin portal</p>
              </div>
              <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  id="toggle1" 
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-admin-primary appearance-none cursor-pointer" 
                />
                <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-admin-primary cursor-pointer"></label>
              </div>
            </div>
            <div className="pt-4 border-t border-admin-border">
              <label className="text-sm font-medium text-admin-text-secondary block mb-2">Accent Color</label>
              <div className="flex gap-3">
                {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                  <button 
                    key={color} 
                    onClick={() => setSettings({...settings, accentColor: color})}
                    className={`w-8 h-8 rounded-full border-2 ${settings.accentColor === color ? 'border-white' : 'border-transparent'}`} 
                    style={{ backgroundColor: color }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-admin-primary" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Email Alerts</p>
                <p className="text-sm text-admin-text-secondary">Receive an email for new contact messages</p>
              </div>
              <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  id="toggle2" 
                  checked={settings.emailAlerts}
                  onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-admin-primary appearance-none cursor-pointer" 
                />
                <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-6 rounded-full bg-admin-primary cursor-pointer"></label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-admin-primary" />
            <h2 className="text-xl font-bold text-white">Security</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-admin-text-secondary block mb-2">Change Admin Password</label>
              <input 
                type="password" 
                placeholder="New Password" 
                value={password.new}
                onChange={(e) => setPassword({...password, new: e.target.value})}
                className="h-10 w-full mb-3 rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-admin-primary focus:outline-none" 
              />
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                value={password.confirm}
                onChange={(e) => setPassword({...password, confirm: e.target.value})}
                className="h-10 w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-admin-primary focus:outline-none" 
              />
            </div>
            <Button variant="outline" className="w-full" onClick={updatePassword} disabled={loading}>Update Admin Password</Button>
            
            <div className="pt-4 border-t border-admin-border mt-4">
              <label className="text-sm font-medium text-admin-text-secondary block mb-2 text-red-400">Change Academic Vault Password</label>
              <input 
                type="password" 
                placeholder="Current Vault Password" 
                value={vaultPassword.old}
                onChange={(e) => setVaultPasswordForm({...vaultPassword, old: e.target.value})}
                className="h-10 w-full mb-3 rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none" 
              />
              <input 
                type="password" 
                placeholder="New Vault Password" 
                value={vaultPassword.new}
                onChange={(e) => setVaultPasswordForm({...vaultPassword, new: e.target.value})}
                className="h-10 w-full mb-3 rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none" 
              />
              <input 
                type="password" 
                placeholder="Confirm Vault Password" 
                value={vaultPassword.confirm}
                onChange={(e) => setVaultPasswordForm({...vaultPassword, confirm: e.target.value})}
                className="h-10 w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none" 
              />
            </div>
            <Button variant="outline" className="w-full text-red-400 hover:bg-red-500/10 hover:border-red-500/50" onClick={updateVaultPassword} disabled={loading}>Update Vault Password</Button>
          </div>
        </div>
        
        {/* Database Info */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-5 w-5 text-admin-primary" />
            <h2 className="text-xl font-bold text-white">System Data</h2>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-admin-border pb-2">
              <span className="text-admin-text-secondary">API Status</span>
              <span className="text-admin-success font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-admin-success animate-pulse"></span> Online</span>
            </div>
            <div className="flex justify-between border-b border-admin-border pb-2">
              <span className="text-admin-text-secondary">Environment</span>
              <span className="text-white font-medium">Production</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-admin-text-secondary">Last Backup</span>
              <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <Button variant="outline" className="w-full mt-2">Trigger Manual Backup</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button className="gap-2" onClick={handleSaveAll} disabled={loading}>
          <Save className="h-4 w-4" /> Save All Settings
        </Button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .toggle-checkbox:checked {
          right: 0;
          border-color: #3b82f6;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6;
        }
        .toggle-checkbox {
          right: 24px;
          transition: all 0.2s ease;
        }
        .toggle-label {
          transition: all 0.2s ease;
        }
      `}} />
    </div>
  );
}
