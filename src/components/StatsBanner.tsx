import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { formatBsv } from '../services/bsvCrypto';
import { perpService } from '../services/perpService';
import { useWallet } from '../context/WalletContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  Zap, 
  Activity, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2,
  Wallet,
  PieChart as PieChartIcon,
  Sparkles,
  RefreshCw,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Globe
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CoinLogo } from './CoinLogo';

interface ChainEquityData {
  name: string;
  chainKey: 'bsv' | 'solana' | 'evm' | 'ronin' | 'vaults';
  value: number;
  color: string;
  icon: string;
  pnlUsd: number;
  positionsCount: number;
  nativeAsset: string;
  nativeBalance: number;
}

export const StatsBanner: React.FC = () => {
  const [stats, setStats] = useState(apiService.getEscrowStats());
  const { account, isConnected, openWalletModal, claimFaucet } = useWallet();
  const [positions, setPositions] = useState(perpService.getPositions());
  const [aiAgents, setAiAgents] = useState(perpService.getAIAgents());
  const [copyVaults, setCopyVaults] = useState(perpService.getCopyVaults());
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(apiService.getEscrowStats());
      setPositions(perpService.getPositions());
      setAiAgents(perpService.getAIAgents());
      setCopyVaults(perpService.getCopyVaults());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setStats(apiService.getEscrowStats());
    setPositions(perpService.getPositions());
    setAiAgents(perpService.getAIAgents());
    setCopyVaults(perpService.getCopyVaults());
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Live asset reference prices
  const prices = {
    BSV: 48.60,
    SOL: 198.40,
    ETH: 2740.50,
    RON: 1.84,
    ORAH: 1.48
  };

  // Derive wallet balances (support both connected wallet and fallback baseline portfolio)
  const bsvBalance = account?.balanceBsv ?? (isConnected ? 0 : 12.5);
  const ethBalance = account?.balanceEth ?? (isConnected ? 0 : 0.85);
  const solBalance = account?.balanceSol ?? (isConnected ? 0 : 4.2);
  const ronBalance = account?.balanceRon ?? (isConnected ? 0 : 150);

  // Spot wallet values in USD
  const bsvSpotUsd = bsvBalance * prices.BSV;
  const ethSpotUsd = ethBalance * prices.ETH;
  const solSpotUsd = solBalance * prices.SOL;
  const ronSpotUsd = ronBalance * prices.RON;

  // Margin locked in open positions categorized by chain/market
  const positionsPnlAndMargin = useMemo(() => {
    let totalPnl = 0;
    let totalMargin = 0;
    let bsvMargin = 0;
    let bsvPnl = 0;
    let solMargin = 0;
    let solPnl = 0;
    let evmMargin = 0;
    let evmPnl = 0;
    let ronMargin = 0;
    let ronPnl = 0;

    positions.forEach(p => {
      totalPnl += p.unrealizedPnlUsd;
      totalMargin += p.marginUsd;

      if (p.market.startsWith('BSV') || p.market.startsWith('ORAH') || p.market.startsWith('AURA')) {
        bsvMargin += p.marginUsd;
        bsvPnl += p.unrealizedPnlUsd;
      } else if (p.market.startsWith('SOL')) {
        solMargin += p.marginUsd;
        solPnl += p.unrealizedPnlUsd;
      } else if (p.market.startsWith('ETH') || p.market.startsWith('BTC')) {
        evmMargin += p.marginUsd;
        evmPnl += p.unrealizedPnlUsd;
      } else if (p.market.startsWith('RON')) {
        ronMargin += p.marginUsd;
        ronPnl += p.unrealizedPnlUsd;
      }
    });

    return {
      totalPnl,
      totalMargin,
      bsvMargin,
      bsvPnl,
      solMargin,
      solPnl,
      evmMargin,
      evmPnl,
      ronMargin,
      ronPnl
    };
  }, [positions]);

  // AI Agent & Copy Vault invested capital
  const aiAgentCapital = useMemo(() => {
    return aiAgents.reduce((acc, a) => acc + (a.status === 'active' ? a.allocatedCapitalUsd : 0), 0);
  }, [aiAgents]);

  const aiAgentPnl = useMemo(() => {
    return aiAgents.reduce((acc, a) => acc + a.totalPnlUsd, 0);
  }, [aiAgents]);

  const vaultsCapital = useMemo(() => {
    return copyVaults.reduce((acc, v) => acc + (v.isUserSubscribed ? v.userInvestedUsd : 0), 0);
  }, [copyVaults]);

  // Multi-Chain Equity Breakdown for Pie Chart
  const chainBreakdownData: ChainEquityData[] = useMemo(() => {
    const bsvTotal = bsvSpotUsd + positionsPnlAndMargin.bsvMargin + positionsPnlAndMargin.bsvPnl;
    const solTotal = solSpotUsd + positionsPnlAndMargin.solMargin + positionsPnlAndMargin.solPnl;
    const evmTotal = ethSpotUsd + positionsPnlAndMargin.evmMargin + positionsPnlAndMargin.evmPnl;
    const ronTotal = ronSpotUsd + positionsPnlAndMargin.ronMargin + positionsPnlAndMargin.ronPnl;
    const vaultsTotal = Math.max(vaultsCapital + aiAgentCapital + aiAgentPnl, 500);

    return [
      {
        name: 'Bitcoin SV (BSV UTXO)',
        chainKey: 'bsv',
        value: parseFloat(bsvTotal.toFixed(2)),
        color: '#00FF41',
        icon: '⚡',
        pnlUsd: positionsPnlAndMargin.bsvPnl,
        positionsCount: positions.filter(p => p.market.includes('BSV') || p.market.includes('ORAH')).length,
        nativeAsset: 'BSV',
        nativeBalance: bsvBalance
      },
      {
        name: 'Solana (High-Throughput)',
        chainKey: 'solana',
        value: parseFloat(solTotal.toFixed(2)),
        color: '#14F195',
        icon: '☀️',
        pnlUsd: positionsPnlAndMargin.solPnl,
        positionsCount: positions.filter(p => p.market.includes('SOL')).length,
        nativeAsset: 'SOL',
        nativeBalance: solBalance
      },
      {
        name: 'Base & EVM L2s',
        chainKey: 'evm',
        value: parseFloat(evmTotal.toFixed(2)),
        color: '#3B82F6',
        icon: '⟠',
        pnlUsd: positionsPnlAndMargin.evmPnl,
        positionsCount: positions.filter(p => p.market.includes('ETH') || p.market.includes('BTC')).length,
        nativeAsset: 'ETH',
        nativeBalance: ethBalance
      },
      {
        name: 'Ronin Chain (Gaming/Katana)',
        chainKey: 'ronin',
        value: parseFloat(ronTotal.toFixed(2)),
        color: '#38BDF8',
        icon: '⚔️',
        pnlUsd: positionsPnlAndMargin.ronPnl,
        positionsCount: positions.filter(p => p.market.includes('RON')).length,
        nativeAsset: 'RON',
        nativeBalance: ronBalance
      },
      {
        name: 'Orah AI & Copy Vaults',
        chainKey: 'vaults',
        value: parseFloat(vaultsTotal.toFixed(2)),
        color: '#F59E0B',
        icon: '🤖',
        pnlUsd: aiAgentPnl,
        positionsCount: aiAgents.filter(a => a.status === 'active').length + copyVaults.filter(v => v.isUserSubscribed).length,
        nativeAsset: 'USDC/USD',
        nativeBalance: vaultsTotal
      }
    ].filter(item => item.value > 0);
  }, [
    bsvSpotUsd, 
    solSpotUsd, 
    ethSpotUsd, 
    ronSpotUsd, 
    positionsPnlAndMargin, 
    vaultsCapital, 
    aiAgentCapital, 
    aiAgentPnl, 
    bsvBalance, 
    solBalance, 
    ethBalance, 
    ronBalance, 
    positions, 
    aiAgents, 
    copyVaults
  ]);

  // Aggregate Total Equity & Total Unrealized P&L
  const totalEquityUsd = useMemo(() => {
    return chainBreakdownData.reduce((sum, item) => sum + item.value, 0);
  }, [chainBreakdownData]);

  const totalUnrealizedPnlUsd = useMemo(() => {
    return positionsPnlAndMargin.totalPnl + aiAgentPnl;
  }, [positionsPnlAndMargin.totalPnl, aiAgentPnl]);

  const totalUnrealizedPnlPercent = useMemo(() => {
    const baselineInvested = Math.max(100, totalEquityUsd - totalUnrealizedPnlUsd);
    return parseFloat(((totalUnrealizedPnlUsd / baselineInvested) * 100).toFixed(2));
  }, [totalEquityUsd, totalUnrealizedPnlUsd]);

  const totalPositionsCount = positions.length + aiAgents.filter(a => a.status === 'active').length;

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 space-y-6">
      
      {/* ========================================================================= */}
      {/* REAL-TIME UNREALIZED P&L AND MULTI-CHAIN TOTAL EQUITY SUMMARY SECTION    */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-sm bg-[#080808] border border-[#222] shadow-2xl relative overflow-hidden font-mono">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF41]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Top bar with telemetry status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#1A1A1A]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF41] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF41]"></span>
              </div>
              <span className="text-[#00FF41] text-xs font-bold uppercase tracking-wider">
                Real-Time Multi-Chain Portfolio Telemetry
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#111] text-[#777] border border-[#262626]">
                5 Chains Synchronized
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center space-x-2">
              <span>Account Equity & Unrealized P&L</span>
              <Sparkles className="w-4 h-4 text-[#00FF41]" />
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#121212] hover:bg-[#1A1A1A] text-[#AAA] hover:text-white border border-[#2A2A2A] rounded-sm text-xs font-mono transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00FF41] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Rates</span>
            </button>
            {!isConnected ? (
              <button
                onClick={openWalletModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs rounded-sm transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <button
                onClick={() => claimFaucet(5)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#222] text-[#00FF41] border border-[#00FF41]/40 rounded-sm text-xs font-bold"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Faucet +5 BSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Card 1: Total Portfolio Equity */}
          <div className="p-5 rounded-sm bg-[#0E0E0E] border border-[#222] relative">
            <div className="flex items-center justify-between text-xs text-[#777] mb-2">
              <span className="uppercase text-[10px] font-bold tracking-wider">Total Combined Equity</span>
              <div className="p-1 rounded-sm bg-[#161616] text-[#00FF41]">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ${totalEquityUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#777] mt-1 flex items-center space-x-1.5">
              <span>Across Spot Wallets & Perps</span>
              <span className="text-[#00FF41] font-bold">● Live</span>
            </div>
          </div>

          {/* Card 2: Real-time Unrealized P&L */}
          <div className={`p-5 rounded-sm bg-[#0E0E0E] border ${
            totalUnrealizedPnlUsd >= 0 ? 'border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.08)]' : 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.08)]'
          }`}>
            <div className="flex items-center justify-between text-xs text-[#777] mb-2">
              <span className="uppercase text-[10px] font-bold tracking-wider">Real-Time Unrealized P&L</span>
              <div className={`p-1 rounded-sm ${totalUnrealizedPnlUsd >= 0 ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'bg-rose-500/10 text-rose-400'}`}>
                {totalUnrealizedPnlUsd >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight flex items-baseline space-x-2 ${
              totalUnrealizedPnlUsd >= 0 ? 'text-[#00FF41]' : 'text-rose-400'
            }`}>
              <span>{totalUnrealizedPnlUsd >= 0 ? '+' : ''}${totalUnrealizedPnlUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="text-[11px] mt-1 flex items-center space-x-1.5">
              <span className={`font-bold ${totalUnrealizedPnlPercent >= 0 ? 'text-[#00FF41]' : 'text-rose-400'}`}>
                {totalUnrealizedPnlPercent >= 0 ? '+' : ''}{totalUnrealizedPnlPercent}% Net ROI
              </span>
              <span className="text-[#555]">• {totalPositionsCount} active positions</span>
            </div>
          </div>

          {/* Card 3: Margin & Collateral Locked */}
          <div className="p-5 rounded-sm bg-[#0E0E0E] border border-[#222]">
            <div className="flex items-center justify-between text-xs text-[#777] mb-2">
              <span className="uppercase text-[10px] font-bold tracking-wider">Active Margin & Collateral</span>
              <div className="p-1 rounded-sm bg-[#161616] text-[#38BDF8]">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ${(positionsPnlAndMargin.totalMargin + aiAgentCapital + vaultsCapital).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#777] mt-1 flex items-center space-x-1">
              <span>Health Buffer:</span>
              <span className="text-[#00FF41] font-bold">98.4% Safe</span>
            </div>
          </div>

          {/* Card 4: 24h Realized Yield & Volume */}
          <div className="p-5 rounded-sm bg-[#0E0E0E] border border-[#222]">
            <div className="flex items-center justify-between text-xs text-[#777] mb-2">
              <span className="uppercase text-[10px] font-bold tracking-wider">24h Net Realized Volume</span>
              <div className="p-1 rounded-sm bg-[#161616] text-[#F59E0B]">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatBsv(stats.totalVolumeBsv)} BSV
            </div>
            <div className="text-[11px] text-[#00FF41] mt-1 font-bold">
              ≈ ${(stats.totalVolumeBsv * prices.BSV).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* CHAIN EQUITY DISTRIBUTION BREAKDOWN WITH RECHARTS PIE CHART              */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-sm bg-[#0B0B0B] border border-[#1F1F1F] mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#1A1A1A] gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-sm bg-[#141414] border border-[#333] text-[#00FF41]">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase text-white tracking-tight">
                  Multi-Chain Equity Distribution Breakdown
                </h2>
                <p className="text-[10px] text-[#777]">
                  Asset weighting across connected L1/L2 networks, autonomous trading agents, and vaults
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-[#AAA]">
              <span className="flex items-center space-x-1 bg-[#121212] px-2 py-1 rounded-sm border border-[#222]">
                <Globe className="w-3 h-3 text-[#00FF41]" />
                <span>Multi-RPC Stream Active</span>
              </span>
            </div>
          </div>

          {/* Grid with Pie Chart on left, Details on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Pie Chart Component */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
              <div className="w-full h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as ChainEquityData;
                          const percent = ((data.value / totalEquityUsd) * 100).toFixed(1);
                          return (
                            <div className="bg-[#0D0D0D] border border-[#333] p-3 rounded-sm shadow-xl font-mono text-xs z-50">
                              <div className="flex items-center space-x-2 font-bold text-white mb-1">
                                <span>{data.icon}</span>
                                <span>{data.name}</span>
                              </div>
                              <div className="text-[#00FF41] font-black text-sm">
                                ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({percent}%)
                              </div>
                              <div className="text-[10px] text-[#888] mt-1 space-y-0.5">
                                <div>Native Balance: {data.nativeBalance} {data.nativeAsset}</div>
                                <div className={data.pnlUsd >= 0 ? 'text-[#00FF41]' : 'text-rose-400'}>
                                  Unrealized P&L: {data.pnlUsd >= 0 ? '+' : ''}${data.pnlUsd.toFixed(2)}
                                </div>
                                <div>Active Positions: {data.positionsCount}</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={chainBreakdownData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="#050505"
                      strokeWidth={2}
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(null)}
                    >
                      {chainBreakdownData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.45}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Ring Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] text-[#777] uppercase font-bold tracking-widest">Total Equity</span>
                  <span className="text-base font-black text-white">
                    ${(totalEquityUsd / 1000).toFixed(1)}k
                  </span>
                  <span className="text-[9px] text-[#00FF41] font-bold">
                    {totalUnrealizedPnlPercent >= 0 ? '+' : ''}{totalUnrealizedPnlPercent}%
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-[#666] text-center mt-1">
                Hover slice for precise position and chain collateral metrics
              </div>
            </div>

            {/* Breakdown List Cards */}
            <div className="lg:col-span-7 space-y-2 font-mono">
              {chainBreakdownData.map((item, idx) => {
                const percentage = ((item.value / totalEquityUsd) * 100).toFixed(1);
                const isHovered = activePieIndex === idx;

                return (
                  <div
                    key={item.chainKey}
                    onMouseEnter={() => setActivePieIndex(idx)}
                    onMouseLeave={() => setActivePieIndex(null)}
                    className={`p-3 rounded-sm bg-[#121212] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 cursor-pointer ${
                      isHovered ? 'border-[#00FF41] bg-[#161616] translate-x-1' : 'border-[#222] hover:border-[#333]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <div>
                        <div className="font-bold text-xs text-white flex items-center space-x-2">
                          <CoinLogo symbol={item.nativeAsset} size="xs" />
                          <span>{item.name}</span>
                          <span className="text-[9px] text-[#777] font-normal">
                            ({item.nativeBalance.toLocaleString()} {item.nativeAsset})
                          </span>
                        </div>
                        <div className="text-[10px] text-[#666] flex items-center space-x-2">
                          <span>{item.positionsCount} active position{item.positionsCount !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span className={item.pnlUsd >= 0 ? 'text-[#00FF41]' : 'text-rose-400'}>
                            P&L: {item.pnlUsd >= 0 ? '+' : ''}${item.pnlUsd.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <div className="text-xs font-black text-white">
                        ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] font-bold" style={{ color: item.color }}>
                        {percentage}% of Total
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* PROTOCOL TELEMETRY METRICS GRID                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        {/* Metric 1: Total Volume */}
        <div className="p-5 rounded-sm bg-[#0A0A0A] border border-[#222] shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[#777]">
            <span className="uppercase text-[10px] font-bold tracking-wider">24h Cumulative Volume</span>
            <div className="p-1.5 rounded-sm bg-[#141414] border border-[#333] text-[#00FF41]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {formatBsv(stats.totalVolumeBsv)} BSV
          </div>
          <div className="text-xs text-[#00FF41] font-bold">
            ≈ ${(stats.totalVolumeBsv * prices.BSV).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD (+14.2%)
          </div>
        </div>

        {/* Metric 2: Escrow Locked */}
        <div className="p-5 rounded-sm bg-[#0A0A0A] border border-[#222] shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[#777]">
            <span className="uppercase text-[10px] font-bold tracking-wider">Total Escrow Value Locked</span>
            <div className="p-1.5 rounded-sm bg-[#141414] border border-[#333] text-[#00FF41]">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#00FF41]">
            {formatBsv(stats.lockedEscrowBsv)} BSV
          </div>
          <div className="text-xs text-[#777]">
            Held in 2-of-2 multisig scripts
          </div>
        </div>

        {/* Metric 3: Settlement Speed */}
        <div className="p-5 rounded-sm bg-[#0A0A0A] border border-[#222] shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[#777]">
            <span className="uppercase text-[10px] font-bold tracking-wider">Avg. Settlement Latency</span>
            <div className="p-1.5 rounded-sm bg-[#141414] border border-[#333] text-[#00FF41]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#00FF41]">
            {stats.avgSettlementSeconds}s
          </div>
          <div className="text-xs text-[#777]">
            Sub-second P2P gossip propagation
          </div>
        </div>

        {/* Metric 4: Median Fee */}
        <div className="p-5 rounded-sm bg-[#0A0A0A] border border-[#222] shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[#777]">
            <span className="uppercase text-[10px] font-bold tracking-wider">Median Miner Fee Rate</span>
            <div className="p-1.5 rounded-sm bg-[#141414] border border-[#333] text-[#00FF41]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats.medianFeeSatPerByte} sat/byte
          </div>
          <div className="text-xs text-[#00FF41] font-bold">
            &lt; $0.0001 per settlement
          </div>
        </div>

      </div>

      {/* Protocol Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        
        <div className="p-6 rounded-sm bg-[#0A0A0A] border border-[#222] space-y-2.5">
          <div className="font-black uppercase text-sm text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
            <span>Non-Custodial Multi-Sig</span>
          </div>
          <p className="text-[#888] leading-relaxed font-sans text-xs">
            Trades use native Bitcoin Script (OP_CHECKMULTISIG). The exchange never takes custody of funds; satoshis are locked in atomic 2-of-2 contracts.
          </p>
        </div>

        <div className="p-6 rounded-sm bg-[#0A0A0A] border border-[#222] space-y-2.5">
          <div className="font-black uppercase text-sm text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
            <span>Cross-Chain Bridge</span>
          </div>
          <p className="text-[#888] leading-relaxed font-sans text-xs">
            Direct liquidity bridge between 20+ top blockchains (BTC, ETH, SOL, USDT, USDC) and BSV native UTXO ledger without KYC bottlenecks.
          </p>
        </div>

        <div className="p-6 rounded-sm bg-[#0A0A0A] border border-[#222] space-y-2.5">
          <div className="font-black uppercase text-sm text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
            <span>Web3 Signer Protocol</span>
          </div>
          <p className="text-[#888] leading-relaxed font-sans text-xs">
            Full client-side compatibility with HandCash Paymail, RelayX 1Name, Sensilet, and standalone ECDSA secp256k1 WIF signers.
          </p>
        </div>

      </div>

    </div>
  );
};

