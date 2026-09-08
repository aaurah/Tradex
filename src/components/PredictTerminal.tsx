import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import confetti from '../utils/confetti';
import { 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Clock, 
  DollarSign, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  Flame,
  Award,
  BarChart2
} from 'lucide-react';

interface PredictionMarket {
  id: string;
  title: string;
  category: string;
  endTime: string;
  yesPrice: number; // e.g. 0.65 -> 65% chance
  noPrice: number;
  totalVolume: string;
  resolved: boolean;
  icon: string;
}

const MARKETS: PredictionMarket[] = [
  {
    id: '1',
    title: 'Will Bitcoin SV (BSV) hit $50 by Q4?',
    category: 'Crypto',
    endTime: '30d left',
    yesPrice: 0.42,
    noPrice: 0.58,
    totalVolume: '$428,500',
    resolved: false,
    icon: '⚡'
  },
  {
    id: '2',
    title: 'Will $ORAH reach $5.00 before end of year?',
    category: 'Tradex',
    endTime: '45d left',
    yesPrice: 0.76,
    noPrice: 0.24,
    totalVolume: '$892,100',
    resolved: false,
    icon: '🚀'
  },
  {
    id: '3',
    title: 'Will Bitcoin surpass $100,000 this cycle?',
    category: 'Macro',
    endTime: '60d left',
    yesPrice: 0.88,
    noPrice: 0.12,
    totalVolume: '$3,450,000',
    resolved: false,
    icon: '₿'
  },
  {
    id: '4',
    title: 'Will AURA AI agents generate >10,000% APR in 2026?',
    category: 'AI Tech',
    endTime: '90d left',
    yesPrice: 0.64,
    noPrice: 0.36,
    totalVolume: '$1,200,000',
    resolved: false,
    icon: '🤖'
  }
];

export const PredictTerminal: React.FC = () => {
  const { isConnected, openWalletModal } = useWallet();
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket>(MARKETS[0]);
  const [outcome, setOutcome] = useState<'yes' | 'no'>('yes');
  const [betAmount, setBetAmount] = useState('50');
  const [notification, setNotification] = useState<string | null>(null);

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      openWalletModal();
      return;
    }
    const amt = parseFloat(betAmount) || 0;
    if (amt <= 0) return;

    setNotification(`Successfully purchased ${outcome.toUpperCase()} shares on "${selectedMarket.title}" for $${amt} USDT!`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setNotification(null), 4000);
  };

  const currentPrice = outcome === 'yes' ? selectedMarket.yesPrice : selectedMarket.noPrice;
  const shares = (parseFloat(betAmount) || 0) / currentPrice;
  const potentialReturn = shares * 1.00;

  return (
    <div className="min-h-screen bg-[#030303] text-[#E0E0E0] font-sans pb-20 select-none">
      
      {/* Top Banner */}
      <div className="border-b border-[#1A1A1A] bg-[#0A0A0A] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Tradex Sovereign Binary Prediction Protocol</span>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Decentralized Prediction Markets
            </h1>
            <p className="text-xs sm:text-sm text-[#777] font-mono mt-1">
              Trade event outcomes with instant on-chain resolution and zero counterparty risk.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
              <div className="text-[#777] text-[10px]">TOTAL PREDICTION POOL</div>
              <div className="text-white font-bold text-base">$5,970,600</div>
            </div>
            <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
              <div className="text-[#777] text-[10px]">SETTLEMENT</div>
              <div className="text-[#00FF41] font-bold text-base">BSV Non-Custodial</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Markets List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#888] flex items-center justify-between">
            <span>Active Sovereign Markets</span>
            <span className="text-[#00FF41]">4 Live Outlets</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {MARKETS.map((m) => {
              const isSelected = selectedMarket.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMarket(m)}
                  className={`p-5 rounded-xl bg-[#0D0D0D] border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#00FF41] shadow-[0_0_25px_rgba(0,255,65,0.15)] bg-[#111]'
                      : 'border-[#1E1E1E] hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-xl">
                        {m.icon}
                      </div>
                      <div>
                        <div className="text-xs font-mono text-[#00FF41] uppercase tracking-wider">{m.category}</div>
                        <h3 className="text-base font-bold text-white mt-0.5">{m.title}</h3>
                        <div className="flex items-center space-x-3 text-xs font-mono text-[#777] mt-2">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{m.endTime}</span>
                          </span>
                          <span>•</span>
                          <span>Vol: {m.totalVolume}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Probability Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-[#00FF41]">YES ${(m.yesPrice * 100).toFixed(0)}¢ ({(m.yesPrice * 100).toFixed(0)}%)</span>
                      <span className="text-red-500">NO ${(m.noPrice * 100).toFixed(0)}¢ ({(m.noPrice * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden flex">
                      <div className="bg-[#00FF41]" style={{ width: `${m.yesPrice * 100}%` }} />
                      <div className="bg-red-500" style={{ width: `${m.noPrice * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order / Prediction Placement Form */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] h-fit space-y-5">
          <div>
            <div className="text-xs font-mono text-[#777] uppercase">Trading Outlet</div>
            <h2 className="text-base font-black text-white mt-1 leading-snug">{selectedMarket.title}</h2>
          </div>

          {/* YES / NO Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOutcome('yes')}
              className={`py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                outcome === 'yes'
                  ? 'bg-[#00FF41] text-black shadow-lg'
                  : 'bg-[#181818] text-[#888] hover:text-white border border-[#262626]'
              }`}
            >
              YES ${(selectedMarket.yesPrice * 100).toFixed(0)}¢
            </button>
            <button
              onClick={() => setOutcome('no')}
              className={`py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                outcome === 'no'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-[#181818] text-[#888] hover:text-white border border-[#262626]'
              }`}
            >
              NO ${(selectedMarket.noPrice * 100).toFixed(0)}¢
            </button>
          </div>

          <form onSubmit={handlePlaceBet} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#777] uppercase mb-1">Investment Amount (USDT)</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div className="p-3.5 rounded-lg bg-[#141414] border border-[#222] text-xs font-mono space-y-1.5 text-[#888]">
              <div className="flex justify-between">
                <span>Contract Shares:</span>
                <span className="text-white font-bold">{shares.toFixed(2)} Shares</span>
              </div>
              <div className="flex justify-between">
                <span>Potential Payout:</span>
                <span className="text-[#00FF41] font-bold">${potentialReturn.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Est. ROI:</span>
                <span className="text-amber-400 font-bold">
                  +{(((potentialReturn - (parseFloat(betAmount) || 0)) / (parseFloat(betAmount) || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] ${
                outcome === 'yes'
                  ? 'bg-[#00FF41] hover:bg-[#00D436] text-black shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              }`}
            >
              {isConnected ? `Confirm ${outcome.toUpperCase()} Position` : 'Connect Wallet to Predict'}
            </button>
          </form>

          {notification && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{notification}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
