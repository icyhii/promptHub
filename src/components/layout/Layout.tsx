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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
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