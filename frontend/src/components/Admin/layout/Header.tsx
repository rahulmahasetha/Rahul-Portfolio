import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ExternalLink, Globe, Moon, X, Mail, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  setActiveSection?: (s: string) => void;
  toggleMobileMenu?: () => void;
}

export function Header({ setActiveSection, toggleMobileMenu }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecentMessages();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRecentMessages = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseUrl}/api/contact`);
      const msgs = await response.json();
      if (Array.isArray(msgs)) {
        // Sort newest first and take top 5 to show as notifications
        const sorted = msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Only show messages from the last 7 days as "new" notifications for demo purposes
        const recent = sorted.filter(m => new Date(m.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
        setNotifications(recent);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-admin-border bg-admin-surface/80 px-4 lg:px-6 backdrop-blur-md">
      <div className="flex items-center gap-4 w-full max-w-md">
        {toggleMobileMenu && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden rounded-full -ml-2"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="relative w-full hidden md:block">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="h-10 w-full rounded-full border border-admin-border bg-admin-bg pl-10 pr-4 text-sm text-admin-text placeholder:text-admin-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Globe className="h-4 w-4" />
        </Button>
        
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full relative ${showNotifications ? 'bg-admin-border/50' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-admin-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-admin-primary"></span>
              </span>
            )}
          </Button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-admin-border bg-admin-card shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between p-4 border-b border-admin-border">
                <h3 className="font-bold text-white">Notifications</h3>
                <span className="text-xs font-medium bg-admin-primary/20 text-admin-primary px-2 py-1 rounded-full">
                  {notifications.length} New
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-admin-text-secondary text-sm">
                    You're all caught up!
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif, idx) => (
                      <div 
                        key={idx} 
                        className="flex gap-3 p-4 border-b border-admin-border hover:bg-admin-surface transition-colors cursor-pointer"
                        onClick={() => {
                          if (setActiveSection) setActiveSection('contacts');
                          setShowNotifications(false);
                        }}
                      >
                        <div className="shrink-0 h-8 w-8 rounded-full bg-admin-primary/10 flex items-center justify-center text-admin-primary">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">New message from {notif.name}</p>
                          <p className="text-xs text-admin-text-secondary mt-1 truncate">{notif.subject}</p>
                          <p className="text-[10px] text-admin-text-secondary mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t border-admin-border">
                  <Button variant="ghost" className="w-full text-xs" onClick={clearNotifications}>
                    Mark all as read
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="h-6 w-[1px] bg-admin-border mx-2"></div>
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-admin-border bg-admin-card px-4 py-2 text-sm font-medium text-admin-text hover:bg-admin-border/50 transition-colors"
        >
          <span>View Site</span>
          <ExternalLink className="h-4 w-4" />
        </a>
        <div className="ml-2 h-9 w-9 rounded-full bg-gradient-to-tr from-admin-primary to-admin-accent flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-admin-surface">
          RM
        </div>
      </div>
    </header>
  );
}
