import React, { useState } from 'react';
import { Wallet, Key } from 'lucide-react';

interface User {
  id: number;
  username: string;
  plan: string;
  isAdmin: boolean;
  isAllowed: boolean;
  telegramWallet: string;
}

interface AccountProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const Account: React.FC<AccountProps> = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [redeemKey, setRedeemKey] = useState('');
  const { isDark } = useTheme();

  const connectWallet = async () => {
    setLoading(true);
    try {
      // Implement wallet connection logic here
      // For example, you might want to use Telegram's crypto API
      if (window.Telegram?.WebApp) {
        // This is a placeholder. Actual implementation will depend on Telegram's crypto API
        const result = await window.Telegram.WebApp.sendData(JSON.stringify({ action: 'connectWallet' }));
        if (result) {
          setUser(prevUser => ({ ...prevUser, telegramWallet: result.address }));
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showAlert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemKey = async () => {
    setLoading(true);
    try {
      // Implement key redemption logic here
      // This would typically involve a backend API call
      const response = await fetch('/api/redeem-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: redeemKey, userId: user.id }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(prevUser => ({ ...prevUser, plan: data.newPlan }));
        showAlert('Key redeemed successfully!');
      } else {
        showAlert('Invalid key. Please try again.');
      }
    } catch (error) {
      console.error('Error redeeming key:', error);
      showAlert('Failed to redeem key. Please try again.');
    } finally {
      setLoading(false);
      setRedeemKey('');
    }
  };

  const showAlert = (message: string) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Account Details</h2>
      
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <p className="text-sm opacity-70 mb-1">User ID</p>
        <p className="font-mono">{user.id}</p>
      </div>

      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <p className="text-sm opacity-70 mb-1">Username</p>
        <p className="font-mono">@{user.username}</p>
      </div>

      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <p className="text-sm opacity-70 mb-1">Current Plan</p>
        <p className="font-semibold capitalize">{user.plan}</p>
      </div>

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
            disabled={loading || !redeemKey}
            className="ml-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
          >
            <Key size={18} className="mr-2" />
            {loading ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
