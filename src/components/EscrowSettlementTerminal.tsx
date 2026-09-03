import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/apiService';
import { escrowTradingService, TRADEX_ESCROW_CONTRACT_ADDRESS } from '../services/escrowTradingService';
import { EscrowContractAbiCaller } from './escrow/EscrowContractAbiCaller';
import { useWallet } from '../context/WalletContext';
import { copyToClipboard as safeCopy } from '../utils/clipboard';
import { 
  EscrowContract, 
  EscrowContractType, 
  EscrowContractStatus, 
  OnChainSettlementLog 
} from '../types/dex';
import { 
  buildEscrowScript, 
  buildSettlementTxHex, 
  formatBsv, 
  formatSats, 
  generateBSVKeypair 
} from '../services/bsvCrypto';
import { 
  Terminal, 
  Play, 
  Pause, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Code, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  CheckCircle2,
  Lock,
  Unlock,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  AlertTriangle,
  FileText,
  PlusCircle,
  Coins,
  Shield,
  Zap,
  Filter,
  CheckSquare,
  Flame,
  ChevronRight,
  Scale,
  BadgePercent
} from 'lucide-react';

export const EscrowSettlementTerminal: React.FC = () => {
  const { account, isConnected, openWalletModal } = useWallet();

  // Active top navigation tab
  const [activeMainTab, setActiveMainTab] = useState<'contracts' | 'create' | 'inspector' | 'abi' | 'daemon'>('contracts');

  // Contracts list state
  const [contracts, setContracts] = useState<EscrowContract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('escrow-bsv-whale-902');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Creation form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<EscrowContractType>('CROSS_ASSET_ATOMIC');
  const [newDepositAsset, setNewDepositAsset] = useState('USDT');
  const [newDepositAmount, setNewDepositAmount] = useState('10000');
  const [newDepositNetwork, setNewDepositNetwork] = useState('Ethereum (ERC-20)');
  const [newTargetAsset, setNewTargetAsset] = useState('BSV');
  const [newTargetAmount, setNewTargetAmount] = useState('205');
  const [newTargetNetwork, setNewTargetNetwork] = useState('Bitcoin SV');
  const [newCounterparty, setNewCounterparty] = useState('1Hw5L7Ksm8vTq4vY2hK3xW6vYpX8sQ9aB1');
  const [newCounterpartyHandle, setNewCounterpartyHandle] = useState('$trader_taker');
  const [newInspectionHours, setNewInspectionHours] = useState(24);
  const [newTimelockBlocks, setNewTimelockBlocks] = useState(144);
  const [newTerms, setNewTerms] = useState('Mutual satisfaction release. Atomic dual-party settlement on ledger.');
  const [autoFundDeposit, setAutoFundDeposit] = useState(true);
  const [milestonesList, setMilestonesList] = useState([
    { title: 'Milestone 1: Prototype Deliverable & SPV Integration', percentage: 30, amount: 3000 },
    { title: 'Milestone 2: Testnet Deployment & Cross-Chain Bridge', percentage: 40, amount: 4000 },
    { title: 'Milestone 3: Final Security Audit & Mainnet Release', percentage: 30, amount: 3000 }
  ]);

  // Settlement Daemon state
  const [logs, setLogs] = useState<OnChainSettlementLog[]>([]);
  const [isWorkerRunning, setIsWorkerRunning] = useState<boolean>(true);
  const [workerLogs, setWorkerLogs] = useState<string[]>([
    `[${new Date().toISOString()}] BSV Settlement Worker daemon v2.4 initialized. Listening on P2P gossip mesh...`,
    `[${new Date().toISOString()}] Escrow Smart Contract monitor active. Connected to BSV Node Block #890414.`,
    `[${new Date().toISOString()}] Mempool fee rate verified: 0.50 sat/byte (Lowest on-chain execution cost).`
  ]);

  const [selectedTxHex, setSelectedTxHex] = useState<string>(
    '010000000188c9f7a932b50937b2f81e8f3e7c46928c19a34d20b88ca295c6728f0481e3597bc4d8000000006b483045022100e4b86c353995cb8872b7a90f845237b6058097b69c4c82b0e87d8a9e71cb4655022067d268d06b64d1f56b3e9a7e6717a61d154471c26b7bb7aa45bb38fce00392f501210287a9bc2451000000000180879509000000001976a9141b45kM8pQ2vRy6sW9aX3vYpX7bC1dE8fH488ac00000000'
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [explorerModalLog, setExplorerModalLog] = useState<OnChainSettlementLog | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Dispute modal
  const [disputeInput, setDisputeInput] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Subscribe to escrow service updates
  useEffect(() => {
    setContracts(escrowTradingService.getContracts());
    setLogs(apiService.getSettlementLogs());

    const unsub = escrowTradingService.subscribe(() => {
      setContracts(escrowTradingService.getContracts());
      setLogs(apiService.getSettlementLogs());
    });

    return unsub;
  }, []);

  // Worker live heart-beat simulation
  useEffect(() => {
    if (!isWorkerRunning) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toISOString();
      const events = [
        `[${timestamp}] Polling mempool for 2-of-2 Escrow script triggers... [0 pending disputes]`,
        `[${timestamp}] Validating OP_CHECKMULTISIG witness signatures against UTXO index... Status: OK`,
        `[${timestamp}] Heartbeat: BSV block height 890414. Mempool tx propagation delay: 180ms.`,
        `[${timestamp}] Verified SPV Merkle root inclusion for Escrow Settlement #${Math.floor(Math.random() * 800 + 890000)}.`
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setWorkerLogs(prev => [randomEvent, ...prev.slice(0, 40)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [isWorkerRunning]);

  // Selected contract object
  const selectedContract = useMemo(() => {
    return contracts.find(c => c.id === selectedContractId) || contracts[0];
  }, [contracts, selectedContractId]);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      if (filterType !== 'ALL' && c.type !== filterType) return false;
      if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchId = c.id.toLowerCase().includes(q);
        const matchAsset = c.depositAsset.toLowerCase().includes(q) || c.targetAsset.toLowerCase().includes(q);
        const matchCreator = c.creatorHandle?.toLowerCase().includes(q) || c.creatorAddress.toLowerCase().includes(q);
        const matchCounter = c.counterpartyHandle?.toLowerCase().includes(q) || c.counterpartyAddress.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchAsset && !matchCreator && !matchCounter) return false;
      }
      return true;
    });
  }, [contracts, filterType, filterStatus, searchQuery]);

  // Aggregate stats
  const totalVolumeLockedUsd = useMemo(() => {
    return contracts.reduce((acc, c) => {
      const isUsdDeposit = ['USDT', 'USDC'].includes(c.depositAsset);
      const isUsdTarget = ['USDT', 'USDC'].includes(c.targetAsset);
      if (isUsdDeposit) return acc + c.depositAmount;
      if (isUsdTarget) return acc + c.targetAmount;
      return acc + (c.depositAmount * 48.5);
    }, 0);
  }, [contracts]);

  const copyToClipboard = async (text: string, id: string) => {
    await safeCopy(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00FF41', '#00E5FF', '#FFFFFF', '#FFD700']
      });
    } catch {
      // ignore
    }
  };

  // Actions
  const handleFundPartyA = (id: string) => {
    try {
      escrowTradingService.fundPartyA(id);
      setActionSuccessMsg('Party A funds successfully deposited into smart escrow vault!');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleFundPartyB = (id: string) => {
    try {
      escrowTradingService.fundPartyB(id);
      setActionSuccessMsg('Party B counterparty deposit verified and locked in escrow!');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReleaseContract = (id: string) => {
    try {
      const res = escrowTradingService.releaseContract(id);
      triggerConfetti();
      setActionSuccessMsg(`Escrow contract released! Broadcasted on-chain TxID: ${res.txid.slice(0, 16)}...`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReleaseMilestone = (contractId: string, milestoneId: string) => {
    try {
      escrowTradingService.releaseMilestone(contractId, milestoneId);
      triggerConfetti();
      setActionSuccessMsg('Milestone tranche released to developer/counterparty on-chain!');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRefundContract = (id: string) => {
    try {
      escrowTradingService.refundContract(id, 'Timelock expiration reached without counterparty dispute');
      setActionSuccessMsg('Escrow funds refunded to depositor via CLTV timelock verification!');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleOpenDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeInput.trim()) return;
    try {
      escrowTradingService.openDispute(selectedContract.id, disputeInput.trim());
      setShowDisputeModal(false);
      setDisputeInput('');
      setActionSuccessMsg('Dispute opened. Tradex AI Oracle arbitrator engaged for on-chain telemetry review.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleResolveOracle = (favorMaker: boolean) => {
    try {
      escrowTradingService.resolveDisputeWithOracle(selectedContract.id, favorMaker);
      triggerConfetti();
      setActionSuccessMsg(`Dispute resolved by Tradex AI Oracle in favor of ${favorMaker ? 'Maker' : 'Buyer'}!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const depAmt = parseFloat(newDepositAmount);
    const tgtAmt = parseFloat(newTargetAmount);

    if (isNaN(depAmt) || depAmt <= 0 || isNaN(tgtAmt) || tgtAmt <= 0) {
      alert('Please specify valid deposit and target amounts.');
      return;
    }

    if (!newCounterparty.trim()) {
      alert('Please enter a counterparty address or generate sample keys.');
      return;
    }

    const created = escrowTradingService.createContract({
      title: newTitle.trim() || `${depAmt} ${newDepositAsset} ⇄ ${tgtAmt} ${newTargetAsset} Smart Escrow`,
      type: newType,
      creatorAddress: account?.address || '1TradexMakerPrimaryAddress98271',
      creatorHandle: account?.handle || '$my_escrow_desk',
      counterpartyAddress: newCounterparty.trim(),
      counterpartyHandle: newCounterpartyHandle.trim() || '$counterparty_desk',
      depositAsset: newDepositAsset,
      depositAmount: depAmt,
      depositNetwork: newDepositNetwork,
      targetAsset: newTargetAsset,
      targetAmount: tgtAmt,
      targetNetwork: newTargetNetwork,
      inspectionHours: newInspectionHours,
      timelockBlocks: newTimelockBlocks,
      terms: newTerms.trim(),
      milestones: newType === 'MILESTONE_TRANCHE' ? milestonesList : undefined,
      autoFundPartyA: autoFundDeposit
    });

    triggerConfetti();
    setSelectedContractId(created.id);
    setActiveMainTab('inspector');
    setActionSuccessMsg(`Smart Escrow Contract "${created.id}" compiled and deployed successfully!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleGenerateSampleCounterparty = () => {
    const kp = generateBSVKeypair();
    setNewCounterparty(kp.address);
    setNewCounterpartyHandle('$sample_whale_taker');
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 space-y-6 font-mono text-[#DDD]">
      
      {/* 1. TOP HEADER & METRICS BANNER */}
      <div className="rounded-xl bg-[#0A0A0A] border border-[#222] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#00FF41]/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#333] text-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.2)]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-white">
                  Escrow Contract Trading
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 uppercase tracking-widest">
                  2-of-2 & 2-of-3 Multisig
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 uppercase tracking-widest">
                  Non-Custodial CLTV
                </span>
              </div>
              <p className="text-xs text-[#888] mt-1.5 leading-relaxed max-w-3xl">
                Trade institutional OTC block deals, cross-asset atomic swaps, and milestone deliverables with cryptographic smart escrow contracts on Bitcoin SV and EVM multi-chains. Zero counterparty risk.
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-[#1C1C1C]">
                <span className="text-[10px] text-[#777] uppercase font-mono font-bold">Verified Escrow Contract:</span>
                <span className="text-xs font-mono font-bold text-[#00FF41] bg-[#00FF41]/10 px-2 py-0.5 rounded border border-[#00FF41]/30">
                  {TRADEX_ESCROW_CONTRACT_ADDRESS}
                </span>
                <button
                  onClick={async () => {
                    await safeCopy(TRADEX_ESCROW_CONTRACT_ADDRESS);
                    setCopiedId('hdr-contract');
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="text-[11px] text-[#888] hover:text-[#00FF41] flex items-center space-x-1 font-mono transition-colors min-h-[32px] px-2 py-1 rounded bg-[#151515] hover:bg-[#202020]"
                >
                  {copiedId === 'hdr-contract' ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'hdr-contract' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setActiveMainTab('abi')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono ml-2 transition-colors"
                >
                  Inspect ABI & Methods →
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setActiveMainTab('create')}
              className="px-4 py-2.5 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all flex items-center space-x-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Create Escrow Contract</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#1C1C1C]">
          <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
            <span className="text-[10px] text-[#666] uppercase font-bold block">Total Value Locked (TVL)</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              ${totalVolumeLockedUsd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
            <span className="text-[10px] text-[#666] uppercase font-bold block">Active Escrows</span>
            <span className="text-base sm:text-lg font-black text-[#00FF41] font-mono">
              {contracts.length} Contracts
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
            <span className="text-[10px] text-[#666] uppercase font-bold block">Settlement Latency</span>
            <span className="text-base sm:text-lg font-black text-cyan-400 font-mono">
              ~1.2 min (BSV UTXO)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
            <span className="text-[10px] text-[#666] uppercase font-bold block">Arbitration Oracle</span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
              Tradex AI 2-of-3
            </span>
          </div>
        </div>

        {/* SUCCESS NOTIFICATION TOAST */}
        {actionSuccessMsg && (
          <div className="p-3 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/50 text-[#00FF41] text-xs font-bold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center space-x-2 border-b border-[#222] pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveMainTab('contracts')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeMainTab === 'contracts'
              ? 'bg-[#00FF41] text-black shadow-sm font-black'
              : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>OTC Contracts Desk ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('create')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeMainTab === 'create'
              ? 'bg-[#00FF41] text-black shadow-sm font-black'
              : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>New Escrow Wizard</span>
        </button>

        <button
          onClick={() => setActiveMainTab('inspector')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeMainTab === 'inspector'
              ? 'bg-[#00FF41] text-black shadow-sm font-black'
              : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Contract Inspector & Execution Studio</span>
        </button>

        <button
          onClick={() => setActiveMainTab('abi')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeMainTab === 'abi'
              ? 'bg-[#00FF41] text-black shadow-sm font-black'
              : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>ABI & Methods (0x4deb...1cF2)</span>
        </button>

        <button
          onClick={() => setActiveMainTab('daemon')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeMainTab === 'daemon'
              ? 'bg-[#00FF41] text-black shadow-sm font-black'
              : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Settlement Worker Daemon</span>
        </button>
      </div>

      {/* 3. TAB 1: OTC CONTRACTS DESK */}
      {activeMainTab === 'contracts' && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS ROW */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 rounded-xl bg-[#0D0D0D] border border-[#222]">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contracts (USDT, BSV, A8, LMWR, txid, address)..."
                className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto no-scrollbar">
              <div className="flex items-center space-x-1.5 shrink-0 text-xs">
                <span className="text-[#666] text-[10px] uppercase font-bold">Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-[#141414] border border-[#2A2A2A] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="CROSS_ASSET_ATOMIC">Cross-Asset Atomic</option>
                  <option value="MILESTONE_TRANCHE">Milestone Tranches</option>
                  <option value="TIMELOCKED_SAFEGUARD">Timelocked CLTV</option>
                  <option value="MULTI_SIG_ORACLE">2-of-3 AI Oracle</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0 text-xs">
                <span className="text-[#666] text-[10px] uppercase font-bold">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#141414] border border-[#2A2A2A] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AWAITING_DEPOSIT">Awaiting Deposit</option>
                  <option value="PARTY_A_FUNDED">Party A Funded</option>
                  <option value="DUAL_FUNDED">Dual Funded</option>
                  <option value="IN_INSPECTION">In Inspection</option>
                  <option value="SETTLED">Settled / Released</option>
                  <option value="DISPUTED">Disputed</option>
                </select>
              </div>
            </div>
          </div>

          {/* CONTRACTS CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredContracts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-[#666] space-y-3 bg-[#0A0A0A] border border-[#222] rounded-xl">
                <ShieldCheck className="w-12 h-12 mx-auto text-[#444]" />
                <div className="text-white font-bold text-sm">No escrow contracts matching filter criteria</div>
                <button
                  onClick={() => { setFilterType('ALL'); setFilterStatus('ALL'); setSearchQuery(''); }}
                  className="text-xs text-[#00FF41] hover:underline font-bold"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredContracts.map((c) => {
                const isSettled = c.status === 'SETTLED';
                const isDisputed = c.status === 'DISPUTED';
                const isDualFunded = c.status === 'DUAL_FUNDED';

                return (
                  <div
                    key={c.id}
                    className="rounded-xl bg-[#0D0D0D] border border-[#242424] hover:border-[#383838] transition-all p-5 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Type Badge & Status */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1C1C1C]">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#161616] border border-[#333] text-[#AAA] uppercase tracking-wider">
                              {c.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-[#555]">#{c.id.slice(-8)}</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                            {c.title}
                          </h3>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          isSettled
                            ? 'bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40'
                            : isDisputed
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40'
                            : isDualFunded
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 animate-pulse'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                        }`}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Assets Trade Visualizer: Party A ⇄ Party B */}
                      <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-lg bg-[#121212] border border-[#1F1F1F]">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-[10px] text-[#777] uppercase font-bold">
                            <span>Depositor (Party A)</span>
                            {c.isPartyAFunded ? (
                              <CheckCircle2 className="w-3 h-3 text-[#00FF41]" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-400" />
                            )}
                          </div>
                          <div className="text-sm font-black text-white">
                            {c.depositAmount.toLocaleString()} <span className="text-[#00FF41]">{c.depositAsset}</span>
                          </div>
                          <div className="text-[10px] text-[#666] truncate">
                            {c.creatorHandle || c.creatorAddress.slice(0, 10) + '...'}
                          </div>
                        </div>

                        <div className="space-y-1 text-right">
                          <div className="flex items-center justify-end space-x-1 text-[10px] text-[#777] uppercase font-bold">
                            {c.isPartyBFunded ? (
                              <CheckCircle2 className="w-3 h-3 text-[#00FF41]" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-400" />
                            )}
                            <span>Target (Party B)</span>
                          </div>
                          <div className="text-sm font-black text-white">
                            {c.targetAmount.toLocaleString()} <span className="text-cyan-400">{c.targetAsset}</span>
                          </div>
                          <div className="text-[10px] text-[#666] truncate">
                            {c.counterpartyHandle || c.counterpartyAddress.slice(0, 10) + '...'}
                          </div>
                        </div>
                      </div>

                      {/* Terms snippet */}
                      <p className="text-[11px] text-[#888] mt-3 line-clamp-2 leading-relaxed">
                        {c.terms}
                      </p>

                      {/* Milestones bar if present */}
                      {c.milestones && c.milestones.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <div className="flex justify-between text-[10px] text-[#666] uppercase font-bold">
                            <span>Milestones Progress</span>
                            <span className="text-[#00FF41]">
                              {c.milestones.filter(m => m.status === 'RELEASED').length} / {c.milestones.length} Settled
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1C1C1C] rounded-full overflow-hidden flex">
                            {c.milestones.map((m) => (
                              <div
                                key={m.id}
                                style={{ width: `${m.percentage}%` }}
                                className={`h-full border-r border-[#0A0A0A] ${
                                  m.status === 'RELEASED'
                                    ? 'bg-[#00FF41]'
                                    : m.status === 'APPROVED'
                                    ? 'bg-amber-400'
                                    : 'bg-[#333]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-4 border-t border-[#1C1C1C] flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedContractId(c.id);
                          setActiveMainTab('inspector');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#1C1C1C] hover:bg-[#282828] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      >
                        <Code className="w-3.5 h-3.5 text-[#00FF41]" />
                        <span>Inspect & Execute</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        {!c.isPartyAFunded && (
                          <button
                            onClick={() => handleFundPartyA(c.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#00FF41] border border-[#00FF41]/40 text-xs font-bold"
                          >
                            Deposit A
                          </button>
                        )}

                        {!c.isPartyBFunded && (
                          <button
                            onClick={() => handleFundPartyB(c.id)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 text-xs font-bold"
                          >
                            Deposit B
                          </button>
                        )}

                        {c.isPartyAFunded && c.isPartyBFunded && c.status !== 'SETTLED' && (
                          <button
                            onClick={() => handleReleaseContract(c.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase"
                          >
                            Release Funds
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 2: NEW ESCROW CONTRACT WIZARD */}
      {activeMainTab === 'create' && (
        <form onSubmit={handleCreateContractSubmit} className="space-y-6">
          <div className="rounded-xl bg-[#0A0A0A] border border-[#222] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#222]">
              <div>
                <h2 className="text-lg font-black uppercase text-white flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-[#00FF41]" />
                  <span>Smart Escrow Contract Deployment Wizard</span>
                </h2>
                <p className="text-xs text-[#777] mt-1">
                  Configure multi-sig conditional releases, timelocks, and oracle safeguards on the immutable ledger.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateSampleCounterparty}
                className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-[#333] text-[11px] text-[#00FF41] font-bold flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sample Taker Keypair</span>
              </button>
            </div>

            {/* CONTRACT TYPE SELECTION */}
            <div className="space-y-2">
              <label className="text-[11px] text-[#888] uppercase font-bold block">
                Contract Architecture & Security Model:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    type: 'CROSS_ASSET_ATOMIC' as EscrowContractType,
                    title: 'Cross-Asset Atomic',
                    desc: 'Dual-party token swap (e.g. USDT ⇄ BSV / ETH). Releases when both sides deposit.'
                  },
                  {
                    type: 'MILESTONE_TRANCHE' as EscrowContractType,
                    title: 'Milestone Tranches',
                    desc: 'Staged releases for grants & dev deliverables with inspection approvals.'
                  },
                  {
                    type: 'TIMELOCKED_SAFEGUARD' as EscrowContractType,
                    title: 'CLTV Timelock Vault',
                    desc: 'Automatic unilateral refund if counterparty fails to fulfill within deadline.'
                  },
                  {
                    type: 'MULTI_SIG_ORACLE' as EscrowContractType,
                    title: '2-of-3 AI Oracle',
                    desc: 'Tradex Decentralized Oracle acts as third key in case of dispute.'
                  }
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setNewType(item.type)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      newType === item.type
                        ? 'bg-[#00FF41]/10 border-[#00FF41] text-white shadow-[0_0_15px_rgba(0,255,65,0.15)]'
                        : 'bg-[#111] border-[#222] text-[#888] hover:border-[#333] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      {newType === item.type && <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />}
                    </div>
                    <p className="text-[11px] text-[#777] mt-1.5 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* TITLE & DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-[#888] uppercase font-bold block mb-1.5">
                  Contract Deal Title:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Institutional OTC: 10,000 USDT ⇄ 205 BSV"
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#888] uppercase font-bold block mb-1.5">
                  Inspection / Review Window (Hours):
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={newInspectionHours}
                  onChange={(e) => setNewInspectionHours(parseInt(e.target.value) || 24)}
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>
            </div>

            {/* PARTY A (MAKER) DEPOSIT SPECS */}
            <div className="p-4 rounded-xl bg-[#111] border border-[#222] space-y-3">
              <span className="text-xs font-black uppercase text-[#00FF41] flex items-center space-x-1.5">
                <Coins className="w-4 h-4" />
                <span>Party A (Your Deposit / Principal)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#666] uppercase font-bold block mb-1">Asset Symbol:</label>
                  <select
                    value={newDepositAsset}
                    onChange={(e) => setNewDepositAsset(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="USDT">USDT (Tether)</option>
                    <option value="USDC">USDC (USD Coin)</option>
                    <option value="BSV">BSV (Bitcoin SV)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="SOL">SOL (Solana)</option>
                    <option value="A8">A8 (Ancient8 Gaming)</option>
                    <option value="LMWR">LMWR (LimeWire AI)</option>
                    <option value="RON">RON (Ronin)</option>
                    <option value="ORAH">ORAH (Tradex Native)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#666] uppercase font-bold block mb-1">Deposit Amount:</label>
                  <input
                    type="number"
                    step="any"
                    value={newDepositAmount}
                    onChange={(e) => setNewDepositAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#666] uppercase font-bold block mb-1">Settlement Network:</label>
                  <select
                    value={newDepositNetwork}
                    onChange={(e) => setNewDepositNetwork(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
                    <option value="Bitcoin SV">Bitcoin SV (1-Sat UTXO)</option>
                    <option value="Solana">Solana (High Speed)</option>
                    <option value="Ronin Katana">Ronin Katana Network</option>
                    <option value="Ancient8 L2">Ancient8 L2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PARTY B (TAKER) TARGET SPECS */}
            <div className="p-4 rounded-xl bg-[#111] border border-[#222] space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 flex items-center space-x-1.5">
                <Coins className="w-4 h-4" />
                <span>Party B (Counterparty Target Delivery)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#666] uppercase font-bold block mb-1">Target Asset Symbol:</label>
                  <select
                    value={newTargetAsset}
                    onChange={(e) => setNewTargetAsset(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="BSV">BSV (Bitcoin SV)</option>
                    <option value="USDT">USDT (Tether)</option>
                    <option value="USDC">USDC (USD Coin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="SOL">SOL (Solana)</option>
                    <option value="A8">A8 (Ancient8 Gaming)</option>
                    <option value="LMWR">LMWR (LimeWire AI)</option>
                    <option value="RON">RON (Ronin)</option>
                    <option value="ORAH">ORAH (Tradex Native)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#666] uppercase font-bold block mb-1">Target Amount:</label>
                  <input
                    type="number"
                    step="any"
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#666] uppercase font-bold block mb-1">Receiving Network:</label>
                  <select
                    value={newTargetNetwork}
                    onChange={(e) => setNewTargetNetwork(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="Bitcoin SV">Bitcoin SV (1-Sat UTXO)</option>
                    <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
                    <option value="Solana">Solana (High Speed)</option>
                    <option value="Ronin Katana">Ronin Katana Network</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] text-[#666] uppercase font-bold block mb-1">Counterparty Address:</label>
                  <input
                    type="text"
                    value={newCounterparty}
                    onChange={(e) => setNewCounterparty(e.target.value)}
                    placeholder="1Hw5L7Ksm8vTq4vY2hK3xW6vYpX8sQ9aB1 or 0x..."
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#666] uppercase font-bold block mb-1">Counterparty Tag/Handle:</label>
                  <input
                    type="text"
                    value={newCounterpartyHandle}
                    onChange={(e) => setNewCounterpartyHandle(e.target.value)}
                    placeholder="$counterparty_whale"
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
              </div>
            </div>

            {/* TERMS & AUTO-FUND CHECKBOX */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[#888] uppercase font-bold block mb-1.5">
                  Escrow Contract Terms & Release Conditions:
                </label>
                <textarea
                  rows={3}
                  value={newTerms}
                  onChange={(e) => setNewTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoFundDeposit}
                  onChange={(e) => setAutoFundDeposit(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00FF41] focus:ring-0 bg-[#141414] border-[#333]"
                />
                <span className="text-xs text-[#AAA]">
                  Immediately sign and lock initial Party A deposit ({newDepositAmount} {newDepositAsset}) into on-chain escrow upon deployment
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-[#222] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveMainTab('contracts')}
                className="px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] text-[#888] hover:text-white text-xs font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Deploy Smart Escrow Contract</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* 5. TAB 3: CONTRACT INSPECTOR & EXECUTION STUDIO */}
      {activeMainTab === 'inspector' && selectedContract && (
        <div className="space-y-6">
          {/* SELECTOR DROPDOWN ROW */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D0D0D] border border-[#222]">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-[#00FF41]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Active Contract:</span>
              <select
                value={selectedContract.id}
                onChange={(e) => setSelectedContractId(e.target.value)}
                className="bg-[#141414] border border-[#333] text-xs font-bold text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00FF41]"
              >
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
              selectedContract.status === 'SETTLED'
                ? 'bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40'
                : selectedContract.status === 'DISPUTED'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
            }`}>
              Status: {selectedContract.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* LIFECYCLE PROGRESS STEPPER */}
          <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#222] shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#888]">
              Cryptographic Execution Pipeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                {
                  step: '1',
                  title: 'Contract Created',
                  done: true,
                  desc: 'P2SH script compiled'
                },
                {
                  step: '2',
                  title: 'Party A Deposited',
                  done: selectedContract.isPartyAFunded,
                  desc: `${selectedContract.depositAmount} ${selectedContract.depositAsset}`
                },
                {
                  step: '3',
                  title: 'Party B Deposited',
                  done: selectedContract.isPartyBFunded,
                  desc: `${selectedContract.targetAmount} ${selectedContract.targetAsset}`
                },
                {
                  step: '4',
                  title: 'Released & Settled',
                  done: selectedContract.status === 'SETTLED',
                  desc: 'On-chain release signed'
                }
              ].map((st) => (
                <div
                  key={st.step}
                  className={`p-3.5 rounded-lg border flex flex-col justify-between ${
                    st.done
                      ? 'bg-[#00FF41]/10 border-[#00FF41]/50 text-white'
                      : 'bg-[#111] border-[#222] text-[#666]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      st.done ? 'bg-[#00FF41] text-black' : 'bg-[#222] text-[#888]'
                    }`}>
                      STEP {st.step}
                    </span>
                    {st.done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#555]" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold text-white">{st.title}</div>
                    <div className="text-[10px] text-[#777]">{st.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DUAL ACTION CONTROLS */}
          <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#222] shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#888]">
              Interactive Execution Controls
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {!selectedContract.isPartyAFunded && (
                <button
                  onClick={() => handleFundPartyA(selectedContract.id)}
                  className="px-4 py-2 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Deposit Party A ({selectedContract.depositAmount} {selectedContract.depositAsset})</span>
                </button>
              )}

              {!selectedContract.isPartyBFunded && (
                <button
                  onClick={() => handleFundPartyB(selectedContract.id)}
                  className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Deposit Party B ({selectedContract.targetAmount} {selectedContract.targetAsset})</span>
                </button>
              )}

              {selectedContract.status !== 'SETTLED' && selectedContract.isPartyAFunded && (
                <button
                  onClick={() => handleReleaseContract(selectedContract.id)}
                  className="px-5 py-2 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-[0_0_20px_rgba(0,255,65,0.4)]"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Release Escrow to Counterparty</span>
                </button>
              )}

              {selectedContract.status !== 'SETTLED' && (
                <button
                  onClick={() => handleRefundContract(selectedContract.id)}
                  className="px-4 py-2 rounded-lg bg-[#181818] hover:bg-[#242424] border border-[#333] text-[#AAA] hover:text-white font-bold text-xs flex items-center space-x-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trigger Timelock Refund</span>
                </button>
              )}

              {selectedContract.status !== 'DISPUTED' && selectedContract.status !== 'SETTLED' && (
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-400 font-bold text-xs flex items-center space-x-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Open Dispute / Oracle Intervention</span>
                </button>
              )}
            </div>

            {/* DISPUTE BANNER IF DISPUTED */}
            {selectedContract.status === 'DISPUTED' && (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/40 space-y-3">
                <div className="flex items-center space-x-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Contract Under Decentralized Arbitration</span>
                </div>
                <p className="text-xs text-[#DDD]">
                  Reason: {selectedContract.disputeReason || 'Unmet milestone delivery requirements or invalid preimage.'}
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <span className="text-[11px] text-[#888]">Tradex AI Arbiter Simulated Verdict:</span>
                  <button
                    onClick={() => handleResolveOracle(true)}
                    className="px-3 py-1 rounded bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#00FF41] border border-[#00FF41]/40 text-xs font-bold"
                  >
                    Resolve to Maker
                  </button>
                  <button
                    onClick={() => handleResolveOracle(false)}
                    className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold"
                  >
                    Refund to Buyer
                  </button>
                </div>
              </div>
            )}

            {/* ORACLE VERDICT IF AVAILABLE */}
            {selectedContract.oracleVerdict && (
              <div className="p-3.5 rounded-lg bg-[#111] border border-[#262626] text-xs text-[#AAA] space-y-1">
                <span className="text-[10px] text-[#00FF41] uppercase font-bold block">Tradex AI Oracle Resolution</span>
                <p>{selectedContract.oracleVerdict}</p>
              </div>
            )}
          </div>

          {/* MILESTONES MANAGEMENT TABLE */}
          {selectedContract.milestones && selectedContract.milestones.length > 0 && (
            <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#222] shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-[#00FF41]" />
                  <span>Milestone Tranche Execution</span>
                </h3>
                <span className="text-[11px] text-[#777]">
                  {selectedContract.milestones.length} Distinct Milestones
                </span>
              </div>

              <div className="space-y-2">
                {selectedContract.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-lg bg-[#111] border border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{m.title}</div>
                      <div className="text-[11px] text-[#777] mt-0.5">
                        Tranche: {m.percentage}% ({m.amount.toLocaleString()} {selectedContract.depositAsset})
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.status === 'RELEASED'
                          ? 'bg-[#00FF41]/15 text-[#00FF41]'
                          : m.status === 'APPROVED'
                          ? 'bg-cyan-500/15 text-cyan-400'
                          : 'bg-[#222] text-[#888]'
                      }`}>
                        {m.status}
                      </span>

                      {m.status !== 'RELEASED' && (
                        <button
                          onClick={() => handleReleaseMilestone(selectedContract.id, m.id)}
                          className="px-3 py-1 rounded bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase"
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

          {/* ON-CHAIN SCRIPT & BYTECODE VIEWER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4 p-6 rounded-xl bg-[#0A0A0A] border border-[#222] shadow-xl text-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#00FF41]" />
                <span>On-Chain ScriptPubKey & Multisig Witness</span>
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-[#777] uppercase font-bold">
                  <span>Script Specification (ASM):</span>
                  <button
                    onClick={() => copyToClipboard(selectedContract.scriptAsm, 'asm')}
                    className="text-[#00FF41] hover:underline flex items-center space-x-1"
                  >
                    {copiedId === 'asm' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy ASM</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-[#111] border border-[#222] text-[11px] text-[#00FF41] font-mono break-all leading-relaxed max-h-28 overflow-y-auto">
                  {selectedContract.scriptAsm}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">P2SH Escrow Vault Address</span>
                  <div className="text-white font-bold truncate mt-1">{selectedContract.escrowContractAddress}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">ScriptHash (20 Bytes)</span>
                  <div className="text-white font-bold truncate mt-1">{selectedContract.scriptHash}</div>
                </div>
              </div>
            </div>

            {/* RAW TRANSACTION HEX GENERATOR */}
            <div className="lg:col-span-5 space-y-4 p-6 rounded-xl bg-[#0A0A0A] border border-[#222] shadow-xl text-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Raw Settlement Tx Hex</span>
              </h3>

              <div className="p-3 rounded-lg bg-[#111] border border-[#222] text-[11px] text-[#777] font-mono break-all max-h-36 overflow-y-auto leading-relaxed">
                {selectedContract.settlementTxId || selectedTxHex}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#111] border border-[#222]">
                  <span className="text-[#666] text-[10px] uppercase font-bold block">Fee Rate:</span>
                  <span className="text-white font-bold">0.50 sat/byte</span>
                </div>
                <div className="p-2 rounded bg-[#111] border border-[#222]">
                  <span className="text-[#666] text-[10px] uppercase font-bold block">Miner Fee:</span>
                  <span className="text-[#00FF41] font-bold">{selectedContract.feeSats} sats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SMART CONTRACT ABI & DIRECT METHODS */}
      {activeMainTab === 'abi' && (
        <div className="space-y-6">
          <EscrowContractAbiCaller />
        </div>
      )}

      {/* 6. TAB 4: SETTLEMENT WORKER DAEMON */}
      {activeMainTab === 'daemon' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#0A0A0A] border border-[#222] shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-[#141414] border border-[#333] text-[#00FF41]">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white">Settlement Worker Daemon</h3>
                <p className="text-xs text-[#777]">Autonomous mempool listener validating 2-of-2 and 2-of-3 UTXO escrow scripts</p>
              </div>
            </div>

            <button
              onClick={() => setIsWorkerRunning(!isWorkerRunning)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center space-x-2 ${
                isWorkerRunning
                  ? 'bg-[#141414] text-[#00FF41] border border-[#00FF41]/50'
                  : 'bg-[#141414] text-[#777] hover:text-white border border-[#222]'
              }`}
            >
              {isWorkerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isWorkerRunning ? 'Pause Daemon' : 'Resume Daemon'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* TERMINAL CONSOLE */}
            <div className="lg:col-span-7 rounded-xl bg-[#050505] border border-[#2A2A2A] shadow-2xl overflow-hidden font-mono">
              <div className="p-3 bg-[#0D0D0D] border-b border-[#222] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41]"></span>
                  <span className="text-white font-bold ml-2 uppercase text-[10px] tracking-widest">settlementDaemon.ts</span>
                </div>
                <span className="text-[#666] text-[10px]">BSV Node RPC: 8332</span>
              </div>

              <div className="p-4 text-xs text-[#AAA] space-y-2 max-h-72 overflow-y-auto leading-relaxed">
                {workerLogs.map((line, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-[#00FF41] select-none font-bold">❯</span>
                    <span className={idx === 0 ? 'text-[#00FF41] font-bold' : 'text-[#888]'}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ON-CHAIN SETTLED LOGS */}
            <div className="lg:col-span-5 rounded-xl bg-[#0A0A0A] border border-[#222] p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#00FF41]" />
                <span>On-Chain Settlement Logbook</span>
              </h3>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-[#111] border border-[#222] hover:border-[#383838] transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="text-[#00FF41] font-bold">
                          {formatBsv(log.amountSats / 100000000)} BSV
                        </span>
                        <span className="text-[#444]">•</span>
                        <span className="text-[#888] text-[11px]">{log.scriptType}</span>
                      </div>
                      <div className="text-[10px] text-[#666] truncate max-w-[180px] mt-0.5">
                        {log.txid}
                      </div>
                    </div>

                    <button
                      onClick={() => setExplorerModalLog(log)}
                      className="px-2 py-1 rounded bg-[#00FF41]/10 hover:bg-[#00FF41]/20 text-[#00FF41] text-[10px] font-bold uppercase flex items-center space-x-1"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DISPUTE MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-[#0F0F0F] border border-[#333] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#222]">
              <h3 className="text-sm font-black uppercase text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Open Escrow Dispute</span>
              </h3>
              <button onClick={() => setShowDisputeModal(false)} className="text-[#777] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleOpenDispute} className="space-y-4 text-xs">
              <p className="text-[#AAA] leading-relaxed">
                Opening a dispute halts automatic release and invokes the 2-of-3 Tradex AI Decentralized Oracle for cryptographic verification.
              </p>

              <div>
                <label className="text-[10px] text-[#666] uppercase font-bold block mb-1">Reason for Dispute:</label>
                <textarea
                  required
                  rows={3}
                  value={disputeInput}
                  onChange={(e) => setDisputeInput(e.target.value)}
                  placeholder="e.g. Counterparty did not deliver correct ERC-20 tokens within 12 hours..."
                  className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1A1A1A] text-[#888] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. WHATONCHAIN BLOCK EXPLORER MODAL */}
      {explorerModalLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in font-mono">
          <div className="w-full max-w-2xl rounded-xl bg-[#0A0A0A] border border-[#333] p-6 sm:p-8 shadow-2xl space-y-4 text-[#E0E0E0] text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#333] text-[#00FF41] flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">WhatOnChain Explorer</h3>
                  <p className="text-xs text-[#777]">Block Height #{explorerModalLog.blockHeight}</p>
                </div>
              </div>
              <button onClick={() => setExplorerModalLog(null)} className="text-[#777] hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-[#111] border border-[#222] space-y-1">
                <span className="text-[10px] text-[#666] uppercase tracking-wider block font-bold">Transaction ID (TxID)</span>
                <div className="text-[#00FF41] font-bold break-all text-xs">
                  {explorerModalLog.txid}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">Total Output</span>
                  <span className="font-bold text-white">{formatBsv(explorerModalLog.amountSats / 100000000)} BSV</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">Fee (Sats)</span>
                  <span className="font-bold text-[#00FF41]">{explorerModalLog.feeSats} sats</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">Confirmations</span>
                  <span className="font-bold text-[#00FF41]">6+ Confs</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">Status</span>
                  <span className="font-bold text-[#00FF41] uppercase">On-Chain</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#111] border border-[#222] space-y-1">
                <span className="text-[10px] text-[#666] uppercase tracking-wider block font-bold">Script Specification</span>
                <div className="text-[#AAA] text-[11px]">
                  {explorerModalLog.scriptType} • 1 Input • 1 Output • Standard Non-SegWit (BSV Genesis rules)
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExplorerModalLog(null)}
                className="px-5 py-2 rounded-lg bg-white hover:bg-[#DDD] text-black font-black uppercase text-xs tracking-wider"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
