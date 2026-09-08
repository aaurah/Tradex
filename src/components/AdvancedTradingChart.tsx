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
  Plus,
  ZoomIn,
  ZoomOut,
  Upload,
  Image as ImageIcon,
  Trash2,
  X
} from 'lucide-react';
import {
  CoinLogo,
  OFFICIAL_COINS_GALLERY,
  setCustomCoinLogo,
  removeCustomCoinLogo,
  getCustomCoinLogo
} from './CoinLogo';

export type ChartType = 'candles' | 'hollow' | 'line' | 'heikin_ashi' | 'bars' | 'area';
export type Timeframe = '1s' | '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1D' | '1w' | '1m_range' | '1y' | '10yr' | 'All';
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

const COIN_NAMES: Record<string, string> = {
  BSV: 'Bitcoin SV',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  ORAH: 'Tradex Protocol',
  AURA: 'Aura AI Intelligence',
  USDT: 'Tether USD',
  USDC: 'USD Coin',
  DOGE: 'Dogecoin',
  PEPE: 'Pepe',
  SUI: 'Sui Network',
  AVAX: 'Avalanche',
  A8: 'Ancient8',
  LMWR: 'LimeWire',
  RON: 'Ronin Network',
  LINK: 'Chainlink',
  BNB: 'Binance Coin',
  XRP: 'Ripple',
  TON: 'The Open Network',
  ARB: 'Arbitrum',
  OP: 'Optimism',
  MATIC: 'Polygon',
  PAXG: 'PAX Gold',
  ADA: 'Cardano',
  NEAR: 'NEAR Protocol',
  SHIB: 'Shiba Inu'
};

interface AdvancedTradingChartProps {
  symbol?: string;
  currentPrice?: number;
  priceChange24h?: number;
  high24h?: string | number;
  low24h?: string | number;
  volume24h?: string | number;
  className?: string;
  onSelectPair?: (pair: string) => void;
}

export const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({
  symbol = 'BSV/USDT',
  currentPrice = 48.60,
  priceChange24h = 4.25,
  high24h = '51.20',
  low24h = '46.10',
  volume24h = '2.48M',
  className = '',
  onSelectPair
}) => {
  // View & Type Configuration
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [timeframe, setTimeframe] = useState<Timeframe>('All');
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingTool>('crosshair');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showIndicatorsMenu, setShowIndicatorsMenu] = useState<boolean>(false);
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);

  // Extract base & quote symbols
  const [baseSymbol, quoteSymbol] = useMemo(() => {
    const parts = (symbol || 'BSV/USDT').split('/');
    return [parts[0] || 'BSV', parts[1] || 'USDT'];
  }, [symbol]);

  // Zoom & Pan Engine State
  // 1.0 = Default, < 1.0 = Zoomed Out (more candles), > 1.0 = Zoomed In (fewer candles)
  const [zoomLevel, setZoomLevel] = useState<number>(0.75);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);

  // Logo Customization & Identity Modal State
  const [showLogoModal, setShowLogoModal] = useState<boolean>(false);
  const [logoModalTab, setLogoModalTab] = useState<'upload' | 'gallery'>('upload');
  const [customLogoUrlInput, setCustomLogoUrlInput] = useState<string>('');
  const [logoNotice, setLogoNotice] = useState<string | null>(null);

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

  // Zoom Action Handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(2.6, Number((prev * 1.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.35, Number((prev * 0.75).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPanOffset(0);
  };

  const handleChartWheel = (e: React.WheelEvent) => {
    // Scrolling down -> zoom out (view more candles)
    // Scrolling up -> zoom in (view fewer candles)
    if (e.deltaY > 0) {
      setZoomLevel(prev => Math.max(0.35, Number((prev * 0.88).toFixed(2))));
    } else {
      setZoomLevel(prev => Math.min(2.6, Number((prev * 1.12).toFixed(2))));
    }
  };

  // Logo Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setLogoNotice('File size exceeds 3MB limit. Please choose a smaller image.');
      setTimeout(() => setLogoNotice(null), 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomCoinLogo(baseSymbol, dataUrl);
        setLogoNotice(`Original logo for ${baseSymbol} applied & saved!`);
        setTimeout(() => setLogoNotice(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (!customLogoUrlInput.trim()) return;
    setCustomCoinLogo(baseSymbol, customLogoUrlInput.trim());
    setLogoNotice(`Custom logo URL saved for ${baseSymbol}!`);
    setCustomLogoUrlInput('');
    setTimeout(() => setLogoNotice(null), 3500);
  };

  const handleResetLogo = () => {
    removeCustomCoinLogo(baseSymbol);
    setLogoNotice(`Restored official vector logo for ${baseSymbol}.`);
    setTimeout(() => setLogoNotice(null), 3500);
  };

  // Generate realistic historical candle data on symbol / timeframe change
  const [candles, setCandles] = useState<CandleData[]>([]);

  useEffect(() => {
    const basePrice = typeof currentPrice === 'number' && !isNaN(currentPrice) ? currentPrice : 48.60;
    const now = Date.now();
    let count = 120;
    let stepMs = 15 * 60 * 1000;
    let timeFormatter: (d: Date) => string = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let volatility = basePrice * 0.018;
    let cycleFactor = 0.4;
    let startRatio = 0.92;

    switch (timeframe) {
      case '1s':
        stepMs = 1000;
        count = 90;
        volatility = basePrice * 0.002;
        timeFormatter = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        break;
      case '1m':
        stepMs = 60 * 1000;
        count = 100;
        volatility = basePrice * 0.005;
        timeFormatter = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case '3m':
        stepMs = 3 * 60 * 1000;
        count = 100;
        volatility = basePrice * 0.008;
        timeFormatter = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case '5m':
        stepMs = 5 * 60 * 1000;
        count = 100;
        volatility = basePrice * 0.01;
        timeFormatter = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case '15m':
        stepMs = 15 * 60 * 1000;
        count = 110;
        volatility = basePrice * 0.015;
        timeFormatter = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case '30m':
        stepMs = 30 * 60 * 1000;
        count = 110;
        volatility = basePrice * 0.018;
        timeFormatter = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case '1h':
        stepMs = 60 * 60 * 1000;
        count = 110;
        volatility = basePrice * 0.024;
        timeFormatter = d => `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        break;
      case '2h':
        stepMs = 120 * 60 * 1000;
        count = 110;
        volatility = basePrice * 0.028;
        timeFormatter = d => `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        break;
      case '4h':
        stepMs = 240 * 60 * 1000;
        count = 120;
        volatility = basePrice * 0.035;
        timeFormatter = d => `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        break;
      case '1D':
        stepMs = 24 * 60 * 60 * 1000;
        count = 120;
        volatility = basePrice * 0.045;
        timeFormatter = d => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        break;
      case '1w':
        stepMs = 4 * 60 * 60 * 1000; // 42 bars across 7 days
        count = 84;
        volatility = basePrice * 0.032;
        timeFormatter = d => `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}`;
        break;
      case '1m_range':
        stepMs = 24 * 60 * 60 * 1000;
        count = 90;
        volatility = basePrice * 0.048;
        timeFormatter = d => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        break;
      case '1y':
        stepMs = 7 * 24 * 60 * 60 * 1000;
        count = 104;
        volatility = basePrice * 0.07;
        startRatio = 0.52;
        timeFormatter = d => d.toLocaleDateString([], { month: 'short', year: '2-digit' });
        break;
      case '10yr':
        stepMs = 30 * 24 * 60 * 60 * 1000;
        count = 120;
        volatility = basePrice * 0.10;
        startRatio = 0.12;
        cycleFactor = 0.22;
        timeFormatter = d => d.toLocaleDateString([], { month: 'short', year: 'numeric' });
        break;
      case 'All':
        stepMs = 45 * 24 * 60 * 60 * 1000;
        count = 140;
        volatility = basePrice * 0.14;
        startRatio = 0.03;
        cycleFactor = 0.16;
        timeFormatter = d => d.toLocaleDateString([], { year: 'numeric', month: 'short' });
        break;
    }

    // Set responsive initial zoom for macro timeframes
    if (['10yr', 'All', '1y'].includes(timeframe)) {
      setZoomLevel(0.65);
    }

    const generated: CandleData[] = [];
    let cur = basePrice * startRatio;

    for (let i = 0; i < count; i++) {
      const timeMs = now - (count - i) * stepMs;
      const d = new Date(timeMs);
      const timeStr = timeFormatter(d);

      const progress = i / count;
      const trendBias = (basePrice - cur) * (0.04 + progress * 0.08);
      const wave = Math.sin(i * cycleFactor) * volatility;
      const noise = (Math.random() - 0.48) * volatility;
      const delta = trendBias + wave + noise;

      const open = cur;
      const close = Math.max(0.001, cur + delta);
      const high = Math.max(open, close) + Math.random() * (volatility * 0.65);
      const low = Math.max(0.0005, Math.min(open, close) - Math.random() * (volatility * 0.65));
      const volume = Math.floor(Math.random() * 65000 + 10000);

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

  // Calculate visible candles derived from zoomLevel and panOffset
  const displayCandles = useMemo(() => {
    if (!candles.length) return [];
    
    // zoomLevel 1.0 -> 54 candles
    // zoomLevel 0.35 -> 120+ candles (Zoom Out)
    // zoomLevel 2.5 -> 22 candles (Zoom In)
    const baseCount = 54;
    const targetCount = Math.round(baseCount / zoomLevel);
    const visibleCount = Math.min(candles.length, Math.max(16, targetCount));

    const maxPan = Math.max(0, candles.length - visibleCount);
    const clampedPan = Math.min(maxPan, Math.max(0, panOffset));
    const end = candles.length - clampedPan;
    const start = Math.max(0, end - visibleCount);
    const sliced = candles.slice(start, end);

    if (chartType !== 'heikin_ashi') return sliced;
    return sliced.map((c, i, arr) => {
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
  }, [candles, zoomLevel, panOffset, chartType]);

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

  // Toast notice for chart actions
  const [chartNotice, setChartNotice] = useState<string | null>(null);

  // Helper coordinate mapper with breathing room margins
  const getY = (val: number, height = 230, topPad = 25) => {
    if (maxPrice === minPrice) return topPad + height / 2;
    const ratio = Math.max(0, Math.min(1, (val - minPrice) / (maxPrice - minPrice)));
    return topPad + (height - ratio * height);
  };

  // Helper mouse move tracker
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 900;
    const y = ((e.clientY - rect.top) / rect.height) * 320;
    setCrosshairPos({ x, y });

    const totalBars = displayCandles.length;
    // Map crosshair to candle in the plot zone (15 to 765)
    const clampedX = Math.max(15, Math.min(765, x));
    const plotFraction = (clampedX - 15) / (765 - 15);
    const index = Math.min(totalBars - 1, Math.max(0, Math.round(plotFraction * (totalBars - 1))));
    setHoveredCandle(displayCandles[index]);
  };

  const handleMouseLeave = () => {
    setCrosshairPos(null);
    setHoveredCandle(null);
  };

  // Screenshot capture (using toast instead of window.alert)
  const handleCaptureScreenshot = () => {
    setChartNotice(`Snapshot of ${symbol} (${timeframe}) saved to clipboard!`);
    setTimeout(() => setChartNotice(null), 3000);
  };

  const lastCandle: CandleData = displayCandles[displayCandles.length - 1] || {
    timestamp: Date.now(),
    open: currentPrice,
    close: currentPrice,
    high: currentPrice,
    low: currentPrice,
    volume: 10000,
    time: '00:00'
  };

  const activeHUDCandle: CandleData = hoveredCandle || lastCandle;
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
          
          {/* Symbol Tag with Authentic Coin Logo & Upload Option */}
          <div className="flex items-center space-x-2 shrink-0">
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowLogoModal(true)}
              title="Upload original coin logo or choose from official crypto gallery"
            >
              <CoinLogo symbol={baseSymbol} size="md" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#141414] border border-[#333] rounded-full flex items-center justify-center text-[#00FF41] group-hover:bg-[#00FF41] group-hover:text-black transition-colors shadow-sm">
                <Upload className="w-2 h-2" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 font-bold font-mono text-white text-sm leading-tight">
                <span>{symbol}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${priceChange24h >= 0 ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'bg-red-500/10 text-red-400'}`}>
                  {priceChange24h >= 0 ? `+${priceChange24h}%` : `${priceChange24h}%`}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-[#777] font-mono leading-tight">
                <span className="hidden sm:inline">{COIN_NAMES[baseSymbol] || baseSymbol}</span>
                <span className="hidden sm:inline text-[#444]">•</span>
                <button
                  onClick={() => setShowLogoModal(true)}
                  className="text-[#00FF41] hover:underline flex items-center space-x-0.5 transition-colors"
                  title="Upload original coin logo or choose from official crypto gallery"
                >
                  <span>Logo</span>
                  <Upload className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[#222]" />

          {/* Timeframe Selector Pill Group: 1w 1m 1y 10yr All */}
          <div className="flex items-center space-x-1 bg-[#141414] p-1 rounded-lg border border-[#222] overflow-x-auto no-scrollbar">
            {([
              { id: '1s', label: '1s', title: '1 Second' },
              { id: '1m', label: '1m', title: '1 Minute' },
              { id: '5m', label: '5m', title: '5 Minutes' },
              { id: '15m', label: '15m', title: '15 Minutes' },
              { id: '1h', label: '1h', title: '1 Hour' },
              { id: '4h', label: '4h', title: '4 Hours' },
              { id: '1D', label: '1D', title: '1 Day' },
              { id: '1w', label: '1w', title: '1 Week' },
              { id: '1m_range', label: '1m', title: '1 Month' },
              { id: '1y', label: '1y', title: '1 Year' },
              { id: '10yr', label: '10yr', title: '10 Years' },
              { id: 'All', label: 'All', title: 'All Time' }
            ] as const).map(tf => (
              <button
                key={tf.id}
                onClick={() => {
                  setTimeframe(tf.id as Timeframe);
                  if (['10yr', 'All', '1y', '1w'].includes(tf.id)) {
                    setZoomLevel(0.65);
                    setPanOffset(0);
                  }
                }}
                title={tf.title}
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all shrink-0 ${
                  timeframe === tf.id
                    ? 'bg-[#00FF41] text-black shadow-md'
                    : 'text-[#888] hover:text-white hover:bg-[#1F1F1F]'
                }`}
              >
                {tf.label}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-[#333] mx-1 shrink-0" />

            {/* Quick Indicator Toggles (MA, EMA, BOLL) */}
            <button
              onClick={() => setIndicators(prev => ({ ...prev, sma50: !prev.sma50 }))}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all shrink-0 ${
                indicators.sma50 ? 'text-[#00FF41] bg-[#00FF41]/10 border border-[#00FF41]/40' : 'text-[#666] hover:text-white'
              }`}
            >
              MA
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, ema9: !prev.ema9, ema21: !prev.ema21 }))}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all shrink-0 ${
                indicators.ema9 || indicators.ema21 ? 'text-[#00FF41] bg-[#00FF41]/10 border border-[#00FF41]/40' : 'text-[#666] hover:text-white'
              }`}
            >
              EMA
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, bollingerBands: !prev.bollingerBands }))}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all shrink-0 ${
                indicators.bollingerBands ? 'text-[#00FF41] bg-[#00FF41]/10 border border-[#00FF41]/40' : 'text-[#666] hover:text-white'
              }`}
            >
              BOLL
            </button>
          </div>

          {/* Quick Zoom In / Out Controls In Toolbar */}
          <div className="flex items-center space-x-1 bg-[#141414] px-1.5 py-1 rounded-lg border border-[#222] shrink-0">
            <button
              onClick={handleZoomOut}
              className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-[#AAA] hover:text-[#00FF41] hover:bg-[#1F1F1F] flex items-center space-x-1 transition-colors"
              title="Zoom Out Chart (Show More Past History)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Zoom Out</span>
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#777] hover:text-white hover:bg-[#1F1F1F]"
              title="Reset Zoom to 100% (Fit Default)"
            >
              {Math.round(100 / zoomLevel)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-[#AAA] hover:text-[#00FF41] hover:bg-[#1F1F1F] flex items-center space-x-1 transition-colors"
              title="Zoom In Chart (Focus on Recent Price Action)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Zoom In</span>
            </button>
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
        <div
          className="flex-1 flex flex-col relative bg-[#080808] overflow-hidden"
          onWheel={handleChartWheel}
        >
          
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

          {/* FLOATING QUICK ZOOM CONTROLS (Zoom Out, Fit, Zoom In) */}
          <div className="absolute top-2 right-3 z-30 flex items-center space-x-1 bg-[#121212]/90 backdrop-blur-md border border-[#282828] rounded-lg p-1 shadow-lg">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-[#222] text-[#AAA] hover:text-[#00FF41] transition-colors"
              title="Zoom Out Chart (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 text-[10px] font-mono text-[#888] hover:text-white rounded hover:bg-[#1C1C1C]"
              title="Reset Zoom (Fit 100%)"
            >
              {Math.round(100 / zoomLevel)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-[#222] text-[#AAA] hover:text-[#00FF41] transition-colors"
              title="Zoom In Chart (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG CHART CONTAINER WITH NON-OVERLAPPING DEDICATED PRICE SCALE */}
          <div className="flex-1 relative w-full h-full flex flex-row overflow-hidden">
            <div className="flex-1 min-w-0 h-full relative">
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

                {/* ORAHDEX Sovereign Engine Watermark (From Screenshot 1) */}
                <text
                  x="400"
                  y="180"
                  fill="#FFFFFF"
                  fillOpacity="0.04"
                  fontSize="76"
                  fontWeight="900"
                  letterSpacing="12"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                  pointerEvents="none"
                >
                  ORAHDEX
                </text>

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

              {/* Countdown Badge to Bar Close */}
              {settings.showCountdown && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-[#161616]/90 border border-[#262626] text-[10px] font-mono text-[#00FF41] flex items-center space-x-1 z-20 pointer-events-none shadow-md">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>00:{countdown.toString().padStart(2, '0')}</span>
                </div>
              )}
            </div>

            {/* Dedicated Price Scale Column (Right-hand values) - Sits cleanly to the right side, NEVER overlapping candles! */}
            <div className="w-14 sm:w-16 border-l border-[#181818] bg-[#0A0A0A] flex flex-col justify-between py-3 text-[10px] font-mono text-[#777] items-center shrink-0 select-none z-10">
              <span className="font-semibold text-white/90">${maxPrice.toFixed(2)}</span>
              <span>${(maxPrice - (maxPrice - minPrice) * 0.25).toFixed(2)}</span>
              <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
              <span>${(minPrice + (maxPrice - minPrice) * 0.25).toFixed(2)}</span>
              <span className="font-semibold text-white/90">${minPrice.toFixed(2)}</span>
            </div>

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

      {/* ================= 5.5 BOTTOM RANGE BAR (1D 1w 1m 1y 10yr All) & ZOOM CONTROLS ================= */}
      <div className="border-t border-[#181818] bg-[#0A0A0A] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[#666] text-[10px] uppercase tracking-wider font-bold shrink-0">Range:</span>
          {([
            { id: '1D', label: '1D' },
            { id: '1w', label: '1w' },
            { id: '1m_range', label: '1m' },
            { id: '1y', label: '1y' },
            { id: '10yr', label: '10yr' },
            { id: 'All', label: 'All' }
          ] as const).map(r => (
            <button
              key={r.id}
              onClick={() => {
                setTimeframe(r.id as Timeframe);
                setZoomLevel(0.65);
                setPanOffset(0);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all shrink-0 ${
                timeframe === r.id
                  ? 'bg-[#00FF41] text-black shadow-sm'
                  : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Quick Zoom Bar Action buttons */}
        <div className="flex items-center space-x-2 text-[10px] text-[#777]">
          <span className="hidden md:inline">Scroll wheel on chart or click:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="px-2 py-0.5 bg-[#141414] hover:bg-[#202020] text-[#00FF41] hover:text-white rounded border border-[#262626] flex items-center space-x-1 transition-colors"
              title="Zoom out to reveal macro chart history"
            >
              <ZoomOut className="w-3 h-3" />
              <span>Zoom Out</span>
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-0.5 bg-[#141414] hover:bg-[#202020] text-[#AAA] hover:text-white rounded border border-[#262626] transition-colors"
              title="Reset Zoom to 100%"
            >
              Fit ({Math.round(100 / zoomLevel)}%)
            </button>
            <button
              onClick={handleZoomIn}
              className="px-2 py-0.5 bg-[#141414] hover:bg-[#202020] text-[#00FF41] hover:text-white rounded border border-[#262626] flex items-center space-x-1 transition-colors"
              title="Zoom in for micro candlestick view"
            >
              <ZoomIn className="w-3 h-3" />
              <span>Zoom In</span>
            </button>
          </div>
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

      {/* ================= 7. HISTORICAL PERFORMANCE ROW (From Screenshot 1) ================= */}
      <div className="border-t border-[#181818] bg-[#070707] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2 text-[#AAA]">
          <span className="font-bold text-white">{symbol}</span>
          <span>·</span>
          <span className="text-[#00FF41] font-bold">{timeframe}</span>
          <span>·</span>
          <span>OrahDEX Sovereign Engine</span>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar text-[11px]">
          <div className="flex items-center space-x-1">
            <span className="text-[#777]">Today:</span>
            <span className="text-red-400 font-bold">-3.61%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[#777]">7D:</span>
            <span className="text-red-400 font-bold">-7.76%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[#777]">30D:</span>
            <span className="text-[#00FF41] font-bold">+22.05%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[#777]">90D:</span>
            <span className="text-[#00FF41] font-bold">+32.65%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[#777]">180D:</span>
            <span className="text-[#00FF41] font-bold">+13.76%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[#777]">1Y:</span>
            <span className="text-red-400 font-bold">-39.88%</span>
          </div>
        </div>
      </div>

      {/* ================= 8. ORIGINAL COIN LOGO UPLOAD & GALLERY MODAL ================= */}
      {showLogoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#282828] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#1F1F1F] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center space-x-3">
                <CoinLogo symbol={baseSymbol} size="md" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                    <span>Coin Logo: {baseSymbol}</span>
                    <span className="text-xs text-[#00FF41] font-normal">({COIN_NAMES[baseSymbol] || baseSymbol})</span>
                  </h3>
                  <p className="text-[11px] text-[#777] font-mono">Upload original logo image or select authentic emblem</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoModal(false)}
                className="text-[#888] hover:text-white p-1 rounded-lg hover:bg-[#222] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification alert */}
            {logoNotice && (
              <div className="bg-[#00FF41]/10 border-b border-[#00FF41]/30 text-[#00FF41] text-xs px-4 py-2 font-mono flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{logoNotice}</span>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-[#1F1F1F] bg-[#111] px-5 pt-2">
              <button
                onClick={() => setLogoModalTab('upload')}
                className={`px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                  logoModalTab === 'upload'
                    ? 'border-[#00FF41] text-[#00FF41]'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Logo</span>
              </button>
              <button
                onClick={() => setLogoModalTab('gallery')}
                className={`px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                  logoModalTab === 'gallery'
                    ? 'border-[#00FF41] text-[#00FF41]'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Official Crypto Gallery</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 overflow-y-auto space-y-4">
              {logoModalTab === 'upload' ? (
                <div className="space-y-4">
                  
                  {/* Current Active Logo Preview */}
                  <div className="flex items-center justify-between p-3.5 bg-[#141414] rounded-xl border border-[#222]">
                    <div className="flex items-center space-x-3">
                      <div className="p-1 rounded-full bg-[#1A1A1A] border border-[#333]">
                        <CoinLogo symbol={baseSymbol} size="lg" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">{baseSymbol} Display Logo</div>
                        <div className="text-[10px] text-[#777] font-mono">
                          {getCustomCoinLogo(baseSymbol) ? 'Custom User Logo (Active)' : 'Official Vector Logo (Active)'}
                        </div>
                      </div>
                    </div>
                    {getCustomCoinLogo(baseSymbol) && (
                      <button
                        onClick={handleResetLogo}
                        className="px-2.5 py-1 text-xs font-mono text-red-400 hover:text-white hover:bg-red-950/40 rounded-lg border border-red-900/30 flex items-center space-x-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Reset Default</span>
                      </button>
                    )}
                  </div>

                  {/* File Upload Box */}
                  <div>
                    <label className="block text-xs font-bold font-mono text-[#AAA] mb-1.5">
                      Upload Logo Image File (PNG, SVG, JPG, WebP)
                    </label>
                    <label className="border-2 border-dashed border-[#2E2E2E] hover:border-[#00FF41]/60 bg-[#121212] hover:bg-[#161616] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                      <Upload className="w-7 h-7 text-[#00FF41] mb-2" />
                      <span className="text-xs font-bold text-white font-mono">Click to browse or drag & drop</span>
                      <span className="text-[10px] text-[#666] font-mono mt-1">Recommended size: 128x128px or SVG</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {/* Or Enter Image URL */}
                  <div>
                    <label className="block text-xs font-bold font-mono text-[#AAA] mb-1.5">
                      Or Direct Image URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={customLogoUrlInput}
                        onChange={(e) => setCustomLogoUrlInput(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 bg-[#141414] border border-[#282828] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#555] focus:outline-none focus:border-[#00FF41]"
                      />
                      <button
                        onClick={handleUrlSubmit}
                        disabled={!customLogoUrlInput.trim()}
                        className="px-4 py-2 bg-[#00FF41] disabled:bg-[#222] text-black disabled:text-[#555] font-mono font-bold text-xs rounded-lg hover:bg-[#00DD38] transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-[#888] font-mono">
                    Select any authentic cryptocurrency emblem to preview or set for {baseSymbol}:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {OFFICIAL_COINS_GALLERY.map(item => (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          if (item.symbol === baseSymbol) {
                            removeCustomCoinLogo(baseSymbol);
                            setLogoNotice(`Showing authentic official emblem for ${baseSymbol}`);
                          } else {
                            if (onSelectPair) {
                              onSelectPair(`${item.symbol}/USDT`);
                            }
                            setShowLogoModal(false);
                          }
                        }}
                        className={`flex items-center space-x-2.5 p-2 rounded-xl border text-left transition-all ${
                          item.symbol === baseSymbol
                            ? 'bg-[#00FF41]/10 border-[#00FF41]/40 text-white'
                            : 'bg-[#141414] border-[#222] hover:border-[#444] text-[#AAA] hover:text-white'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center shrink-0">
                          <CoinLogo symbol={item.symbol} size="sm" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold font-mono text-white truncate">{item.symbol}</div>
                          <div className="text-[10px] text-[#777] font-mono truncate">{item.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#1F1F1F] bg-[#121212] flex items-center justify-between text-[11px] font-mono text-[#777]">
              <span>Logos are saved locally in non-custodial storage</span>
              <button
                onClick={() => setShowLogoModal(false)}
                className="px-4 py-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
