import React from 'react';
import { 
  LayoutDashboard, Award, Code2, Briefcase, Trophy, 
  User, FileText, History, GraduationCap, Mail, 
  Settings, Users, LogOut, ChevronLeft, ChevronRight, ShieldAlert, Lock
} from 'lucide-react';
import { cn } from '../ui/Button';

export type SectionType = 
  | 'dashboard' 
  | 'certificates' 
  | 'skills' 
  | 'projects' 
  | 'achievements' 
  | 'about' 
  | 'resume' 
  | 'experience' 
  | 'education' 
  | 'contacts' 
  | 'settings' 
  | 'analytics'
  | 'security-logs'
  | 'academic';

interface SidebarProps {
  activeSection: SectionType;
  setActiveSection: (section: SectionType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
}

const navItems = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: History },
  ]},
  { group: 'Portfolio', items: [
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'skills', label: 'Skills', icon: Code2 },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'about', label: 'About', icon: User },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'experience', label: 'Experience', icon: History },
    { id: 'education', label: 'Education', icon: GraduationCap },
  ]},
  { group: 'System', items: [
    { id: 'academic', label: 'Academic Vault', icon: Lock },
    { id: 'security-logs', label: 'Security Logs', icon: ShieldAlert },
    { id: 'contacts', label: 'Contacts', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]}
];

export function Sidebar({ 
  activeSection, setActiveSection, 
  isCollapsed, setIsCollapsed, 
  onLogout, 
  isMobileOpen = false, setIsMobileOpen 
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-admin-border bg-admin-surface transition-all duration-300 lg:relative lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-admin-border">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-admin-primary shrink-0">
                <span className="text-white text-sm">RM</span>
              </div>
              <span className="truncate">Admin Portal</span>
            </div>
          )}
          {(isCollapsed && !isMobileOpen) && (
            <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-lg bg-admin-primary shrink-0">
              <span className="text-white text-sm font-bold">RM</span>
            </div>
          )}
        </div>
        
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-admin-border bg-admin-surface text-admin-text hover:text-white z-10"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
          {navItems.map((group, idx) => (
            <div key={idx} className="mb-6 px-3">
              {(!isCollapsed || isMobileOpen) && (
                <h4 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-admin-text-secondary">
                  {group.group}
                </h4>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id as SectionType)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          isActive 
                            ? "bg-admin-primary text-white" 
                            : "text-admin-text-secondary hover:bg-admin-card hover:text-white"
                        )}
                        title={(isCollapsed && !isMobileOpen) ? item.label : undefined}
                      >
                        <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-admin-text-secondary group-hover:text-white")} />
                        {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-admin-border p-4 shrink-0">
          <button
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-admin-text-secondary transition-all hover:bg-admin-danger/10 hover:text-admin-danger"
            title={(isCollapsed && !isMobileOpen) ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
