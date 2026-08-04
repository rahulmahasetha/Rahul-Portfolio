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
import { useFaceValidation, STATUS_MESSAGES } from '../../hooks/useFaceValidation';

export default function AdminIndex({ isAdminPath }: { isAdminPath?: boolean }) {
  const [isAuthenticated,   setIsAuthenticated]   = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [password,          setPassword]          = useState('');
  const [showPassword,      setShowPassword]      = useState(false);
  const [loginError,        setLoginError]        = useState('');
  const [activeSection,     setActiveSection]     = useState<SectionType>('dashboard');
  const [isLoggingIn,       setIsLoggingIn]       = useState(false);

  const videoRef       = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const watchIdRef     = useRef<number | null>(null);

  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionsDenied,  setPermissionsDenied]  = useState(false);

  // Face validation — only while on login screen
  const { faceStatus, faceOk, modelsReady } = useFaceValidation(
    videoRef,
    permissionsGranted && !isAuthenticated
  );

  // ── Stop all media ──────────────────────────────────────────────────────────
  const stopMediaResources = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // ── Request camera + location ───────────────────────────────────────────────
  const requestPermissions = async () => {
    setPermissionsGranted(false);
    setPermissionsDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      mediaStreamRef.current = stream;
      const watchId = navigator.geolocation.watchPosition(
        () => {
          setPermissionsGranted(true);
          setPermissionsDenied(false);
          setTimeout(() => {
            if (videoRef.current) videoRef.current.srcObject = stream;
          }, 100);
        },
        () => { setPermissionsDenied(true); }
      );
      watchIdRef.current = watchId;
    } catch {
      setPermissionsDenied(true);
    }
  };

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
        else requestPermissions();
      })
      .catch(() => requestPermissions())
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
    if (!faceOk || !password || isLoggingIn) return;

    setLoginError('');
    setIsLoggingIn(true);

    // Capture snapshot
    let blob: Blob | null = null;
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const canvas = document.createElement('canvas');
      canvas.width  = videoRef.current.videoWidth  || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
      }
    }

    const fd = new FormData();
    fd.append('password', password);
    if (blob) fd.append('snapshot', blob, 'snapshot.jpg');

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
        stopMediaResources();
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
    requestPermissions();
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg">
        <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
      </div>
    );
  }

  if (!isAuthenticated && permissionsDenied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-red-500/40 bg-admin-card p-8 shadow-2xl text-center"
        >
          <AlertTriangle className="mx-auto h-14 w-14 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-admin-text-secondary text-sm">
            Camera and Location permissions are required to access the Admin Portal.
            Please allow them in your browser settings and refresh.
          </p>
          <button
            onClick={requestPermissions}
            className="mt-6 rounded-xl bg-admin-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-admin-primary/90 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated && !permissionsGranted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg gap-3 text-white">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
        <span>Requesting permissions…</span>
      </div>
    );
  }

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    const isLoading = faceStatus === 'loading' || !modelsReady;

    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg p-4 font-sans text-admin-text">
        {/* Hidden video element — face-api reads from this */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        />

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
            <p className="mt-1 text-xs text-admin-text-secondary">Secure access · Face verification required</p>
          </div>

          {/* ── Camera / face status ── */}
          <div className={`mb-6 rounded-2xl border p-4 transition-colors duration-300 ${
            isLoading         ? 'border-yellow-500/25 bg-yellow-500/5'
            : faceOk          ? 'border-emerald-500/30 bg-emerald-500/5'
                              : 'border-red-500/25 bg-red-500/5'
          }`}>
            <div className="flex items-center gap-3">
              {/* Camera icon */}
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isLoading ? 'bg-yellow-500/10' : faceOk ? 'bg-emerald-500/10' : 'bg-red-500/10'
              }`}>
                {isLoading
                  ? <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
                  : faceOk
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    : <Camera className="h-5 w-5 text-red-400" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-admin-text-secondary mb-0.5">
                  Face Check
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={faceStatus}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    className={`text-sm font-medium leading-snug ${
                      isLoading ? 'text-yellow-400' : faceOk ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {STATUS_MESSAGES[faceStatus]}
                  </motion.p>
                </AnimatePresence>
                {!faceOk && faceStatus !== 'loading' && faceStatus !== 'degraded' && (
                  <ul className="mt-2 space-y-0.5 text-[11px] text-admin-text-secondary">
                    {faceStatus === 'no_face'    && <li>👁 Look directly at the camera.</li>}
                    {faceStatus === 'multiple'   && <li>👤 Only one person may be in the frame.</li>}
                    {faceStatus === 'too_dark'   && <li>💡 Turn on a light or move to a brighter area.</li>}
                    {faceStatus === 'overexposed'&& <li>🌤 Avoid direct sunlight or bright backlighting.</li>}
                    {faceStatus === 'blurry'     && <li>🧘 Hold still and make sure the camera lens is clean.</li>}
                    {faceStatus === 'frozen'     && <li>🔄 Your camera appears frozen — try unplugging and reconnecting it.</li>}
                    {faceStatus === 'spoof'      && <li>🚫 Live face only — no photos, screens, or printouts.</li>}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* ── Password form — slides in when face is OK ── */}
          <AnimatePresence>
            {faceOk && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
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
            )}
          </AnimatePresence>

          {/* Hint when face not detected */}
          {!faceOk && !isLoading && (
            <p className="text-center text-xs text-admin-text-secondary">
              Look at your camera — the password field will appear once your face is detected.
            </p>
          )}
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
