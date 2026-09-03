// Centralized Persistent Admin Store
// Preserves all admin modifications, feature flags, pairs, configurations, and logs in localStorage

export interface AdminTradePair {
  id: string;
  symbol: string;
  type: 'Spot' | 'Perpetual';
  status: 'Active' | 'Paused' | 'Maintenance';
  minOrder: string;
  tickSize: string;
  maxLeverage?: string;
  volume24h: string;
  change24h: string;
}

export interface AdminUser {
  id: string;
  handle: string;
  email: string;
  role: 'Super Admin' | 'Market Maker' | 'VIP Trader' | 'Trader' | 'Restricted';
  address: string;
  balanceBsv: string;
  balanceUsdt: string;
  status: 'Active' | 'Suspended' | 'Whitelisted';
  joinedDate: string;
}

export interface PredictionMarketItem {
  id: string;
  title: string;
  category: string;
  expiry: string;
  yesPool: number;
  noPool: number;
  status: 'Open' | 'Resolved_Yes' | 'Resolved_No' | 'Void';
  totalVolume: string;
}

export interface CopyVaultStrategy {
  id: string;
  name: string;
  trader: string;
  performanceFee: number;
  aum: string;
  maxAum: string;
  pnl30d: string;
  copiers: number;
  riskLevel: 'Low' | 'Medium' | 'Aggressive';
  status: 'Active' | 'Paused';
}

export interface SupportTicket {
  id: string;
  user: string;
  subject: string;
  category: 'Settlement' | 'Deposit' | 'API' | 'General';
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  timestamp: string;
  messages: Array<{ sender: 'user' | 'admin'; text: string; time: string }>;
}

export interface WebhookIntegration {
  id: string;
  name: string;
  type: 'Gorillapool ARC' | 'WhatsOnChain' | 'Telegram Alert Bot' | 'Discord Bot' | 'CoinGecko' | 'Custom Webhook';
  url: string;
  status: 'Connected' | 'Disconnected';
  lastPing: string;
  events: string[];
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: 'Read-Only' | 'Trading' | 'Full Admin';
  created: string;
  lastUsed: string;
  ipWhitelist: string;
}

export interface SystemLogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  module: string;
  msg: string;
}

const STORAGE_KEY = 'tradex_admin_central_store_v1';

export class AdminSettingsStore {
  private static instance: AdminSettingsStore;
  private listeners: Set<() => void> = new Set();

  public data = {
    // Feature flags
    flags: {
      spotTrading: true,
      perpetualFutures: true,
      predictionMarkets: true,
      p2pEscrow: true,
      aiAutonomousAgents: true,
      copyVaults: true,
      stakingVaults: true,
      publicFaucet: true,
      bsvIntentSettlement: true,
      zeroGasPasskeyMode: true,
      maintenanceMode: false
    },

    // Fee settings
    fees: {
      makerFee: '0.01',
      takerFee: '0.03',
      minerSatPerByte: '0.50',
      orahDiscountPercent: '50',
      referralRebate: '20',
      liquidationFee: '1.5'
    },

    // Site settings
    site: {
      siteName: 'OrahDEX Sovereign',
      description: 'Sovereign Bitcoin SV Hybrid DEX, Instant Swaps, and Autonomous Liquidity',
      domains: 'orahdex.io, tradex.io, bsvswap.org',
      supportEmail: 'aurashampy@gmail.com',
      telegramSupport: '@orahdex_support',
      maintenanceMessage: 'System undergoes scheduled UTXO index optimization.'
    },

    // Announcement
    announcement: {
      text: '⚡ ZERO-GAS Passkey intents live on BSV Mainnet! Instant settlement & autonomous quant vaults.',
      active: true,
      severity: 'info' as 'info' | 'warning' | 'alert'
    },

    // Themes
    theme: {
      preset: 'cyber-green' as 'cyber-green' | 'neon-cyan' | 'matrix-gold' | 'cobalt-blue' | 'velvet-purple',
      accentHue: '#00FF41',
      compactMode: false,
      glowEffects: true
    },

    // Homepage sections toggles
    homepage: {
      showHeroStats: true,
      showTicker: true,
      showFeaturesGrid: true,
      showTrendingTokens: true,
      showRecentSwaps: true,
      showFaqSection: true
    },

    // AI Settings
    ai: {
      geminiModel: 'gemini-2.5-flash',
      temperature: '0.2',
      autonomousRebalance: true,
      maxRiskPerTradeUsd: '500',
      arbitrageScanIntervalSec: '5',
      sentimentAnalysis: true,
      systemPrompt: 'You are AURA, the sovereign quantum AI trading and settlement engine for OrahDEX.'
    },

    // Liquidity Bot
    bot: {
      active: true,
      bidSpread: '0.05',
      askSpread: '0.05',
      rebalanceInterval: '1000',
      orderDepthLevels: '8',
      orderSizeBsv: '0.25',
      maxInventoryBsv: '50.0',
      autoHedge: true
    },

    // Server & Rate Limiting
    rateLimits: {
      maxRequestsPerMin: '120',
      burstTolerance: '30',
      ipBlocklist: ['198.51.100.4', '203.0.113.19'],
      ipWhitelist: ['127.0.0.1', '10.0.0.1']
    },

    // CEX Connections
    cex: {
      binanceConnected: true,
      binanceLatency: '18ms',
      bybitConnected: true,
      bybitLatency: '24ms',
      okxConnected: true,
      okxLatency: '29ms',
      arbitrageSpreadTrigger: '0.35', // %
      autoMirrorOrderbook: true
    },

    // Trade Pairs
    pairs: [
      { id: '1', symbol: 'BSV/USDT', type: 'Spot', status: 'Active', minOrder: '0.01 BSV', tickSize: '0.01', volume24h: '$6,420,910', change24h: '+4.8%' },
      { id: '2', symbol: 'BSV-PERP', type: 'Perpetual', status: 'Active', minOrder: '0.1 BSV', tickSize: '0.05', maxLeverage: '50x', volume24h: '$8,140,200', change24h: '+5.2%' },
      { id: '3', symbol: 'ORAH/USDT', type: 'Spot', status: 'Active', minOrder: '1 ORAH', tickSize: '0.001', volume24h: '$1,290,400', change24h: '+14.2%' },
      { id: '4', symbol: 'ORAH-PERP', type: 'Perpetual', status: 'Active', minOrder: '5 ORAH', tickSize: '0.005', maxLeverage: '20x', volume24h: '$980,100', change24h: '+12.8%' },
      { id: '5', symbol: 'AURA/USDT', type: 'Spot', status: 'Active', minOrder: '0.5 AURA', tickSize: '0.01', volume24h: '$2,410,500', change24h: '+8.6%' },
      { id: '6', symbol: 'BTC/USDT', type: 'Spot', status: 'Active', minOrder: '0.0001 BTC', tickSize: '0.1', volume24h: '$4,100,000', change24h: '+1.4%' },
      { id: '7', symbol: 'SOL/USDT', type: 'Spot', status: 'Active', minOrder: '0.05 SOL', tickSize: '0.01', volume24h: '$1,850,200', change24h: '+3.1%' },
    ] as AdminTradePair[],

    // Users
    users: [
      { id: '1', handle: 'aurashampy', email: 'aurashampy@gmail.com', role: 'Super Admin', address: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', balanceBsv: '142.50 BSV', balanceUsdt: '$24,500.00', status: 'Active', joinedDate: '2026-01-10' },
      { id: '2', handle: 'Quant_Whale_99', email: 'quant@whale.fund', role: 'Market Maker', address: '18cbBi2Y968JvDda839BqXp4112LqWe', balanceBsv: '4,890.00 BSV', balanceUsdt: '$350,000.00', status: 'Active', joinedDate: '2026-02-14' },
      { id: '3', handle: 'Sats_Arbitrageur', email: 'trader@satsflow.io', role: 'Trader', address: '1Lbcfr7s996vB1Xp44Lkd81m30Q', balanceBsv: '28.14 BSV', balanceUsdt: '$4,210.00', status: 'Active', joinedDate: '2026-04-01' },
      { id: '4', handle: 'AURA_Keeper_01', email: 'bot_keeper@aura.ai', role: 'VIP Trader', address: '1N52wHoK871xZpQe193KkdL14m', balanceBsv: '12.00 BSV', balanceUsdt: '$1,900.00', status: 'Active', joinedDate: '2026-05-18' },
    ] as AdminUser[],

    // Prediction markets
    predictions: [
      { id: 'pred-1', title: 'Will BSV break above $100 before end of Q4?', category: 'Crypto', expiry: '2026-12-31', yesPool: 14200, noPool: 9800, status: 'Open', totalVolume: '$24,000' },
      { id: 'pred-2', title: 'Will OrahDEX 24H volume exceed $50M in September?', category: 'Tradex', expiry: '2026-09-30', yesPool: 18500, noPool: 12400, status: 'Open', totalVolume: '$30,900' },
      { id: 'pred-3', title: 'Will Gorillapool process over 50M daily transactions?', category: 'BSV Infra', expiry: '2026-10-15', yesPool: 8400, noPool: 11200, status: 'Open', totalVolume: '$19,600' },
    ] as PredictionMarketItem[],

    // CopyVaults
    vaults: [
      { id: 'v-1', name: 'AURA Quant Momentum', trader: 'AURA Autonomous AI', performanceFee: 15, aum: '$480,200', maxAum: '$1,000,000', pnl30d: '+34.2%', copiers: 184, riskLevel: 'Medium', status: 'Active' },
      { id: 'v-2', name: 'BSV Satoshis Accumulator', trader: 'Quant_Whale_99', performanceFee: 10, aum: '$1,240,000', maxAum: '$2,500,000', pnl30d: '+21.8%', copiers: 412, riskLevel: 'Low', status: 'Active' },
      { id: 'v-3', name: 'Cross-Chain Delta Neutral', trader: 'Sats_Arbitrageur', performanceFee: 20, aum: '$210,000', maxAum: '$500,000', pnl30d: '+18.4%', copiers: 96, riskLevel: 'Low', status: 'Active' },
    ] as CopyVaultStrategy[],

    // Support Tickets
    tickets: [
      { 
        id: 'TCK-1092', 
        user: 'Sats_Arbitrageur', 
        subject: 'Inquiry on BSV atomic swap UTXO confirmations', 
        category: 'Settlement', 
        status: 'Open', 
        priority: 'High', 
        timestamp: '12m ago',
        messages: [
          { sender: 'user', text: 'Hi, I submitted an atomic swap of 1.5 BSV and noticed mempool verification took 2 blocks. Is this typical?', time: '12m ago' }
        ]
      },
      { 
        id: 'TCK-1091', 
        user: '0x8f...41a', 
        subject: 'Question about $ORAH staking APY dividend frequency', 
        category: 'Deposit', 
        status: 'In Progress', 
        priority: 'Medium', 
        timestamp: '1h ago',
        messages: [
          { sender: 'user', text: 'When is the staking yield distributed to locked holders?', time: '1h ago' },
          { sender: 'admin', text: 'Yield snapshots occur every 24 hours at 00:00 UTC and stream automatically to your wallet address.', time: '45m ago' }
        ]
      },
      { 
        id: 'TCK-1090', 
        user: 'Keeper_User_44', 
        subject: 'Passkey WebAuthn biometric signature prompt on iOS', 
        category: 'General', 
        status: 'Resolved', 
        priority: 'Low', 
        timestamp: '3h ago',
        messages: [
          { sender: 'user', text: 'Face ID prompt completed successfully on iOS Safari.', time: '3h ago' }
        ]
      }
    ] as SupportTicket[],

    // Webhooks
    webhooks: [
      { id: 'wh-1', name: 'Gorillapool Arc Mainnet', type: 'Gorillapool ARC', url: 'https://arc.gorillapool.io/v1/tx', status: 'Connected', lastPing: '0.18s ago', events: ['tx.broadcast', 'utxo.mined'] },
      { id: 'wh-2', name: 'WhatsOnChain Explorer API', type: 'WhatsOnChain', url: 'https://api.whatsonchain.com/v1/bsv/main', status: 'Connected', lastPing: '0.24s ago', events: ['block.height', 'address.balance'] },
      { id: 'wh-3', name: 'Tradex Telegram Alerts', type: 'Telegram Alert Bot', url: 'https://api.telegram.org/bot772.../sendAlert', status: 'Connected', lastPing: '1.4s ago', events: ['liquidation.alert', 'whale.swap'] },
      { id: 'wh-4', name: 'Discord Trader Community', type: 'Discord Bot', url: 'https://discord.com/api/webhooks/124.../alerts', status: 'Connected', lastPing: '2.1s ago', events: ['governance.proposal', 'new.pool'] },
    ] as WebhookIntegration[],

    // API Keys
    apiKeys: [
      { id: 'key-1', name: 'Quant Trading Bot Node 1', keyPrefix: 'ora_live_8f49...', permissions: 'Trading', created: '2026-02-01', lastUsed: 'Just now', ipWhitelist: '10.0.0.*' },
      { id: 'key-2', name: 'Arbitrage Read-Only Feed', keyPrefix: 'ora_live_21bc...', permissions: 'Read-Only', created: '2026-03-15', lastUsed: '4s ago', ipWhitelist: 'All' },
      { id: 'key-3', name: 'SuperAdmin Internal CLI', keyPrefix: 'ora_live_77e1...', permissions: 'Full Admin', created: '2026-01-05', lastUsed: '2m ago', ipWhitelist: 'aurashampy@gmail.com' },
    ] as ApiKeyItem[],

    // Setup Checklist
    setupGuide: [
      { id: 'step-1', title: 'Initialize Sovereign BSV Settlement Gateway', completed: true, desc: 'Gorillapool ARC and WhatsOnChain node RPC connections active.' },
      { id: 'step-2', title: 'Configure Maker & Taker Trading Fee Tiers', completed: true, desc: '0.01% Maker / 0.03% Taker configured with $ORAH discounts.' },
      { id: 'step-3', title: 'Fund Primary BSV & USDT Seed Liquidity Pool', completed: true, desc: 'Internal reserve pools funded with 2,841 BSV sovereign backing.' },
      { id: 'step-4', title: 'Deploy AURA Autonomous Quant Liquidity Bot', completed: true, desc: 'Bid/Ask market making bots running with 0.05% spread.' },
      { id: 'step-5', title: 'Verify WebAuthn Hardware Passkey Security', completed: true, desc: 'Touch ID / Face ID zero-gas sovereign authorization confirmed.' },
      { id: 'step-6', title: 'Bind Production Custom Domain and SSL', completed: false, desc: 'Attach orahdex.io DNS records and verify HTTPS certificate.' },
    ],

    // System Logs
    logs: [
      { id: 'log-1', time: '01:14:02', level: 'INFO', module: 'BSV-ENGINE', msg: 'Block #964,682 mined. Verified 4,921 UTXO transfers.' },
      { id: 'log-2', time: '01:14:15', level: 'INFO', module: 'MATCHING', msg: 'Executed limit order #98241 (0.50 BSV @ $48.60 USDT).' },
      { id: 'log-3', time: '01:14:32', level: 'SUCCESS', module: 'AURA-AI', msg: 'Quant Arbitrage Bot netted +$14.20 USDT from Base-BSV spread.' },
      { id: 'log-4', time: '01:14:50', level: 'INFO', module: 'INTENT', msg: 'Relayed zero-gas intent 0x8f2...41a to mempool.' },
      { id: 'log-5', time: '01:15:05', level: 'WARN', module: 'ORACLE', msg: 'Solana RPC ping spiked to 84ms. Switched to fallback endpoint.' },
      { id: 'log-6', time: '01:15:22', level: 'INFO', module: 'PERP-ENGINE', msg: 'Mark price updated: BSV-PERP $48.62 | Funding Rate 0.01%.' },
      { id: 'log-7', time: '01:15:40', level: 'INFO', module: 'WS-GATEWAY', msg: '1,842 active Web3 client connections synced.' },
      { id: 'log-8', time: '01:16:01', level: 'INFO', module: 'MEMPOOL', msg: 'Gorillapool ARC accepted 12 signed atomic transactions.' },
      { id: 'log-9', time: '01:16:20', level: 'SUCCESS', module: 'TREASURY', msg: 'Autonomous fee distribution: 420.50 USDT credited to staking contract.' }
    ] as SystemLogEntry[]
  };

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AdminSettingsStore {
    if (!AdminSettingsStore.instance) {
      AdminSettingsStore.instance = new AdminSettingsStore();
    }
    return AdminSettingsStore.instance;
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge with current data to ensure schema evolutions remain intact
        this.data = {
          ...this.data,
          ...parsed,
          flags: { ...this.data.flags, ...parsed.flags },
          fees: { ...this.data.fees, ...parsed.fees },
          site: { ...this.data.site, ...parsed.site },
          announcement: { ...this.data.announcement, ...parsed.announcement },
          theme: { ...this.data.theme, ...parsed.theme },
          homepage: { ...this.data.homepage, ...parsed.homepage },
          ai: { ...this.data.ai, ...parsed.ai },
          bot: { ...this.data.bot, ...parsed.bot },
          rateLimits: { ...this.data.rateLimits, ...parsed.rateLimits },
          cex: { ...this.data.cex, ...parsed.cex },
        };
      }
    } catch (e) {
      console.warn('Failed to load admin settings store:', e);
    }
  }

  public save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist admin settings store:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn());
  }

  // Helper actions
  public addLog(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', module: string, msg: string) {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newEntry: SystemLogEntry = {
      id: 'log-' + Date.now() + Math.random().toString(36).substr(2, 4),
      time: timeStr,
      level,
      module,
      msg
    };
    this.data.logs.unshift(newEntry);
    if (this.data.logs.length > 200) {
      this.data.logs = this.data.logs.slice(0, 200);
    }
    this.save();
  }

  public clearLogs() {
    this.data.logs = [];
    this.save();
  }

  public toggleFlag(key: keyof typeof AdminSettingsStore.prototype.data.flags) {
    this.data.flags[key] = !this.data.flags[key];
    this.addLog('INFO', 'CONFIG', `Feature flag '${String(key)}' set to ${this.data.flags[key]}`);
    this.save();
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = new AdminSettingsStore().data;
    this.notifyListeners();
  }
}

export const adminSettingsStore = AdminSettingsStore.getInstance();
