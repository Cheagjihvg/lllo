import React, { useEffect, useState } from 'react';
import { User, Wallet, History, Key } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { User as UserType, WalletResult } from '../types';

interface AccountProps {
  user: UserType;
  setUser: (user: UserType) => void;
}

export const Account: React.FC<AccountProps> = ({ user, setUser }) => {
  const { isDark } = useTheme();
  const [history, setHistory] = useState<WalletResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [redeemKey, setRedeemKey] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize user data from Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
      if (initDataUnsafe?.user) {
        const telegramUser = initDataUnsafe.user;
        setUser((prevUser) => ({
          ...prevUser,
          id: telegramUser.id || 'Unknown',
          username: telegramUser.username || 'Anonymous',
        }));
      }
    }
  }, [setUser]);

  // Fetch scan history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const response = await fetch('/api/history');
        if (!response.ok) {
          throw new Error('Failed to fetch scan history');
        }
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching scan history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  const handleRedeemKey = async () => {
    if (!redeemKey.trim()) {
      setRedeemStatus('Please enter a valid redeem key.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redeemKey: redeemKey.trim(), userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setRedeemStatus(errorData.message || 'Failed to redeem key. Please try again.');
        return;
      }

      const data = await response.json();
      const { coins } = data;

      setUser({ ...user, plan: 'pro', coins: (user.coins || 0) + coins });
      setRedeemStatus(`Successfully redeemed! You received ${coins} coins.`);
    } catch (error) {
      console.error('Error redeeming key:', error);
      setRedeemStatus('Error redeeming the key. Please try again later.');
    } finally {
      setLoading(false);
      setRedeemKey('');
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Account Details Section */}
      <div
        className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'} shadow-lg border ${
          isDark ? 'border-blue-500/20' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center mb-6">
          <User className="w-8 h-8 mr-3 text-blue-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Account Details
          </h2>
        </div>

        <div className="space-y-4">
          {/* User ID */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className="text-sm opacity-70 mb-1">User ID</p>
            <p className="font-mono">{user.id || 'Not connected'}</p>
          </div>

          {/* Username */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className="text-sm opacity-70 mb-1">Username</p>
            <p className="font-mono">@{user.username || 'Not connected'}</p>
          </div>

          {/* Current Plan */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className="text-sm opacity-70 mb-1">Current Plan</p>
            <p className="font-semibold capitalize">{user.plan || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Redeem Key Section */}
      <div
        className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'} shadow-lg border ${
          isDark ? 'border-blue-500/20' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center mb-6">
          <Key className="w-8 h-8 mr-3 text-green-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
            Redeem Key
          </h2>
        </div>

        <div className="flex items-center">
          <input
            type="text"
            value={redeemKey}
            onChange={(e) => setRedeemKey(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-200/80 border border-gray-300 text-sm flex-grow"
            placeholder="Enter your redeem key"
          />
          <button
            onClick={handleRedeemKey}
            disabled={loading}
            className="ml-2 px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 text-sm"
          >
            <Key size={16} className="mr-2" />
            {loading ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>

        {redeemStatus && (
          <p className={`mt-2 text-sm ${redeemStatus.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
            {redeemStatus}
          </p>
        )}
      </div>

      {/* Scan History Section */}
      <div
        className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'} shadow-lg border ${
          isDark ? 'border-blue-500/20' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center mb-6">
          <History className="w-8 h-8 mr-3 text-purple-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Scan History
          </h2>
        </div>

        {loadingHistory ? (
          <p>Loading scan history...</p>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} transition-all duration-300`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{result.blockchain}</span>
                  <span className="text-xs opacity-50">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="font-mono text-sm break-all">Address: {result.address}</p>
                <p className="font-mono text-sm">Balance: {result.balance} {result.blockchain}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center opacity-60">No scan history available</p>
        )}
      </div>
    </div>
  );
};
