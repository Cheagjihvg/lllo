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
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch scan history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  const connectWallet = async () => {
    if (window.Telegram?.WebApp) {
      setLoading(true);
      try {
        const wallet = await window.Telegram.WebApp.connectWallet();
        setUser({ ...user, telegramWallet: wallet });
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        window.Telegram?.WebApp.showPopup({
          title: 'Connection Error',
          message: 'Failed to connect your wallet. Please try again later.',
          buttons: [{ type: 'ok' }],
        });
      } finally {
        setLoading(false);
      }
    }
  };

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

      const data = await response.json();
      if (response.ok) {
        // Assuming the redeem API returns the amount of coins redeemed
        const { coins } = data;  // The response should include the coins awarded
        setUser({ ...user, plan: 'pro', coins: (user.coins || 0) + coins }); // Update user plan and coins
        setRedeemStatus(`Successfully redeemed! You received ${coins} coins.`);
      } else {
        setRedeemStatus(data.message || 'Failed to redeem key');
      }
    } catch (error) {
      console.error('Error redeeming key:', error);
      setRedeemStatus('Error redeeming the key. Please try again later.');
    } finally {
      setLoading(false);
    }

    setRedeemKey('');
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
            <p className="font-semibold capitalize">{user.plan}</p>
          </div>

          {/* Telegram Wallet */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-70 mb-1">Telegram Wallet</p>
                <p className="font-mono">{user.telegramWallet || 'Not connected'}</p>
              </div>
              {!user.telegramWallet && (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center"
                >
                  <Wallet size={18} className="mr-2" />
                  {loading ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          </div>

          {/* Redeem Key Section */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className="text-sm opacity-70 mb-1">Redeem Key</p>
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
        </div>
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
