import React, { useState, useEffect } from 'react';
import { Moon, Sun, Wallet, Key } from 'lucide-react';  // Use Wallet icon
import { WebApp } from '@twa-dev/sdk';
import { Navigation } from './components/Navigation';
import { Scanner } from './components/Scanner';
import { About } from './components/About';
import { Account } from './components/Account';
import { Plans } from './components/Plans';
import { AdminPanel } from './components/AdminPanel';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PLAN_FEATURES } from './config/plans';
import type { User, Plan } from './types';

const ADMIN_IDS = [1439771387, 987654321]; // Replace with real admin IDs

// Admin panel action handler
const onManageUser = (action: string, userId: number) => {
  if (action === 'allow') {
    console.log(`Allowing user with ID: ${userId}`);
    // Add logic to allow user
  } else if (action === 'ban') {
    console.log(`Banning user with ID: ${userId}`);
    // Add logic to ban user
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeScanner, setActiveScanner] = useState<'wallet' | 'privateKey'>('wallet');
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState<User>({
    id: 0,
    username: '',
    plan: 'basic',
    isAdmin: false, // Default to false until we fetch the user data
    isAllowed: true,
    telegramWallet: ''
  });

  // Fetch user details from Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      try {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        setUser({
          id: tgUser.id,
          username: tgUser.username || '',
          plan: 'basic', // Default plan (can be dynamic)
          isAdmin: ADMIN_IDS.includes(tgUser.id),
          isAllowed: true,
          telegramWallet: ''
        });
      } catch (error) {
        console.error('Error fetching Telegram user data:', error);
      }
    }
  }, []);

  const planFeatures = PLAN_FEATURES.find(p => p.name === user.plan) || PLAN_FEATURES[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setActiveScanner('wallet')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                  activeScanner === 'wallet'
                    ? `${isDark ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-blue-500 shadow-lg'} text-white`
                    : `${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`
                }`}
              >
                <Wallet size={20} className="mr-2 inline-block align-middle" /> Wallet Scanner
              </button>
              <button
                onClick={() => setActiveScanner('privateKey')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                  activeScanner === 'privateKey'
                    ? `${isDark ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-blue-500 shadow-lg'} text-white`
                    : `${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`
                }`}
              >
                <Key size={20} className="mr-2 inline-block align-middle" /> Private Key Scanner
              </button>
            </div>
            <Scanner
              type={activeScanner}
              speed={planFeatures.speed}
              isAllowed={user.isAllowed && (activeScanner === 'wallet' || planFeatures.hasPrivateKeyScanner)}
              allowedChains={planFeatures.chains}
            />
          </div>
        );
      case 'plans':
        return <Plans currentPlan={user.plan} telegramWallet={user.telegramWallet} tgwebdata={user} />;
      case 'account':
        return <Account user={user} setUser={setUser} />;
      case 'about':
        return <About />;
      case 'admin':
        return user.isAdmin ? <AdminPanel onManageUser={onManageUser} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`fixed top-0 left-0 right-0 z-10 p-4 ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'} shadow-lg`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Wallet Finder
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-300 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-20 pb-24">
        {renderContent()}
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={user.isAdmin} />
    </div>
  );
}

const AppWrapper = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWrapper;
