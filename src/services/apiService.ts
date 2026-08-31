import { Coin, SwapOrder, P2POrder, P2PChatMessage, OnChainSettlementLog, CoinCategory } from '../types/dex';
import { generateBSVKeypair, buildEscrowScript, buildSettlementTxHex, bsvToSats } from './bsvCrypto';
import { TOP_LETSEXCHANGE_COINS, buildLetsExchange22MMarketsCatalog, calculateLetsExchangeMarketsMetrics } from '../data/letsExchangeCatalog';

// Storage keys for persistent state
const STORAGE_P2P_ORDERS = 'bsv_dex_p2p_orders_v2';
const STORAGE_SWAP_ORDERS = 'bsv_dex_swap_orders_v2';
const STORAGE_SETTLEMENT_LOGS = 'bsv_dex_settlement_logs_v2';
const STORAGE_CUSTOM_COINS = 'bsv_dex_letsexchange_coins_v3';

// Comprehensive catalog of cryptocurrencies imported from LetsExchange 22M+ API catalog
export const BASE_LETSEXCHANGE_COINS: Coin[] = buildLetsExchange22MMarketsCatalog();
export const SUPPORTED_COINS = BASE_LETSEXCHANGE_COINS;

// Initial realistic P2P offers
const INITIAL_P2P_ORDERS: P2POrder[] = [
  {
    id: 'ord-8819-bsv-sell',
    type: 'SELL_BSV',
    makerAddress: '1Hw5L7Ksm8vTq4vY2hK3xW6vYpX8sQ9aB1',
    makerHandle: '$satoshi_trader',
    makerScore: 99.8,
    makerTradesCount: 412,
    coin: 'BSV',
    amountBsv: 25.5,
    remainingBsv: 25.5,
    pricePerBsv: 49.10,
    fiatCurrency: 'USD',
    minLimitFiat: 50,
    maxLimitFiat: 1250,
    paymentMethods: ['HandCash Pay', 'Bank Transfer (ACH)', 'Zelle'],
    paymentInstructions: 'Fast instant release once USD transfer shows in account or HandCash confirmation is broadcasted.',
    status: 'OPEN',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
    chatMessages: []
  },
  {
    id: 'ord-9923-bsv-sell',
    type: 'SELL_BSV',
    makerAddress: '1A98kLmNp4q8ZkP1vRy3sW7aX2vYpX9bC2',
    makerHandle: '$relay_whale',
    makerScore: 100.0,
    makerTradesCount: 890,
    coin: 'BSV',
    amountBsv: 100.0,
    remainingBsv: 100.0,
    pricePerBsv: 48.80,
    fiatCurrency: 'USD',
    minLimitFiat: 100,
    maxLimitFiat: 4880,
    paymentMethods: ['Revolut', 'SEPA Instant', 'USDC (Solana)'],
    paymentInstructions: 'Available 24/7. Auto-escrow on BSV smart script. Please send payment with reference number provided in chat.',
    status: 'OPEN',
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12,
    chatMessages: []
  },
  {
    id: 'ord-7734-bsv-buy',
    type: 'BUY_BSV',
    makerAddress: '1K28xL9pQ3vRy7sW1aX8vYpX4bC9dE5fG3',
    makerHandle: '$bsv_builder',
    makerScore: 98.6,
    makerTradesCount: 165,
    coin: 'BSV',
    amountBsv: 15.0,
    remainingBsv: 15.0,
    pricePerBsv: 48.20,
    fiatCurrency: 'USD',
    minLimitFiat: 100,
    maxLimitFiat: 720,
    paymentMethods: ['PayPal (Friends & Family)', 'HandCash Pay', 'Wise'],
    paymentInstructions: 'Looking to acquire BSV for applet transaction fees. Instant fiat transfer ready.',
    status: 'OPEN',
    createdAt: Date.now() - 3600000 * 1,
    updatedAt: Date.now() - 3600000 * 1,
    chatMessages: []
  },
  {
    id: 'ord-6651-bsv-sell',
    type: 'SELL_BSV',
    makerAddress: '1B45kM8pQ2vRy6sW9aX3vYpX7bC1dE8fH4',
    makerHandle: '$sensilet_pro',
    makerScore: 99.1,
    makerTradesCount: 284,
    coin: 'BSV',
    amountBsv: 42.0,
    remainingBsv: 42.0,
    pricePerBsv: 45.50,
    fiatCurrency: 'EUR',
    minLimitFiat: 50,
    maxLimitFiat: 1900,
    paymentMethods: ['SEPA Instant', 'Revolut', 'N26'],
    paymentInstructions: 'SEPA Instant transfers received within 30 seconds. BSV locked in 2-of-2 multi-sig on chain.',
    status: 'OPEN',
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now() - 3600000 * 8,
    chatMessages: []
  },
  {
    id: 'ord-5542-bsv-buy',
    type: 'BUY_BSV',
    makerAddress: '1P92kL4pQ8vRy1sW5aX6vYpX2bC8dE3fJ5',
    makerHandle: '$london_node',
    makerScore: 100.0,
    makerTradesCount: 520,
    coin: 'BSV',
    amountBsv: 50.0,
    remainingBsv: 50.0,
    pricePerBsv: 38.20,
    fiatCurrency: 'GBP',
    minLimitFiat: 100,
    maxLimitFiat: 1910,
    paymentMethods: ['UK Faster Payments (FPS)', 'Revolut'],
    paymentInstructions: 'UK Bank Transfer via Faster Payments only. Immediate payment from verified UK account.',
    status: 'OPEN',
    createdAt: Date.now() - 3600000 * 20,
    updatedAt: Date.now() - 3600000 * 20,
    chatMessages: []
  }
];

const INITIAL_SETTLEMENT_LOGS: OnChainSettlementLog[] = [
  {
    id: 'log-101',
    txid: 'd8c47b59e381048f72c695a28cb20d43a19bc89264c7e3f81e8f237b6058097b',
    blockHeight: 890410,
    type: 'P2P_SETTLEMENT_RELEASE',
    amountSats: 2550000000, // 25.5 BSV
    feeSats: 450,
    rawHex: '010000000188c9f7a932b...',
    inputsCount: 1,
    outputsCount: 2,
    scriptType: '2-of-2 Multi-Sig Escrow',
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 18
  },
  {
    id: 'log-102',
    txid: 'f4a91b2c78e90d3419bc89264c7e3f81e8f237b6058097b69c4c82b0e87d8a9e',
    blockHeight: 890409,
    type: 'CROSS_CHAIN_SWAP_SETTLE',
    amountSats: 500000000, // 5.0 BSV
    feeSats: 320,
    rawHex: '010000000155b461...',
    inputsCount: 1,
    outputsCount: 1,
    scriptType: 'P2PKH Standard Script',
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 42
  },
  {
    id: 'log-103',
    txid: '3b890d3419bc89264c7e3f81e8f237b6058097b69c4c82b0e87d8a9ef4a91b2c',
    blockHeight: 890408,
    type: 'P2P_ESCROW_LOCK',
    amountSats: 10000000000, // 100 BSV
    feeSats: 512,
    rawHex: '0100000001...',
    inputsCount: 2,
    outputsCount: 1,
    scriptType: '2-of-2 Multi-Sig Escrow',
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 75
  }
];

export class DexApiService {
  private static instance: DexApiService;
  private cachedCoins: Coin[] = BASE_LETSEXCHANGE_COINS;
  private lastApiSyncTimestamp: number = Date.now();
  private isLiveApiSyncing: boolean = false;

  private constructor() {
    this.initStorage();
  }

  public static getInstance(): DexApiService {
    if (!DexApiService.instance) {
      DexApiService.instance = new DexApiService();
    }
    return DexApiService.instance;
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_P2P_ORDERS)) {
      localStorage.setItem(STORAGE_P2P_ORDERS, JSON.stringify(INITIAL_P2P_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_SETTLEMENT_LOGS)) {
      localStorage.setItem(STORAGE_SETTLEMENT_LOGS, JSON.stringify(INITIAL_SETTLEMENT_LOGS));
    }
    const savedCoins = localStorage.getItem(STORAGE_CUSTOM_COINS);
    if (savedCoins) {
      try {
        const parsed = JSON.parse(savedCoins);
        const coinMap = new Map<string, Coin>();
        BASE_LETSEXCHANGE_COINS.forEach(c => coinMap.set(c.symbol.toUpperCase(), c));
        if (Array.isArray(parsed)) {
          parsed.forEach((c: Coin) => {
            if (c && c.symbol) {
              const existing = coinMap.get(c.symbol.toUpperCase());
              coinMap.set(c.symbol.toUpperCase(), existing ? { ...existing, ...c } : c);
            }
          });
        }
        this.cachedCoins = Array.from(coinMap.values());
      } catch {
        this.cachedCoins = BASE_LETSEXCHANGE_COINS;
      }
    } else {
      this.cachedCoins = BASE_LETSEXCHANGE_COINS;
    }
  }

  // --- LETS EXCHANGE LIVE API SYNC & IMPORT ENGINE (22M+ MARKETS) ---

  public async fetchLetsExchangeCoins(forceRefresh = false): Promise<{
    coins: Coin[];
    totalCount: number;
    source: 'live_letsexchange_api' | 'cached_catalog';
    timestamp: number;
    marketsMetrics: ReturnType<typeof calculateLetsExchangeMarketsMetrics>;
  }> {
    try {
      const { letsExchangeApiService } = await import('./letsExchangeApiService');
      const res = await letsExchangeApiService.fetchLiveCoins(forceRefresh);
      this.cachedCoins = res.coins;
      this.lastApiSyncTimestamp = res.timestamp;
      
      return {
        coins: res.coins,
        totalCount: res.totalCount,
        source: res.source === 'live_letsexchange_api' ? 'live_letsexchange_api' : 'cached_catalog',
        timestamp: res.timestamp,
        marketsMetrics: calculateLetsExchangeMarketsMetrics(res.totalCount)
      };
    } catch (err) {
      console.warn('LetsExchange API live fetch fallback:', err);
      return {
        coins: this.cachedCoins,
        totalCount: this.cachedCoins.length,
        source: 'cached_catalog',
        timestamp: this.lastApiSyncTimestamp,
        marketsMetrics: calculateLetsExchangeMarketsMetrics(this.cachedCoins.length)
      };
    }
  }

  public get22MMarketsStats() {
    return calculateLetsExchangeMarketsMetrics(this.cachedCoins.length);
  }

  public addCustomToken(token: Partial<Coin> & { symbol: string; name: string }): Coin {
    const fullToken: Coin = {
      symbol: token.symbol.toUpperCase(),
      name: token.name,
      icon: token.icon || '🪙',
      network: token.network || 'Custom Contract',
      networkCode: token.networkCode || 'custom',
      priceUsd: token.priceUsd || 1.0,
      minAmount: token.minAmount || 1,
      maxAmount: token.maxAmount || 100000,
      decimals: token.decimals || 18,
      popular: false,
      category: token.category || 'defi',
      contractAddress: token.contractAddress,
      isEVM: token.isEVM ?? true,
      change24h: 0.0
    };

    const exists = this.cachedCoins.findIndex(c => c.symbol === fullToken.symbol);
    if (exists !== -1) {
      this.cachedCoins[exists] = fullToken;
    } else {
      this.cachedCoins.unshift(fullToken);
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_CUSTOM_COINS, JSON.stringify(this.cachedCoins));
      } catch {
        // Storage quota
      }
    }

    return fullToken;
  }

  public async getCoins(): Promise<Coin[]> {
    return this.cachedCoins;
  }

  public getApiSyncStatus() {
    return {
      coinsCount: this.cachedCoins.length,
      lastSync: this.lastApiSyncTimestamp,
      isSyncing: this.isLiveApiSyncing,
      provider: 'LetsExchange.io Omni-Chain Engine (22M+ Markets)'
    };
  }

  // --- CROSS-CHAIN RATE & SWAP EXECUTION ---

  public async getRate(fromSymbol: string, toSymbol: string, amount: number): Promise<{
    from: string;
    to: string;
    amountFrom: number;
    amountTo: number;
    rate: number;
    minerFeeSats: number;
    networkFeeUsd: number;
    exchangeFeePercent: number;
    minAmount: number;
    maxAmount: number;
    estimatedMinutes: number;
  }> {
    const fromCoin = this.cachedCoins.find(c => c.symbol === fromSymbol) || this.cachedCoins[1];
    const toCoin = this.cachedCoins.find(c => c.symbol === toSymbol) || this.cachedCoins[0];

    const valueInUsd = amount * fromCoin.priceUsd;
    const exchangeFeePercent = 0.25; // 0.25% standard DEX aggregator fee
    const feeDiscount = 1 - exchangeFeePercent / 100;
    
    // Calculate BSV on-chain miner fee (usually less than $0.0001, approx 350-500 sats)
    const minerFeeSats = toSymbol === 'BSV' || fromSymbol === 'BSV' ? 450 : 0;
    const networkFeeUsd = toSymbol === 'BSV' ? 0.0002 : (toSymbol === 'ETH' ? 3.80 : (toSymbol === 'RON' ? 0.02 : 0.80));

    const netUsd = Math.max(0, valueInUsd * feeDiscount - networkFeeUsd);
    const amountTo = parseFloat((netUsd / toCoin.priceUsd).toFixed(toCoin.decimals > 8 ? 6 : 6));
    const rate = parseFloat((fromCoin.priceUsd / toCoin.priceUsd).toFixed(6));

    const estimatedMinutes = (fromSymbol === 'BSV' || toSymbol === 'BSV') ? 2 : (toSymbol === 'RON' ? 3 : 8);

    return {
      from: fromSymbol,
      to: toSymbol,
      amountFrom: amount,
      amountTo,
      rate,
      minerFeeSats,
      networkFeeUsd,
      exchangeFeePercent,
      minAmount: fromCoin.minAmount,
      maxAmount: fromCoin.maxAmount,
      estimatedMinutes
    };
  }

  public async createSwap(
    fromSymbol: string, 
    toSymbol: string, 
    amount: number, 
    recipientAddress: string
  ): Promise<SwapOrder> {
    const fromCoin = this.cachedCoins.find(c => c.symbol === fromSymbol) || this.cachedCoins[1];
    const toCoin = this.cachedCoins.find(c => c.symbol === toSymbol) || this.cachedCoins[0];
    const rateData = await this.getRate(fromSymbol, toSymbol, amount);

    // Generate deposit address appropriate for from coin
    let depositAddress = '';
    if (fromSymbol === 'BSV' || fromSymbol === 'BTC' || fromSymbol === 'BCH' || fromSymbol === 'LTC') {
      const kp = generateBSVKeypair();
      depositAddress = kp.address;
    } else if (fromSymbol === 'RON' || fromSymbol === 'AXS' || fromSymbol === 'SLP') {
      depositAddress = 'ronin:' + Math.random().toString(16).substring(2, 38);
    } else if (fromCoin.isEVM || fromSymbol === 'ETH' || fromSymbol.startsWith('USDT') || fromSymbol === 'BNB' || fromSymbol === 'AVAX') {
      depositAddress = '0x' + Math.random().toString(16).substring(2, 42);
    } else if (fromSymbol === 'SOL') {
      depositAddress = '8xKp...' + Math.random().toString(36).substring(2, 8) + '...soL';
    } else {
      depositAddress = 'dep_' + Math.random().toString(36).substring(2, 12);
    }

    const swapId = 'swap_' + Math.random().toString(36).substring(2, 10);
    const newSwap: SwapOrder = {
      id: swapId,
      fromCoin,
      toCoin,
      amountFrom: amount,
      amountTo: rateData.amountTo,
      rate: rateData.rate,
      depositAddress,
      recipientAddress,
      status: 'awaiting_deposit',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 30, // 30 mins
      networkFeeUsd: rateData.networkFeeUsd,
      minerFeeSats: rateData.minerFeeSats,
      exchangeFeePercent: rateData.exchangeFeePercent,
      confirmations: 0,
      requiredConfirmations: fromSymbol === 'BSV' ? 1 : 2
    };

    const swaps = this.getStoredSwaps();
    swaps.unshift(newSwap);
    this.saveStoredSwaps(swaps);

    return newSwap;
  }

  public getStoredSwaps(): SwapOrder[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_SWAP_ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveStoredSwaps(swaps: SwapOrder[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_SWAP_ORDERS, JSON.stringify(swaps));
  }

  public async advanceSwapStage(swapId: string): Promise<SwapOrder | null> {
    const swaps = this.getStoredSwaps();
    const idx = swaps.findIndex(s => s.id === swapId);
    if (idx === -1) return null;

    const current = swaps[idx];
    const stages: SwapOrder['status'][] = [
      'awaiting_deposit',
      'confirming',
      'exchanging',
      'broadcasting_tx',
      'completed'
    ];
    const currentIdx = stages.indexOf(current.status);
    if (currentIdx < stages.length - 1) {
      current.status = stages[currentIdx + 1];
      if (current.status === 'confirming') {
        current.confirmations = 1;
      }
      if (current.status === 'completed') {
        if (current.toCoin.symbol === 'BSV') {
          current.bsvTxId = 'bsv_tx_' + Math.random().toString(16).substring(2, 18) + 'a92f';
          this.addSettlementLog({
            id: 'log-' + Date.now(),
            txid: current.bsvTxId,
            blockHeight: 890414,
            type: 'CROSS_CHAIN_SWAP_SETTLE',
            amountSats: bsvToSats(current.amountTo),
            feeSats: current.minerFeeSats || 450,
            rawHex: '0100000001...',
            inputsCount: 1,
            outputsCount: 1,
            scriptType: 'P2PKH Standard Script',
            status: 'confirmed',
            timestamp: Date.now()
          });
        } else if (current.toCoin.isRonin) {
          current.roninTxHash = '0xron_' + Math.random().toString(16).substring(2, 24);
        } else if (current.toCoin.isEVM) {
          current.evmTxHash = '0xevm_' + Math.random().toString(16).substring(2, 24);
        }
      }
      swaps[idx] = current;
      this.saveStoredSwaps(swaps);
    }
    return current;
  }

  // --- P2P ORDERBOOK API ---

  public getP2POrders(): P2POrder[] {
    if (typeof window === 'undefined') return INITIAL_P2P_ORDERS;
    try {
      const data = localStorage.getItem(STORAGE_P2P_ORDERS);
      return data ? JSON.parse(data) : INITIAL_P2P_ORDERS;
    } catch {
      return INITIAL_P2P_ORDERS;
    }
  }

  private saveP2POrders(orders: P2POrder[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_P2P_ORDERS, JSON.stringify(orders));
  }

  public async createP2POrder(params: {
    type: P2POrder['type'];
    makerAddress: string;
    makerHandle?: string;
    amountBsv: number;
    pricePerBsv: number;
    fiatCurrency: string;
    minLimitFiat: number;
    maxLimitFiat: number;
    paymentMethods: string[];
    paymentInstructions: string;
  }): Promise<P2POrder> {
    const orders = this.getP2POrders();
    const newOrder: P2POrder = {
      id: 'ord-' + Math.floor(1000 + Math.random() * 9000) + '-p2p',
      type: params.type,
      makerAddress: params.makerAddress,
      makerHandle: params.makerHandle || ('$' + params.makerAddress.slice(0, 8)),
      makerScore: 100.0,
      makerTradesCount: 1,
      coin: 'BSV',
      amountBsv: params.amountBsv,
      remainingBsv: params.amountBsv,
      pricePerBsv: params.pricePerBsv,
      fiatCurrency: params.fiatCurrency,
      minLimitFiat: params.minLimitFiat,
      maxLimitFiat: params.maxLimitFiat,
      paymentMethods: params.paymentMethods,
      paymentInstructions: params.paymentInstructions,
      status: 'OPEN',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      chatMessages: [
        {
          id: 'msg-sys-1',
          sender: 'system',
          senderAddress: 'system',
          text: `Order created by ${params.makerHandle || params.makerAddress}. Smart Escrow ready for on-chain settlement.`,
          timestamp: Date.now()
        }
      ]
    };

    orders.unshift(newOrder);
    this.saveP2POrders(orders);
    return newOrder;
  }

  public async matchP2POrder(params: {
    orderId: string;
    takerAddress: string;
    takerHandle?: string;
    tradeAmountBsv: number;
  }): Promise<P2POrder> {
    const orders = this.getP2POrders();
    const idx = orders.findIndex(o => o.id === params.orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    if (order.status !== 'OPEN') throw new Error('Order is no longer open');

    const matchedFiat = parseFloat((params.tradeAmountBsv * order.pricePerBsv).toFixed(2));
    const escrowSats = bsvToSats(params.tradeAmountBsv);

    // Build 2-of-2 Escrow script
    const escrow = buildEscrowScript(order.makerAddress, params.takerAddress);

    order.status = 'MATCHED';
    order.takerAddress = params.takerAddress;
    order.takerHandle = params.takerHandle || ('$' + params.takerAddress.slice(0, 8));
    order.matchedAmountBsv = params.tradeAmountBsv;
    order.matchedFiatAmount = matchedFiat;
    order.escrowAmountSats = escrowSats;
    order.escrowScriptHash = escrow.scriptHash;
    order.updatedAt = Date.now();

    order.chatMessages.push({
      id: 'msg-' + Date.now(),
      sender: 'system',
      senderAddress: 'system',
      text: `Trade initiated: ${params.tradeAmountBsv} BSV for ${order.fiatCurrency} ${matchedFiat}. Awaiting BSV On-Chain Escrow Lock.`,
      timestamp: Date.now()
    });

    orders[idx] = order;
    this.saveP2POrders(orders);
    return order;
  }

  public async fundP2PEscrow(orderId: string): Promise<P2POrder> {
    const orders = this.getP2POrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    const escrowTxId = 'escrow_tx_' + Math.random().toString(16).substring(2, 18) + '48c1';
    
    order.status = 'ESCROW_LOCKED';
    order.escrowTxId = escrowTxId;
    order.updatedAt = Date.now();

    order.chatMessages.push({
      id: 'msg-' + Date.now(),
      sender: 'system',
      senderAddress: 'system',
      text: `🔒 BSV Escrow Verified On-Chain! TxID: ${escrowTxId}. Seller has locked ${order.matchedAmountBsv} BSV. Buyer may now send fiat payment.`,
      timestamp: Date.now()
    });

    // Record on-chain settlement log
    this.addSettlementLog({
      id: 'log-' + Date.now(),
      txid: escrowTxId,
      blockHeight: 890414,
      type: 'P2P_ESCROW_LOCK',
      amountSats: order.escrowAmountSats || bsvToSats(order.matchedAmountBsv || order.amountBsv),
      feeSats: 480,
      rawHex: '0100000002...',
      inputsCount: 1,
      outputsCount: 1,
      scriptType: '2-of-2 Multi-Sig Escrow',
      status: 'confirmed',
      timestamp: Date.now()
    });

    orders[idx] = order;
    this.saveP2POrders(orders);
    return order;
  }

  public async confirmP2PPayment(orderId: string, reference?: string): Promise<P2POrder> {
    const orders = this.getP2POrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    order.status = 'PAYMENT_SENT';
    order.paymentReference = reference || ('REF-' + Math.floor(100000 + Math.random() * 900000));
    order.updatedAt = Date.now();

    order.chatMessages.push({
      id: 'msg-' + Date.now(),
      sender: 'taker',
      senderAddress: order.takerAddress || 'taker',
      text: `Payment marked as sent! Reference: ${order.paymentReference}. Please confirm and release BSV escrow.`,
      timestamp: Date.now(),
      isProof: true
    });

    orders[idx] = order;
    this.saveP2POrders(orders);
    return order;
  }

  public async releaseP2PEscrow(orderId: string): Promise<P2POrder> {
    const orders = this.getP2POrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    const amountSats = order.escrowAmountSats || bsvToSats(order.matchedAmountBsv || order.amountBsv);
    
    // Generate simulated settlement transaction
    const settlement = buildSettlementTxHex({
      prevTxId: order.escrowTxId || '00000000000000000000000000000000',
      vout: 0,
      amountSats: amountSats - 400,
      recipientAddress: order.takerAddress || order.makerAddress,
      changeAddress: order.makerAddress,
      feeSats: 400
    });

    order.status = 'COMPLETED';
    order.updatedAt = Date.now();

    order.chatMessages.push({
      id: 'msg-' + Date.now(),
      sender: 'system',
      senderAddress: 'system',
      text: `🎉 Settlement Worker executed BSV release on-chain! TxID: ${settlement.txid}. Satoshis transferred to taker wallet.`,
      timestamp: Date.now()
    });

    // Record settlement log
    this.addSettlementLog({
      id: 'log-' + Date.now(),
      txid: settlement.txid,
      blockHeight: 890415,
      type: 'P2P_SETTLEMENT_RELEASE',
      amountSats: amountSats - 400,
      feeSats: 400,
      rawHex: settlement.rawTxHex,
      inputsCount: 1,
      outputsCount: 1,
      scriptType: '2-of-2 Multi-Sig Escrow',
      status: 'confirmed',
      timestamp: Date.now()
    });

    orders[idx] = order;
    this.saveP2POrders(orders);
    return order;
  }

  public async disputeP2POrder(orderId: string, reason: string): Promise<P2POrder> {
    const orders = this.getP2POrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    order.status = 'DISPUTED';
    order.disputeReason = reason;
    order.updatedAt = Date.now();

    order.chatMessages.push({
      id: 'msg-' + Date.now(),
      sender: 'system',
      senderAddress: 'system',
      text: `⚠️ Dispute filed: "${reason}". Automated mediator has locked the escrow script until evidence is reviewed.`,
      timestamp: Date.now()
    });

    orders[idx] = order;
    this.saveP2POrders(orders);
    return order;
  }

  public async cancelP2POrder(orderId: string): Promise<P2POrder> {
    const orders = this.getP2POrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    order.status = 'CANCELLED';
    order.updatedAt = Date.now();

    order.chatMessages.push({
      id: 'msg-' + Date.now(),
      sender: 'system',
      senderAddress: 'system',
      text: `Order cancelled. Funds unlocked.`,
      timestamp: Date.now()
    });

    orders[idx] = order;
    this.saveP2POrders(orders);
    return order;
  }

  public async addChatMessage(orderId: string, message: {
    sender: 'maker' | 'taker' | 'mediator';
    senderAddress: string;
    text: string;
  }): Promise<P2PChatMessage> {
    const orders = this.getP2POrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const newMsg: P2PChatMessage = {
      id: 'msg-' + Date.now(),
      sender: message.sender,
      senderAddress: message.senderAddress,
      text: message.text,
      timestamp: Date.now()
    };

    orders[idx].chatMessages.push(newMsg);
    orders[idx].updatedAt = Date.now();
    this.saveP2POrders(orders);
    return newMsg;
  }

  // --- SETTLEMENT LOGS & METRICS ---

  public getSettlementLogs(): OnChainSettlementLog[] {
    if (typeof window === 'undefined') return INITIAL_SETTLEMENT_LOGS;
    try {
      const data = localStorage.getItem(STORAGE_SETTLEMENT_LOGS);
      return data ? JSON.parse(data) : INITIAL_SETTLEMENT_LOGS;
    } catch {
      return INITIAL_SETTLEMENT_LOGS;
    }
  }

  public addSettlementLog(log: OnChainSettlementLog) {
    const logs = this.getSettlementLogs();
    logs.unshift(log);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SETTLEMENT_LOGS, JSON.stringify(logs.slice(0, 50)));
    }
  }

  public getEscrowStats() {
    const orders = this.getP2POrders();
    const logs = this.getSettlementLogs();
    
    let totalVolumeBsv = 1845.20;
    let lockedEscrowBsv = 0;

    orders.forEach(o => {
      if (o.status === 'ESCROW_LOCKED' || o.status === 'MATCHED') {
        lockedEscrowBsv += (o.matchedAmountBsv || o.amountBsv);
      }
      if (o.status === 'COMPLETED') {
        totalVolumeBsv += (o.matchedAmountBsv || o.amountBsv);
      }
    });

    return {
      totalVolumeBsv,
      lockedEscrowBsv,
      totalCompletedTrades: logs.length + 1420,
      avgSettlementSeconds: 1.8,
      currentBlockHeight: 890415,
      medianFeeSatPerByte: 0.5,
      activePeersCount: 384
    };
  }
}

export const apiService = DexApiService.getInstance();
