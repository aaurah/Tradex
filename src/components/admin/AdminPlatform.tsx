import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ArrowLeftRight, 
  BarChart3, 
  DollarSign, 
  Cpu, 
  Copy, 
  Zap, 
  TrendingUp, 
  Link2, 
  Check, 
  Plus, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Shield,
  Layers,
  Power,
  Edit2,
  ExternalLink,
  Download,
  Filter,
  Eye,
  Activity,
  Play,
  Pause,
  Percent,
  Calculator
} from 'lucide-react';
import confetti from '../../utils/confetti';
import { adminSettingsStore, AdminTradePair, PredictionMarketItem, CopyVaultStrategy } from '../../services/adminSettingsStore';
import { copyToClipboard } from '../../utils/clipboard';

export const AdminPlatform: React.FC<{ activeSubtab: string }> = ({ activeSubtab }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = adminSettingsStore.subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const store = adminSettingsStore.data;

  // Local state for fee config
  const [makerFee, setMakerFee] = useState(store.fees.makerFee);
  const [takerFee, setTakerFee] = useState(store.fees.takerFee);
  const [minerSatPerByte, setMinerSatPerByte] = useState(store.fees.minerSatPerByte);
  const [orahDiscountPercent, setOrahDiscountPercent] = useState(store.fees.orahDiscountPercent);
  const [referralRebate, setReferralRebate] = useState(store.fees.referralRebate);
  const [liquidationFee, setLiquidationFee] = useState(store.fees.liquidationFee);
  const [feeSaveSuccess, setFeeSaveSuccess] = useState(false);

  // Fee calculator test state
  const [calcTradeAmount, setCalcTradeAmount] = useState('10');
  const [calcIsOrahStaker, setCalcIsOrahStaker] = useState(true);

  // Trade Pairs state
  const [pairFilter, setPairFilter] = useState<'ALL' | 'Spot' | 'Perpetual'>('ALL');
  const [newPairSymbol, setNewPairSymbol] = useState('');
  const [newPairType, setNewPairType] = useState<'Spot' | 'Perpetual'>('Spot');
  const [newPairMinOrder, setNewPairMinOrder] = useState('0.1');
  const [newPairTick, setNewPairTick] = useState('0.01');
  const [newPairLeverage, setNewPairLeverage] = useState('20x');
  const [showAddPairModal, setShowAddPairModal] = useState(false);

  // Prediction Markets
  const [newPredTitle, setNewPredTitle] = useState('');
  const [newPredCategory, setNewPredCategory] = useState('Crypto');
  const [newPredExpiry, setNewPredExpiry] = useState('2026-10-31');
  const [newPredInitialPool, setNewPredInitialPool] = useState('5000');
  const [predFilter, setPredFilter] = useState<'ALL' | 'Open' | 'Resolved'>('ALL');
  const [predNotice, setPredNotice] = useState<string | null>(null);

  // CopyVault
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultTrader, setNewVaultTrader] = useState('');
  const [newVaultFee, setNewVaultFee] = useState('15');
  const [newVaultMaxAum, setNewVaultMaxAum] = useState('$500,000');
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultNotice, setVaultNotice] = useState<string | null>(null);

  // CEX State
  const [cexTesting, setCexTesting] = useState<string | null>(null);
  const [cexNotice, setCexNotice] = useState<string | null>(null);
  const [arbSpread, setArbSpread] = useState(store.cex.arbitrageSpreadTrigger);

  // Contracts
  const [newContractChain, setNewContractChain] = useState('Bitcoin SV');
  const [newContractTitle, setNewContractTitle] = useState('');
  const [newContractAddress, setNewContractAddress] = useState('');
  const [contractsList, setContractsList] = useState([
    { id: '1', chain: 'Bitcoin SV', title: 'Tradex Overlay Settlement Channel', address: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', status: 'Mainnet Verified' },
    { id: '2', chain: 'Ethereum / Base L2', title: 'Tradex Smart Escrow Trading & Settlement Contract', address: '0x4deb6023abD9E1C640aDa35201be8ff591d21cF2', status: 'Audited & Active' },
    { id: '3', chain: 'Base (Ethereum L2)', title: 'Tradex Router & Liquidity Pool', address: '0x49c9569B137b6057a685e828C50C37937F5560bC', status: 'Audited' },
    { id: '4', chain: 'Solana', title: 'Tradex Sovereign Program ID', address: 'TRADEX111111111111111111111111111111111111', status: 'Active' },
    { id: '5', chain: 'BSV Token', title: '$ORAH Governance Overlay Token', address: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: '21M Cap' },
    { id: '6', chain: 'BSV Token', title: '$AURA Autonomous Intelligence Token', address: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', status: '100M Cap' },
  ]);

  // TradingView Feed config
  const [tvCandleInterval, setTvCandleInterval] = useState('15m');
  const [tvVolumeProfile, setTvVolumeProfile] = useState(true);
  const [tvIndicators, setTvIndicators] = useState(true);
  const [tvNotice, setTvNotice] = useState(false);

  // Save Fees handler
  const handleSaveFees = (e: React.FormEvent) => {
    e.preventDefault();
    store.fees.makerFee = makerFee;
    store.fees.takerFee = takerFee;
    store.fees.minerSatPerByte = minerSatPerByte;
    store.fees.orahDiscountPercent = orahDiscountPercent;
    store.fees.referralRebate = referralRebate;
    store.fees.liquidationFee = liquidationFee;
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'FEES', `Updated fees: Maker ${makerFee}%, Taker ${takerFee}%, Miner ${minerSatPerByte} sat/byte`);

    setFeeSaveSuccess(true);
    confetti({ particleCount: 35, spread: 50 });
    setTimeout(() => setFeeSaveSuccess(false), 3000);
  };

  // Add pair handler
  const handleAddPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPairSymbol.trim()) return;

    const newPair: AdminTradePair = {
      id: 'pair-' + Date.now(),
      symbol: newPairSymbol.toUpperCase().trim(),
      type: newPairType,
      status: 'Active',
      minOrder: `${newPairMinOrder} ${newPairSymbol.split('/')[0] || 'UNITS'}`,
      tickSize: newPairTick,
      maxLeverage: newPairType === 'Perpetual' ? newPairLeverage : undefined,
      volume24h: '$0.00',
      change24h: '0.00%'
    };

    store.pairs.unshift(newPair);
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'MARKETS', `Added new trading pair ${newPair.symbol} (${newPair.type})`);

    setNewPairSymbol('');
    setShowAddPairModal(false);
    confetti({ particleCount: 40, spread: 45 });
  };

  // Toggle pair status
  const handleTogglePairStatus = (pairId: string) => {
    const pair = store.pairs.find(p => p.id === pairId);
    if (!pair) return;
    pair.status = pair.status === 'Active' ? 'Paused' : 'Active';
    adminSettingsStore.save();
    adminSettingsStore.addLog('INFO', 'MARKETS', `Pair ${pair.symbol} status changed to ${pair.status}`);
  };

  // Delete pair
  const handleDeletePair = (pairId: string) => {
    const pair = store.pairs.find(p => p.id === pairId);
    store.pairs = store.pairs.filter(p => p.id !== pairId);
    adminSettingsStore.save();
    if (pair) {
      adminSettingsStore.addLog('WARN', 'MARKETS', `Deleted trading pair ${pair.symbol}`);
    }
  };

  // Create prediction market
  const handleCreatePrediction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPredTitle.trim()) return;

    const initialP = parseFloat(newPredInitialPool) || 1000;
    const newMarket: PredictionMarketItem = {
      id: 'pred-' + Date.now(),
      title: newPredTitle.trim(),
      category: newPredCategory,
      expiry: newPredExpiry,
      yesPool: Math.round(initialP * 0.55),
      noPool: Math.round(initialP * 0.45),
      status: 'Open',
      totalVolume: `$${initialP.toLocaleString()}`
    };

    store.predictions.unshift(newMarket);
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'PREDICTIONS', `Created prediction market: "${newMarket.title}"`);

    setNewPredTitle('');
    setPredNotice(`Prediction market successfully created and broadcast to BSV oracles!`);
    confetti({ particleCount: 35 });
    setTimeout(() => setPredNotice(null), 3500);
  };

  // Resolve prediction market
  const handleResolvePrediction = (id: string, outcome: 'Resolved_Yes' | 'Resolved_No' | 'Void') => {
    const m = store.predictions.find(p => p.id === id);
    if (!m) return;
    m.status = outcome;
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'PREDICTIONS', `Resolved market "${m.title}" with outcome ${outcome}. Payouts dispatched.`);
    setPredNotice(`Market "${m.title}" resolved as ${outcome.replace('Resolved_', '')}. Smart contract payouts processed!`);
    confetti({ particleCount: 40 });
    setTimeout(() => setPredNotice(null), 3500);
  };

  // Create CopyVault
  const handleCreateVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultName.trim()) return;

    const newVault: CopyVaultStrategy = {
      id: 'v-' + Date.now(),
      name: newVaultName.trim(),
      trader: newVaultTrader.trim() || 'Super Admin Algo',
      performanceFee: parseInt(newVaultFee, 10) || 15,
      aum: '$25,000',
      maxAum: newVaultMaxAum || '$500,000',
      pnl30d: '+12.5%',
      copiers: 1,
      riskLevel: 'Medium',
      status: 'Active'
    };

    store.vaults.unshift(newVault);
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'COPYVAULT', `Created new CopyVault strategy: ${newVault.name}`);

    setNewVaultName('');
    setNewVaultTrader('');
    setShowVaultModal(false);
    setVaultNotice(`New strategy vault deployed! Smart contract escrow initialized.`);
    confetti({ particleCount: 35 });
    setTimeout(() => setVaultNotice(null), 3000);
  };

  // Toggle CopyVault status
  const handleToggleVault = (id: string) => {
    const v = store.vaults.find(item => item.id === id);
    if (!v) return;
    v.status = v.status === 'Active' ? 'Paused' : 'Active';
    adminSettingsStore.save();
    adminSettingsStore.addLog('INFO', 'COPYVAULT', `Strategy vault ${v.name} status: ${v.status}`);
  };

  // Test CEX ping
  const handleTestCexPing = (exchange: string) => {
    setCexTesting(exchange);
    setTimeout(() => {
      setCexTesting(null);
      const ping = Math.floor(Math.random() * 15 + 12);
      if (exchange === 'Binance') store.cex.binanceLatency = `${ping}ms`;
      if (exchange === 'Bybit') store.cex.bybitLatency = `${ping}ms`;
      if (exchange === 'OKX') store.cex.okxLatency = `${ping}ms`;
      adminSettingsStore.save();
      setCexNotice(`✓ ${exchange} REST & WebSocket API responding normally (${ping}ms ping)`);
      setTimeout(() => setCexNotice(null), 3000);
    }, 600);
  };

  // Add custom contract
  const handleAddContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractTitle.trim() || !newContractAddress.trim()) return;

    setContractsList(prev => [
      ...prev,
      {
        id: String(Date.now()),
        chain: newContractChain,
        title: newContractTitle.trim(),
        address: newContractAddress.trim(),
        status: 'Active'
      }
    ]);

    adminSettingsStore.addLog('SUCCESS', 'CONTRACTS', `Registered on-chain address for ${newContractTitle}`);
    setNewContractTitle('');
    setNewContractAddress('');
    confetti({ particleCount: 25 });
  };

  // Export Analytics CSV
  const handleExportCsv = () => {
    const rows = [
      ['Pair', 'Type', 'Status', '24H Volume', '24H Change', 'Min Order', 'Tick Size'],
      ...store.pairs.map(p => [p.symbol, p.type, p.status, p.volume24h, p.change24h, p.minOrder, p.tickSize])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradex_market_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    adminSettingsStore.addLog('INFO', 'ANALYTICS', 'Exported market analytics CSV');
  };

  return (
    <div className="space-y-6">
      
      {/* ================= 1. FEATURE FLAGS ================= */}
      {activeSubtab === 'feature_flags' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">Platform Feature Flags</h2>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  {Object.values(store.flags).filter(Boolean).length} ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#777] font-mono mt-0.5">Master circuit breakers and autonomous execution governors.</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  Object.keys(store.flags).forEach((k) => {
                    (store.flags as any)[k] = true;
                  });
                  adminSettingsStore.save();
                  confetti({ particleCount: 30 });
                }}
                className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-[#282828] text-white text-xs font-mono font-bold transition-all"
              >
                Enable All
              </button>
              <button
                onClick={() => {
                  adminSettingsStore.toggleFlag('maintenanceMode');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  store.flags.maintenanceMode 
                    ? 'bg-red-600 text-white border-red-500 animate-pulse' 
                    : 'bg-[#141414] text-red-400 hover:bg-red-950/30 border-red-500/30'
                }`}
              >
                {store.flags.maintenanceMode ? '🚨 MAINTENANCE ACTIVE' : 'Toggle Maintenance Mode'}
              </button>
            </div>
          </div>

          {store.flags.maintenanceMode && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs font-mono flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <strong>Emergency Maintenance Mode is currently ENGAGED:</strong> Public trades and order submissions are temporarily halted. Administrators retain unrestricted access.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.entries(store.flags).map(([key, enabled]) => (
              <div
                key={key}
                onClick={() => adminSettingsStore.toggleFlag(key as any)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  enabled 
                    ? 'bg-[#0E150F] border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.05)]' 
                    : 'bg-[#121212] border-[#222222] opacity-75'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white capitalize flex items-center space-x-2">
                    <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {key === 'maintenanceMode' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        KILL SWITCH
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#777] mt-0.5">
                    {enabled ? 'Module active & routing transactions' : 'Disabled for all traders'}
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                    enabled ? 'bg-[#00FF41]' : 'bg-[#2A2A2A]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 2. TRADE PAIRS ================= */}
      {activeSubtab === 'trade_pairs' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Trade Pairs & Markets</h2>
              <p className="text-xs text-[#777] font-mono">Manage active spot pairs, perpetual contracts, tick sizes, and leverage.</p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Type Filter */}
              <div className="flex items-center space-x-1 bg-[#141414] p-1 rounded-xl border border-[#222] text-xs font-mono">
                {(['ALL', 'Spot', 'Perpetual'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setPairFilter(f)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      pairFilter === f ? 'bg-[#00FF41] text-black shadow-sm' : 'text-[#777] hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddPairModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-bold text-xs font-mono flex items-center space-x-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pair</span>
              </button>
            </div>
          </div>

          {/* Add Pair Modal */}
          {showAddPairModal && (
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#00FF41]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-[#00FF41]" />
                  <span>Configure New Trading Market</span>
                </h3>
                <button onClick={() => setShowAddPairModal(false)} className="text-[#888] hover:text-white text-xs font-mono">✕ Cancel</button>
              </div>

              <form onSubmit={handleAddPair} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                <div>
                  <label className="block text-[#777] mb-1">Pair Symbol</label>
                  <input
                    type="text"
                    required
                    value={newPairSymbol}
                    onChange={(e) => setNewPairSymbol(e.target.value)}
                    placeholder="e.g. SATS/USDT"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Market Type</label>
                  <select
                    value={newPairType}
                    onChange={(e) => setNewPairType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white focus:outline-none"
                  >
                    <option value="Spot">Spot Market</option>
                    <option value="Perpetual">Perpetual Futures</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Min Order Size</label>
                  <input
                    type="text"
                    value={newPairMinOrder}
                    onChange={(e) => setNewPairMinOrder(e.target.value)}
                    placeholder="0.1"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Tick Size (Decimals)</label>
                  <input
                    type="text"
                    value={newPairTick}
                    onChange={(e) => setNewPairTick(e.target.value)}
                    placeholder="0.01"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>

                {newPairType === 'Perpetual' && (
                  <div className="sm:col-span-2">
                    <label className="block text-[#777] mb-1">Max Perpetual Leverage</label>
                    <select
                      value={newPairLeverage}
                      onChange={(e) => setNewPairLeverage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white focus:outline-none"
                    >
                      <option value="10x">10x Max Leverage</option>
                      <option value="20x">20x Max Leverage</option>
                      <option value="50x">50x Max Leverage</option>
                      <option value="100x">100x High-Risk Leverage</option>
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2 lg:col-span-4 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider"
                  >
                    Deploy Market to Matching Engine
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1E1E1E] bg-[#0D0D0D]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141414] text-[#777] border-b border-[#1E1E1E] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Pair Symbol</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">24h Volume</th>
                  <th className="p-3">Min Order</th>
                  <th className="p-3">Tick / Lev</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {store.pairs
                  .filter(p => pairFilter === 'ALL' || p.type === pairFilter)
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-[#121212] transition-colors">
                      <td className="p-3 font-bold text-white flex items-center space-x-2">
                        <span>{p.symbol}</span>
                        <span className={`text-[10px] ${p.change24h.startsWith('+') ? 'text-[#00FF41]' : 'text-red-400'}`}>
                          {p.change24h}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          p.type === 'Spot' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`flex items-center space-x-1 ${p.status === 'Active' ? 'text-[#00FF41]' : 'text-yellow-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-[#00FF41]' : 'bg-yellow-400'}`}></span>
                          <span>{p.status}</span>
                        </span>
                      </td>
                      <td className="p-3 text-white font-bold">{p.volume24h}</td>
                      <td className="p-3 text-[#999]">{p.minOrder}</td>
                      <td className="p-3 text-[#999]">
                        {p.maxLeverage ? `${p.tickSize} / ${p.maxLeverage}` : p.tickSize}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleTogglePairStatus(p.id)}
                            className={`p-1.5 rounded border transition-colors ${
                              p.status === 'Active' 
                                ? 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10' 
                                : 'border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/10'
                            }`}
                            title={p.status === 'Active' ? 'Pause Trading' : 'Resume Trading'}
                          >
                            {p.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeletePair(p.id)}
                            className="p-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove pair"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 3. TRADE ANALYTICS ================= */}
      {activeSubtab === 'trade_analytics' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Trading & Liquidity Analytics</h2>
              <p className="text-xs text-[#777]">Deep volume distribution, order book depth velocity, and maker/taker analytics.</p>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#2E2E2E] text-white text-xs flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4 text-[#00FF41]" />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">30D TOTAL VOLUME</div>
              <div className="text-2xl font-black text-white">$418,290,400</div>
              <div className="text-[11px] text-[#00FF41]">+39.2% vs prior month</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">MAKER / TAKER RATIO</div>
              <div className="text-2xl font-black text-white">58% / 42%</div>
              <div className="text-[11px] text-[#888]">Deep resting liquidity</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">AVERAGE SLIPPAGE</div>
              <div className="text-2xl font-black text-[#00FF41]">0.018%</div>
              <div className="text-[11px] text-[#888]">Under $50k order size</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">UNIQUE TRADERS (30D)</div>
              <div className="text-2xl font-black text-white">14,291 Wallets</div>
              <div className="text-[11px] text-[#00FF41]">84% return trader rate</div>
            </div>
          </div>

          {/* Volume by pair breakdown */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase">Market Share Volume Breakdown</h3>
            <div className="space-y-3">
              {[
                { pair: 'BSV-PERP', vol: '$8,140,200', pct: 42, color: 'bg-[#00FF41]' },
                { pair: 'BSV/USDT', vol: '$6,420,910', pct: 33, color: 'bg-cyan-400' },
                { pair: 'AURA/USDT', vol: '$2,410,500', pct: 13, color: 'bg-purple-400' },
                { pair: 'ORAH/USDT', vol: '$1,290,400', pct: 7, color: 'bg-yellow-400' },
                { pair: 'Others', vol: '$1,140,200', pct: 5, color: 'bg-[#666]' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white font-bold">{item.pair}</span>
                    <span className="text-[#AAA]">{item.vol} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#181818] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. FEE CONFIG & CALCULATOR ================= */}
      {activeSubtab === 'fee_config' && (
        <form onSubmit={handleSaveFees} className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Fee Configuration & Staker Tiers</h2>
              <p className="text-xs text-[#777] font-mono">Configure trading fees, BSV miner rates, and $ORAH staking discounts.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs font-mono uppercase tracking-wider shadow-md"
            >
              Save Fee Config
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">Maker Fee Rate (%)</label>
              <input
                type="text"
                value={makerFee}
                onChange={(e) => setMakerFee(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666]">Applies to passive limit orders adding depth.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">Taker Fee Rate (%)</label>
              <input
                type="text"
                value={takerFee}
                onChange={(e) => setTakerFee(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666]">Applies to aggressive market orders taking liquidity.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">BSV Miner Rate (Sat/Byte)</label>
              <input
                type="text"
                value={minerSatPerByte}
                onChange={(e) => setMinerSatPerByte(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666]">On-chain broadcast rate for zero-gas relayer.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">$ORAH Staker Max Rebate (%)</label>
              <input
                type="text"
                value={orahDiscountPercent}
                onChange={(e) => setOrahDiscountPercent(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666]">Discount for traders staking ≥1,000 $ORAH.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">Referral Commission (%)</label>
              <input
                type="text"
                value={referralRebate}
                onChange={(e) => setReferralRebate(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666]">Rebate shared with affiliate referrer.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">Perp Liquidation Penalty (%)</label>
              <input
                type="text"
                value={liquidationFee}
                onChange={(e) => setLiquidationFee(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666]">Fee sent to insurance treasury pool upon liquidation.</p>
            </div>

          </div>

          {/* Interactive Fee Preview Simulator */}
          <div className="p-5 rounded-2xl bg-[#0A0E0B] border border-[#00FF41]/30 font-mono text-xs space-y-3">
            <div className="flex items-center space-x-2 text-[#00FF41] font-bold">
              <Calculator className="w-4 h-4" />
              <span>Live Fee Execution Simulation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[#888] block mb-1">Simulated BSV Order Size</label>
                <input
                  type="text"
                  value={calcTradeAmount}
                  onChange={(e) => setCalcTradeAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="stakerCheck"
                  checked={calcIsOrahStaker}
                  onChange={(e) => setCalcIsOrahStaker(e.target.checked)}
                  className="accent-[#00FF41]"
                />
                <label htmlFor="stakerCheck" className="text-white">Apply $ORAH Staker 50% Rebate</label>
              </div>

              <div className="p-3 rounded-lg bg-[#121212] border border-[#222]">
                <div className="text-[#777] text-[10px]">ESTIMATED FEE (TAKER)</div>
                {(() => {
                  const bsvAmt = parseFloat(calcTradeAmount) || 0;
                  const bsvPrice = 48.60;
                  const notional = bsvAmt * bsvPrice;
                  let feePct = parseFloat(takerFee) || 0.03;
                  if (calcIsOrahStaker) feePct = feePct * (1 - (parseFloat(orahDiscountPercent) || 50) / 100);
                  const feeUsd = (notional * feePct) / 100;
                  return (
                    <div className="text-white font-bold text-sm mt-0.5">
                      ${feeUsd.toFixed(4)} USD <span className="text-[10px] text-[#00FF41]">({feePct.toFixed(3)}%)</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {feeSaveSuccess && (
            <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Fee schedule successfully updated and synced across all matching nodes!</span>
            </div>
          )}
        </form>
      )}

      {/* ================= 5. CONTRACTS & COINS ================= */}
      {activeSubtab === 'contracts_coins' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Smart Contracts & Deployed Tokens</h2>
              <p className="text-xs text-[#777]">Multi-chain addresses across Bitcoin SV, Base, and Solana.</p>
            </div>
          </div>

          {/* Add Contract Form */}
          <form onSubmit={handleAddContract} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
            <div className="text-sm font-bold text-white uppercase">Register New Token or Channel Contract</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#777] mb-1">Blockchain Network</label>
                <select
                  value={newContractChain}
                  onChange={(e) => setNewContractChain(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                >
                  <option value="Bitcoin SV">Bitcoin SV (BSV)</option>
                  <option value="Base (Ethereum L2)">Base (Ethereum L2)</option>
                  <option value="Solana">Solana</option>
                  <option value="BSV Overlay Token">BSV Overlay Token</option>
                </select>
              </div>

              <div>
                <label className="block text-[#777] mb-1">Contract / Token Title</label>
                <input
                  type="text"
                  required
                  value={newContractTitle}
                  onChange={(e) => setNewContractTitle(e.target.value)}
                  placeholder="e.g. Wrapped BSV Bridge Pool"
                  className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="block text-[#777] mb-1">On-Chain Address or ID</label>
                <input
                  type="text"
                  required
                  value={newContractAddress}
                  onChange={(e) => setNewContractAddress(e.target.value)}
                  placeholder="e.g. 1P5Z... or 0x..."
                  className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider"
            >
              Add Contract Address
            </button>
          </form>

          {/* List of Contracts */}
          <div className="space-y-3">
            {contractsList.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00FF41] font-bold">[{c.chain}]</span>
                    <span className="text-white font-bold">{c.title}</span>
                  </div>
                  <div className="text-[11px] text-[#777] truncate mt-1 max-w-xl font-mono">{c.address}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                    {c.status}
                  </span>
                  <button
                    onClick={async () => {
                      await copyToClipboard(c.address);
                      confetti({ particleCount: 15 });
                    }}
                    className="p-1.5 rounded bg-[#181818] hover:bg-[#252525] border border-[#2A2A2A] text-[#AAA] hover:text-white"
                    title="Copy Address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 6. COPYVAULT STRATEGIES ================= */}
      {activeSubtab === 'copy_vault' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">CopyVault Autonomous Strategies</h2>
              <p className="text-xs text-[#777]">Manage social copy-trading vaults, trader profit splits, and smart escrow pools.</p>
            </div>

            <button
              onClick={() => setShowVaultModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-bold flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Strategy Vault</span>
            </button>
          </div>

          {vaultNotice && (
            <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{vaultNotice}</span>
            </div>
          )}

          {/* Create Vault Modal */}
          {showVaultModal && (
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#00FF41]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-[#00FF41]" />
                  <span>Deploy New CopyVault Strategy</span>
                </h3>
                <button onClick={() => setShowVaultModal(false)} className="text-[#888] hover:text-white">✕ Cancel</button>
              </div>

              <form onSubmit={handleCreateVault} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#777] mb-1">Strategy Name</label>
                  <input
                    type="text"
                    required
                    value={newVaultName}
                    onChange={(e) => setNewVaultName(e.target.value)}
                    placeholder="e.g. BSV High-Frequency Scalper"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Lead Quant / Trader</label>
                  <input
                    type="text"
                    value={newVaultTrader}
                    onChange={(e) => setNewVaultTrader(e.target.value)}
                    placeholder="aurashampy"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Performance Fee (%)</label>
                  <input
                    type="number"
                    value={newVaultFee}
                    onChange={(e) => setNewVaultFee(e.target.value)}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Max Cap AUM</label>
                  <input
                    type="text"
                    value={newVaultMaxAum}
                    onChange={(e) => setNewVaultMaxAum(e.target.value)}
                    placeholder="$1,000,000"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider"
                  >
                    Deploy Strategy to Public Directory
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Vault Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {store.vaults.map((v) => (
              <div key={v.id} className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{v.name}</h3>
                    <div className="text-[10px] text-[#777] mt-0.5">by {v.trader}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    v.status === 'Active' ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {v.status}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#1C1C1C]">
                  <div className="flex justify-between">
                    <span className="text-[#888]">30D Yield (PnL):</span>
                    <span className="text-[#00FF41] font-bold">{v.pnl30d}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Current AUM:</span>
                    <span className="text-white font-bold">{v.aum} / {v.maxAum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Active Copiers:</span>
                    <span className="text-white">{v.copiers} traders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Performance Fee:</span>
                    <span className="text-white">{v.performanceFee}%</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleVault(v.id)}
                    className="flex-1 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold transition-colors text-center"
                  >
                    {v.status === 'Active' ? 'Pause Vault' : 'Resume Vault'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 7. PREDICTION MARKETS ================= */}
      {activeSubtab === 'prediction' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Prediction Markets Admin</h2>
              <p className="text-xs text-[#777]">Deploy binary outcome markets and settle winning oracle outcomes.</p>
            </div>

            <div className="flex items-center space-x-1 bg-[#141414] p-1 rounded-xl border border-[#222]">
              {(['ALL', 'Open', 'Resolved'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setPredFilter(f)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    predFilter === f ? 'bg-[#00FF41] text-black shadow-sm' : 'text-[#777] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {predNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{predNotice}</span>
            </div>
          )}

          {/* Create Market Form */}
          <form onSubmit={handleCreatePrediction} className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#00FF41]" />
              <span>Deploy New Binary Prediction Market</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block uppercase text-[#777] mb-1">Market Question / Proposition</label>
                <input
                  type="text"
                  required
                  value={newPredTitle}
                  onChange={(e) => setNewPredTitle(e.target.value)}
                  placeholder="e.g. Will BSV reach $100 before end of Q4?"
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block uppercase text-[#777] mb-1">Category</label>
                  <select
                    value={newPredCategory}
                    onChange={(e) => setNewPredCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  >
                    <option value="Crypto">Crypto Assets</option>
                    <option value="Tradex">Tradex Volume</option>
                    <option value="BSV Infra">BSV Infrastructure</option>
                    <option value="Macro">Macro Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-[#777] mb-1">Resolution Date</label>
                  <input
                    type="date"
                    value={newPredExpiry}
                    onChange={(e) => setNewPredExpiry(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[#777] mb-1">Initial Seed Liquidity ($)</label>
                  <input
                    type="number"
                    value={newPredInitialPool}
                    onChange={(e) => setNewPredInitialPool(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider shadow-md"
              >
                Broadcast Market to BSV Blockchain
              </button>
            </div>
          </form>

          {/* Markets List */}
          <div className="space-y-3">
            {store.predictions
              .filter(p => predFilter === 'ALL' ? true : predFilter === 'Open' ? p.status === 'Open' : p.status !== 'Open')
              .map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#00FF41] font-bold">[{m.category}]</span>
                        <span className="text-white font-bold text-sm">{m.title}</span>
                      </div>
                      <div className="text-[11px] text-[#777] mt-0.5">
                        Expires: {m.expiry} • Total Volume: <strong className="text-white">{m.totalVolume}</strong>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-auto ${
                      m.status === 'Open' ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30' :
                      m.status === 'Resolved_Yes' ? 'bg-green-500/20 text-green-400' :
                      m.status === 'Resolved_No' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {m.status.replace('_', ': ')}
                    </span>
                  </div>

                  {/* Pools Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#00FF41]">YES: ${m.yesPool.toLocaleString()}</span>
                      <span className="text-red-400">NO: ${m.noPool.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden flex">
                      <div className="bg-[#00FF41]" style={{ width: `${(m.yesPool / (m.yesPool + m.noPool)) * 100}%` }}></div>
                      <div className="bg-red-500 flex-1"></div>
                    </div>
                  </div>

                  {/* Action buttons if open */}
                  {m.status === 'Open' && (
                    <div className="pt-2 border-t border-[#1A1A1A] flex items-center space-x-2">
                      <span className="text-[#777]">Settle Outcome:</span>
                      <button
                        onClick={() => handleResolvePrediction(m.id, 'Resolved_Yes')}
                        className="px-3 py-1 rounded-lg bg-green-950/40 hover:bg-green-900/60 border border-green-500/40 text-green-300 font-bold"
                      >
                        Resolve YES
                      </button>
                      <button
                        onClick={() => handleResolvePrediction(m.id, 'Resolved_No')}
                        className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold"
                      >
                        Resolve NO
                      </button>
                      <button
                        onClick={() => handleResolvePrediction(m.id, 'Void')}
                        className="px-3 py-1 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-[#AAA]"
                      >
                        Void / Refund
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= 8. TRADINGVIEW FEED CONFIG ================= */}
      {activeSubtab === 'tradingview_feed' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">TradingView & WebSocket Chart Feed</h2>
              <p className="text-xs text-[#777]">Configure charting engine defaults, candle aggregation intervals, and indicator overlays.</p>
            </div>
            <button
              onClick={() => {
                setTvNotice(true);
                confetti({ particleCount: 25 });
                setTimeout(() => setTvNotice(false), 2500);
              }}
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider"
            >
              Save Feed Preferences
            </button>
          </div>

          {tvNotice && (
            <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>TradingView chart parameters saved and broadcast to all trader interfaces!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="text-[#777] uppercase block">Default Candle Interval</label>
              <select
                value={tvCandleInterval}
                onChange={(e) => setTvCandleInterval(e.target.value)}
                className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
              >
                <option value="1m">1 Minute (Ultra High-Frequency)</option>
                <option value="5m">5 Minutes (Scalp Mode)</option>
                <option value="15m">15 Minutes (Default Standard)</option>
                <option value="1h">1 Hour (Swing)</option>
                <option value="1D">1 Day (Macro Trend)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2 flex items-center justify-between">
              <div>
                <label className="text-white font-bold block">Volume Profile Overlay</label>
                <p className="text-[#666] text-[10px]">Show institutional horizontal order depth on price axis.</p>
              </div>
              <input
                type="checkbox"
                checked={tvVolumeProfile}
                onChange={(e) => setTvVolumeProfile(e.target.checked)}
                className="accent-[#00FF41] w-4 h-4"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2 flex items-center justify-between">
              <div>
                <label className="text-white font-bold block">Default Quantitative Indicators</label>
                <p className="text-[#666] text-[10px]">Enable EMA 20/50/200 and MACD by default.</p>
              </div>
              <input
                type="checkbox"
                checked={tvIndicators}
                onChange={(e) => setTvIndicators(e.target.checked)}
                className="accent-[#00FF41] w-4 h-4"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
            <h3 className="text-sm font-bold text-white uppercase">Real-Time Datafeed Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#141414]">
                <div className="text-[#777] text-[10px]">WEBSOCKET STREAM</div>
                <div className="text-white font-bold text-sm mt-0.5">wss://stream.orahdex.io/v1/kline</div>
                <div className="text-[#00FF41] text-[10px]">120 fps continuous</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414]">
                <div className="text-[#777] text-[10px]">INDEX RESOLUTION</div>
                <div className="text-white font-bold text-sm mt-0.5">WhatsOnChain + TAAL UTXOs</div>
                <div className="text-[#00FF41] text-[10px]">Sub-cent accuracy</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414]">
                <div className="text-[#777] text-[10px]">SERVER BUFFER</div>
                <div className="text-white font-bold text-sm mt-0.5">50,000 Historical Candles</div>
                <div className="text-[#00FF41] text-[10px]">0% cache miss</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 9. CEX CONNECTIONS ================= */}
      {activeSubtab === 'cex_connections' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Centralized Exchange (CEX) Arbitrage Bridges</h2>
              <p className="text-xs text-[#777]">Manage low-latency mirror bridges to Binance, Bybit, and OKX for cross-venue arbitrage.</p>
            </div>
          </div>

          {cexNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{cexNotice}</span>
            </div>
          )}

          {/* CEX Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Binance */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 font-bold flex items-center justify-center">
                    B
                  </div>
                  <span className="font-bold text-white">Binance Global</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  CONNECTED
                </span>
              </div>
              <div className="space-y-1 text-[#888]">
                <div className="flex justify-between">
                  <span>API Ping:</span>
                  <strong className="text-white">{store.cex.binanceLatency}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mirrored Pairs:</span>
                  <strong className="text-white">BTC, SOL, BSV</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className="text-[#00FF41]">Active 24/7</strong>
                </div>
              </div>
              <button
                onClick={() => handleTestCexPing('Binance')}
                disabled={cexTesting === 'Binance'}
                className="w-full py-2 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold"
              >
                {cexTesting === 'Binance' ? 'Pinging Node...' : 'Test Connection Ping'}
              </button>
            </div>

            {/* Bybit */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center">
                    BY
                  </div>
                  <span className="font-bold text-white">Bybit Perp</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  CONNECTED
                </span>
              </div>
              <div className="space-y-1 text-[#888]">
                <div className="flex justify-between">
                  <span>API Ping:</span>
                  <strong className="text-white">{store.cex.bybitLatency}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mirrored Pairs:</span>
                  <strong className="text-white">Futures Funding Rates</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className="text-[#00FF41]">Active 24/7</strong>
                </div>
              </div>
              <button
                onClick={() => handleTestCexPing('Bybit')}
                disabled={cexTesting === 'Bybit'}
                className="w-full py-2 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold"
              >
                {cexTesting === 'Bybit' ? 'Pinging Node...' : 'Test Connection Ping'}
              </button>
            </div>

            {/* OKX */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center">
                    OK
                  </div>
                  <span className="font-bold text-white">OKX Web3</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  CONNECTED
                </span>
              </div>
              <div className="space-y-1 text-[#888]">
                <div className="flex justify-between">
                  <span>API Ping:</span>
                  <strong className="text-white">{store.cex.okxLatency}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mirrored Pairs:</span>
                  <strong className="text-white">BSV, Ordinals, Runes</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className="text-[#00FF41]">Active 24/7</strong>
                </div>
              </div>
              <button
                onClick={() => handleTestCexPing('OKX')}
                disabled={cexTesting === 'OKX'}
                className="w-full py-2 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold"
              >
                {cexTesting === 'OKX' ? 'Pinging Node...' : 'Test Connection Ping'}
              </button>
            </div>

          </div>

          {/* Arbitrage Threshold Slider */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase">Automated Cross-Venue Spread Trigger</h3>
              <span className="text-[#00FF41] font-bold">{arbSpread}% Net Spread</span>
            </div>
            <p className="text-[#777]">
              When price discrepancy between OrahDEX in-memory order book and Binance/Bybit exceeds this threshold, AURA Quant Arbitrage bot executes instant delta-neutral balancing.
            </p>
            <input
              type="range"
              min="0.10"
              max="2.00"
              step="0.05"
              value={arbSpread}
              onChange={(e) => {
                setArbSpread(e.target.value);
                store.cex.arbitrageSpreadTrigger = e.target.value;
                adminSettingsStore.save();
              }}
              className="w-full accent-[#00FF41]"
            />
            <div className="flex justify-between text-[#555] text-[10px]">
              <span>Aggressive (0.10%)</span>
              <span>Balanced (0.35%)</span>
              <span>Conservative (2.00%)</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
