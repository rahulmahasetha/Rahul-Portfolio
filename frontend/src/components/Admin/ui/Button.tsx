import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-admin-primary text-white hover:bg-admin-primary/90 shadow-sm shadow-admin-primary/20': variant === 'default',
            'bg-admin-danger text-white hover:bg-admin-danger/90 shadow-sm shadow-admin-danger/20': variant === 'destructive',
            'border border-admin-border bg-transparent hover:bg-admin-surface text-admin-text': variant === 'outline',
            'bg-admin-surface text-admin-text hover:bg-admin-card': variant === 'secondary',
            'hover:bg-admin-surface text-admin-text hover:text-white': variant === 'ghost',
            'text-admin-primary underline-offset-4 hover:underline': variant === 'link',
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-lg px-3': size === 'sm',
            'h-11 rounded-xl px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
