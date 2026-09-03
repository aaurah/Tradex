import React, { useState } from 'react';
import { EscrowContractType } from '../../types/dex';
import { TRADEX_ESCROW_CONTRACT_ADDRESS, escrowTradingService } from '../../services/escrowTradingService';
import { useWallet } from '../../context/WalletContext';
import { 
  Lock, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Clock, 
  ArrowRight,
  Plus,
  Trash2,
  Cpu
} from 'lucide-react';

interface EscrowCreateTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (contractId: string) => void;
}

export const EscrowCreateTradeModal: React.FC<EscrowCreateTradeModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { account } = useWallet();

  const [title, setTitle] = useState('');
  const [contractType, setContractType] = useState<EscrowContractType>('CROSS_ASSET_ATOMIC');
  
  // Party A (Creator / Depositor)
  const [creatorAddress, setCreatorAddress] = useState(account?.address || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  const [creatorHandle, setCreatorHandle] = useState('$trader_maker');
  const [depositAsset, setDepositAsset] = useState('USDT');
  const [depositAmount, setDepositAmount] = useState('10000');
  const [depositNetwork, setDepositNetwork] = useState('Ethereum (ERC-20)');
  const [autoFundPartyA, setAutoFundPartyA] = useState(true);

  // Party B (Counterparty / Taker)
  const [counterpartyAddress, setCounterpartyAddress] = useState('0xfe9e8709d3215310075d67e3ed32a380ccf451c8');
  const [counterpartyHandle, setCounterpartyHandle] = useState('$partner_desk');
  const [targetAsset, setTargetAsset] = useState('ETH');
  const [targetAmount, setTargetAmount] = useState('3.85');
  const [targetNetwork, setTargetNetwork] = useState('Ethereum Mainnet');

  // Safeguards
  const [inspectionHours, setInspectionHours] = useState('24');
  const [timelockBlocks, setTimelockBlocks] = useState('144');
  const [terms, setTerms] = useState('Mutual on-chain escrow release upon verification of transfer conditions.');

  // Milestones (for MILESTONE_TRANCHE)
  const [milestones, setMilestones] = useState<{ title: string; percentage: number; amount: number }[]>([
    { title: 'Milestone 1: Collateral Lock & Verification', percentage: 40, amount: 4000 },
    { title: 'Milestone 2: Final Settlement & Release', percentage: 60, amount: 6000 }
  ]);

  const [isDeploying, setIsDeploying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: `Milestone ${milestones.length + 1}`, percentage: 20, amount: 0 }
    ]);
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleDeployContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const depAmountNum = parseFloat(depositAmount);
    const tgtAmountNum = parseFloat(targetAmount);

    if (isNaN(depAmountNum) || depAmountNum <= 0) {
      setErrorMsg('Please enter a valid deposit amount.');
      return;
    }
    if (isNaN(tgtAmountNum) || tgtAmountNum <= 0) {
      setErrorMsg('Please enter a valid counterparty target amount.');
      return;
    }
    if (!creatorAddress.trim() || !counterpartyAddress.trim()) {
      setErrorMsg('Please provide valid Party A and Party B addresses.');
      return;
    }

    setIsDeploying(true);

    try {
      // Simulate on-chain contract invocation delay
      await new Promise(r => setTimeout(r, 600));

      const contract = escrowTradingService.createContract({
        title: title.trim() || `${depAmountNum} ${depositAsset} ⇄ ${tgtAmountNum} ${targetAsset} Escrow`,
        type: contractType,
        creatorAddress: creatorAddress.trim(),
        creatorHandle: creatorHandle.trim(),
        counterpartyAddress: counterpartyAddress.trim(),
        counterpartyHandle: counterpartyHandle.trim(),
        depositAsset,
        depositAmount: depAmountNum,
        depositNetwork,
        targetAsset,
        targetAmount: tgtAmountNum,
        targetNetwork,
        inspectionHours: parseInt(inspectionHours) || 24,
        timelockBlocks: parseInt(timelockBlocks) || 144,
        terms: terms.trim(),
        milestones: contractType === 'MILESTONE_TRANCHE' ? milestones : undefined,
        autoFundPartyA
      });

      onCreated(contract.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to deploy contract.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-[#2A2A2A] rounded-sm p-6 space-y-6 shadow-2xl font-mono my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#141414] border border-[#333] text-[#00FF41] rounded-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-wide">
                Deploy Escrow Contract Trade
              </h2>
              <p className="text-xs text-[#777]">
                Verified Escrow Contract: <span className="text-[#00FF41]">{TRADEX_ESCROW_CONTRACT_ADDRESS}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#666] hover:text-white rounded hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-sm text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleDeployContract} className="space-y-5 text-xs">
          
          {/* Contract Type Selection */}
          <div className="space-y-2">
            <label className="text-[#888] uppercase font-bold text-[10px] block">
              Escrow Architecture Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CROSS_ASSET_ATOMIC', label: 'Cross-Asset Atomic', icon: '⇄' },
                { id: 'MILESTONE_TRANCHE', label: 'Milestone Tranches', icon: '☰' },
                { id: 'TIMELOCKED_SAFEGUARD', label: 'CLTV Timelock', icon: '⏱' },
                { id: 'MULTI_SIG_ORACLE', label: '2-of-3 Arbiter Oracle', icon: '⚖' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setContractType(t.id as EscrowContractType)}
                  className={`p-2.5 rounded-sm border text-left transition-all ${
                    contractType === t.id
                      ? 'bg-[#00FF41]/10 border-[#00FF41] text-white font-bold'
                      : 'bg-[#111] border-[#222] text-[#888] hover:text-white'
                  }`}
                >
                  <div className="text-sm mb-1">{t.icon}</div>
                  <div className="text-[11px] leading-tight">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Deal Title */}
          <div>
            <label className="text-[#888] uppercase font-bold text-[10px] block mb-1">
              Deal Title (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. OTC Token Block Trade / Strategic Partnership"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#111] border border-[#2A2A2A] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
            />
          </div>

          {/* Party A (Depositor) */}
          <div className="p-3.5 bg-[#111] border border-[#222] rounded-sm space-y-3">
            <div className="flex items-center justify-between text-orange-400 font-bold uppercase text-[10px]">
              <span>Party A (Your Deposit Asset)</span>
              <span>Maker / Seller</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[#666] text-[10px] block mb-1">Asset Ticker</label>
                <select
                  value={depositAsset}
                  onChange={e => setDepositAsset(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white"
                >
                  <option value="USDT">USDT (Tether)</option>
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="BSV">BSV (Bitcoin SV)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="SOL">SOL (Solana)</option>
                  <option value="A8">A8 (Ancient8)</option>
                  <option value="LMWR">LMWR (LimeWire)</option>
                  <option value="WBTC">WBTC (Wrapped BTC)</option>
                </select>
              </div>

              <div>
                <label className="text-[#666] text-[10px] block mb-1">Deposit Amount</label>
                <input
                  type="number"
                  step="any"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white"
                />
              </div>

              <div>
                <label className="text-[#666] text-[10px] block mb-1">Network</label>
                <select
                  value={depositNetwork}
                  onChange={e => setDepositNetwork(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white"
                >
                  <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
                  <option value="Base (Ethereum L2)">Base (Ethereum L2)</option>
                  <option value="Arbitrum One">Arbitrum One</option>
                  <option value="Bitcoin SV">Bitcoin SV (UTXO)</option>
                  <option value="Solana (SPL)">Solana (SPL)</option>
                  <option value="Polygon PoS">Polygon PoS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[#666] text-[10px] block mb-1">Your Wallet Address</label>
                <input
                  type="text"
                  value={creatorAddress}
                  onChange={e => setCreatorAddress(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white text-[11px]"
                />
              </div>
              <div>
                <label className="text-[#666] text-[10px] block mb-1">Your Handle / Tag</label>
                <input
                  type="text"
                  value={creatorHandle}
                  onChange={e => setCreatorHandle(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white text-[11px]"
                />
              </div>
            </div>

            <label className="flex items-center space-x-2 text-[11px] text-[#AAA] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={autoFundPartyA}
                onChange={e => setAutoFundPartyA(e.target.checked)}
                className="rounded text-[#00FF41] focus:ring-0 bg-[#181818] border-[#333]"
              />
              <span>Auto-fund Party A deposit immediately upon contract deployment</span>
            </label>
          </div>

          {/* Party B (Counterparty) */}
          <div className="p-3.5 bg-[#111] border border-[#222] rounded-sm space-y-3">
            <div className="flex items-center justify-between text-cyan-400 font-bold uppercase text-[10px]">
              <span>Party B (Target Receive Asset)</span>
              <span>Taker / Counterparty</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[#666] text-[10px] block mb-1">Asset Ticker</label>
                <select
                  value={targetAsset}
                  onChange={e => setTargetAsset(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white"
                >
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="USDT">USDT (Tether)</option>
                  <option value="BSV">BSV (Bitcoin SV)</option>
                  <option value="SOL">SOL (Solana)</option>
                  <option value="A8">A8 (Ancient8)</option>
                  <option value="LMWR">LMWR (LimeWire)</option>
                  <option value="USDC">USDC (USD Coin)</option>
                </select>
              </div>

              <div>
                <label className="text-[#666] text-[10px] block mb-1">Target Amount</label>
                <input
                  type="number"
                  step="any"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white"
                />
              </div>

              <div>
                <label className="text-[#666] text-[10px] block mb-1">Network</label>
                <select
                  value={targetNetwork}
                  onChange={e => setTargetNetwork(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white"
                >
                  <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                  <option value="Base (Ethereum L2)">Base (Ethereum L2)</option>
                  <option value="Bitcoin SV">Bitcoin SV (UTXO)</option>
                  <option value="Solana High-Throughput">Solana High-Throughput</option>
                  <option value="Arbitrum One">Arbitrum One</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[#666] text-[10px] block mb-1">Counterparty Wallet Address</label>
                <input
                  type="text"
                  value={counterpartyAddress}
                  onChange={e => setCounterpartyAddress(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white text-[11px]"
                />
              </div>
              <div>
                <label className="text-[#666] text-[10px] block mb-1">Counterparty Handle</label>
                <input
                  type="text"
                  value={counterpartyHandle}
                  onChange={e => setCounterpartyHandle(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#181818] border border-[#333] rounded-sm text-white text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Milestone Tranches (if MILESTONE_TRANCHE selected) */}
          {contractType === 'MILESTONE_TRANCHE' && (
            <div className="p-3.5 bg-[#111] border border-[#222] rounded-sm space-y-3">
              <div className="flex items-center justify-between text-[#888] font-bold uppercase text-[10px]">
                <span>Milestone Tranches Breakdown</span>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="text-[#00FF41] hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Tranche</span>
                </button>
              </div>

              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={m.title}
                    onChange={e => {
                      const updated = [...milestones];
                      updated[idx].title = e.target.value;
                      setMilestones(updated);
                    }}
                    placeholder="Milestone description"
                    className="flex-1 px-2 py-1 bg-[#181818] border border-[#333] rounded-sm text-white text-[11px]"
                  />
                  <input
                    type="number"
                    value={m.percentage}
                    onChange={e => {
                      const updated = [...milestones];
                      updated[idx].percentage = parseInt(e.target.value) || 0;
                      updated[idx].amount = (parseFloat(depositAmount) || 0) * (updated[idx].percentage / 100);
                      setMilestones(updated);
                    }}
                    placeholder="%"
                    className="w-16 px-2 py-1 bg-[#181818] border border-[#333] rounded-sm text-white text-center text-[11px]"
                  />
                  <span className="text-[#888] text-[11px]">%</span>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Timing & Safeguards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#888] uppercase font-bold text-[10px] block mb-1">
                Inspection Window:
              </label>
              <select
                value={inspectionHours}
                onChange={e => setInspectionHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#2A2A2A] rounded-sm text-white"
              >
                <option value="2">2 Hours (Express)</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (Standard)</option>
                <option value="48">48 Hours (2 Days)</option>
                <option value="72">72 Hours (3 Days)</option>
              </select>
            </div>

            <div>
              <label className="text-[#888] uppercase font-bold text-[10px] block mb-1">
                Arbitration Oracle:
              </label>
              <input
                type="text"
                disabled
                value={`Tradex Sovereign AI Oracle (${TRADEX_ESCROW_CONTRACT_ADDRESS.slice(0, 8)}...)`}
                className="w-full px-3 py-2 bg-[#161616] border border-[#222] rounded-sm text-[#888] text-[11px]"
              />
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="text-[#888] uppercase font-bold text-[10px] block mb-1">
              Escrow Trade Terms & Conditions:
            </label>
            <textarea
              rows={2}
              value={terms}
              onChange={e => setTerms(e.target.value)}
              className="w-full px-3 py-2 bg-[#111] border border-[#2A2A2A] rounded-sm text-white focus:outline-none focus:border-[#00FF41] text-[11px]"
            />
          </div>

          {/* Submission Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#141414] hover:bg-[#1C1C1C] border border-[#333] text-[#AAA] rounded-sm text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying}
              className="px-5 py-2 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black uppercase tracking-wider rounded-sm text-xs transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  <span>Deploying Contract...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Deploy to 0x4deb...1cF2</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
