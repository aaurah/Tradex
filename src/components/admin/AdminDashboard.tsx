import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Server, 
  Shield, 
  Cpu, 
  Database, 
  Zap, 
  Coins, 
  Users, 
  RefreshCw, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Layers,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  trend?: string;
  positive?: boolean;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, icon, trend, positive, onClick }) => (
  <div 
    onClick={onClick}
    className="p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] hover:border-[#333] transition-all cursor-pointer group hover:bg-[#121212] relative overflow-hidden"
  >
    <div className="flex items-start justify-between">
      <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-center text-[#00FF41] group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <ChevronRight className="w-4 h-4 text-[#444] group-hover:text-white transition-colors" />
    </div>
    
    <div className="mt-3">
      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777]">{label}</div>
      <div className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight font-mono flex items-baseline space-x-2">
        <span>{value}</span>
        {trend && (
          <span className={`text-xs font-mono font-bold ${positive ? 'text-[#00FF41]' : 'text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-[11px] text-[#666] font-mono mt-1">{subtext}</div>
    </div>
  </div>
);

export const AdminDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Sparkline data points for 30-day area chart
  const sparklinePoints = [
    { day: '16 Aug', value: 120 },
    { day: '18 Aug', value: 145 },
    { day: '20 Aug', value: 135 },
    { day: '22 Aug', value: 190 },
    { day: '23 Aug', value: 210 },
    { day: '25 Aug', value: 240 },
    { day: '27 Aug', value: 225 },
    { day: '29 Aug', value: 290 },
    { day: '30 Aug', value: 340 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Status Bar (Matching screenshot banner) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Tradex Sovereign Platform</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
              MAINNET V4.2
            </span>
          </div>
          <p className="text-xs text-[#777] font-mono mt-0.5">
            Non-custodial DEX telemetry, autonomous liquidity, and BSV intent settlement engine.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Operational Status Pill */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0D0D0D] border border-[#222] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></span>
            <span className="text-white font-bold">All Systems Operational</span>
          </div>

          {/* Refresh Action */}
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-[#0D0D0D] hover:bg-[#161616] border border-[#222] text-[#888] hover:text-white transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#00FF41]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Key Metrics matching screenshots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        
        {/* 24H Volume */}
        <MetricCard
          label="24H VOLUME"
          value="$14,892,450"
          subtext="28,491 trades today"
          icon={<TrendingUp className="w-4 h-4" />}
          trend="+18.4%"
          positive={true}
          onClick={() => onNavigate('trade_analytics')}
        />

        {/* Active Pairs */}
        <MetricCard
          label="ACTIVE PAIRS"
          value="48 / 48"
          subtext="spot + futures"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={() => onNavigate('trade_pairs')}
        />

        {/* Open Orders */}
        <MetricCard
          label="OPEN ORDERS"
          value="1,492"
          subtext="across all pairs"
          icon={<ShieldCheck className="w-4 h-4" />}
          onClick={() => onNavigate('trade_pairs')}
        />

        {/* Live Chat */}
        <MetricCard
          label="LIVE CHAT"
          value="12 active"
          subtext="182 msgs • 4 live agents"
          icon={<MessageSquare className="w-4 h-4" />}
          onClick={() => onNavigate('support_inbox')}
        />

        {/* Overlay Records */}
        <MetricCard
          label="OVERLAY RECORDS"
          value="849,203"
          subtext="BSV on-chain verifications"
          icon={<Database className="w-4 h-4" />}
          onClick={() => onNavigate('bsv_intents')}
        />

      </div>

      {/* 30-Day Growth & Volume Area Chart (Matching Screenshot 1 bottom graph) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-[#777] uppercase">Protocol Trajectory</div>
            <div className="flex items-center space-x-2 mt-0.5">
              <h3 className="text-lg font-black text-white">Aggregated Trading Volume & Fees</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                30-day +39%
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-[#141414] p-1 rounded-xl border border-[#222] text-xs font-mono">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all ${
                  timeRange === r ? 'bg-[#00FF41] text-black shadow-sm' : 'text-[#777] hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="h-44 sm:h-52 w-full pt-4 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF41" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00FF41" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="40" x2="800" y2="40" stroke="#1A1A1A" strokeDasharray="3 3" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="#1A1A1A" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="800" y2="120" stroke="#1A1A1A" strokeDasharray="3 3" />

            {/* Smooth Spline Path */}
            <path
              d="M 0,110 Q 100,95 200,105 T 400,65 T 600,45 T 800,20 L 800,160 L 0,160 Z"
              fill="url(#adminChartGrad)"
            />
            <path
              d="M 0,110 Q 100,95 200,105 T 400,65 T 600,45 T 800,20"
              fill="none"
              stroke="#00FF41"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Highlight point */}
            <circle cx="800" cy="20" r="4.5" fill="#00FF41" className="animate-pulse" />
          </svg>

          {/* X-axis date labels */}
          <div className="flex justify-between text-[11px] font-mono text-[#555] pt-2">
            <span>16 Aug</span>
            <span>20 Aug</span>
            <span>23 Aug</span>
            <span>27 Aug</span>
            <span>30 Aug</span>
          </div>
        </div>
      </div>

      {/* Real-Time Node & Engine Clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* BSV Settlement Gateway */}
        <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF41]"></span>
              <span className="text-xs font-bold text-white uppercase font-mono">BSV Sovereign Layer</span>
            </div>
            <span className="text-[10px] font-mono text-[#00FF41]">BLOCK #964,682</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[#888]">
              <span>Mempool Fee:</span>
              <span className="text-white font-bold">0.50 sat/byte</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>UTXO Overlay Sync:</span>
              <span className="text-[#00FF41] font-bold">100% Synced</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>Gorillapool Arc:</span>
              <span className="text-white font-bold">Active (0.2s)</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>Non-Custodial Escrow:</span>
              <span className="text-white font-bold">428 Channels</span>
            </div>
          </div>
        </div>

        {/* Matching Engine Cluster */}
        <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF41]"></span>
              <span className="text-xs font-bold text-white uppercase font-mono">Order Matching Engine</span>
            </div>
            <span className="text-[10px] font-mono text-[#00FF41]">0.4ms LATENCY</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[#888]">
              <span>Throughput:</span>
              <span className="text-white font-bold">100,000 TPS</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>Active Websockets:</span>
              <span className="text-white font-bold">1,842 Connections</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>Depth Indexer:</span>
              <span className="text-[#00FF41] font-bold">Real-Time L2/L3</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>Perp Liquidator Bot:</span>
              <span className="text-[#00FF41] font-bold">Armed (0 fails)</span>
            </div>
          </div>
        </div>

        {/* Autonomous AI / Quant Bots */}
        <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF41]"></span>
              <span className="text-xs font-bold text-white uppercase font-mono">AURA AI Intelligence</span>
            </div>
            <span className="text-[10px] font-mono text-[#00FF41]">ONLINE</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[#888]">
              <span>Active Quant Agents:</span>
              <span className="text-white font-bold">6 Autonomous</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>24h Bot Arbitrage Profit:</span>
              <span className="text-[#00FF41] font-bold">+$4,219.80 USDT</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>Gemini Model:</span>
              <span className="text-white font-bold">gemini-2.5-flash</span>
            </div>
            <div className="flex justify-between text-[#888]">
              <span>Auto-Rebalance Mode:</span>
              <span className="text-[#00FF41] font-bold">Enabled</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Action Matrix */}
      <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
        <div className="text-xs font-mono text-[#777] uppercase font-bold">Quick Administrative Shortcuts</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button 
            onClick={() => onNavigate('server_control')}
            className="p-3 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-[#242424] text-left text-xs font-mono transition-colors group"
          >
            <div className="flex items-center justify-between">
              <Server className="w-4 h-4 text-[#00FF41]" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/20 text-[#00FF41]">NEW</span>
            </div>
            <div className="text-white font-bold mt-2 group-hover:text-[#00FF41]">Server Control</div>
            <div className="text-[10px] text-[#666]">Flush cache, restart</div>
          </button>

          <button 
            onClick={() => onNavigate('fee_config')}
            className="p-3 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-[#242424] text-left text-xs font-mono transition-colors group"
          >
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <div className="text-white font-bold mt-2 group-hover:text-[#00FF41]">Fee Configuration</div>
            <div className="text-[10px] text-[#666]">Maker & Taker rates</div>
          </button>

          <button 
            onClick={() => onNavigate('liquidity_bot')}
            className="p-3 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-[#242424] text-left text-xs font-mono transition-colors group"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <div className="text-white font-bold mt-2 group-hover:text-[#00FF41]">Liquidity Bot</div>
            <div className="text-[10px] text-[#666]">Spread & depth tuning</div>
          </button>

          <button 
            onClick={() => onNavigate('feature_flags')}
            className="p-3 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-[#242424] text-left text-xs font-mono transition-colors group"
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <div className="text-white font-bold mt-2 group-hover:text-[#00FF41]">Feature Flags</div>
            <div className="text-[10px] text-[#666]">Enable/disable modules</div>
          </button>
        </div>
      </div>

    </div>
  );
};
