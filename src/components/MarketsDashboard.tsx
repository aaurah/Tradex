import React, { useState } from 'react';
import { 
  Coins, 
  BarChart2, 
  PieChart as PieChartIcon, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Sparkles,
  Layers,
  Search
} from 'lucide-react';
import { Coin } from '../types/dex';
import { TradePair, tradeMarketsService } from '../services/tradeMarketsService';
import { AllCoinsDirectory } from './AllCoinsDirectory';
import { MarketsDirectory22M } from './MarketsDirectory22M';
import { StatsBanner } from './StatsBanner';

interface MarketsDashboardProps {
  onSelectCoinForSwap?: (coin: Coin) => void;
  onSelectPairForTrade?: (pairSymbol: string) => void;
  defaultSubTab?: 'coins' | 'pairs' | 'telemetry';
}

export const MarketsDashboard: React.FC<MarketsDashboardProps> = ({
  onSelectCoinForSwap,
  onSelectPairForTrade,
  defaultSubTab = 'coins'
}) => {
  const [subTab, setSubTab] = useState<'coins' | 'pairs' | 'telemetry'>(defaultSubTab);

  // Favorites state for pairs
  const [pairFavorites, setPairFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tradex_favorite_pairs');
      return saved ? JSON.parse(saved) : ['BSV/USDT', 'ORAH/USDT', 'AURA/USDT', 'SOL/USDT', 'BTC/USDT'];
    } catch {
      return ['BSV/USDT', 'ORAH/USDT', 'AURA/USDT', 'SOL/USDT', 'BTC/USDT'];
    }
  });

  const togglePairFavorite = (symbol: string) => {
    setPairFavorites(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      try {
        localStorage.setItem('tradex_favorite_pairs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] p-3 sm:p-6 lg:p-8 font-sans max-w-7xl mx-auto space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. PAGE TITLE & SUB-NAV TABS                                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-5">
        
        {/* Title */}
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>Crypto Markets & Coins</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161616] text-[#00FF41] border border-[#262626]">
                  5,000+ Assets
                </span>
              </h1>
              <p className="text-xs text-[#888] font-mono mt-0.5">
                Live multi-chain cryptocurrency prices, 24h market metrics, and non-custodial cross-chain pairs across 218 blockchains.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Switcher Pills */}
        <div className="flex items-center bg-[#0D0D0D] p-1 rounded-xl border border-[#222] font-mono text-xs self-start md:self-auto">
          
          <button
            onClick={() => setSubTab('coins')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'coins'
                ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.25)]'
                : 'text-[#888] hover:text-white hover:bg-[#181818]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>All Coins List</span>
          </button>

          <button
            onClick={() => setSubTab('pairs')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'pairs'
                ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.25)]'
                : 'text-[#888] hover:text-white hover:bg-[#181818]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>25M+ Trading Pairs</span>
          </button>

          <button
            onClick={() => setSubTab('telemetry')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'telemetry'
                ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.25)]'
                : 'text-[#888] hover:text-white hover:bg-[#181818]'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Protocol Equity</span>
          </button>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE VIEW CONTAINER                                                  */}
      {/* ========================================================================= */}
      {subTab === 'coins' && (
        <AllCoinsDirectory
          onSelectCoinForSwap={onSelectCoinForSwap}
          onSelectPairForTrade={onSelectPairForTrade}
        />
      )}

      {subTab === 'pairs' && (
        <div className="rounded-xl bg-[#090909] border border-[#1E1E1E] p-4 sm:p-5">
          <MarketsDirectory22M
            onSelectPair={(pair) => onSelectPairForTrade && onSelectPairForTrade(pair.symbol)}
            favorites={pairFavorites}
            onToggleFavorite={togglePairFavorite}
          />
        </div>
      )}

      {subTab === 'telemetry' && (
        <StatsBanner />
      )}

    </div>
  );
};
