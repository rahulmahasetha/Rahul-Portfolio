import React, { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { cn } from './Button';

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ComponentType<any>;
  iconColor?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, description, icon: Icon, iconColor = 'primary', trend }: StatsCardProps) {
  const colorStyles = {
    primary: 'bg-admin-primary/10 text-admin-primary border-admin-primary/20',
    success: 'bg-admin-success/10 text-admin-success border-admin-success/20',
    warning: 'bg-admin-warning/10 text-admin-warning border-admin-warning/20',
    danger: 'bg-admin-danger/10 text-admin-danger border-admin-danger/20',
    accent: 'bg-admin-accent/10 text-admin-accent border-admin-accent/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm transition-all hover:shadow-md hover:border-admin-border/80"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-admin-text-secondary">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-admin-text">{value}</h3>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border", colorStyles[iconColor])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend && (
            <span className={cn("font-medium", trend.isPositive ? "text-admin-success" : "text-admin-danger")}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
          <span className="text-admin-text-secondary">
            {trend ? trend.label : description}
          </span>
        </div>
      )}
    </motion.div>
  );
}
