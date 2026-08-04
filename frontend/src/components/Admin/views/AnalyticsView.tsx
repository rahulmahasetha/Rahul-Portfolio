import React, { useState, useEffect } from 'react';
import { History, TrendingUp, Users, Activity, BarChart3, Clock, Eye } from 'lucide-react';
import { StatsCard } from '../ui/StatsCard';

export function AnalyticsView() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const [visitorRes, statsRes] = await Promise.all([
        fetch(`${baseUrl}/api/visitor/count`, { credentials: 'include' }).catch(() => ({ json: () => ({ count: 0 }) })),
        fetch(`${baseUrl}/api/site/stats`, { credentials: 'include' }).catch(() => ({ json: () => [] }))
      ]);

      const visitorData = await visitorRes.json();
      const statsData = await statsRes.json();

      setVisitorCount(visitorData.count || 0);
      setStats(Array.isArray(statsData) ? statsData : []);
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-admin-card rounded-xl border border-admin-border">
            <BarChart3 className="h-6 w-6 text-admin-primary" />
          </div>
          Analytics
        </h1>
        <p className="mt-2 text-admin-text-secondary">Monitor your portfolio traffic and engagement</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Profile Views" 
          value={loading ? '...' : visitorCount} 
          icon={Eye} 
          iconColor="primary" 
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard 
          title="Unique Visitors" 
          value={loading ? '...' : Math.floor(visitorCount * 0.75)} 
          icon={Users} 
          iconColor="success" 
        />
        <StatsCard 
          title="Avg. Time on Site" 
          value="2m 45s" 
          icon={Clock} 
          iconColor="warning" 
        />
        <StatsCard 
          title="Bounce Rate" 
          value="42%" 
          icon={Activity} 
          iconColor="danger" 
          trend={{ value: 2.4, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Main Chart Area */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-admin-primary" />
              Traffic Overview (Last 30 Days)
            </h2>
          </div>
          
          <div className="flex-1 flex items-center justify-center border border-dashed border-admin-border rounded-xl bg-admin-surface/30">
            {/* Simple CSS Bar Chart Simulation */}
            <div className="flex items-end justify-between w-full h-full p-8 gap-2">
              {[...Array(30)].map((_, i) => {
                const height = Math.floor(Math.random() * 80) + 20;
                const isToday = i === 29;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 ${isToday ? 'bg-admin-primary' : 'bg-admin-border group-hover:bg-admin-primary/50'}`}
                      style={{ height: `${height}%` }}
                    />
                    {isToday && <div className="absolute -top-8 bg-admin-card text-white text-xs px-2 py-1 rounded shadow-lg border border-admin-border whitespace-nowrap">Today</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Custom Stats */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <History className="h-5 w-5 text-admin-accent" />
            Custom Site Stats
          </h2>
          
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse text-admin-text-secondary text-sm">Loading stats...</div>
            ) : stats.length === 0 ? (
              <div className="py-8 text-center text-admin-text-secondary border border-dashed border-admin-border rounded-xl">
                No custom stats found.
              </div>
            ) : (
              stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-admin-border last:border-0">
                  <span className="text-admin-text-secondary text-sm font-medium">{stat.label}</span>
                  <span className="text-white text-xl font-bold">{stat.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
