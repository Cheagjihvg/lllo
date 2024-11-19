import React from 'react';
import { Shield, Zap, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const About: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-4">About Wallet Finder</h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Wallet Finder is a powerful tool designed for cryptocurrency enthusiasts and researchers.
          Our platform provides secure and efficient wallet scanning capabilities across multiple blockchains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <Shield className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Built with security-first approach, ensuring your scanning activities are safe and private.
          </p>
        </div>

        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <Zap className="w-12 h-12 text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Fast</h3>
          <p className="text-gray-600 dark:text-gray-300">
            High-performance scanning engine capable of processing thousands of addresses per second.
          </p>
        </div>

        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <Lock className="w-12 h-12 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Private</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Your scanning activities and results are never stored or shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};