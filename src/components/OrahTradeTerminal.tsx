import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { AdvancedTradingChart } from './AdvancedTradingChart';
import { MarketsDirectory22M } from './MarketsDirectory22M';
import confetti from 'canvas-confetti';
import { 
  Menu, 
  Bell, 
  Star, 
  Info, 
  Share2, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  RefreshCw,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Lock,
  Globe,
  BarChart2,
  Layers,
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  tradeMarketsService, 
  TradePair, 
  QUOTE_ASSETS, 
  MARKET_CATEGORIES, 
  TOTAL_INDEXED_MARKETS_COUNT 
} from '../services/tradeMarketsService';
import { CoinLogo } from './CoinLogo';

interface OrderBookRow {
  bidAmount: number;
  bidPrice: number;
  askPrice: number;
  askAmount: number;
  bidDepthPct: number;
  askDepthPct: number;
}

interface MarketTrade {
  id: string;
  time: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
}

interface OrahTradeTerminalProps {
  initialPairSymbol?: string | null;
}

export const OrahTradeTerminal: React.FC<OrahTradeTerminalProps> = ({
  initialPairSymbol
}) => {
  const { account, isConnected, openWalletModal } = useWallet();

  // Active pair from the 22M+ matrix
  const [selectedPair, setSelectedPair] = useState<TradePair>(() => {
    if (initialPairSymbol) {
      const found = tradeMarketsService.getPairBySymbol(initialPairSymbol);
      if (found) return found;
    }
    return tradeMarketsService.getPopularPairs()[0] || tradeMarketsService.getAllPairs()[0];
  });

  useEffect(() => {
    if (initialPairSymbol) {
      const found = tradeMarketsService.getPairBySymbol(initialPairSymbol);
      if (found) setSelectedPair(found);
    }
  }, [initialPairSymbol]);

  const [viewMode, setViewMode] = useState<'terminal' | 'directory'>('terminal');
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalQuoteFilter, setModalQuoteFilter] = useState('ALL');
  const [modalCategoryFilter, setModalCategoryFilter] = useState('all');
  const [activeBottomTab, setActiveBottomTab] = useState<'orderbook' | 'trades' | 'orders'>('orderbook');

  // Favorites state persisted locally
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tradex_favorite_pairs');
      return saved ? JSON.parse(saved) : ['BSV/USDT', 'ORAH/USDT', 'AURA/USDT', 'SOL/USDT', 'BTC/USDT'];
    } catch {
      return ['BSV/USDT', 'ORAH/USDT', 'AURA/USDT', 'SOL/USDT', 'BTC/USDT'];
    }
  });

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      try {
        localStorage.setItem('tradex_favorite_pairs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Active limit & market orders
  interface ActiveOrder {
    id: string;
    pairSymbol: string;
    base: string;
    quote: string;
    side: 'buy' | 'sell';
    type: 'limit' | 'market';
    price: number;
    amount: number;
    filledAmount: number;
    status: 'open' | 'filled' | 'cancelled';
    timestamp: string;
    network: string;
  }

  const [openOrders, setOpenOrders] = useState<ActiveOrder[]>(() => {
    try {
      const saved = localStorage.getItem('tradex_user_open_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [priceInput, setPriceInput] = useState<string>(selectedPair.priceFormatted);
  const [amountInput, setAmountInput] = useState<string>('10');
  const [orderNotification, setOrderNotification] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live orderbook generator state
  const [orderbook, setOrderbook] = useState<OrderBookRow[]>([]);
  const [recentTrades, setRecentTrades] = useState<MarketTrade[]>([]);

  // Trending Movers Ticker
  const trendingMovers = useMemo(() => {
    return tradeMarketsService.getTrendingMovers();
  }, []);

  // Filtered pairs for modal quick selector
  const modalFilteredPairs = useMemo(() => {
    return tradeMarketsService.searchPairs({
      query: modalSearchQuery,
      category: modalCategoryFilter,
      quote: modalQuoteFilter,
      favorites,
      sortBy: 'volume',
      pageSize: 150
    }).pairs;
  }, [modalSearchQuery, modalCategoryFilter, modalQuoteFilter, favorites]);

  // Format price helper
  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return p.toFixed(p < 10 ? 3 : 2);
    if (p >= 0.0001) return p.toFixed(6);
    return p.toFixed(8);
  };

  // Initialize and tick live orderbook matching engine on pair change
  useEffect(() => {
    // Initial sync with LetsExchange API
    tradeMarketsService.syncWithLetsExchangeApi(false);
  }, []);

  useEffect(() => {
    setPriceInput(selectedPair.price < 1 ? selectedPair.price.toFixed(6) : selectedPair.price.toFixed(2));
    const baseP = selectedPair.price;
    const isMicro = baseP < 0.01;
    const isSmall = baseP < 5;
    const step = isMicro ? baseP * 0.005 : isSmall ? 0.002 : baseP > 1000 ? 5.0 : 0.02;
    const precision = isMicro ? 7 : isSmall ? 4 : baseP > 1000 ? 1 : 2;

    const baseAmountScale = baseP > 1000 ? 0.5 : baseP > 50 ? 15 : baseP > 1 ? 150 : 5000;

    const initialRows: OrderBookRow[] = [
      { bidAmount: baseAmountScale * 1.2, bidPrice: +(baseP - step * 1).toFixed(precision), askPrice: +(baseP + step * 1).toFixed(precision), askAmount: baseAmountScale * 1.2, bidDepthPct: 95, askDepthPct: 95 },
      { bidAmount: baseAmountScale * 1.0, bidPrice: +(baseP - step * 2).toFixed(precision), askPrice: +(baseP + step * 2).toFixed(precision), askAmount: baseAmountScale * 1.0, bidDepthPct: 82, askDepthPct: 82 },
      { bidAmount: baseAmountScale * 0.8, bidPrice: +(baseP - step * 3).toFixed(precision), askPrice: +(baseP + step * 3).toFixed(precision), askAmount: baseAmountScale * 0.8, bidDepthPct: 68, askDepthPct: 68 },
      { bidAmount: baseAmountScale * 0.7, bidPrice: +(baseP - step * 4).toFixed(precision), askPrice: +(baseP + step * 4).toFixed(precision), askAmount: baseAmountScale * 0.7, bidDepthPct: 56, askDepthPct: 56 },
      { bidAmount: baseAmountScale * 0.6, bidPrice: +(baseP - step * 5).toFixed(precision), askPrice: +(baseP + step * 5).toFixed(precision), askAmount: baseAmountScale * 0.6, bidDepthPct: 45, askDepthPct: 45 },
      { bidAmount: baseAmountScale * 0.5, bidPrice: +(baseP - step * 6).toFixed(precision), askPrice: +(baseP + step * 6).toFixed(precision), askAmount: baseAmountScale * 0.5, bidDepthPct: 36, askDepthPct: 36 },
      { bidAmount: baseAmountScale * 0.4, bidPrice: +(baseP - step * 7).toFixed(precision), askPrice: +(baseP + step * 7).toFixed(precision), askAmount: baseAmountScale * 0.4, bidDepthPct: 27, askDepthPct: 27 },
      { bidAmount: baseAmountScale * 0.3, bidPrice: +(baseP - step * 8).toFixed(precision), askPrice: +(baseP + step * 8).toFixed(precision), askAmount: baseAmountScale * 0.3, bidDepthPct: 20, askDepthPct: 20 },
      { bidAmount: baseAmountScale * 0.2, bidPrice: +(baseP - step * 9).toFixed(precision), askPrice: +(baseP + step * 9).toFixed(precision), askAmount: baseAmountScale * 0.2, bidDepthPct: 13, askDepthPct: 13 },
      { bidAmount: baseAmountScale * 0.1, bidPrice: +(baseP - step * 10).toFixed(precision), askPrice: +(baseP + step * 10).toFixed(precision), askAmount: baseAmountScale * 0.1, bidDepthPct: 8, askDepthPct: 8 }
    ];
    setOrderbook(initialRows);

    // Initial trades
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const trades: MarketTrade[] = [
      { id: '1', time: timeStr, price: baseP, amount: baseAmountScale * 0.8, side: 'buy' },
      { id: '2', time: timeStr, price: +(baseP - step).toFixed(precision), amount: baseAmountScale * 0.4, side: 'sell' },
      { id: '3', time: timeStr, price: +(baseP + step).toFixed(precision), amount: baseAmountScale * 1.5, side: 'buy' },
      { id: '4', time: timeStr, price: baseP, amount: baseAmountScale * 2.2, side: 'buy' },
      { id: '5', time: timeStr, price: +(baseP - step * 2).toFixed(precision), amount: baseAmountScale * 0.3, side: 'sell' }
    ];
    setRecentTrades(trades);

    const interval = setInterval(() => {
      setOrderbook(prev => prev.map(row => {
        const jitter = (Math.random() - 0.5) * (baseAmountScale * 0.08);
        const newBidAmt = Math.max(0.01, +(row.bidAmount + jitter).toFixed(2));
        const newAskAmt = Math.max(0.01, +(row.askAmount - jitter).toFixed(2));
        return {
          ...row,
          bidAmount: newBidAmt,
          askAmount: newAskAmt,
          bidDepthPct: Math.min(100, Math.max(5, row.bidDepthPct + Math.round((Math.random() - 0.5) * 4))),
          askDepthPct: Math.min(100, Math.max(5, row.askDepthPct - Math.round((Math.random() - 0.5) * 4)))
        };
      }));
    }, 1800);

    return () => clearInterval(interval);
  }, [selectedPair]);

  const handleSelectPair = (pair: TradePair) => {
    setSelectedPair(pair);
    setIsPairDropdownOpen(false);
    setViewMode('terminal');
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      openWalletModal();
      return;
    }

    const amt = parseFloat(amountInput) || 0;
    const px = parseFloat(priceInput) || selectedPair.price;
    if (amt <= 0 || px <= 0) return;

    setIsSubmitting(true);

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newOrder: ActiveOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pairSymbol: selectedPair.symbol,
      base: selectedPair.base,
      quote: selectedPair.quote,
      side: tradeSide,
      type: orderType,
      price: px,
      amount: amt,
      filledAmount: orderType === 'market' ? amt : 0,
      status: orderType === 'market' ? 'filled' : 'open',
      timestamp: timeStr,
      network: selectedPair.network
    };

    // Update open orders state & persistence
    const updatedOrders = [newOrder, ...openOrders];
    setOpenOrders(updatedOrders);
    try {
      localStorage.setItem('tradex_user_open_orders', JSON.stringify(updatedOrders));
    } catch {}

    // If market order, instantly add to recent trades and execute fill
    if (orderType === 'market') {
      const newTrade: MarketTrade = {
        id: newOrder.id,
        time: timeStr,
        price: px,
        amount: amt,
        side: tradeSide
      };
      setRecentTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }

    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.7 }
    });

    setOrderNotification(
      orderType === 'market'
        ? `Instant Fill: ${tradeSide.toUpperCase()} ${amt} ${selectedPair.base} @ $${formatPrice(px)} on ${selectedPair.network}`
        : `Limit Order Placed: ${tradeSide.toUpperCase()} ${amt} ${selectedPair.base} @ $${formatPrice(px)}`
    );

    setIsSubmitting(false);

    setTimeout(() => {
      setOrderNotification(null);
    }, 4500);
  };

  const handleCancelOrder = (orderId: string) => {
    const updated = openOrders.filter(o => o.id !== orderId);
    setOpenOrders(updated);
    try {
      localStorage.setItem('tradex_user_open_orders', JSON.stringify(updated));
    } catch {}
    setOrderNotification('Order successfully cancelled.');
    setTimeout(() => setOrderNotification(null), 3000);
  };

  const isFavorite = favorites.includes(selectedPair.symbol);

  return (
    <div className="min-h-screen bg-[#030303] text-[#E0E0E0] font-mono select-none pb-24">
      
      {/* 22M+ Trending Movers Live Ticker */}
      <div className="border-b border-[#141414] bg-[#070707] px-3 py-1.5 overflow-x-auto scrollbar-none flex items-center space-x-4 text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase text-[10px] whitespace-nowrap pr-2 border-r border-[#222]">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>22M+ Hot Movers:</span>
        </div>
        <div className="flex items-center space-x-5 overflow-x-auto scrollbar-none">
          {trendingMovers.map(mover => (
            <button
              key={mover.id}
              onClick={() => handleSelectPair(mover)}
              className="flex items-center space-x-1.5 hover:bg-[#151515] px-2 py-0.5 rounded transition-colors whitespace-nowrap text-left group"
            >
              <CoinLogo symbol={mover.base} name={mover.baseName} icon={mover.icon} size="xs" />
              <span className="text-white font-bold group-hover:text-[#00FF41]">{mover.symbol}</span>
              <span className="text-[#888]">${formatPrice(mover.price)}</span>
              <span className={`text-[10px] font-bold ${mover.change24h >= 0 ? 'text-[#00FF41]' : 'text-red-400'}`}>
                {mover.change24h >= 0 ? `+${mover.change24h}%` : `${mover.change24h}%`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pair Header Bar */}
      <div className="border-b border-[#181818] bg-[#090909] px-4 py-3 sticky top-14 sm:top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Pair Selector dropdown trigger with 22M count indicator */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#121212] hover:bg-[#1C1C1C] border border-[#262626] text-white hover:text-[#00FF41] transition-all group"
            >
              <Menu className="w-4 h-4 text-[#777] group-hover:text-white" />
              <div className="flex items-center space-x-1.5">
                <CoinLogo symbol={selectedPair.base} name={selectedPair.baseName} icon={selectedPair.icon} size="sm" />
                <span className="text-base font-black tracking-tight">{selectedPair.symbol}</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 hidden sm:inline">
                {selectedPair.network}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#555] group-hover:text-white" />
            </button>

            <div className="flex items-center space-x-1 text-[#555]">
              <button 
                onClick={() => toggleFavorite(selectedPair.symbol)}
                className={`p-1.5 rounded hover:bg-[#141414] transition-colors ${isFavorite ? 'text-yellow-400' : 'hover:text-yellow-400'}`}
                title={isFavorite ? "Remove favorite" : "Add to favorites"}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
              </button>
              <button 
                onClick={() => setViewMode(viewMode === 'terminal' ? 'directory' : 'terminal')}
                className="p-1.5 rounded hover:bg-[#141414] hover:text-[#00FF41] transition-colors text-xs flex items-center space-x-1"
                title="Browse All 22M+ Markets"
              >
                <Globe className="w-4 h-4 text-[#00FF41]" />
                <span className="text-[10px] text-[#00FF41] hidden md:inline font-bold">22M+ Markets</span>
              </button>
            </div>
          </div>

          {/* Quick Price Metrics */}
          <div className="flex items-center space-x-5 text-xs">
            <div>
              <div className="text-[10px] text-[#666] uppercase">24h High</div>
              <div className="text-white font-bold">{formatPrice(selectedPair.high24h)}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#666] uppercase">24h Low</div>
              <div className="text-white font-bold">{formatPrice(selectedPair.low24h)}</div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] text-[#666] uppercase">Vol({selectedPair.base})</div>
              <div className="text-white font-bold">{selectedPair.volBase}</div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] text-[#666] uppercase">Vol({selectedPair.quote})</div>
              <div className="text-white font-bold">{selectedPair.volQuote}</div>
            </div>
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center space-x-1 bg-[#121212] p-1 rounded-lg border border-[#222]">
            <button
              onClick={() => setViewMode('terminal')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'terminal'
                  ? 'bg-[#00FF41] text-black shadow'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Trade Terminal</span>
            </button>
            <button
              onClick={() => setViewMode('directory')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'directory'
                  ? 'bg-[#00FF41] text-black shadow'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All 22M+ Markets</span>
            </button>
          </div>

        </div>
      </div>

      {/* PAIR SELECTION FULL MODAL / DRAWER */}
      {isPairDropdownOpen && (
        <div className="fixed inset-0 z-50 flex items-center sm:items-start justify-center pt-2 sm:pt-16 p-3 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0B0B0B] border border-[#262626] p-4 sm:p-5 shadow-2xl flex flex-col gap-3 max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1E1E1E] shrink-0">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#00FF41] animate-pulse" />
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  Select Market Pair • 22M+ Universe
                </span>
              </div>
              <button 
                onClick={() => setIsPairDropdownOpen(false)} 
                className="w-7 h-7 rounded-lg bg-[#181818] hover:bg-[#252525] text-[#888] hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across 22,357,399 multi-chain markets (BSV, SOL, ETH, BTC, RON...)"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white placeholder-[#555] text-xs font-mono focus:outline-none focus:border-[#00FF41]"
                autoFocus
              />
              {modalSearchQuery && (
                <button 
                  onClick={() => setModalSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#666] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Section Box: Quote and Category Rows */}
            <div className="shrink-0 flex flex-col gap-2 p-2.5 rounded-xl bg-[#111111] border border-[#202020]">
              
              {/* Quote Filter Pills Row */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 min-h-[30px]">
                <span className="text-[10px] text-[#777] uppercase font-bold tracking-wider shrink-0 w-14">
                  Quote:
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {QUOTE_ASSETS.map(q => (
                    <button
                      key={q.symbol}
                      onClick={() => setModalQuoteFilter(q.symbol)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono transition-all flex items-center gap-1 shrink-0 ${
                        modalQuoteFilter === q.symbol
                          ? 'bg-[#00FF41] text-black shadow'
                          : 'bg-[#191919] hover:bg-[#252525] text-[#999] hover:text-white border border-[#282828]'
                      }`}
                    >
                      <span>{q.icon}</span>
                      <span>{q.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter Pills Row */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-[#1C1C1C] min-h-[30px]">
                <span className="text-[10px] text-[#777] uppercase font-bold tracking-wider shrink-0 w-14">
                  Type:
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {MARKET_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setModalCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                        modalCategoryFilter === cat.id
                          ? 'bg-white text-black font-bold shadow'
                          : 'bg-[#191919] hover:bg-[#252525] text-[#888] hover:text-white border border-[#282828]'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Pair Results List */}
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-[#151515] pr-1 space-y-0.5">
              {modalFilteredPairs.length === 0 ? (
                <div className="py-12 text-center text-[#666] space-y-1">
                  <div className="text-2xl">🔍</div>
                  <div className="text-white font-bold text-xs">No pairs matching "{modalSearchQuery}"</div>
                  <div className="text-[10px] text-[#555]">Try searching for BSV, ORAH, AURA, SOL, BTC, ETH, or RON.</div>
                </div>
              ) : (
                modalFilteredPairs.map((p, idx) => (
                  <div
                    key={`modal_pair_${p.id}_${idx}`}
                    onClick={() => handleSelectPair(p)}
                    className={`flex items-center justify-between p-3 rounded-lg hover:bg-[#161616] cursor-pointer transition-colors ${
                      selectedPair.symbol === p.symbol ? 'bg-[#122417] border border-[#00FF41]/30' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <CoinLogo symbol={p.base} name={p.baseName} icon={p.icon} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="font-bold text-white text-sm tracking-tight">{p.symbol}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1E1E1E] text-[#888] border border-[#282828]">
                            {p.network}
                          </span>
                          {p.isBSV && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                              BSV
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#666] truncate">{p.baseName} • Vol: {p.volQuote} {p.quote}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <div className="font-bold text-white text-sm">{p.priceFormatted} {p.quote}</div>
                      <div className={`text-xs font-bold ${p.change24h >= 0 ? 'text-[#00FF41]' : 'text-red-500'}`}>
                        {p.change24h >= 0 ? `+${p.change24h}%` : `${p.change24h}%`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="pt-2.5 border-t border-[#1C1C1C] flex items-center justify-between text-xs text-[#777] shrink-0">
              <span>Indexed: <strong className="text-white font-mono">{TOTAL_INDEXED_MARKETS_COUNT.toLocaleString()}</strong> Pairs</span>
              <button
                onClick={() => {
                  setIsPairDropdownOpen(false);
                  setViewMode('directory');
                }}
                className="text-[#00FF41] hover:underline flex items-center space-x-1 font-bold"
              >
                <span>Open Full 22M+ Screener</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        
        {/* If user toggled to Full 22M+ Directory View */}
        {viewMode === 'directory' ? (
          <MarketsDirectory22M
            onSelectPair={handleSelectPair}
            selectedPairSymbol={selectedPair.symbol}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        ) : (
          <>
            {/* Large Hero Price Section */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 pb-2">
              <div>
                <div className="flex items-baseline space-x-3">
                  <span className={`text-4xl sm:text-5xl font-black tracking-tight ${selectedPair.change24h >= 0 ? 'text-[#00FF41]' : 'text-red-500'}`}>
                    {selectedPair.priceFormatted}
                  </span>
                  <span className="text-lg text-[#888] font-bold">{selectedPair.quote}</span>
                  <span className={`text-lg sm:text-xl font-bold ${selectedPair.change24h >= 0 ? 'text-[#00FF41]' : 'text-red-500'}`}>
                    {selectedPair.change24h >= 0 ? `+${selectedPair.change24h}%` : `${selectedPair.change24h}%`}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-[#777] mt-1">
                  <span>≈ ${(selectedPair.price * (selectedPair.quote === 'BSV' ? 48.60 : selectedPair.quote === 'SOL' ? 148.50 : selectedPair.quote === 'ETH' ? 2642.50 : selectedPair.quote === 'BTC' ? 64250 : 1)).toFixed(2)} USD</span>
                  <span>•</span>
                  <span>Spread: {selectedPair.spread}%</span>
                  <span>•</span>
                  <span className="text-[#00FF41]">{selectedPair.network}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-[#00FF41] bg-[#00FF41]/10 px-3 py-1.5 rounded-lg border border-[#00FF41]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
                <span>22M+ Omni-Chain Settlement Active</span>
              </div>
            </div>

            {/* Advanced TradingView Style Interactive Chart */}
            <AdvancedTradingChart
              symbol={selectedPair.symbol}
              currentPrice={selectedPair.price}
              priceChange24h={selectedPair.change24h}
              high24h={selectedPair.high24h}
              low24h={selectedPair.low24h}
              volume24h={selectedPair.volQuote}
            />

            {/* Order Book / Market Depth & Quick Order Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Order Book Column (2 Cols on desktop) */}
              <div className="lg:col-span-2 rounded-xl bg-[#080808] border border-[#181818] overflow-hidden">
                
                {/* Tabs */}
                <div className="flex items-center border-b border-[#181818] text-xs">
                  <button
                    onClick={() => setActiveBottomTab('orderbook')}
                    className={`flex-1 py-3 font-bold uppercase tracking-wider text-center transition-all ${
                      activeBottomTab === 'orderbook'
                        ? 'text-[#00FF41] border-b-2 border-[#00FF41] bg-[#0F0F0F]'
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    Live Order Book ({selectedPair.symbol})
                  </button>
                  <button
                    onClick={() => setActiveBottomTab('trades')}
                    className={`flex-1 py-3 font-bold uppercase tracking-wider text-center transition-all ${
                      activeBottomTab === 'trades'
                        ? 'text-[#00FF41] border-b-2 border-[#00FF41] bg-[#0F0F0F]'
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    Market Trades
                  </button>
                  <button
                    onClick={() => setActiveBottomTab('orders')}
                    className={`flex-1 py-3 font-bold uppercase tracking-wider text-center transition-all ${
                      activeBottomTab === 'orders'
                        ? 'text-[#00FF41] border-b-2 border-[#00FF41] bg-[#0F0F0F]'
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    My Orders ({openOrders.length})
                  </button>
                </div>

                {/* ORDER BOOK VIEW */}
                {activeBottomTab === 'orderbook' && (
                  <div className="p-3">
                    {/* Header */}
                    <div className="grid grid-cols-4 text-[10px] uppercase text-[#666] pb-2 border-b border-[#141414]">
                      <div>AMOUNT ({selectedPair.base})</div>
                      <div className="text-right text-[#00FF41]">BID ({selectedPair.quote})</div>
                      <div className="text-left pl-3 text-red-500">ASK ({selectedPair.quote})</div>
                      <div className="text-right">AMOUNT ({selectedPair.base})</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-[#101010] text-xs py-1">
                      {orderbook.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-4 py-1 relative items-center hover:bg-[#111] transition-colors">
                          
                          {/* Bid side depth background bar */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-[#00FF41]/8 pointer-events-none"
                            style={{ width: `${row.bidDepthPct / 2}%` }}
                          />

                          {/* Ask side depth background bar */}
                          <div 
                            className="absolute right-0 top-0 bottom-0 bg-red-500/8 pointer-events-none"
                            style={{ width: `${row.askDepthPct / 2}%` }}
                          />

                          {/* Bid Amount */}
                          <div className="text-[#888] font-mono z-10">
                            {row.bidAmount.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                          </div>

                          {/* Bid Price */}
                          <div className="text-right font-bold text-[#00FF41] font-mono z-10">
                            {formatPrice(row.bidPrice)}
                          </div>

                          {/* Ask Price */}
                          <div className="text-left pl-3 font-bold text-red-500 font-mono z-10">
                            {formatPrice(row.askPrice)}
                          </div>

                          {/* Ask Amount */}
                          <div className="text-right text-[#888] font-mono z-10">
                            {row.askAmount.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RECENT TRADES VIEW */}
                {activeBottomTab === 'trades' && (
                  <div className="p-3">
                    <div className="grid grid-cols-3 text-[10px] uppercase text-[#666] pb-2 border-b border-[#141414]">
                      <div>TIME</div>
                      <div className="text-right">PRICE ({selectedPair.quote})</div>
                      <div className="text-right">AMOUNT ({selectedPair.base})</div>
                    </div>
                    <div className="divide-y divide-[#101010] text-xs py-1">
                      {recentTrades.map((t) => (
                        <div key={t.id} className="grid grid-cols-3 py-1.5 items-center">
                          <div className="text-[#666] font-mono text-[11px]">{t.time}</div>
                          <div className={`text-right font-bold font-mono ${t.side === 'buy' ? 'text-[#00FF41]' : 'text-red-500'}`}>
                            {formatPrice(t.price)}
                          </div>
                          <div className="text-right text-white font-mono">{t.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MY ORDERS VIEW */}
                {activeBottomTab === 'orders' && (
                  <div className="p-3">
                    {openOrders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#666] space-y-2">
                        <div className="text-2xl">📋</div>
                        <div>No open limit orders.</div>
                        <div className="text-[10px] text-[#555]">Submit a limit or market order to view live settlement on {selectedPair.network}.</div>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-6 text-[10px] uppercase text-[#666] pb-2 border-b border-[#141414]">
                          <div>PAIR / TIME</div>
                          <div>TYPE / SIDE</div>
                          <div className="text-right">PRICE</div>
                          <div className="text-right">AMOUNT</div>
                          <div className="text-center">STATUS</div>
                          <div className="text-right">ACTION</div>
                        </div>
                        <div className="divide-y divide-[#121212] text-xs py-1">
                          {openOrders.map((ord) => (
                            <div key={ord.id} className="grid grid-cols-6 py-2 items-center hover:bg-[#111] px-1 rounded">
                              <div>
                                <div className="text-white font-bold">{ord.pairSymbol}</div>
                                <div className="text-[10px] text-[#666]">{ord.timestamp}</div>
                              </div>
                              <div>
                                <span className={`font-bold uppercase ${ord.side === 'buy' ? 'text-[#00FF41]' : 'text-red-500'}`}>
                                  {ord.side}
                                </span>{' '}
                                <span className="text-[10px] text-[#777] uppercase">({ord.type})</span>
                              </div>
                              <div className="text-right font-mono font-bold text-white">
                                ${formatPrice(ord.price)}
                              </div>
                              <div className="text-right font-mono text-[#AAA]">
                                {ord.amount} {ord.base}
                              </div>
                              <div className="text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  ord.status === 'filled' 
                                    ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30'
                                    : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                                }`}>
                                  {ord.status}
                                </span>
                              </div>
                              <div className="text-right">
                                {ord.status === 'open' ? (
                                  <button
                                    onClick={() => handleCancelOrder(ord.id)}
                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] transition-colors"
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-[#555]">Settled</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Quick Trade Submission Form */}
              <div className="rounded-xl bg-[#080808] border border-[#181818] p-4 flex flex-col justify-between">
                <form onSubmit={handleExecuteTrade} className="space-y-3 text-xs">
                  
                  {/* Buy / Sell Toggle */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#121212] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setTradeSide('buy')}
                      className={`py-2 rounded-md font-bold uppercase transition-all ${
                        tradeSide === 'buy'
                          ? 'bg-[#00FF41] text-black shadow-md'
                          : 'text-[#888] hover:text-white'
                      }`}
                    >
                      Buy {selectedPair.base}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeSide('sell')}
                      className={`py-2 rounded-md font-bold uppercase transition-all ${
                        tradeSide === 'sell'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'text-[#888] hover:text-white'
                      }`}
                    >
                      Sell {selectedPair.base}
                    </button>
                  </div>

                  {/* Order Type */}
                  <div className="flex items-center justify-between text-[11px] text-[#777]">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setOrderType('limit')}
                        className={`font-bold ${orderType === 'limit' ? 'text-white underline' : 'text-[#666]'}`}
                      >
                        Limit
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('market')}
                        className={`font-bold ${orderType === 'market' ? 'text-white underline' : 'text-[#666]'}`}
                      >
                        Market
                      </button>
                    </div>
                    <span>Avail: {account ? `${account.balanceBsv.toFixed(2)} BSV` : `0.00 ${selectedPair.quote}`}</span>
                  </div>

                  {/* Price Field */}
                  {orderType === 'limit' && (
                    <div>
                      <label className="block text-[10px] text-[#666] uppercase mb-1">Price ({selectedPair.quote})</label>
                      <input
                        type="number"
                        step="any"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                      />
                    </div>
                  )}

                  {/* Amount Field */}
                  <div>
                    <label className="block text-[10px] text-[#666] uppercase mb-1">Amount ({selectedPair.base})</label>
                    <input
                      type="number"
                      step="any"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full px-3 py-2 bg-[#121212] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  {/* Quick % Buttons */}
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    {['25%', '50%', '75%', '100%'].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setAmountInput((parseFloat(pct) * 0.5).toString())}
                        className="py-1 bg-[#121212] hover:bg-[#1C1C1C] border border-[#222] rounded text-[#888] hover:text-white"
                      >
                        {pct}
                      </button>
                    ))}
                  </div>

                  {/* Total Order Cost Summary */}
                  <div className="p-2.5 bg-[#0D0D0D] rounded-lg border border-[#181818] space-y-1 text-[11px] text-[#777]">
                    <div className="flex justify-between">
                      <span>Total Est:</span>
                      <span className="text-white font-bold">
                        {((parseFloat(priceInput) || 0) * (parseFloat(amountInput) || 0)).toFixed(selectedPair.price < 1 ? 4 : 2)} {selectedPair.quote}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Protocol Fee:</span>
                      <span className="text-[#00FF41]">0.01% (VIP Rebate)</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Settlement Channel:</span>
                      <span className="text-amber-400">{selectedPair.network}</span>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-lg font-black uppercase text-xs tracking-wider shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5 ${
                      tradeSide === 'buy'
                        ? 'bg-[#00FF41] hover:bg-[#00D436] text-black'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    <span>
                      {isConnected 
                        ? `${tradeSide.toUpperCase()} ${selectedPair.base}`
                        : 'Connect Wallet to Trade'}
                    </span>
                  </button>

                </form>

                {orderNotification && (
                  <div className="mt-3 p-2.5 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs flex items-center space-x-1.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{orderNotification}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Embedded 22M+ Markets Directory below for quick discovery */}
            <div className="mt-8">
              <MarketsDirectory22M
                onSelectPair={handleSelectPair}
                selectedPairSymbol={selectedPair.symbol}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          </>
        )}

      </div>

    </div>
  );
};
