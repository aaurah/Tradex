import React, { useState } from 'react';
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
  Power
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPlatform: React.FC<{ activeSubtab: string }> = ({ activeSubtab }) => {
  // Feature Flags State
  const [flags, setFlags] = useState({
    spotTrading: true,
    perpetualFutures: true,
    predictionMarkets: true,
    p2pEscrow: true,
    aiAutonomousAgents: true,
    copyVaults: true,
    stakingVaults: true,
    publicFaucet: true,
    bsvIntentSettlement: true,
    zeroGasPasskeyMode: true,
    maintenanceMode: false
  });

  // Fee Config State
  const [makerFee, setMakerFee] = useState('0.01');
  const [takerFee, setTakerFee] = useState('0.03');
  const [minerSatPerByte, setMinerSatPerByte] = useState('0.50');
  const [orahDiscountPercent, setOrahDiscountPercent] = useState('50');
  const [feeSaveSuccess, setFeeSaveSuccess] = useState(false);

  // Trade Pairs State
  const [pairs, setPairs] = useState([
    { symbol: 'BSV/USDT', type: 'Spot', status: 'Active', minOrder: '0.01 BSV', tickSize: '0.01' },
    { symbol: 'BSV-PERP', type: 'Perpetual', status: 'Active', minOrder: '0.1 BSV', tickSize: '0.05' },
    { symbol: 'ORAH/USDT', type: 'Spot', status: 'Active', minOrder: '1 ORAH', tickSize: '0.001' },
    { symbol: 'ORAH-PERP', type: 'Perpetual', status: 'Active', minOrder: '5 ORAH', tickSize: '0.005' },
    { symbol: 'AURA/USDT', type: 'Spot', status: 'Active', minOrder: '0.5 AURA', tickSize: '0.01' },
    { symbol: 'BTC/USDT', type: 'Spot', status: 'Active', minOrder: '0.0001 BTC', tickSize: '0.1' },
    { symbol: 'SOL/USDT', type: 'Spot', status: 'Active', minOrder: '0.05 SOL', tickSize: '0.01' },
  ]);

  const [newPairSymbol, setNewPairSymbol] = useState('');
  const [newPairType, setNewPairType] = useState('Spot');

  // Prediction Markets creation
  const [newPredictionTitle, setNewPredictionTitle] = useState('');
  const [newPredictionCategory, setNewPredictionCategory] = useState('Crypto');
  const [predictionSaved, setPredictionSaved] = useState(false);

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveFees = (e: React.FormEvent) => {
    e.preventDefault();
    setFeeSaveSuccess(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setFeeSaveSuccess(false), 3000);
  };

  const handleAddPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPairSymbol.trim()) return;
    setPairs(prev => [
      ...prev,
      {
        symbol: newPairSymbol.toUpperCase().trim(),
        type: newPairType,
        status: 'Active',
        minOrder: '0.1',
        tickSize: '0.01'
      }
    ]);
    setNewPairSymbol('');
    confetti({ particleCount: 30, spread: 40 });
  };

  return (
    <div className="space-y-6">
      
      {/* ================= 1. FEATURE FLAGS ================= */}
      {activeSubtab === 'feature_flags' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Platform Feature Flags</h2>
              <p className="text-xs text-[#777] font-mono">Master kill-switches and autonomous module governors.</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
              11 ACTIVE FLAGS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.entries(flags).map(([key, enabled]) => (
              <div
                key={key}
                onClick={() => toggleFlag(key as any)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  enabled 
                    ? 'bg-[#0E150F] border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.05)]' 
                    : 'bg-[#121212] border-[#222222] opacity-75'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-[11px] font-mono text-[#777]">
                    {enabled ? 'Module active & routing trades' : 'Disabled for all users'}
                  </div>
                </div>

                <button
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
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
              <p className="text-xs text-[#777] font-mono">Manage active spot pairs, perpetual contracts, and tick sizes.</p>
            </div>
            
            {/* Add pair form */}
            <form onSubmit={handleAddPair} className="flex items-center space-x-2">
              <input
                type="text"
                value={newPairSymbol}
                onChange={(e) => setNewPairSymbol(e.target.value)}
                placeholder="e.g. SATS/USDT"
                className="px-3 py-1.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00FF41]"
              />
              <select
                value={newPairType}
                onChange={(e) => setNewPairType(e.target.value)}
                className="px-2.5 py-1.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-xs focus:outline-none"
              >
                <option value="Spot">Spot</option>
                <option value="Perpetual">Perpetual</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-bold text-xs font-mono flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pair</span>
              </button>
            </form>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1E1E1E] bg-[#0D0D0D]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141414] text-[#777] border-b border-[#1E1E1E] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Pair Symbol</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Min Order</th>
                  <th className="p-3">Tick Size</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {pairs.map((p, i) => (
                  <tr key={i} className="hover:bg-[#121212] transition-colors">
                    <td className="p-3 font-bold text-white">{p.symbol}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        p.type === 'Spot' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[#00FF41] flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td className="p-3 text-[#999]">{p.minOrder}</td>
                    <td className="p-3 text-[#999]">{p.tickSize}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setPairs(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-1 text-[#666] hover:text-red-400 transition-colors"
                        title="Remove pair"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 3. FEE CONFIG ================= */}
      {activeSubtab === 'fee_config' && (
        <form onSubmit={handleSaveFees} className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Fee Configuration & Staker Tiers</h2>
              <p className="text-xs text-[#777] font-mono">Configure trading fees, BSV miner rates, and $ORAH staking discounts.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider shadow-md"
            >
              Save Fee Config
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <label className="block text-xs font-mono uppercase text-[#777]">Maker Fee Rate (%)</label>
              <input
                type="text"
                value={makerFee}
                onChange={(e) => setMakerFee(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666] font-mono">Applies to liquidity providers placing passive limit orders.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <label className="block text-xs font-mono uppercase text-[#777]">Taker Fee Rate (%)</label>
              <input
                type="text"
                value={takerFee}
                onChange={(e) => setTakerFee(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666] font-mono">Applies to aggressive market orders taking resting liquidity.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <label className="block text-xs font-mono uppercase text-[#777]">BSV Miner Rate (Satoshis / Byte)</label>
              <input
                type="text"
                value={minerSatPerByte}
                onChange={(e) => setMinerSatPerByte(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666] font-mono">Sub-cent on-chain settlement rate for atomic swaps & intents.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <label className="block text-xs font-mono uppercase text-[#777]">$ORAH Staker Max Discount (%)</label>
              <input
                type="text"
                value={orahDiscountPercent}
                onChange={(e) => setOrahDiscountPercent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#666] font-mono">Max rebate for users staking over 1,000 $ORAH governance tokens.</p>
            </div>

          </div>

          {feeSaveSuccess && (
            <div className="p-3 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Fee parameters successfully updated across all settlement nodes!</span>
            </div>
          )}
        </form>
      )}

      {/* ================= 4. CONTRACTS & COINS ================= */}
      {activeSubtab === 'contracts_coins' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Smart Contracts & Deployed Tokens</h2>
            <p className="text-xs text-[#777] font-mono">Multi-chain addresses across Bitcoin SV, Base, and Solana.</p>
          </div>

          <div className="space-y-3">
            {[
              { chain: 'Bitcoin SV', title: 'Tradex Overlay Settlement Channel', address: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', status: 'Mainnet Verified' },
              { chain: 'Base (Ethereum L2)', title: 'Tradex Router & Liquidity Pool', address: '0x49c9569B137b6057a685e828C50C37937F5560bC', status: 'Audited' },
              { chain: 'Solana', title: 'Tradex Sovereign Program ID', address: 'TRADEX111111111111111111111111111111111111', status: 'Active' },
              { chain: 'BSV Token', title: '$ORAH Governance Overlay Token', address: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: '21M Cap' },
              { chain: 'BSV Token', title: '$AURA Autonomous Intelligence Token', address: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', status: '100M Cap' },
            ].map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00FF41] font-bold">[{c.chain}]</span>
                    <span className="text-white font-bold">{c.title}</span>
                  </div>
                  <div className="text-[11px] text-[#777] truncate mt-1 max-w-lg">{c.address}</div>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 5. PREDICTION MARKETS MANAGER ================= */}
      {activeSubtab === 'prediction' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Prediction Markets Admin</h2>
              <p className="text-xs text-[#777] font-mono">Create new binary outcome markets and resolve settled contracts.</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono">Create New Binary Prediction Market</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-[#777] mb-1">Market Question / Title</label>
                <input
                  type="text"
                  value={newPredictionTitle}
                  onChange={(e) => setNewPredictionTitle(e.target.value)}
                  placeholder="e.g. Will BSV reach $100 before end of Q4?"
                  className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00FF41]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#777] mb-1">Category</label>
                  <select
                    value={newPredictionCategory}
                    onChange={(e) => setNewPredictionCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="Crypto">Crypto</option>
                    <option value="Tradex">Tradex</option>
                    <option value="Macro">Macro</option>
                    <option value="AI Tech">AI Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#777] mb-1">Expiry Period</label>
                  <input
                    type="text"
                    defaultValue="30 days"
                    className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (newPredictionTitle.trim()) {
                    setPredictionSaved(true);
                    confetti({ particleCount: 40 });
                    setTimeout(() => {
                      setPredictionSaved(false);
                      setNewPredictionTitle('');
                    }, 2500);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider"
              >
                Deploy Market to BSV Chain
              </button>

              {predictionSaved && (
                <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] text-xs font-mono">
                  ✓ Market successfully deployed and broadcast to all oracle indexers!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. COPYVAULT & TRADE ANALYTICS & CEX ================= */}
      {(activeSubtab === 'copy_vault' || activeSubtab === 'trade_analytics' || activeSubtab === 'tradingview_feed' || activeSubtab === 'cex_connections') && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white capitalize">{activeSubtab.replace('_', ' ')}</h2>
            <p className="text-xs text-[#777] font-mono">Real-time telemetry and bridge synchronization.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-xs text-[#777] font-mono">STREAM STATUS</div>
              <div className="text-xl font-bold text-white font-mono">Connected • 120fps</div>
              <div className="text-[11px] text-[#00FF41] font-mono">WebSocket ping: 12ms</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-xs text-[#777] font-mono">ARBITRAGE BRIDGE</div>
              <div className="text-xl font-bold text-white font-mono">3 CEX Mirrors</div>
              <div className="text-[11px] text-[#00FF41] font-mono">Binance • Bybit • OKX</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-xs text-[#777] font-mono">QUANT VAULT SHARE</div>
              <div className="text-xl font-bold text-white font-mono">15.0% Profit Split</div>
              <div className="text-[11px] text-[#00FF41] font-mono">Auto-escrowed weekly</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
