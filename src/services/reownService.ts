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
const accountSubscribers: Set<(account: any) => void> = new Set();
let activeSubscriptionUnsub: (() => void) | null = null;

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
          analytics: false, // Avoid analytics telemetry mutations
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

      // Hook up any pending account subscribers if AppKit was just instantiated
      if (appKitInstance && typeof appKitInstance.subscribeAccount === 'function' && !activeSubscriptionUnsub) {
        try {
          activeSubscriptionUnsub = appKitInstance.subscribeAccount((acc: any) => {
            accountSubscribers.forEach(cb => {
              try {
                cb(acc);
              } catch (err) {
                console.warn('Error in Reown account subscriber callback:', err);
              }
            });
          });
        } catch (subErr) {
          console.warn('Reown account subscribe note:', subErr);
        }
      }
    } catch (e) {
      console.warn('Reown AppKit initialization note (non-fatal):', e);
    }
  }
  return appKitInstance;
}

export async function openReownModal(options?: { view?: 'Connect' | 'Account' | 'Networks' | 'WhatIsAWallet' | 'AllWallets' }) {
  try {
    const kit = getOrInitReownAppKit();
    if (kit && typeof kit.open === 'function') {
      return await kit.open(options);
    }
  } catch (e) {
    console.warn('Failed to open Reown modal:', e);
  }
  return null;
}

export async function disconnectReown() {
  try {
    const kit = appKitInstance;
    if (kit && typeof kit.disconnect === 'function') {
      return await kit.disconnect();
    }
  } catch (e) {
    console.warn('Error disconnecting Reown:', e);
  }
}

export function subscribeReownAccount(callback: (account: any) => void) {
  accountSubscribers.add(callback);

  // If appKitInstance already exists, ensure subscription is active
  if (appKitInstance && typeof appKitInstance.subscribeAccount === 'function' && !activeSubscriptionUnsub) {
    try {
      activeSubscriptionUnsub = appKitInstance.subscribeAccount((acc: any) => {
        accountSubscribers.forEach(cb => {
          try {
            cb(acc);
          } catch (err) {
            console.warn('Error in Reown account subscriber callback:', err);
          }
        });
      });
    } catch (e) {
      console.warn('Reown subscribeAccount error:', e);
    }
  }

  return () => {
    accountSubscribers.delete(callback);
  };
}

export function getReownAccount() {
  if (!appKitInstance) return null;
  try {
    if (typeof appKitInstance.getAccount === 'function') {
      return appKitInstance.getAccount();
    }
  } catch {
    // ignore
  }
  return null;
}

export function getReownWalletProvider() {
  if (!appKitInstance) return null;
  try {
    if (typeof appKitInstance.getWalletProvider === 'function') {
      return appKitInstance.getWalletProvider();
    }
  } catch {
    // ignore
  }
  return null;
}
