import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { perpService, PERP_MARKETS } from '../services/perpService';
import { PerpMarket, PerpPosition, OrderBookLevel, RecentTrade } from '../types/dex';
import { AdvancedTradingChart } from './AdvancedTradingChart';
import { CoinLogo } from './CoinLogo';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Sliders,
  Shield,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Bot,
  RefreshCw,
  ChevronDown,
  DollarSign,
  BarChart2,
  Lock,
  Layers,
  Crosshair
} from 'lucide-react';

export const PerpTerminal: React.FC = () => {
  const { account, isConnected, openWalletModal } = useWallet();

  const [markets, setMarkets] = useState<PerpMarket[]>(PERP_MARKETS);
  const [selectedMarket, setSelectedMarket] = useState<PerpMarket>(PERP_MARKETS[0]);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [leverage, setLeverage] = useState<number>(10);
  const [marginMode, setMarginMode] = useState<'isolated' | 'cross'>('isolated');
  const [marginInput, setMarginInput] = useState<string>('200');
  const [limitPriceInput, setLimitPriceInput] = useState<string>('');
  const [takeProfitInput, setTakeProfitInput] = useState<string>('');
  const [stopLossInput, setStopLossInput] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1D'>('15m');
  
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookLevel[]; asks: OrderBookLevel[]; spread: number }>({
    bids: [],
    asks: [],
    spread: 0.01
  });
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [positions, setPositions] = useState<PerpPosition[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [layoutMode, setLayoutMode] = useState<'standard' | 'fullchart'>('standard');

  // Chart simulation bars
  const [chartBars, setChartBars] = useState<{ time: string; open: number; high: number; low: number; close: number; vol: number }[]>([]);

  // Update Limit Price when market changes
  useEffect(() => {
    setLimitPriceInput(selectedMarket.price.toString());
  }, [selectedMarket]);

  // Periodic orderbook & trade ticks
  useEffect(() => {
    const refreshData = () => {
      setOrderBook(perpService.generateOrderBook(selectedMarket.symbol));
      setRecentTrades(perpService.getRecentTrades(selectedMarket.symbol));
      setPositions(perpService.getPositions());
    };

    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [selectedMarket]);

  // Generate synthetic candlestick chart data
  useEffect(() => {
    const base = selectedMarket.price;
    const bars = [];
    const count = 30;
    let cur = base * 0.94;

    for (let i = 0; i < count; i++) {
      const delta = (Math.random() - 0.47) * (base * 0.015);
      const open = cur;
      const close = cur + delta;
      const high = Math.max(open, close) + Math.random() * (base * 0.008);
      const low = Math.min(open, close) - Math.random() * (base * 0.008);
      const vol = Math.floor(Math.random() * 50000 + 10000);
      cur = close;
      bars.push({
        time: `${i * 2}m`,
        open,
        high,
        low,
        close,
        vol
      });
    }
    // ensure last close equals market price
    bars[bars.length - 1].close = selectedMarket.price;
    setChartBars(bars);
  }, [selectedMarket, timeframe]);

  // Calculations
  const marginNum = parseFloat(marginInput) || 0;
  const positionSizeUsd = marginNum * leverage;
  const positionTokens = selectedMarket.price > 0 ? (positionSizeUsd / selectedMarket.price) : 0;
  
  const liqOffset = (selectedMarket.price / leverage) * 0.92;
  const estLiqPrice = side === 'LONG' 
    ? Math.max(0.01, selectedMarket.price - liqOffset)
    : (selectedMarket.price + liqOffset);

  const handleOpenPosition = () => {
    if (!isConnected) {
      openWalletModal();
      return;
    }
    if (marginNum <= 0) {
      alert('Please enter a valid margin amount.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      perpService.openPosition({
        market: selectedMarket.symbol,
        side,
        marginUsd: marginNum,
        leverage,
        marginType: marginMode,
        takeProfitPrice: parseFloat(takeProfitInput) || undefined,
        stopLossPrice: parseFloat(stopLossInput) || undefined
      });

      setPositions(perpService.getPositions());
      setIsSubmitting(false);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 400);
  };

  const handleClosePosition = (posId: string) => {
    perpService.closePosition(posId);
    setPositions(perpService.getPositions());
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-4 font-mono text-[#E0E0E0]">
      
      {/* TOP MARKET HEADER BAR (OraDex / Drift Style) */}
      <div className="mb-3 p-3 rounded-sm bg-[#0A0A0A] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        {/* Market Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <CoinLogo symbol={selectedMarket.symbol.split('-')[0]} size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedMarket.symbol}
                  onChange={(e) => {
                    const m = markets.find(x => x.symbol === e.target.value);
                    if (m) setSelectedMarket(m);
                  }}
                  className="bg-transparent text-lg font-black text-white font-mono focus:outline-none cursor-pointer"
                >
                  {markets.map((m, idx) => (
                    <option key={`perp_opt_${m.symbol}_${idx}`} value={m.symbol} className="bg-[#111] text-white">
                      {m.symbol} • {m.maxLeverage}x
                    </option>
                  ))}
                </select>
                <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
                  <span>24/7 TRADING ACTIVE</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-[#1A1A1A] text-[#AAA] border border-[#333]">
                  ON-CHAIN SETTLE
                </span>
              </div>
              <div className="text-[10px] text-[#777] font-mono">Tradex (tradex.com) Decentralized Perpetual Protocol</div>
            </div>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
          <div>
            <div className="text-[10px] text-[#666] uppercase font-bold">Mark Price</div>
            <div className="text-base font-black text-white">
              ${selectedMarket.price.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.price < 5 ? 3 : 2 })}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#666] uppercase font-bold">24h Change</div>
            <div className={`text-sm font-bold flex items-center space-x-1 ${selectedMarket.change24h >= 0 ? 'text-[#00FF41]' : 'text-rose-400'}`}>
              {selectedMarket.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{selectedMarket.change24h >= 0 ? '+' : ''}{selectedMarket.change24h}%</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#666] uppercase font-bold">24h High / Low</div>
            <div className="text-xs text-[#AAA]">
              ${selectedMarket.high24h} / ${selectedMarket.low24h}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#666] uppercase font-bold">24h Volume</div>
            <div className="text-xs text-white font-bold">
              ${(selectedMarket.volume24hUsd / 1000000).toFixed(1)}M USD
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#666] uppercase font-bold">Funding (1h)</div>
            <div className="text-xs text-[#00FF41] font-bold">
              +{(selectedMarket.fundingRate * 100).toFixed(3)}% in <span className="text-white">{selectedMarket.nextFundingCountdown}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#666] uppercase font-bold">Open Interest</div>
            <div className="text-xs text-white">
              ${(selectedMarket.openInterestUsd / 1000000).toFixed(1)}M
            </div>
          </div>

          {/* Chart Layout View Switcher */}
          <div className="flex items-center space-x-1 bg-[#141414] p-1 rounded-lg border border-[#262626]">
            <button
              onClick={() => setLayoutMode('standard')}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                layoutMode === 'standard' ? 'bg-[#222] text-[#00FF41]' : 'text-[#777] hover:text-white'
              }`}
              title="Split 3-Column Terminal"
            >
              Split View
            </button>
            <button
              onClick={() => setLayoutMode('fullchart')}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                layoutMode === 'fullchart' ? 'bg-[#222] text-[#00FF41]' : 'text-[#777] hover:text-white'
              }`}
              title="Full-Width Uninterrupted Chart"
            >
              Full Width Chart
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TRADING GRID (Dynamically switches between standard split and full-width chart mode) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* CHART & POSITIONS */}
        <div className={`${layoutMode === 'fullchart' ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-3 min-w-0`}>
          
          {/* Advanced Interactive Candlestick & Technical Chart */}
          <AdvancedTradingChart
            symbol={selectedMarket.symbol}
            currentPrice={selectedMarket.price}
            priceChange24h={selectedMarket.change24h}
            high24h={selectedMarket.high24h}
            low24h={selectedMarket.low24h}
            volume24h={`${(selectedMarket.volume24hUsd / 1000000).toFixed(1)}M`}
          />

          {/* POSITIONS & ORDERS ACCORDION PANEL */}
          <div className="rounded-sm bg-[#0A0A0A] border border-[#222] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222] mb-3">
              <div className="flex items-center space-x-4 text-xs font-bold font-mono">
                <button
                  onClick={() => setActiveTab('positions')}
                  className={`pb-1 uppercase tracking-wider transition-colors ${
                    activeTab === 'positions' ? 'text-[#00FF41] border-b-2 border-[#00FF41]' : 'text-[#777] hover:text-white'
                  }`}
                >
                  Active Positions ({positions.length})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-1 uppercase tracking-wider transition-colors ${
                    activeTab === 'orders' ? 'text-[#00FF41] border-b-2 border-[#00FF41]' : 'text-[#777] hover:text-white'
                  }`}
                >
                  Open Orders (0)
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-1 uppercase tracking-wider transition-colors ${
                    activeTab === 'history' ? 'text-[#00FF41] border-b-2 border-[#00FF41]' : 'text-[#777] hover:text-white'
                  }`}
                >
                  Trade Log
                </button>
              </div>

              <div className="text-[10px] text-[#666]">
                Non-Custodial Multi-Chain Liquidity
              </div>
            </div>

            {/* Positions Table */}
            {activeTab === 'positions' && (
              <div className="overflow-x-auto">
                {positions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#555] font-mono">
                    No active perpetual positions open. Open a Long or Short position above.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-[#666] border-b border-[#1c1c1c] text-[10px] uppercase">
                        <th className="py-2">Market / Side</th>
                        <th className="py-2">Size (USD)</th>
                        <th className="py-2">Entry / Mark</th>
                        <th className="py-2">Est. Liq Price</th>
                        <th className="py-2">Margin</th>
                        <th className="py-2">PnL (ROE %)</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181818]">
                      {positions.map((pos) => {
                        const isLong = pos.side === 'LONG';
                        const currentMark = selectedMarket.symbol === pos.market ? selectedMarket.price : pos.markPrice;
                        const pnl = isLong 
                          ? (currentMark - pos.entryPrice) * pos.sizeTokens 
                          : (pos.entryPrice - currentMark) * pos.sizeTokens;
                        const pnlPercent = (pnl / pos.marginUsd) * 100;

                        return (
                          <tr key={pos.id} className="hover:bg-[#111]/60 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center space-x-1.5">
                                <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-black ${
                                  isLong ? 'bg-[#00FF41]/20 text-[#00FF41]' : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {pos.side} {pos.leverage}x
                                </span>
                                <span className="font-bold text-white">{pos.market}</span>
                                {pos.autoAgentManaged && (
                                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded border border-purple-500/30 flex items-center space-x-0.5">
                                    <Bot className="w-2.5 h-2.5" />
                                    <span>AI</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 font-bold text-white">
                              ${pos.sizeUsd.toFixed(2)}
                              <div className="text-[10px] text-[#666]">{pos.sizeTokens} Tokens</div>
                            </td>

                            <td className="py-3 text-[#AAA]">
                              <div>${pos.entryPrice.toFixed(2)}</div>
                              <div className="text-[10px] text-[#00FF41]">${currentMark.toFixed(2)}</div>
                            </td>

                            <td className="py-3 text-amber-400 font-bold">
                              ${pos.liquidationPrice.toFixed(2)}
                            </td>

                            <td className="py-3 text-white">
                              ${pos.marginUsd.toFixed(2)}
                              <span className="text-[9px] text-[#555] uppercase ml-1">({pos.marginType})</span>
                            </td>

                            <td className="py-3 font-bold">
                              <div className={pnl >= 0 ? 'text-[#00FF41]' : 'text-rose-400'}>
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                              </div>
                              <div className={`text-[10px] ${pnlPercent >= 0 ? 'text-[#00FF41]' : 'text-rose-400'}`}>
                                ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                              </div>
                            </td>

                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleClosePosition(pos.id)}
                                className="px-2.5 py-1 rounded-sm bg-[#1A1A1A] hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40 border border-[#333] text-[10px] font-bold uppercase transition-all"
                              >
                                Market Close
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="py-8 text-center text-xs text-[#555]">
                No pending limit orders on the book.
              </div>
            )}

            {activeTab === 'history' && (
              <div className="py-4 space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-sm bg-[#111] border border-[#222] flex justify-between">
                  <span>BSV-PERP • LONG 20x Closed</span>
                  <span className="text-[#00FF41] font-bold">+$124.50 USD</span>
                </div>
                <div className="p-2.5 rounded-sm bg-[#111] border border-[#222] flex justify-between">
                  <span>SOL-PERP • SHORT 10x Closed</span>
                  <span className="text-[#00FF41] font-bold">+$82.10 USD</span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* MIDDLE: ORDERBOOK & RECENT TRADES */}
        <div className={`${layoutMode === 'fullchart' ? 'lg:col-span-5' : 'lg:col-span-2'} space-y-3`}>
          
          {/* ORDERBOOK */}
          <div className="rounded-sm bg-[#0A0A0A] border border-[#222] p-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#222] mb-2 text-xs font-bold uppercase">
              <span className="text-white">Order Book</span>
              <span className="text-[10px] text-[#666]">Spread: {orderBook.spread}</span>
            </div>

            {/* Asks (Red) */}
            <div className="space-y-0.5 text-[10px] font-mono">
              {orderBook.asks.slice(0, 6).map((ask, idx) => (
                <div
                  key={'ask_' + idx}
                  onClick={() => setLimitPriceInput(ask.price.toString())}
                  className="relative flex justify-between items-center py-0.5 px-1 hover:bg-[#1a1a1a] cursor-pointer"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none"
                    style={{ width: `${Math.min(100, (ask.size / 60) * 100)}%` }}
                  ></div>
                  <span className="text-rose-400 font-bold z-10">${ask.price.toFixed(selectedMarket.price < 5 ? 3 : 2)}</span>
                  <span className="text-[#777] z-10">{ask.size.toFixed(1)}</span>
                </div>
              ))}
            </div>

            {/* Mid Price Banner */}
            <div className="my-2 py-1 px-2 rounded-sm bg-[#121212] border border-[#252525] flex justify-between items-center text-xs font-mono">
              <span className="text-white font-black">${selectedMarket.price.toFixed(selectedMarket.price < 5 ? 3 : 2)}</span>
              <span className="text-[10px] text-[#00FF41]">● Mark</span>
            </div>

            {/* Bids (Green) */}
            <div className="space-y-0.5 text-[10px] font-mono">
              {orderBook.bids.slice(0, 6).map((bid, idx) => (
                <div
                  key={'bid_' + idx}
                  onClick={() => setLimitPriceInput(bid.price.toString())}
                  className="relative flex justify-between items-center py-0.5 px-1 hover:bg-[#1a1a1a] cursor-pointer"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#00FF41]/10 pointer-events-none"
                    style={{ width: `${Math.min(100, (bid.size / 60) * 100)}%` }}
                  ></div>
                  <span className="text-[#00FF41] font-bold z-10">${bid.price.toFixed(selectedMarket.price < 5 ? 3 : 2)}</span>
                  <span className="text-[#777] z-10">{bid.size.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT TRADES TAPE */}
          <div className="rounded-sm bg-[#0A0A0A] border border-[#222] p-3">
            <div className="pb-2 border-b border-[#222] mb-2 text-xs font-bold uppercase text-white">
              Recent Trades
            </div>
            <div className="space-y-1 text-[10px] font-mono max-h-48 overflow-y-auto">
              {recentTrades.length === 0 ? (
                <div className="py-6 text-center text-[#555] font-mono text-[11px]">
                  No executed perp trades recorded yet. Open a long or short position to trade 24/7.
                </div>
              ) : (
                recentTrades.slice(0, 8).map((tr) => (
                  <div key={tr.id} className="flex justify-between items-center text-[#777]">
                    <span className={tr.side === 'buy' ? 'text-[#00FF41] font-bold' : 'text-rose-400 font-bold'}>
                      ${tr.price.toFixed(selectedMarket.price < 5 ? 3 : 2)}
                    </span>
                    <span className="text-white">{tr.size}</span>
                    <span className="text-[#555]">{tr.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT: ORDER EXECUTION ENTRY PANEL */}
        <div className={`${layoutMode === 'fullchart' ? 'lg:col-span-7' : 'lg:col-span-3'} space-y-3`}>
          
          <div className="rounded-sm bg-[#0A0A0A] border border-[#222] p-5 shadow-2xl space-y-4">
            
            {/* Long / Short Switch */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-sm bg-[#111] border border-[#222]">
              <button
                id="perp-tab-long"
                onClick={() => setSide('LONG')}
                className={`py-2 rounded-sm text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1 ${
                  side === 'LONG'
                    ? 'bg-[#00FF41] text-black shadow-lg shadow-[#00FF41]/20'
                    : 'text-[#777] hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Buy / Long</span>
              </button>

              <button
                id="perp-tab-short"
                onClick={() => setSide('SHORT')}
                className={`py-2 rounded-sm text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1 ${
                  side === 'SHORT'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-[#777] hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Sell / Short</span>
              </button>
            </div>

            {/* Market / Limit & Margin Mode */}
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-1 bg-[#111] p-0.5 rounded-sm border border-[#222]">
                <button
                  onClick={() => setOrderType('market')}
                  className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase ${
                    orderType === 'market' ? 'bg-white text-black font-black' : 'text-[#777]'
                  }`}
                >
                  Market
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase ${
                    orderType === 'limit' ? 'bg-white text-black font-black' : 'text-[#777]'
                  }`}
                >
                  Limit
                </button>
              </div>

              <div className="flex items-center space-x-1 bg-[#111] p-0.5 rounded-sm border border-[#222]">
                <button
                  onClick={() => setMarginMode('isolated')}
                  className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase ${
                    marginMode === 'isolated' ? 'bg-[#00FF41]/20 text-[#00FF41]' : 'text-[#777]'
                  }`}
                >
                  Isolated
                </button>
                <button
                  onClick={() => setMarginMode('cross')}
                  className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase ${
                    marginMode === 'cross' ? 'bg-[#00FF41]/20 text-[#00FF41]' : 'text-[#777]'
                  }`}
                >
                  Cross
                </button>
              </div>
            </div>

            {/* Limit Price Input if Limit selected */}
            {orderType === 'limit' && (
              <div>
                <div className="text-[10px] text-[#777] uppercase font-bold mb-1">Limit Price ($)</div>
                <input
                  type="number"
                  value={limitPriceInput}
                  onChange={(e) => setLimitPriceInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>
            )}

            {/* Leverage Slider Bar */}
            <div className="p-3 rounded-sm bg-[#111] border border-[#222] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#777] uppercase text-[10px] font-bold">Leverage</span>
                <span className="text-[#00FF41] font-black text-sm">{leverage}x</span>
              </div>
              
              <input
                type="range"
                min="1"
                max={selectedMarket.maxLeverage}
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full accent-[#00FF41] cursor-pointer"
              />

              <div className="flex justify-between text-[9px] text-[#666] font-mono">
                {[1, 5, 10, 20, 50].filter(l => l <= selectedMarket.maxLeverage).map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className={`px-1.5 py-0.5 rounded-sm border ${
                      leverage === lev ? 'bg-[#00FF41] text-black font-bold border-[#00FF41]' : 'border-[#333] text-[#777]'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Margin Amount Input */}
            <div>
              <div className="flex justify-between items-center text-[10px] text-[#777] uppercase font-bold mb-1">
                <span>Margin (USD)</span>
                <span>Max: $10,000</span>
              </div>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#555] absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={marginInput}
                  onChange={(e) => setMarginInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 bg-[#111] border border-[#333] rounded-sm text-sm font-mono text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>
              
              {/* Quick % chips */}
              <div className="grid grid-cols-4 gap-1 mt-1.5">
                {[50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setMarginInput(amt.toString())}
                    className="py-1 bg-[#141414] hover:bg-[#202020] border border-[#252525] rounded-sm text-[10px] font-mono text-[#AAA] transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* TP / SL Advanced Triggers */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-[#777] uppercase font-bold">Take Profit ($)</span>
                <input
                  type="number"
                  value={takeProfitInput}
                  onChange={(e) => setTakeProfitInput(e.target.value)}
                  placeholder={(selectedMarket.price * (side === 'LONG' ? 1.08 : 0.92)).toFixed(2)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[#111] border border-[#333] rounded-sm text-xs font-mono text-white focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[#777] uppercase font-bold">Stop Loss ($)</span>
                <input
                  type="number"
                  value={stopLossInput}
                  onChange={(e) => setStopLossInput(e.target.value)}
                  placeholder={(selectedMarket.price * (side === 'LONG' ? 0.95 : 1.05)).toFixed(2)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[#111] border border-[#333] rounded-sm text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Order Summary Specs */}
            <div className="p-3 rounded-sm bg-[#111] border border-[#222] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#777]">
                <span className="text-[10px] uppercase font-bold">Position Size</span>
                <span className="text-white font-bold">${positionSizeUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#777]">
                <span className="text-[10px] uppercase font-bold">Tokens</span>
                <span className="text-white font-bold">{positionTokens.toFixed(3)} {selectedMarket.baseAsset}</span>
              </div>
              <div className="flex justify-between text-[#777]">
                <span className="text-[10px] uppercase font-bold">Est. Liq Price</span>
                <span className="text-amber-400 font-bold">${estLiqPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#777]">
                <span className="text-[10px] uppercase font-bold">Execution Fee</span>
                <span className="text-[#00FF41] font-bold">0.02% (BSV Fast Relay)</span>
              </div>
            </div>

            {/* Order Execution Submit Button */}
            <button
              id="perp-execute-order-btn"
              onClick={handleOpenPosition}
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-sm font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center space-x-1.5 shadow-lg active:scale-98 ${
                side === 'LONG'
                  ? 'bg-[#00FF41] hover:bg-[#00D436] text-black shadow-[#00FF41]/20'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>
                {isSubmitting ? 'Routing...' : `${side} ${selectedMarket.symbol} (${leverage}x)`}
              </span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
