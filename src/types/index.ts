export type Plan = 'basic' | 'pro' | 'advanced' | 'premium';
export type Blockchain = 'ETH' | 'BNB' | 'MATIC' | 'AVAX' | 'SOL';

export interface User {
  id: number;
  username: string;
  plan: Plan;
  isAdmin: boolean;
  isAllowed: boolean;
  telegramWallet: string;
}

export interface WalletResult {
  address: string;
  privateKey?: string;
  seed?: string;
  balance: string;
  blockchain: Blockchain;
  timestamp: number;
}

export interface ScannerState {
  isRunning: boolean;
  results: WalletResult[];
  speed: number;
  scanned: number;
  selectedChains: Blockchain[];
}

export interface PlanFeatures {
  name: Plan;
  speed: number;
  chains: Blockchain[];
  hasPrivateKeyScanner: boolean;
  description: string;
  price: string;
}