"use client";

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { ReactNode } from 'react';

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'ef5b053ee575894093910cb5b393d4ed'; // <-- PASTE YOUR PROJECT ID HERE

// 2. Set chains
const bsc = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org/'
};

// 3. Create modal
const metadata = {
  name: 'NTX Trading',
  description: 'NTX Trading App - Your Web3 Gateway',
  url: 'https://ntxdao.com', // origin must match your domain & subdomain
  icons: ['https://ntxdao.com/NTX-LOGO优化-7.png'] // must be an absolute url
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [bsc],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  themeMode: 'light',
});

// Re-export hooks and provider for easy use
export {
  useWeb3Modal,
  useWeb3ModalTheme,
  useWeb3ModalAccount,
  useWeb3ModalState,
} from '@web3modal/ethers/react';

// Create a simple provider component
export function Web3ModalProvider({ children }: { children: ReactNode }) {
  return children;
}