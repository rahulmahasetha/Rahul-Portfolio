import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, Code2, Award, Mail, ArrowRight, Activity, Users } from 'lucide-react';
import { StatsCard } from '../ui/StatsCard';
import { Button } from '../ui/Button';

export function DashboardView({ setActiveSection }: { setActiveSection: (s: any) => void }) {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    certificates: 0,
    messages: 0,
    visitors: 0
  });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const [projectsRes, skillsRes, certsRes, msgsRes, visitorsRes] = await Promise.all([
          fetch(`${baseUrl}/api/projects`, { credentials: 'include' }).catch(() => ({ json: () => [] })),
          fetch(`${baseUrl}/api/skills`, { credentials: 'include' }).catch(() => ({ json: () => [] })),
          fetch(`${baseUrl}/api/certificates`, { credentials: 'include' }).catch(() => ({ json: () => [] })),
          fetch(`${baseUrl}/api/contact`, { credentials: 'include' }).catch(() => ({ json: () => [] })),
          fetch(`${baseUrl}/api/visitor/count`, { credentials: 'include' }).catch(() => ({ json: () => ({ count: 0 }) }))
        ]);

        const projects = await projectsRes.json();
        const skills = await skillsRes.json();
        const certs = await certsRes.json();
        const msgs = await msgsRes.json();
        const visitors = await visitorsRes.json();

        setStats({
          projects: Array.isArray(projects, { credentials: 'include' }) ? projects.length : 0,
          skills: Array.isArray(skills) ? skills.length : 0,
          certificates: Array.isArray(certs) ? certs.length : 0,
          messages: Array.isArray(msgs) ? msgs.length : 0,
          visitors: visitors.count || 0
        });

        if (Array.isArray(msgs)) {
          // Sort by newest first and take top 5
          const sortedMsgs = msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentMessages(sortedMsgs.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-admin-card rounded-xl border border-admin-border">
            <LayoutDashboard className="h-6 w-6 text-admin-primary" />
          </div>
          Dashboard Overview
        </h1>
        <p className="mt-2 text-admin-text-secondary">Welcome back to your portfolio admin portal.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Projects" value={loading ? '...' : stats.projects} icon={Briefcase} iconColor="primary" />
        <StatsCard title="Skills Listed" value={loading ? '...' : stats.skills} icon={Code2} iconColor="accent" />
        <StatsCard title="Certificates" value={loading ? '...' : stats.certificates} icon={Award} iconColor="warning" />
        <StatsCard title="Total Visitors" value={loading ? '...' : stats.visitors} icon={Users} iconColor="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Recent Messages */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-admin-primary" />
              Recent Messages
            </h2>
            <Button variant="ghost" onClick={() => setActiveSection('contacts')} className="text-sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="py-12 text-center text-admin-text-secondary animate-pulse">Loading messages...</div>
            ) : recentMessages.length === 0 ? (
              <div className="py-12 text-center text-admin-text-secondary border border-dashed border-admin-border rounded-xl">
                No recent messages.
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-admin-border bg-admin-surface hover:border-admin-primary/50 transition-colors cursor-pointer" onClick={() => setActiveSection('contacts')}>
                    <div>
                      <h4 className="font-medium text-white">{msg.name}</h4>
                      <p className="text-sm text-admin-primary line-clamp-1">{msg.subject}</p>
                    </div>
                    <span className="shrink-0 text-xs text-admin-text-secondary bg-admin-card px-2 py-1 rounded-md border border-admin-border">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Button onClick={() => setActiveSection('projects')} className="w-full justify-start gap-3 bg-admin-surface text-white border border-admin-border hover:bg-admin-primary hover:border-admin-primary hover:text-white transition-all shadow-none h-12">
                <Briefcase className="h-5 w-5" /> Manage Projects
              </Button>
              <Button onClick={() => setActiveSection('skills')} className="w-full justify-start gap-3 bg-admin-surface text-white border border-admin-border hover:bg-admin-accent hover:border-admin-accent hover:text-white transition-all shadow-none h-12">
                <Code2 className="h-5 w-5" /> Update Skills
              </Button>
              <Button onClick={() => setActiveSection('certificates')} className="w-full justify-start gap-3 bg-admin-surface text-white border border-admin-border hover:bg-admin-warning hover:border-admin-warning hover:text-white transition-all shadow-none h-12">
                <Award className="h-5 w-5" /> Add Certificate
              </Button>
            </div>
          </div>
          
          <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm flex-1">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-admin-success" />
              System Status
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-admin-border">
                <span className="text-admin-text-secondary text-sm">API Connection</span>
                <span className="text-admin-success text-sm font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-admin-success animate-pulse"></span> Online
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-admin-border">
                <span className="text-admin-text-secondary text-sm">Last Updated</span>
                <span className="text-white text-sm font-medium">Just now</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-admin-text-secondary text-sm">Unread Messages</span>
                <span className="text-admin-primary text-sm font-bold bg-admin-primary/10 px-2 py-0.5 rounded-full">
                  {stats.messages}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
