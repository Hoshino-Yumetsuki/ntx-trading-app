"use client";

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { ReactNode } from 'react';

const projectId = 'ef5b053ee575894093910cb5b393d4ed';

const bsc = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org/'
};

const metadata = {
  name: 'NTX Trading',
  description: 'NTX Trading App - Your Web3 Gateway',
  url: 'https://ntxdao.com',
  icons: ['https://ntxdao.com/NTX-LOGO优化-7.png']
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [bsc],
  projectId,
  enableAnalytics: true,
  themeMode: 'light',
});

export {
  useWeb3Modal,
  useWeb3ModalTheme,
  useWeb3ModalAccount,
  useWeb3ModalState,
} from '@web3modal/ethers/react';

export function Web3ModalProvider({ children }: { children: ReactNode }) {
  return children;
}