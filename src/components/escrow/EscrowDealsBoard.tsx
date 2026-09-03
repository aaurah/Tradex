import React, { useState } from 'react';
import { EscrowContract, EscrowContractStatus } from '../../types/dex';
import { TRADEX_ESCROW_CONTRACT_ADDRESS, escrowTradingService } from '../../services/escrowTradingService';
import { copyToClipboard } from '../../utils/clipboard';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ArrowRight, 
  Lock, 
  Unlock, 
  RotateCcw, 
  FileText,
  User,
  Copy,
  Check,
  ChevronRight,
  Flame,
  Scale
} from 'lucide-react';

interface EscrowDealsBoardProps {
  contracts: EscrowContract[];
  onSelectContract: (contract: EscrowContract) => void;
  onRefresh: () => void;
}

export const EscrowDealsBoard: React.FC<EscrowDealsBoardProps> = ({
  contracts,
  onSelectContract,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickFund = (contractId: string, party: 'A' | 'B') => {
    try {
      if (party === 'A') {
        escrowTradingService.fundPartyA(contractId);
        setActionNotice(`Successfully funded Party A deposit into Escrow Contract ${TRADEX_ESCROW_CONTRACT_ADDRESS.slice(0, 8)}...`);
      } else {
        escrowTradingService.fundPartyB(contractId);
        setActionNotice(`Successfully funded Party B deposit into Escrow Contract ${TRADEX_ESCROW_CONTRACT_ADDRESS.slice(0, 8)}...`);
      }
      onRefresh();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleQuickRelease = (contractId: string) => {
    try {
      const res = escrowTradingService.releaseContract(contractId);
      setActionNotice(`🎉 Escrow funds released on-chain! Settlement TxID: ${res.txid.slice(0, 14)}...`);
      onRefresh();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleQuickRefund = (contractId: string) => {
    try {
      escrowTradingService.refundContract(contractId, 'Mutual refund requested');
      setActionNotice(`Escrow refunded successfully. Capital returned to creator.`);
      onRefresh();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.depositAsset.toLowerCase().includes(q) ||
        c.targetAsset.toLowerCase().includes(q) ||
        c.creatorAddress.toLowerCase().includes(q) ||
        c.counterpartyAddress.toLowerCase().includes(q) ||
        (c.creatorHandle && c.creatorHandle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: EscrowContractStatus) => {
    switch (status) {
      case 'DUAL_FUNDED':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Dual Funded & Locked</span>
          </span>
        );
      case 'PARTY_A_FUNDED':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Party A Funded (Awaiting B)</span>
          </span>
        );
      case 'AWAITING_DEPOSIT':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold bg-[#333] text-[#AAA] border border-[#444] flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Awaiting Deposit</span>
          </span>
        );
      case 'IN_INSPECTION':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>In Inspection Window</span>
          </span>
        );
      case 'SETTLED':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Settled & Released</span>
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center space-x-1">
            <RotateCcw className="w-3 h-3" />
            <span>Refunded</span>
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Dispute Open</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 bg-[#00FF41]/10 border border-[#00FF41]/40 rounded-sm text-[#00FF41] font-mono text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-[#888] hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0A0A] p-4 rounded-sm border border-[#222]">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar font-mono text-xs">
          {[
            { id: 'ALL', label: 'All Contracts' },
            { id: 'DUAL_FUNDED', label: '🔒 Dual Funded' },
            { id: 'PARTY_A_FUNDED', label: '⏳ Awaiting Party B' },
            { id: 'IN_INSPECTION', label: '🛡️ In Inspection' },
            { id: 'SETTLED', label: '✓ Settled' },
            { id: 'DISPUTED', label: '⚠️ Disputed' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-sm font-bold transition-all whitespace-nowrap ${
                filterStatus === f.id
                  ? 'bg-[#00FF41] text-black font-black'
                  : 'bg-[#141414] text-[#888] hover:text-white border border-[#262626]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Query */}
        <div className="relative sm:w-64">
          <input
            type="text"
            placeholder="Search deals, tokens, addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-sm font-mono text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#00FF41]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1.5 text-[#888] hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Deals Grid */}
      {filteredContracts.length === 0 ? (
        <div className="p-12 text-center bg-[#0A0A0A] border border-[#222] rounded-sm font-mono space-y-3">
          <FileText className="w-8 h-8 text-[#555] mx-auto" />
          <div className="text-sm font-bold text-white">No Escrow Deals Found</div>
          <p className="text-xs text-[#777] max-w-md mx-auto">
            No contracts match your selected status filter. Switch filters or click "Create Escrow Trade" to deploy a new trustless deal.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((deal) => {
            const isSettled = deal.status === 'SETTLED';
            const isRefunded = deal.status === 'REFUNDED';
            const isDisputed = deal.status === 'DISPUTED';
            const isDualFunded = deal.status === 'DUAL_FUNDED';
            const canRelease = isDualFunded || deal.status === 'IN_INSPECTION';

            return (
              <div 
                key={deal.id}
                className="bg-[#0A0A0A] hover:bg-[#0D0D0D] border border-[#222] hover:border-[#333] transition-all rounded-sm p-5 space-y-4 font-mono shadow-xl"
              >
                {/* Header Row: Title & Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1A1A1A] pb-3.5">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                        {deal.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-sm text-[10px] bg-[#141414] text-[#888] border border-[#2A2A2A] uppercase">
                        {deal.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#666] mt-1.5">
                      <span>ID: <strong className="text-[#AAA]">{deal.id}</strong></span>
                      <span>•</span>
                      <span>Contract: <strong className="text-[#00FF41]">{TRADEX_ESCROW_CONTRACT_ADDRESS.slice(0, 6)}...{TRADEX_ESCROW_CONTRACT_ADDRESS.slice(-4)}</strong></span>
                      <button 
                        onClick={() => handleCopy(TRADEX_ESCROW_CONTRACT_ADDRESS, `contract-${deal.id}`)}
                        className="text-[#666] hover:text-[#00FF41] inline-flex items-center space-x-1"
                        title="Copy Verified Escrow Contract Address"
                      >
                        {copiedId === `contract-${deal.id}` ? <Check className="w-3 h-3 text-[#00FF41]" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <span>•</span>
                      <span>Created {new Date(deal.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {getStatusBadge(deal.status)}
                  </div>
                </div>

                {/* Main Deal Summary: Party A Asset ⇄ Party B Asset */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#111] p-4 rounded-sm border border-[#1E1E1E]">
                  {/* Party A / Depositor Box */}
                  <div className="md:col-span-5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#777]">
                      <span className="flex items-center space-x-1 text-[#AAA]">
                        <User className="w-3 h-3 text-orange-400" />
                        <span>Party A (Depositor)</span>
                      </span>
                      <span className="text-orange-400 font-bold">{deal.creatorHandle || '$maker'}</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-black text-white">
                        {deal.depositAmount.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-orange-400">{deal.depositAsset}</span>
                      <span className="text-[10px] text-[#777]">({deal.depositNetwork})</span>
                    </div>
                    <div className="text-[10px] text-[#555] truncate font-mono">
                      {deal.depositAddress}
                    </div>
                    <div className="pt-1">
                      {deal.isPartyAFunded ? (
                        <span className="text-[10px] text-[#00FF41] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Deposit Locked in Contract</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickFund(deal.id, 'A')}
                          className="px-2.5 py-1 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-400 text-[10px] font-bold rounded-sm flex items-center space-x-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Deposit {deal.depositAsset} Now</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Center Transfer Arrow */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center text-[#555] py-2 md:py-0">
                    <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#00FF41]">
                      ⇄
                    </div>
                    <span className="text-[9px] text-[#777] uppercase font-bold mt-1 tracking-wider">Atomic Swap</span>
                  </div>

                  {/* Party B / Counterparty Box */}
                  <div className="md:col-span-5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#777]">
                      <span className="flex items-center space-x-1 text-[#AAA]">
                        <User className="w-3 h-3 text-cyan-400" />
                        <span>Party B (Counterparty)</span>
                      </span>
                      <span className="text-cyan-400 font-bold">{deal.counterpartyHandle || '$taker'}</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-black text-white">
                        {deal.targetAmount.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-cyan-400">{deal.targetAsset}</span>
                      <span className="text-[10px] text-[#777]">({deal.targetNetwork})</span>
                    </div>
                    <div className="text-[10px] text-[#555] truncate font-mono">
                      {deal.targetAddress}
                    </div>
                    <div className="pt-1">
                      {deal.isPartyBFunded ? (
                        <span className="text-[10px] text-[#00FF41] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Deposit Locked in Contract</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickFund(deal.id, 'B')}
                          className="px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-400 text-[10px] font-bold rounded-sm flex items-center space-x-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Deposit {deal.targetAsset} Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Milestone Tranches (if any) */}
                {deal.milestones && deal.milestones.length > 0 && (
                  <div className="p-3 bg-[#080808] rounded-sm border border-[#1A1A1A] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#888]">
                      <span>Milestone Tranches ({deal.milestones.length})</span>
                      <span className="text-[#00FF41]">
                        {deal.milestones.filter(m => m.status === 'RELEASED').length} of {deal.milestones.length} Released
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {deal.milestones.map((m) => (
                        <div key={m.id} className="p-2 bg-[#121212] rounded border border-[#222] text-[10px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate max-w-[120px]">{m.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              m.status === 'RELEASED' ? 'bg-[#00FF41]/20 text-[#00FF41]' :
                              m.status === 'APPROVED' ? 'bg-cyan-500/20 text-cyan-400' :
                              'bg-[#222] text-[#888]'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                          <div className="text-[#AAA] font-mono">
                            {m.percentage}% • {m.amount.toLocaleString()} {deal.depositAsset}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls & On-Chain Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-[#777] flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span>Script: <strong className="text-[#AAA]">{deal.scriptType}</strong></span>
                    {deal.inspectionHours > 0 && (
                      <>
                        <span>•</span>
                        <span>Inspection: <strong className="text-white">{deal.inspectionHours}h</strong></span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Release Button */}
                    {canRelease && (
                      <button
                        onClick={() => handleQuickRelease(deal.id)}
                        className="px-3 py-1.5 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black text-xs rounded-sm transition-all flex items-center space-x-1.5 shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Release Escrow</span>
                      </button>
                    )}

                    {/* Refund Button */}
                    {!isSettled && !isRefunded && (
                      <button
                        onClick={() => handleQuickRefund(deal.id)}
                        className="px-3 py-1.5 bg-[#141414] hover:bg-[#1A1A1A] border border-[#333] text-[#AAA] hover:text-white text-xs rounded-sm transition-colors flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Refund</span>
                      </button>
                    )}

                    {/* Full Detail Drawer Trigger */}
                    <button
                      onClick={() => onSelectContract(deal)}
                      className="px-3 py-1.5 bg-[#141414] hover:bg-[#1A1A1A] border border-[#333] text-[#00FF41] hover:text-white text-xs rounded-sm transition-colors flex items-center space-x-1 font-bold"
                    >
                      <span>Inspect On-Chain</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
