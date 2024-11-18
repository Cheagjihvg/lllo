import { PlanFeatures, Blockchain } from '../types';

export const SUPPORTED_CHAINS: Blockchain[] = ['ETH', 'BNB', 'MATIC', 'AVAX', 'SOL'];

export const PLAN_FEATURES: PlanFeatures[] = [
  {
    name: 'basic',
    speed: 1,
    chains: ['ETH'],
    hasPrivateKeyScanner: false,
    description: 'Perfect for beginners. Includes Ethereum scanning.',
    price: 'FREE'
  },
  {
    name: 'pro',
    speed: 10,
    chains: ['ETH', 'BNB', 'MATIC'],
    hasPrivateKeyScanner: true,
    description: 'For serious users. Multiple chains and private key scanning.',
    price: '$29.99/month'
  },
  {
    name: 'advanced',
    speed: 100,
    chains: ['ETH', 'BNB', 'MATIC', 'AVAX'],
    hasPrivateKeyScanner: true,
    description: 'Professional grade with higher speeds and more chains.',
    price: '$99.99/month'
  },
  {
    name: 'premium',
    speed: 1000,
    chains: SUPPORTED_CHAINS,
    hasPrivateKeyScanner: true,
    description: 'Ultimate package with maximum speed and all chains.',
    price: '$299.99/month'
  }
];