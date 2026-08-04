import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import type { SectionType } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  activeSection: SectionType;
  setActiveSection: (section: SectionType) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AdminLayout({ activeSection, setActiveSection, onLogout, children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-admin-bg text-admin-text font-sans relative">
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={(section) => {
          setActiveSection(section);
          setIsMobileMenuOpen(false); // Auto-close on mobile
        }}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onLogout={onLogout}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header 
          setActiveSection={setActiveSection} 
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mx-auto w-full max-w-7xl h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
