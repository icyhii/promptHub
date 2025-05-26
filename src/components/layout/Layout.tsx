import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn } from '../../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Layout({ children, isSidebarOpen, toggleSidebar }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={cn(
        "transition-all duration-300",
        isSidebarOpen ? "ml-64" : "ml-16"
      )}>
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}