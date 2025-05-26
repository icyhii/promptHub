import { useTheme } from '../../contexts/ThemeContext';
import { Bell, Search, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 px-4 flex items-center justify-between border-b border-neutralGray-light bg-background">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutralGray-medium" 
          />
          <input
            type="text"
            placeholder="Search prompts..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-neutralGray text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          className="p-2 rounded-full hover:bg-neutralGray-light/60 text-neutralGray-dark"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          className="p-2 rounded-full hover:bg-neutralGray-light/60 text-neutralGray-dark relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-accentBlue rounded-full"></span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)} 
            className="flex items-center space-x-2 hover:bg-neutralGray-light/60 p-1 rounded-full"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-accentBlue flex items-center justify-center text-white">
              <User size={16} />
            </div>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-md py-1 border border-neutralGray-light z-10 animate-fadeIn">
              <a href="#" className="block px-4 py-2 text-sm text-textPrimary hover:bg-neutralGray-light/60">
                Profile
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-textPrimary hover:bg-neutralGray-light/60">
                Account settings
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-textPrimary hover:bg-neutralGray-light/60">
                Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}