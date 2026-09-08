import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { AdvancedTradingChart } from './AdvancedTradingChart';
import { MarketsDirectory22M } from './MarketsDirectory22M';
import confetti from '../utils/confetti';
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
  AlertCircle,
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
  const { account, isConnected, openWalletModal, getTokenBalance, updateTokenBalance, refreshBalance } = useWallet();

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
  const [orderSubTab, setOrderSubTab] = useState<'all' | 'open_limit' | 'stop_orders' | 'history'>('all');
  const [marketTick, setMarketTick] = useState(0);

  useEffect(() => {
    const unsub = tradeMarketsService.subscribe(() => {
      setMarketTick(t => t + 1);
    });
    return unsub;
  }, []);

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

  // Active limit, market, and stop-loss orders
  interface ActiveOrder {
    id: string;
    pairSymbol: string;
    base: string;
    quote: string;
    side: 'buy' | 'sell';
    type: 'limit' | 'market' | 'stop_loss' | 'stop_limit';
    price: number;
    triggerPrice?: number;
    takeProfitPrice?: number;
    stopLossPrice?: number;
    amount: number;
    filledAmount: number;
    totalCostQuote: number;
    status: 'open' | 'trigger_pending' | 'filled' | 'cancelled';
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
  const [orderType, setOrderType] = useState<'limit' | 'market' | 'stop_loss' | 'stop_limit'>('limit');
  const [priceInput, setPriceInput] = useState<string>(selectedPair.priceFormatted);
  const [stopPriceInput, setStopPriceInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('10');
  const [attachTpSl, setAttachTpSl] = useState<boolean>(false);
  const [takeProfitInput, setTakeProfitInput] = useState<string>('');
  const [stopLossInput, setStopLossInput] = useState<string>('');
  const [orderNotification, setOrderNotification] = useState<{ type: 'success' | 'warn' | 'info'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live orderbook generator state
  const [orderbook, setOrderbook] = useState<OrderBookRow[]>([]);
  const [recentTrades, setRecentTrades] = useState<MarketTrade[]>(() => {
    try {
      const stored = localStorage.getItem('tradex_executed_market_trades');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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
  }, [modalSearchQuery, modalCategoryFilter, modalQuoteFilter, favorites, marketTick]);

  // Format price helper
  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return p.toFixed(p < 10 ? 3 : 2);
    if (p >= 0.0001) return p.toFixed(6);
    return p.toFixed(8);
  };

  // Available balances for base and quote
  const availableQuote = useMemo(() => {
    return getTokenBalance ? getTokenBalance(selectedPair.quote) : 0;
  }, [getTokenBalance, selectedPair.quote, account]);

  const availableBase = useMemo(() => {
    return getTokenBalance ? getTokenBalance(selectedPair.base) : 0;
  }, [getTokenBalance, selectedPair.base, account]);

  // Initialize and tick live orderbook matching engine on pair change
  useEffect(() => {
    // Initial sync with LetsExchange API
    tradeMarketsService.syncWithLetsExchangeApi(false);
  }, []);

  useEffect(() => {
    const formattedPrice = selectedPair.price < 1 ? selectedPair.price.toFixed(6) : selectedPair.price.toFixed(2);
    setPriceInput(formattedPrice);
    setStopPriceInput((selectedPair.price * (tradeSide === 'buy' ? 1.05 : 0.95)).toFixed(selectedPair.price < 1 ? 6 : 2));
    setTakeProfitInput((selectedPair.price * (tradeSide === 'buy' ? 1.10 : 0.90)).toFixed(selectedPair.price < 1 ? 6 : 2));
    setStopLossInput((selectedPair.price * (tradeSide === 'buy' ? 0.92 : 1.08)).toFixed(selectedPair.price < 1 ? 6 : 2));

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

    // Order matching engine on live market price updates
    const interval = setInterval(() => {
      const currentTickPrice = baseP;

      // Check open orders for Limit and Stop triggers!
      setOpenOrders(prevOrders => {
        let changed = false;
        const next = prevOrders.map(order => {
          // If order is already settled, leave it
          if (order.status !== 'open' && order.status !== 'trigger_pending') {
            return order;
          }

          // 1. Check STOP LOSS / STOP LIMIT triggers
          if (order.status === 'trigger_pending' && order.triggerPrice) {
            const isTriggered = order.side === 'sell'
              ? currentTickPrice <= order.triggerPrice
              : currentTickPrice >= order.triggerPrice;

            if (isTriggered) {
              changed = true;
              if (order.type === 'stop_loss') {
                // Stop Market Order triggers immediate fill!
                if (updateTokenBalance) {
                  if (order.side === 'buy') {
                    updateTokenBalance(order.base, order.amount);
                  } else {
                    updateTokenBalance(order.quote, order.amount * currentTickPrice);
                  }
                }
                setOrderNotification({
                  type: 'success',
                  text: `🎯 Stop Trigger Hit: ${order.side.toUpperCase()} ${order.amount} ${order.base} filled @ $${formatPrice(currentTickPrice)}!`
                });
                confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
                return {
                  ...order,
                  price: currentTickPrice,
                  filledAmount: order.amount,
                  status: 'filled' as const
                };
              } else {
                // Stop Limit activates into open limit order!
                setOrderNotification({
                  type: 'info',
                  text: `⚡ Stop Limit Activated: Limit order placed for ${order.amount} ${order.base} @ $${formatPrice(order.price)}.`
                });
                return {
                  ...order,
                  status: 'open' as const
                };
              }
            }
          }

          // 2. Check OPEN LIMIT orders for matching
          if (order.status === 'open' && (order.type === 'limit' || order.type === 'stop_limit')) {
            const isMatch = order.side === 'buy'
              ? currentTickPrice <= order.price
              : currentTickPrice >= order.price;

            if (isMatch) {
              changed = true;
              if (updateTokenBalance) {
                if (order.side === 'buy') {
                  updateTokenBalance(order.base, order.amount);
                } else {
                  updateTokenBalance(order.quote, order.amount * order.price);
                }
              }
              setOrderNotification({
                type: 'success',
                text: `🎉 Limit Order Filled: ${order.side.toUpperCase()} ${order.amount} ${order.base} @ $${formatPrice(order.price)}!`
              });
              confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
              return {
                ...order,
                filledAmount: order.amount,
                status: 'filled' as const
              };
            }
          }

          return order;
        });

        if (changed) {
          try {
            localStorage.setItem('tradex_user_open_orders', JSON.stringify(next));
          } catch {}
        }
        return next;
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [selectedPair, tradeSide, updateTokenBalance]);

  const handleSelectPair = (pair: TradePair) => {
    setSelectedPair(pair);
    setIsPairDropdownOpen(false);
    setViewMode('terminal');
  };

  // Quick percent click for exact balance calculation
  const handlePercentClick = (pct: number) => {
    const px = parseFloat(priceInput) || selectedPair.price || 1;
    if (tradeSide === 'buy') {
      const avail = availableQuote;
      if (avail <= 0) {
        setAmountInput('10');
        return;
      }
      const quoteToSpend = (avail * pct) / 100;
      const baseAmt = quoteToSpend / px;
      setAmountInput(baseAmt >= 1 ? baseAmt.toFixed(2) : baseAmt.toFixed(4));
    } else {
      const avail = availableBase;
      if (avail <= 0) {
        setAmountInput('10');
        return;
      }
      const baseToSell = (avail * pct) / 100;
      setAmountInput(baseToSell >= 1 ? baseToSell.toFixed(2) : baseToSell.toFixed(4));
    }
  };

  // Main Trade Execution Handler
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      openWalletModal();
      return;
    }

    const amt = parseFloat(amountInput) || 0;
    const px = parseFloat(priceInput) || selectedPair.price;
    const triggerPx = parseFloat(stopPriceInput) || 0;

    if (amt <= 0) {
      setOrderNotification({ type: 'warn', text: 'Please specify a valid trade amount.' });
      return;
    }

    if ((orderType === 'stop_loss' || orderType === 'stop_limit') && triggerPx <= 0) {
      setOrderNotification({ type: 'warn', text: 'Please enter a valid trigger stop price.' });
      return;
    }

    const totalQuoteCost = +(amt * px).toFixed(4);

    // Balance check
    if (tradeSide === 'buy') {
      if (availableQuote < totalQuoteCost) {
        setOrderNotification({
          type: 'warn',
          text: `Insufficient ${selectedPair.quote} balance! Available: ${availableQuote.toFixed(2)} ${selectedPair.quote}, needed: ${totalQuoteCost.toFixed(2)} ${selectedPair.quote}. Deposit funds or sync wallet balance.`
        });
        return;
      }
    } else {
      if (availableBase < amt) {
        setOrderNotification({
          type: 'warn',
          text: `Insufficient ${selectedPair.base} balance! Available: ${availableBase.toFixed(2)} ${selectedPair.base}, needed: ${amt.toFixed(2)} ${selectedPair.base}. Deposit funds or sync wallet balance.`
        });
        return;
      }
    }

    setIsSubmitting(true);

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const isInstantMarket = orderType === 'market';
    const isStopOrder = orderType === 'stop_loss' || orderType === 'stop_limit';

    const newOrder: ActiveOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pairSymbol: selectedPair.symbol,
      base: selectedPair.base,
      quote: selectedPair.quote,
      side: tradeSide,
      type: orderType,
      price: px,
      triggerPrice: isStopOrder ? triggerPx : undefined,
      takeProfitPrice: attachTpSl && parseFloat(takeProfitInput) ? parseFloat(takeProfitInput) : undefined,
      stopLossPrice: attachTpSl && parseFloat(stopLossInput) ? parseFloat(stopLossInput) : undefined,
      amount: amt,
      filledAmount: isInstantMarket ? amt : 0,
      totalCostQuote: totalQuoteCost,
      status: isInstantMarket ? 'filled' : isStopOrder ? 'trigger_pending' : 'open',
      timestamp: timeStr,
      network: selectedPair.network
    };

    // Deduct and credit balances
    if (updateTokenBalance) {
      if (isInstantMarket) {
        if (tradeSide === 'buy') {
          updateTokenBalance(selectedPair.quote, -totalQuoteCost);
          updateTokenBalance(selectedPair.base, +amt);
        } else {
          updateTokenBalance(selectedPair.base, -amt);
          updateTokenBalance(selectedPair.quote, +totalQuoteCost);
        }
      } else {
        // Limit or Stop orders reserve the asset being spent
        if (tradeSide === 'buy') {
          updateTokenBalance(selectedPair.quote, -totalQuoteCost);
        } else {
          updateTokenBalance(selectedPair.base, -amt);
        }
      }
    }

    // Update open orders state & persistence
    const updatedOrders = [newOrder, ...openOrders];
    setOpenOrders(updatedOrders);
    try {
      localStorage.setItem('tradex_user_open_orders', JSON.stringify(updatedOrders));
    } catch {}

    // If market order, instantly add to recent trades tape and persistent storage
    if (isInstantMarket) {
      const newTrade: MarketTrade = {
        id: newOrder.id,
        time: timeStr,
        price: px,
        amount: amt,
        side: tradeSide
      };
      setRecentTrades(prev => {
        const next = [newTrade, ...prev.slice(0, 49)];
        try {
          localStorage.setItem('tradex_executed_market_trades', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.7 }
    });

    let successMsg = '';
    if (orderType === 'market') {
      successMsg = `Instant Fill: ${tradeSide.toUpperCase()} ${amt} ${selectedPair.base} @ $${formatPrice(px)} on ${selectedPair.network}`;
    } else if (orderType === 'limit') {
      successMsg = `Limit Order Placed: ${tradeSide.toUpperCase()} ${amt} ${selectedPair.base} @ $${formatPrice(px)}`;
    } else if (orderType === 'stop_loss') {
      successMsg = `Stop Loss Armed: Trigger @ $${formatPrice(triggerPx)} → Market ${tradeSide.toUpperCase()} ${amt} ${selectedPair.base}`;
    } else {
      successMsg = `Stop Limit Armed: Trigger @ $${formatPrice(triggerPx)} → Limit Order @ $${formatPrice(px)}`;
    }

    setOrderNotification({ type: 'success', text: successMsg });
    setIsSubmitting(false);

    setTimeout(() => {
      setOrderNotification(null);
    }, 5500);
  };

  // Cancel order with balance refund
  const handleCancelOrder = (orderId: string) => {
    const targetOrder = openOrders.find(o => o.id === orderId);
    if (!targetOrder) return;

    // Refund reserved balance if it was open or trigger_pending
    if (targetOrder.status === 'open' || targetOrder.status === 'trigger_pending') {
      if (updateTokenBalance) {
        if (targetOrder.side === 'buy') {
          updateTokenBalance(targetOrder.quote, targetOrder.totalCostQuote);
        } else {
          updateTokenBalance(targetOrder.base, targetOrder.amount);
        }
      }
    }

    const updated = openOrders.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o);
    setOpenOrders(updated);
    try {
      localStorage.setItem('tradex_user_open_orders', JSON.stringify(updated));
    } catch {}

    setOrderNotification({ type: 'info', text: `Order ${orderId.slice(0, 8)} cancelled. Reserved funds returned to wallet.` });
    setTimeout(() => setOrderNotification(null), 3500);
  };

  // Cancel all active orders
  const handleCancelAllOrders = () => {
    let refundCount = 0;
    openOrders.forEach(o => {
      if (o.status === 'open' || o.status === 'trigger_pending') {
        refundCount++;
        if (updateTokenBalance) {
          if (o.side === 'buy') {
            updateTokenBalance(o.quote, o.totalCostQuote);
          } else {
            updateTokenBalance(o.base, o.amount);
          }
        }
      }
    });

    const updated = openOrders.map(o => (o.status === 'open' || o.status === 'trigger_pending') ? { ...o, status: 'cancelled' as const } : o);
    setOpenOrders(updated);
    try {
      localStorage.setItem('tradex_user_open_orders', JSON.stringify(updated));
    } catch {}

    setOrderNotification({ type: 'info', text: `Cancelled ${refundCount} orders. All reserved funds refunded.` });
    setTimeout(() => setOrderNotification(null), 3500);
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
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
                <span>24/7 LIVE</span>
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
                placeholder="Search across 22,357,399 multi-chain markets (A8, LMWR, BSV, SOL, RON, ETH...)"
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

            {/* Quick Trending Market Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 text-[11px] font-mono shrink-0">
              <span className="text-[10px] text-[#666] uppercase font-bold shrink-0">Hot:</span>
              {['A8/USDT', 'LMWR/USDT', 'ORAH/USDT', 'AURA/USDT', 'BSV/USDT', 'RON/USDT', 'SOL/USDT', 'ETH/USDT', 'A8/RON', 'LMWR/ETH'].map(sym => (
                <button
                  key={sym}
                  onClick={() => {
                    const p = tradeMarketsService.getPairBySymbol(sym);
                    if (p) handleSelectPair(p);
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedPair.symbol === sym
                      ? 'bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50'
                      : 'bg-[#151515] hover:bg-[#222] text-[#AAA] hover:text-white border-[#242424]'
                  }`}
                >
                  {sym}
                </button>
              ))}
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
                <div className="py-10 text-center text-[#666] space-y-3">
                  <div className="text-3xl">🔍</div>
                  <div className="text-white font-bold text-sm">No standard pairs matching "{modalSearchQuery}"</div>
                  <div className="text-xs text-[#666] max-w-sm mx-auto">
                    Create and open a custom 22M+ market for this coin immediately against USDT, USDC, BSV, ETH, SOL, or RON.
                  </div>
                  {modalSearchQuery && (
                    <button
                      onClick={() => {
                        const targetQuote = modalQuoteFilter !== 'ALL' ? modalQuoteFilter : 'USDT';
                        const pair = tradeMarketsService.createCustomTradePair(modalSearchQuery, targetQuote);
                        if (pair) {
                          handleSelectPair(pair);
                        } else {
                          const fallback = tradeMarketsService.getPairBySymbol(modalSearchQuery);
                          if (fallback) handleSelectPair(fallback);
                        }
                      }}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#00FF41] hover:bg-[#00D836] text-black font-bold text-xs transition-colors"
                    >
                      <span>Trade {modalSearchQuery.toUpperCase()}/{modalQuoteFilter !== 'ALL' ? modalQuoteFilter : 'USDT'} Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
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
            {/* Large Hero Price Section (Matching Screenshot 1) */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 pb-2 border-b border-[#141414]">
              <div>
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    {selectedPair.priceFormatted}
                  </span>
                  <span className={`text-base sm:text-xl font-bold font-mono ${selectedPair.change24h >= 0 ? 'text-[#00FF41]' : 'text-red-500'}`}>
                    {selectedPair.change24h >= 0 ? `+${selectedPair.change24h}%` : `${selectedPair.change24h}%`}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-[#777] mt-1 font-mono">
                  <span>≈${selectedPair.priceFormatted}</span>
                  <span>₿ {(selectedPair.price / 77700).toFixed(8)}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#181818] border border-[#282828] text-[#AAA] text-[10px] flex items-center space-x-1 cursor-pointer">
                    <span>native</span>
                    <span className="text-[9px]">▼</span>
                  </span>
                </div>
              </div>

              {/* 24h Stats Columns from Screenshot 1 */}
              <div className="flex items-center space-x-5 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-[#666] uppercase">24h High</div>
                  <div className="text-white font-bold">{selectedPair.high24h}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#666] uppercase">24h Low</div>
                  <div className="text-white font-bold">{selectedPair.low24h}</div>
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
                    Order Book
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

                {/* Security Non-Custodial Notice from Screenshot 1 */}
                <div className="px-3 py-2 bg-[#0C0C0C] border-b border-[#141414] text-[11px] text-[#777] flex items-center space-x-1.5 font-mono">
                  <span className="text-[#00FF41]">ℹ</span>
                  <span>Non-custodial — funds stay in your wallet until on-chain settlement</span>
                </div>

                {/* ORDER BOOK VIEW */}
                {activeBottomTab === 'orderbook' && (
                  <div className="p-3">
                    {/* Header */}
                    <div className="grid grid-cols-4 text-[10px] uppercase text-[#666] pb-2 border-b border-[#141414] font-mono font-bold">
                      <div>AMOUNT</div>
                      <div className="text-right text-[#00FF41]">BID</div>
                      <div className="text-left pl-3 text-red-500">ASK</div>
                      <div className="text-right">AMOUNT</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-[#101010] text-xs py-1">
                      {orderbook.map((row, idx) => (
                        <div 
                          key={idx} 
                          className="grid grid-cols-4 py-1 relative items-center hover:bg-[#151515] transition-colors cursor-pointer group"
                          onClick={() => {
                            setPriceInput(tradeSide === 'buy' ? row.askPrice.toString() : row.bidPrice.toString());
                          }}
                          title="Click to copy price to trade form"
                        >
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
                          <div className="text-[#888] font-mono z-10 group-hover:text-white transition-colors">
                            {row.bidAmount.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                          </div>

                          {/* Bid Price */}
                          <div className="text-right font-bold text-[#00FF41] font-mono z-10 group-hover:underline">
                            {formatPrice(row.bidPrice)}
                          </div>

                          {/* Ask Price */}
                          <div className="text-left pl-3 font-bold text-red-500 font-mono z-10 group-hover:underline">
                            {formatPrice(row.askPrice)}
                          </div>

                          {/* Ask Amount */}
                          <div className="text-right text-[#888] font-mono z-10 group-hover:text-white transition-colors">
                            {row.askAmount.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                          </div>

                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#141414] text-[10px] text-[#555] flex justify-between items-center">
                      <span>Tip: Click any price row in the book to instantly set your order price.</span>
                      <span className="text-[#00FF41] font-mono font-bold">Spread: {(selectedPair.price * 0.0004).toFixed(selectedPair.price < 1 ? 6 : 2)} {selectedPair.quote}</span>
                    </div>
                  </div>
                )}

                {/* RECENT TRADES VIEW */}
                {activeBottomTab === 'trades' && (
                  <div className="p-3">
                    {recentTrades.length === 0 ? (
                      <div className="py-12 text-center text-[#666] font-mono text-xs">
                        No executed trades recorded yet. Place a buy or sell order to trade 24/7.
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                )}

                {/* MY ORDERS VIEW */}
                {activeBottomTab === 'orders' && (
                  <div className="p-3 space-y-3">
                    {/* Sub-tabs header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#181818] pb-2">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setOrderSubTab('all')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            orderSubTab === 'all'
                              ? 'bg-[#1E1E1E] text-white border border-[#333]'
                              : 'text-[#777] hover:text-white'
                          }`}
                        >
                          All ({openOrders.length})
                        </button>
                        <button
                          onClick={() => setOrderSubTab('open_limit')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            orderSubTab === 'open_limit'
                              ? 'bg-[#1E1E1E] text-white border border-[#333]'
                              : 'text-[#777] hover:text-white'
                          }`}
                        >
                          Open Limit ({openOrders.filter(o => o.status === 'open').length})
                        </button>
                        <button
                          onClick={() => setOrderSubTab('stop_orders')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            orderSubTab === 'stop_orders'
                              ? 'bg-[#1E1E1E] text-white border border-[#333]'
                              : 'text-[#777] hover:text-white'
                          }`}
                        >
                          Stop Orders ({openOrders.filter(o => o.status === 'trigger_pending').length})
                        </button>
                        <button
                          onClick={() => setOrderSubTab('history')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            orderSubTab === 'history'
                              ? 'bg-[#1E1E1E] text-white border border-[#333]'
                              : 'text-[#777] hover:text-white'
                          }`}
                        >
                          History ({openOrders.filter(o => o.status === 'filled' || o.status === 'cancelled').length})
                        </button>
                      </div>

                      {openOrders.some(o => o.status === 'open' || o.status === 'trigger_pending') && (
                        <button
                          onClick={handleCancelAllOrders}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold transition-colors"
                        >
                          Cancel All Active
                        </button>
                      )}
                    </div>

                    {/* Orders List */}
                    {openOrders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#666] space-y-2">
                        <div className="text-2xl">📋</div>
                        <div>No open orders found.</div>
                        <div className="text-[10px] text-[#555]">Submit a Limit, Market, or Stop Loss order on the right panel.</div>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-7 text-[10px] uppercase text-[#666] pb-2 border-b border-[#141414]">
                          <div>PAIR / TIME</div>
                          <div>TYPE / SIDE</div>
                          <div className="text-right">TRIGGER</div>
                          <div className="text-right">PRICE</div>
                          <div className="text-right">AMOUNT</div>
                          <div className="text-center">STATUS</div>
                          <div className="text-right">ACTION</div>
                        </div>
                        <div className="divide-y divide-[#121212] text-xs py-1">
                          {openOrders
                            .filter(ord => {
                              if (orderSubTab === 'open_limit') return ord.status === 'open';
                              if (orderSubTab === 'stop_orders') return ord.status === 'trigger_pending';
                              if (orderSubTab === 'history') return ord.status === 'filled' || ord.status === 'cancelled';
                              return true;
                            })
                            .map((ord) => (
                              <div key={ord.id} className="grid grid-cols-7 py-2 items-center hover:bg-[#111] px-1 rounded">
                                <div>
                                  <div className="text-white font-bold">{ord.pairSymbol}</div>
                                  <div className="text-[10px] text-[#666]">{ord.timestamp}</div>
                                </div>
                                <div>
                                  <span className={`font-bold uppercase ${ord.side === 'buy' ? 'text-[#00FF41]' : 'text-red-500'}`}>
                                    {ord.side}
                                  </span>{' '}
                                  <span className="text-[10px] text-[#777] uppercase block">
                                    {ord.type.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-right font-mono text-amber-400">
                                  {ord.triggerPrice ? `$${formatPrice(ord.triggerPrice)}` : '—'}
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
                                      : ord.status === 'trigger_pending'
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                                      : ord.status === 'open'
                                      ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                                      : 'bg-[#222] text-[#666] border border-[#333]'
                                  }`}>
                                    {ord.status === 'trigger_pending' ? 'Armed' : ord.status}
                                  </span>
                                </div>
                                <div className="text-right">
                                  {(ord.status === 'open' || ord.status === 'trigger_pending') ? (
                                    <button
                                      onClick={() => handleCancelOrder(ord.id)}
                                      className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-[#555] capitalize">{ord.status}</span>
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
                      className={`py-2 rounded-md font-black uppercase text-xs transition-all ${
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
                      className={`py-2 rounded-md font-black uppercase text-xs transition-all ${
                        tradeSide === 'sell'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'text-[#888] hover:text-white'
                      }`}
                    >
                      Sell {selectedPair.base}
                    </button>
                  </div>

                  {/* Order Type Selector */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#121212] rounded-lg text-center">
                    {[
                      { id: 'limit', label: 'Limit' },
                      { id: 'market', label: 'Market' },
                      { id: 'stop_loss', label: 'Stop Loss' },
                      { id: 'stop_limit', label: 'Stop Limit' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setOrderType(type.id as any)}
                        className={`py-1.5 rounded text-[11px] font-bold transition-all ${
                          orderType === type.id
                            ? 'bg-[#222] text-white shadow-sm border border-[#333]'
                            : 'text-[#777] hover:text-white'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Available Balance Row with 1-Click Faucet */}
                  <div className="flex items-center justify-between text-[11px] bg-[#101010] p-2 rounded-lg border border-[#1C1C1C]">
                    <div className="text-[#888]">
                      Avail:{' '}
                      <strong className="text-white font-mono">
                        {tradeSide === 'buy'
                          ? `${availableQuote.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${selectedPair.quote}`
                          : `${availableBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${selectedPair.base}`}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        refreshBalance();
                        setOrderNotification({
                          type: 'success',
                          text: 'Live on-chain wallet balances refreshed!'
                        });
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#181818] text-[#888] hover:text-[#00FF41] border border-[#282828] hover:border-[#00FF41]/40 transition-colors flex items-center space-x-1"
                      title="Sync live balances"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sync</span>
                    </button>
                  </div>

                  {/* Trigger Stop Price Field (For Stop Loss / Stop Limit) */}
                  {(orderType === 'stop_loss' || orderType === 'stop_limit') && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-[#888] uppercase">
                        <span>Trigger Stop Price ({selectedPair.quote})</span>
                        <span className="text-amber-400 font-mono">
                          {tradeSide === 'sell' ? 'Trigger on Drop ≤' : 'Trigger on Rise ≥'}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        placeholder={selectedPair.price.toString()}
                        value={stopPriceInput}
                        onChange={(e) => setStopPriceInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#121212] border border-amber-500/40 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                      <div className="text-[10px] text-[#666]">
                        {orderType === 'stop_loss'
                          ? 'Order executes as Market fill once trigger price is touched.'
                          : 'Order places Limit order into book once trigger price is touched.'}
                      </div>
                    </div>
                  )}

                  {/* Price Field (Not needed for pure Market orders) */}
                  {orderType !== 'market' && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-[#888] uppercase">
                        <span>Price ({selectedPair.quote})</span>
                        <button
                          type="button"
                          onClick={() => setPriceInput(selectedPair.price.toString())}
                          className="text-[#00FF41] hover:underline"
                        >
                          Market Price
                        </button>
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#222] rounded-lg text-white font-mono focus:outline-none focus:border-[#00FF41]"
                      />
                    </div>
                  )}

                  {/* Amount Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-[#888] uppercase">Amount ({selectedPair.base})</label>
                    <input
                      type="number"
                      step="any"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full px-3 py-2 bg-[#121212] border border-[#222] rounded-lg text-white font-mono focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  {/* Quick % Buttons calculated against actual available balance */}
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handlePercentClick(pct)}
                        className="py-1 bg-[#121212] hover:bg-[#1C1C1C] border border-[#222] rounded font-bold text-[#888] hover:text-white transition-colors"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  {/* TP / SL Bracket Collapsible Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setAttachTpSl(!attachTpSl)}
                      className="flex items-center space-x-1.5 text-[11px] text-[#888] hover:text-white font-bold transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={attachTpSl}
                        onChange={() => {}}
                        className="rounded bg-[#1A1A1A] border-[#333] text-[#00FF41] focus:ring-0"
                      />
                      <span>Attach Take Profit / Stop Loss</span>
                    </button>

                    {attachTpSl && (
                      <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-[#101010] rounded-lg border border-[#1A1A1A]">
                        <div>
                          <label className="block text-[9px] text-[#00FF41] uppercase font-bold mb-0.5">TP Price</label>
                          <input
                            type="number"
                            step="any"
                            value={takeProfitInput}
                            onChange={(e) => setTakeProfitInput(e.target.value)}
                            placeholder="Target"
                            className="w-full px-2 py-1 bg-[#161616] border border-[#2A2A2A] rounded text-white font-mono text-xs focus:outline-none focus:border-[#00FF41]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-red-400 uppercase font-bold mb-0.5">SL Price</label>
                          <input
                            type="number"
                            step="any"
                            value={stopLossInput}
                            onChange={(e) => setStopLossInput(e.target.value)}
                            placeholder="Stop"
                            className="w-full px-2 py-1 bg-[#161616] border border-[#2A2A2A] rounded text-white font-mono text-xs focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total Order Cost Summary */}
                  <div className="p-2.5 bg-[#0D0D0D] rounded-lg border border-[#181818] space-y-1 text-[11px] text-[#777]">
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="text-white font-mono font-bold">
                        {((parseFloat(priceInput) || selectedPair.price) * (parseFloat(amountInput) || 0)).toFixed(selectedPair.price < 1 ? 4 : 2)} {selectedPair.quote}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Protocol Fee:</span>
                      <span className="text-[#00FF41] font-mono">0.01% (VIP Zero Slippage)</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Settlement Channel:</span>
                      <span className="text-amber-400 font-bold">{selectedPair.network}</span>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-lg font-black uppercase text-xs tracking-wider shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5 ${
                      tradeSide === 'buy'
                        ? 'bg-[#00FF41] hover:bg-[#00D436] text-black font-black'
                        : 'bg-red-500 hover:bg-red-600 text-white font-black'
                    }`}
                  >
                    <span>
                      {isConnected 
                        ? `${tradeSide.toUpperCase()} ${selectedPair.base} (${orderType.replace('_', ' ').toUpperCase()})`
                        : 'Connect Wallet to Trade'}
                    </span>
                  </button>

                </form>

                {orderNotification && (
                  <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center space-x-1.5 animate-in fade-in duration-200 border ${
                    orderNotification.type === 'success'
                      ? 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]'
                      : orderNotification.type === 'warn'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}>
                    {orderNotification.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{orderNotification.text}</span>
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
