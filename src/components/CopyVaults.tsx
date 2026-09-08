import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { perpService } from '../services/perpService';
import { CopyVault } from '../types/dex';
import { CoinLogo } from './CoinLogo';
import confetti from '../utils/confetti';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Award,
  Zap,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

export const CopyVaults: React.FC = () => {
  const { isConnected, openWalletModal } = useWallet();

  const [vaults, setVaults] = useState<CopyVault[]>([]);
  const [selectedVault, setSelectedVault] = useState<CopyVault | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('100');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setVaults(perpService.getCopyVaults());
  }, []);

  const handleOpenDeposit = (vault: CopyVault) => {
    setSelectedVault(vault);
    setDepositAmount(vault.minDepositUsd.toString());
    setIsDepositModalOpen(true);
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      openWalletModal();
      return;
    }
    if (!selectedVault) return;

    const amt = parseFloat(depositAmount) || 100;
    const updated = perpService.toggleCopyVault(selectedVault.id, amt);
    if (updated) {
      setVaults([...perpService.getCopyVaults()]);
      setIsDepositModalOpen(false);

      if (updated.isUserSubscribed) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleUnsubscribe = (vaultId: string) => {
    const updated = perpService.toggleCopyVault(vaultId, 0);
    if (updated) {
      setVaults([...perpService.getCopyVaults()]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-mono text-[#E0E0E0]">
      
      {/* Banner / Header */}
      <div className="mb-6 p-6 rounded-sm bg-[#0A0A0A] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#00FF41] text-xs font-bold uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>Tradex (tradex.com) Algorithmic Strategy Vaults • On-Chain Settlement</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase mt-1">
            Algorithmic Strategy Vaults
          </h1>
          <p className="text-xs text-[#777] max-w-2xl mt-1">
            Automatically mirror verified high-frequency AI trading models and institutional quantitative funds with zero lockup and direct on-chain profit distribution.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-[10px] text-[#666] uppercase font-bold">Total Vault AUM</div>
            <div className="text-xl font-black text-white">$4,466,200 USD</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#666] uppercase font-bold">Active Copiers</div>
            <div className="text-xl font-black text-[#00FF41]">1,621 Traders</div>
          </div>
        </div>
      </div>

      {/* Vault Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {vaults.map((vault) => (
          <div
            key={vault.id}
            className={`rounded-sm bg-[#0A0A0A] border transition-all flex flex-col justify-between p-6 ${
              vault.isUserSubscribed
                ? 'border-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.15)]'
                : 'border-[#222] hover:border-[#333]'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#222]">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl p-2 rounded-sm bg-[#111] border border-[#222]">{vault.avatar}</span>
                  <div>
                    <h3 className="font-black text-base text-white tracking-tight">{vault.name}</h3>
                    <div className="text-[10px] text-[#777] font-mono">By {vault.curator}</div>
                  </div>
                </div>

                {vault.isUserSubscribed && (
                  <span className="px-2 py-0.5 rounded-sm bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 text-[9px] font-bold uppercase tracking-wider">
                    Active Copy
                  </span>
                )}
              </div>

              {/* Strategy Description */}
              <p className="text-xs text-[#888] my-4 leading-relaxed line-clamp-3">
                {vault.strategy}
              </p>

              {/* Target Markets */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-[10px] text-[#555] uppercase font-bold mr-1">Markets:</span>
                {vault.targetMarkets.map((m) => (
                  <span key={m} className="px-2 py-0.5 bg-[#111] text-white text-[10px] font-bold rounded border border-[#252525] flex items-center space-x-1">
                    <CoinLogo symbol={m.split('-')[0].split('/')[0]} size="xs" />
                    <span>{m}</span>
                  </span>
                ))}
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-sm bg-[#111] border border-[#222] text-xs font-mono mb-4">
                <div>
                  <div className="text-[9px] text-[#666] uppercase font-bold">30D ROI</div>
                  <div className="text-sm font-black text-[#00FF41] mt-0.5">+{vault.roi30d}%</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#666] uppercase font-bold">Win Rate</div>
                  <div className="text-sm font-black text-white mt-0.5">{vault.winRate}%</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#666] uppercase font-bold">Sharpe Ratio</div>
                  <div className="text-sm font-black text-cyan-400 mt-0.5">{vault.sharpeRatio}</div>
                </div>
              </div>

              {/* Visual Performance Curve */}
              <div className="mb-4">
                <div className="flex justify-between text-[9px] text-[#666] uppercase mb-1">
                  <span>30D Growth Curve</span>
                  <span className="text-[#00FF41] font-bold">All-Time: +{vault.roiAllTime}%</span>
                </div>
                <div className="h-14 flex items-end justify-between gap-1 p-1 bg-[#050505] rounded-sm border border-[#181818]">
                  {vault.chartData.map((d, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#00FF41] opacity-70 rounded-t-[1px] hover:opacity-100 transition-opacity"
                      style={{ height: `${Math.max(15, (d.roi / vault.roi30d) * 100)}%` }}
                      title={`${d.day}: +${d.roi}%`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Vault Details */}
              <div className="space-y-1 text-[10px] text-[#666] mb-4">
                <div className="flex justify-between">
                  <span>Total AUM:</span>
                  <span className="text-white font-bold">${vault.totalAumUsd.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Copiers:</span>
                  <span className="text-white font-bold">{vault.copiersCount} Traders</span>
                </div>
                <div className="flex justify-between">
                  <span>Fees:</span>
                  <span className="text-white font-bold">{vault.managementFeePercent}% Mgmt / {vault.performanceFeePercent}% Perf</span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div>
              {vault.isUserSubscribed ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-sm bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs text-[#00FF41] flex justify-between items-center font-bold">
                    <span>Invested Capital:</span>
                    <span>${vault.userInvestedUsd} USD</span>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(vault.id)}
                    className="w-full py-2.5 rounded-sm bg-[#151515] hover:bg-rose-500/20 text-[#AAA] hover:text-rose-400 border border-[#333] hover:border-rose-500/40 text-xs font-bold uppercase transition-all"
                  >
                    Withdraw & Stop Copying
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenDeposit(vault)}
                  className="w-full py-3.5 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-widest shadow-md hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] active:scale-98 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Copy Strategy (Min ${vault.minDepositUsd})</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DEPOSIT MODAL */}
      {isDepositModalOpen && selectedVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-sm bg-[#0A0A0A] border border-[#333] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <div>
                <span className="text-[10px] text-[#00FF41] uppercase font-bold">Tradensea Mirror Protocol</span>
                <h3 className="text-lg font-black text-white uppercase">{selectedVault.name}</h3>
              </div>
              <button onClick={() => setIsDepositModalOpen(false)} className="text-[#777] hover:text-white font-mono">✕</button>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-sm bg-[#111] border border-[#222] space-y-1 text-[#AAA]">
                <div className="flex justify-between">
                  <span>Curator:</span>
                  <span className="text-white font-bold">{selectedVault.curator}</span>
                </div>
                <div className="flex justify-between">
                  <span>30D Historical ROI:</span>
                  <span className="text-[#00FF41] font-bold">+{selectedVault.roi30d}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance Fee:</span>
                  <span className="text-white">{selectedVault.performanceFeePercent}% on high-water mark</span>
                </div>
              </div>

              <div>
                <label className="block text-[#777] uppercase text-[10px] font-bold mb-1">
                  Deposit Capital (USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#555] absolute left-3 top-2.5" />
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min={selectedVault.minDepositUsd}
                    placeholder={selectedVault.minDepositUsd.toString()}
                    className="w-full pl-8 pr-3 py-2 bg-[#111] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                    required
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#666] mt-1">
                  <span>Min: ${selectedVault.minDepositUsd}</span>
                  <span>Non-Custodial Escrow Locked</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {[50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt.toString())}
                    className="py-1 bg-[#141414] hover:bg-[#202020] border border-[#252525] rounded-sm text-[10px] text-[#AAA]"
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-widest shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Activate Mirror</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
