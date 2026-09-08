import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { 
  mainnet, 
  arbitrum, 
  base, 
  sepolia, 
  baseSepolia, 
  arbitrumSepolia, 
  optimismSepolia,
  polygonAmoy,
  scrollSepolia
} from '@reown/appkit/networks';

// Reown Cloud Project ID from cloud.reown.com or fallback demo ID
export const REOWN_PROJECT_ID = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_REOWN_PROJECT_ID) || 
  'b56e18d47c72ab683b10814fe9495694'; // Reown demo/fallback project ID

export const reownMetadata = {
  name: 'Tradex & Pulse DEX',
  description: 'Tradex & Pulse 24/7 Multi-Chain Trading, Escrow & Perpetual DEX',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://tradex.trade',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
};

export const reownSupportedNetworks = [
  baseSepolia,
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  scrollSepolia,
  base,
  mainnet,
  arbitrum
] as const;

let appKitInstance: any = null;

export function getOrInitReownAppKit() {
  if (typeof window === 'undefined') return null;
  if (!appKitInstance) {
    try {
      appKitInstance = createAppKit({
        adapters: [new EthersAdapter()],
        networks: [baseSepolia, sepolia, arbitrumSepolia, optimismSepolia, polygonAmoy, scrollSepolia, base, mainnet, arbitrum],
        metadata: reownMetadata,
        projectId: REOWN_PROJECT_ID,
        features: {
          analytics: true,
          email: true,
          socials: ['google', 'x', 'github', 'discord', 'apple'],
          emailShowWallets: true
        },
        themeMode: 'dark',
        themeVariables: {
          '--w3m-accent': '#00FF41',
          '--w3m-color-mix': '#0A0A0A',
          '--w3m-color-mix-strength': 40,
          '--w3m-border-radius-master': '12px',
          '--w3m-font-family': 'monospace, system-ui, sans-serif'
        }
      });
    } catch (e) {
      console.warn('Reown AppKit initialization note:', e);
    }
  }
  return appKitInstance;
}

export async function openReownModal(options?: { view?: 'Connect' | 'Account' | 'Networks' | 'WhatIsAWallet' | 'AllWallets' }) {
  const kit = getOrInitReownAppKit();
  if (kit && typeof kit.open === 'function') {
    return kit.open(options);
  }
  return null;
}

export async function disconnectReown() {
  const kit = getOrInitReownAppKit();
  if (kit && typeof kit.disconnect === 'function') {
    return kit.disconnect();
  }
}

export function subscribeReownAccount(callback: (account: any) => void) {
  const kit = getOrInitReownAppKit();
  if (kit && typeof kit.subscribeAccount === 'function') {
    return kit.subscribeAccount(callback);
  }
  return () => {};
}

export function getReownAccount() {
  const kit = getOrInitReownAppKit();
  if (kit && typeof kit.getAccount === 'function') {
    return kit.getAccount();
  }
  return null;
}

export function getReownWalletProvider() {
  const kit = getOrInitReownAppKit();
  if (kit && typeof kit.getWalletProvider === 'function') {
    return kit.getWalletProvider();
  }
  return null;
}
