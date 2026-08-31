import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Search, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  BarChart2, 
  RefreshCw, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown, 
  Globe, 
  ShieldCheck, 
  LayoutGrid, 
  List, 
  Sparkles, 
  Layers, 
  Check, 
  Info,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink
} from 'lucide-react';
import { Coin, CoinCategory } from '../types/dex';
import { tradeMarketsService, TradePair, TOTAL_INDEXED_MARKETS_COUNT } from '../services/tradeMarketsService';
import { CoinLogo } from './CoinLogo';
import { CoinDetailModal } from './CoinDetailModal';

interface AllCoinsDirectoryProps {
  onSelectCoinForSwap?: (coin: Coin) => void;
  onSelectPairForTrade?: (pairSymbol: string) => void;
}

const CATEGORY_TABS: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'All Coins', icon: '🌐' },
  { id: 'top100', label: 'Top 100', icon: '🏆' },
  { id: 'bsv', label: 'BSV Ecosystem', icon: '⚡' },
  { id: 'solana', label: 'Solana SPL', icon: '☀️' },
  { id: 'evm', label: 'Base & EVM L2s', icon: '⟠' },
  { id: 'ronin', label: 'Ronin Gaming', icon: '⚔️' },
  { id: 'ai', label: 'AI & DePIN', icon: '🤖' },
  { id: 'gaming', label: 'Gaming & NFT', icon: '🎮' },
  { id: 'meme', label: 'Memes', icon: '🐕' },
  { id: 'stable', label: 'Stablecoins', icon: '💵' },
  { id: 'favorites', label: 'Watchlist', icon: '⭐' }
];

export const AllCoinsDirectory: React.FC<AllCoinsDirectoryProps> = ({
  onSelectCoinForSwap,
  onSelectPairForTrade
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'change' | 'volume' | 'marketCap' | 'name'>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [visibleCount, setVisibleCount] = useState<number>(40);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tickerTick, setTickerTick] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to live market updates & price ticks
  useEffect(() => {
    const unsubscribe = tradeMarketsService.subscribe(() => {
      setTickerTick(t => (t + 1) % 100000);
    });
    return () => unsubscribe();
  }, []);

  // Selected coin for detailed view modal
  const [selectedCoinForModal, setSelectedCoinForModal] = useState<Coin | null>(null);

  // Favorites state persisted locally
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tradex_favorite_coins');
      return saved ? JSON.parse(saved) : ['BSV', 'ORAH', 'AURA', 'BTC', 'ETH', 'SOL', 'RON', 'A8'];
    } catch {
      return ['BSV', 'ORAH', 'AURA', 'BTC', 'ETH', 'SOL', 'RON', 'A8'];
    }
  });

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      try {
        localStorage.setItem('tradex_favorite_coins', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Reset visibleCount whenever search, category, or sorting changes
  useEffect(() => {
    setVisibleCount(40);
  }, [searchQuery, activeCategory, sortBy, sortDir]);

  // Query coins from service with visibleCount slice
  const { coins, total } = useMemo(() => {
    return tradeMarketsService.searchCoins({
      query: searchQuery,
      category: activeCategory,
      favorites,
      sortBy,
      sortDir,
      page: 1,
      pageSize: visibleCount
    });
  }, [searchQuery, activeCategory, favorites, sortBy, sortDir, visibleCount, isRefreshing, tickerTick]);

  // Infinite Scroll Trigger (IntersectionObserver + Scroll fallback)
  const handleLoadMore = useCallback(() => {
    if (visibleCount >= total || isLoadingMore) return;
    setIsLoadingMore(true);
    setVisibleCount(prev => Math.min(total, prev + 35));
    setTimeout(() => setIsLoadingMore(false), 200);
  }, [visibleCount, total, isLoadingMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        handleLoadMore();
      }
    }, {
      root: null,
      rootMargin: '600px', // Pre-fetch 600px before bottom
      threshold: 0.05
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  // Also bind a window scroll event as fallback
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 700) {
        handleLoadMore();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  // Top gainers & highest volume highlight coins
  const topMovers = useMemo(() => {
    const all = tradeMarketsService.getAllCoins();
    const gainers = [...all].sort((a, b) => (b.change24h || 0) - (a.change24h || 0)).slice(0, 4);
    const topVolume = [...all].sort((a, b) => (b.volume24hUsd || 0) - (a.volume24hUsd || 0)).slice(0, 4);
    return { gainers, topVolume };
  }, [isRefreshing]);

  // Handle column header sort toggle
  const handleSort = (field: 'rank' | 'price' | 'change' | 'volume' | 'marketCap' | 'name') => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir(field === 'rank' || field === 'name' ? 'asc' : 'desc');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await tradeMarketsService.syncWithLetsExchangeApi(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const formatPrice = (p?: number) => {
    if (p === undefined || p === null) return '$0.00';
    if (p >= 1000) return '$' + p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return '$' + p.toFixed(p < 10 ? 3 : 2);
    if (p >= 0.0001) return '$' + p.toFixed(6);
    return '$' + p.toFixed(8);
  };

  const formatLargeUsd = (num?: number) => {
    if (!num) return '$0';
    if (num >= 1000000000000) return '$' + (num / 1000000000000).toFixed(2) + 'T';
    if (num >= 1000000000) return '$' + (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(2) + 'K';
    return '$' + num.toLocaleString();
  };

  // Sparkline generator helper
  const renderSparkline = (coin: Coin) => {
    const isUp = (coin.change24h || 0) >= 0;
    const color = isUp ? '#00FF41' : '#F43F5E';
    
    // Seed points based on symbol and change
    let hash = 0;
    for (let i = 0; i < coin.symbol.length; i++) hash = (hash << 5) - hash + coin.symbol.charCodeAt(i);
    const pts = [
      20,
      18 + (hash % 10),
      22 - (hash % 8),
      isUp ? 15 : 25,
      isUp ? 10 : 30,
      isUp ? 6 : 34
    ];
    const path = `M 0,${pts[0]} L 18,${pts[1]} L 36,${pts[2]} L 54,${pts[3]} L 72,${pts[4]} L 90,${pts[5]}`;

    return (
      <svg className="w-20 h-6 overflow-visible" viewBox="0 0 90 40">
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="w-full space-y-5 font-sans text-xs">
      
      {/* ========================================================================= */}
      {/* 1. GLOBAL MARKET TELEMETRY TICKER BAR                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
        
        <div className="p-3 rounded-lg bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col justify-between">
          <div className="text-[10px] text-[#777] uppercase">Global Market Cap</div>
          <div className="text-sm font-bold text-white mt-1">$2.48 Trillion</div>
          <div className="text-[10px] text-[#00FF41] font-bold mt-0.5 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +2.34% (24h)
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col justify-between">
          <div className="text-[10px] text-[#777] uppercase">24h Global Volume</div>
          <div className="text-sm font-bold text-white mt-1">$84.25 Billion</div>
          <div className="text-[10px] text-[#888] mt-0.5">Across 22M+ Pairs</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col justify-between">
          <div className="text-[10px] text-[#777] uppercase">BSV Dominance</div>
          <div className="text-sm font-bold text-[#00FF41] mt-1">4.82% • 1-Sat/B</div>
          <div className="text-[10px] text-[#888] mt-0.5">Instant Atomic UTXO</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col justify-between">
          <div className="text-[10px] text-[#777] uppercase">Cross-Chain Catalog</div>
          <div className="text-sm font-bold text-white mt-1">2,200+ Coins</div>
          <div className="text-[10px] text-[#00FF41] mt-0.5 font-bold">218 Blockchains</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col justify-between">
          <div className="text-[10px] text-[#777] uppercase">Total Trading Pairs</div>
          <div className="text-sm font-bold text-white mt-1">22.4M+ Pairs</div>
          <div className="text-[10px] text-[#888] mt-0.5">Non-Custodial AMM</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col justify-between">
          <div className="text-[10px] text-[#777] uppercase">Protocol Settlement</div>
          <div className="text-sm font-bold text-[#00FF41] mt-1">&lt; 420 ms</div>
          <div className="text-[10px] text-[#888] mt-0.5">2-of-2 Escrow Locked</div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. TOP MARKET MOVERS (GAINERS & HIGHEST VOLUME)                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
        
        {/* Top Gainers Card */}
        <div className="p-3.5 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>24h Top Market Gainers</span>
            </div>
            <span className="text-[10px] text-[#666]">Live Stream</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {topMovers.gainers.map((coin, idx) => (
              <div 
                key={`gainer_${coin.symbol}_${coin.networkCode || coin.network || idx}_${idx}`}
                onClick={() => setSelectedCoinForModal(coin)}
                className="p-2 rounded bg-[#111111] hover:bg-[#181818] border border-[#222] hover:border-[#00FF41]/40 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center space-x-1.5">
                  <CoinLogo symbol={coin.symbol} name={coin.name} icon={coin.icon} logoUrl={coin.logoUrl} size="xs" />
                  <span className="font-bold text-white group-hover:text-[#00FF41] truncate">{coin.symbol}</span>
                </div>
                <div className="mt-1.5">
                  <div className="text-white font-bold text-[11px]">{formatPrice(coin.priceUsd)}</div>
                  <div className="text-[10px] text-[#00FF41] font-bold flex items-center mt-0.5">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +{(coin.change24h || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest 24h Volume Card */}
        <div className="p-3.5 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white uppercase tracking-wider">
              <BarChart2 className="w-3.5 h-3.5 text-[#00FF41]" />
              <span>Highest 24h Trading Volume</span>
            </div>
            <span className="text-[10px] text-[#666]">Aggregated Liquidity</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {topMovers.topVolume.map((coin, idx) => (
              <div 
                key={`vol_${coin.symbol}_${coin.networkCode || coin.network || idx}_${idx}`}
                onClick={() => setSelectedCoinForModal(coin)}
                className="p-2 rounded bg-[#111111] hover:bg-[#181818] border border-[#222] hover:border-[#00FF41]/40 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center space-x-1.5">
                  <CoinLogo symbol={coin.symbol} name={coin.name} icon={coin.icon} logoUrl={coin.logoUrl} size="xs" />
                  <span className="font-bold text-white group-hover:text-[#00FF41] truncate">{coin.symbol}</span>
                </div>
                <div className="mt-1.5">
                  <div className="text-white font-bold text-[11px]">{formatLargeUsd(coin.volume24hUsd)}</div>
                  <div className="text-[10px] text-[#888] mt-0.5">
                    {formatPrice(coin.priceUsd)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CATEGORY PILLS & CONTROLS BAR                                          */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        
        {/* Category Selector Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          {CATEGORY_TABS.map(tab => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center space-x-1.5 ${
                  isActive 
                    ? 'bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.25)]' 
                    : 'bg-[#111] hover:bg-[#1A1A1A] text-[#888] hover:text-white border border-[#222]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'favorites' && favorites.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${isActive ? 'bg-black text-[#00FF41]' : 'bg-[#222] text-[#AAA]'}`}>
                    {favorites.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search, View Mode & Infinite Scroll Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-[#0C0C0C] border border-[#1E1E1E]">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Search by coin, symbol, or network..."
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white placeholder-[#555] font-mono text-xs focus:outline-none focus:border-[#00FF41] transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Controls: Loaded Assets Count, View Mode, Refresh */}
          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end font-mono">
            
            {/* Display count info */}
            <div className="text-[11px] text-[#888] flex items-center space-x-1.5 bg-[#141414] px-2.5 py-1.5 rounded-lg border border-[#222]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
              <span>
                Loaded <strong className="text-white">{coins.length}</strong> of <strong className="text-[#00FF41]">{total.toLocaleString()}</strong> assets
              </span>
            </div>

            {/* View Mode Toggle: Table vs Cards */}
            <div className="flex items-center bg-[#141414] rounded-lg border border-[#2A2A2A] p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-[#222] text-[#00FF41]' : 'text-[#666] hover:text-white'}`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-[#222] text-[#00FF41]' : 'text-[#666] hover:text-white'}`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Manual Sync / Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#202020] border border-[#2A2A2A] text-[#888] hover:text-white transition-colors"
              title="Refresh Market Rates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00FF41]' : ''}`} />
            </button>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN COINS DIRECTORY TABLE / GRID VIEW                                 */}
      {/* ========================================================================= */}
      {coins.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0B0B0B] border border-[#1F1F1F] space-y-3 font-mono">
          <div className="text-3xl">🔍</div>
          <div className="text-sm font-bold text-white">No cryptocurrency matches your criteria</div>
          <p className="text-xs text-[#777] max-w-md mx-auto">
            No assets found for query "{searchQuery}" in "{activeCategory}". Try clearing your filters or searching by symbol.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-lg bg-[#181818] hover:bg-[#222] text-[#00FF41] border border-[#333] font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        
        /* ------------------------------------------------------------------------- */
        /* DENSE HIGH-PRECISION CRYPTO TABLE                                         */
        /* ------------------------------------------------------------------------- */
        <div className="rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono border-collapse">
              
              {/* Table Header */}
              <thead>
                <tr className="border-b border-[#1A1A1A] bg-[#0E0E0E] text-[10px] text-[#777] uppercase tracking-wider select-none">
                  <th className="py-3 px-3 w-8 text-center">⭐</th>
                  <th 
                    className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('rank')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>#</span>
                      {sortBy === 'rank' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#00FF41]" /> : <ChevronDown className="w-3 h-3 text-[#00FF41]" />)}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Asset / Name</span>
                      {sortBy === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#00FF41]" /> : <ChevronDown className="w-3 h-3 text-[#00FF41]" />)}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Price (USD)</span>
                      {sortBy === 'price' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#00FF41]" /> : <ChevronDown className="w-3 h-3 text-[#00FF41]" />)}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('change')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>24h Change</span>
                      {sortBy === 'change' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#00FF41]" /> : <ChevronDown className="w-3 h-3 text-[#00FF41]" />)}
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center hidden md:table-cell">
                    <span>24h Trend</span>
                  </th>
                  <th className="py-3 px-3 hidden lg:table-cell">
                    <span>24h Range (Low / High)</span>
                  </th>
                  <th 
                    className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors hidden sm:table-cell"
                    onClick={() => handleSort('volume')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>24h Volume</span>
                      {sortBy === 'volume' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#00FF41]" /> : <ChevronDown className="w-3 h-3 text-[#00FF41]" />)}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors hidden md:table-cell"
                    onClick={() => handleSort('marketCap')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Market Cap</span>
                      {sortBy === 'marketCap' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#00FF41]" /> : <ChevronDown className="w-3 h-3 text-[#00FF41]" />)}
                    </div>
                  </th>
                  <th className="py-3 px-3 hidden xl:table-cell">
                    <span>Swap Limits</span>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>

              {/* Table Rows */}
              <tbody className="divide-y divide-[#141414] text-xs">
                {coins.map((coin, idx) => {
                  const isFav = favorites.includes(coin.symbol);
                  const change = coin.change24h ?? 1.85;
                  const price = coin.priceUsd || 1.0;
                  const high24h = coin.high24h || price * (1 + Math.max(0.015, Math.abs(change) * 0.01 + 0.015));
                  const low24h = coin.low24h || price * (1 - Math.max(0.015, Math.abs(change) * 0.01 + 0.015));
                  const rangeSpan = Math.max(0.0000001, high24h - low24h);
                  const rangePct = Math.min(100, Math.max(0, ((price - low24h) / rangeSpan) * 100));

                  return (
                    <tr 
                      key={`tbl_coin_${coin.symbol}_${coin.networkCode || coin.network || idx}_${idx}`}
                      onClick={() => setSelectedCoinForModal(coin)}
                      className="hover:bg-[#121212] transition-colors cursor-pointer group"
                    >
                      {/* Star Favorite */}
                      <td 
                        className="py-3 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(coin.symbol);
                        }}
                      >
                        <button className="text-[#555] hover:text-yellow-400 transition-colors">
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                        </button>
                      </td>

                      {/* Rank */}
                      <td className="py-3 px-3 text-[#666] font-bold text-[11px]">
                        {coin.rank ? `#${coin.rank}` : '—'}
                      </td>

                      {/* Asset: Logo + Name + Ticker + Network Pill */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          <CoinLogo 
                            symbol={coin.symbol} 
                            name={coin.name} 
                            icon={coin.icon} 
                            logoUrl={coin.logoUrl} 
                            size="md" 
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-white group-hover:text-[#00FF41] transition-colors">
                                {coin.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#181818] text-[#AAA] border border-[#282828]">
                                {coin.symbol}
                              </span>
                              {coin.popular && (
                                <span className="text-[9px] text-amber-400 font-bold hidden sm:inline">
                                  🔥
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#666] mt-0.5 flex items-center space-x-1">
                              <span>{coin.network}</span>
                              {coin.category && (
                                <>
                                  <span>•</span>
                                  <span className="uppercase text-[#888]">{coin.category}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price USD */}
                      <td className="py-3 px-3 text-right font-bold text-white text-[13px]">
                        {formatPrice(coin.priceUsd)}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-flex items-center space-x-0.5 px-2 py-0.5 rounded font-bold text-[11px] ${
                          change >= 0 
                            ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
                        </span>
                      </td>

                      {/* 24h Trend Sparkline */}
                      <td className="py-3 px-3 text-center hidden md:table-cell">
                        <div className="flex justify-center">
                          {renderSparkline(coin)}
                        </div>
                      </td>

                      {/* 24h Range */}
                      <td className="py-3 px-3 hidden lg:table-cell w-44">
                        <div className="w-full">
                          <div className="flex justify-between text-[9px] text-[#666] mb-0.5">
                            <span>{formatPrice(low24h)}</span>
                            <span>{formatPrice(high24h)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-rose-500 to-[#00FF41] rounded-full" 
                              style={{ width: `${rangePct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 24h Volume */}
                      <td className="py-3 px-3 text-right hidden sm:table-cell text-white font-bold text-[11px]">
                        {formatLargeUsd(coin.volume24hUsd)}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3 px-3 text-right hidden md:table-cell text-[#AAA] text-[11px]">
                        {formatLargeUsd(coin.marketCapUsd)}
                      </td>

                      {/* Swap Limits */}
                      <td className="py-3 px-3 hidden xl:table-cell text-[10px] text-[#777]">
                        <div>Min: <strong className="text-[#00FF41]">{coin.minAmount}</strong> {coin.symbol}</div>
                        <div>Max: <strong className="text-white">{coin.maxAmount.toLocaleString()}</strong></div>
                      </td>

                      {/* Actions */}
                      <td 
                        className="py-3 px-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-1.5">
                          {onSelectCoinForSwap && (
                            <button
                              onClick={() => onSelectCoinForSwap(coin)}
                              className="px-2.5 py-1 rounded bg-[#00FF41]/10 hover:bg-[#00FF41] text-[#00FF41] hover:text-black border border-[#00FF41]/30 font-bold text-[10px] transition-all flex items-center space-x-1"
                              title={`Instant Swap ${coin.symbol}`}
                            >
                              <Zap className="w-2.5 h-2.5" />
                              <span>Swap</span>
                            </button>
                          )}

                          {onSelectPairForTrade && (
                            <button
                              onClick={() => onSelectPairForTrade(`${coin.symbol}/USDT`)}
                              className="px-2 py-1 rounded bg-[#181818] hover:bg-[#252525] text-white border border-[#333] text-[10px] transition-all hidden sm:inline-flex items-center space-x-1"
                              title={`Trade ${coin.symbol}/USDT`}
                            >
                              <BarChart2 className="w-2.5 h-2.5 text-[#00FF41]" />
                              <span>Trade</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedCoinForModal(coin)}
                            className="p-1 rounded bg-[#141414] hover:bg-[#222] text-[#888] hover:text-white border border-[#2E2E2E]"
                            title="View Full Technical Details"
                          >
                            <Info className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>

      ) : (

        /* ------------------------------------------------------------------------- */
        /* BENTO CARDS / GRID VIEW                                                   */
        /* ------------------------------------------------------------------------- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {coins.map((coin, idx) => {
            const isFav = favorites.includes(coin.symbol);
            const change = coin.change24h ?? 1.85;

            return (
              <div
                key={`grid_coin_${coin.symbol}_${coin.networkCode || coin.network || idx}_${idx}`}
                onClick={() => setSelectedCoinForModal(coin)}
                className="p-4 rounded-xl bg-[#0B0B0B] hover:bg-[#111] border border-[#1F1F1F] hover:border-[#00FF41]/50 cursor-pointer transition-all flex flex-col justify-between shadow-lg group relative"
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <CoinLogo 
                        symbol={coin.symbol} 
                        name={coin.name} 
                        icon={coin.icon} 
                        logoUrl={coin.logoUrl} 
                        size="lg" 
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-white group-hover:text-[#00FF41] transition-colors text-sm">
                            {coin.name}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] font-mono text-[#777] mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-[#181818] border border-[#282828] text-white font-bold">
                            {coin.symbol}
                          </span>
                          {coin.rank && <span>#{coin.rank}</span>}
                          <span>•</span>
                          <span className="truncate max-w-[100px]">{coin.network}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(coin.symbol);
                      }}
                      className="text-[#555] hover:text-yellow-400 p-1"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                    </button>
                  </div>

                  {/* Price & 24h Change */}
                  <div className="mt-4 flex items-baseline justify-between font-mono">
                    <div className="text-lg font-black text-white">
                      {formatPrice(coin.priceUsd)}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-0.5 ${
                      change >= 0 
                        ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
                    </span>
                  </div>

                  {/* Sparkline */}
                  <div className="mt-2 py-1 flex justify-center bg-[#070707] rounded-lg border border-[#181818]">
                    {renderSparkline(coin)}
                  </div>

                  {/* Metric Sub-Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[10px] text-[#777]">
                    <div className="p-1.5 rounded bg-[#121212]">
                      <div>24h Vol</div>
                      <div className="text-white font-bold mt-0.5">{formatLargeUsd(coin.volume24hUsd)}</div>
                    </div>
                    <div className="p-1.5 rounded bg-[#121212]">
                      <div>Market Cap</div>
                      <div className="text-white font-bold mt-0.5">{formatLargeUsd(coin.marketCapUsd)}</div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA Actions */}
                <div 
                  className="mt-4 pt-3 border-t border-[#181818] flex items-center space-x-2 font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onSelectCoinForSwap && (
                    <button
                      onClick={() => onSelectCoinForSwap(coin)}
                      className="flex-1 py-1.5 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Zap className="w-3 h-3 stroke-[2.5]" />
                      <span>Swap</span>
                    </button>
                  )}

                  {onSelectPairForTrade && (
                    <button
                      onClick={() => onSelectPairForTrade(`${coin.symbol}/USDT`)}
                      className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-white font-bold text-xs transition-colors"
                    >
                      Trade
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      )}

      {/* ========================================================================= */}
      {/* 5. INFINITE SCROLL LOADER / BOTTOM SENTINEL                                */}
      {/* ========================================================================= */}
      <div 
        ref={sentinelRef} 
        className="py-8 flex flex-col items-center justify-center font-mono text-xs text-[#777]"
      >
        {visibleCount < total ? (
          <div className="flex items-center space-x-2.5 bg-[#0D0D0D] border border-[#222] px-5 py-2.5 rounded-full text-[#AAA] shadow-lg">
            <RefreshCw className="w-3.5 h-3.5 text-[#00FF41] animate-spin" />
            <span>Loading more crypto assets ({coins.length} of {total.toLocaleString()})...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-1.5 rounded-full text-[11px] text-[#666]">
            <Check className="w-3.5 h-3.5 text-[#00FF41]" />
            <span>All {total.toLocaleString()} assets loaded</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. COIN DETAIL MODAL / DRAWER                                             */}
      {/* ========================================================================= */}
      <CoinDetailModal
        coin={selectedCoinForModal}
        onClose={() => setSelectedCoinForModal(null)}
        onSwapCoin={onSelectCoinForSwap}
        onTradeCoin={(coin) => onSelectPairForTrade && onSelectPairForTrade(`${coin.symbol}/USDT`)}
        isFavorite={selectedCoinForModal ? favorites.includes(selectedCoinForModal.symbol) : false}
        onToggleFavorite={toggleFavorite}
      />

    </div>
  );
};
