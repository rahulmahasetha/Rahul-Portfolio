import { resolveMediaUrl } from '../../../utils/url';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, UserCheck, Smartphone, Globe, AlertTriangle } from 'lucide-react';

interface SecurityLog {
  _id: string;
  ip: string;
  browser?: string;
  os?: string;
  device?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  status: 'success' | 'failure';
  snapshotUrl?: string;
  isNewDevice: boolean;
  isPermanent?: boolean;
  createdAt: string;
}

interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  adminEmail: string;
  ip: string;
  createdAt: string;
}

export function SecurityLogsView() {
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'logins' | 'audits'>('logins');
  const [loading, setLoading] = useState(true);
  
  const [expiredLogs, setExpiredLogs] = useState<SecurityLog[]>([]);
  const [showRetentionPrompt, setShowRetentionPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const [secRes, audRes] = await Promise.all([
          fetch(`${baseUrl}/api/securityLogs`, { credentials: 'include' }),
          fetch(`${baseUrl}/api/auditLogs`, { credentials: 'include' })
        ]);

        if (secRes.ok) {
          const logs = await secRes.json();
          setSecurityLogs(logs);
          
          const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
          const now = Date.now();
          const expired = logs.filter((log: SecurityLog) => {
            if (log.isPermanent) return false;
            const age = now - new Date(log.createdAt).getTime();
            return age > SEVEN_DAYS_MS;
          });
          
          if (expired.length > 0) {
            setExpiredLogs(expired);
            setShowRetentionPrompt(true);
          }
        }
        if (audRes.ok) setAuditLogs(await audRes.json());
      } catch (err) {
        console.error('Failed to load logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleBulkAction = async (action: 'archive' | 'delete') => {
    setIsProcessing(true);
    try {
      const ids = expiredLogs.map(l => l._id);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${baseUrl}/api/securityLogs/bulk-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrfToken') || ''
        },
        body: JSON.stringify({ action, ids }),
        credentials: 'include'
      });
      
      if (res.ok) {
        if (action === 'archive') {
          setSecurityLogs(prev => prev.map(log => ids.includes(log._id) ? { ...log, isPermanent: true } : log));
        } else {
          setSecurityLogs(prev => prev.filter(log => !ids.includes(log._id)));
        }
        setShowRetentionPrompt(false);
      } else {
        console.error('Bulk action failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Retention Prompt Modal */}
      {showRetentionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-admin-card rounded-2xl border border-admin-border p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-xl font-bold text-white">Action Required</h3>
            </div>
            <p className="text-admin-text-secondary text-sm mb-6">
              You have <strong className="text-white">{expiredLogs.length}</strong> login records older than 7 days. Would you like to keep them permanently or delete them?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowRetentionPrompt(false)} 
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-admin-border hover:bg-admin-surface text-admin-text transition-colors disabled:opacity-50"
              >
                Later
              </button>
              <button 
                onClick={() => handleBulkAction('archive')} 
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-admin-surface text-white hover:bg-admin-border transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Keep Permanently'}
              </button>
              <button 
                onClick={() => handleBulkAction('delete')} 
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-admin-danger/10 text-admin-danger hover:bg-admin-danger hover:text-white border border-admin-danger/20 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Delete Expired'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-admin-primary" />
          Security Logs
        </h2>
        
        <div className="flex gap-2 p-1 rounded-xl bg-admin-surface border border-admin-border">
          <button 
            onClick={() => setActiveTab('logins')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'logins' ? 'bg-admin-primary text-white' : 'text-admin-text-secondary hover:text-white'
            }`}
          >
            Login History
          </button>
          <button 
            onClick={() => setActiveTab('audits')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'audits' ? 'bg-admin-primary text-white' : 'text-admin-text-secondary hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'logins' ? (
        <div className="overflow-x-auto rounded-xl border border-admin-border bg-admin-card shadow-lg">
          <table className="w-full text-left text-sm text-admin-text">
            <thead className="bg-admin-surface text-admin-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">IP Address & Location</th>
                <th className="px-6 py-4 font-semibold">Device</th>
                <th className="px-6 py-4 font-semibold">Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {securityLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-admin-text-secondary">No login logs found</td></tr>
              ) : (
                securityLogs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={log._id} className="hover:bg-admin-surface/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-admin-danger/10 text-admin-danger'
                      }`}>
                        {log.status === 'success' ? 'Success' : 'Failed'}
                      </div>
                      {log.isNewDevice && (
                        <div className="mt-2 text-xs text-amber-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> New Device
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-admin-text-secondary">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-admin-text-secondary shrink-0" />
                        <div>
                          <div className="text-white font-mono text-xs">{log.ip === '::1' ? '127.0.0.1' : log.ip}</div>
                          {log.location?.city && (
                            <div className="text-xs text-admin-text-secondary mt-0.5">
                              {log.location.city}, {log.location.country}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white">
                          <Smartphone className="h-4 w-4 text-admin-text-secondary" />
                          {log.device} • {log.os}
                        </div>
                        <div className="text-xs text-admin-text-secondary">{log.browser}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.snapshotUrl ? (
                        <img src={resolveMediaUrl(log.snapshotUrl)} alt="Login Snapshot" className="h-12 w-16 object-cover rounded-lg border border-admin-border" />
                      ) : (
                        <span className="text-xs text-admin-text-secondary italic">No snapshot</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-admin-border bg-admin-card shadow-lg">
          <table className="w-full text-left text-sm text-admin-text">
            <thead className="bg-admin-surface text-admin-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity Type</th>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Admin</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {auditLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-admin-text-secondary">No audit logs found</td></tr>
              ) : (
                auditLogs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={log._id} className="hover:bg-admin-surface/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500' : 
                        log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-500' :
                        log.action === 'DELETE' ? 'bg-admin-danger/10 text-admin-danger' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{log.entityType}</td>
                    <td className="px-6 py-4">
                      <div className="text-white">{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-admin-text-secondary">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 text-admin-text-secondary">{log.adminEmail}</td>
                    <td className="px-6 py-4 font-mono text-xs text-admin-text-secondary">{log.ip === '::1' ? '127.0.0.1' : log.ip}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
