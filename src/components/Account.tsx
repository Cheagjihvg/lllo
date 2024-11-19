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
        setUser({ ...user, plan: 'pro' });
        setRedeemStatus(data.message);
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
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-lg border`}>
        <div className="flex items-center mb-6">
          <User className="w-8 h-8 mr-3 text-blue-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Account Details
          </h2>
        </div>
        <div className="space-y-4">
          {/* User Info */}
          <div className="p-4 rounded-lg">{/* User info here */}</div>
          {/* Telegram Wallet */}
          <div className="p-4 rounded-lg">{/* Wallet info and connect button here */}</div>
          {/* Redeem Key */}
          <div className="p-4 rounded-lg">{/* Redeem key UI */}</div>
        </div>
      </div>

      {/* Scan History Section */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-lg border`}>
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
            {/* Render scan history */}
          </div>
        ) : (
          <p className="text-center opacity-60">No scan history available</p>
        )}
      </div>
    </div>
  );
};
