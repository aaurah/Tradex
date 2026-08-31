import { PerpMarket, PerpPosition, OrderBookLevel, RecentTrade, AIAgent, CopyVault, AIAgentLog } from '../types/dex';

export const PERP_MARKETS: PerpMarket[] = [
  {
    symbol: 'ORAH-PERP',
    baseAsset: 'ORAH',
    quoteAsset: 'USD',
    price: 1.48,
    change24h: 18.65,
    high24h: 1.62,
    low24h: 1.22,
    volume24hUsd: 84250000,
    openInterestUsd: 14800000,
    fundingRate: 0.00015,
    nextFundingCountdown: '44:12',
    maxLeverage: 50,
    indexPrice: 1.478,
    markPrice: 1.481,
  },
  {
    symbol: 'AURA-PERP',
    baseAsset: 'AURA',
    quoteAsset: 'USD',
    price: 4.92,
    change24h: 14.30,
    high24h: 5.20,
    low24h: 4.15,
    volume24hUsd: 56120000,
    openInterestUsd: 11200000,
    fundingRate: 0.00018,
    nextFundingCountdown: '44:12',
    maxLeverage: 50,
    indexPrice: 4.915,
    markPrice: 4.922,
  },
  {
    symbol: 'BSV-PERP',
    baseAsset: 'BSV',
    quoteAsset: 'USD',
    price: 48.60,
    change24h: 6.42,
    high24h: 51.20,
    low24h: 45.30,
    volume24hUsd: 142850000,
    openInterestUsd: 28400000,
    fundingRate: 0.00012, // 0.012% / 1h
    nextFundingCountdown: '44:12',
    maxLeverage: 50,
    indexPrice: 48.58,
    markPrice: 48.61,
  },
  {
    symbol: 'SOL-PERP',
    baseAsset: 'SOL',
    quoteAsset: 'USD',
    price: 198.40,
    change24h: 4.18,
    high24h: 204.50,
    low24h: 189.20,
    volume24hUsd: 1890400000,
    openInterestUsd: 412000000,
    fundingRate: 0.00008,
    nextFundingCountdown: '44:12',
    maxLeverage: 50,
    indexPrice: 198.35,
    markPrice: 198.42,
  },
  {
    symbol: 'RON-PERP',
    baseAsset: 'RON',
    quoteAsset: 'USD',
    price: 1.84,
    change24h: 12.35,
    high24h: 1.95,
    low24h: 1.62,
    volume24hUsd: 74200000,
    openInterestUsd: 18200000,
    fundingRate: 0.00021,
    nextFundingCountdown: '44:12',
    maxLeverage: 25,
    indexPrice: 1.839,
    markPrice: 1.841,
  },
  {
    symbol: 'BTC-PERP',
    baseAsset: 'BTC',
    quoteAsset: 'USD',
    price: 94250.00,
    change24h: 2.85,
    high24h: 96100.00,
    low24h: 92800.00,
    volume24hUsd: 4850000000,
    openInterestUsd: 1250000000,
    fundingRate: 0.00006,
    nextFundingCountdown: '44:12',
    maxLeverage: 50,
    indexPrice: 94240.00,
    markPrice: 94252.50,
  },
  {
    symbol: 'ETH-PERP',
    baseAsset: 'ETH',
    quoteAsset: 'USD',
    price: 2740.50,
    change24h: -1.15,
    high24h: 2810.00,
    low24h: 2690.00,
    volume24hUsd: 2150000000,
    openInterestUsd: 640000000,
    fundingRate: 0.00004,
    nextFundingCountdown: '44:12',
    maxLeverage: 50,
    indexPrice: 2740.10,
    markPrice: 2740.60,
  }
];

export const INITIAL_AI_AGENTS: AIAgent[] = [
  {
    id: 'agent_aura_momentum',
    name: 'AURA Momentum Alpha v4',
    type: 'momentum_breakout',
    market: 'BSV-PERP',
    status: 'active',
    allocatedCapitalUsd: 2500,
    totalPnlUsd: 742.80,
    totalPnlPercent: 29.71,
    winRate: 88.4,
    tradesCount: 48,
    maxDrawdown: 3.2,
    leverage: 20,
    riskTolerance: 'balanced',
    description: 'Detects high-frequency orderbook imbalance and multi-exchange BSV/SOL/ORAH momentum breakouts with dynamic trailing stop.',
    aiModel: 'Tradex DeepSense 3.5 Turbo',
    lastDecisionTime: Date.now() - 1000 * 60 * 3,
    lastAction: 'Long entry @ $48.20 (Size: $5,000 | 20x). Trailing stop locked at +4.5%.',
    logs: [
      {
        id: 'log_1',
        timestamp: Date.now() - 1000 * 60 * 2,
        level: 'trade',
        message: 'Executed Market Long: 103.73 BSV ($5,000 position) at $48.20. Target TP: $50.80',
        metrics: { rsi: 58.4, macd: 'Bullish Crossover', sentimentScore: 84 }
      },
      {
        id: 'log_2',
        timestamp: Date.now() - 1000 * 60 * 12,
        level: 'signal',
        message: 'Orderbook Delta surge +340k BSV bid pressure detected on mempool relay.',
        metrics: { fundingAnomaly: '+0.004% premium' }
      },
      {
        id: 'log_3',
        timestamp: Date.now() - 1000 * 60 * 45,
        level: 'info',
        message: 'Calibrated dynamic support band between $47.80 - $48.10. Risk guard: 2.1% max risk per trade.',
      }
    ]
  },
  {
    id: 'agent_grid_ronin',
    name: 'Ronin-BSV Cross Arb Sentinel',
    type: 'cross_arb_sentinel',
    market: 'RON-PERP',
    status: 'active',
    allocatedCapitalUsd: 1800,
    totalPnlUsd: 412.50,
    totalPnlPercent: 22.92,
    winRate: 93.1,
    tradesCount: 114,
    maxDrawdown: 1.8,
    leverage: 10,
    riskTolerance: 'conservative',
    description: 'Autonomous delta-neutral arbitrage scanner between Sky Mavis Katana pools and BSV cross-chain settlement bridges.',
    aiModel: 'Tradex ArbMesh v2.1',
    lastDecisionTime: Date.now() - 1000 * 60 * 8,
    lastAction: 'Rebalanced liquidity spread between Katana $1.838 and Perp mark $1.841.',
    logs: [
      {
        id: 'log_ron_1',
        timestamp: Date.now() - 1000 * 60 * 7,
        level: 'trade',
        message: 'Executed spread arbitrage: +$14.20 realized net yield across 12 routing hops.',
      },
      {
        id: 'log_ron_2',
        timestamp: Date.now() - 1000 * 60 * 30,
        level: 'signal',
        message: 'Katana DEX liquidity pool depth shift detected. Automated hedge initialized.',
      }
    ]
  },
  {
    id: 'agent_sol_scalper',
    name: 'Solana Whale Flow Scalper',
    type: 'whale_flow_tracker',
    market: 'SOL-PERP',
    status: 'active',
    allocatedCapitalUsd: 3200,
    totalPnlUsd: 1184.20,
    totalPnlPercent: 37.01,
    winRate: 85.7,
    tradesCount: 79,
    maxDrawdown: 4.6,
    leverage: 25,
    riskTolerance: 'aggressive',
    description: 'Tracks on-chain whale clusters and liquidation cascades across Drift & Hyperliquid to snipe quick reversal bids.',
    aiModel: 'Tradex FlowCluster AI',
    lastDecisionTime: Date.now() - 1000 * 60 * 1,
    lastAction: 'Sniper Short limit placed @ $199.80 for anticipation of resistance rejection.',
    logs: [
      {
        id: 'log_sol_1',
        timestamp: Date.now() - 1000 * 60 * 1,
        level: 'signal',
        message: 'Large 4,500 SOL short liquidation triggered on external Perp DEX. Scanning counter-fill.',
      }
    ]
  }
];

export const INITIAL_COPY_VAULTS: CopyVault[] = [
  {
    id: 'vault_aura_apex',
    name: 'AURA Apex Quantitative Vault',
    curator: 'Aura Labs Capital',
    avatar: '🤖',
    strategy: 'High-frequency statistical arbitrage & on-chain order flow momentum across BSV, SOL, and ETH perps.',
    targetMarkets: ['BSV-PERP', 'SOL-PERP', 'BTC-PERP'],
    totalAumUsd: 1420800,
    copiersCount: 489,
    roi30d: 48.6,
    roiAllTime: 312.4,
    winRate: 89.4,
    maxDrawdown: 3.8,
    sharpeRatio: 3.42,
    minDepositUsd: 50,
    managementFeePercent: 1.0,
    performanceFeePercent: 10.0,
    isUserSubscribed: true,
    userInvestedUsd: 500,
    chartData: [
      { day: 'Day 1', roi: 0 },
      { day: 'Day 5', roi: 8.2 },
      { day: 'Day 10', roi: 16.5 },
      { day: 'Day 15', roi: 24.1 },
      { day: 'Day 20', roi: 33.4 },
      { day: 'Day 25', roi: 41.2 },
      { day: 'Day 30', roi: 48.6 }
    ]
  },
  {
    id: 'vault_delta_neutral',
    name: 'Delta-Neutral Funding Harvester',
    curator: 'Satoshi Yield DAO',
    avatar: '⚡',
    strategy: 'Captures high annualized funding rates on Bitcoin SV & Ronin perpetuals while hedging spot exposure 1:1 on-chain.',
    targetMarkets: ['BSV-PERP', 'RON-PERP'],
    totalAumUsd: 895400,
    copiersCount: 312,
    roi30d: 18.2,
    roiAllTime: 145.8,
    winRate: 97.2,
    maxDrawdown: 0.9,
    sharpeRatio: 4.85,
    minDepositUsd: 25,
    managementFeePercent: 0.5,
    performanceFeePercent: 8.0,
    isUserSubscribed: false,
    userInvestedUsd: 0,
    chartData: [
      { day: 'Day 1', roi: 0 },
      { day: 'Day 5', roi: 3.1 },
      { day: 'Day 10', roi: 6.4 },
      { day: 'Day 15', roi: 9.8 },
      { day: 'Day 20', roi: 12.9 },
      { day: 'Day 25', roi: 15.6 },
      { day: 'Day 30', roi: 18.2 }
    ]
  },
  {
    id: 'vault_whale_reversal',
    name: 'Tradensea AI Breakout Bot',
    curator: 'Tradensea Algo Team',
    avatar: '🌊',
    strategy: 'Algorithmic trend-following bot utilizing neural network sentiment signals and multi-timeframe volume profile.',
    targetMarkets: ['SOL-PERP', 'ETH-PERP', 'BSV-PERP'],
    totalAumUsd: 2150000,
    copiersCount: 820,
    roi30d: 64.8,
    roiAllTime: 428.1,
    winRate: 84.1,
    maxDrawdown: 5.2,
    sharpeRatio: 2.95,
    minDepositUsd: 100,
    managementFeePercent: 1.5,
    performanceFeePercent: 12.0,
    isUserSubscribed: false,
    userInvestedUsd: 0,
    chartData: [
      { day: 'Day 1', roi: 0 },
      { day: 'Day 5', roi: 11.4 },
      { day: 'Day 10', roi: 21.0 },
      { day: 'Day 15', roi: 32.8 },
      { day: 'Day 20', roi: 44.5 },
      { day: 'Day 25', roi: 53.9 },
      { day: 'Day 30', roi: 64.8 }
    ]
  }
];

class PerpService {
  private markets: PerpMarket[] = PERP_MARKETS;
  private positions: PerpPosition[] = [];
  private aiAgents: AIAgent[] = INITIAL_AI_AGENTS;
  private copyVaults: CopyVault[] = INITIAL_COPY_VAULTS;

  constructor() {
    this.loadFromStorage();
    // Default mock initial position if none exists
    if (this.positions.length === 0) {
      this.positions = [
        {
          id: 'pos_init_bsv',
          market: 'BSV-PERP',
          side: 'LONG',
          sizeUsd: 2430.00,
          sizeTokens: 50,
          entryPrice: 47.80,
          markPrice: 48.60,
          liquidationPrice: 43.20,
          leverage: 10,
          marginUsd: 243.00,
          marginType: 'isolated',
          unrealizedPnlUsd: 40.00,
          unrealizedPnlPercent: 16.46,
          takeProfitPrice: 52.00,
          stopLossPrice: 45.50,
          openedAt: Date.now() - 1000 * 60 * 75,
          autoAgentManaged: true,
          agentId: 'agent_aura_momentum'
        }
      ];
      this.saveToStorage();
    }
  }

  private loadFromStorage() {
    try {
      const storedPos = localStorage.getItem('bitsv_perp_positions');
      if (storedPos) this.positions = JSON.parse(storedPos);

      const storedAgents = localStorage.getItem('bitsv_ai_agents');
      if (storedAgents) this.aiAgents = JSON.parse(storedAgents);

      const storedVaults = localStorage.getItem('bitsv_copy_vaults');
      if (storedVaults) this.copyVaults = JSON.parse(storedVaults);
    } catch (e) {
      console.warn('Perp storage load error:', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('bitsv_perp_positions', JSON.stringify(this.positions));
      localStorage.setItem('bitsv_ai_agents', JSON.stringify(this.aiAgents));
      localStorage.setItem('bitsv_copy_vaults', JSON.stringify(this.copyVaults));
    } catch (e) {
      console.warn('Perp storage save error:', e);
    }
  }

  public getMarkets(): PerpMarket[] {
    return this.markets;
  }

  public getMarket(symbol: string): PerpMarket {
    return this.markets.find(m => m.symbol === symbol) || this.markets[0];
  }

  public getPositions(): PerpPosition[] {
    return this.positions;
  }

  public getAIAgents(): AIAgent[] {
    return this.aiAgents;
  }

  public getCopyVaults(): CopyVault[] {
    return this.copyVaults;
  }

  // Generate realistic live orderbook with depth
  public generateOrderBook(marketSymbol: string): { bids: OrderBookLevel[]; asks: OrderBookLevel[]; spread: number } {
    const market = this.getMarket(marketSymbol);
    const midPrice = market.price;
    const isSmallCap = midPrice < 5;
    const step = isSmallCap ? 0.005 : midPrice < 100 ? 0.05 : 2.5;

    const asks: OrderBookLevel[] = [];
    let cumAskTotal = 0;
    for (let i = 8; i >= 1; i--) {
      const price = parseFloat((midPrice + i * step).toFixed(isSmallCap ? 3 : 2));
      const size = parseFloat(((Math.random() * 40 + 10) * (isSmallCap ? 200 : 1)).toFixed(2));
      cumAskTotal += size;
      asks.push({ price, size, total: parseFloat(cumAskTotal.toFixed(2)) });
    }

    const bids: OrderBookLevel[] = [];
    let cumBidTotal = 0;
    for (let i = 1; i <= 8; i++) {
      const price = parseFloat((midPrice - i * step).toFixed(isSmallCap ? 3 : 2));
      const size = parseFloat(((Math.random() * 40 + 10) * (isSmallCap ? 200 : 1)).toFixed(2));
      cumBidTotal += size;
      bids.push({ price, size, total: parseFloat(cumBidTotal.toFixed(2)) });
    }

    const spread = asks.length > 0 && bids.length > 0 ? parseFloat((asks[asks.length - 1].price - bids[0].price).toFixed(isSmallCap ? 3 : 2)) : 0.01;

    return { asks, bids, spread };
  }

  // Generate recent live trades
  public generateRecentTrades(marketSymbol: string): RecentTrade[] {
    const market = this.getMarket(marketSymbol);
    const trades: RecentTrade[] = [];
    const now = Date.now();

    for (let i = 0; i < 12; i++) {
      const timeOffset = i * 2500 + Math.floor(Math.random() * 1500);
      const isBuy = Math.random() > 0.45;
      const priceDrift = (Math.random() - 0.5) * (market.price * 0.002);
      const price = parseFloat((market.price + priceDrift).toFixed(market.price < 5 ? 3 : 2));
      const size = parseFloat((Math.random() * 25 + 2).toFixed(2));
      const date = new Date(now - timeOffset);
      const timeStr = date.toTimeString().split(' ')[0];

      trades.push({
        id: `trade_${now}_${i}`,
        price,
        size,
        side: isBuy ? 'buy' : 'sell',
        time: timeStr,
        timestamp: now - timeOffset
      });
    }

    return trades;
  }

  // Open a new perpetual position
  public openPosition(params: {
    market: string;
    side: 'LONG' | 'SHORT';
    marginUsd: number;
    leverage: number;
    marginType: 'cross' | 'isolated';
    takeProfitPrice?: number;
    stopLossPrice?: number;
  }): PerpPosition {
    const market = this.getMarket(params.market);
    const entryPrice = market.price;
    const sizeUsd = params.marginUsd * params.leverage;
    const sizeTokens = parseFloat((sizeUsd / entryPrice).toFixed(4));

    // Est. liquidation price: Long = entry * (1 - 1/leverage * 0.9); Short = entry * (1 + 1/leverage * 0.9)
    const liqOffset = (entryPrice / params.leverage) * 0.92;
    const liquidationPrice = params.side === 'LONG' 
      ? Math.max(0.01, parseFloat((entryPrice - liqOffset).toFixed(2)))
      : parseFloat((entryPrice + liqOffset).toFixed(2));

    const newPos: PerpPosition = {
      id: 'pos_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      market: params.market,
      side: params.side,
      sizeUsd,
      sizeTokens,
      entryPrice,
      markPrice: entryPrice,
      liquidationPrice,
      leverage: params.leverage,
      marginUsd: params.marginUsd,
      marginType: params.marginType,
      unrealizedPnlUsd: 0,
      unrealizedPnlPercent: 0,
      takeProfitPrice: params.takeProfitPrice,
      stopLossPrice: params.stopLossPrice,
      openedAt: Date.now()
    };

    this.positions.unshift(newPos);
    this.saveToStorage();
    return newPos;
  }

  // Close position
  public closePosition(positionId: string): PerpPosition | null {
    const idx = this.positions.findIndex(p => p.id === positionId);
    if (idx === -1) return null;
    const closed = this.positions.splice(idx, 1)[0];
    this.saveToStorage();
    return closed;
  }

  // Deploy a new AI Trading Agent
  public deployAIAgent(agentData: {
    name: string;
    type: AIAgent['type'];
    market: string;
    capitalUsd: number;
    leverage: number;
    riskTolerance: AIAgent['riskTolerance'];
  }): AIAgent {
    const descriptions: Record<string, string> = {
      momentum_breakout: 'Auto-scans orderbook imbalance and multi-exchange momentum breakout patterns.',
      grid_market_maker: 'Places geometric high-density buy/sell grid orders to capture bid-ask spread.',
      sentiment_scalper: 'Monitors real-time social & on-chain sentiment signals for micro reversals.',
      cross_arb_sentinel: 'Monitors cross-chain Ronin/BSV/SOL bridge liquidity mispricings.',
      whale_flow_tracker: 'Tracks top whale wallets and large block trade liquidations.'
    };

    const newAgent: AIAgent = {
      id: 'agent_' + Date.now(),
      name: agentData.name,
      type: agentData.type,
      market: agentData.market,
      status: 'active',
      allocatedCapitalUsd: agentData.capitalUsd,
      totalPnlUsd: 0,
      totalPnlPercent: 0,
      winRate: 86.5,
      tradesCount: 0,
      maxDrawdown: 1.2,
      leverage: agentData.leverage,
      riskTolerance: agentData.riskTolerance,
      description: descriptions[agentData.type] || 'Autonomous AI perpetual algorithmic strategy.',
      aiModel: 'Tradex Neural Mesh v3.5',
      lastDecisionTime: Date.now(),
      lastAction: `Initialized telemetry feeds and risk boundary for ${agentData.market} at ${agentData.leverage}x leverage.`,
      logs: [
        {
          id: 'log_' + Date.now(),
          timestamp: Date.now(),
          level: 'info',
          message: `Agent deployed successfully with $${agentData.capitalUsd} allocated capital. Active risk guard: ${agentData.riskTolerance}.`
        }
      ]
    };

    this.aiAgents.unshift(newAgent);
    this.saveToStorage();
    return newAgent;
  }

  // Toggle AI Agent status (pause / resume)
  public toggleAgentStatus(agentId: string): AIAgent | null {
    const agent = this.aiAgents.find(a => a.id === agentId);
    if (!agent) return null;
    agent.status = agent.status === 'active' ? 'paused' : 'active';
    agent.logs.unshift({
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      level: 'info',
      message: `Agent state toggled to: ${agent.status.toUpperCase()}`
    });
    this.saveToStorage();
    return agent;
  }

  // Simulate an autonomous action for an agent
  public triggerAgentCycle(agentId: string): AIAgent | null {
    const agent = this.aiAgents.find(a => a.id === agentId);
    if (!agent || agent.status !== 'active') return null;

    const market = this.getMarket(agent.market);
    const isBullish = Math.random() > 0.35;
    const profit = isBullish ? (Math.random() * 35 + 10) : -(Math.random() * 12 + 2);
    
    agent.tradesCount += 1;
    agent.totalPnlUsd = parseFloat((agent.totalPnlUsd + profit).toFixed(2));
    agent.totalPnlPercent = parseFloat(((agent.totalPnlUsd / agent.allocatedCapitalUsd) * 100).toFixed(2));
    agent.lastDecisionTime = Date.now();

    const actions = [
      `Executed ${isBullish ? 'Long scalp' : 'Risk hedge'} on ${agent.market} @ $${market.price}. PnL: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`,
      `Adjusted dynamic trailing stop-loss to 1.8% below 20 EMA ($${(market.price * 0.982).toFixed(2)})`,
      `Detected orderbook absorption wall. Rebalanced liquidity exposure.`,
      `Signal confirmation: RSI at ${(Math.random() * 30 + 45).toFixed(1)} with high volume cluster.`
    ];

    agent.lastAction = actions[Math.floor(Math.random() * actions.length)];

    agent.logs.unshift({
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      level: profit >= 0 ? 'trade' : 'risk_alert',
      message: agent.lastAction,
      metrics: {
        rsi: parseFloat((Math.random() * 30 + 45).toFixed(1)),
        sentimentScore: Math.floor(Math.random() * 30 + 65)
      }
    });

    if (agent.logs.length > 20) agent.logs = agent.logs.slice(0, 20);
    this.saveToStorage();
    return agent;
  }

  // Subscribe / Invest in Copy Vault
  public toggleCopyVault(vaultId: string, amountUsd: number = 100): CopyVault | null {
    const vault = this.copyVaults.find(v => v.id === vaultId);
    if (!vault) return null;

    if (vault.isUserSubscribed) {
      vault.isUserSubscribed = false;
      vault.userInvestedUsd = 0;
      vault.copiersCount = Math.max(0, vault.copiersCount - 1);
    } else {
      vault.isUserSubscribed = true;
      vault.userInvestedUsd = amountUsd;
      vault.copiersCount += 1;
      vault.totalAumUsd += amountUsd;
    }

    this.saveToStorage();
    return vault;
  }
}

export const perpService = new PerpService();
