import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { LayoutDashboard, FileText, Users, Compass, FlaskRound as Flask, TrendingUp, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/prompts', label: 'My Prompts', icon: <FileText size={20} /> },
    { path: '/teams', label: 'Teams', icon: <Users size={20} /> },
    { path: '/community', label: 'Community Library', icon: <Compass size={20} /> },
    { path: '/playground', label: 'Playground', icon: <Flask size={20} /> },
    { path: '/optimization', label: 'Optimization', icon: <TrendingUp size={20} /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={cn(
      "fixed h-full bg-background border-r border-neutralGray-light transition-all duration-300 z-10",
      isSidebarOpen ? "w-64" : "w-16"
    )}>
      <div className="flex justify-between items-center h-16 px-4 border-b border-neutralGray-light">
        <h1 className={cn(
          "font-bold text-textPrimary transition-opacity duration-200",
          isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
        )}>
          PromptHub
        </h1>
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-neutralGray-light transition-colors"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      <nav className="mt-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  "hover:bg-neutralGray-light", 
                  isActive 
                    ? "bg-neutralGray-light text-accentBlue" 
                    : "text-textSecondary",
                  !isSidebarOpen && "justify-center"
                )}
                end
              >
                <span className="flex items-center justify-center">
                  {item.icon}
                </span>
                <span className={cn(
                  "ml-3 font-medium transition-opacity duration-200",
                  isSidebarOpen ? "opacity-100" : "opacity-0 hidden w-0"
                )}>
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}