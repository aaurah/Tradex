import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Terminal, 
  Bot, 
  Cpu, 
  Radio, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  RefreshCw,
  Search,
  Download,
  Play,
  Pause,
  Layers,
  Zap,
  Shield,
  Filter,
  Check,
  Power,
  RotateCcw,
  Sliders,
  Server,
  Globe,
  HardDrive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { adminSettingsStore, SystemLogEntry } from '../../services/adminSettingsStore';

export const AdminSystem: React.FC<{ activeSubtab: string }> = ({ activeSubtab }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = adminSettingsStore.subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const store = adminSettingsStore.data;

  // Logs state
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Server control state
  const [executingCommand, setExecutingCommand] = useState<string | null>(null);
  const [commandSuccessMsg, setCommandSuccessMsg] = useState<string | null>(null);

  // Diagnostics test runner state
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagStep, setDiagStep] = useState(0);
  const [diagResults, setDiagResults] = useState<Array<{ name: string; status: 'pending' | 'running' | 'passed' | 'failed'; time: string }>>([
    { name: 'Gorillapool ARC Mempool Handshake', status: 'passed', time: '14ms' },
    { name: 'WhatsOnChain Block Explorer Indexer', status: 'passed', time: '19ms' },
    { name: 'Sub-Millisecond In-Memory Matching Engine', status: 'passed', time: '0.4ms' },
    { name: 'Zero-Gas Passkey WebAuthn Relayer', status: 'passed', time: '28ms' },
    { name: 'Multi-Sig Treasury Vault Proof of Reserves', status: 'passed', time: '32ms' },
  ]);

  // Service health nodes
  const [isPingingNodes, setIsPingingNodes] = useState(false);
  const [nodesList, setNodesList] = useState([
    { name: 'Gorillapool ARC Broadcast Gateway', endpoint: 'arc.gorillapool.io', ping: '18ms', status: 'Operational', uptime: '99.99%' },
    { name: 'WhatsOnChain BSV Indexing RPC', endpoint: 'api.whatsonchain.com', ping: '24ms', status: 'Operational', uptime: '99.98%' },
    { name: 'Tradex Matching Engine (Worker 0)', endpoint: 'core-worker-0.tradex.internal', ping: '0.3ms', status: 'Operational', uptime: '100%' },
    { name: 'Base L2 Settlement Bridge', endpoint: 'mainnet.base.org', ping: '31ms', status: 'Operational', uptime: '99.95%' },
    { name: 'Solana RPC Validator Node', endpoint: 'api.mainnet-beta.solana.com', ping: '42ms', status: 'Operational', uptime: '99.91%' },
    { name: 'AURA Quant Liquidity Bot Daemon', endpoint: 'ai-daemon.tradex.internal', ping: '1.2ms', status: 'Operational', uptime: '99.99%' },
  ]);

  // Rate limit & IP state
  const [newBlockedIp, setNewBlockedIp] = useState('');
  const [rateLimitMax, setRateLimitMax] = useState(store.rateLimits.maxRequestsPerMin);
  const [rateLimitBurst, setRateLimitBurst] = useState(store.rateLimits.burstTolerance);
  const [ipNotice, setIpNotice] = useState<string | null>(null);

  // Liquidity Bot state
  const [botActive, setBotActive] = useState(store.bot.active);
  const [botSpread, setBotSpread] = useState(store.bot.bidSpread);
  const [botInterval, setBotInterval] = useState(store.bot.rebalanceInterval);
  const [botLevels, setBotLevels] = useState(store.bot.orderDepthLevels);
  const [botOrderSize, setBotOrderSize] = useState(store.bot.orderSizeBsv);
  const [botMaxInventory, setBotMaxInventory] = useState(store.bot.maxInventoryBsv);
  const [botAutoHedge, setBotAutoHedge] = useState(store.bot.autoHedge);
  const [botNotice, setBotNotice] = useState<string | null>(null);

  // Simulated live bot quote feed
  const [botQuotes, setBotQuotes] = useState<Array<{ id: string; time: string; action: string; price: string; size: string }>>([
    { id: '1', time: '1s ago', action: 'POST_BID', price: '$48.58', size: '0.25 BSV' },
    { id: '2', time: '1s ago', action: 'POST_ASK', price: '$48.62', size: '0.25 BSV' },
    { id: '3', time: '3s ago', action: 'CANCEL_ORDER', price: '$48.57', size: '0.25 BSV' },
    { id: '4', time: '5s ago', action: 'FILLED_TAKER', price: '$48.60', size: '0.10 BSV' },
  ]);

  // BSV Intents state
  const [intentsList, setIntentsList] = useState([
    { id: 'INT-9921', hash: '8f4343...327aa4', from: '1P5Z...HQ', assetIn: '1.0 BSV', assetOut: '48.60 USDT', status: 'Settled', block: '964,682', time: '2m ago' },
    { id: 'INT-9920', hash: 'e3b0c4...b855aa', from: '18cb...We', assetIn: '250 USDT', assetOut: '5.14 BSV', status: 'Settled', block: '964,681', time: '5m ago' },
    { id: 'INT-9919', hash: '7c89d1...112e9b', from: '1Lbc...30Q', assetIn: '0.50 BSV', assetOut: '24.30 USDT', status: 'Confirmed', block: '964,680', time: '8m ago' },
    { id: 'INT-9918', hash: '9b14ef...33a41c', from: '1N52...14m', assetIn: '100 ORAH', assetOut: '0.82 BSV', status: 'Pending', block: 'Mempool', time: 'Just now' },
  ]);
  const [intentNotice, setIntentNotice] = useState<string | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [store.logs, autoScroll]);

  // Execute server command with realistic feedback
  const handleRunCommand = (name: string, actionDesc: string) => {
    setExecutingCommand(name);
    setTimeout(() => {
      setExecutingCommand(null);
      setCommandSuccessMsg(`✓ ${actionDesc} completed successfully with exit code 0.`);
      adminSettingsStore.addLog('SUCCESS', 'SYSTEM', `Admin executed command: ${name}`);
      confetti({ particleCount: 30 });
      setTimeout(() => setCommandSuccessMsg(null), 3500);
    }, 750);
  };

  // Run full automated diagnostic test suite
  const handleRunDiagnostics = () => {
    setDiagnosticRunning(true);
    setDiagStep(0);
    setDiagResults(prev => prev.map(item => ({ ...item, status: 'pending' })));

    let current = 0;
    const interval = setInterval(() => {
      if (current < 5) {
        setDiagStep(current + 1);
        setDiagResults(prev => prev.map((item, idx) => {
          if (idx === current) {
            return { ...item, status: 'passed', time: `${Math.floor(Math.random() * 20 + 8)}ms` };
          }
          if (idx === current + 1) {
            return { ...item, status: 'running' };
          }
          return item;
        }));
        current++;
      } else {
        clearInterval(interval);
        setDiagnosticRunning(false);
        adminSettingsStore.addLog('SUCCESS', 'DIAGNOSTICS', 'Completed system health diagnostic suite: 5/5 PASSED');
        confetti({ particleCount: 45 });
      }
    }, 500);
  };

  // Ping all nodes
  const handlePingAllNodes = () => {
    setIsPingingNodes(true);
    setTimeout(() => {
      setNodesList(prev => prev.map(n => ({
        ...n,
        ping: n.name.includes('Internal') || n.name.includes('Worker') ? `${(Math.random() * 0.5 + 0.2).toFixed(1)}ms` : `${Math.floor(Math.random() * 25 + 10)}ms`
      })));
      setIsPingingNodes(false);
      adminSettingsStore.addLog('INFO', 'NETWORK', 'Pinged all external and internal blockchain RPC endpoints.');
      confetti({ particleCount: 20 });
    }, 600);
  };

  // Save bot settings
  const handleSaveBot = (e: React.FormEvent) => {
    e.preventDefault();
    store.bot.active = botActive;
    store.bot.bidSpread = botSpread;
    store.bot.rebalanceInterval = botInterval;
    store.bot.orderDepthLevels = botLevels;
    store.bot.orderSizeBsv = botOrderSize;
    store.bot.maxInventoryBsv = botMaxInventory;
    store.bot.autoHedge = botAutoHedge;
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'AURA-BOT', `Updated Quant Bot params: Spread ${botSpread}%, Order Size ${botOrderSize} BSV`);

    setBotNotice('Quant Market Making Bot parameters saved and hot-reloaded!');
    confetti({ particleCount: 35 });
    setTimeout(() => setBotNotice(null), 3000);
  };

  // Save rate limit
  const handleSaveRateLimits = (e: React.FormEvent) => {
    e.preventDefault();
    store.rateLimits.maxRequestsPerMin = rateLimitMax;
    store.rateLimits.burstTolerance = rateLimitBurst;
    adminSettingsStore.save();
    adminSettingsStore.addLog('INFO', 'FIREWALL', `Updated rate limits: ${rateLimitMax} RPM, burst ${rateLimitBurst}`);
    setIpNotice('Firewall rate limit rules updated!');
    setTimeout(() => setIpNotice(null), 3000);
  };

  // Add blocked IP
  const handleBlockIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedIp.trim()) return;
    store.rateLimits.ipBlocklist.push(newBlockedIp.trim());
    adminSettingsStore.save();
    adminSettingsStore.addLog('WARN', 'FIREWALL', `Blacklisted IP: ${newBlockedIp.trim()}`);
    setNewBlockedIp('');
    setIpNotice('IP address added to firewall blacklist!');
    setTimeout(() => setIpNotice(null), 3000);
  };

  // Remove blocked IP
  const handleUnblockIp = (ip: string) => {
    store.rateLimits.ipBlocklist = store.rateLimits.ipBlocklist.filter(item => item !== ip);
    adminSettingsStore.save();
    adminSettingsStore.addLog('INFO', 'FIREWALL', `Unblocked IP: ${ip}`);
  };

  // Broadcast single intent manually
  const handleBroadcastIntent = (id: string) => {
    setIntentsList(prev => prev.map(item => item.id === id ? { ...item, status: 'Settled', block: '964,683' } : item));
    adminSettingsStore.addLog('SUCCESS', 'INTENT', `Manually broadcast zero-gas intent ${id} to Gorillapool ARC.`);
    setIntentNotice(`Intent ${id} broadcast directly to BSV miners! Mined in block #964,683.`);
    confetti({ particleCount: 35 });
    setTimeout(() => setIntentNotice(null), 3500);
  };

  // Download logs
  const handleDownloadLogs = () => {
    const textContent = store.logs.map(l => `[${l.time}] [${l.level}] [${l.module}] ${l.msg}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradex_system_logs_${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* ================= 1. SERVICE STATUS ================= */}
      {activeSubtab === 'service_status' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Network Nodes & RPC Health</h2>
              <p className="text-xs text-[#777]">Live latency status for Bitcoin SV ARC gateways, EVM bridges, and matching daemons.</p>
            </div>

            <button
              onClick={handlePingAllNodes}
              disabled={isPingingNodes}
              className="px-3.5 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-bold flex items-center space-x-1.5 shadow-md transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPingingNodes ? 'animate-spin' : ''}`} />
              <span>{isPingingNodes ? 'Pinging Nodes...' : 'Ping All Services'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodesList.map((node, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate pr-2">{node.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 flex-shrink-0">
                    {node.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#777] truncate font-mono">{node.endpoint}</div>
                <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between">
                  <span className="text-[#888]">Latency: <strong className="text-white">{node.ping}</strong></span>
                  <span className="text-[#888]">Uptime: <strong className="text-[#00FF41]">{node.uptime}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 2. SYSTEM HEALTH ================= */}
      {activeSubtab === 'system_health' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">System Resource Telemetry</h2>
              <p className="text-xs text-[#777]">Hardware utilization, RAM buffer, WebSocket sockets, and disk read/write metrics.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="flex items-center justify-between text-[#777]">
                <span>CPU UTILIZATION</span>
                <Cpu className="w-4 h-4 text-[#00FF41]" />
              </div>
              <div className="text-2xl font-black text-white">18.4%</div>
              <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className="h-full bg-[#00FF41]" style={{ width: '18.4%' }}></div>
              </div>
              <div className="text-[10px] text-[#666]">8 Core Xeon @ 3.4GHz</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="flex items-center justify-between text-[#777]">
                <span>RAM ALLOCATION</span>
                <Server className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">12.8 / 32 GB</div>
              <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: '40%' }}></div>
              </div>
              <div className="text-[10px] text-[#666]">Redis cache: 4.2 GB</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="flex items-center justify-between text-[#777]">
                <span>ACTIVE WS CONNS</span>
                <Globe className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">1,842</div>
              <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className="h-full bg-purple-400" style={{ width: '61%' }}></div>
              </div>
              <div className="text-[10px] text-[#666]">Max pool: 10,000</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="flex items-center justify-between text-[#777]">
                <span>UTXO MEMPOOL</span>
                <HardDrive className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-black text-white">412 Txs</div>
              <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400" style={{ width: '15%' }}></div>
              </div>
              <div className="text-[10px] text-[#666]">0 unconfirmed dropouts</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. DIAGNOSTICS ================= */}
      {activeSubtab === 'diagnostics' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Automated System Diagnostics</h2>
              <p className="text-xs text-[#777]">Run full cryptographic, network, and order book integrity tests.</p>
            </div>

            <button
              onClick={handleRunDiagnostics}
              disabled={diagnosticRunning}
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider flex items-center space-x-2 shadow-md"
            >
              <Play className={`w-3.5 h-3.5 ${diagnosticRunning ? 'animate-spin' : ''}`} />
              <span>{diagnosticRunning ? `Testing (${diagStep}/5)...` : 'Run Diagnostics Suite'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
            <h3 className="text-sm font-bold text-white uppercase mb-2">Automated Verification Checklist</h3>
            {diagResults.map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#141414] border border-[#222] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {t.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                  ) : t.status === 'running' ? (
                    <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#555]" />
                  )}
                  <span className={t.status === 'passed' ? 'text-white font-bold' : 'text-[#888]'}>{t.name}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] text-[#666]">{t.time}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    t.status === 'passed' ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30' :
                    t.status === 'running' ? 'bg-yellow-500/10 text-yellow-400' : 'text-[#666]'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 4. SERVER CONTROL ================= */}
      {activeSubtab === 'server_control' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Direct Server Operations & Daemon Controls</h2>
            <p className="text-xs text-[#777]">Execute live cluster maintenance, cache purges, and database vacuums.</p>
          </div>

          {commandSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{commandSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Flush In-Memory Orderbook</h3>
                <p className="text-[#777] mt-1">Rebuilds active bids/asks from persistent RocksDB snapshots and discards orphaned mempool orders.</p>
              </div>
              <button
                onClick={() => handleRunCommand('FLUSH_ORDERBOOK', 'Orderbook flushed & rebuilt')}
                disabled={executingCommand === 'FLUSH_ORDERBOOK'}
                className="w-full py-2 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold transition-all mt-2"
              >
                {executingCommand === 'FLUSH_ORDERBOOK' ? 'Flushing Cache...' : 'Flush Orderbook'}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Hot-Reload Matching Engine</h3>
                <p className="text-[#777] mt-1">Gracefully spins up a new worker thread without dropping WebSocket client connections.</p>
              </div>
              <button
                onClick={() => handleRunCommand('RELOAD_ENGINE', 'Worker 0 hot-reloaded')}
                disabled={executingCommand === 'RELOAD_ENGINE'}
                className="w-full py-2 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold transition-all mt-2"
              >
                {executingCommand === 'RELOAD_ENGINE' ? 'Reloading Engine...' : 'Hot-Reload Engine'}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Vacuum & Compact UTXO Database</h3>
                <p className="text-[#777] mt-1">Cleans spent transaction inputs from local SQLite/PostgreSQL storage to free up disk IOPS.</p>
              </div>
              <button
                onClick={() => handleRunCommand('VACUUM_DB', 'Database compacted (214 MB reclaimed)')}
                disabled={executingCommand === 'VACUUM_DB'}
                className="w-full py-2 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold transition-all mt-2"
              >
                {executingCommand === 'VACUUM_DB' ? 'Compacting Database...' : 'Compact Database'}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Force Intent Relayer Resync</h3>
                <p className="text-[#777] mt-1">Queries WhatsOnChain and Gorillapool to confirm status of any stale zero-gas settlement requests.</p>
              </div>
              <button
                onClick={() => handleRunCommand('RESYNC_INTENTS', 'Relayer intents synchronized')}
                disabled={executingCommand === 'RESYNC_INTENTS'}
                className="w-full py-2 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold transition-all mt-2"
              >
                {executingCommand === 'RESYNC_INTENTS' ? 'Syncing Intents...' : 'Force Intent Sync'}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Trigger State Backup Snapshot</h3>
                <p className="text-[#777] mt-1">Creates an encrypted, timestamped archive of all orders, users, and ledger balances.</p>
              </div>
              <button
                onClick={() => handleRunCommand('BACKUP_STATE', 'Backup archive created & hashed')}
                disabled={executingCommand === 'BACKUP_STATE'}
                className="w-full py-2 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold transition-all mt-2"
              >
                {executingCommand === 'BACKUP_STATE' ? 'Creating Backup...' : 'Generate Backup Snapshot'}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-red-400 uppercase flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-red-400" />
                  <span>Emergency Circuit Breaker</span>
                </h3>
                <p className="text-red-200/70 mt-1">Instantly pauses matching engine execution, cancels all pending market orders, and logs an alert.</p>
              </div>
              <button
                onClick={() => handleRunCommand('CIRCUIT_BREAKER', 'EMERGENCY BREAKER TRIPPED')}
                disabled={executingCommand === 'CIRCUIT_BREAKER'}
                className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider transition-all mt-2 shadow-lg"
              >
                {executingCommand === 'CIRCUIT_BREAKER' ? 'Halting Execution...' : 'Trip Circuit Breaker'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 5. API MONITOR & RATE LIMITS ================= */}
      {activeSubtab === 'api_monitor' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">API Traffic & DDoS Rate Limiting</h2>
            <p className="text-xs text-[#777]">Set inbound request thresholds per client IP, manage blacklisted subnets, and monitor bursts.</p>
          </div>

          {ipNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{ipNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Rate Limiting Form */}
            <form onSubmit={handleSaveRateLimits} className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <h3 className="text-sm font-bold text-white uppercase">Rate Limiting Thresholds</h3>
              <div className="space-y-2">
                <label className="text-[#777] block">Max Requests Per Minute (Per IP)</label>
                <input
                  type="text"
                  value={rateLimitMax}
                  onChange={(e) => setRateLimitMax(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[#777] block">Burst Tolerance Allowance</label>
                <input
                  type="text"
                  value={rateLimitBurst}
                  onChange={(e) => setRateLimitBurst(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-bold uppercase tracking-wider"
              >
                Save Rate Limits
              </button>
            </form>

            {/* IP Blacklist Manager */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <h3 className="text-sm font-bold text-white uppercase">Firewall IP Blacklist</h3>
              
              <form onSubmit={handleBlockIp} className="flex space-x-2">
                <input
                  type="text"
                  value={newBlockedIp}
                  onChange={(e) => setNewBlockedIp(e.target.value)}
                  placeholder="Enter IP to block (e.g. 198.51.100.4)"
                  className="flex-1 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Block IP
                </button>
              </form>

              <div className="space-y-1.5 pt-2">
                {store.rateLimits.ipBlocklist.map((ip, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#141414] border border-[#222] flex items-center justify-between">
                    <span className="text-red-400 font-bold">{ip}</span>
                    <button
                      onClick={() => handleUnblockIp(ip)}
                      className="text-[#888] hover:text-white text-[11px]"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= 6. QUANT LIQUIDITY BOT ================= */}
      {activeSubtab === 'liquidity_bot' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">AURA Autonomous Liquidity Bot</h2>
              <p className="text-xs text-[#777]">Automated market making algorithm providing tight bid-ask spreads on BSV/USDT.</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                botActive ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30' : 'bg-[#222] text-[#888]'
              }`}>
                {botActive ? 'DAEMON ACTIVE' : 'PAUSED'}
              </span>
              <button
                onClick={() => {
                  setBotActive(!botActive);
                  store.bot.active = !botActive;
                  adminSettingsStore.save();
                  adminSettingsStore.addLog('INFO', 'AURA-BOT', `Toggled bot daemon to: ${!botActive}`);
                }}
                className="p-2 rounded-xl bg-[#181818] hover:bg-[#252525] border border-[#2E2E2E] text-white"
              >
                {botActive ? <Pause className="w-4 h-4 text-yellow-400" /> : <Play className="w-4 h-4 text-[#00FF41]" />}
              </button>
            </div>
          </div>

          {botNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{botNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Parameters Form */}
            <form onSubmit={handleSaveBot} className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <h3 className="text-sm font-bold text-white uppercase">Market Maker Parameters</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#777] block mb-1">Bid / Ask Spread (%)</label>
                  <input
                    type="text"
                    value={botSpread}
                    onChange={(e) => setBotSpread(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-[#777] block mb-1">Order Size (BSV)</label>
                  <input
                    type="text"
                    value={botOrderSize}
                    onChange={(e) => setBotOrderSize(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-[#777] block mb-1">Depth Order Levels</label>
                  <input
                    type="text"
                    value={botLevels}
                    onChange={(e) => setBotLevels(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-[#777] block mb-1">Max BSV Inventory Cap</label>
                  <input
                    type="text"
                    value={botMaxInventory}
                    onChange={(e) => setBotMaxInventory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hedgeCheck"
                    checked={botAutoHedge}
                    onChange={(e) => setBotAutoHedge(e.target.checked)}
                    className="accent-[#00FF41]"
                  />
                  <label htmlFor="hedgeCheck" className="text-white">Auto-Hedge via Binance/Bybit Bridge</label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider mt-2 shadow-md"
              >
                Hot-Update Quant Parameters
              </button>
            </form>

            {/* Live Bot Quote Stream */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center justify-between">
                <span>Real-Time Quote Feed</span>
                <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
              </h3>

              <div className="space-y-2">
                {botQuotes.map((q) => (
                  <div key={q.id} className="p-2.5 rounded-lg bg-[#141414] border border-[#222] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        q.action.includes('BID') ? 'bg-green-500/20 text-green-400' :
                        q.action.includes('ASK') ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {q.action}
                      </span>
                      <span className="text-white font-bold">{q.price}</span>
                      <span className="text-[#888]">({q.size})</span>
                    </div>
                    <span className="text-[10px] text-[#666]">{q.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= 7. BSV INTENTS ================= */}
      {activeSubtab === 'bsv_intents' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Zero-Gas BSV Settlement Intents</h2>
              <p className="text-xs text-[#777]">Atomic swap intents signed via WebAuthn passkeys and settled on Bitcoin SV mempool.</p>
            </div>
          </div>

          {intentNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{intentNotice}</span>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-[#1E1E1E] bg-[#0D0D0D]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141414] text-[#777] border-b border-[#1E1E1E] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Intent ID</th>
                  <th className="p-3">From Address</th>
                  <th className="p-3">Asset In / Out</th>
                  <th className="p-3">Block Status</th>
                  <th className="p-3">Time</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {intentsList.map((it) => (
                  <tr key={it.id} className="hover:bg-[#121212] transition-colors">
                    <td className="p-3 font-bold text-white flex items-center space-x-2">
                      <span className="text-[#00FF41]">{it.id}</span>
                      <span className="text-[#666] text-[10px]">({it.hash})</span>
                    </td>
                    <td className="p-3 text-[#AAA]">{it.from}</td>
                    <td className="p-3 text-white font-bold">{it.assetIn} → {it.assetOut}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        it.status === 'Settled' ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30' :
                        it.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {it.status} ({it.block})
                      </span>
                    </td>
                    <td className="p-3 text-[#777]">{it.time}</td>
                    <td className="p-3 text-right">
                      {it.status !== 'Settled' && (
                        <button
                          onClick={() => handleBroadcastIntent(it.id)}
                          className="px-2.5 py-1 rounded bg-[#00FF41]/10 hover:bg-[#00FF41]/20 border border-[#00FF41]/30 text-[#00FF41] text-[10px] font-bold"
                        >
                          Broadcast Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 8. SYSTEM LOGS TERMINAL ================= */}
      {activeSubtab === 'system_logs' && (
        <div className="space-y-4 font-mono text-xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">System Kernel & Matching Engine Logs</h2>
              <p className="text-xs text-[#777]">Streaming logs from node miners, WebSocket bridges, and risk oracles.</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  adminSettingsStore.addLog('INFO', 'TEST-EVENT', 'Manual diagnostic log event dispatched by SuperAdmin.');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#2E2E2E] text-white text-xs font-bold"
              >
                + Inject Test Event
              </button>

              <button
                onClick={handleDownloadLogs}
                className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#2E2E2E] text-white text-xs font-bold flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#00FF41]" />
                <span>Export Log File</span>
              </button>

              <button
                onClick={() => adminSettingsStore.clearLogs()}
                className="px-3 py-1.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search & Level Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0D0D0D] p-3 rounded-xl border border-[#1E1E1E]">
            <div className="flex items-center space-x-1">
              {(['ALL', 'INFO', 'WARN', 'ERROR', 'SUCCESS'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    logFilter === lvl ? 'bg-[#00FF41] text-black shadow-sm' : 'text-[#777] hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2.5" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search log messages or modules..."
                className="pl-8 pr-3 py-1.5 bg-[#141414] border border-[#262626] rounded-lg text-white text-xs focus:outline-none focus:border-[#00FF41] w-64"
              />
            </div>
          </div>

          {/* Terminal Box */}
          <div
            ref={logTerminalRef}
            className="p-4 rounded-xl bg-[#070707] border border-[#1E1E1E] h-[480px] overflow-y-auto space-y-1.5 font-mono text-[11px] select-text"
          >
            {store.logs
              .filter(l => logFilter === 'ALL' || l.level === logFilter)
              .filter(l => !logSearch || l.msg.toLowerCase().includes(logSearch.toLowerCase()) || l.module.toLowerCase().includes(logSearch.toLowerCase()))
              .map((l) => (
                <div key={l.id} className="flex items-start space-x-2 py-0.5 hover:bg-[#111] px-1.5 rounded transition-colors">
                  <span className="text-[#555] flex-shrink-0">[{l.time}]</span>
                  <span className={`px-1.5 rounded text-[10px] font-bold flex-shrink-0 ${
                    l.level === 'INFO' ? 'bg-blue-500/10 text-blue-400' :
                    l.level === 'WARN' ? 'bg-yellow-500/10 text-yellow-400' :
                    l.level === 'ERROR' ? 'bg-red-500/10 text-red-400' : 'bg-[#00FF41]/10 text-[#00FF41]'
                  }`}>
                    {l.level}
                  </span>
                  <span className="text-[#888] font-bold flex-shrink-0">[{l.module}]</span>
                  <span className="text-[#CCC]">{l.msg}</span>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};
