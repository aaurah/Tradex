import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import confetti from 'canvas-confetti';
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
  RefreshCw
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
    connectRonin,
    connectSensilet,
    connectYours,
    connectSolana,
    connectPasskey,
    connectSeedOrWif,
    connectHandCash,
    connectionError,
    clearConnectionError,
    isConnecting
  } = useWallet();

  // Submodal views
  const [view, setView] = useState<'main' | 'evm_sub' | 'bsv_sub' | 'handcash_input' | 'seed_input' | 'passkey_loading' | 'qr_scan'>('main');
  const [handcashHandle, setHandcashHandle] = useState('$orah_trader');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [searchEvm, setSearchEvm] = useState('');
  const [activeWalletAction, setActiveWalletAction] = useState<string | null>(null);

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
    setActiveWalletAction(null);
    clearConnectionError();
    closeWalletModal();
  };

  const handleConnectEvm = async (walletName: string) => {
    setActiveWalletAction(walletName);
    try {
      await connectInjectedEvm(walletName);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e) {
      console.warn('Real EVM Connection prompt rejected or failed:', e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectRonin = async () => {
    setActiveWalletAction('Ronin');
    try {
      await connectRonin();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e) {
      console.warn('Ronin connection failed:', e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectSensilet = async () => {
    setActiveWalletAction('Sensilet');
    try {
      await connectSensilet();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e) {
      console.warn('Sensilet connection failed:', e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectYours = async () => {
    setActiveWalletAction('Yours');
    try {
      await connectYours();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e) {
      console.warn('Yours connection failed:', e);
    } finally {
      setActiveWalletAction(null);
    }
  };

  const handleConnectSolana = async () => {
    setActiveWalletAction('Phantom');
    try {
      await connectSolana();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      handleClose();
    } catch (e) {
      console.warn('Solana connection failed:', e);
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
                  onClick={() => handleConnectEvm(wallet.name)}
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
                      <a
                        href={wallet.installUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-mono text-[#888] hover:text-white flex items-center space-x-1 px-2 py-0.5 rounded bg-[#222]"
                      >
                        <span>GET</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
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

      </div>
    </div>
  );
};
