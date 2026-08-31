import React, { useState } from 'react';
import { 
  ArrowRight, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Shield, 
  Zap, 
  Globe, 
  Layers, 
  Bot, 
  Award, 
  Sparkles,
  ChevronRight,
  Activity
} from 'lucide-react';
import { CoinLogo } from './CoinLogo';

interface LiveMarketItem {
  symbol: string;
  name: string;
  icon: string;
  volume: string;
  price: string;
  change24h: number;
  category: 'crypto' | 'gold' | 'defi' | 'ai';
}

const LIVE_MARKETS: LiveMarketItem[] = [
  {
    symbol: 'BSV',
    name: 'Bitcoin SV',
    icon: '⚡',
    volume: '$79.2M vol',
    price: '$48.60',
    change24h: 3.42,
    category: 'crypto'
  },
  {
    symbol: 'ORAH',
    name: 'Tradex Native',
    icon: '⚡',
    volume: '$84.2M vol',
    price: '$1.48',
    change24h: 18.65,
    category: 'defi'
  },
  {
    symbol: 'AURA',
    name: 'Aura AI Intel',
    icon: '🤖',
    volume: '$56.1M vol',
    price: '$4.92',
    change24h: 14.30,
    category: 'ai'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    volume: '$64.1B vol',
    price: '$64,250',
    change24h: 1.85,
    category: 'crypto'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: '⟠',
    volume: '$32.4B vol',
    price: '$2,642.50',
    change24h: 2.10,
    category: 'crypto'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    icon: '◎',
    volume: '$13.6B vol',
    price: '$148.50',
    change24h: 4.60,
    category: 'crypto'
  },
  {
    symbol: 'RON',
    name: 'Ronin Network',
    icon: '⚔️',
    volume: '$44.7M vol',
    price: '$1.85',
    change24h: 4.80,
    category: 'crypto'
  },
  {
    symbol: 'PAXG',
    name: 'PAX Gold',
    icon: '🟡',
    volume: '$2.5B vol',
    price: '$2,510.40',
    change24h: 0.25,
    category: 'gold'
  }
];

interface OrahDexLandingProps {
  onEnterExchange: () => void;
  onSelectPair?: (symbol: string) => void;
  onViewMarkets?: () => void;
}

export const OrahDexLanding: React.FC<OrahDexLandingProps> = ({
  onEnterExchange,
  onSelectPair,
  onViewMarkets
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState<'all' | 'crypto' | 'gold' | 'defi' | 'ai'>('all');

  const filteredMarkets = LIVE_MARKETS.filter(m => {
    const matchesSearch = m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCat === 'all' || m.category === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans flex flex-col items-center justify-start pb-20 selection:bg-[#00FF41] selection:text-black">
      
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#00FF41]/8 via-[#00F0FF]/3 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-12 sm:pt-16 pb-10 flex flex-col items-center text-center">
        
        {/* Sovereign Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-amber-500/50 bg-amber-950/20 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>SOVEREIGN DECENTRALIZED EXCHANGE</span>
        </div>

        {/* Big Display Headline */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.95] text-white uppercase mb-6">
          Trade <br />
          means <br />
          <span className="text-[#00FF41] drop-shadow-[0_0_35px_rgba(0,255,65,0.4)]">DEX.</span>
        </h1>

        {/* Subtitle & Keeper Mantra */}
        <p className="text-base sm:text-lg text-[#AAA] max-w-xl font-normal leading-relaxed mb-6">
          Trade as a <strong className="text-amber-400 font-bold">Keeper</strong>, not a customer. Spot • Futures • P2P • Copy • Predict.
        </p>

        {/* Bullet Creed */}
        <div className="flex flex-col items-center space-y-1.5 text-xs sm:text-sm text-[#777] font-mono mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-[#00FF41]">•</span>
            <span>Identity is the engine.</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[#00FF41]">•</span>
            <span>Execution is a ritual.</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[#00FF41]">•</span>
            <span>Every trade is a declaration.</span>
          </div>
        </div>

        {/* Main CTA Buttons */}
        <div className="w-full max-w-md space-y-3">
          <button
            onClick={onEnterExchange}
            className="w-full py-4 px-6 rounded-md bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(0,255,65,0.35)] active:scale-[0.98] transition-all"
          >
            <span>Enter the Exchange</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={onViewMarkets || onEnterExchange}
            className="w-full py-3.5 px-6 rounded-md bg-[#111111] hover:bg-[#1A1A1A] border border-[#262626] text-[#E0E0E0] font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
          >
            <span>View All Markets</span>
            <span className="px-2 py-0.5 rounded bg-[#00FF41]/20 text-[#00FF41] text-xs font-mono font-black border border-[#00FF41]/30">
              22,357,399
            </span>
          </button>
        </div>

        {/* Global Protocol Stat Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 font-mono text-xs">
          <div className="px-3.5 py-2 rounded-md bg-[#0F0F0F] border border-[#222] flex items-center space-x-2">
            <span className="text-[#00FF41] font-black">22,357,399</span>
            <span className="text-[#666] text-[10px] uppercase">MARKETS</span>
          </div>

          <div className="px-3.5 py-2 rounded-md bg-[#0F0F0F] border border-[#222] flex items-center space-x-2">
            <span className="text-amber-400 font-black">20+</span>
            <span className="text-[#666] text-[10px] uppercase">CHAINS</span>
          </div>

          <div className="px-3.5 py-2 rounded-md bg-[#0F0F0F] border border-[#222] flex items-center space-x-2">
            <span className="text-cyan-400 font-black">BSV</span>
            <span className="text-[#666] text-[10px] uppercase">SETTLEMENT</span>
          </div>

          <a 
            href="https://whatsonchain.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-md bg-[#0F0F0F] hover:bg-[#161616] border border-[#222] text-[#00FF41] font-black flex items-center space-x-1.5 transition-colors"
          >
            <span>#964,682</span>
            <span className="text-[#777] text-[10px] uppercase">BSV</span>
            <ExternalLink className="w-3 h-3 text-[#555]" />
          </a>
        </div>

      </div>

      {/* Live Markets Card Widget (Exact Match to screenshot) */}
      <div className="w-full max-w-xl mx-auto px-4 mt-2">
        <div className="rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Header Bar */}
          <div className="px-4 py-3.5 border-b border-[#1A1A1A] flex items-center justify-between bg-[#0D0D0D]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41]"></span>
              <span className="text-xs font-mono font-bold text-[#888] uppercase tracking-wider ml-1">LIVE MARKETS</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#00FF41]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
              <span className="font-bold uppercase tracking-wider">ONLINE</span>
            </div>
          </div>

          {/* Table Column Headers */}
          <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-mono uppercase text-[#666] border-b border-[#141414] bg-[#080808]">
            <div className="col-span-6">PAIR</div>
            <div className="col-span-3 text-right">PRICE</div>
            <div className="col-span-3 text-right">24H</div>
          </div>

          {/* Market Rows */}
          <div className="divide-y divide-[#141414]">
            {filteredMarkets.map((market, idx) => {
              const isPositive = market.change24h >= 0;
              return (
                <div
                  key={`landing_mkt_${market.symbol}_${idx}`}
                  onClick={() => {
                    if (onSelectPair) onSelectPair(`${market.symbol}/USDT`);
                    onEnterExchange();
                  }}
                  className="grid grid-cols-12 items-center px-4 py-3 hover:bg-[#121212] transition-colors cursor-pointer group select-none"
                >
                  {/* Pair Info */}
                  <div className="col-span-6 flex items-center space-x-3">
                    <CoinLogo symbol={market.symbol} name={market.name} icon={market.icon} size="md" />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-sm text-white group-hover:text-[#00FF41] transition-colors">
                          {market.symbol}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#666]">
                        {market.volume}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-3 text-right">
                    <span className="font-mono font-bold text-sm text-white">
                      {market.price}
                    </span>
                  </div>

                  {/* 24h Change */}
                  <div className="col-span-3 text-right">
                    <span
                      className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        isPositive
                          ? 'text-[#00FF41] bg-[#00FF41]/10'
                          : 'text-red-500 bg-red-500/10'
                      }`}
                    >
                      {isPositive ? `+${market.change24h.toFixed(2)}%` : `${market.change24h.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer of card */}
          <div className="px-4 py-3 bg-[#080808] border-t border-[#141414] flex items-center justify-between text-xs font-mono text-[#666]">
            <span>Showing top liquid pairs</span>
            <button
              onClick={onEnterExchange}
              className="text-[#00FF41] hover:underline font-bold flex items-center space-x-1"
            >
              <span>Explore All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
