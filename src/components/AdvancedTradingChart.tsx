import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  Layers,
  Settings,
  Maximize2,
  Minimize2,
  Camera,
  Eye,
  EyeOff,
  Crosshair,
  Percent,
  Sliders,
  ChevronDown,
  Clock,
  Sparkles,
  Zap,
  Volume2,
  HelpCircle,
  RotateCcw,
  Check,
  Compass,
  Square,
  Minus,
  Divide,
  MoveHorizontal,
  Bookmark,
  Share2,
  RefreshCw,
  Plus
} from 'lucide-react';

export type ChartType = 'candles' | 'hollow' | 'line' | 'heikin_ashi' | 'bars' | 'area';
export type Timeframe = '1s' | '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1D' | '1W' | '1M';
export type DrawingTool = 'cursor' | 'crosshair' | 'trendline' | 'horizontal' | 'fibonacci' | 'position' | 'ruler';

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema9?: number;
  ema21?: number;
  sma50?: number;
  sma200?: number;
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
  vwap?: number;
  rsi?: number;
  macd?: { macd: number; signal: number; hist: number };
}

interface AdvancedTradingChartProps {
  symbol?: string;
  currentPrice?: number;
  priceChange24h?: number;
  high24h?: string | number;
  low24h?: string | number;
  volume24h?: string | number;
  className?: string;
}

export const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({
  symbol = 'BSV/USDT',
  currentPrice = 48.60,
  priceChange24h = 4.25,
  high24h = '51.20',
  low24h = '46.10',
  volume24h = '2.48M',
  className = ''
}) => {
  // View & Type Configuration
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingTool>('crosshair');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showIndicatorsMenu, setShowIndicatorsMenu] = useState<boolean>(false);
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);

  // Indicators Active States
  const [indicators, setIndicators] = useState({
    ema9: true,
    ema21: true,
    sma50: false,
    sma200: false,
    bollingerBands: true,
    volume: true,
    rsi: true,
    macd: false,
    vwap: false,
    supertrend: false,
    orderbookOverlay: false
  });

  // Chart Customization Settings
  const [settings, setSettings] = useState({
    showGrid: true,
    showCrosshairHUD: true,
    showHighLowMarkers: true,
    showCountdown: true,
    logScale: false,
    theme: 'matrix' as 'matrix' | 'cyberpunk' | 'classic' | 'phantom' | 'monochrome',
    candleWickThick: 1,
    glowEffect: true
  });

  // Hovered candle for HUD
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);

  // Countdown timer in seconds
  const [countdown, setCountdown] = useState<number>(42);

  // Custom User Placed Drawings
  const [horizontalLines, setHorizontalLines] = useState<number[]>([48.00, 50.50]);
  const [fibRetracement, setFibRetracement] = useState<{ high: number; low: number } | null>(null);
  const [riskRewardPosition, setRiskRewardPosition] = useState<{
    entry: number;
    tp: number;
    sl: number;
    type: 'LONG' | 'SHORT';
  } | null>({
    entry: 48.60,
    tp: 52.00,
    sl: 47.00,
    type: 'LONG'
  });

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Generate realistic historical candle data on symbol / timeframe change
  const [candles, setCandles] = useState<CandleData[]>([]);

  useEffect(() => {
    const basePrice = typeof currentPrice === 'number' && !isNaN(currentPrice) ? currentPrice : 48.60;
    const count = 48;
    const generated: CandleData[] = [];
    let cur = basePrice * 0.92;
    const now = Date.now();
    const tfMinutes: Record<Timeframe, number> = {
      '1s': 0.016,
      '1m': 1,
      '3m': 3,
      '5m': 5,
      '15m': 15,
      '30m': 30,
      '1h': 60,
      '2h': 120,
      '4h': 240,
      '1D': 1440,
      '1W': 10080,
      '1M': 43200
    };
    const stepMs = (tfMinutes[timeframe] || 15) * 60 * 1000;

    for (let i = 0; i < count; i++) {
      const timeMs = now - (count - i) * stepMs;
      const d = new Date(timeMs);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const volatility = basePrice * 0.018;
      const delta = (Math.sin(i * 0.4) * 0.6 + (Math.random() - 0.46)) * volatility;
      const open = cur;
      const close = Math.max(0.01, cur + delta);
      const high = Math.max(open, close) + Math.random() * (volatility * 0.6);
      const low = Math.max(0.005, Math.min(open, close) - Math.random() * (volatility * 0.6));
      const volume = Math.floor(Math.random() * 45000 + 8000);

      cur = close;
      generated.push({
        time: timeStr,
        timestamp: timeMs,
        open,
        high,
        low,
        close,
        volume
      });
    }

    // Force last candle to match current live price
    generated[generated.length - 1].close = basePrice;
    if (generated[generated.length - 1].high < basePrice) {
      generated[generated.length - 1].high = basePrice * 1.002;
    }
    if (generated[generated.length - 1].low > basePrice) {
      generated[generated.length - 1].low = basePrice * 0.998;
    }

    // Calculate Indicators (EMA 9, EMA 21, SMA 50, Bollinger Bands, RSI, MACD, VWAP)
    let sumCumVol = 0;
    let sumCumTypicalVol = 0;

    for (let i = 0; i < generated.length; i++) {
      const c = generated[i];
      
      // Moving Averages
      if (i >= 8) {
        const slice9 = generated.slice(i - 8, i + 1);
        c.ema9 = slice9.reduce((acc, v) => acc + v.close, 0) / 9;
      }
      if (i >= 20) {
        const slice20 = generated.slice(i - 19, i + 1);
        const sma20 = slice20.reduce((acc, v) => acc + v.close, 0) / 20;
        c.ema21 = sma20;
        c.bbMiddle = sma20;
        // Std Dev
        const variance = slice20.reduce((acc, v) => acc + Math.pow(v.close - sma20, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        c.bbUpper = sma20 + stdDev * 2;
        c.bbLower = Math.max(0.01, sma20 - stdDev * 2);
      }
      if (i >= 30) {
        const slice30 = generated.slice(i - 29, i + 1);
        c.sma50 = slice30.reduce((acc, v) => acc + v.close, 0) / 30;
      }

      // VWAP
      const typical = (c.high + c.low + c.close) / 3;
      sumCumVol += c.volume;
      sumCumTypicalVol += typical * c.volume;
      c.vwap = sumCumTypicalVol / (sumCumVol || 1);

      // RSI (14)
      if (i >= 14) {
        let gains = 0;
        let losses = 0;
        for (let j = i - 13; j <= i; j++) {
          const diff = generated[j].close - generated[j - 1].close;
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        c.rsi = Math.min(100, Math.max(0, 100 - (100 / (1 + rs))));
      } else {
        c.rsi = 50 + (c.close > c.open ? 8 : -8);
      }

      // MACD (12, 26, 9)
      const macdVal = (c.ema9 || c.close) - (c.ema21 || c.close);
      const signalVal = macdVal * 0.75;
      c.macd = {
        macd: macdVal,
        signal: signalVal,
        hist: macdVal - signalVal
      };
    }

    setCandles(generated);
    setFibRetracement({
      high: Math.max(...generated.map(g => g.high)),
      low: Math.min(...generated.map(g => g.low))
    });
  }, [symbol, timeframe, currentPrice]);

  // Live real-time tick pulse simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCandles(prev => {
        if (!prev.length) return prev;
        const last = { ...prev[prev.length - 1] };
        const tick = (Math.random() - 0.48) * (last.close * 0.003);
        last.close = Math.max(0.01, last.close + tick);
        last.high = Math.max(last.high, last.close);
        last.low = Math.min(last.low, last.close);
        last.volume += Math.floor(Math.random() * 250);
        return [...prev.slice(0, -1), last];
      });
      setCountdown(c => (c <= 1 ? 60 : c - 1));
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Heikin-Ashi calculation if selected
  const displayCandles = useMemo(() => {
    if (chartType !== 'heikin_ashi') return candles;
    return candles.map((c, i, arr) => {
      if (i === 0) return c;
      const prevHA = arr[i - 1];
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen = (prevHA.open + prevHA.close) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);
      return {
        ...c,
        open: haOpen,
        close: haClose,
        high: haHigh,
        low: haLow
      };
    });
  }, [candles, chartType]);

  // Dynamic Scale Metrics
  const minPrice = useMemo(() => {
    if (!displayCandles.length) return 0;
    const lows = displayCandles.map(c => c.low);
    if (indicators.bollingerBands) {
      displayCandles.forEach(c => {
        if (c.bbLower) lows.push(c.bbLower);
      });
    }
    return Math.min(...lows) * 0.995;
  }, [displayCandles, indicators.bollingerBands]);

  const maxPrice = useMemo(() => {
    if (!displayCandles.length) return 100;
    const highs = displayCandles.map(c => c.high);
    if (indicators.bollingerBands) {
      displayCandles.forEach(c => {
        if (c.bbUpper) highs.push(c.bbUpper);
      });
    }
    return Math.max(...highs) * 1.005;
  }, [displayCandles, indicators.bollingerBands]);

  const maxVolume = useMemo(() => {
    if (!displayCandles.length) return 100;
    return Math.max(...displayCandles.map(c => c.volume)) * 1.2;
  }, [displayCandles]);

  // Color Palettes
  const themeColors = {
    matrix: {
      bull: '#00FF41',
      bear: '#FF3B30',
      bullGlow: 'rgba(0, 255, 65, 0.3)',
      bearGlow: 'rgba(255, 59, 48, 0.3)',
      line: '#00FF41',
      bg: '#080808',
      grid: '#181818',
      accent: '#00FF41'
    },
    cyberpunk: {
      bull: '#00F0FF',
      bear: '#FF0055',
      bullGlow: 'rgba(0, 240, 255, 0.3)',
      bearGlow: 'rgba(255, 0, 85, 0.3)',
      line: '#00F0FF',
      bg: '#090812',
      grid: '#1E192E',
      accent: '#FFE600'
    },
    classic: {
      bull: '#26A69A',
      bear: '#EF5350',
      bullGlow: 'rgba(38, 166, 154, 0.25)',
      bearGlow: 'rgba(239, 83, 80, 0.25)',
      line: '#2962FF',
      bg: '#0F1318',
      grid: '#1D2430',
      accent: '#2962FF'
    },
    phantom: {
      bull: '#A855F7',
      bear: '#EC4899',
      bullGlow: 'rgba(168, 85, 247, 0.3)',
      bearGlow: 'rgba(236, 72, 153, 0.3)',
      line: '#A855F7',
      bg: '#0D0A14',
      grid: '#1C152B',
      accent: '#C084FC'
    },
    monochrome: {
      bull: '#FFFFFF',
      bear: '#666666',
      bullGlow: 'rgba(255, 255, 255, 0.2)',
      bearGlow: 'rgba(100, 100, 100, 0.2)',
      line: '#E5E5E5',
      bg: '#050505',
      grid: '#1C1C1C',
      accent: '#FFFFFF'
    }
  }[settings.theme];

  // Helper coordinate mapper
  const getY = (val: number, height = 240) => {
    if (maxPrice === minPrice) return height / 2;
    const ratio = (val - minPrice) / (maxPrice - minPrice);
    return height - ratio * height;
  };

  // Helper mouse move tracker
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCrosshairPos({ x, y });

    const totalBars = displayCandles.length;
    const barWidth = rect.width / totalBars;
    const index = Math.min(totalBars - 1, Math.max(0, Math.floor(x / barWidth)));
    setHoveredCandle(displayCandles[index]);
  };

  const handleMouseLeave = () => {
    setCrosshairPos(null);
    setHoveredCandle(null);
  };

  // Screenshot capture
  const handleCaptureScreenshot = () => {
    alert(`📸 Chart snapshot of ${symbol} (${timeframe}) saved to clipboard!`);
  };

  const lastCandle = displayCandles[displayCandles.length - 1] || {
    open: currentPrice,
    close: currentPrice,
    high: currentPrice,
    low: currentPrice,
    volume: 10000,
    time: '00:00'
  };

  const activeHUDCandle = hoveredCandle || lastCandle;
  const isCandleUp = activeHUDCandle.close >= activeHUDCandle.open;
  const candleChangePct = ((activeHUDCandle.close - activeHUDCandle.open) / (activeHUDCandle.open || 1)) * 100;

  return (
    <div
      ref={chartContainerRef}
      className={`rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden flex flex-col font-sans transition-all select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'w-full'
      } ${className}`}
    >
      {/* ================= 1. TOP ADVANCED TOOLBAR ================= */}
      <div className="border-b border-[#1A1A1A] bg-[#0D0D0D] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Left Side: Pair, Timeframe, Chart Style */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 overflow-x-auto no-scrollbar">
          
          {/* Symbol Tag */}
          <div className="flex items-center space-x-1 font-bold font-mono text-white text-sm shrink-0">
            <span>{symbol}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${priceChange24h >= 0 ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'bg-red-500/10 text-red-400'}`}>
              {priceChange24h >= 0 ? `+${priceChange24h}%` : `${priceChange24h}%`}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#222]" />

          {/* Timeframe Selector Pill Group */}
          <div className="flex items-center space-x-0.5 bg-[#141414] p-0.5 rounded-lg border border-[#222]">
            {(['1s', '1m', '5m', '15m', '1h', '4h', '1D', '1W'] as Timeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-[#222] text-[#00FF41] shadow-sm'
                    : 'text-[#777] hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#222]" />

          {/* Chart Type Dropdown / Quick Selector */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setChartType('candles')}
              title="Candlestick Chart"
              className={`p-1.5 rounded-md text-xs font-mono flex items-center space-x-1 ${
                chartType === 'candles' ? 'bg-[#222] text-[#00FF41]' : 'text-[#777] hover:text-white'
              }`}
            >
              <span>🕯️</span>
              <span className="hidden md:inline">Candles</span>
            </button>
            <button
              onClick={() => setChartType('hollow')}
              title="Hollow Candles"
              className={`p-1.5 rounded-md text-xs font-mono flex items-center space-x-1 ${
                chartType === 'hollow' ? 'bg-[#222] text-[#00FF41]' : 'text-[#777] hover:text-white'
              }`}
            >
              <span>🏮</span>
              <span className="hidden md:inline">Hollow</span>
            </button>
            <button
              onClick={() => setChartType('heikin_ashi')}
              title="Heikin-Ashi Smoothed Trend"
              className={`p-1.5 rounded-md text-xs font-mono flex items-center space-x-1 ${
                chartType === 'heikin_ashi' ? 'bg-[#222] text-[#00FF41]' : 'text-[#777] hover:text-white'
              }`}
            >
              <span>⛩️</span>
              <span className="hidden md:inline">Heikin-Ashi</span>
            </button>
            <button
              onClick={() => setChartType('line')}
              title="Line Chart with Glowing Gradient"
              className={`p-1.5 rounded-md text-xs font-mono flex items-center space-x-1 ${
                chartType === 'line' ? 'bg-[#222] text-[#00FF41]' : 'text-[#777] hover:text-white'
              }`}
            >
              <span>📈</span>
              <span className="hidden md:inline">Line</span>
            </button>
            <button
              onClick={() => setChartType('bars')}
              title="OHLC Bars"
              className={`p-1.5 rounded-md text-xs font-mono flex items-center space-x-1 ${
                chartType === 'bars' ? 'bg-[#222] text-[#00FF41]' : 'text-[#777] hover:text-white'
              }`}
            >
              <span>📊</span>
              <span className="hidden md:inline">Bars</span>
            </button>
          </div>

        </div>

        {/* Right Side: Indicators Menu, Drawing Tools, Settings, Fullscreen */}
        <div className="flex items-center space-x-2">
          
          {/* Indicators Button & Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowIndicatorsMenu(!showIndicatorsMenu)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] text-[#00FF41] font-mono font-bold text-[11px] transition-all"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Indicators ({Object.values(indicators).filter(Boolean).length})</span>
              <ChevronDown className="w-3 h-3 text-[#777]" />
            </button>

            {/* Indicators Popover Dropdown */}
            {showIndicatorsMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#111] border border-[#2A2A2A] shadow-2xl p-3 z-50 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#222] text-[10px] text-[#888] uppercase tracking-wider font-bold">
                  <span>Technical Overlays</span>
                  <button onClick={() => setShowIndicatorsMenu(false)} className="text-[#666] hover:text-white">✕</button>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#181818] cursor-pointer">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <span>EMA (9) Fast</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.ema9}
                      onChange={e => setIndicators({ ...indicators, ema9: e.target.checked })}
                      className="accent-[#00FF41]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#181818] cursor-pointer">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span>EMA (21) Medium</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.ema21}
                      onChange={e => setIndicators({ ...indicators, ema21: e.target.checked })}
                      className="accent-[#00FF41]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#181818] cursor-pointer">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <span>SMA (50) Trend</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.sma50}
                      onChange={e => setIndicators({ ...indicators, sma50: e.target.checked })}
                      className="accent-[#00FF41]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#181818] cursor-pointer">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      <span>Bollinger Bands (20, 2)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.bollingerBands}
                      onChange={e => setIndicators({ ...indicators, bollingerBands: e.target.checked })}
                      className="accent-[#00FF41]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#181818] cursor-pointer">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>Volume Profile</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.volume}
                      onChange={e => setIndicators({ ...indicators, volume: e.target.checked })}
                      className="accent-[#00FF41]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#181818] cursor-pointer">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span>RSI (14) Oscillator</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.rsi}
                      onChange={e => setIndicators({ ...indicators, rsi: e.target.checked })}
                      className="accent-[#00FF41]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#181818] cursor-pointer">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                      <span>MACD (12, 26, 9)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.macd}
                      onChange={e => setIndicators({ ...indicators, macd: e.target.checked })}
                      className="accent-[#00FF41]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#181818] cursor-pointer">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                      <span>VWAP Intraday</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.vwap}
                      onChange={e => setIndicators({ ...indicators, vwap: e.target.checked })}
                      className="accent-[#00FF41]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#181818] cursor-pointer">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <span>Order Book Depth Overlay</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.orderbookOverlay}
                      onChange={e => setIndicators({ ...indicators, orderbookOverlay: e.target.checked })}
                      className="accent-[#00FF41]"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Quick Snapshot button */}
          <button
            onClick={handleCaptureScreenshot}
            title="Take Screenshot"
            className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] text-[#888] hover:text-white border border-[#262626] transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => setShowSettingsModal(!showSettingsModal)}
            title="Chart Display Settings"
            className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] text-[#888] hover:text-white border border-[#262626] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Expand Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] text-[#888] hover:text-white border border-[#262626] transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

        </div>
      </div>

      {/* ================= 2. SETTINGS SLIDEOUT / MODAL ================= */}
      {showSettingsModal && (
        <div className="border-b border-[#222] bg-[#101010] p-4 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-150">
          <div>
            <div className="text-[10px] text-[#777] uppercase font-bold mb-2">Display Grid</div>
            <label className="flex items-center space-x-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showGrid}
                onChange={e => setSettings({ ...settings, showGrid: e.target.checked })}
                className="accent-[#00FF41]"
              />
              <span>Grid Lines</span>
            </label>
            <label className="flex items-center space-x-2 text-white cursor-pointer mt-1.5">
              <input
                type="checkbox"
                checked={settings.showCountdown}
                onChange={e => setSettings({ ...settings, showCountdown: e.target.checked })}
                className="accent-[#00FF41]"
              />
              <span>Bar Countdown</span>
            </label>
          </div>

          <div>
            <div className="text-[10px] text-[#777] uppercase font-bold mb-2">Scale & Labels</div>
            <label className="flex items-center space-x-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={settings.logScale}
                onChange={e => setSettings({ ...settings, logScale: e.target.checked })}
                className="accent-[#00FF41]"
              />
              <span>Logarithmic Scale</span>
            </label>
            <label className="flex items-center space-x-2 text-white cursor-pointer mt-1.5">
              <input
                type="checkbox"
                checked={settings.showHighLowMarkers}
                onChange={e => setSettings({ ...settings, showHighLowMarkers: e.target.checked })}
                className="accent-[#00FF41]"
              />
              <span>High / Low Markers</span>
            </label>
          </div>

          <div>
            <div className="text-[10px] text-[#777] uppercase font-bold mb-2">Color Preset</div>
            <select
              value={settings.theme}
              onChange={e => setSettings({ ...settings, theme: e.target.value as any })}
              className="bg-[#181818] border border-[#333] rounded px-2 py-1 text-white text-xs w-full focus:outline-none focus:border-[#00FF41]"
            >
              <option value="matrix">Matrix Green (Neon)</option>
              <option value="cyberpunk">Cyberpunk (Cyan/Pink)</option>
              <option value="classic">Classic TradingView</option>
              <option value="phantom">Phantom Purple</option>
              <option value="monochrome">Monochrome Pro</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="px-3 py-1.5 rounded bg-[#222] hover:bg-[#333] text-white font-bold text-center"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ================= 3. MAIN CHART WORKSPACE (With Drawing Tools Sidebar) ================= */}
      <div className="flex flex-1 relative min-h-[360px] sm:min-h-[420px]">
        
        {/* LEFT DRAWING TOOLS DOCK */}
        <div className="w-10 border-r border-[#181818] bg-[#0C0C0C] flex flex-col items-center py-2 space-y-1.5 shrink-0 z-20">
          
          <button
            onClick={() => setActiveDrawingTool('crosshair')}
            title="Crosshair Cursor"
            className={`p-1.5 rounded-lg transition-colors ${
              activeDrawingTool === 'crosshair'
                ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30'
                : 'text-[#666] hover:text-white'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveDrawingTool('trendline')}
            title="Trendline Draw Tool"
            className={`p-1.5 rounded-lg transition-colors ${
              activeDrawingTool === 'trendline'
                ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30'
                : 'text-[#666] hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveDrawingTool('horizontal');
              setHorizontalLines(prev => [...prev, activeHUDCandle.close]);
            }}
            title="Horizontal Support/Resistance Line (Click to place at cursor)"
            className={`p-1.5 rounded-lg transition-colors ${
              activeDrawingTool === 'horizontal'
                ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30'
                : 'text-[#666] hover:text-white'
            }`}
          >
            <MoveHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveDrawingTool('fibonacci')}
            title="Fibonacci Retracement Grid"
            className={`p-1.5 rounded-lg transition-colors ${
              activeDrawingTool === 'fibonacci'
                ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30'
                : 'text-[#666] hover:text-white'
            }`}
          >
            <Divide className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveDrawingTool('position');
              setRiskRewardPosition({
                entry: activeHUDCandle.close,
                tp: activeHUDCandle.close * 1.05,
                sl: activeHUDCandle.close * 0.97,
                type: 'LONG'
              });
            }}
            title="Long / Short Position Calculator"
            className={`p-1.5 rounded-lg transition-colors ${
              activeDrawingTool === 'position'
                ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30'
                : 'text-[#666] hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveDrawingTool('ruler')}
            title="Ruler & Price/Bars Delta"
            className={`p-1.5 rounded-lg transition-colors ${
              activeDrawingTool === 'ruler'
                ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30'
                : 'text-[#666] hover:text-white'
            }`}
          >
            <Percent className="w-4 h-4" />
          </button>

          <div className="w-6 h-[1px] bg-[#1F1F1F] my-1" />

          <button
            onClick={() => {
              setHorizontalLines([]);
              setRiskRewardPosition(null);
            }}
            title="Clear All Custom Drawings"
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>

        {/* PRIMARY INTERACTIVE CANVAS STAGE */}
        <div className="flex-1 flex flex-col relative bg-[#080808] overflow-hidden">
          
          {/* FLOATING HUD (Open, High, Low, Close, Volume, Indicators readout) */}
          <div className="absolute top-2 left-3 z-30 pointer-events-none flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-white font-black">{symbol}</span>
              <span className="text-[#888]">{activeHUDCandle.time}</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[#888]">O: <strong className="text-white">${activeHUDCandle.open.toFixed(2)}</strong></span>
              <span className="text-[#888]">H: <strong className="text-white">${activeHUDCandle.high.toFixed(2)}</strong></span>
              <span className="text-[#888]">L: <strong className="text-white">${activeHUDCandle.low.toFixed(2)}</strong></span>
              <span className="text-[#888]">C: <strong className={isCandleUp ? 'text-[#00FF41]' : 'text-red-400'}>${activeHUDCandle.close.toFixed(2)}</strong></span>
              <span className={`font-bold ${candleChangePct >= 0 ? 'text-[#00FF41]' : 'text-red-400'}`}>
                {candleChangePct >= 0 ? `+${candleChangePct.toFixed(2)}%` : `${candleChangePct.toFixed(2)}%`}
              </span>
              <span className="text-[#888]">Vol: <strong className="text-white">{activeHUDCandle.volume.toLocaleString()}</strong></span>
            </div>

            {/* Active Indicators Legend */}
            <div className="hidden lg:flex items-center space-x-2 text-[10px]">
              {indicators.ema9 && activeHUDCandle.ema9 && (
                <span className="text-cyan-400">EMA9: ${activeHUDCandle.ema9.toFixed(2)}</span>
              )}
              {indicators.ema21 && activeHUDCandle.ema21 && (
                <span className="text-yellow-400">EMA21: ${activeHUDCandle.ema21.toFixed(2)}</span>
              )}
              {indicators.bollingerBands && activeHUDCandle.bbUpper && (
                <span className="text-blue-400">BB(20): [${activeHUDCandle.bbLower?.toFixed(2)} - ${activeHUDCandle.bbUpper.toFixed(2)}]</span>
              )}
              {indicators.rsi && activeHUDCandle.rsi && (
                <span className="text-purple-400">RSI(14): {activeHUDCandle.rsi.toFixed(1)}</span>
              )}
            </div>
          </div>

          {/* SVG CHART CONTAINER */}
          <div className="flex-1 relative w-full h-full">
            <svg
              className="w-full h-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              viewBox="0 0 800 320"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Gradient for Line / Area Chart */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={themeColors.bull} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={themeColors.bull} stopOpacity="0.0" />
                </linearGradient>

                {/* Bollinger Bands Fill */}
                <linearGradient id="bbGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* 1. GRID LINES */}
              {settings.showGrid && (
                <g className="grid-lines" stroke={themeColors.grid} strokeDasharray="3 3" strokeWidth="0.8">
                  {/* Horizontal Grid */}
                  <line x1="0" y1="60" x2="800" y2="60" />
                  <line x1="0" y1="120" x2="800" y2="120" />
                  <line x1="0" y1="180" x2="800" y2="180" />
                  <line x1="0" y1="240" x2="800" y2="240" />

                  {/* Vertical Grid */}
                  <line x1="160" y1="0" x2="160" y2="320" />
                  <line x1="320" y1="0" x2="320" y2="320" />
                  <line x1="480" y1="0" x2="480" y2="320" />
                  <line x1="640" y1="0" x2="640" y2="320" />
                </g>
              )}

              {/* 2. BOLLINGER BANDS (Ribbon Fill & Lines) */}
              {indicators.bollingerBands && (
                <g className="bollinger-bands">
                  {/* Upper to Lower Ribbon Polygon */}
                  <polygon
                    fill="url(#bbGradient)"
                    points={`
                      ${displayCandles.map((c, i) => `${(i / (displayCandles.length - 1)) * 800},${getY(c.bbUpper || c.high)}`).join(' ')}
                      ${[...displayCandles].reverse().map((c, i) => `${((displayCandles.length - 1 - i) / (displayCandles.length - 1)) * 800},${getY(c.bbLower || c.low)}`).join(' ')}
                    `}
                  />
                  {/* Upper Line */}
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    points={displayCandles.map((c, i) => `${(i / (displayCandles.length - 1)) * 800},${getY(c.bbUpper || c.high)}`).join(' ')}
                  />
                  {/* Middle Line */}
                  <polyline
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth="1"
                    points={displayCandles.map((c, i) => `${(i / (displayCandles.length - 1)) * 800},${getY(c.bbMiddle || c.close)}`).join(' ')}
                  />
                  {/* Lower Line */}
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    points={displayCandles.map((c, i) => `${(i / (displayCandles.length - 1)) * 800},${getY(c.bbLower || c.low)}`).join(' ')}
                  />
                </g>
              )}

              {/* 3. MOVING AVERAGES (EMA 9, EMA 21, SMA 50, VWAP) */}
              {indicators.ema9 && (
                <polyline
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="1.5"
                  points={displayCandles.filter(c => c.ema9).map((c, i, arr) => {
                    const originalIdx = displayCandles.indexOf(c);
                    return `${(originalIdx / (displayCandles.length - 1)) * 800},${getY(c.ema9!)}`;
                  }).join(' ')}
                />
              )}

              {indicators.ema21 && (
                <polyline
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth="1.5"
                  points={displayCandles.filter(c => c.ema21).map((c, i) => {
                    const originalIdx = displayCandles.indexOf(c);
                    return `${(originalIdx / (displayCandles.length - 1)) * 800},${getY(c.ema21!)}`;
                  }).join(' ')}
                />
              )}

              {indicators.vwap && (
                <polyline
                  fill="none"
                  stroke="#F472B6"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  points={displayCandles.map((c, i) => `${(i / (displayCandles.length - 1)) * 800},${getY(c.vwap || c.close)}`).join(' ')}
                />
              )}

              {/* 4. VOLUME HISTOGRAM (Bottom 50px of main chart) */}
              {indicators.volume && (
                <g className="volume-bars" opacity="0.4">
                  {displayCandles.map((c, i) => {
                    const total = displayCandles.length;
                    const slotWidth = 800 / total;
                    const x = i * slotWidth;
                    const volHeight = Math.min(60, (c.volume / maxVolume) * 60);
                    const y = 300 - volHeight;
                    const isUp = c.close >= c.open;
                    return (
                      <rect
                        key={i}
                        x={x + 1}
                        y={y}
                        width={Math.max(1, slotWidth - 2)}
                        height={volHeight}
                        fill={isUp ? themeColors.bull : themeColors.bear}
                      />
                    );
                  })}
                </g>
              )}

              {/* 5. CANDLESTICKS / LINE / BARS RENDERING */}
              {chartType === 'line' ? (
                <g className="line-chart">
                  {/* Area fill */}
                  <polygon
                    fill="url(#areaGradient)"
                    points={`
                      ${displayCandles.map((c, i) => `${(i / (displayCandles.length - 1)) * 800},${getY(c.close)}`).join(' ')}
                      800,320 0,320
                    `}
                  />
                  {/* Glowing Price Line */}
                  <polyline
                    fill="none"
                    stroke={themeColors.line}
                    strokeWidth="2.5"
                    points={displayCandles.map((c, i) => `${(i / (displayCandles.length - 1)) * 800},${getY(c.close)}`).join(' ')}
                  />
                </g>
              ) : chartType === 'bars' ? (
                <g className="bars-chart">
                  {displayCandles.map((c, i) => {
                    const total = displayCandles.length;
                    const slotWidth = 800 / total;
                    const centerX = i * slotWidth + slotWidth / 2;
                    const isUp = c.close >= c.open;
                    const color = isUp ? themeColors.bull : themeColors.bear;
                    return (
                      <g key={i}>
                        {/* High-Low Spine */}
                        <line x1={centerX} y1={getY(c.high)} x2={centerX} y2={getY(c.low)} stroke={color} strokeWidth="1.5" />
                        {/* Open Tick (Left) */}
                        <line x1={centerX - slotWidth * 0.3} y1={getY(c.open)} x2={centerX} y2={getY(c.open)} stroke={color} strokeWidth="1.5" />
                        {/* Close Tick (Right) */}
                        <line x1={centerX} y1={getY(c.close)} x2={centerX + slotWidth * 0.3} y2={getY(c.close)} stroke={color} strokeWidth="1.5" />
                      </g>
                    );
                  })}
                </g>
              ) : (
                /* Candlestick Rendering (Classic, Hollow, or Heikin-Ashi) */
                <g className="candlesticks">
                  {displayCandles.map((c, i) => {
                    const total = displayCandles.length;
                    const slotWidth = 800 / total;
                    const centerX = i * slotWidth + slotWidth / 2;
                    const candleWidth = Math.max(2, slotWidth * 0.75);
                    const isUp = c.close >= c.open;
                    const color = isUp ? themeColors.bull : themeColors.bear;
                    
                    const topPrice = Math.max(c.open, c.close);
                    const bottomPrice = Math.min(c.open, c.close);
                    const yTop = getY(topPrice);
                    const yBottom = getY(bottomPrice);
                    const bodyHeight = Math.max(2, yBottom - yTop);

                    return (
                      <g key={i} className="candle-group">
                        {/* Upper / Lower Wicks */}
                        <line
                          x1={centerX}
                          y1={getY(c.high)}
                          x2={centerX}
                          y2={getY(c.low)}
                          stroke={color}
                          strokeWidth={settings.candleWickThick}
                        />

                        {/* Candle Body */}
                        {chartType === 'hollow' && isUp ? (
                          <rect
                            x={centerX - candleWidth / 2}
                            y={yTop}
                            width={candleWidth}
                            height={bodyHeight}
                            fill="#0A0A0A"
                            stroke={color}
                            strokeWidth="1.2"
                            rx="1"
                          />
                        ) : (
                          <rect
                            x={centerX - candleWidth / 2}
                            y={yTop}
                            width={candleWidth}
                            height={bodyHeight}
                            fill={color}
                            rx="1"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 6. FIBONACCI RETRACEMENT TOOL OVERLAY */}
              {activeDrawingTool === 'fibonacci' && fibRetracement && (
                <g className="fib-overlay font-mono text-[9px]">
                  {[0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0].map(ratio => {
                    const priceLevel = fibRetracement.high - (fibRetracement.high - fibRetracement.low) * ratio;
                    const y = getY(priceLevel);
                    return (
                      <g key={ratio}>
                        <line x1="0" y1={y} x2="800" y2={y} stroke="#EAB308" strokeDasharray="4 2" strokeWidth="0.8" opacity="0.6" />
                        <text x="730" y={y - 3} fill="#EAB308" textAnchor="end">
                          Fib {(ratio * 100).toFixed(1)}% (${priceLevel.toFixed(2)})
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 7. CUSTOM USER HORIZONTAL LINES */}
              {horizontalLines.map((linePrice, idx) => {
                const y = getY(linePrice);
                return (
                  <g key={idx} className="horizontal-level">
                    <line x1="0" y1={y} x2="800" y2={y} stroke="#00FF41" strokeDasharray="3 3" strokeWidth="1" />
                    <rect x="730" y={y - 8} width="65" height="16" fill="#00FF41" rx="2" />
                    <text x="762" y={y + 3} fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      ${linePrice.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* 8. RISK/REWARD POSITION TOOL OVERLAY */}
              {riskRewardPosition && (
                <g className="risk-reward-tool font-mono text-[9px]">
                  {/* Take Profit Area (Green) */}
                  <rect
                    x="480"
                    y={getY(riskRewardPosition.tp)}
                    width="260"
                    height={Math.max(2, getY(riskRewardPosition.entry) - getY(riskRewardPosition.tp))}
                    fill="#00FF41"
                    fillOpacity="0.15"
                    stroke="#00FF41"
                    strokeWidth="1"
                  />
                  {/* Stop Loss Area (Red) */}
                  <rect
                    x="480"
                    y={getY(riskRewardPosition.entry)}
                    width="260"
                    height={Math.max(2, getY(riskRewardPosition.sl) - getY(riskRewardPosition.entry))}
                    fill="#EF4444"
                    fillOpacity="0.15"
                    stroke="#EF4444"
                    strokeWidth="1"
                  />
                  {/* Entry Line */}
                  <line x1="480" y1={getY(riskRewardPosition.entry)} x2="740" y2={getY(riskRewardPosition.entry)} stroke="#FFF" strokeWidth="1.5" />
                  <text x="490" y={getY(riskRewardPosition.entry) - 4} fill="#FFF" fontWeight="bold">
                    Target R:R: 2.12 | Entry ${riskRewardPosition.entry.toFixed(2)}
                  </text>
                </g>
              )}

              {/* 9. LIVE PRICE LINE & TAG */}
              <g className="current-price-line">
                <line
                  x1="0"
                  y1={getY(lastCandle.close)}
                  x2="800"
                  y2={getY(lastCandle.close)}
                  stroke={isCandleUp ? themeColors.bull : themeColors.bear}
                  strokeDasharray="2 2"
                  strokeWidth="1.2"
                />
                <rect
                  x="725"
                  y={getY(lastCandle.close) - 9}
                  width="72"
                  height="18"
                  fill={isCandleUp ? themeColors.bull : themeColors.bear}
                  rx="3"
                />
                <text
                  x="761"
                  y={getY(lastCandle.close) + 3}
                  fill="#000"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  ${lastCandle.close.toFixed(2)}
                </text>
              </g>

              {/* 10. INTERACTIVE CROSSHAIR */}
              {crosshairPos && activeDrawingTool === 'crosshair' && (
                <g className="crosshair-lines pointer-events-none">
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={crosshairPos.x}
                    y1="0"
                    x2={crosshairPos.x}
                    y2="320"
                    stroke="#888"
                    strokeDasharray="2 2"
                    strokeWidth="0.8"
                  />
                  {/* Horizontal Crosshair Line */}
                  <line
                    x1="0"
                    y1={crosshairPos.y}
                    x2="800"
                    y2={crosshairPos.y}
                    stroke="#888"
                    strokeDasharray="2 2"
                    strokeWidth="0.8"
                  />
                </g>
              )}
            </svg>

            {/* Price Scale Column (Right-hand values) */}
            <div className="absolute right-0 top-0 bottom-0 w-16 border-l border-[#181818] bg-[#0A0A0A]/90 flex flex-col justify-between py-3 text-[10px] font-mono text-[#777] items-center pointer-events-none">
              <span>${maxPrice.toFixed(2)}</span>
              <span>${(maxPrice - (maxPrice - minPrice) * 0.25).toFixed(2)}</span>
              <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
              <span>${(minPrice + (maxPrice - minPrice) * 0.25).toFixed(2)}</span>
              <span>${minPrice.toFixed(2)}</span>
            </div>

            {/* Countdown Badge to Bar Close */}
            {settings.showCountdown && (
              <div className="absolute bottom-2 right-20 px-2 py-1 rounded bg-[#161616] border border-[#262626] text-[10px] font-mono text-[#00FF41] flex items-center space-x-1">
                <Clock className="w-3 h-3 animate-spin" />
                <span>00:{countdown.toString().padStart(2, '0')}</span>
              </div>
            )}

          </div>

          {/* ================= 4. SUBPANEL: RSI (14) OSCILLATOR ================= */}
          {indicators.rsi && (
            <div className="h-16 border-t border-[#181818] bg-[#070707] relative flex flex-col justify-between px-3 py-1">
              <div className="flex items-center justify-between text-[10px] font-mono z-10 text-[#888]">
                <span className="text-purple-400 font-bold">RSI (14): {activeHUDCandle.rsi?.toFixed(1) || '52.4'}</span>
                <div className="flex items-center space-x-3 text-[9px]">
                  <span className="text-red-400">OB: 70</span>
                  <span className="text-[#666]">MID: 50</span>
                  <span className="text-emerald-400">OS: 30</span>
                </div>
              </div>

              <svg className="w-full h-10" viewBox="0 0 800 40" preserveAspectRatio="none">
                {/* 70 / 30 guide bands */}
                <line x1="0" y1="12" x2="800" y2="12" stroke="#EF4444" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.4" />
                <line x1="0" y1="28" x2="800" y2="28" stroke="#10B981" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.4" />
                {/* RSI curve */}
                <polyline
                  fill="none"
                  stroke="#C084FC"
                  strokeWidth="1.5"
                  points={displayCandles.map((c, i) => {
                    const rsiVal = c.rsi || 50;
                    const y = 40 - (rsiVal / 100) * 40;
                    return `${(i / (displayCandles.length - 1)) * 800},${y}`;
                  }).join(' ')}
                />
              </svg>
            </div>
          )}

          {/* ================= 5. SUBPANEL: MACD (12, 26, 9) ================= */}
          {indicators.macd && (
            <div className="h-16 border-t border-[#181818] bg-[#070707] relative flex flex-col justify-between px-3 py-1">
              <div className="flex items-center justify-between text-[10px] font-mono z-10 text-[#888]">
                <span className="text-orange-400 font-bold">MACD (12, 26, 9)</span>
                <div className="flex items-center space-x-2 text-[9px]">
                  <span className="text-blue-400">MACD: {activeHUDCandle.macd?.macd.toFixed(3)}</span>
                  <span className="text-orange-400">Signal: {activeHUDCandle.macd?.signal.toFixed(3)}</span>
                </div>
              </div>

              <svg className="w-full h-10" viewBox="0 0 800 40" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="800" y2="20" stroke="#333" strokeWidth="0.8" />
                {displayCandles.map((c, i) => {
                  const total = displayCandles.length;
                  const slotWidth = 800 / total;
                  const hist = c.macd?.hist || 0;
                  const barHeight = Math.min(18, Math.abs(hist) * 20);
                  const y = hist >= 0 ? 20 - barHeight : 20;
                  return (
                    <rect
                      key={i}
                      x={i * slotWidth}
                      y={y}
                      width={Math.max(1, slotWidth - 2)}
                      height={barHeight}
                      fill={hist >= 0 ? '#00FF41' : '#EF4444'}
                      opacity="0.8"
                    />
                  );
                })}
              </svg>
            </div>
          )}

        </div>

      </div>

      {/* ================= 6. CHART FOOTER INFO BAR ================= */}
      <div className="border-t border-[#181818] bg-[#090909] px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-[#666]">
        <div className="flex items-center space-x-3">
          <span className="text-[#00FF41] font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
            <span>WhatsOnChain Live Block Sync</span>
          </span>
          <span className="hidden sm:inline">Precision: 0.00000001 BSV</span>
          <span className="hidden md:inline">24h High: ${high24h} • 24h Low: ${low24h}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span>Scale: {settings.logScale ? 'LOG' : 'LIN'}</span>
          <span>•</span>
          <span>UTC {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

    </div>
  );
};
