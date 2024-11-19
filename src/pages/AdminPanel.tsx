import React, { useState, useEffect } from 'react';
import { Shield, Users, Ban, Key, Check, XCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AdminPanelProps {
  onManageUser: (action: string, userId: number, planId?: string) => void;
}

const plans = [
  { name: 'Basic', id: 'basic' },
  { name: 'Pro', id: 'pro' },
  { name: 'Advanced', id: 'advanced' },
  { name: 'Premium', id: 'premium' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onManageUser }) => {
  const { isDark } = useTheme();
  const [userId, setUserId] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [keys, setKeys] = useState<any[]>([]);
  const [actionStatus, setActionStatus] = useState<string>('');

  const isValidUserId = !isNaN(Number(userId)) && userId.trim() !== '';

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlan(e.target.value);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value);
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiresAt(e.target.value);
  };

  const handleAction = async (action: string) => {
    if (isValidUserId) {
      let url = '';
      let method = 'POST';
      let body = {
        action,
        userId: parseInt(userId),
        planId: selectedPlan,
        key,
        expiresAt,
      };

      // Adjust API endpoints for actions
      switch (action) {
        case 'create-key':
          url = '/api/createkeyandban';
          break;
        case 'delete-key':
          url = '/api/removekeyandban';
          break;
        case 'ban-user':
        case 'unban-user':
          url = '/api/admin';
          body = { action, userId: parseInt(userId) };
          break;
        default:
          return;
      }

      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
          setActionStatus(data.message);
        } else {
          setActionStatus(data.message);
        }

        // After creating/deleting a key, refresh the key list
        if (action === 'create-key' || action === 'delete-key') {
          await fetchKeyList();
        }

      } catch (error) {
        console.error('Error:', error);
        setActionStatus('Something went wrong. Please try again later.');
      }
    }
  };

  // Fetch key list from the backend
  const fetchKeyList = async () => {
    try {
      const response = await fetch('/api/showlistall');
      const data = await response.json();
      if (response.ok) {
        setKeys(data);
      } else {
        console.error('Failed to fetch keys');
      }
    } catch (error) {
      console.error('Error fetching keys:', error);
    }
  };

  useEffect(() => {
    fetchKeyList();
  }, []);

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center mb-4">
        <Shield className="mr-2" />
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>

      <div className="space-y-4">
        {/* User ID Input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID"
            className={`flex-1 p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction('ban-user')}
            className={`flex items-center justify-center p-2 rounded-lg ${isValidUserId ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 cursor-not-allowed'} text-white`}
            disabled={!isValidUserId}
          >
            <Ban size={18} className="mr-2" />
            Ban User
          </button>
          <button
            onClick={() => handleAction('unban-user')}
            className={`flex items-center justify-center p-2 rounded-lg ${isValidUserId ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white`}
            disabled={!isValidUserId}
          >
            <Check size={18} className="mr-2" />
            Unban User
          </button>
        </div>

        {/* Plan Selection */}
        <div className="mb-4">
          <label className="text-sm opacity-70">Select Plan:</label>
          <select
            value={selectedPlan}
            onChange={handlePlanChange}
            className={`w-full p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          >
            <option value="" disabled>
              Choose a Plan
            </option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>

        {/* Key Management */}
        <div className="mb-4">
          <input
            type="text"
            value={key}
            onChange={handleKeyChange}
            placeholder="Enter Redeem Key"
            className={`w-full p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleAction('create-key')}
            className="flex items-center justify-center p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Key size={18} className="mr-2" />
            Create Key
          </button>
          <button
            onClick={() => handleAction('delete-key')}
            className="flex items-center justify-center p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            <XCircle size={18} className="mr-2" />
            Delete Key
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm opacity-70">Set Expiration Date:</label>
          <input
            type="date"
            value={expiresAt}
            onChange={handleExpirationChange}
            className={`w-full p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          />
        </div>

        {/* Status Message */}
        {actionStatus && <p className="text-sm text-center">{actionStatus}</p>}

        {/* Show Key List */}
        <div className="mt-6">
          <h3 className="text-lg font-bold">Key List</h3>
          <table className="w-full table-auto mt-4">
            <thead>
              <tr>
                <th className="px-4 py-2">Key ID</th>
                <th className="px-4 py-2">Key</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Expiration Date</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((keyData) => (
                <tr key={keyData.key_id}>
                  <td className="px-4 py-2">{keyData.key_id}</td>
                  <td className="px-4 py-2">{keyData.key}</td>
                  <td className="px-4 py-2">{keyData.username || 'No Username'}</td>
                  <td className="px-4 py-2">{keyData.expires_at || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
