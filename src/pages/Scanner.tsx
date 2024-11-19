import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, Wallet, Key, AlertCircle, Loader, Copy } from 'lucide-react';
import { ethers } from 'ethers';
import { generateMnemonic } from 'bip39';
import { useTheme } from '../context/ThemeContext';
import type { WalletResult, ScannerState, Blockchain } from '../types';
import { SUPPORTED_CHAINS } from '../config/plans';

const CHAIN_ICONS: Record<Blockchain, string> = {
  ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=025',
  BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=025',
  MATIC: 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=025',
  AVAX: 'https://cryptologos.cc/logos/avalanche-avax-logo.png?v=025',
  SOL: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=025'
};

const RPC_ENDPOINTS = {
  ETH: 'https://eth.llamarpc.com',
  BNB: 'https://bsc-dataseed.binance.org',
  MATIC: 'https://polygon-rpc.com',
  AVAX: 'https://api.avax.network/ext/bc/C/rpc',
  SOL: 'https://api.mainnet-beta.solana.com'
};

const providers = Object.entries(RPC_ENDPOINTS).reduce((acc, [chain, url]) => ({
  ...acc,
  [chain]: new ethers.JsonRpcProvider(url)
}), {} as Record<Blockchain, ethers.Provider>);

const TELEGRAM_CHANNEL_URL = "https://t.me/yourchannel"; // Replace with your actual Telegram channel link

export const Scanner: React.FC<ScannerProps> = ({ type, speed, isAllowed, allowedChains }) => {
  const { isDark } = useTheme();
  const [state, setState] = useState<ScannerState>({
    isRunning: false,
    result: null,  // Store only one result
    speed,
    scanned: 0,
    selectedChains: allowedChains
  });

  const toggleScanning = () => {
    if (!navigator.onLine) {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: 'Network Error',
          message: 'No network connection! Please check your internet connection.',
          buttons: [{ type: 'ok' }]
        });
      }
      return;
    }
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const scanWallet = useCallback(async () => {
    try {
      const chain = state.selectedChains[Math.floor(Math.random() * state.selectedChains.length)];
      const provider = providers[chain];

      if (type === 'wallet') {
        const mnemonic = generateMnemonic();
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        const balance = await provider.getBalance(wallet.address);
        
        return {
          address: wallet.address,
          seed: mnemonic,
          balance: ethers.formatEther(balance),
          blockchain: chain,
          timestamp: Date.now()
        };
      } else {
        const wallet = ethers.Wallet.createRandom();
        const balance = await provider.getBalance(wallet.address);

        return {
          address: wallet.address,
          privateKey: wallet.privateKey,
          balance: ethers.formatEther(balance),
          blockchain: chain,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error('Scanning error:', error);
      return null;
    }
  }, [type, state.selectedChains]);

  useEffect(() => {
    let interval: number;
    let isActive = true;

    const runScanner = async () => {
      if (state.isRunning && isAllowed && isActive) {
        const result = await scanWallet();
        if (result && isActive) {
          setState(prev => ({
            ...prev,
            result,  // Only store the latest result
            scanned: prev.scanned + 1,
          }));
        }
        
        if (isActive) {
          interval = setTimeout(runScanner, 1000 / speed) as unknown as number;
        }
      }
    };

    if (state.isRunning && isAllowed) {
      runScanner();
    }

    return () => {
      isActive = false;
      clearTimeout(interval);
    };
  }, [state.isRunning, scanWallet, speed, isAllowed]);

  const handleCopyFullKey = () => {
    if (state.result?.privateKey) {
      navigator.clipboard.writeText(state.result.privateKey);
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: 'Key Copied',
          message: 'Your full private key has been copied to the clipboard.',
          buttons: [{ type: 'ok' }]
        });
      }
    }
  };

  return (
    <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'} shadow-lg border ${isDark ? 'border-blue-500/20' : 'border-gray-200'} transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {type === 'wallet' ? (
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
              <Wallet className="w-6 h-6 text-blue-500" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
              <Key className="w-6 h-6 text-purple-500" />
            </div>
          )}
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {type === 'wallet' ? 'Wallet Scanner' : 'Private Key Scanner'}
          </h2>
        </div>
        <button
          onClick={toggleScanning}
          disabled={!isAllowed}
          className={`px-6 py-2 rounded-lg flex items-center transition-all duration-300 ${
            !isAllowed 
              ? 'bg-gray-400 cursor-not-allowed' 
              : state.isRunning 
                ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
          } text-white`}
        >
          {state.isRunning ? (
            <>
              <Square size={18} className="mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play size={18} className="mr-2" />
              Start
            </>
          )}
        </button>
      </div>

      {/* Join Our Community Button */}
      <div className="text-center mb-4">
        <a
          href={TELEGRAM_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:bg-blue-600 transition-all duration-300"
        >
          Join Our Community
        </a>
      </div>

      <div className="mb-6 space-y-3">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Loader className={`w-5 h-5 mr-2 ${state.isRunning ? 'animate-spin' : ''}`} />
              <span className="text-sm opacity-70">Speed</span>
            </div>
            <span className="font-mono">{speed} wallet/s</span>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm opacity-70">Scanned</span>
            </div>
            <span className="font-mono">{state.scanned}</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className="text-sm opacity-70 mb-2">Supported Chains</p>
         
          <div className="flex flex-wrap gap-2">
            {allowedChains.map(chain => (
              <div
                key={chain}
                className={`px-3 py-1.5 rounded-lg flex items-center ${
                  state.selectedChains.includes(chain)
                    ? 'bg-blue-500/10 border border-blue-500/20'
                    : isDark
                    ? 'bg-gray-700'
                    : 'bg-gray-200'
                }`}
              >
                <img
                  src={CHAIN_ICONS[chain]}
                  alt={chain}
                  className="w-4 h-4 mr-1.5"
                />
                <span className="text-sm">{chain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Show only the latest result */}
      {state.result && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} animate-fadeIn border border-blue-500/10`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <img
                src={CHAIN_ICONS[state.result.blockchain]}
                alt={state.result.blockchain}
                className="w-5 h-5 mr-2"
              />
              <span className="font-bold text-sm">{state.result.blockchain}</span>
            </div>
            <span className="text-xs opacity-50">
              {Math.floor((Date.now() - state.result.timestamp) / 1000)}s ago
            </span>
          </div>
          <p className="font-mono text-sm break-all">Address: {state.result.address}</p>
          <p className="font-mono text-sm">Balance: {state.result.balance} {state.result.blockchain}</p>
          {state.result.seed && (
            <p className="font-mono text-sm">Seed: {state.result.seed}</p>
          )}
          {state.result.privateKey && (
            <div className="font-mono text-sm break-all">
              <p>Private Key: {state.result.privateKey}</p>
              {/* Copy Full Key Button */}
              <button
                onClick={handleCopyFullKey}
                className="mt-2 px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Full Key
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
