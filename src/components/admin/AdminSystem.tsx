import React, { useState } from 'react';
import { 
  Activity, 
  HeartPulse, 
  Wrench, 
  Server, 
  BarChart2, 
  LineChart, 
  Network, 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Square, 
  Trash2, 
  Download,
  Zap,
  Sliders,
  Cpu,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminSystem: React.FC<{ activeSubtab: string }> = ({ activeSubtab }) => {
  // Server Control Actions State
  const [actionOutput, setActionOutput] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  // Liquidity Bot State
  const [botActive, setBotActive] = useState(true);
  const [bidSpread, setBidSpread] = useState('0.05');
  const [askSpread, setAskSpread] = useState('0.05');
  const [rebalanceInterval, setRebalanceInterval] = useState('1000'); // ms
  const [botSaveNotice, setBotSaveNotice] = useState(false);

  // Logs State
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const sampleLogs = [
    { time: '01:14:02', level: 'INFO', msg: '[BSV-ENGINE] Block #964,682 mined. Verified 4,921 UTXO transfers.' },
    { time: '01:14:15', level: 'INFO', msg: '[MATCHING] Executed limit order #98241 (0.50 BSV @ $48.60 USDT).' },
    { time: '01:14:32', level: 'SUCCESS', msg: '[AURA-AI] Quant Arbitrage Bot netted +$14.20 USDT from Base-BSV spread.' },
    { time: '01:14:50', level: 'INFO', msg: '[INTENT-PIPELINE] Relayed zero-gas intent 0x8f2...41a to mempool.' },
    { time: '01:15:05', level: 'WARN', msg: '[ORACLE] Solana RPC ping spiked to 84ms. Switched to fallback endpoint.' },
    { time: '01:15:22', level: 'INFO', msg: '[PERP-ENGINE] Mark price updated: BSV-PERP $48.62 | Funding Rate 0.01%.' },
    { time: '01:15:40', level: 'INFO', msg: '[WS-GATEWAY] 1,842 active Web3 client connections synced.' },
    { time: '01:16:01', level: 'INFO', msg: '[MEMPOOL] Gorillapool ARC accepted 12 signed atomic transactions.' }
  ];

  const handleRunServerAction = (actionName: string, message: string) => {
    setRunningAction(actionName);
    setActionOutput(null);
    setTimeout(() => {
      setRunningAction(null);
      setActionOutput(`✓ ${message}`);
      confetti({ particleCount: 30, spread: 45 });
      setTimeout(() => setActionOutput(null), 4000);
    }, 900);
  };

  const handleSaveBot = (e: React.FormEvent) => {
    e.preventDefault();
    setBotSaveNotice(true);
    confetti({ particleCount: 35, spread: 50 });
    setTimeout(() => setBotSaveNotice(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* ================= 1. SERVER CONTROL (NEW) ================= */}
      {activeSubtab === 'server_control' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">Server & Infrastructure Control</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30">
                  NEW
                </span>
              </div>
              <p className="text-xs text-[#777] font-mono">Real-time worker lifecycle, cache clearing, and memory compaction.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Flush Cache */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-yellow-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Flush Orderbook & Redis Cache</h3>
                  <p className="text-[11px] text-[#777] font-mono">Purges stale depth snapshots without terminating active trades.</p>
                </div>
              </div>
              <button
                onClick={() => handleRunServerAction('flush_cache', 'Orderbook depth and fast cache successfully purged and re-indexed.')}
                disabled={runningAction === 'flush_cache'}
                className="w-full py-2.5 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white text-xs font-mono font-bold transition-all"
              >
                {runningAction === 'flush_cache' ? 'Flushing Memory...' : 'Execute Cache Purge'}
              </button>
            </div>

            {/* Restart Engine */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-[#00FF41]">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Reload Matching Engine Worker</h3>
                  <p className="text-[11px] text-[#777] font-mono">Graceful hot-restart of the sub-millisecond in-memory matching engine.</p>
                </div>
              </div>
              <button
                onClick={() => handleRunServerAction('restart_engine', 'Matching engine worker hot-reloaded seamlessly in 0.28ms.')}
                disabled={runningAction === 'restart_engine'}
                className="w-full py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black text-xs font-mono font-black uppercase tracking-wider transition-all"
              >
                {runningAction === 'restart_engine' ? 'Reloading Cluster...' : 'Hot-Reload Engine'}
              </button>
            </div>

            {/* Compact DB */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-cyan-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Compact On-Chain UTXO Database</h3>
                  <p className="text-[11px] text-[#777] font-mono">Runs database vacuuming and synchronizes BSV ledger checkpoints.</p>
                </div>
              </div>
              <button
                onClick={() => handleRunServerAction('vacuum_db', 'Database compacted. Freed 142MB and rebuilt B-Tree indexes.')}
                disabled={runningAction === 'vacuum_db'}
                className="w-full py-2.5 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white text-xs font-mono font-bold transition-all"
              >
                {runningAction === 'vacuum_db' ? 'Compacting Storage...' : 'Compact & Sync DB'}
              </button>
            </div>

            {/* Zero Gas Relayer */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-purple-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Relayer Mempool Broadcast Queue</h3>
                  <p className="text-[11px] text-[#777] font-mono">Re-broadcast pending BSV intent UTXOs to Gorillapool & TAAL.</p>
                </div>
              </div>
              <button
                onClick={() => handleRunServerAction('reflush_relayer', 'All 18 pending intents broadcasted with 0.5 sat/byte fee rate.')}
                disabled={runningAction === 'reflush_relayer'}
                className="w-full py-2.5 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white text-xs font-mono font-bold transition-all"
              >
                {runningAction === 'reflush_relayer' ? 'Broadcasting...' : 'Force Intent Sync'}
              </button>
            </div>

          </div>

          {actionOutput && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{actionOutput}</span>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. LIQUIDITY BOT ================= */}
      {activeSubtab === 'liquidity_bot' && (
        <form onSubmit={handleSaveBot} className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Automated Market Maker & Liquidity Bot</h2>
              <p className="text-xs text-[#777] font-mono">Maintains deep order book spreads across BSV/USDT, $ORAH, and $AURA.</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setBotActive(!botActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                  botActive ? 'bg-[#00FF41] text-black shadow-md' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {botActive ? <Play className="w-3.5 h-3.5 fill-current" /> : <Square className="w-3.5 h-3.5 fill-current" />}
                <span>{botActive ? 'BOT RUNNING' : 'BOT PAUSED'}</span>
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#181818] hover:bg-[#242424] border border-[#333] text-white font-bold text-xs font-mono"
              >
                Save Tuning
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block text-xs font-mono uppercase text-[#777]">Bid Spread Offset (%)</label>
              <input
                type="text"
                value={bidSpread}
                onChange={(e) => setBidSpread(e.target.value)}
                className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <span className="text-[10px] text-[#666] font-mono">Distance below mid-market price</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block text-xs font-mono uppercase text-[#777]">Ask Spread Offset (%)</label>
              <input
                type="text"
                value={askSpread}
                onChange={(e) => setAskSpread(e.target.value)}
                className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <span className="text-[10px] text-[#666] font-mono">Distance above mid-market price</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block text-xs font-mono uppercase text-[#777]">Rebalance Cycle (ms)</label>
              <input
                type="text"
                value={rebalanceInterval}
                onChange={(e) => setRebalanceInterval(e.target.value)}
                className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
              <span className="text-[10px] text-[#666] font-mono">Latency between order refreshes</span>
            </div>
          </div>

          {botSaveNotice && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] text-xs font-mono">
              ✓ Liquidity Bot parameters successfully re-calibrated.
            </div>
          )}
        </form>
      )}

      {/* ================= 3. SYSTEM LOGS ================= */}
      {activeSubtab === 'system_logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Real-Time System Logs</h2>
              <p className="text-xs text-[#777] font-mono">Live stream of node events, matching executions, and settlement intent receipts.</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-[#141414] p-1 rounded-lg border border-[#222] text-xs font-mono">
                {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      logFilter === lvl ? 'bg-[#00FF41] text-black' : 'text-[#777] hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const blob = new Blob([sampleLogs.map(l => `[${l.time}] [${l.level}] ${l.msg}`).join('\n')], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'tradex-system-logs.txt';
                  a.click();
                }}
                className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#202020] border border-[#262626] text-[#888] hover:text-white"
                title="Download Log Dump"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Console */}
          <div className="p-4 rounded-2xl bg-[#090909] border border-[#1E1E1E] font-mono text-xs space-y-2 h-80 overflow-y-auto shadow-inner">
            {sampleLogs
              .filter(l => logFilter === 'ALL' || l.level === logFilter)
              .map((l, i) => (
                <div key={i} className="flex items-start space-x-3 leading-relaxed hover:bg-[#121212] p-1 rounded">
                  <span className="text-[#555] select-none text-[11px]">{l.time}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    l.level === 'SUCCESS' ? 'bg-[#00FF41]/20 text-[#00FF41]' :
                    l.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400' :
                    l.level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {l.level}
                  </span>
                  <span className="text-[#DDD]">{l.msg}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= 4. SERVICE STATUS & HEALTH & INTENTS ================= */}
      {(activeSubtab === 'service_status' || activeSubtab === 'system_health' || activeSubtab === 'diagnostics' || activeSubtab === 'api_monitor' || activeSubtab === 'bsv_intents') && (
        <div className="space-y-4">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white capitalize">{activeSubtab.replace('_', ' ')}</h2>
            <p className="text-xs text-[#777] font-mono">Infrastructure telemetry, cluster metrics, and live nodes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-xs text-[#777] font-mono">MATCHING ENGINE LATENCY</div>
              <div className="text-xl font-bold text-[#00FF41] font-mono">0.38ms (p99)</div>
              <div className="text-[11px] text-[#666] font-mono">Zero dropped packets</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-xs text-[#777] font-mono">CPU LOAD (4 CORES)</div>
              <div className="text-xl font-bold text-white font-mono">14.2% Utilization</div>
              <div className="text-[11px] text-[#00FF41] font-mono">Nominal temperature</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-xs text-[#777] font-mono">BSV UTXO MEMPOOL</div>
              <div className="text-xl font-bold text-white font-mono">100% Synced</div>
              <div className="text-[11px] text-[#00FF41] font-mono">Gorillapool + TAAL</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-xs text-[#777] font-mono">SYSTEM UPTIME</div>
              <div className="text-xl font-bold text-white font-mono">99.998%</div>
              <div className="text-[11px] text-[#00FF41] font-mono">184 days without downtime</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
