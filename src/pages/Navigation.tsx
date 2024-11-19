import React from 'react';
import { Home, User, Crown, Info, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
}

export const Navigation: React.FC<NavProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  const { isDark } = useTheme();
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'plans', icon: Crown, label: 'Plans' },
    { id: 'account', icon: User, label: 'Account' },
    { id: 'about', icon: Info, label: 'About' },
    ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Admin' }] : []),
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-2`}>
      <div className="flex justify-around items-center">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors
              ${activeTab === id 
                ? `${isDark ? 'text-blue-400 bg-gray-700' : 'text-blue-600 bg-blue-50'}` 
                : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
              }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};