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
      {/* UI elements here, similar to previous code */}
    </div>
  );
};
