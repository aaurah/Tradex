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
          '--w3m-font-family': 'monospace, system-ui, sans-serif',
          '--w3m-z-index': 999999
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

export async function openReownModal(options?: { view?: 'Connect' | 'Account' | 'Networks' | 'WhatIsAWallet' | 'AllWallets' }): Promise<{ success: boolean; error?: string }> {
  try {
    const kit = getOrInitReownAppKit();
    if (kit && typeof kit.open === 'function') {
      await kit.open(options);
      return { success: true };
    }
    return { success: false, error: 'Reown AppKit is not initialized' };
  } catch (e: any) {
    console.warn('Failed to open Reown modal:', e);
    return { success: false, error: e?.message || 'Failed to open Reown modal' };
  }
}

/**
 * Detect mobile browser (iOS, Android, etc.)
 */
export function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Safely check if current execution context is inside a sandboxed iframe
 */
export function isSandboxedIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Generates universal deep links for mobile Web3 wallets to open the DEX
 */
export function getDappDeepLink(wallet: 'metamask' | 'trust' | 'coinbase' | 'phantom' | 'rainbow'): string {
  if (typeof window === 'undefined') return '';
  const currentUrl = window.location.href;
  const hostPath = window.location.host + window.location.pathname + window.location.search;

  switch (wallet) {
    case 'metamask':
      // MetaMask Mobile Universal Link: launches MetaMask dapp browser directly
      return `https://metamask.app.link/dapp/${hostPath}`;
    case 'trust':
      // Trust Wallet Deep Link
      return `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(currentUrl)}`;
    case 'coinbase':
      // Coinbase Wallet Link
      return `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(currentUrl)}`;
    case 'phantom':
      // Phantom Mobile Link
      return `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}`;
    case 'rainbow':
      // Rainbow Mobile Link
      return `https://rainbow.me/link?url=${encodeURIComponent(currentUrl)}`;
    default:
      return currentUrl;
  }
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
