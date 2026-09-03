import { Coin } from '../types/dex';
import { buildLetsExchange22MMarketsCatalog } from '../data/letsExchangeCatalog';
import { letsExchangeApiService } from './letsExchangeApiService';

export interface TradePair {
  id: string;
  symbol: string;
  base: string;
  quote: string;
  baseName: string;
  icon: string;
  network: string;
  networkCode: string;
  category: string;
  price: number;
  priceFormatted: string;
  change24h: number;
  high24h: number;
  low24h: number;
  volBase: string;
  volQuote: string;
  volumeUsd: number;
  marketCapUsd: number;
  spread: number;
  isPopular?: boolean;
  isBSV?: boolean;
  isSolana?: boolean;
  isEVM?: boolean;
  isRonin?: boolean;
}

export const QUOTE_ASSETS = [
  { symbol: 'ALL', name: 'All Quotes', icon: '🌐' },
  { symbol: 'USDT', name: 'Tether USD', icon: '💵' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💲' },
  { symbol: 'BSV', name: 'Bitcoin SV', icon: '⚡' },
  { symbol: 'SOL', name: 'Solana', icon: '☀️' },
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { symbol: 'RON', name: 'Ronin', icon: '⚔️' }
];

export const MARKET_CATEGORIES = [
  { id: 'all', label: 'All 22M+ Markets', icon: '🌐' },
  { id: 'favorites', label: 'Starred / Watchlist', icon: '⭐' },
  { id: 'gaming', label: 'Gaming & NFT', icon: '🎮' },
  { id: 'bsv', label: 'BSV & Overlay', icon: '⚡' },
  { id: 'solana', label: 'Solana SPL', icon: '☀️' },
  { id: 'evm', label: 'Base & EVM L2s', icon: '⟠' },
  { id: 'ronin', label: 'Ronin Katana', icon: '⚔️' },
  { id: 'ai', label: 'AI & DePIN', icon: '🤖' },
  { id: 'meme', label: 'Meme & Community', icon: '🐕' },
  { id: 'defi', label: 'DeFi & Yield', icon: '🏛️' },
  { id: 'rwa', label: 'RWA & Commodities', icon: '🟡' },
  { id: 'layer1', label: 'Layer 1 Chains', icon: '⛓️' }
];

export const TOTAL_INDEXED_MARKETS_COUNT = 25150000;

class TradeMarketsService {
  private allCoins: Coin[] = [];
  private basePairsCache: TradePair[] = [];
  private isLiveSynced: boolean = false;
  private listeners: Set<() => void> = new Set();
  private tickerInterval: any = null;

  constructor() {
    this.initCatalog();
    this.startLiveTicker();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.warn('Listener error in TradeMarketsService:', err);
      }
    });
  }

  private startLiveTicker() {
    if (typeof window === 'undefined') return;
    if (this.tickerInterval) clearInterval(this.tickerInterval);

    this.tickerInterval = setInterval(() => {
      // Pick 8 random coins to simulate micro tick price action
      if (this.allCoins.length === 0) return;
      const countToUpdate = Math.min(12, this.allCoins.length);
      for (let i = 0; i < countToUpdate; i++) {
        const randIdx = Math.floor(Math.random() * Math.min(150, this.allCoins.length));
        const coin = this.allCoins[randIdx];
        if (!coin) continue;
        
        // Micro fluctuation between -0.3% and +0.3%
        const deltaPct = (Math.random() * 0.006 - 0.003);
        const newPrice = Math.max(0.00000001, coin.priceUsd * (1 + deltaPct));
        coin.priceUsd = parseFloat(newPrice >= 10 ? newPrice.toFixed(2) : newPrice >= 0.1 ? newPrice.toFixed(4) : newPrice.toFixed(8));
        coin.change24h = parseFloat(((coin.change24h || 0) + deltaPct * 10).toFixed(2));
        coin.volume24hUsd = (coin.volume24hUsd || 500000) + Math.floor(Math.random() * 15000);
      }

      // Refresh pairs
      this.generateBasePairs();
      this.notify();
    }, 3500);
  }

  public async syncWithLetsExchangeApi(force = false) {
    try {
      const res = await letsExchangeApiService.fetchLiveCoins(force);
      this.allCoins = res.coins;
      this.generateBasePairs();
      this.isLiveSynced = true;
      this.notify();
      return res;
    } catch (err) {
      console.warn('TradeMarketsService sync error, using cached catalog:', err);
      return null;
    }
  }

  private initCatalog() {
    this.allCoins = letsExchangeApiService.getCoins().length > 0
      ? letsExchangeApiService.getCoins()
      : buildLetsExchange22MMarketsCatalog();

    // Ensure core ecosystem tokens and LetsExchange stars like LMWR and A8 are guaranteed present
    const baseCatalog = buildLetsExchange22MMarketsCatalog();
    const existingMap = new Map<string, Coin>();
    this.allCoins.forEach(c => existingMap.set(c.symbol.toUpperCase(), c));
    baseCatalog.forEach(c => {
      if (!existingMap.has(c.symbol.toUpperCase())) {
        this.allCoins.push(c);
        existingMap.set(c.symbol.toUpperCase(), c);
      }
    });

    this.generateBasePairs();
  }

  public buildTradePairFromCoin(coin: Coin, quote: string = 'USDT'): TradePair {
    const quotePrices: Record<string, number> = {
      USDT: 1.0,
      USDC: 1.0,
      BSV: this.getCoinPrice('BSV', 48.60),
      SOL: this.getCoinPrice('SOL', 148.50),
      ETH: this.getCoinPrice('ETH', 2642.50),
      BTC: this.getCoinPrice('BTC', 64250.00),
      RON: this.getCoinPrice('RON', 1.85)
    };

    const quoteCoin = this.allCoins.find(c => c.symbol.toUpperCase() === quote.toUpperCase());
    const quotePrice = quotePrices[quote.toUpperCase()] || quoteCoin?.priceUsd || 1.0;
    const relativePrice = coin.priceUsd / quotePrice;

    let priceFormatted = '';
    if (relativePrice >= 1000) {
      priceFormatted = relativePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (relativePrice >= 1) {
      priceFormatted = relativePrice.toFixed(relativePrice < 10 ? 3 : 2);
    } else if (relativePrice >= 0.0001) {
      priceFormatted = relativePrice.toFixed(6);
    } else {
      priceFormatted = relativePrice.toFixed(8);
    }

    const change = coin.change24h ?? parseFloat(((Math.random() - 0.46) * 16).toFixed(2));
    const highMultiplier = 1 + Math.abs(change) * 0.015 + 0.02;
    const lowMultiplier = Math.max(0.0000001, 1 - Math.abs(change) * 0.015 - 0.02);

    const volBaseNum = (coin.volume24hUsd || 1500000) / coin.priceUsd;
    const volQuoteNum = (coin.volume24hUsd || 1500000) / quotePrice;

    const formatVol = (val: number) => {
      if (val >= 1000000000) return (val / 1000000000).toFixed(2) + 'B';
      if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
      return val.toFixed(2);
    };

    const isBsvCategory = coin.isBSV || (coin.category === 'layer1' && coin.symbol === 'BSV') || coin.symbol === 'ORAH' || coin.symbol === 'AURA';
    const isSolCategory = coin.isSolana || coin.category === 'solana';
    const isEvmCategory = coin.isEVM || coin.category === 'evm';
    const isRoninCategory = coin.isRonin || coin.category === 'ronin';

    // Preserve the semantic functional category rather than replacing it with EVM
    let categoryTag: string = (coin.category as string) || 'all';
    if (isBsvCategory && categoryTag === 'all') categoryTag = 'bsv';

    const newPair: TradePair = {
      id: `${coin.symbol}_${coin.networkCode || coin.network || 'main'}_${quote}`,
      symbol: `${coin.symbol}/${quote}`,
      base: coin.symbol,
      quote: quote,
      baseName: coin.name,
      icon: coin.icon,
      network: coin.network,
      networkCode: coin.networkCode || 'multi',
      category: categoryTag,
      price: relativePrice,
      priceFormatted,
      change24h: change,
      high24h: relativePrice * highMultiplier,
      low24h: relativePrice * lowMultiplier,
      volBase: formatVol(volBaseNum),
      volQuote: formatVol(volQuoteNum),
      volumeUsd: coin.volume24hUsd || 5000000,
      marketCapUsd: coin.marketCapUsd || 50000000,
      spread: parseFloat((0.01 + Math.random() * 0.05).toFixed(3)),
      isPopular: coin.popular || (coin.rank ? coin.rank <= 30 && quote === 'USDT' : false),
      isBSV: isBsvCategory,
      isSolana: isSolCategory,
      isEVM: isEvmCategory,
      isRonin: isRoninCategory
    };

    // Cache so subsequent queries find it instantly
    const existingIdx = this.basePairsCache.findIndex(p => p.symbol === newPair.symbol);
    if (existingIdx >= 0) {
      this.basePairsCache[existingIdx] = newPair;
    } else {
      this.basePairsCache.unshift(newPair);
    }

    return newPair;
  }

  private getCoinPrice(sym: string, def: number): number {
    const found = this.allCoins.find(c => c.symbol.toUpperCase() === sym.toUpperCase());
    return found?.priceUsd || def;
  }

  private generateBasePairs() {
    const quotes = ['USDT', 'USDC', 'BSV', 'SOL', 'ETH', 'BTC', 'RON'];
    const stablecoins = new Set(['USDT', 'USDC', 'DAI', 'FDUSD', 'BUSD', 'TUSD', 'USDD', 'PYUSD']);
    const pairs: TradePair[] = [];
    const seenSymbols = new Set<string>();

    // Sort coins by market rank / ecosystem priority first
    const sortedCoins = [...this.allCoins].sort((a, b) => {
      const isPriorityA = a.symbol === 'BSV' || a.symbol === 'ORAH' || a.symbol === 'AURA' || a.symbol === 'BTC' || a.symbol === 'ETH' || a.symbol === 'SOL' || a.symbol === 'RON' || a.symbol === 'A8' || a.symbol === 'LMWR';
      const isPriorityB = b.symbol === 'BSV' || b.symbol === 'ORAH' || b.symbol === 'AURA' || b.symbol === 'BTC' || b.symbol === 'ETH' || b.symbol === 'SOL' || b.symbol === 'RON' || b.symbol === 'A8' || b.symbol === 'LMWR';
      if (isPriorityA && !isPriorityB) return -1;
      if (!isPriorityA && isPriorityB) return 1;
      return (a.rank || 999) - (b.rank || 999);
    });

    sortedCoins.forEach(coin => {
      const isBaseStable = stablecoins.has(coin.symbol) || coin.symbol.startsWith('USDT_') || coin.symbol.startsWith('USDC_');

      quotes.forEach(quote => {
        if (coin.symbol.toUpperCase() === quote.toUpperCase()) return;

        // Prevent inverse stablecoin pairs (e.g. USDT/BTC, USDT/ETH, USDT/SOL)
        // If base is a stablecoin, only allow quote = USDT or USDC (e.g. USDC/USDT)
        if (isBaseStable && quote !== 'USDT' && quote !== 'USDC') {
          return;
        }

        const pairKey = `${coin.symbol}/${quote}`.toUpperCase();
        if (seenSymbols.has(pairKey)) return;
        seenSymbols.add(pairKey);

        const quotePrices: Record<string, number> = {
          USDT: 1.0,
          USDC: 1.0,
          BSV: this.getCoinPrice('BSV', 48.60),
          SOL: this.getCoinPrice('SOL', 148.50),
          ETH: this.getCoinPrice('ETH', 2642.50),
          BTC: this.getCoinPrice('BTC', 64250.00),
          RON: this.getCoinPrice('RON', 1.85)
        };

        const quotePrice = quotePrices[quote] || 1.0;
        const relativePrice = coin.priceUsd / quotePrice;
        
        let priceFormatted = '';
        if (relativePrice >= 1000) {
          priceFormatted = relativePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (relativePrice >= 1) {
          priceFormatted = relativePrice.toFixed(relativePrice < 10 ? 3 : 2);
        } else if (relativePrice >= 0.0001) {
          priceFormatted = relativePrice.toFixed(6);
        } else {
          priceFormatted = relativePrice.toFixed(8);
        }

        const change = coin.change24h ?? parseFloat(((Math.random() - 0.46) * 16).toFixed(2));
        const highMultiplier = 1 + Math.abs(change) * 0.015 + 0.02;
        const lowMultiplier = Math.max(0.0000001, 1 - Math.abs(change) * 0.015 - 0.02);

        const volBaseNum = (coin.volume24hUsd || 1500000) / coin.priceUsd;
        const volQuoteNum = (coin.volume24hUsd || 1500000) / quotePrice;

        const formatVol = (val: number) => {
          if (val >= 1000000000) return (val / 1000000000).toFixed(2) + 'B';
          if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
          if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
          return val.toFixed(2);
        };

        const isBsvCategory = coin.isBSV || (coin.category === 'layer1' && coin.symbol === 'BSV') || coin.symbol === 'ORAH' || coin.symbol === 'AURA';
        const isSolCategory = coin.isSolana || coin.category === 'solana';
        const isEvmCategory = coin.isEVM || coin.category === 'evm';
        const isRoninCategory = coin.isRonin || coin.category === 'ronin';

        // Keep authentic semantic category
        const categoryTag: string = (coin.category as string) || (isBsvCategory ? 'bsv' : 'all');

        pairs.push({
          id: `${coin.symbol}_${coin.networkCode || coin.network || 'main'}_${quote}`,
          symbol: `${coin.symbol}/${quote}`,
          base: coin.symbol,
          quote: quote,
          baseName: coin.name,
          icon: coin.icon,
          network: coin.network,
          networkCode: coin.networkCode || 'multi',
          category: categoryTag,
          price: relativePrice,
          priceFormatted,
          change24h: change,
          high24h: relativePrice * highMultiplier,
          low24h: relativePrice * lowMultiplier,
          volBase: formatVol(volBaseNum),
          volQuote: formatVol(volQuoteNum),
          volumeUsd: coin.volume24hUsd || 5000000,
          marketCapUsd: coin.marketCapUsd || 50000000,
          spread: parseFloat((0.01 + Math.random() * 0.05).toFixed(3)),
          isPopular: coin.popular || (coin.rank ? coin.rank <= 30 && quote === 'USDT' : false),
          isBSV: isBsvCategory,
          isSolana: isSolCategory,
          isEVM: isEvmCategory,
          isRonin: isRoninCategory
        });
      });
    });

    this.basePairsCache = pairs;
  }

  public getAllPairs(): TradePair[] {
    return this.basePairsCache;
  }

  public getPopularPairs(): TradePair[] {
    return this.basePairsCache.filter(p => p.quote === 'USDT').slice(0, 16);
  }

  public getTrendingMovers(): TradePair[] {
    // Return top gainers from main USDT pairs
    return [...this.basePairsCache]
      .filter(p => p.quote === 'USDT')
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 10);
  }

  public searchPairs(params: {
    query?: string;
    category?: string;
    quote?: string;
    favorites?: string[];
    sortBy?: 'volume' | 'change' | 'price' | 'symbol' | 'marketCap';
    sortDir?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): { pairs: TradePair[]; total: number; totalEstimatedUniverse: number } {
    let filtered = [...this.basePairsCache];

    // Filter by Quote asset
    if (params.quote && params.quote !== 'ALL') {
      filtered = filtered.filter(p => p.quote.toUpperCase() === params.quote!.toUpperCase());
    }

    // Filter by Category
    if (params.category && params.category !== 'all') {
      if (params.category === 'favorites') {
        const favSet = new Set(params.favorites || []);
        filtered = filtered.filter(p => favSet.has(p.symbol));
      } else if (params.category === 'gaming') {
        filtered = filtered.filter(p => 
          p.category === 'gaming' || 
          p.isRonin || 
          ['A8', 'APE', 'AXS', 'SLP', 'PIXEL', 'GALA', 'SAND', 'MANA', 'BEAM', 'IMX', 'SUPER', 'YGG', 'PRIME', 'NOT', 'HMSTR', 'CATI', 'BLUR', 'MAGIC', 'ILV', 'BIGTIME', 'PORTAL', 'XAI', 'MAVIA'].includes(p.base.toUpperCase())
        );
      } else if (params.category === 'ai') {
        filtered = filtered.filter(p => 
          p.category === 'ai' || 
          ['LMWR', 'AURA', 'TAO', 'FET', 'RENDER', 'NEAR', 'GRASS', 'IO', 'ATH', 'GOAT', 'ACT', 'AI', 'AGIX', 'OCEAN', 'WLD', 'ARKM', 'NOS'].includes(p.base.toUpperCase())
        );
      } else if (params.category === 'bsv') {
        filtered = filtered.filter(p => p.isBSV || p.base === 'BSV' || p.base === 'ORAH' || p.base === 'AURA' || p.quote === 'BSV');
      } else if (params.category === 'solana') {
        filtered = filtered.filter(p => p.isSolana || p.category === 'solana' || p.quote === 'SOL');
      } else if (params.category === 'evm') {
        filtered = filtered.filter(p => 
          p.isEVM || 
          p.category === 'evm' || 
          p.quote === 'ETH' || 
          ['LMWR', 'A8', 'ETH', 'ORAH', 'LINK', 'UNI', 'AAVE', 'MKR', 'PEPE', 'SHIB', 'CRV', 'LDO'].includes(p.base.toUpperCase())
        );
      } else if (params.category === 'ronin') {
        filtered = filtered.filter(p => 
          p.isRonin || 
          p.category === 'ronin' || 
          p.quote === 'RON' || 
          ['A8', 'RON', 'WRON', 'AXS', 'SLP', 'PIXEL', 'BERRY', 'BANANA'].includes(p.base.toUpperCase())
        );
      } else if (params.category === 'meme') {
        filtered = filtered.filter(p => 
          p.category === 'meme' || 
          ['PEPE', 'DOGE', 'SHIB', 'BONK', 'WIF', 'POPCAT', 'FLOKI', 'MEME', 'BRETT', 'BOME', 'MOODENG', 'PNUT', 'FARTCOIN'].includes(p.base.toUpperCase())
        );
      } else if (params.category === 'defi') {
        filtered = filtered.filter(p => 
          p.category === 'defi' || 
          ['ORAH', 'UNI', 'AAVE', 'MKR', 'CRV', 'LDO', 'COMP', 'SNX', 'CAKE', 'JUP', 'RAY', 'DRIFT', 'KMNO', 'ORCA'].includes(p.base.toUpperCase())
        );
      } else {
        filtered = filtered.filter(p => p.category === params.category);
      }
    }

    // Filter by text search query across symbols, names, and networks
    if (params.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase();
      filtered = filtered.filter(p => 
        p.symbol.toLowerCase().includes(q) ||
        p.base.toLowerCase().includes(q) ||
        p.quote.toLowerCase().includes(q) ||
        p.baseName.toLowerCase().includes(q) ||
        p.network.toLowerCase().includes(q)
      );

      // Also dynamically check allCoins in the 22M+ universe for matching coins that may not have their pair in filtered yet!
      const matchingCoins = this.allCoins.filter(c => 
        c.symbol.toLowerCase() === q ||
        c.symbol.toLowerCase().startsWith(q) ||
        c.name.toLowerCase().includes(q) ||
        c.network.toLowerCase().includes(q)
      );

      const existingSymbols = new Set(filtered.map(p => p.symbol.toUpperCase()));
      const targetQuote = (params.quote && params.quote !== 'ALL') ? params.quote : 'USDT';

      matchingCoins.forEach(coin => {
        const pairSym = `${coin.symbol}/${targetQuote}`.toUpperCase();
        if (!existingSymbols.has(pairSym)) {
          const generatedPair = this.buildTradePairFromCoin(coin, targetQuote);
          if (generatedPair) {
            filtered.unshift(generatedPair);
            existingSymbols.add(pairSym);
          }
        }
      });
    }

    // Sorting
    const sortBy = params.sortBy || 'volume';
    const sortDir = params.sortDir || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'volume') {
        comparison = b.volumeUsd - a.volumeUsd;
      } else if (sortBy === 'change') {
        comparison = b.change24h - a.change24h;
      } else if (sortBy === 'price') {
        comparison = b.price - a.price;
      } else if (sortBy === 'marketCap') {
        comparison = b.marketCapUsd - a.marketCapUsd;
      } else if (sortBy === 'symbol') {
        comparison = a.symbol.localeCompare(b.symbol);
      }

      if (comparison === 0) {
        const quotePriority: Record<string, number> = { USDT: 1, USDC: 2, BSV: 3, SOL: 4, ETH: 5, BTC: 6, RON: 7 };
        const qA = quotePriority[a.quote] || 99;
        const qB = quotePriority[b.quote] || 99;
        return qA - qB;
      }

      return sortDir === 'asc' ? -comparison : comparison;
    });

    const total = filtered.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const startIndex = (page - 1) * pageSize;
    const paginatedPairs = filtered.slice(startIndex, startIndex + pageSize);

    const totalUniverse = Math.max(TOTAL_INDEXED_MARKETS_COUNT, this.allCoins.length * (this.allCoins.length - 1));

    return {
      pairs: paginatedPairs,
      total,
      totalEstimatedUniverse: totalUniverse
    };
  }

  public getPairBySymbol(symbol: string): TradePair | undefined {
    if (!symbol) return undefined;
    const cleanSym = symbol.trim().toUpperCase();

    // 1. Direct match in basePairsCache (exact or slashed/unslashed)
    const direct = this.basePairsCache.find(p => 
      p.symbol.toUpperCase() === cleanSym || 
      p.symbol.replace('/', '').toUpperCase() === cleanSym.replace('/', '').replace('-', '').replace('_', '')
    );
    if (direct) return direct;

    // 2. Parse base and quote parts
    let base = cleanSym;
    let quote = 'USDT';

    if (cleanSym.includes('/')) {
      const parts = cleanSym.split('/');
      base = parts[0].trim();
      quote = (parts[1] || 'USDT').trim();
    } else if (cleanSym.includes('-')) {
      const parts = cleanSym.split('-');
      base = parts[0].trim();
      quote = (parts[1] || 'USDT').trim();
    } else if (cleanSym.includes('_')) {
      const parts = cleanSym.split('_');
      base = parts[0].trim();
      quote = (parts[1] || 'USDT').trim();
    } else {
      // Check if ends with standard quotes (e.g. A8USDT, LMWRUSDT, LMWRBTC)
      const commonQuotes = ['USDT', 'USDC', 'BSV', 'SOL', 'ETH', 'BTC', 'RON', 'DAI'];
      for (const q of commonQuotes) {
        if (cleanSym.endsWith(q) && cleanSym.length > q.length) {
          base = cleanSym.slice(0, -q.length);
          quote = q;
          break;
        }
      }
    }

    // 3. Find base coin in allCoins or fallback catalog
    const baseCoin = this.getCoinBySymbol(base) || buildLetsExchange22MMarketsCatalog().find(c => c.symbol.toUpperCase() === base);
    if (baseCoin) {
      return this.buildTradePairFromCoin(baseCoin, quote);
    }

    // 4. Try looser match (e.g. matching by name)
    const fallbackCoin = this.allCoins.find(c => c.name.toUpperCase().includes(base) || c.symbol.toUpperCase().includes(base));
    if (fallbackCoin) {
      return this.buildTradePairFromCoin(fallbackCoin, quote);
    }

    return undefined;
  }

  public getAllCoins(): Coin[] {
    return this.allCoins;
  }

  public getCoinBySymbol(symbol: string): Coin | undefined {
    const clean = (symbol || '').trim().toUpperCase();
    return this.allCoins.find(c => c.symbol.toUpperCase() === clean);
  }

  public searchCoins(params: {
    query?: string;
    category?: string;
    favorites?: string[];
    sortBy?: 'rank' | 'price' | 'change' | 'volume' | 'marketCap' | 'name';
    sortDir?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): { coins: Coin[]; total: number } {
    let filtered = [...this.allCoins];

    // Filter by Category
    if (params.category && params.category !== 'all') {
      if (params.category === 'favorites') {
        const favSet = new Set(params.favorites || []);
        filtered = filtered.filter(c => favSet.has(c.symbol));
      } else if (params.category === 'top100') {
        filtered = filtered.filter(c => (c.rank || 999) <= 100);
      } else if (params.category === 'bsv') {
        filtered = filtered.filter(c => c.isBSV || c.symbol === 'BSV' || c.symbol === 'ORAH' || c.symbol === 'AURA' || c.networkCode === 'bsv');
      } else if (params.category === 'solana') {
        filtered = filtered.filter(c => c.isSolana || c.category === 'solana' || c.networkCode === 'sol');
      } else if (params.category === 'evm') {
        filtered = filtered.filter(c => c.isEVM || c.category === 'evm' || c.networkCode === 'eth' || c.networkCode === 'base' || c.networkCode === 'arb');
      } else if (params.category === 'ronin') {
        filtered = filtered.filter(c => c.isRonin || c.category === 'ronin' || c.networkCode === 'ron' || c.symbol.toUpperCase() === 'A8');
      } else if (params.category === 'gaming') {
        filtered = filtered.filter(c => c.category === 'gaming' || c.isRonin || ['A8', 'APE', 'AXS', 'SLP', 'PIXEL', 'GALA', 'SAND', 'MANA', 'IMX', 'BEAM', 'SUPER', 'YGG', 'PRIME'].includes(c.symbol.toUpperCase()));
      } else if (params.category === 'ai') {
        filtered = filtered.filter(c => c.category === 'ai' || ['LMWR', 'AURA', 'TAO', 'FET', 'RENDER', 'NEAR', 'GRASS', 'IO', 'ATH'].includes(c.symbol.toUpperCase()));
      } else if (params.category === 'meme') {
        filtered = filtered.filter(c => c.category === 'meme' || ['DOGE', 'SHIB', 'PEPE', 'WIF', 'BONK', 'FLOKI', 'MEME', 'POPCAT', 'BRETT', 'BOME'].includes(c.symbol.toUpperCase()));
      } else if (params.category === 'stable') {
        filtered = filtered.filter(c => c.category === 'stable' || ['USDT', 'USDC', 'DAI', 'FDUSD', 'TUSD', 'USDD', 'FRAX', 'PYUSD'].includes(c.symbol.toUpperCase()));
      } else {
        filtered = filtered.filter(c => c.category === params.category);
      }
    }

    // Filter by text search query
    if (params.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase();
      filtered = filtered.filter(c =>
        c.symbol.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.network.toLowerCase().includes(q) ||
        (c.contractAddress && c.contractAddress.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sortBy = params.sortBy || 'rank';
    const sortDir = params.sortDir || 'asc';

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'rank') {
        comparison = (a.rank || 999) - (b.rank || 999);
      } else if (sortBy === 'price') {
        comparison = (b.priceUsd || 0) - (a.priceUsd || 0);
      } else if (sortBy === 'change') {
        comparison = (b.change24h || 0) - (a.change24h || 0);
      } else if (sortBy === 'volume') {
        comparison = (b.volume24hUsd || 0) - (a.volume24hUsd || 0);
      } else if (sortBy === 'marketCap') {
        comparison = (b.marketCapUsd || 0) - (a.marketCapUsd || 0);
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });

    const total = filtered.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const startIndex = (page - 1) * pageSize;
    const paginatedCoins = pageSize >= 9999 ? filtered : filtered.slice(startIndex, startIndex + pageSize);

    return {
      coins: paginatedCoins,
      total
    };
  }

  public createCustomTradePair(baseSymbol: string, quoteSymbol: string = 'USDT'): TradePair | null {
    const baseCoin = this.getCoinBySymbol(baseSymbol) || buildLetsExchange22MMarketsCatalog().find(c => c.symbol.toUpperCase() === baseSymbol.trim().toUpperCase());
    if (!baseCoin) return null;
    return this.buildTradePairFromCoin(baseCoin, quoteSymbol.trim().toUpperCase());
  }
}

export const tradeMarketsService = new TradeMarketsService();
