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
  name: 'Tradex Sovereign DEX',
  description: 'Tradex 24/7 Multi-Chain Trading, Escrow & Perpetual Terminal',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://tradex.trade',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/vite.svg` : 'https://tradex.trade/icon.png']
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

export interface ReownThemeOptions {
  themeMode?: 'dark' | 'light';
  accentColor?: string;
  backgroundPreset?: 'auto' | 'amoled' | 'dark' | 'light';
  colorMix?: string;
  colorMixStrength?: number;
}

const STORAGE_POPUP_THEME_KEY = 'tradex_wallet_popup_theme';

export function getSavedPopupTheme(): { accent: string; preset: 'auto' | 'amoled' | 'dark' | 'light' } {
  try {
    const saved = localStorage.getItem(STORAGE_POPUP_THEME_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.accent === 'string') {
        return {
          accent: parsed.accent,
          preset: parsed.preset || 'auto'
        };
      }
    }
  } catch {
    // fallback
  }
  return { accent: '#00FF41', preset: 'auto' };
}

export function savePopupTheme(accent: string, preset: 'auto' | 'amoled' | 'dark' | 'light' = 'auto') {
  try {
    localStorage.setItem(STORAGE_POPUP_THEME_KEY, JSON.stringify({ accent, preset }));
  } catch {
    // ignore
  }
}

// Ensure all "UX by Reown" branding is completely hidden across shadow DOM & web components
function setupBrandingScrubber() {
  if (typeof window === 'undefined') return;

  // 1. Monkeypatch WuiUxByReown component if module loaded
  import('@reown/appkit-ui/wui-ux-by-reown')
    .then((mod: any) => {
      if (mod?.WuiUxByReown?.prototype) {
        mod.WuiUxByReown.prototype.render = () => null;
        mod.WuiUxByReown.styles = [];
      }
    })
    .catch(() => {});

  // 2. Intercept attachShadow to inject strict CSS rules into every shadow root
  if (!(window as any).__reownBrandingScrubberInstalled) {
    (window as any).__reownBrandingScrubberInstalled = true;

    const origAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (init: ShadowRootInit) {
      const shadow = origAttachShadow.call(this, init);
      try {
        const style = document.createElement('style');
        style.setAttribute('data-tradex-anti-branding', 'true');
        style.textContent = `
          wui-ux-by-reown,
          .branding-only,
          [data-testid="ux-branding-reown"],
          a[href*="reown.com"],
          wui-icon[name="reown"],
          .w3m-legal-footer:has(wui-ux-by-reown:only-child) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            max-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            pointer-events: none !important;
            overflow: hidden !important;
          }
        `;
        shadow.appendChild(style);
      } catch {
        // ignore
      }
      return shadow;
    };

    // 3. Setup observer on document to strip any branding elements as they enter the DOM
    try {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((node: any) => {
            if (node.nodeType === 1) {
              if (node.tagName?.toLowerCase() === 'wui-ux-by-reown' || node.matches?.('wui-ux-by-reown, [data-testid="ux-branding-reown"]')) {
                node.style.display = 'none';
                node.remove?.();
              }
              const brandingItems = node.querySelectorAll?.('wui-ux-by-reown, .branding-only, [data-testid="ux-branding-reown"], a[href*="reown.com"]');
              if (brandingItems && brandingItems.length > 0) {
                brandingItems.forEach((el: any) => {
                  el.style.display = 'none';
                  el.remove?.();
                });
              }
            }
          });
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } catch {
      // ignore
    }
  }
}

// Initialize branding scrubber immediately
if (typeof window !== 'undefined') {
  setupBrandingScrubber();
}

let appKitInstance: any = null;
const accountSubscribers: Set<(account: any) => void> = new Set();
let activeSubscriptionUnsub: (() => void) | null = null;

export function computeThemeVariables(options?: ReownThemeOptions) {
  const saved = getSavedPopupTheme();
  const accent = options?.accentColor || saved.accent || '#00FF41';
  const preset = options?.backgroundPreset || saved.preset || 'auto';

  // Determine active visual mode
  let isLight = false;
  let isAmoled = false;

  if (preset === 'light') {
    isLight = true;
  } else if (preset === 'amoled') {
    isAmoled = true;
  } else if (preset === 'dark') {
    // deep charcoal dark
  } else {
    // auto: check documentElement class or window theme
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (root.classList.contains('theme-light') || root.classList.contains('light')) {
        isLight = true;
      } else if (root.classList.contains('theme-amoled')) {
        isAmoled = true;
      }
    }
    if (options?.themeMode === 'light') {
      isLight = true;
      isAmoled = false;
    }
  }

  const mode: 'dark' | 'light' = isLight ? 'light' : 'dark';

  let mixColor = '#0E0E12';
  let mixStrength = 55;

  if (isLight) {
    mixColor = '#FFFFFF';
    mixStrength = 65;
  } else if (isAmoled) {
    mixColor = '#000000';
    mixStrength = 95;
  }

  const variables: Record<string, any> = {
    '--w3m-accent': accent,
    '--w3m-color-mix': mixColor,
    '--w3m-color-mix-strength': mixStrength,
    '--w3m-border-radius-master': '12px',
    '--w3m-font-family': 'monospace, system-ui, sans-serif',
    '--w3m-z-index': 999999,
    // Alias for apkt prefixed tokens
    '--apkt-accent': accent,
    '--apkt-color-mix': mixColor,
    '--apkt-color-mix-strength': mixStrength,
    '--apkt-border-radius-master': '12px',
    '--apkt-font-family': 'monospace, system-ui, sans-serif',
    '--apkt-z-index': 999999
  };

  return { mode, variables, accent, mixColor, isLight, isAmoled };
}

export function applyReownTheme(options?: ReownThemeOptions) {
  if (typeof window === 'undefined') return;

  const { mode, variables, accent, mixColor, isLight, isAmoled } = computeThemeVariables(options);

  // Update dynamic CSS in document head for popup modal styling
  let styleTag = document.getElementById('tradex-wallet-popup-theme') as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'tradex-wallet-popup-theme';
    document.head.appendChild(styleTag);
  }

  const cardBg = isLight ? '#FFFFFF' : isAmoled ? '#000000' : '#101014';
  const cardBorder = isLight ? '#E2E8F0' : isAmoled ? '#1E1E1E' : '#26262E';
  const textColor = isLight ? '#0F172A' : '#FFFFFF';

  styleTag.textContent = `
    :root, w3m-modal, appkit-modal {
      --w3m-accent: ${accent} !important;
      --w3m-color-mix: ${mixColor} !important;
      --apkt-accent: ${accent} !important;
      --apkt-color-mix: ${mixColor} !important;
    }
    w3m-modal wui-card,
    w3m-modal [data-testid="w3m-modal-card"] {
      background-color: ${cardBg} !important;
      border: 1px solid ${cardBorder} !important;
      color: ${textColor} !important;
    }
    wui-ux-by-reown,
    .branding-only,
    [data-testid="ux-branding-reown"],
    a[href*="reown.com"],
    wui-icon[name="reown"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      width: 0 !important;
      pointer-events: none !important;
    }
  `;

  // Update AppKit instance if initialized
  if (appKitInstance) {
    try {
      if (typeof appKitInstance.setThemeMode === 'function') {
        appKitInstance.setThemeMode(mode);
      }
      if (typeof appKitInstance.setThemeVariables === 'function') {
        appKitInstance.setThemeVariables(variables);
      }
    } catch (e) {
      console.warn('Could not update Reown theme variables:', e);
    }
  }
}

export function getOrInitReownAppKit() {
  if (typeof window === 'undefined') return null;
  setupBrandingScrubber();

  if (!appKitInstance) {
    try {
      const { mode, variables } = computeThemeVariables();

      appKitInstance = createAppKit({
        adapters: [new EthersAdapter()],
        networks: [baseSepolia, sepolia, arbitrumSepolia, optimismSepolia, polygonAmoy, scrollSepolia, base, mainnet, arbitrum],
        metadata: reownMetadata,
        projectId: REOWN_PROJECT_ID,
        features: {
          analytics: false,
          email: true,
          socials: ['google', 'x', 'github', 'discord', 'apple'],
          emailShowWallets: true,
          reownBranding: false
        } as any,
        themeMode: mode,
        themeVariables: variables
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
