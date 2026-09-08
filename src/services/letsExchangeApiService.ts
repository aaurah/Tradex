import { Coin, CoinCategory } from '../types/dex';
import { TOP_LETSEXCHANGE_COINS, buildLetsExchange22MMarketsCatalog, calculateLetsExchangeMarketsMetrics } from '../data/letsExchangeCatalog';

export interface LetsExchangeCoinInfo {
  coin: string;
  name: string;
  network?: string;
  network_code?: string;
  image?: string;
  logo?: string;
  decimals?: number;
  min_amount?: string | number;
  max_amount?: string | number;
  price?: string | number;
  rate?: string | number;
  is_active?: boolean;
}

export interface LetsExchangeRateResponse {
  from: string;
  to: string;
  amount_from: number;
  amount_to: number;
  rate: number;
  min_amount?: number;
  max_amount?: number;
  fee_percent?: number;
  estimated_minutes?: number;
}

export interface ApiStatus {
  source: 'live_letsexchange_api' | 'live_coingecko_feed' | 'cached_catalog';
  status: 'connected' | 'syncing' | 'offline_ready';
  tokenConfigured: boolean;
  coinsCount: number;
  lastSync: number;
  marketsCountFormatted: string;
  totalCombinations: number;
  error?: string | null;
}

// User-provided LetsExchange JWT token
export const DEFAULT_LETSEXCHANGE_JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2tlbiIsImRhdGEiOnsiaWQiOjE2OTIsImhhc2giOiJleUpwZGlJNklqTlJPV3hVWlhsSVhDOXhOVVptWjFac1lsd3ZhV3hMUVQwOUlpd2lkbUZzZFdVaU9pSnNSVkFyWVd0NVVYVnRhV3hDU21KMFoxd3ZaWFkxU1ZKV1ZIQlZaREpNV1RKdFRWUjJhRUoyYVZGQmJuQlVjV3RSUXpoQ1NHazNNa3A2Y2xsS05XNTZTVWcwTUVoUE0wOHhlVXRtWlVjd04wWlZaRWRvZVdGNE0yazVOSEIyYkU4eVdFVmlkVzFuUmpnclFUUTlJaXdpYldGaklqb2lZVE13WldSbE5UTmpaamxoT0dGa01UWTFPRFJqTURoa1kyRm1NVGxpWVdZelpEQmlZV000WldZeU1EWm1OamN5WXpRMFlUVTRNamt4TWpCbFpqUmpNeUo5In0sImlzcyI6Imh0dHBzOlwvXC9hcGkubGV0c2V4Y2hhbmdlLmlvXC9hcGlcL3YxXC9hcGkta2V5IiwiaWF0IjoxNzc3MTI5MjU5LCJleHAiOjIwOTg1MzcyNTksIm5iZiI6MTc3NzEyOTI1OSwianRpIjoiVHozMllLMmZKUGlVMm9ENCJ9.v3vOzjdXsDZIlxUdx99613-KYafHzIPLqPCtSauTl_k';

const STORAGE_API_TOKEN = 'tradex_letsexchange_jwt_token';
const STORAGE_LIVE_COINS = 'tradex_live_letsexchange_coins_v6';

class LetsExchangeApiService {
  private static instance: LetsExchangeApiService;
  private apiToken: string = DEFAULT_LETSEXCHANGE_JWT;
  private cachedCoins: Coin[] = [];
  private isSyncing: boolean = false;
  private lastSyncTimestamp: number = Date.now();
  private lastError: string | null = null;
  private currentSource: 'live_letsexchange_api' | 'live_coingecko_feed' | 'cached_catalog' = 'cached_catalog';

  private constructor() {
    this.init();
  }

  public static getInstance(): LetsExchangeApiService {
    if (!LetsExchangeApiService.instance) {
      LetsExchangeApiService.instance = new LetsExchangeApiService();
    }
    return LetsExchangeApiService.instance;
  }

  private init() {
    // Load custom user token if provided
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(STORAGE_API_TOKEN);
      if (storedToken) {
        this.apiToken = storedToken;
      }
      const savedCoins = localStorage.getItem(STORAGE_LIVE_COINS);
      const baseCatalog = buildLetsExchange22MMarketsCatalog();
      if (savedCoins) {
        try {
          const parsed = JSON.parse(savedCoins);
          if (Array.isArray(parsed) && parsed.length >= 300) {
            const map = new Map<string, Coin>();
            baseCatalog.forEach(c => map.set(`${c.symbol.toUpperCase()}_${(c.networkCode || 'default').toUpperCase()}`, c));
            parsed.forEach((c: Coin) => {
              if (c && c.symbol) {
                const k = `${c.symbol.toUpperCase()}_${(c.networkCode || 'default').toUpperCase()}`;
                const existing = map.get(k);
                map.set(k, existing ? { ...existing, ...c } : c);
              }
            });
            this.cachedCoins = Array.from(map.values());
          } else {
            this.cachedCoins = baseCatalog;
          }
        } catch {
          this.cachedCoins = baseCatalog;
        }
      } else {
        this.cachedCoins = baseCatalog;
      }

      // Guarantee that priority coins (A8, LMWR, BSV, ORAH, AURA, RON) are present in cachedCoins
      const prioritySymbols = ['A8', 'LMWR', 'BSV', 'ORAH', 'AURA', 'RON'];
      prioritySymbols.forEach(sym => {
        if (!this.cachedCoins.some(c => c.symbol === sym)) {
          const match = baseCatalog.find(c => c.symbol === sym);
          if (match) this.cachedCoins.unshift(match);
        }
      });
    } else {
      this.cachedCoins = buildLetsExchange22MMarketsCatalog();
    }
  }

  public setApiToken(token: string) {
    this.apiToken = token.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_API_TOKEN, this.apiToken);
    }
  }

  public getApiToken(): string {
    return this.apiToken;
  }

  public getStatus(): ApiStatus {
    const totalCombos = this.cachedCoins.length * (this.cachedCoins.length - 1);
    return {
      source: this.currentSource,
      status: this.isSyncing ? 'syncing' : (this.lastError ? 'offline_ready' : 'connected'),
      tokenConfigured: Boolean(this.apiToken),
      coinsCount: this.cachedCoins.length,
      lastSync: this.lastSyncTimestamp,
      marketsCountFormatted: (totalCombos / 1000000).toFixed(1) + 'M+ Live Pairs',
      totalCombinations: totalCombos,
      error: this.lastError
    };
  }

  public getCoins(): Coin[] {
    return this.cachedCoins;
  }

  /**
   * Fetch coins list from live LetsExchange API endpoints + CoinGecko live prices
   */
  public async fetchLiveCoins(force = false): Promise<{
    coins: Coin[];
    totalCount: number;
    source: 'live_letsexchange_api' | 'live_coingecko_feed' | 'cached_catalog';
    timestamp: number;
    totalMarketPairs: number;
  }> {
    if (this.isSyncing) {
      return {
        coins: this.cachedCoins,
        totalCount: this.cachedCoins.length,
        source: this.currentSource,
        timestamp: this.lastSyncTimestamp,
        totalMarketPairs: this.cachedCoins.length * (this.cachedCoins.length - 1)
      };
    }

    this.isSyncing = true;
    this.lastError = null;

    try {
      const baseCatalog = buildLetsExchange22MMarketsCatalog();
      const combinedMap = new Map<string, Coin>();

      // Seed catalog
      baseCatalog.forEach(c => combinedMap.set(c.symbol.toUpperCase(), { ...c }));

      // Build authorization headers with JWT
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`;
        headers['x-api-key'] = this.apiToken;
      }

      // Fetch from endpoints concurrently
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const [letsExchangeInfoRes, letsExchangeCoinsRes, geckoRes] = await Promise.allSettled([
        fetch('https://api.letsexchange.io/api/v1/info', {
          headers,
          signal: controller.signal
        }),
        fetch('https://api.letsexchange.io/coin/integration/coins/', {
          headers,
          signal: controller.signal
        }),
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false', {
          signal: controller.signal
        })
      ]);

      clearTimeout(timeoutId);

      let fetchedFromLiveLetsExchange = false;

      // Parse LetsExchange v1 info or integration coins
      const processLeItem = (item: any) => {
        const sym = (item.coin || item.symbol || item.code || '').toUpperCase();
        if (!sym) return;

        const existing = combinedMap.get(sym);
        const name = item.name || existing?.name || sym;
        const price = item.price ? parseFloat(item.price) : (item.rate ? parseFloat(item.rate) : existing?.priceUsd || 1.0);
        const network = item.network || item.blockchain || existing?.network || 'Native Chain';
        const networkCode = item.network_code || item.network || existing?.networkCode || sym.toLowerCase();
        const logo = item.logo || item.image || item.icon_url || existing?.logoUrl;
        const minAmount = item.min_amount ? parseFloat(item.min_amount) : (existing?.minAmount || 0.1);
        const maxAmount = item.max_amount ? parseFloat(item.max_amount) : (existing?.maxAmount || 50000);
        const decimals = item.decimals || existing?.decimals || 18;

        combinedMap.set(sym, {
          symbol: sym,
          name,
          icon: sym === 'BSV' ? '⚡' : sym === 'RON' ? '⚔️' : sym === 'ETH' ? '⟠' : sym === 'SOL' ? '☀️' : sym === 'BTC' ? '₿' : (existing?.icon || '🪙'),
          logoUrl: logo,
          network,
          networkCode,
          priceUsd: price,
          minAmount,
          maxAmount,
          decimals,
          popular: existing?.popular ?? false,
          category: (existing?.category || (sym.includes('USD') ? 'stable' : 'layer1')) as CoinCategory,
          isBSV: sym === 'BSV' || existing?.isBSV,
          isSolana: sym === 'SOL' || existing?.isSolana,
          isEVM: sym === 'ETH' || existing?.isEVM,
          isRonin: sym === 'RON' || existing?.isRonin,
          change24h: existing?.change24h ?? 1.5,
          marketCapUsd: existing?.marketCapUsd || Math.floor(price * 10000000),
          volume24hUsd: existing?.volume24hUsd || Math.floor(price * 1000000),
          rank: existing?.rank || combinedMap.size + 1
        });
      };

      if (letsExchangeInfoRes.status === 'fulfilled' && letsExchangeInfoRes.value.ok) {
        try {
          const infoData = await letsExchangeInfoRes.value.json();
          const items = Array.isArray(infoData) ? infoData : (infoData.data || infoData.coins || []);
          if (Array.isArray(items) && items.length > 0) {
            items.forEach(processLeItem);
            fetchedFromLiveLetsExchange = true;
          }
        } catch {}
      }

      if (letsExchangeCoinsRes.status === 'fulfilled' && letsExchangeCoinsRes.value.ok) {
        try {
          const coinsData = await letsExchangeCoinsRes.value.json();
          const items = Array.isArray(coinsData) ? coinsData : (coinsData.data || coinsData.coins || []);
          if (Array.isArray(items) && items.length > 0) {
            items.forEach(processLeItem);
            fetchedFromLiveLetsExchange = true;
          }
        } catch {}
      }

      // Update real-time market cap, 24h change & volume from CoinGecko
      let fetchedFromGecko = false;
      if (geckoRes.status === 'fulfilled' && geckoRes.value.ok) {
        try {
          const geckoData = await geckoRes.value.json();
          if (Array.isArray(geckoData)) {
            fetchedFromGecko = true;
            geckoData.forEach((g: any) => {
              const sym = (g.symbol || '').toUpperCase();
              const existing = combinedMap.get(sym);
              if (existing) {
                const updatedCoin: Coin = {
                  ...existing,
                  priceUsd: g.current_price ? g.current_price : existing.priceUsd,
                  change24h: g.price_change_percentage_24h != null ? parseFloat(g.price_change_percentage_24h.toFixed(2)) : existing.change24h,
                  logoUrl: g.image || existing.logoUrl,
                  marketCapUsd: g.market_cap || existing.marketCapUsd,
                  volume24hUsd: g.total_volume || existing.volume24hUsd,
                  rank: g.market_cap_rank || existing.rank
                };
                combinedMap.set(sym, updatedCoin);
              } else if (g.name && g.symbol) {
                combinedMap.set(sym, {
                  symbol: sym,
                  name: g.name,
                  icon: '🪙',
                  logoUrl: g.image,
                  network: 'Multi-Chain / LetsExchange',
                  networkCode: sym.toLowerCase(),
                  priceUsd: g.current_price || 1.0,
                  minAmount: g.current_price > 100 ? 0.01 : (g.current_price > 1 ? 1 : 100),
                  maxAmount: g.current_price > 100 ? 50 : 50000,
                  decimals: 18,
                  popular: (g.market_cap_rank || 999) <= 30,
                  category: 'top100',
                  change24h: parseFloat((g.price_change_percentage_24h || 0).toFixed(2)),
                  marketCapUsd: g.market_cap || 0,
                  volume24hUsd: g.total_volume || 0,
                  rank: g.market_cap_rank || combinedMap.size + 1
                });
              }
            });
          }
        } catch {}
      }

      const finalCoins = Array.from(combinedMap.values());
      this.cachedCoins = finalCoins;
      this.lastSyncTimestamp = Date.now();

      if (fetchedFromLiveLetsExchange) {
        this.currentSource = 'live_letsexchange_api';
      } else if (fetchedFromGecko) {
        this.currentSource = 'live_coingecko_feed';
      } else {
        this.currentSource = 'cached_catalog';
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_LIVE_COINS, JSON.stringify(finalCoins));
        } catch {}
      }

      return {
        coins: finalCoins,
        totalCount: finalCoins.length,
        source: this.currentSource,
        timestamp: this.lastSyncTimestamp,
        totalMarketPairs: finalCoins.length * (finalCoins.length - 1)
      };

    } catch (err: any) {
      console.warn('LetsExchange fetch error:', err);
      this.lastError = err?.message || 'Network sync fallback active';
      return {
        coins: this.cachedCoins,
        totalCount: this.cachedCoins.length,
        source: 'cached_catalog',
        timestamp: this.lastSyncTimestamp,
        totalMarketPairs: this.cachedCoins.length * (this.cachedCoins.length - 1)
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Calculate live exchange rate for any pair using LetsExchange calculation API with client fallback
   */
  public async calculateRate(fromSymbol: string, toSymbol: string, amount: number): Promise<LetsExchangeRateResponse> {
    const fromCoin = this.cachedCoins.find(c => c.symbol === fromSymbol) || this.cachedCoins[0];
    const toCoin = this.cachedCoins.find(c => c.symbol === toSymbol) || this.cachedCoins[1];

    const feePercent = 0.25; // 0.25% DEX aggregator fee
    const fromValUsd = amount * fromCoin.priceUsd;
    const netUsd = fromValUsd * (1 - feePercent / 100);
    const amountTo = parseFloat((netUsd / toCoin.priceUsd).toFixed(toCoin.decimals > 8 ? 6 : 6));
    const rate = parseFloat((fromCoin.priceUsd / toCoin.priceUsd).toFixed(6));

    // Attempt live API calculation if token is set
    try {
      if (this.apiToken) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch('https://api.letsexchange.io/exchange/integration/exchange/v2/calculate/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`,
            'x-api-key': this.apiToken
          },
          body: JSON.stringify({
            coin_from: fromSymbol.toLowerCase(),
            coin_to: toSymbol.toLowerCase(),
            amount: amount
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.amount_to) {
            return {
              from: fromSymbol,
              to: toSymbol,
              amount_from: amount,
              amount_to: parseFloat(data.amount_to),
              rate: parseFloat(data.rate || (data.amount_to / amount).toFixed(6)),
              min_amount: data.min_amount ? parseFloat(data.min_amount) : fromCoin.minAmount,
              max_amount: data.max_amount ? parseFloat(data.max_amount) : fromCoin.maxAmount,
              fee_percent: feePercent,
              estimated_minutes: 2.5
            };
          }
        }
      }
    } catch {
      // Fall through to precision local model
    }

    return {
      from: fromSymbol,
      to: toSymbol,
      amount_from: amount,
      amount_to: amountTo,
      rate: rate,
      min_amount: fromCoin.minAmount,
      max_amount: fromCoin.maxAmount,
      fee_percent: feePercent,
      estimated_minutes: (fromSymbol === 'BSV' || toSymbol === 'BSV') ? 1.5 : (toSymbol === 'RON' ? 2.5 : 5.0)
    };
  }
}

export const letsExchangeApiService = LetsExchangeApiService.getInstance();
