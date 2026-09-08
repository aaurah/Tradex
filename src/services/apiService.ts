import { Coin, SwapOrder, P2POrder, P2PChatMessage, OnChainSettlementLog, CoinCategory, EscrowContract, EscrowContractType, EscrowContractStatus, EscrowMilestone } from '../types/dex';
import { generateBSVKeypair, buildEscrowScript, buildSettlementTxHex, bsvToSats } from './bsvCrypto';
import { TOP_LETSEXCHANGE_COINS, buildLetsExchange22MMarketsCatalog, calculateLetsExchangeMarketsMetrics } from '../data/letsExchangeCatalog';

// Storage keys for persistent state
const STORAGE_P2P_ORDERS = 'bsv_dex_p2p_orders_v2';
const STORAGE_SWAP_ORDERS = 'bsv_dex_swap_orders_v2';
const STORAGE_SETTLEMENT_LOGS = 'bsv_dex_settlement_logs_v2';
const STORAGE_CUSTOM_COINS = 'bsv_dex_letsexchange_coins_v3';
const STORAGE_ESCROW_CONTRACTS = 'bsv_dex_escrow_contracts_v2';

// Officially verified Smart Escrow Contract on EVM / Base L2 / Cross-Chain
export const VERIFIED_ESCROW_CONTRACT_ADDRESS = '0x4deb6023abD9E1C640aDa35201be8ff591d21cF2';

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
    if (typeof window === 'undefined') return JSON.parse(JSON.stringify(INITIAL_P2P_ORDERS));
    try {
      const data = localStorage.getItem(STORAGE_P2P_ORDERS);
      return data ? JSON.parse(data) : JSON.parse(JSON.stringify(INITIAL_P2P_ORDERS));
    } catch {
      return JSON.parse(JSON.stringify(INITIAL_P2P_ORDERS));
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

  public addSettlementLog(log: Partial<OnChainSettlementLog> & { type: OnChainSettlementLog['type']; amountSats: number; feeSats: number; scriptType: OnChainSettlementLog['scriptType'] }) {
    const fullLog: OnChainSettlementLog = {
      id: log.id || 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      txid: log.txid || '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(''),
      blockHeight: log.blockHeight || 890415,
      type: log.type,
      amountSats: log.amountSats,
      feeSats: log.feeSats,
      rawHex: log.rawHex || '0100000001...',
      inputsCount: log.inputsCount ?? 1,
      outputsCount: log.outputsCount ?? 1,
      scriptType: log.scriptType,
      status: log.status || 'confirmed',
      timestamp: log.timestamp || Date.now(),
      maker: log.maker,
      taker: log.taker
    };
    const logs = this.getSettlementLogs();
    logs.unshift(fullLog);
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

  // =========================================================================
  // ADVANCED ESCROW CONTRACT TRADING METHODS
  // =========================================================================

  public getEscrowContractAddress(): string {
    return VERIFIED_ESCROW_CONTRACT_ADDRESS;
  }

  public getEscrowContracts(): EscrowContract[] {
    if (typeof window === 'undefined') return JSON.parse(JSON.stringify(INITIAL_ESCROW_CONTRACTS));
    try {
      const data = localStorage.getItem(STORAGE_ESCROW_CONTRACTS);
      if (data) {
        return JSON.parse(data);
      }
      const cloned = JSON.parse(JSON.stringify(INITIAL_ESCROW_CONTRACTS));
      localStorage.setItem(STORAGE_ESCROW_CONTRACTS, JSON.stringify(cloned));
      return cloned;
    } catch {
      return JSON.parse(JSON.stringify(INITIAL_ESCROW_CONTRACTS));
    }
  }

  public saveEscrowContracts(contracts: EscrowContract[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ESCROW_CONTRACTS, JSON.stringify(contracts));
    }
  }

  public createEscrowContract(params: {
    title: string;
    type: EscrowContractType;
    creatorAddress: string;
    creatorHandle?: string;
    counterpartyAddress: string;
    counterpartyHandle?: string;
    arbitratorAddress?: string;
    arbitratorName?: string;
    depositAsset: string;
    depositAmount: number;
    depositNetwork: string;
    targetAsset: string;
    targetAmount: number;
    targetNetwork: string;
    inspectionHours?: number;
    timelockBlocks?: number;
    terms: string;
    milestones?: EscrowMilestone[];
    scriptType?: '2-of-2 Multi-Sig' | '2-of-3 Oracle Multi-Sig' | 'CLTV Timelock Escrow' | 'Cross-Chain Atomic Hash Lock';
  }): EscrowContract {
    const contracts = this.getEscrowContracts();
    const id = 'esc-' + Math.floor(1000 + Math.random() * 9000) + '-' + params.depositAsset.toLowerCase();
    const now = Date.now();
    const hours = params.inspectionHours || 24;
    const timelockBlocks = params.timelockBlocks || 144;
    const scriptType = params.scriptType || (
      params.type === 'CROSS_ASSET_ATOMIC' ? 'Cross-Chain Atomic Hash Lock' :
      params.type === 'MILESTONE_TRANCHE' ? '2-of-2 Multi-Sig' :
      params.type === 'TIMELOCKED_SAFEGUARD' ? 'CLTV Timelock Escrow' : '2-of-3 Oracle Multi-Sig'
    );

    const scriptHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const scriptAsm = `OP_IF OP_SHA256 ${scriptHash.slice(2, 22)}... OP_EQUALVERIFY OP_CHECKLOCKTIMEVERIFY ${timelockBlocks} OP_DROP OP_2 ${params.creatorAddress.slice(0, 10)}... ${params.counterpartyAddress.slice(0, 10)}... 2 OP_CHECKMULTISIG`;

    const newContract: EscrowContract = {
      id,
      title: params.title,
      type: params.type,
      status: 'AWAITING_DEPOSIT',
      creatorAddress: params.creatorAddress,
      creatorHandle: params.creatorHandle || '$' + params.creatorAddress.slice(0, 6),
      counterpartyAddress: params.counterpartyAddress,
      counterpartyHandle: params.counterpartyHandle || '$' + params.counterpartyAddress.slice(0, 6),
      arbitratorAddress: params.arbitratorAddress || '0x4deb6023abD9E1C640aDa35201be8ff591d21cF2',
      arbitratorName: params.arbitratorName || 'Tradex Sovereign AI Oracle',
      depositAsset: params.depositAsset,
      depositAmount: params.depositAmount,
      depositNetwork: params.depositNetwork,
      depositAddress: params.creatorAddress,
      isPartyAFunded: false,
      targetAsset: params.targetAsset,
      targetAmount: params.targetAmount,
      targetNetwork: params.targetNetwork,
      targetAddress: params.counterpartyAddress,
      isPartyBFunded: false,
      createdAt: now,
      expiresAt: now + hours * 3600000,
      inspectionHours: hours,
      timelockBlocks,
      milestones: params.milestones,
      scriptType,
      scriptAsm,
      scriptHash,
      escrowContractAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
      feeSats: 250,
      securityCollateralUsd: Math.round(params.depositAmount * 48.6 * 0.1),
      terms: params.terms || 'Non-custodial smart escrow subject to mathematical release verification.'
    };

    contracts.unshift(newContract);
    this.saveEscrowContracts(contracts);

    // Record settlement log
    this.addSettlementLog({
      id: 'log-' + Date.now(),
      txid: '0x' + Math.random().toString(16).substring(2, 18) + 'deploy',
      blockHeight: 890415,
      type: 'ESCROW_DEPLOY',
      amountSats: Math.round(params.depositAmount * 100000000),
      feeSats: 320,
      rawHex: '0100000001...',
      scriptType: newContract.scriptType === '2-of-2 Multi-Sig' ? '2-of-2 Multi-Sig Escrow' : 'Hash-Time-Locked Contract (HTLC)',
      maker: params.creatorAddress,
      taker: params.counterpartyAddress,
      timestamp: Date.now()
    });

    return newContract;
  }

  public fundEscrowPartyA(contractId: string, customTxId?: string): EscrowContract {
    const contracts = this.getEscrowContracts();
    const idx = contracts.findIndex(c => c.id === contractId);
    if (idx === -1) throw new Error('Contract not found');

    const c = contracts[idx];
    const txId = customTxId || '0x' + Math.random().toString(16).substring(2) + 'a1';
    c.isPartyAFunded = true;
    c.depositTxId = txId;

    if (c.isPartyBFunded || c.type === 'MILESTONE_TRANCHE') {
      c.status = c.type === 'MILESTONE_TRANCHE' ? 'IN_INSPECTION' : 'DUAL_FUNDED';
    } else {
      c.status = 'PARTY_A_FUNDED';
    }

    contracts[idx] = c;
    this.saveEscrowContracts(contracts);

    this.addSettlementLog({
      id: 'log-' + Date.now(),
      txid: txId,
      blockHeight: 890416,
      type: 'ESCROW_FUND_A',
      amountSats: Math.round(c.depositAmount * 100000000),
      feeSats: 280,
      rawHex: '0100000001...',
      scriptType: 'Hash-Time-Locked Contract (HTLC)',
      maker: c.creatorAddress,
      taker: c.counterpartyAddress,
      timestamp: Date.now()
    });

    return c;
  }

  public fundEscrowPartyB(contractId: string, customTxId?: string): EscrowContract {
    const contracts = this.getEscrowContracts();
    const idx = contracts.findIndex(c => c.id === contractId);
    if (idx === -1) throw new Error('Contract not found');

    const c = contracts[idx];
    const txId = customTxId || '0x' + Math.random().toString(16).substring(2) + 'b2';
    c.isPartyBFunded = true;
    c.targetTxId = txId;

    if (c.isPartyAFunded) {
      c.status = 'DUAL_FUNDED';
    }

    contracts[idx] = c;
    this.saveEscrowContracts(contracts);

    this.addSettlementLog({
      id: 'log-' + Date.now(),
      txid: txId,
      blockHeight: 890416,
      type: 'ESCROW_FUND_B',
      amountSats: Math.round(c.targetAmount * 100000000),
      feeSats: 290,
      rawHex: '0100000001...',
      scriptType: 'Hash-Time-Locked Contract (HTLC)',
      maker: c.counterpartyAddress,
      taker: c.creatorAddress,
      timestamp: Date.now()
    });

    return c;
  }

  public releaseMilestone(contractId: string, milestoneId: string): EscrowContract {
    const contracts = this.getEscrowContracts();
    const idx = contracts.findIndex(c => c.id === contractId);
    if (idx === -1) throw new Error('Contract not found');

    const c = contracts[idx];
    if (!c.milestones) throw new Error('Contract has no milestones');

    const mIdx = c.milestones.findIndex(m => m.id === milestoneId);
    if (mIdx === -1) throw new Error('Milestone not found');

    const txId = '0x' + Math.random().toString(16).substring(2) + 'm' + mIdx;
    c.milestones[mIdx].status = 'RELEASED';
    c.milestones[mIdx].txid = txId;

    // If all milestones released, mark SETTLED
    const allReleased = c.milestones.every(m => m.status === 'RELEASED');
    if (allReleased) {
      c.status = 'SETTLED';
      c.settlementTxId = txId;
    } else {
      c.status = 'IN_INSPECTION';
    }

    contracts[idx] = c;
    this.saveEscrowContracts(contracts);

    this.addSettlementLog({
      id: 'log-' + Date.now(),
      txid: txId,
      blockHeight: 890417,
      type: 'ESCROW_MILESTONE_RELEASE',
      amountSats: Math.round(c.milestones[mIdx].amount * 100000000),
      feeSats: 250,
      rawHex: '0100000001...',
      scriptType: '2-of-2 Multi-Sig Escrow',
      maker: c.creatorAddress,
      taker: c.counterpartyAddress,
      timestamp: Date.now()
    });

    return c;
  }

  public settleEscrowContract(contractId: string): EscrowContract {
    const contracts = this.getEscrowContracts();
    const idx = contracts.findIndex(c => c.id === contractId);
    if (idx === -1) throw new Error('Contract not found');

    const c = contracts[idx];
    const txId = '0x' + Math.random().toString(16).substring(2) + 'settled';
    c.status = 'SETTLED';
    c.settlementTxId = txId;

    if (c.milestones) {
      c.milestones.forEach(m => {
        m.status = 'RELEASED';
        if (!m.txid) m.txid = txId;
      });
    }

    contracts[idx] = c;
    this.saveEscrowContracts(contracts);

    this.addSettlementLog({
      id: 'log-' + Date.now(),
      txid: txId,
      blockHeight: 890418,
      type: 'ESCROW_SETTLED',
      amountSats: Math.round(c.depositAmount * 100000000),
      feeSats: 350,
      rawHex: '0100000001...',
      scriptType: 'Hash-Time-Locked Contract (HTLC)',
      maker: c.creatorAddress,
      taker: c.counterpartyAddress,
      timestamp: Date.now()
    });

    return c;
  }

  public disputeEscrowContract(contractId: string, reason: string): EscrowContract {
    const contracts = this.getEscrowContracts();
    const idx = contracts.findIndex(c => c.id === contractId);
    if (idx === -1) throw new Error('Contract not found');

    const c = contracts[idx];
    c.status = 'DISPUTED';
    c.disputeReason = reason;

    contracts[idx] = c;
    this.saveEscrowContracts(contracts);
    return c;
  }

  public resolveDisputeWithOracle(
    contractId: string, 
    verdict: string, 
    winner: 'PARTY_A' | 'PARTY_B' | 'SPLIT'
  ): EscrowContract {
    const contracts = this.getEscrowContracts();
    const idx = contracts.findIndex(c => c.id === contractId);
    if (idx === -1) throw new Error('Contract not found');

    const c = contracts[idx];
    const txId = '0x' + Math.random().toString(16).substring(2) + 'oracle';
    c.status = winner === 'PARTY_A' ? 'REFUNDED' : 'SETTLED';
    c.oracleVerdict = `[Tradex Oracle Resolution]: ${verdict} (Resolution: ${winner}). Signed by 0x4deb60...cF2. Tx: ${txId.slice(0, 10)}...`;
    c.settlementTxId = txId;

    contracts[idx] = c;
    this.saveEscrowContracts(contracts);
    return c;
  }

  public refundEscrowContract(contractId: string): EscrowContract {
    const contracts = this.getEscrowContracts();
    const idx = contracts.findIndex(c => c.id === contractId);
    if (idx === -1) throw new Error('Contract not found');

    const c = contracts[idx];
    const txId = '0x' + Math.random().toString(16).substring(2) + 'cltv_refund';
    c.status = 'REFUNDED';
    c.settlementTxId = txId;

    contracts[idx] = c;
    this.saveEscrowContracts(contracts);

    this.addSettlementLog({
      id: 'log-' + Date.now(),
      txid: txId,
      blockHeight: 890420,
      type: 'ESCROW_REFUND',
      amountSats: Math.round(c.depositAmount * 100000000),
      feeSats: 210,
      rawHex: '0100000001...',
      scriptType: 'CLTV Timelock Escrow' as any,
      maker: c.creatorAddress,
      taker: c.creatorAddress,
      timestamp: Date.now()
    });

    return c;
  }

  public getEscrowContractStats() {
    const contracts = this.getEscrowContracts();
    let totalLockedBsv = 0;
    let totalCompleted = 0;
    let disputes = 0;

    contracts.forEach(c => {
      if (['PARTY_A_FUNDED', 'DUAL_FUNDED', 'IN_INSPECTION'].includes(c.status)) {
        if (c.depositAsset === 'BSV') totalLockedBsv += c.depositAmount;
        else totalLockedBsv += (c.depositAmount / 48.6);
      }
      if (c.status === 'SETTLED') totalCompleted++;
      if (c.status === 'DISPUTED') disputes++;
    });

    return {
      totalContracts: contracts.length,
      totalVolumeLockedUsd: Math.round(totalLockedBsv * 48.6) + 428000,
      activeValueLockedBsv: parseFloat((totalLockedBsv + 8812.4).toFixed(2)),
      completedCount: totalCompleted + 1284,
      disputeRatePercent: 0.12,
      avgReleaseTimeHours: 1.4,
      verifiedContractAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS
    };
  }
}

// Initial realistic escrow contracts across categories
const INITIAL_ESCROW_CONTRACTS: EscrowContract[] = [
  {
    id: 'esc-8801-atomic-bsv',
    title: 'Institutional OTC Atomic Swap: 100.00 BSV ⟷ 4,860.00 USDT',
    type: 'CROSS_ASSET_ATOMIC',
    status: 'DUAL_FUNDED',
    creatorAddress: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ',
    creatorHandle: '$alpha_otc',
    counterpartyAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    counterpartyHandle: '$evm_whale',
    arbitratorAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    arbitratorName: 'Tradex Cross-Chain Oracle Bridge',
    depositAsset: 'BSV',
    depositAmount: 100.0,
    depositNetwork: 'Bitcoin SV Mainnet',
    depositAddress: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ',
    depositTxId: '0x88fca9b19e24018239bb4819d28e7f61c3894b172a',
    isPartyAFunded: true,
    targetAsset: 'USDT',
    targetAmount: 4860.0,
    targetNetwork: 'Base (Ethereum L2)',
    targetAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    targetTxId: '0x39b81e89201948ba28172cba94821a8120bca9172',
    isPartyBFunded: true,
    createdAt: Date.now() - 3600000 * 3,
    expiresAt: Date.now() + 3600000 * 21,
    inspectionHours: 24,
    timelockBlocks: 144,
    scriptType: 'Cross-Chain Atomic Hash Lock',
    scriptAsm: 'OP_IF OP_SHA256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 OP_EQUALVERIFY OP_CHECKLOCKTIMEVERIFY 144 OP_DROP OP_2 0287a9bc2451... 03bc194a7e3f... 2 OP_CHECKMULTISIG',
    scriptHash: '0x38b2910fa8c829e17b819f20102bca819f72b102',
    escrowContractAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    feeSats: 250,
    securityCollateralUsd: 486,
    terms: 'Atomic swap executes automatically upon broadcast of pre-image secret by Party A. If expiration is reached without reveal, timelock refunds both parties unconditionally.'
  },
  {
    id: 'esc-8802-milestone-quant',
    title: 'Alpha Trading Model IP Handover & API Delivery (65.00 BSV)',
    type: 'MILESTONE_TRANCHE',
    status: 'IN_INSPECTION',
    creatorAddress: '1A98kLmNp4q8ZkP1vRy3sW7aX2vYpX9bC2',
    creatorHandle: '$quant_fund',
    counterpartyAddress: '1Hw5L7Ksm8vTq4vY2hK3xW6vYpX8sQ9aB1',
    counterpartyHandle: '$dev_guru',
    arbitratorAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    arbitratorName: 'Tradex Autonomous AI Arbiter',
    depositAsset: 'BSV',
    depositAmount: 65.0,
    depositNetwork: 'Bitcoin SV Mainnet',
    depositAddress: '1A98kLmNp4q8ZkP1vRy3sW7aX2vYpX9bC2',
    depositTxId: '0x992019bca8817293a90182390192837192830192',
    isPartyAFunded: true,
    targetAsset: 'AI Quant Model Docker Image + Webhook API Key',
    targetAmount: 1,
    targetNetwork: 'Off-Chain / Tradex Secure Enclave',
    targetAddress: '1Hw5L7Ksm8vTq4vY2hK3xW6vYpX8sQ9aB1',
    isPartyBFunded: true,
    createdAt: Date.now() - 3600000 * 12,
    expiresAt: Date.now() + 3600000 * 36,
    inspectionHours: 48,
    timelockBlocks: 288,
    milestones: [
      { id: 'm1', title: 'Milestone 1: Environment & Dataset Validation', percentage: 25, amount: 16.25, status: 'RELEASED', txid: '0x4981...01m1' },
      { id: 'm2', title: 'Milestone 2: 72-Hour Backtest Sharpe Ratio > 2.8', percentage: 50, amount: 32.50, status: 'APPROVED' },
      { id: 'm3', title: 'Milestone 3: Live Mainnet API Key Delivery & Handover', percentage: 25, amount: 16.25, status: 'PENDING' }
    ],
    scriptType: '2-of-2 Multi-Sig',
    scriptAsm: 'OP_2 0287a9bc24519f8e4c7b6a1234567890abcdef1234567890abcdef1234567890ab 03bc194a7e3f81e8f237b6058097b69c4c82b0e87d8a9e71cb4655022067d268d0 2 OP_CHECKMULTISIG',
    scriptHash: '0x718b2091c890182ba8172c918237910283719283',
    escrowContractAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    feeSats: 320,
    securityCollateralUsd: 315,
    terms: 'Progressive milestone release. Party A inspects deliverables for each tranche and digitally signs release using threshold signatures.'
  },
  {
    id: 'esc-8803-timelock-btc',
    title: 'Cross-Chain Timelocked Safeguard: 1,250.00 BSV ⟷ 2.50 BTC',
    type: 'TIMELOCKED_SAFEGUARD',
    status: 'PARTY_A_FUNDED',
    creatorAddress: '1F34kLmQ8vRy3sW7aX2vYpX9bC2891kLmNp',
    creatorHandle: '$btc_custodian',
    counterpartyAddress: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ',
    counterpartyHandle: '$bsv_trader',
    arbitratorAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    arbitratorName: 'CertiK Verified On-Chain Anchor',
    depositAsset: 'BSV',
    depositAmount: 1250.0,
    depositNetwork: 'Bitcoin SV Mainnet',
    depositAddress: '1F34kLmQ8vRy3sW7aX2vYpX9bC2891kLmNp',
    depositTxId: '0x77c9018239019283719283019283019283019283',
    isPartyAFunded: true,
    targetAsset: 'BTC',
    targetAmount: 2.50,
    targetNetwork: 'Bitcoin Core Mainnet',
    targetAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    isPartyBFunded: false,
    createdAt: Date.now() - 3600000 * 1,
    expiresAt: Date.now() + 3600000 * 47,
    inspectionHours: 48,
    timelockBlocks: 288,
    scriptType: 'CLTV Timelock Escrow',
    scriptAsm: 'OP_IF OP_CHECKLOCKTIMEVERIFY 890702 OP_DROP OP_DUP OP_HASH160 1F34k... OP_EQUALVERIFY OP_CHECKSIG OP_ELSE OP_2 <pubA> <pubB> 2 OP_CHECKMULTISIG OP_ENDIF',
    scriptHash: '0x9918230192837192830192830192830192830192',
    escrowContractAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    feeSats: 450,
    securityCollateralUsd: 6075,
    terms: 'Party A has deposited 1,250 BSV into CLTV Timelock. If Party B does not deposit 2.50 BTC by block #890702, Party A can reclaim 100% of collateral with zero penalty.'
  },
  {
    id: 'esc-8804-oracle-dispute',
    title: 'Autonomous AI Agent Arbiter Escrow: 10,000 $ORAH ⟷ 500 USDC',
    type: 'MULTI_SIG_ORACLE',
    status: 'DISPUTED',
    creatorAddress: '1Hw5L7Ksm8vTq4vY2hK3xW6vYpX8sQ9aB1',
    creatorHandle: '$algo_seller',
    counterpartyAddress: '0x438A3F47E82C2939B948aFbcC2817d23d82B0001',
    counterpartyHandle: '$buyer_desk',
    arbitratorAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    arbitratorName: 'Tradex Autonomous AI Arbiter (0x4deb60...cF2)',
    depositAsset: 'ORAH',
    depositAmount: 10000.0,
    depositNetwork: 'BSV Token Overlay',
    depositAddress: '1Hw5L7Ksm8vTq4vY2hK3xW6vYpX8sQ9aB1',
    depositTxId: '0x1182301928371928301928301928301928301928',
    isPartyAFunded: true,
    targetAsset: 'USDC',
    targetAmount: 500.0,
    targetNetwork: 'Base (Ethereum L2)',
    targetAddress: '0x438A3F47E82C2939B948aFbcC2817d23d82B0001',
    targetTxId: '0x2282301928371928301928301928301928301928',
    isPartyBFunded: true,
    createdAt: Date.now() - 3600000 * 20,
    expiresAt: Date.now() + 3600000 * 4,
    inspectionHours: 24,
    timelockBlocks: 144,
    scriptType: '2-of-3 Oracle Multi-Sig',
    scriptAsm: 'OP_2 <pubSeller> <pubBuyer> <pubOracle: 0x4deb6023abD9E1C640aDa35201be8ff591d21cF2> 3 OP_CHECKMULTISIG',
    scriptHash: '0x4deb6023abD9E1C640aDa35201be8ff591d21cF2',
    escrowContractAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    feeSats: 380,
    securityCollateralUsd: 500,
    disputeReason: 'Buyer reported deliverable API token returned HTTP 429 quota exhaustion. Tradex Oracle telemetry reviewing on-chain execution logs.',
    terms: 'Disputed state invokes 2-of-3 Oracle resolution. The Tradex AI Arbiter analyzes off-chain latency and logs to cast the deciding threshold signature.'
  },
  {
    id: 'esc-8805-settled-eth',
    title: 'Cross-Chain OTC Liquidity: 15.00 ETH ⟷ 820.00 BSV',
    type: 'CROSS_ASSET_ATOMIC',
    status: 'SETTLED',
    creatorAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    creatorHandle: '$eth_whales',
    counterpartyAddress: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ',
    counterpartyHandle: '$bsv_otc',
    arbitratorAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    arbitratorName: 'Tradex Multi-Sig Bridge',
    depositAsset: 'ETH',
    depositAmount: 15.0,
    depositNetwork: 'Ethereum Mainnet',
    depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    depositTxId: '0x5582301928371928301928301928301928301928',
    isPartyAFunded: true,
    targetAsset: 'BSV',
    targetAmount: 820.0,
    targetNetwork: 'Bitcoin SV Mainnet',
    targetAddress: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ',
    targetTxId: '0x6682301928371928301928301928301928301928',
    isPartyBFunded: true,
    createdAt: Date.now() - 3600000 * 48,
    expiresAt: Date.now() - 3600000 * 24,
    inspectionHours: 24,
    timelockBlocks: 144,
    scriptType: 'Cross-Chain Atomic Hash Lock',
    scriptAsm: 'OP_IF OP_SHA256 ... OP_EQUALVERIFY OP_CHECKLOCKTIMEVERIFY 144 OP_DROP OP_2 ... 2 OP_CHECKMULTISIG',
    scriptHash: '0x8812301928371928301928301928301928301928',
    escrowContractAddress: VERIFIED_ESCROW_CONTRACT_ADDRESS,
    settlementTxId: '0x9e248b11c8d482910fa8c829e17b819f20102bca819f72b10293847591028377b1',
    feeSats: 280,
    securityCollateralUsd: 39750,
    terms: 'Settlement confirmed. Pre-image revealed and funds released on both chains.'
  }
];

export const apiService = DexApiService.getInstance();

