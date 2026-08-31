export type WalletType = 'handcash' | 'relayx' | 'sensilet' | 'yours' | 'phantom' | 'custom_signer' | 'evm' | 'ronin' | 'passkey' | 'seed';

export interface WalletAccount {
  type: WalletType;
  chainType: 'bsv' | 'evm' | 'ronin' | 'solana';
  address: string;
  evmAddress?: string;
  solanaAddress?: string;
  btcAddress?: string;
  roninAddress?: string;
  multiChainEnabled?: boolean;
  handle?: string;
  paymail?: string;
  balanceBsv: number;
  balanceSats: number;
  balanceEth?: number;
  balanceRon?: number;
  balanceSol?: number;
  balanceBtc?: number;
  evmChainId?: number;
  evmChainName?: string;
  publicKey?: string;
  wif?: string;
  passkeyId?: string;
  walletName?: string;
  isConnected: boolean;
}

export type CoinCategory = 
  | 'all' 
  | 'top100'
  | 'layer1' 
  | 'evm' 
  | 'ronin' 
  | 'solana'
  | 'stable' 
  | 'defi' 
  | 'meme' 
  | 'ai' 
  | 'gaming'
  | 'rwa'
  | 'depin'
  | 'brc20'
  | 'privacy';

export interface Coin {
  symbol: string;
  name: string;
  icon: string;
  logoUrl?: string;
  network: string;
  networkCode?: string;
  priceUsd: number;
  minAmount: number;
  maxAmount: number;
  decimals: number;
  popular?: boolean;
  category?: CoinCategory;
  contractAddress?: string;
  isEVM?: boolean;
  isRonin?: boolean;
  isSolana?: boolean;
  isBSV?: boolean;
  change24h?: number;
  marketCapUsd?: number;
  volume24hUsd?: number;
  rank?: number;
  high24h?: number;
  low24h?: number;
  athUsd?: number;
  atlUsd?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  description?: string;
  websiteUrl?: string;
  explorerUrl?: string;
}

export type SwapStatus = 
  | 'awaiting_deposit' 
  | 'confirming' 
  | 'exchanging' 
  | 'broadcasting_tx' 
  | 'completed' 
  | 'failed';

export interface SwapOrder {
  id: string;
  fromCoin: Coin;
  toCoin: Coin;
  amountFrom: number;
  amountTo: number;
  rate: number;
  depositAddress: string;
  recipientAddress: string;
  status: SwapStatus;
  createdAt: number;
  expiresAt: number;
  bsvTxId?: string;
  evmTxHash?: string;
  roninTxHash?: string;
  networkFeeUsd: number;
  minerFeeSats: number;
  exchangeFeePercent: number;
  txHash?: string;
  confirmations: number;
  requiredConfirmations: number;
}

export type P2POrderType = 'BUY_BSV' | 'SELL_BSV';

export type P2POrderStatus = 
  | 'OPEN' 
  | 'MATCHED' 
  | 'ESCROW_LOCKED' 
  | 'PAYMENT_SENT' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'DISPUTED';

export interface P2POrder {
  id: string;
  type: P2POrderType;
  makerAddress: string;
  makerHandle: string;
  makerScore: number; // e.g. 99.4%
  makerTradesCount: number;
  coin: string; // 'BSV'
  amountBsv: number;
  remainingBsv: number;
  pricePerBsv: number;
  fiatCurrency: string; // USD, EUR, GBP, AUD, etc.
  minLimitFiat: number;
  maxLimitFiat: number;
  paymentMethods: string[];
  paymentInstructions: string;
  status: P2POrderStatus;
  escrowTxId?: string;
  escrowScriptHash?: string;
  escrowAmountSats?: number;
  takerAddress?: string;
  takerHandle?: string;
  createdAt: number;
  updatedAt: number;
  matchedAmountBsv?: number;
  matchedFiatAmount?: number;
  paymentReference?: string;
  disputeReason?: string;
  chatMessages: P2PChatMessage[];
}

export interface P2PChatMessage {
  id: string;
  sender: 'maker' | 'taker' | 'system' | 'mediator';
  senderAddress: string;
  text: string;
  timestamp: number;
  isProof?: boolean;
}

export interface BSVKeypair {
  wif: string;
  privateKeyHex: string;
  publicKeyHex: string;
  address: string;
}

export interface OnChainSettlementLog {
  id: string;
  txid: string;
  blockHeight: number;
  type: 'P2P_ESCROW_LOCK' | 'P2P_SETTLEMENT_RELEASE' | 'CROSS_CHAIN_SWAP_SETTLE' | 'ESCROW_REFUND';
  amountSats: number;
  feeSats: number;
  rawHex: string;
  inputsCount: number;
  outputsCount: number;
  scriptType: '2-of-2 Multi-Sig Escrow' | 'P2PKH Standard Script' | 'Hash-Time-Locked Contract (HTLC)';
  status: 'confirmed' | 'mempool';
  timestamp: number;
}

// OraDex / Perps & AI Agent Types
export interface PerpMarket {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  openInterestUsd: number;
  fundingRate: number; // e.g. 0.00012 (0.012%)
  nextFundingCountdown: string;
  maxLeverage: number;
  indexPrice: number;
  markPrice: number;
}

export interface PerpPosition {
  id: string;
  market: string;
  side: 'LONG' | 'SHORT';
  sizeUsd: number;
  sizeTokens: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  leverage: number;
  marginUsd: number;
  marginType: 'cross' | 'isolated';
  unrealizedPnlUsd: number;
  unrealizedPnlPercent: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  openedAt: number;
  autoAgentManaged?: boolean;
  agentId?: string;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  time: string;
  timestamp: number;
}

export type AIAgentType = 'momentum_breakout' | 'grid_market_maker' | 'sentiment_scalper' | 'cross_arb_sentinel' | 'whale_flow_tracker';

export interface AIAgent {
  id: string;
  name: string;
  type: AIAgentType;
  market: string;
  status: 'active' | 'paused' | 'calibrating';
  allocatedCapitalUsd: number;
  totalPnlUsd: number;
  totalPnlPercent: number;
  winRate: number; // e.g. 84.5%
  tradesCount: number;
  maxDrawdown: number;
  leverage: number;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  description: string;
  aiModel: string;
  lastDecisionTime: number;
  lastAction: string;
  logs: AIAgentLog[];
}

export interface AIAgentLog {
  id: string;
  timestamp: number;
  level: 'info' | 'trade' | 'signal' | 'risk_alert';
  message: string;
  metrics?: {
    rsi?: number;
    macd?: string;
    sentimentScore?: number;
    fundingAnomaly?: string;
  };
}

export interface CopyVault {
  id: string;
  name: string;
  curator: string;
  avatar: string;
  strategy: string;
  targetMarkets: string[];
  totalAumUsd: number;
  copiersCount: number;
  roi30d: number;
  roiAllTime: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  minDepositUsd: number;
  managementFeePercent: number;
  performanceFeePercent: number;
  isUserSubscribed?: boolean;
  userInvestedUsd?: number;
  chartData: { day: string; roi: number }[];
}

