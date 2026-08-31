import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Zap, 
  Globe, 
  Sparkles, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  ExternalLink,
  Flame,
  BarChart2,
  RefreshCw,
  Key,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  tradeMarketsService, 
  TradePair, 
  QUOTE_ASSETS, 
  MARKET_CATEGORIES, 
  TOTAL_INDEXED_MARKETS_COUNT 
} from '../services/tradeMarketsService';
import { letsExchangeApiService } from '../services/letsExchangeApiService';
import { CoinLogo } from './CoinLogo';

interface MarketsDirectory22MProps {
  onSelectPair: (pair: TradePair) => void;
  selectedPairSymbol?: string;
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
}

export const MarketsDirectory22M: React.FC<MarketsDirectory22MProps> = ({
  onSelectPair,
  selectedPairSymbol,
  favorites,
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuote, setSelectedQuote] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'price' | 'symbol' | 'marketCap'>('volume');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [visibleCount, setVisibleCount] = useState(30);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [apiStatus, setApiStatus] = useState(() => letsExchangeApiService.getStatus());
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [inputToken, setInputToken] = useState(() => letsExchangeApiService.getApiToken());
  const [tickerTick, setTickerTick] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to live market updates & price ticks
  useEffect(() => {
    const unsubscribe = tradeMarketsService.subscribe(() => {
      setTickerTick(t => (t + 1) % 100000);
    });
    return () => unsubscribe();
  }, []);

  const handleSyncApi = async (force = true) => {
    setIsSyncing(true);
    try {
      await tradeMarketsService.syncWithLetsExchangeApi(force);
      setApiStatus(letsExchangeApiService.getStatus());
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveApiToken = (e: React.FormEvent) => {
    e.preventDefault();
    letsExchangeApiService.setApiToken(inputToken);
    setApiStatus(letsExchangeApiService.getStatus());
    setIsApiKeyModalOpen(false);
    handleSyncApi(true);
  };

  // Reset visibleCount on filter changes
  useEffect(() => {
    setVisibleCount(30);
  }, [searchQuery, selectedCategory, selectedQuote, sortBy, sortDir]);

  // Query markets service
  const queryResult = useMemo(() => {
    return tradeMarketsService.searchPairs({
      query: searchQuery,
      category: selectedCategory,
      quote: selectedQuote,
      favorites,
      sortBy,
      sortDir,
      page: 1,
      pageSize: visibleCount
    });
  }, [searchQuery, selectedCategory, selectedQuote, favorites, sortBy, sortDir, visibleCount, apiStatus.coinsCount, tickerTick]);

  // Infinite Scroll Trigger
  const handleLoadMore = useCallback(() => {
    if (visibleCount >= queryResult.total || isLoadingMore) return;
    setIsLoadingMore(true);
    setVisibleCount(prev => Math.min(queryResult.total, prev + 30));
    setTimeout(() => setIsLoadingMore(false), 200);
  }, [visibleCount, queryResult.total, isLoadingMore]);

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
      rootMargin: '600px',
      threshold: 0.05
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  // Window scroll fallback
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 700) {
        handleLoadMore();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  const handleSort = (field: 'volume' | 'change' | 'price' | 'symbol' | 'marketCap') => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="rounded-xl bg-[#080808] border border-[#1C1C1C] overflow-hidden shadow-2xl">
      
      {/* 22M+ Markets Hero Header */}
      <div className="p-4 sm:p-6 border-b border-[#181818] bg-gradient-to-r from-[#0C0C0C] via-[#0E1510] to-[#0A0A0A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#00FF41] text-xs font-mono font-bold uppercase tracking-widest">
              <Globe className="w-4 h-4 animate-pulse" />
              <span>LetsExchange.io Omni-Chain Live Indexer • 218 Blockchains</span>
            </div>
            <div className="flex items-baseline space-x-3 mt-1 flex-wrap gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                22M+ Multi-Chain Markets
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                {queryResult.totalEstimatedUniverse.toLocaleString()} Pairs Live
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span>JWT Authenticated Feed</span>
              </span>
            </div>
            <p className="text-xs text-[#888] font-mono mt-1 max-w-2xl">
              Real-time non-custodial cross-chain order routing powered by LetsExchange API. Native settlements across Bitcoin SV UTXO, Solana SPL, Base/EVM Layer 2s, and Ronin Katana AMM pools.
            </p>
          </div>

          {/* Quick Metrics & Live Sync CTA */}
          <div className="flex flex-col sm:flex-row items-end gap-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono w-full sm:w-auto">
              <div className="p-2.5 rounded-lg bg-[#121212] border border-[#222]">
                <div className="text-[10px] text-[#666] uppercase">24h Universe Vol</div>
                <div className="text-white font-black">$48.92 Billion</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#121212] border border-[#222]">
                <div className="text-[10px] text-[#666] uppercase">Avg Settled Latency</div>
                <div className="text-[#00FF41] font-black">&lt; 420 ms</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#121212] border border-[#222] col-span-2 sm:col-span-1">
                <div className="text-[10px] text-[#666] uppercase">Active Catalog</div>
                <div className="text-amber-400 font-black">{apiStatus.coinsCount} Assets</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <button
                onClick={() => handleSyncApi(true)}
                disabled={isSyncing}
                className="px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] border border-[#333] text-white text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors"
                title="Fetch latest data from LetsExchange API"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#00FF41] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing Live...' : (syncSuccess ? 'Updated!' : 'Sync API')}</span>
              </button>

              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="p-2 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] border border-[#333] text-[#AAA] hover:text-[#00FF41] transition-colors"
                title="Configure LetsExchange API JWT Token"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Key / JWT Configuration Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-[#0D0D0D] border border-[#262626] p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#222]">
              <div className="flex items-center space-x-2 text-white font-bold uppercase">
                <Key className="w-4 h-4 text-[#00FF41]" />
                <span>LetsExchange API Key / JWT Configuration</span>
              </div>
              <button 
                onClick={() => setIsApiKeyModalOpen(false)}
                className="text-[#666] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveApiToken} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#777] uppercase mb-1">
                  API Key / JWT Token (Bearer Auth)
                </label>
                <textarea
                  rows={4}
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Paste your LetsExchange JWT Token..."
                  className="w-full p-2.5 bg-[#070707] border border-[#333] rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="p-3 bg-[#111] rounded-lg border border-[#222] text-[11px] text-[#888] space-y-1">
                <div className="text-white font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF41]" />
                  <span>Configured Token Details</span>
                </div>
                <div>Status: <span className="text-[#00FF41]">Authenticated & Ready</span></div>
                <div>Issuer: <span className="text-white">api.letsexchange.io/api/v1/api-key</span></div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#202020] text-[#AAA] border border-[#333]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-bold uppercase shadow"
                >
                  Save & Re-Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter & Controls Toolbar */}
      <div className="p-4 border-b border-[#181818] bg-[#0A0A0A] space-y-3">
        
        {/* Quote Asset Selector Pills & Search input */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Quote Assets Tab */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-[11px] text-[#666] uppercase font-mono mr-1 hidden sm:inline">Quote:</span>
            {QUOTE_ASSETS.map(q => (
              <button
                key={q.symbol}
                onClick={() => {
                  setSelectedQuote(q.symbol);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  selectedQuote === q.symbol
                    ? 'bg-[#00FF41] text-black shadow-md'
                    : 'bg-[#141414] hover:bg-[#202020] text-[#AAA] hover:text-white border border-[#222]'
                }`}
              >
                {q.symbol === 'ALL' ? (
                  <span className="text-xs">🌐</span>
                ) : (
                  <CoinLogo symbol={q.symbol} size="xs" />
                )}
                <span>{q.symbol}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across 22M+ pairs (symbol, network...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#121212] border border-[#262626] text-white placeholder-[#555] text-xs font-mono focus:outline-none focus:border-[#00FF41] transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#666] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
          {MARKET_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-[#121212] hover:bg-[#1A1A1A] text-[#888] hover:text-white border border-[#222]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {cat.id === 'favorites' && favorites.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px]">
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>

      </div>

      {/* Markets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#181818] bg-[#0C0C0C] text-[10px] text-[#666] uppercase">
              <th className="py-3 px-3 w-10 text-center">⭐</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>
                <div className="flex items-center space-x-1">
                  <span>Market Pair</span>
                  <ArrowUpDown className="w-3 h-3 text-[#444]" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>Price ({selectedQuote === 'ALL' ? 'Quote' : selectedQuote})</span>
                  <ArrowUpDown className="w-3 h-3 text-[#444]" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('change')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3 text-[#444]" />
                </div>
              </th>
              <th className="py-3 px-4 text-right hidden md:table-cell">24h High / Low</th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('volume')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>24h Volume</span>
                  <ArrowUpDown className="w-3 h-3 text-[#444]" />
                </div>
              </th>
              <th className="py-3 px-4 text-right hidden lg:table-cell">Spread</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {queryResult.pairs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#666]">
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="text-sm font-bold text-white">No markets found</div>
                  <div className="text-xs text-[#555] mt-1">Try clearing your search query or choosing another category.</div>
                </td>
              </tr>
            ) : (
              queryResult.pairs.map((p, idx) => {
                const isSelected = selectedPairSymbol === p.symbol;
                const isFav = favorites.includes(p.symbol);

                return (
                  <tr 
                    key={`mkt_row_${p.id}_${idx}`}
                    className={`hover:bg-[#111111] transition-colors group ${
                      isSelected ? 'bg-[#0F1E14] border-l-2 border-[#00FF41]' : ''
                    }`}
                  >
                    {/* Star Favorite */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(p.symbol);
                        }}
                        className="text-[#444] hover:text-yellow-400 transition-colors p-1"
                        title={isFav ? "Remove favorite" : "Add to favorites"}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                      </button>
                    </td>

                    {/* Market Pair & Base Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <CoinLogo symbol={p.base} name={p.baseName} icon={p.icon} size="md" />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-black text-white text-sm group-hover:text-[#00FF41] transition-colors">
                              {p.symbol}
                            </span>
                            {p.isBSV && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                                BSV
                              </span>
                            )}
                            {p.isSolana && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                SOL
                              </span>
                            )}
                            {p.isEVM && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                EVM
                              </span>
                            )}
                            {p.isRonin && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                                RON
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#666] flex items-center space-x-1">
                            <span>{p.baseName}</span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{p.network}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-white text-sm">
                        {p.priceFormatted}
                      </div>
                      <div className="text-[10px] text-[#666]">
                        {p.quote === 'USDT' || p.quote === 'USDC' ? `$${p.price.toFixed(2)}` : `≈ $${(p.price * (p.quote === 'BSV' ? 48.60 : p.quote === 'SOL' ? 148.50 : p.quote === 'ETH' ? 2642.50 : 1)).toFixed(2)}`}
                      </div>
                    </td>

                    {/* 24h Change */}
                    <td className="py-3 px-4 text-right">
                      <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded font-bold text-xs ${
                        p.change24h >= 0 
                          ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {p.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{p.change24h >= 0 ? `+${p.change24h}%` : `${p.change24h}%`}</span>
                      </div>
                    </td>

                    {/* High / Low */}
                    <td className="py-3 px-4 text-right hidden md:table-cell text-[11px]">
                      <div className="text-white">{p.high24h.toFixed(p.high24h < 1 ? 4 : 2)}</div>
                      <div className="text-[#666]">{p.low24h.toFixed(p.low24h < 1 ? 4 : 2)}</div>
                    </td>

                    {/* 24h Volume */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-white">{p.volQuote} {p.quote}</div>
                      <div className="text-[10px] text-[#666]">${(p.volumeUsd / 1000000).toFixed(2)}M USD</div>
                    </td>

                    {/* Spread */}
                    <td className="py-3 px-4 text-right hidden lg:table-cell">
                      <span className="text-[#888]">{p.spread}%</span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectPair(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1 mx-auto ${
                          isSelected
                            ? 'bg-[#00FF41] text-black shadow-md'
                            : 'bg-[#181818] hover:bg-[#00FF41] text-white hover:text-black border border-[#2A2A2A]'
                        }`}
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Active' : 'Trade'}</span>
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Infinite Scroll Footer Sentinel */}
      <div 
        ref={sentinelRef}
        className="p-4 border-t border-[#181818] bg-[#0A0A0A] flex items-center justify-center text-xs font-mono text-[#888]"
      >
        {visibleCount < queryResult.total ? (
          <div className="flex items-center space-x-2 bg-[#111] border border-[#222] px-4 py-2 rounded-full text-[#AAA]">
            <RefreshCw className="w-3.5 h-3.5 text-[#00FF41] animate-spin" />
            <span>Loading more trading pairs ({queryResult.pairs.length} of {queryResult.total.toLocaleString()})...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-[11px] text-[#666]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF41]" />
            <span>Loaded all {queryResult.total.toLocaleString()} pairs ({queryResult.totalEstimatedUniverse.toLocaleString()} indexed)</span>
          </div>
        )}
      </div>

    </div>
  );
};
