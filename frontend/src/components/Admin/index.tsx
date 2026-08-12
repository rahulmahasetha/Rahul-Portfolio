import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, Eye, EyeOff, AlertTriangle, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import type { SectionType } from './layout/Sidebar';
import { AdminLayout } from './layout/AdminLayout';
import { CertificatesView } from './views/CertificatesView';
import { SkillsView } from './views/SkillsView';
import { ProjectsView } from './views/ProjectsView';
import { AchievementsView } from './views/AchievementsView';
import { AboutView } from './views/AboutView';
import { ResumeView } from './views/ResumeView';
import { AcademicCertificatesView } from './views/AcademicCertificatesView';
import { ExperienceView } from './views/ExperienceView';
import { EducationView } from './views/EducationView';
import { ContactsView } from './views/ContactsView';
import { SettingsView } from './views/SettingsView';
import { DashboardView } from './views/DashboardView';
import { AnalyticsView } from './views/AnalyticsView';
import { SecurityLogsView } from './views/SecurityLogsView';

export default function AdminIndex({ isAdminPath }: { isAdminPath?: boolean }) {
  const [isAuthenticated,   setIsAuthenticated]   = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [password,          setPassword]          = useState('');
  const [showPassword,      setShowPassword]      = useState(false);
  const [loginError,        setLoginError]        = useState('');
  const [activeSection,     setActiveSection]     = useState<SectionType>('dashboard');
  const [isLoggingIn,       setIsLoggingIn]       = useState(false);



  // ── Session check + CSRF ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdminPath) return;

    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/auth/csrf-token', {
      credentials: 'include',
      cache: 'no-store'
    })
      .then(r => r.json())
      .then(d => { if (d.csrfToken) sessionStorage.setItem('csrfToken', d.csrfToken); })
      .catch(() => {});

    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/auth/check', {
      credentials: 'include',
      cache: 'no-store'
    })
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) setIsAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setIsCheckingSession(false));

    // Inactivity timeout — 15 min
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (isAuthenticated) { handleLogout(); alert('Session expired due to inactivity.'); }
      }, 15 * 60 * 1000);
    };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    reset();
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
    };
  }, [isAdminPath, isAuthenticated]);

  if (!isAdminPath) return null;

  // ── Login submit ────────────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || isLoggingIn) return;

    setLoginError('');
    setIsLoggingIn(true);

    const fd = new FormData();
    fd.append('password', password);

    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/auth/login',
        {
          method: 'POST',
          body: fd,
          credentials: 'include',
          headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' },
        }
      );
      const data = await res.json();
      if (res.ok) {
        if (data.isNewDevice) alert('Warning: New device login detected.');
        setIsAuthenticated(true);
        setPassword('');
        window.location.reload();
      } else {
        setLoginError(data.error || 'Incorrect password. Try again.');
        setPassword('');
      }
    } catch {
      setLoginError('Network error — please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setIsAuthenticated(false);
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg">
        <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
      </div>
    );
  }

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg p-4 font-sans text-admin-text">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm rounded-3xl border border-admin-border bg-admin-card p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-admin-primary/10 ring-1 ring-admin-primary/20">
              <Lock className="h-7 w-7 text-admin-primary" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            <p className="mt-1 text-xs text-admin-text-secondary">Secure access required</p>
          </div>

          {/* ── Password form ── */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  className="h-11 w-full rounded-xl border border-admin-border bg-admin-surface pl-4 pr-11 text-sm text-white placeholder:text-admin-text-secondary focus:border-admin-primary focus:outline-none focus:ring-1 focus:ring-admin-primary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-secondary hover:text-white transition-colors"
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={!password || isLoggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-admin-primary py-3 text-sm font-semibold text-white shadow-lg shadow-admin-primary/20 hover:bg-admin-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoggingIn
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating…</>
                : <><ShieldCheck className="h-4 w-4" /> Login</>
              }
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeSection) {
      case 'certificates':  return <CertificatesView />;
      case 'skills':        return <SkillsView />;
      case 'projects':      return <ProjectsView />;
      case 'achievements':  return <AchievementsView />;
      case 'about':         return <AboutView />;
      case 'resume':        return <ResumeView />;
      case 'experience':    return <ExperienceView />;
      case 'education':     return <EducationView />;
      case 'timeline':      return <TimelineView />;
      case 'academic':      return <AcademicCertificatesView />;
      case 'contacts':      return <ContactsView />;
      case 'settings':      return <SettingsView />;
      case 'dashboard':     return <DashboardView setActiveSection={setActiveSection} />;
      case 'analytics':     return <AnalyticsView />;
      case 'security-logs': return <SecurityLogsView />;
      default:
        return (
          <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Work in Progress</h2>
            <p className="text-admin-text-secondary">The {activeSection} module is being redesigned.</p>
          </div>
        );
    }
  };

  return (
    <AdminLayout activeSection={activeSection} setActiveSection={setActiveSection} onLogout={handleLogout}>
      {renderContent()}
    </AdminLayout>
  );
}
