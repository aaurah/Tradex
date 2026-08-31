import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { formatBsv } from '../services/bsvCrypto';
import { TradexLogo } from './TradexLogo';
import { 
  Zap, 
  ArrowLeftRight, 
  Users, 
  Terminal, 
  Wallet, 
  ExternalLink, 
  Copy, 
  Check, 
  LogOut, 
  Coins, 
  Activity,
  Layers,
  ChevronDown,
  TrendingUp,
  Bot,
  Award,
  Sparkles,
  QrCode,
  Moon,
  Sun,
  Search,
  CheckCircle2
} from 'lucide-react';

export type NavTabType = 
  | 'exchange'      // Sovereign DEX Landing (IMG_0270)
  | 'swap'          // Instant Cross-Chain AMM Swap (2,200+ coins)
  | 'trade'         // Spot / BSV Orderbook Terminal (IMG_0271)
  | 'perps'         // Perpetual Futures with Leverage
  | 'predict'       // Binary Prediction Markets
  | 'stats'         // All 22M+ Markets & Telemetry
  | 'staking'       // $ORAH / $AURA Staking Vaults
  | 'ai_agents'     // Autonomous AI Trading Terminal
  | 'copy_vaults'   // Quant Copy Strategy Vaults
  | 'p2p'           // P2P Escrow
  | 'settlement'    // On-Chain Escrow Settlement
  | 'admin';        // Advanced Sovereign Admin Panel (IMG_0278, IMG_0279, IMG_0280)

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { account, isConnected, openWalletModal, disconnectWallet, claimFaucet } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [faucetClaimed, setFaucetClaimed] = useState(false);

  const bsvPriceUsd = 48.60;
  const ethPriceUsd = 2650.00;
  const ronPriceUsd = 1.85;
  const solPriceUsd = 145.00;

  const displayBalance = () => {
    if (!account) return '0.00 BSV';
    if (account.chainType === 'evm') return `${account.balanceEth?.toFixed(4) ?? '0.0000'} ETH`;
    if (account.chainType === 'ronin') return `${account.balanceRon?.toFixed(2) ?? '0.00'} RON`;
    if (account.chainType === 'solana') return `${account.balanceSol?.toFixed(4) ?? '0.0000'} SOL`;
    return `${account.balanceBsv.toFixed(4)} BSV`;
  };

  const calculateUsdValue = () => {
    if (!account) return '0.00';
    if (account.chainType === 'evm') return ((account.balanceEth || 0) * ethPriceUsd).toFixed(2);
    if (account.chainType === 'ronin') return ((account.balanceRon || 0) * ronPriceUsd).toFixed(2);
    if (account.chainType === 'solana') return ((account.balanceSol || 0) * solPriceUsd).toFixed(2);
    return (account.balanceBsv * bsvPriceUsd).toFixed(2);
  };

  const copyAddress = () => {
    if (!account?.address) return;
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimFaucet = () => {
    claimFaucet(0.50);
    setFaucetClaimed(true);
    setTimeout(() => setFaucetClaimed(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#1A1A1A] bg-[#050505] select-none">
      
      {/* TOP BAR: Logo, Domain Badge, Search, Theme & Connect (Matching Screenshots) */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo & Brand (Tradex with live pulse in 'a') */}
          <TradexLogo 
            onClick={() => setActiveTab('exchange')}
            showDomainBadge={true}
          />

          {/* Right Action Tools & Connect Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Search icon */}
            <button 
              onClick={() => setActiveTab('stats')}
              className="w-9 h-9 rounded-lg bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] text-[#888] hover:text-white flex items-center justify-center transition-colors"
              title="Search Markets"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* QR Scan icon */}
            <button 
              onClick={openWalletModal}
              className="w-9 h-9 rounded-lg bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] text-[#888] hover:text-white flex items-center justify-center transition-colors"
              title="Scan Mobile Wallet"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Faucet button */}
            <button
              onClick={handleClaimFaucet}
              disabled={faucetClaimed}
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#111111] hover:bg-[#1A1A1A] border border-[#262626] text-[#00FF41] text-xs font-mono font-bold transition-all"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{faucetClaimed ? '+0.50 BSV Added!' : 'Faucet (+0.5 BSV)'}</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                  : 'bg-[#121212] hover:bg-[#1A1A1A] border border-[#00FF41]/40 text-[#00FF41]'
              }`}
              title="Open Advanced Admin Panel"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
              <span>Admin</span>
            </button>

            {/* Connect Wallet / Account State */}
            {!isConnected ? (
              <button
                onClick={openWalletModal}
                className="px-4 py-2 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,65,0.3)] active:scale-95 transition-all flex items-center space-x-1.5"
              >
                <Wallet className="w-4 h-4 stroke-[2.5]" />
                <span>Connect</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#111111] hover:bg-[#181818] border border-[#00FF41]/40 text-xs font-mono transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></span>
                  <span className="text-white font-bold">{account?.handle || account?.walletName || 'Keeper'}</span>
                  <span className="text-[#00FF41] font-bold">
                    {displayBalance()}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0D0D0D] border border-[#262626] shadow-2xl p-4 space-y-3 z-50 text-xs font-mono">
                    <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                      <span className="text-[#888] uppercase text-[10px]">{account?.walletName || 'Connected Keeper'}</span>
                      <span className="text-[#00FF41] font-bold text-[10px]">{account?.chainType?.toUpperCase() || 'NON-CUSTODIAL'}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-[#666] uppercase flex items-center justify-between">
                        <span>{account?.multiChainEnabled ? 'Primary Address (BSV)' : 'Address'}</span>
                        {account?.multiChainEnabled && (
                          <span className="text-[#00FF41] text-[9px]">MULTI-CHAIN ACTIVE</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between bg-[#141414] p-2 rounded border border-[#222]">
                        <span className="text-white truncate font-mono text-[11px]">
                          {account?.address}
                        </span>
                        <button onClick={copyAddress} className="text-[#888] hover:text-white ml-2" title="Copy Address">
                          {copied ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Multi-Chain Connected Addresses for Passkey Wallets */}
                    {account?.multiChainEnabled && (
                      <div className="space-y-1 pt-1 border-t border-[#1C1C1C]">
                        <div className="text-[9px] text-[#888] uppercase font-bold">Connected Blockchains</div>
                        <div className="space-y-1 text-[10px]">
                          {account.evmAddress && (
                            <div className="flex items-center justify-between bg-[#121212] px-2 py-1 rounded border border-[#1E1E1E]">
                              <span className="text-orange-400 font-bold">EVM / Base:</span>
                              <span className="text-[#AAA] font-mono">{account.evmAddress.slice(0, 6)}...{account.evmAddress.slice(-4)}</span>
                            </div>
                          )}
                          {account.solanaAddress && (
                            <div className="flex items-center justify-between bg-[#121212] px-2 py-1 rounded border border-[#1E1E1E]">
                              <span className="text-purple-400 font-bold">Solana:</span>
                              <span className="text-[#AAA] font-mono">{account.solanaAddress.slice(0, 6)}...{account.solanaAddress.slice(-4)}</span>
                            </div>
                          )}
                          {account.roninAddress && (
                            <div className="flex items-center justify-between bg-[#121212] px-2 py-1 rounded border border-[#1E1E1E]">
                              <span className="text-blue-400 font-bold">Ronin:</span>
                              <span className="text-[#AAA] font-mono">{account.roninAddress.slice(0, 8)}...{account.roninAddress.slice(-4)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="text-[10px] text-[#666] uppercase">Wallet Balance</div>
                      <div className="flex justify-between items-center text-sm font-bold text-white">
                        <span>{displayBalance()}</span>
                        <span className="text-[#888] text-xs">≈ ${calculateUsdValue()} USD</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        disconnectWallet();
                        setDropdownOpen(false);
                      }}
                      className="w-full py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect Session</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* SUBNAV PILLS: Exact match to Screenshot 2 (≈ Exchange, ⇄ Trade, ↗ Futures, ◎ Predict, 📊 Markets, ⚡ Stake, 🤖 AI Agents, 👥 P2P, 🛡 Settlement) */}
      <div className="border-t border-[#141414] bg-[#080808] px-2 sm:px-6 overflow-x-auto no-scrollbar">
        <div className="max-w-[1600px] mx-auto flex items-center space-x-1 py-1.5 whitespace-nowrap text-xs font-mono">
          
          {/* 1. Exchange (Landing Portal) */}
          <button
            onClick={() => setActiveTab('exchange')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'exchange'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>≈</span>
            <span>Exchange</span>
          </button>

          {/* 2. Swap (Instant Cross-Chain AMM) */}
          <button
            onClick={() => setActiveTab('swap')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'swap'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>⇄</span>
            <span>Swap</span>
          </button>

          {/* 3. Trade (Spot BSV/USDT Terminal) */}
          <button
            onClick={() => setActiveTab('trade')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'trade'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>📈</span>
            <span>Trade</span>
          </button>

          {/* 3. Futures (Perps 50x) */}
          <button
            onClick={() => setActiveTab('perps')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'perps'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>↗</span>
            <span>Futures</span>
          </button>

          {/* 4. Predict */}
          <button
            onClick={() => setActiveTab('predict')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'predict'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>◎</span>
            <span>Predict</span>
          </button>

          {/* 5. Markets */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'stats'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>📊</span>
            <span>Markets</span>
          </button>

          {/* 6. Stake ($ORAH & $AURA) */}
          <button
            onClick={() => setActiveTab('staking')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'staking'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>⚡</span>
            <span>Stake</span>
          </button>

          {/* 7. AI Agents */}
          <button
            onClick={() => setActiveTab('ai_agents')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'ai_agents'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>🤖</span>
            <span>AI Agents</span>
          </button>

          {/* 8. Copy Vaults */}
          <button
            onClick={() => setActiveTab('copy_vaults')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'copy_vaults'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>🏆</span>
            <span>Vaults</span>
          </button>

          {/* 9. P2P */}
          <button
            onClick={() => setActiveTab('p2p')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'p2p'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>👥</span>
            <span>P2P</span>
          </button>

          {/* 10. Settlement */}
          <button
            onClick={() => setActiveTab('settlement')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'settlement'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>🛡</span>
            <span>Settlement</span>
          </button>

          {/* 11. Admin Panel */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'admin'
                ? 'bg-[#00FF41] text-black shadow-sm'
                : 'text-[#00FF41] hover:text-white hover:bg-[#141414] border border-[#00FF41]/30'
            }`}
          >
            <span>⚙</span>
            <span>Admin</span>
          </button>

        </div>
      </div>

    </header>
  );
};
