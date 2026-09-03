import React, { useState } from 'react';
import { EscrowContract } from '../../types/dex';
import { TRADEX_ESCROW_CONTRACT_ADDRESS, escrowTradingService } from '../../services/escrowTradingService';
import { copyToClipboard } from '../../utils/clipboard';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  RotateCcw, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  Code, 
  Clock, 
  Cpu, 
  Scale,
  User,
  ArrowRight
} from 'lucide-react';

interface EscrowDealDetailModalProps {
  contract: EscrowContract | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const EscrowDealDetailModal: React.FC<EscrowDealDetailModalProps> = ({
  contract,
  onClose,
  onUpdated
}) => {
  if (!contract) return null;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFundParty = (party: 'A' | 'B') => {
    setIsProcessing(true);
    try {
      if (party === 'A') escrowTradingService.fundPartyA(contract.id);
      else escrowTradingService.fundPartyB(contract.id);
      setActionSuccess(`Party ${party} deposit funded into Escrow Contract ${TRADEX_ESCROW_CONTRACT_ADDRESS.slice(0, 8)}...`);
      onUpdated();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRelease = () => {
    setIsProcessing(true);
    try {
      const res = escrowTradingService.releaseContract(contract.id);
      setActionSuccess(`Escrow released successfully on-chain! TxID: ${res.txid}`);
      onUpdated();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReleaseMilestone = (milestoneId: string) => {
    setIsProcessing(true);
    try {
      escrowTradingService.releaseMilestone(contract.id, milestoneId);
      setActionSuccess(`Milestone tranche released!`);
      onUpdated();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = () => {
    setIsProcessing(true);
    try {
      escrowTradingService.refundContract(contract.id, 'User initiated refund');
      setActionSuccess('Escrow refunded to Maker wallet.');
      onUpdated();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRaiseDispute = () => {
    setIsProcessing(true);
    try {
      escrowTradingService.raiseDispute(contract.id, 'Delivery verification discrepancy reported');
      setActionSuccess('Dispute raised. Tradex AI Arbitration Oracle summoned.');
      onUpdated();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOracleResolve = (favorMaker: boolean) => {
    setIsProcessing(true);
    try {
      escrowTradingService.resolveDisputeWithOracle(contract.id, favorMaker);
      setActionSuccess('Oracle arbitration verdict finalized and executed on-chain.');
      onUpdated();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDualFunded = contract.status === 'DUAL_FUNDED';
  const isSettled = contract.status === 'SETTLED';
  const isRefunded = contract.status === 'REFUNDED';
  const isDisputed = contract.status === 'DISPUTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative w-full max-w-3xl bg-[#0A0A0A] border border-[#2A2A2A] rounded-sm p-6 space-y-6 shadow-2xl my-8 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-sm bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 text-[10px] font-bold uppercase">
                {contract.type.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-[#666]">ID: {contract.id}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {contract.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#666] hover:text-white rounded hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-[#00FF41]/15 border border-[#00FF41]/40 rounded-sm text-[#00FF41] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Verified Contract Address Callout */}
        <div className="p-3.5 bg-[#121212] border border-[#222] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#00FF41]" />
            <span className="text-[#888]">Escrow Smart Contract:</span>
            <span className="text-[#00FF41] font-bold break-all">
              {TRADEX_ESCROW_CONTRACT_ADDRESS}
            </span>
          </div>
          <button
            onClick={() => handleCopy(TRADEX_ESCROW_CONTRACT_ADDRESS, 'contract')}
            className="text-[11px] text-[#888] hover:text-white flex items-center space-x-1 shrink-0"
          >
            {copiedKey === 'contract' ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Address</span>
          </button>
        </div>

        {/* Counterparty Swap Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Party A */}
          <div className="p-4 bg-[#111] border border-[#222] rounded-sm space-y-2">
            <div className="flex items-center justify-between text-[#888] text-[11px]">
              <span className="text-orange-400 font-bold flex items-center space-x-1">
                <User className="w-3.5 h-3.5" />
                <span>Party A (Maker)</span>
              </span>
              <span className="text-orange-400 font-bold">{contract.creatorHandle}</span>
            </div>
            <div className="text-lg font-black text-white">
              {contract.depositAmount.toLocaleString()} {contract.depositAsset}
            </div>
            <div className="text-[11px] text-[#666] truncate">
              {contract.creatorAddress}
            </div>
            <div className="text-[10px] text-[#555]">
              Network: <strong className="text-[#AAA]">{contract.depositNetwork}</strong>
            </div>
            <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between">
              <span className="text-[11px] text-[#888]">Deposit Status:</span>
              {contract.isPartyAFunded ? (
                <span className="text-[#00FF41] font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Funded & Locked</span>
                </span>
              ) : (
                <button
                  onClick={() => handleFundParty('A')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold rounded-sm hover:bg-orange-500/30"
                >
                  Deposit Now
                </button>
              )}
            </div>
          </div>

          {/* Party B */}
          <div className="p-4 bg-[#111] border border-[#222] rounded-sm space-y-2">
            <div className="flex items-center justify-between text-[#888] text-[11px]">
              <span className="text-cyan-400 font-bold flex items-center space-x-1">
                <User className="w-3.5 h-3.5" />
                <span>Party B (Taker)</span>
              </span>
              <span className="text-cyan-400 font-bold">{contract.counterpartyHandle}</span>
            </div>
            <div className="text-lg font-black text-white">
              {contract.targetAmount.toLocaleString()} {contract.targetAsset}
            </div>
            <div className="text-[11px] text-[#666] truncate">
              {contract.counterpartyAddress}
            </div>
            <div className="text-[10px] text-[#555]">
              Network: <strong className="text-[#AAA]">{contract.targetNetwork}</strong>
            </div>
            <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between">
              <span className="text-[11px] text-[#888]">Deposit Status:</span>
              {contract.isPartyBFunded ? (
                <span className="text-[#00FF41] font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Funded & Locked</span>
                </span>
              ) : (
                <button
                  onClick={() => handleFundParty('B')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold rounded-sm hover:bg-cyan-500/30"
                >
                  Deposit Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Milestone Tranches (if any) */}
        {contract.milestones && contract.milestones.length > 0 && (
          <div className="p-4 bg-[#111] border border-[#222] rounded-sm space-y-3">
            <div className="text-[11px] font-bold text-white uppercase flex items-center space-x-1.5">
              <span>Milestone Tranches Execution</span>
            </div>
            <div className="space-y-2">
              {contract.milestones.map((m) => (
                <div key={m.id} className="p-3 bg-[#181818] rounded border border-[#282828] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">{m.title}</div>
                    <div className="text-[10px] text-[#888]">
                      {m.percentage}% Tranche • {m.amount.toLocaleString()} {contract.depositAsset}
                    </div>
                  </div>
                  <div>
                    {m.status === 'RELEASED' ? (
                      <span className="text-[#00FF41] text-[10px] font-bold">✓ Released</span>
                    ) : (
                      <button
                        onClick={() => handleReleaseMilestone(m.id)}
                        disabled={isProcessing}
                        className="px-2.5 py-1 bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#00FF41] border border-[#00FF41]/40 rounded-sm font-bold text-[10px]"
                      >
                        Release Tranche
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Sig Locking Script ASM */}
        <div className="p-4 bg-[#111] border border-[#222] rounded-sm space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#888]">
            <span className="flex items-center space-x-1.5 text-white font-bold uppercase">
              <Code className="w-3.5 h-3.5 text-[#00FF41]" />
              <span>Smart Locking Script ASM ({contract.scriptType})</span>
            </span>
            <button
              onClick={() => handleCopy(contract.scriptAsm, 'script')}
              className="text-[#888] hover:text-white flex items-center space-x-1"
            >
              {copiedKey === 'script' ? <Check className="w-3 h-3 text-[#00FF41]" /> : <Copy className="w-3 h-3" />}
              <span>Copy ASM</span>
            </button>
          </div>
          <div className="p-3 bg-[#080808] border border-[#1A1A1A] rounded-sm text-[11px] text-[#00FF41] font-mono break-all leading-relaxed max-h-24 overflow-y-auto">
            {contract.scriptAsm}
          </div>
          <div className="text-[10px] text-[#666]">
            Script Hash: <strong className="text-[#AAA]">{contract.scriptHash}</strong>
          </div>
        </div>

        {/* Dispute / Oracle verdict banner if any */}
        {isDisputed && (
          <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-sm space-y-2">
            <div className="text-red-400 font-bold flex items-center space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Dispute Active — Awaiting Arbitration Resolution</span>
            </div>
            <p className="text-[11px] text-[#AAA]">
              Dispute Reason: {contract.disputeReason || 'Specification mismatch reported.'}
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => handleOracleResolve(true)}
                className="px-3 py-1.5 bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#00FF41] border border-[#00FF41]/40 rounded-sm text-xs font-bold"
              >
                Oracle: Rule for Maker
              </button>
              <button
                onClick={() => handleOracleResolve(false)}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-sm text-xs font-bold"
              >
                Oracle: Refund Buyer
              </button>
            </div>
          </div>
        )}

        {/* Settlement TxID if settled */}
        {contract.settlementTxId && (
          <div className="p-3 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-sm flex items-center justify-between text-[11px]">
            <span className="text-[#00FF41] font-bold">Settlement TxID:</span>
            <span className="text-white truncate max-w-xs">{contract.settlementTxId}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#222]">
          <div className="flex items-center space-x-2 text-[11px] text-[#777]">
            <Clock className="w-3.5 h-3.5" />
            <span>Inspection: {contract.inspectionHours}h</span>
            <span>•</span>
            <span>Collateral: ${contract.securityCollateralUsd.toLocaleString()} USD</span>
          </div>

          <div className="flex items-center space-x-2">
            {!isSettled && !isRefunded && !isDisputed && (
              <button
                onClick={handleRaiseDispute}
                disabled={isProcessing}
                className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-400 rounded-sm text-xs transition-colors"
              >
                Raise Dispute
              </button>
            )}

            {!isSettled && !isRefunded && (
              <button
                onClick={handleRefund}
                disabled={isProcessing}
                className="px-3 py-1.5 bg-[#181818] hover:bg-[#222] border border-[#333] text-[#AAA] rounded-sm text-xs transition-colors"
              >
                Refund Escrow
              </button>
            )}

            {isDualFunded && !isSettled && (
              <button
                onClick={handleRelease}
                disabled={isProcessing}
                className="px-4 py-1.5 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black uppercase tracking-wider rounded-sm text-xs transition-all flex items-center space-x-1.5 shadow-[0_0_12px_rgba(0,255,65,0.3)]"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Release Funds</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
