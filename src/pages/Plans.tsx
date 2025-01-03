import React, { useState, useEffect } from 'react';
import { Zap, Check, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PLAN_FEATURES } from '../config/plans';
import type { Plan } from '../types';

interface PlansProps {
  currentPlan: Plan;
  telegramWallet: string;
  tgwebdata: any; // Assuming tgwebdata contains user subscription info
}

export const Plans: React.FC<PlansProps> = ({ currentPlan, telegramWallet, tgwebdata }) => {
  const { isDark } = useTheme();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (tgwebdata?.planExpiry) {
      // Check if the user's plan has expired
      const expiryDate = new Date(tgwebdata.planExpiry);
      const currentDate = new Date();
      setIsExpired(expiryDate < currentDate);
    }
  }, [tgwebdata]);

  const handleUpgrade = (plan: Plan) => {
    // Check if Telegram wallet is connected
    if (!telegramWallet) {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: 'Wallet Required',
          message: 'Please connect your Telegram Wallet first to upgrade your plan.',
          buttons: [{ type: 'ok' }],
        });
      }
      return;
    }

    // If the user's plan is expired, show the payment prompt
    if (isExpired) {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: 'Subscription Expired',
          message: 'Your subscription has expired. Please renew your plan using your Telegram Wallet.',
          buttons: [{ type: 'ok' }],
        });
      }
    } else {
      // Proceed to payment (if not expired)
      processPayment(plan);
    }
  };

  const processPayment = (plan: Plan) => {
    const paymentAmount = parseFloat(plan.price.replace('$', '').replace(',', '')); // Assuming price is in USD
    const usdtAmount = paymentAmount; // Assuming USDT is equal to USD in this context

    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.sendData(
          JSON.stringify({
            type: 'payment',
            amount: usdtAmount,
            currency: 'USDT',
            userId: tgwebdata.userId, // Assuming tgwebdata contains user ID
            planName: plan.name,
            telegramWallet,
          })
        );
      } catch (error) {
        console.error('Error sending payment data to Telegram WebApp:', error);
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.showPopup({
            title: 'Payment Error',
            message: 'There was an error processing your payment. Please try again later.',
            buttons: [{ type: 'ok' }],
          });
        }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Choose Your Plan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLAN_FEATURES.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-6 rounded-xl transition-all duration-300 ${
              isDark
                ? 'bg-gray-800/50 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                : 'bg-white hover:shadow-xl'
            } ${currentPlan === plan.name ? 'border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border border-gray-200'}`}
          >
            {currentPlan === plan.name && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                Current Plan
              </div>
            )}

            <div className="text-center mb-6">
              <Zap className={`w-12 h-12 mx-auto mb-4 ${plan.name === 'premium' ? 'text-purple-500' : 'text-blue-500'}`} />
              <h3 className="text-2xl font-bold capitalize mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {plan.price}
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Speed: {plan.speed} wallet/s
              </li>
              <li className="flex items-center">
                {plan.hasPrivateKeyScanner ? (
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <X className="w-5 h-5 text-red-500 mr-2" />
                )}
                Private Key Scanner
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                {plan.chains.length} Blockchain{plan.chains.length > 1 ? 's' : ''}
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade(plan)}
              disabled={currentPlan === plan.name || isExpired}
              className={`w-full py-2 px-4 rounded-lg transition-all duration-300 ${
                currentPlan === plan.name || isExpired
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              } text-white font-semibold`}
            >
              {isExpired ? 'Renew Now' : currentPlan === plan.name ? 'Current Plan' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
