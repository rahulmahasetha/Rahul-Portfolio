import React from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-sm font-medium leading-none text-admin-text-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {props.required && <span className="text-admin-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-admin-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              icon && "pl-10",
              error && "border-admin-danger focus-visible:ring-admin-danger",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-admin-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
