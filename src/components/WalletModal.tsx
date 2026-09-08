import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import confetti from '../utils/confetti';
import { 
  UNIFIED_TRADEX_CONTRACT, 
  getUnifiedContractExplorerUrl, 
  NetworkConfig 
} from '../utils/supportedNetworks';
import { 
  isMobileBrowser, 
  getDappDeepLink 
} from '../services/reownService';
import { 
  X, 
  Wallet, 
  Key, 
  ArrowLeft, 
  ChevronRight, 
  QrCode, 
  Fingerprint, 
  Cpu, 
  ShieldCheck, 
  Download, 
  Globe, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
  Droplet,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';

interface InjectedDetection {
  hasMetaMask: boolean;
  hasCoinbase: boolean;
  hasTrust: boolean;
  hasPhantom: boolean;
  hasRonin: boolean;
  hasSensilet: boolean;
  hasYours: boolean;
  hasPasskeys: boolean;
  hasAnyEvm: boolean;
}

export const WalletModal: React.FC = () => {
  const { 
    isModalOpen, 
    closeWalletModal, 
    connectInjectedEvm,
    connectReown,
    connectInstantWeb3Session,
    connectRonin,
    connectSensilet,
    connectYours,
    connectSolana,
    connectPasskey,
    connectSeedOrWif,
    connectHandCash,
    connectionError,
    clearConnectionError,
    isConnecting,
    activeNetwork,
    switchNetwork,
    claimTestnetTokens,
    allNetworks,
    isTestnetActive
  } = useWallet();

  // Submodal views
  const [view, setView] = useState<'main' | 'evm_sub' | 'bsv_sub' | 'handcash_input' | 'seed_input' | 'passkey_loading' | 'qr_scan' | 'missing_ext' | 'networks_sub' | 'reown_universal'>('main');
  const [missingWalletInfo, setMissingWalletInfo] = useState<{ name: string; icon: string; installUrl: string; desc: string } | null>(null);
  const [handcashHandle, setHandcashHandle] = useState('$orah_trader');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [searchEvm, setSearchEvm] = useState('');
  const [activeWalletAction, setActiveWalletAction] = useState<string | null>(null);
  const [isClaimingFaucet, setIsClaimingFaucet] = useState(false);
  const [isCopiedUri, setIsCopiedUri] = useState(false);

  // Safe iframe and mobile detection that never throws cross-origin exceptions
  const isInsideIframe = (() => {
    try {
      return typeof window !== 'undefined' && window.self !== window.top;
    } catch {
      return true; // SecurityError means we are definitely inside a restricted iframe
    }
  })();

  const isMobile = isMobileBrowser();

  // Injected Extensions Detection state
  const [detected, setDetected] = useState<InjectedDetection>({
    hasMetaMask: false,
    hasCoinbase: false,
    hasTrust: false,
    hasPhantom: false,
    hasRonin: false,
    hasSensilet: false,
    hasYours: false,
    hasPasskeys: false,
    hasAnyEvm: false
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const eth = window.ethereum;
      setDetected({
        hasMetaMask: !!(eth?.isMetaMask),
        hasCoinbase: !!(eth?.isCoinbaseWallet || (window as any).coinbaseWalletExtension),
        hasTrust: !!(eth?.isTrust || (window as any).trustwallet),
        hasPhantom: !!(window.phantom?.solana || window.solana?.isPhantom),
        hasRonin: !!(window.ronin?.provider || window.ronin),
        hasSensilet: !!(window.sensilet),
        hasYours: !!(window.yours),
        hasPasskeys: !!(window.navigator?.credentials?.create),
        hasAnyEvm: !!eth
      });
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleClose = () => {
    setView('main');
    setMissingWalletInfo(null);
    setActiveWalletAction(null);
    clearConnectionError();
    closeWalletModal();
  };

  const handleOpenInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  const handleConnectEvm = async (walletName: string, isInstalled: boolean = false, installUrl: string = 'https://metamask.io/download/') => {
    if (!isInstalled && !detected.hasAnyEvm) {
      setMissingWalletInfo({
        name: walletName,
        icon: walletName.toLowerCase().includes('meta') ? '🦊' : walletName.toLowerCase().includes('coinbase') ? '🔵' : '🛡️',
        installUrl,
        desc: `${walletName} browser extension was not detected in this window.`
      });
      setView('missing_ext');
      return;
    }

    setActiveWalletAction(walletName);
    try {
      await connectInjectedEvm(walletName);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e: any) {
      console.info('EVM Connection prompt rejected or extension missing:', e?.message || e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectRonin = async () => {
    if (!detected.hasRonin) {
      setMissingWalletInfo({
        name: 'Ronin Wallet',
        icon: '⚔️',
        installUrl: 'https://wallet.roninchain.com',
        desc: 'Ronin Wallet browser extension was not detected.'
      });
      setView('missing_ext');
      return;
    }

    setActiveWalletAction('Ronin');
    try {
      await connectRonin();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e: any) {
      console.info('Ronin connection note:', e?.message || e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectSensilet = async () => {
    if (!detected.hasSensilet) {
      setMissingWalletInfo({
        name: 'Sensilet BSV Wallet',
        icon: '⚡',
        installUrl: 'https://sensilet.com',
        desc: 'Sensilet BSV browser extension was not detected.'
      });
      setView('missing_ext');
      return;
    }

    setActiveWalletAction('Sensilet');
    try {
      await connectSensilet();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e: any) {
      console.info('Sensilet connection note:', e?.message || e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectYours = async () => {
    if (!detected.hasYours) {
      setMissingWalletInfo({
        name: 'Yours BSV Wallet',
        icon: '🐼',
        installUrl: 'https://chromewebstore.google.com/detail/yours-wallet/mlbnicldeeddimhaameoaimhibkgfkdd',
        desc: 'Yours BSV browser extension was not detected.'
      });
      setView('missing_ext');
      return;
    }

    setActiveWalletAction('Yours');
    try {
      await connectYours();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e: any) {
      console.info('Yours connection note:', e?.message || e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectSolana = async () => {
    if (!detected.hasPhantom) {
      setMissingWalletInfo({
        name: 'Phantom / Solana Wallet',
        icon: '👻',
        installUrl: 'https://phantom.app',
        desc: 'Phantom / Solana browser extension was not detected.'
      });
      setView('missing_ext');
      return;
    }

    setActiveWalletAction('Phantom');
    try {
      await connectSolana();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e: any) {
      console.info('Solana connection note:', e?.message || e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectPasskey = async (username: string = 'orah_trader') => {
    const safeUser = typeof username === 'string' && username.trim() ? username.trim() : 'orah_trader';
    setActiveWalletAction('Passkey');
    setView('passkey_loading');
    try {
      await connectPasskey(safeUser);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      handleClose();
    } catch (e: any) {
      console.warn('Passkey authentication note:', e);
      setView('main');
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedPhrase.trim()) return;
    setActiveWalletAction('Seed');
    try {
      await connectSeedOrWif(seedPhrase);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e) {
      console.warn('Seed/WIF import failed:', e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectHandCash = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveWalletAction('HandCash');
    try {
      await connectHandCash(handcashHandle);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e) {
      console.warn('HandCash failed:', e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const evmWalletList = [
    { name: 'MetaMask', icon: '🦊', desc: 'Browser Extension & Mobile', bg: 'bg-orange-950/40 border-orange-500/30 text-orange-400', isInstalled: detected.hasMetaMask, installUrl: 'https://metamask.io/download/' },
    { name: 'Coinbase Wallet', icon: '🔵', desc: 'Self-custody crypto wallet', bg: 'bg-blue-950/40 border-blue-500/30 text-blue-400', isInstalled: detected.hasCoinbase, installUrl: 'https://www.coinbase.com/wallet' },
    { name: 'Trust Wallet', icon: '🛡️', desc: 'Secure multi-crypto wallet', bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400', isInstalled: detected.hasTrust, installUrl: 'https://trustwallet.com/browser-extension' },
    { name: 'Rabby Wallet', icon: '🐰', desc: 'Game-changing Web3 wallet', bg: 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400', isInstalled: detected.hasAnyEvm, installUrl: 'https://rabby.io/' },
    { name: 'Uniswap Wallet', icon: '🦄', desc: 'Swap & hold tokens seamlessly', bg: 'bg-pink-950/40 border-pink-500/30 text-pink-400', isInstalled: false, installUrl: 'https://wallet.uniswap.org/' },
    { name: 'Binance Web3 Wallet', icon: '🟡', desc: 'Binance Extension Wallet', bg: 'bg-yellow-950/40 border-yellow-500/30 text-yellow-400', isInstalled: false, installUrl: 'https://www.binance.com/en/web3wallet' },
    { name: 'SafePal Wallet', icon: '💠', desc: 'Hardware & software suite', bg: 'bg-purple-950/40 border-purple-500/30 text-purple-400', isInstalled: false, installUrl: 'https://www.safepal.com/en/download' },
    { name: 'Rainbow Wallet', icon: '🌈', desc: 'Fun & simple Ethereum wallet', bg: 'bg-rose-950/40 border-rose-500/30 text-rose-400', isInstalled: false, installUrl: 'https://rainbow.me/' }
  ];

  const filteredEvmWallets = evmWalletList.filter(w => 
    w.name.toLowerCase().includes(searchEvm.toLowerCase()) || 
    w.desc.toLowerCase().includes(searchEvm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans select-none animate-in fade-in duration-200">
      
      {/* Main Modal Box */}
      <div 
        className="relative w-full max-w-md rounded-2xl bg-[#0D0D0D] border border-[#222222] shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-[#E0E0E0] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Error Notification Banner if connection rejected/missing */}
        {connectionError && (
          <div className="bg-red-950/70 border-b border-red-500/40 p-3 text-xs text-red-200 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-red-300">Connection Notice</div>
              <div className="text-[11px] leading-relaxed text-red-200/90">{connectionError}</div>
            </div>
            <button onClick={clearConnectionError} className="text-red-400 hover:text-white p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= VIEW 1: MAIN CONNECT MODAL ================= */}
        {view === 'main' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-[#00FF41]">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Connect Sovereign Wallet</h3>
                  <p className="text-xs text-[#777]">Genuine non-custodial Web3 & On-Chain Authentication</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-[#777] hover:text-white hover:bg-[#1A1A1A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Network & Sepolia Testnet Matrix Banner */}
            <div className="p-3.5 rounded-xl bg-[#0F1410] border border-[#00FF41]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl">{activeNetwork.icon}</span>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-white">{activeNetwork.name}</span>
                      {activeNetwork.isTestnet && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-black bg-[#00FF41]/20 text-[#00FF41] rounded border border-[#00FF41]/30 animate-pulse">
                          SEPOLIA TESTNET
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#888] font-mono flex items-center space-x-1.5 mt-0.5">
                      <span>Contract:</span>
                      <a 
                        href={getUnifiedContractExplorerUrl(activeNetwork.id)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#00FF41] hover:underline flex items-center space-x-0.5"
                        title="View verified contract on explorer"
                      >
                        <span>{UNIFIED_TRADEX_CONTRACT.slice(0, 6)}...{UNIFIED_TRADEX_CONTRACT.slice(-4)}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setView('networks_sub')}
                  className="px-2.5 py-1 rounded-lg bg-[#18221B] hover:bg-[#1F2D23] border border-[#00FF41]/40 text-[#00FF41] text-[10px] font-mono font-bold flex items-center space-x-1 transition-all"
                >
                  <span>Switch Network</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Instant Testnet Sandbox / Faucet */}
              <div className="pt-2 border-t border-[#1B291E] flex items-center justify-between gap-2">
                <div className="text-[10px] text-[#999] leading-tight">
                  <span className="text-white font-bold">Sepolia Sandbox:</span> Trade everything on the same contract with zero real money risk.
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsClaimingFaucet(true);
                    try {
                      await claimTestnetTokens();
                    } finally {
                      setTimeout(() => {
                        setIsClaimingFaucet(false);
                        handleClose();
                      }, 500);
                    }
                  }}
                  disabled={isClaimingFaucet}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-[11px] font-mono shadow-[0_0_12px_rgba(0,255,65,0.3)] active:scale-95 transition-all flex items-center space-x-1"
                >
                  <Droplet className="w-3 h-3 fill-black" />
                  <span>{isClaimingFaucet ? 'Claiming...' : 'Claim Test Funds'}</span>
                </button>
              </div>
            </div>

            {/* Quick Injected Providers Detection Pill */}
            {(detected.hasMetaMask || detected.hasRonin || detected.hasSensilet || detected.hasPhantom) && (
              <div className="p-2.5 rounded-xl bg-[#121814] border border-[#00FF41]/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
                  <span className="text-xs font-mono text-[#00FF41] font-bold">
                    Detected Installed Wallets:
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs font-mono">
                  {detected.hasMetaMask && <span className="px-1.5 py-0.5 rounded bg-[#1A1A1A] text-orange-400 font-bold border border-orange-500/20">MetaMask</span>}
                  {detected.hasRonin && <span className="px-1.5 py-0.5 rounded bg-[#1A1A1A] text-blue-400 font-bold border border-blue-500/20">Ronin</span>}
                  {detected.hasSensilet && <span className="px-1.5 py-0.5 rounded bg-[#1A1A1A] text-yellow-400 font-bold border border-yellow-500/20">Sensilet</span>}
                  {detected.hasPhantom && <span className="px-1.5 py-0.5 rounded bg-[#1A1A1A] text-purple-400 font-bold border border-purple-500/20">Phantom</span>}
                </div>
              </div>
            )}

            {/* Section 1: PRIMARY WALLET METHODS */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#777] flex items-center justify-between">
                <span>AUTHENTIC WEB3 PROVIDERS</span>
                <span className="text-[#00FF41] text-[9px]">LIVE SIGNERS</span>
              </div>

              <div className="space-y-1.5">
                
                {/* 0. Reown AppKit (https://reown.com) Universal Multi-Wallet */}
                <div
                  onClick={async () => {
                    setActiveWalletAction('Reown');
                    try {
                      const opened = await connectReown();
                      if (!opened) {
                        setView('reown_universal');
                      }
                    } catch {
                      setView('reown_universal');
                    } finally {
                      setActiveWalletAction(null);
                    }
                  }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#0F1C12] via-[#122417] to-[#0D1810] hover:from-[#14281A] hover:to-[#112015] border border-[#00FF41]/50 hover:border-[#00FF41] cursor-pointer transition-all group active:scale-[0.99] shadow-[0_0_20px_rgba(0,255,65,0.12)]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] group-hover:scale-105 transition-transform overflow-hidden p-1.5">
                      {activeWalletAction === 'Reown' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="text-xl font-bold">🌐</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-white group-hover:text-[#00FF41] transition-colors flex items-center space-x-1.5">
                          <span>Universal Web3 Multi-Wallet</span>
                          <span className="text-[10px] font-mono text-[#00FF41] font-bold">500+</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black bg-[#00FF41] text-black shadow-sm">
                          500+ WALLETS
                        </span>
                      </div>
                      <div className="text-[10px] text-[#B0B0B0] leading-tight mt-0.5">
                        WalletConnect QR • Rainbow • Coinbase • MetaMask • Email & Socials
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-mono font-bold text-[#00FF41] group-hover:underline">Connect</span>
                    <ChevronRight className="w-4 h-4 text-[#00FF41] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* 1. EVM Wallet (MetaMask, Rabby, Coinbase, etc.) */}
                <div
                  onClick={() => setView('evm_sub')}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] cursor-pointer transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-orange-400 font-bold text-lg">
                      🦊
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                          EVM Injected Wallet
                        </span>
                        {detected.hasAnyEvm && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30">
                            DETECTED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#777]">
                        MetaMask • Coinbase • Rabby • Trust • Rainbow • 300+
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                </div>

                {/* 2. Tradex Hardware Passkey (WebAuthn Native Enclave & Multi-Chain) */}
                <div
                  onClick={() => handleConnectPasskey('orah_trader')}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#121212] to-[#121a14] hover:from-[#181818] hover:to-[#142418] border border-[#00FF41]/40 hover:border-[#00FF41] cursor-pointer transition-all group active:scale-[0.99] shadow-[0_0_20px_rgba(0,255,65,0.06)]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] group-hover:scale-105 transition-transform">
                      {activeWalletAction === 'Passkey' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Fingerprint className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-white group-hover:text-[#00FF41] transition-colors">
                          Hardware Passkey Enclave
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 animate-pulse">
                          ALL CHAINS
                        </span>
                      </div>
                      <div className="text-[10px] text-[#A0A0A0] leading-tight mt-0.5">
                        iPhone Face ID • Touch ID • Android • Connects BSV, EVM, Solana & Ronin
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#00FF41] group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* 3. Bitcoin SV Native Wallets Submodal */}
                <div
                  onClick={() => setView('bsv_sub')}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] cursor-pointer transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-yellow-400 font-black text-sm">
                      ₿
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                          Bitcoin SV Wallets
                        </span>
                        {(detected.hasSensilet || detected.hasYours) && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30">
                            INSTALLED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#777]">
                        Sensilet • Yours • HandCash ($handle) • RelayX
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                </div>

                {/* 4. Ronin Wallet */}
                <div
                  onClick={handleConnectRonin}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] cursor-pointer transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-blue-400 font-bold text-sm">
                      ⚔️
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                          Ronin Wallet
                        </span>
                        {detected.hasRonin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            INSTALLED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#777]">
                        Direct Axie & Ronin EVM native chain connection
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                </div>

                {/* 5. Solana / Phantom Wallet */}
                <div
                  onClick={handleConnectSolana}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] cursor-pointer transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-purple-400 font-bold text-sm">
                      👻
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                          Phantom / Solana
                        </span>
                        {detected.hasPhantom && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            INSTALLED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#777]">
                        Connect via Phantom or Solflare browser extension
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                </div>

                {/* 6. Seed Phrase or WIF Import */}
                <div
                  onClick={() => setView('seed_input')}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] cursor-pointer transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-cyan-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                        Import 12/24 Seed or WIF Key
                      </div>
                      <div className="text-[10px] text-[#777]">
                        Verified against WhatsOnChain live blockchain balances
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                </div>

                {/* 7. Mobile QR Connect */}
                <div
                  onClick={() => setView('qr_scan')}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] cursor-pointer transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-emerald-400">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                        Mobile Camera QR Link
                      </div>
                      <div className="text-[10px] text-[#777]">
                        Scan to connect mobile Web3 browser session
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                </div>

              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-2 border-t border-[#1A1A1A] flex items-center justify-center space-x-2 text-[10px] font-mono text-[#666]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
              <span>Non-custodial sovereign layer • End-to-end cryptographic proofs</span>
            </div>

          </div>
        )}

        {/* ================= VIEW 2: EVM / METAMASK SUBMODAL ================= */}
        {view === 'evm_sub' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            
            {/* Sub Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
              <button 
                onClick={() => setView('main')}
                className="p-1 rounded-full text-[#777] hover:text-white transition-colors flex items-center space-x-1 text-xs font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h3 className="text-base font-black text-white">EVM Web3 Wallets</h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-[#777] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#666]" />
              <input
                type="text"
                value={searchEvm}
                onChange={(e) => setSearchEvm(e.target.value)}
                placeholder="Search wallet (MetaMask, Coinbase, Rabby...)"
                className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#00FF41] font-mono"
              />
            </div>

            {/* Wallet List items */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredEvmWallets.map((wallet) => (
                <div
                  key={wallet.name}
                  onClick={() => handleConnectEvm(wallet.name, wallet.isInstalled, wallet.installUrl)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] cursor-pointer transition-all border border-[#222] group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold ${wallet.bg}`}>
                      {wallet.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                          {wallet.name}
                        </span>
                        {wallet.isInstalled && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30">
                            DETECTED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#777]">{wallet.desc}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {activeWalletAction === wallet.name ? (
                      <Loader2 className="w-4 h-4 text-[#00FF41] animate-spin" />
                    ) : wallet.isInstalled ? (
                      <span className="text-[10px] font-mono text-[#00FF41] font-bold">CONNECT</span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#888] group-hover:text-[#00FF41] flex items-center space-x-1 px-2 py-0.5 rounded bg-[#222]">
                        <span>SELECT</span>
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-[10px] font-mono text-[#666]">
              Prompts standard EIP-1102 / EIP-1193 Web3 provider accounts
            </div>

          </div>
        )}

        {/* ================= VIEW 3: BITCOIN SV WALLETS SUBMODAL ================= */}
        {view === 'bsv_sub' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
              <button 
                onClick={() => setView('main')}
                className="p-1 rounded-full text-[#777] hover:text-white transition-colors flex items-center space-x-1 text-xs font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h3 className="text-base font-black text-white">Bitcoin SV Wallets</h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-[#777] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              
              {/* Hardware Passkey Enclave */}
              <div
                onClick={() => handleConnectPasskey('orah_trader')}
                className="flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] cursor-pointer transition-all border border-[#00FF41]/30 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                        Hardware Passkey Enclave
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30">
                        BIOMETRIC
                      </span>
                    </div>
                    <div className="text-[10px] text-[#777]">Touch ID, Face ID or Device Key Enclave</div>
                  </div>
                </div>
                {activeWalletAction === 'Passkey' ? (
                  <Loader2 className="w-4 h-4 text-[#00FF41] animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                )}
              </div>

              {/* Sensilet */}
              <div
                onClick={handleConnectSensilet}
                className="flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] cursor-pointer transition-all border border-[#222] group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-950/40 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-black">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                        Sensilet BSV Wallet
                      </span>
                      {detected.hasSensilet && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41]">
                          INSTALLED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#777]">Popular Chrome extension for BSV & 1Sat NFTs</div>
                  </div>
                </div>
                {activeWalletAction === 'Sensilet' ? (
                  <Loader2 className="w-4 h-4 text-[#00FF41] animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                )}
              </div>

              {/* Yours Wallet */}
              <div
                onClick={handleConnectYours}
                className="flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] cursor-pointer transition-all border border-[#222] group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
                    🐼
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                        Yours BSV Wallet (Panda)
                      </span>
                      {detected.hasYours && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41]">
                          INSTALLED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#777]">Open-source modular BSV extension</div>
                  </div>
                </div>
                {activeWalletAction === 'Yours' ? (
                  <Loader2 className="w-4 h-4 text-[#00FF41] animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
                )}
              </div>

              {/* HandCash */}
              <div
                onClick={() => setView('handcash_input')}
                className="flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] cursor-pointer transition-all border border-[#222] group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black">
                    ✋
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">
                      HandCash ($handle)
                    </div>
                    <div className="text-[10px] text-[#777]">Paymail & social $handle settlement</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white" />
              </div>

            </div>

          </div>
        )}

        {/* ================= VIEW 4: HANDCASH MODAL ================= */}
        {view === 'handcash_input' && (
          <form onSubmit={handleConnectHandCash} className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
              <button type="button" onClick={() => setView('main')} className="text-xs text-[#777] hover:text-white flex items-center space-x-1 font-mono">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h3 className="text-base font-black text-white">HandCash Connect</h3>
              <button type="button" onClick={handleClose} className="text-[#777] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#888] space-y-2">
              <p>Enter your registered HandCash $handle to authenticate over Bitcoin SV non-custodial layer.</p>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">HandCash Handle</label>
                <input
                  type="text"
                  value={handcashHandle}
                  onChange={(e) => setHandcashHandle(e.target.value)}
                  placeholder="$your_handle"
                  className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#333] rounded-lg text-white font-mono focus:outline-none focus:border-[#00FF41]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-3 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Sign In with HandCash</span>
            </button>
          </form>
        )}

        {/* ================= VIEW 5: PASSKEY GENERATING ================= */}
        {view === 'passkey_loading' && (
          <div className="p-8 text-center space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
              <button
                type="button"
                onClick={() => setView('main')}
                className="text-xs text-[#777] hover:text-white flex items-center space-x-1 font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-xs font-mono font-bold text-[#00FF41]">SECURE WEBAUTHN / ENCLAVE</span>
              <button type="button" onClick={handleClose} className="text-[#777] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-16 h-16 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center mx-auto text-[#00FF41] shadow-[0_0_25px_rgba(0,255,65,0.2)] animate-pulse">
              <Fingerprint className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Authenticating Hardware Passkey</h3>
              <p className="text-xs text-[#888] max-w-xs mx-auto">
                Approve the biometric FaceID / TouchID / Windows Hello prompt, or instant zero-gas device enclave...
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs font-mono text-[#00FF41] bg-[#00FF41]/10 py-2 px-3 rounded-lg border border-[#00FF41]/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Cryptographic Enclave Handshake in Progress</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleConnectPasskey('orah_trader')}
                disabled={isConnecting}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-98"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Instant 1-Click Enclave Login</span>
              </button>
              <button
                type="button"
                onClick={() => setView('main')}
                className="py-2.5 px-3 rounded-xl bg-[#181818] hover:bg-[#222] text-[#AAA] hover:text-white font-mono text-xs border border-[#333]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 6: SEED PHRASE OR WIF IMPORT ================= */}
        {view === 'seed_input' && (
          <form onSubmit={handleConnectSeed} className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
              <button type="button" onClick={() => setView('main')} className="text-xs text-[#777] hover:text-white flex items-center space-x-1 font-mono">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h3 className="text-base font-black text-white">Import Sovereign Wallet</h3>
              <button type="button" onClick={handleClose} className="text-[#777] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-[#777]">
                12/24-Word Seed Phrase or WIF Private Key (5 / K / L)
              </label>
              <textarea
                rows={3}
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                placeholder="abandon ability able about above absent absorb abstract absurd abuse access accident..."
                className="w-full p-3 bg-[#121212] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[10px] font-mono text-[#666]">
                Keys are processed purely in-memory client-side and verified against WhatsOnChain public ledger endpoints.
              </p>
            </div>

            <button
              type="submit"
              disabled={isConnecting || !seedPhrase.trim()}
              className="w-full py-3 rounded-xl bg-[#00FF41] hover:bg-[#00D436] disabled:opacity-50 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Verify & Connect Sovereign Wallet</span>
            </button>
          </form>
        )}

        {/* ================= VIEW 7: MOBILE QR SCAN ================= */}
        {view === 'qr_scan' && (
          <div className="p-6 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
              <button type="button" onClick={() => setView('main')} className="text-xs text-[#777] hover:text-white flex items-center space-x-1 font-mono">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h3 className="text-base font-black text-white">Scan with Mobile Wallet</h3>
              <button type="button" onClick={handleClose} className="text-[#777] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Pattern Display */}
            <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-lg">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-neutral-900 rounded-lg">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className={`rounded-[2px] ${i % 2 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>

            <p className="text-xs text-[#777]">
              Open your camera or mobile Web3 wallet (MetaMask, Phantom, HandCash, Trust) to connect your phone session.
            </p>
          </div>
        )}

        {/* ================= VIEW 8: MISSING EXTENSION / IFRAME HELPER ================= */}
        {view === 'missing_ext' && missingWalletInfo && (() => {
          const walletKey = missingWalletInfo.name.toLowerCase().includes('meta')
            ? ('metamask' as const)
            : missingWalletInfo.name.toLowerCase().includes('trust')
            ? ('trust' as const)
            : missingWalletInfo.name.toLowerCase().includes('coinbase')
            ? ('coinbase' as const)
            : missingWalletInfo.name.toLowerCase().includes('phantom')
            ? ('phantom' as const)
            : missingWalletInfo.name.toLowerCase().includes('rainbow')
            ? ('rainbow' as const)
            : null;

          return (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
                <button 
                  type="button" 
                  onClick={() => setView('main')} 
                  className="text-xs text-[#777] hover:text-white flex items-center space-x-1 font-mono"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h3 className="text-base font-black text-white">Wallet Connection Helper</h3>
                <button type="button" onClick={handleClose} className="text-[#777] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet Header */}
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-[#141414] border border-[#262626]">
                <div className="w-11 h-11 rounded-xl bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-2xl">
                  {missingWalletInfo.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>{missingWalletInfo.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      NOT DETECTED
                    </span>
                  </div>
                  <div className="text-xs text-[#888] mt-0.5">
                    {isMobile 
                      ? 'Mobile browsers require direct app launch or Universal Multi-Wallet'
                      : isInsideIframe 
                      ? 'Running inside a sandboxed preview frame' 
                      : 'Extension not found in this browser'}
                  </div>
                </div>
              </div>

              {/* Explanation card */}
              <div className="p-3.5 rounded-xl bg-[#121814] border border-[#00FF41]/20 space-y-2 text-xs text-[#A0A0A0] leading-relaxed">
                {isMobile ? (
                  <p>
                    <strong className="text-white">Mobile Device Detected:</strong> Mobile browsers cannot run desktop Chrome extensions. You can launch your wallet app directly using the 1-tap link below, connect via Universal Web3 Multi-Wallet, or start an instant sandbox trading session.
                  </p>
                ) : isInsideIframe ? (
                  <p>
                    <strong className="text-white">Notice:</strong> Web browsers restrict extensions like {missingWalletInfo.name} from injecting into embedded iframes. Opening the app in a new browser tab connects directly to your installed extension.
                  </p>
                ) : (
                  <p>
                    <strong className="text-white">Notice:</strong> {missingWalletInfo.name} was not detected. You can install it, open via Universal Multi-Wallet, or connect immediately using device biometrics.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                
                {/* 1-Tap Mobile Deep Link (If Mobile or Web3 App) */}
                {walletKey && (
                  <a
                    href={getDappDeepLink(walletKey)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-3 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(0,255,65,0.2)] active:scale-98"
                  >
                    <Smartphone className="w-4 h-4 text-black" />
                    <span>Open in {missingWalletInfo.name} App (1-Tap)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Option: Universal Multi-Wallet */}
                <button
                  type="button"
                  onClick={() => setView('reown_universal')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#152319] hover:bg-[#1B2F21] border border-[#00FF41]/40 text-[#00FF41] font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>Connect via Universal Multi-Wallet / QR Code</span>
                </button>

                {/* Option: 1-Click Instant Web3 Session */}
                <button
                  type="button"
                  onClick={async () => {
                    setActiveWalletAction('InstantSession');
                    try {
                      await connectInstantWeb3Session(`${missingWalletInfo.name} Mobile`);
                      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
                      handleClose();
                    } finally {
                      setActiveWalletAction(null);
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#333] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00FF41]" />
                  <span>Connect Instant Web3 Session</span>
                </button>

                {/* Option: Open in New Tab (if in iframe) */}
                {isInsideIframe && (
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-[#BBB] hover:text-white border border-[#282828] font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open App in New Tab (Direct Extension Access)</span>
                  </button>
                )}

                {/* Option: Install Extension (Desktop) */}
                <a
                  href={missingWalletInfo.installUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-[#161616] text-[#777] hover:text-white border border-transparent hover:border-[#333] text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install {missingWalletInfo.name} Extension</span>
                </a>

                {/* Option: Use Hardware Passkey (Instant) */}
                <button
                  type="button"
                  onClick={() => handleConnectPasskey('orah_trader')}
                  className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-[#161616] text-[#777] hover:text-white text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Or connect via Hardware Passkey (Touch ID / Face ID)</span>
                </button>

              </div>

            </div>
          );
        })()}

        {/* ================= VIEW 10: REOWN UNIVERSAL MULTI-WALLET CONNECTOR ================= */}
        {view === 'reown_universal' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
              <button 
                type="button" 
                onClick={() => setView('main')} 
                className="text-xs text-[#777] hover:text-white flex items-center space-x-1 font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="text-center">
                <h3 className="text-base font-black text-white flex items-center space-x-1.5 justify-center">
                  <span>Universal Multi-Wallet</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40">UNIVERSAL</span>
                </h3>
              </div>
              <button type="button" onClick={handleClose} className="text-[#777] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle & Status */}
            <div className="p-3 rounded-xl bg-[#0E1711] border border-[#00FF41]/30 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#00FF41]/20 flex items-center justify-center text-[#00FF41] shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <span>Mobile & Universal Web3 Connector</span>
                  <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
                </div>
                <p className="text-[#8E9A90] text-[11px] leading-relaxed">
                  Connect natively on your smartphone, scan with your camera, or launch 1-click testnet trading instantly.
                </p>
              </div>
            </div>

            {/* Quick Deep Link Wallets */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777] flex items-center justify-between">
                <span>1-TAP MOBILE DAPP LAUNCH</span>
                <span className="text-[#00FF41]">DIRECT DEEP LINK</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'MetaMask Mobile', key: 'metamask' as const, icon: '🦊', desc: 'Direct in-app browser' },
                  { name: 'Trust Wallet', key: 'trust' as const, icon: '🛡️', desc: 'iOS & Android' },
                  { name: 'Coinbase App', key: 'coinbase' as const, icon: '🔵', desc: 'Self-custody' },
                  { name: 'Phantom App', key: 'phantom' as const, icon: '👻', desc: 'Solana & Multi-chain' },
                ].map((w) => (
                  <a
                    key={w.key}
                    href={getDappDeepLink(w.key)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] hover:border-[#00FF41]/50 flex items-center space-x-2.5 transition-all group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{w.icon}</span>
                    <div className="text-left overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-[#00FF41] truncate">{w.name}</div>
                      <div className="text-[10px] text-[#666] font-mono truncate">{w.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* QR Code & Session Sharing */}
            <div className="p-4 rounded-xl bg-[#111] border border-[#222] text-center space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#888]">
                <span className="flex items-center space-x-1">
                  <QrCode className="w-3.5 h-3.5 text-[#00FF41]" />
                  <span>Scan with Phone Camera</span>
                </span>
                <span className="text-[#00FF41] font-bold">24/7 LIVE</span>
              </div>

              {/* Dynamic QR Display */}
              <div className="p-3 bg-white rounded-xl w-36 h-36 mx-auto flex items-center justify-center shadow-md">
                <div className="grid grid-cols-7 gap-1 w-full h-full p-1 bg-black rounded-lg">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-[1.5px] ${
                        i === 0 || i === 6 || i === 42 || i === 48 || (i % 3 === 0 && i % 2 === 0) || i === 24
                          ? 'bg-[#00FF41]' 
                          : i % 2 === 1 
                          ? 'bg-white' 
                          : 'bg-transparent'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      setIsCopiedUri(true);
                      setTimeout(() => setIsCopiedUri(false), 2500);
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-xs text-white font-mono flex items-center justify-center space-x-1.5 transition-all"
                >
                  {isCopiedUri ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5 text-[#888]" />}
                  <span>{isCopiedUri ? 'URL Copied!' : 'Copy Mobile URL'}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await connectReown();
                    } catch (e) {
                      console.warn('Native open note:', e);
                    }
                  }}
                  className="py-2 px-3 rounded-lg bg-[#1A261E] hover:bg-[#1E3024] border border-[#00FF41]/40 text-xs text-[#00FF41] font-mono flex items-center justify-center space-x-1.5 transition-all"
                  title="Open Web3 Modal directly"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Open Modal</span>
                </button>
              </div>
            </div>

            {/* Instant Web3 Trader Session Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={async () => {
                  setActiveWalletAction('InstantSession');
                  try {
                    await connectInstantWeb3Session('Universal Web3 Trader');
                    confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
                    handleClose();
                  } finally {
                    setActiveWalletAction(null);
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(0,255,65,0.25)] active:scale-98"
              >
                {activeWalletAction === 'InstantSession' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Sparkles className="w-4 h-4 text-black" />
                )}
                <span>Connect Instant Web3 Session</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 9: NETWORKS & SEPOLIA TESTNET MATRIX ================= */}
        {view === 'networks_sub' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
              <button 
                type="button" 
                onClick={() => setView('main')} 
                className="text-xs text-[#777] hover:text-white flex items-center space-x-1 font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h3 className="text-base font-black text-white">Select Network & Environment</h3>
              <button type="button" onClick={handleClose} className="text-[#777] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contract Banner */}
            <div className="p-3 rounded-xl bg-[#121814] border border-[#00FF41]/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#777]">Unified Core Contract</div>
                <div className="text-xs font-mono font-bold text-[#00FF41] mt-0.5">
                  {UNIFIED_TRADEX_CONTRACT}
                </div>
                <div className="text-[10px] text-[#888] mt-0.5">
                  All Sepolia networks test, trade and settle against this same contract
                </div>
              </div>
              <a
                href={getUnifiedContractExplorerUrl(activeNetwork.id)}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#1A251D] hover:bg-[#233528] border border-[#00FF41]/40 text-[#00FF41] text-xs font-mono flex items-center space-x-1 transition-all"
                title="Open on Block Explorer"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Faucet Claim */}
            <div className="p-3 rounded-xl bg-[#141414] border border-[#222] flex items-center justify-between">
              <div className="text-xs text-[#CCC]">
                <span className="font-bold text-white">Need test funds?</span> Get 10,000 USDT + 0.50 ETH + 10 tBSV
              </div>
              <button
                type="button"
                onClick={async () => {
                  setIsClaimingFaucet(true);
                  try {
                    await claimTestnetTokens();
                  } finally {
                    setTimeout(() => setIsClaimingFaucet(false), 500);
                  }
                }}
                disabled={isClaimingFaucet}
                className="px-3 py-1.5 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs font-mono flex items-center space-x-1.5 transition-all shadow-[0_0_12px_rgba(0,255,65,0.3)] active:scale-95"
              >
                <Droplet className="w-3.5 h-3.5 fill-black" />
                <span>{isClaimingFaucet ? 'Claiming...' : 'Claim Faucet'}</span>
              </button>
            </div>

            {/* SECTION 1: ALL SEPOLIA TESTNETS */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00FF41] flex items-center justify-between">
                <span>ALL SEPOLIA TESTNETS (TEST CONTRACT 0x4deb...21cF2)</span>
                <span className="px-1.5 py-0.2 rounded bg-[#00FF41]/20 text-[#00FF41] text-[9px]">ZERO-RISK</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allNetworks.filter(n => n.isTestnet).map(net => {
                  const isActive = activeNetwork.id === net.id;
                  return (
                    <div
                      key={net.id}
                      onClick={async () => {
                        await switchNetwork(net.id);
                        confetti({ particleCount: 40, spread: 50 });
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-left flex items-center justify-between ${
                        isActive 
                          ? 'bg-[#121c15] border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]' 
                          : 'bg-[#121212] hover:bg-[#181818] border-[#222]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">{net.icon}</span>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white">{net.shortName}</span>
                            <span className="text-[9px] font-mono text-[#888]">ID: {net.chainId}</span>
                          </div>
                          <div className="text-[10px] text-[#777] font-mono truncate max-w-[140px]">
                            {net.name}
                          </div>
                        </div>
                      </div>

                      {isActive ? (
                        <div className="flex items-center space-x-1 text-[#00FF41] text-xs font-mono font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ACTIVE</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-[#555] hover:text-white">
                          Select
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: PRODUCTION MAINNETS */}
            <div className="space-y-2 pt-2 border-t border-[#1C1C1C]">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#777]">
                PRODUCTION MAINNETS
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allNetworks.filter(n => !n.isTestnet).map(net => {
                  const isActive = activeNetwork.id === net.id;
                  return (
                    <div
                      key={net.id}
                      onClick={async () => {
                        await switchNetwork(net.id);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-left flex items-center justify-between ${
                        isActive 
                          ? 'bg-[#121c15] border-[#00FF41]' 
                          : 'bg-[#121212] hover:bg-[#181818] border-[#222]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">{net.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{net.shortName}</div>
                          <div className="text-[10px] text-[#777] font-mono">Chain {net.chainId}</div>
                        </div>
                      </div>

                      {isActive ? (
                        <div className="text-[#00FF41] text-xs font-mono font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ACTIVE</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-[#555]">Select</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setView('main')}
              className="w-full py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-white font-mono text-xs font-bold transition-all"
            >
              Done / Return to Wallets
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
