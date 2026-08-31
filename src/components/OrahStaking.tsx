import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CoinLogo } from './CoinLogo';
import confetti from 'canvas-confetti';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Lock,
  Unlock,
  DollarSign,
  Gift,
  Flame,
  Layers,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface StakingPool {
  id: string;
  name: string;
  token: string;
  tokenIcon: string;
  network: string;
  apr: number;
  lockDurationDays: number;
  totalStakedUsd: number;
  totalStakedTokens: number;
  multiplier: string;
  userStaked: number;
  pendingRewards: number;
  rewardToken: string;
  isPopular?: boolean;
}

const INITIAL_POOLS: StakingPool[] = [
  {
    id: 'pool_orah_90d',
    name: 'ORAH Protocol Diamond Pool',
    token: 'ORAH',
    tokenIcon: '⚡',
    network: 'Base & Multi-Chain',
    apr: 92.4,
    lockDurationDays: 90,
    totalStakedUsd: 12450000,
    totalStakedTokens: 8412162,
    multiplier: '3.5x VIP Boost',
    userStaked: 1500,
    pendingRewards: 114.28,
    rewardToken: 'ORAH + USDC',
    isPopular: true
  },
  {
    id: 'pool_orah_30d',
    name: 'ORAH High-Yield Staking',
    token: 'ORAH',
    tokenIcon: '⚡',
    network: 'Base / Solana',
    apr: 48.5,
    lockDurationDays: 30,
    totalStakedUsd: 6180000,
    totalStakedTokens: 4175675,
    multiplier: '2.0x Boost',
    userStaked: 0,
    pendingRewards: 0,
    rewardToken: 'ORAH',
    isPopular: false
  },
  {
    id: 'pool_orah_flex',
    name: 'ORAH Flexible Staking',
    token: 'ORAH',
    tokenIcon: '⚡',
    network: 'Universal',
    apr: 18.2,
    lockDurationDays: 0,
    totalStakedUsd: 3290000,
    totalStakedTokens: 2222972,
    multiplier: '1.0x',
    userStaked: 0,
    pendingRewards: 0,
    rewardToken: 'ORAH',
    isPopular: false
  },
  {
    id: 'pool_aura_ai',
    name: 'AURA AI Compute Staking',
    token: 'AURA',
    tokenIcon: '🤖',
    network: 'Solana / BSV',
    apr: 64.8,
    lockDurationDays: 45,
    totalStakedUsd: 4820000,
    totalStakedTokens: 979674,
    multiplier: '2.5x Compute Boost',
    userStaked: 250,
    pendingRewards: 42.10,
    rewardToken: 'AURA + Trading Rebates',
    isPopular: true
  }
];

interface OrahStakingProps {
  onGoToSwap?: () => void;
}

export const OrahStaking: React.FC<OrahStakingProps> = ({ onGoToSwap }) => {
  const { isConnected, openWalletModal } = useWallet();

  const [pools, setPools] = useState<StakingPool[]>(INITIAL_POOLS);
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('500');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'stake' | 'unstake'>('stake');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Aggregate user stats
  const totalUserStakedUsd = pools.reduce((acc, p) => acc + (p.userStaked * (p.token === 'ORAH' ? 1.48 : 4.92)), 0);
  const totalUserPendingRewardsUsd = pools.reduce((acc, p) => acc + (p.pendingRewards * (p.token === 'ORAH' ? 1.48 : 4.92)), 0);

  const handleOpenModal = (pool: StakingPool, type: 'stake' | 'unstake') => {
    setSelectedPool(pool);
    setActionType(type);
    setStakeAmount(type === 'stake' ? '250' : pool.userStaked.toString());
    setIsModalOpen(true);
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      openWalletModal();
      return;
    }
    if (!selectedPool) return;

    const amt = parseFloat(stakeAmount) || 0;
    if (amt <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      setPools(prev => prev.map(p => {
        if (p.id === selectedPool.id) {
          const newStaked = actionType === 'stake' ? p.userStaked + amt : Math.max(0, p.userStaked - amt);
          return {
            ...p,
            userStaked: newStaked,
            totalStakedTokens: actionType === 'stake' ? p.totalStakedTokens + amt : p.totalStakedTokens - amt
          };
        }
        return p;
      }));

      setIsProcessing(false);
      setIsModalOpen(false);

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 450);
  };

  const handleClaimAll = () => {
    if (!isConnected) {
      openWalletModal();
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setPools(prev => prev.map(p => ({ ...p, pendingRewards: 0 })));
      setIsProcessing(false);

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.5 }
      });
    }, 400);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-mono text-[#E0E0E0]">
      
      {/* Banner / Header */}
      <div className="mb-6 p-6 rounded-sm bg-[#0A0A0A] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#00FF41] text-xs font-bold uppercase tracking-widest">
            <Coins className="w-4 h-4" />
            <span>Tradex Protocol Staking & Real Yield Sharing</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase mt-1">
            $ORAH & $AURA Staking Vaults
          </h1>
          <p className="text-xs text-[#777] max-w-2xl mt-1">
            Stake $ORAH and $AURA to capture real protocol trading fees, earn up to 92.4% APR, unlock 50% perpetual trading fee discounts, and fuel autonomous AI agent compute.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onGoToSwap && (
            <button
              onClick={onGoToSwap}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-sm bg-[#151515] hover:bg-[#202020] border border-[#333] text-xs font-bold text-white uppercase transition-all"
            >
              <span>Get $ORAH</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleClaimAll}
            disabled={totalUserPendingRewardsUsd <= 0 || isProcessing}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider shadow-lg disabled:opacity-50 transition-all"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Claim Rewards (${totalUserPendingRewardsUsd.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Global Protocol Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs font-mono">
        <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold">Total $ORAH Staked</div>
          <div className="text-xl font-black text-white mt-1">$21,920,000 USD</div>
          <div className="text-[10px] text-[#00FF41] mt-0.5">62.4% Circulating Supply Locked</div>
        </div>

        <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold">Protocol Real Yield Paid</div>
          <div className="text-xl font-black text-[#00FF41] mt-1">$1,420,890 USD</div>
          <div className="text-[10px] text-[#00FF41] mt-0.5">Distributed from 0.02% Perp Fees</div>
        </div>

        <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold">Your Staked Balance</div>
          <div className="text-xl font-black text-white mt-1">${totalUserStakedUsd.toFixed(2)} USD</div>
          <div className="text-[10px] text-[#777] mt-0.5">Across {pools.filter(p => p.userStaked > 0).length} Pools</div>
        </div>

        <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold">Native Token Price</div>
          <div className="text-xl font-black text-[#00FF41] mt-1">$1.48 USD</div>
          <div className="text-[10px] text-[#00FF41] mt-0.5">+18.65% (Base / Multi-chain)</div>
        </div>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className={`rounded-sm bg-[#0A0A0A] border p-6 flex flex-col justify-between transition-all ${
              pool.isPopular ? 'border-[#00FF41]/60 shadow-[0_0_20px_rgba(0,255,65,0.08)]' : 'border-[#222] hover:border-[#333]'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#222]">
                <div className="flex items-center space-x-3">
                  <CoinLogo symbol={pool.token} size="lg" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-base text-white">{pool.name}</h3>
                      {pool.isPopular && (
                        <span className="px-1.5 py-0.5 rounded-sm bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 text-[9px] font-bold uppercase">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#777] mt-0.5">Network: {pool.network}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#666] uppercase font-bold">Est. APR</div>
                  <div className="text-2xl font-black text-[#00FF41]">{pool.apr}%</div>
                </div>
              </div>

              {/* Pool Metrics Specs */}
              <div className="grid grid-cols-3 gap-2 p-3 my-4 rounded-sm bg-[#111] border border-[#222] text-xs">
                <div>
                  <div className="text-[9px] text-[#666] uppercase font-bold">Lock Period</div>
                  <div className="text-white font-bold mt-0.5">
                    {pool.lockDurationDays > 0 ? `${pool.lockDurationDays} Days` : 'Flexible (No Lock)'}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#666] uppercase font-bold">Weight Multiplier</div>
                  <div className="text-cyan-400 font-bold mt-0.5">{pool.multiplier}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#666] uppercase font-bold">Reward Payout</div>
                  <div className="text-white font-bold mt-0.5">{pool.rewardToken}</div>
                </div>
              </div>

              {/* User Position */}
              <div className="p-3 rounded-sm bg-[#070707] border border-[#181818] space-y-2 mb-4 text-xs">
                <div className="flex justify-between items-center text-[#777]">
                  <span>Your Staked:</span>
                  <span className="text-white font-bold">
                    {pool.userStaked} {pool.token} (${(pool.userStaked * (pool.token === 'ORAH' ? 1.48 : 4.92)).toFixed(2)})
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#777]">
                  <span>Claimable Yield:</span>
                  <span className="text-[#00FF41] font-bold">
                    +{pool.pendingRewards.toFixed(2)} {pool.token}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#555] text-[10px]">
                  <span>Total Pool Staked:</span>
                  <span>${(pool.totalStakedUsd / 1000000).toFixed(2)}M USD</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleOpenModal(pool, 'stake')}
                className="py-3 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center space-x-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Stake {pool.token}</span>
              </button>

              <button
                onClick={() => handleOpenModal(pool, 'unstake')}
                disabled={pool.userStaked <= 0}
                className="py-3 rounded-sm bg-[#151515] hover:bg-[#202020] border border-[#333] text-[#AAA] hover:text-white font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-30 flex items-center justify-center space-x-1"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unstake</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* VIP Tier Perks Info Card */}
      <div className="mt-6 p-5 rounded-sm bg-[#0A0A0A] border border-[#222] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-sm bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] font-black text-lg">
            ⭐
          </div>
          <div>
            <div className="font-black text-white uppercase text-sm">Tradex VIP Trader Tier Benefits</div>
            <div className="text-[11px] text-[#777]">Hold or Stake &gt; 1,000 $ORAH to unlock 50% taker fee rebate & zero gas relay on BSV / Base.</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <span className="text-[#00FF41] font-bold">✓ 0.01% Maker Fee</span>
          <span className="text-[#00FF41] font-bold">✓ Priority AI Agent RPC</span>
          <span className="text-[#00FF41] font-bold">✓ Vault Curator Rights</span>
        </div>
      </div>

      {/* STAKE / UNSTAKE MODAL */}
      {isModalOpen && selectedPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-sm bg-[#0A0A0A] border border-[#333] p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <div>
                <span className="text-[10px] text-[#00FF41] uppercase font-bold tracking-widest">
                  {actionType === 'stake' ? 'Deposit to Vault' : 'Withdraw Staked Position'}
                </span>
                <h3 className="text-lg font-black text-white uppercase">{selectedPool.name}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#777] hover:text-white font-mono">✕</button>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-sm bg-[#111] border border-[#222] space-y-1.5 text-[#AAA]">
                <div className="flex justify-between">
                  <span>Pool APR:</span>
                  <span className="text-[#00FF41] font-bold">{selectedPool.apr}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Lock Terms:</span>
                  <span className="text-white">
                    {selectedPool.lockDurationDays > 0 ? `${selectedPool.lockDurationDays} Days` : 'Instant Unstake'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Your Current Stake:</span>
                  <span className="text-white font-bold">{selectedPool.userStaked} {selectedPool.token}</span>
                </div>
              </div>

              <div>
                <label className="block text-[#777] uppercase text-[10px] font-bold mb-1">
                  Amount to {actionType === 'stake' ? 'Stake' : 'Unstake'} ({selectedPool.token})
                </label>
                <div className="relative">
                  <Coins className="w-4 h-4 text-[#555] absolute left-3 top-2.5" />
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="100"
                    min="1"
                    className="w-full pl-8 pr-3 py-2 bg-[#111] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStakeAmount(amt.toString())}
                    className="py-1 bg-[#141414] hover:bg-[#202020] border border-[#252525] rounded-sm text-[10px] text-[#AAA]"
                  >
                    {amt} {selectedPool.token}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-widest shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Confirming on-chain...'
                    : `Confirm ${actionType === 'stake' ? 'Stake' : 'Unstake'} ${selectedPool.token}`}
                </span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
