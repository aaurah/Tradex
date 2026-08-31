import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { OnChainSettlementLog } from '../types/dex';
import { buildEscrowScript, buildSettlementTxHex, formatBsv, formatSats, generateBSVKeypair } from '../services/bsvCrypto';
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
  Search,
  Sparkles
} from 'lucide-react';

export const EscrowSettlementTerminal: React.FC = () => {
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

  const [makerKeyInput, setMakerKeyInput] = useState<string>('0287a9bc24519f8e4c7b6a1234567890abcdef1234567890abcdef1234567890ab');
  const [takerKeyInput, setTakerKeyInput] = useState<string>('03bc194a7e3f81e8f237b6058097b69c4c82b0e87d8a9e71cb4655022067d268d0');
  const [generatedScript, setGeneratedScript] = useState<ReturnType<typeof buildEscrowScript> | null>(null);

  const [copiedTxid, setCopiedTxid] = useState<string | null>(null);
  const [explorerModalLog, setExplorerModalLog] = useState<OnChainSettlementLog | null>(null);

  useEffect(() => {
    setLogs(apiService.getSettlementLogs());
    handleBuildScript();
  }, []);

  // Worker live heart-beat simulation
  useEffect(() => {
    if (!isWorkerRunning) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toISOString();
      const events = [
        `[${timestamp}] Polling mempool for 2-of-2 Escrow script triggers... [0 pending disputes]`,
        `[${timestamp}] Validating OP_CHECKMULTISIG witness signatures against UTXO index... Status: OK`,
        `[${timestamp}] Heartbeat: BSV block height 890414. Mempool tx propagation delay: 180ms.`
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setWorkerLogs(prev => [randomEvent, ...prev.slice(0, 40)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [isWorkerRunning]);

  const handleBuildScript = () => {
    const res = buildEscrowScript(makerKeyInput, takerKeyInput);
    setGeneratedScript(res);
  };

  const handleGenerateSampleKeypairs = () => {
    const kp1 = generateBSVKeypair();
    const kp2 = generateBSVKeypair();
    setMakerKeyInput(kp1.publicKeyHex);
    setTakerKeyInput(kp2.publicKeyHex);
    const res = buildEscrowScript(kp1.publicKeyHex, kp2.publicKeyHex);
    setGeneratedScript(res);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxid(id);
    setTimeout(() => setCopiedTxid(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-sm bg-[#0A0A0A] border border-[#222] shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-sm bg-[#141414] border border-[#333] text-[#00FF41]">
            <Terminal className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-white leading-none">
                Settlement Worker
              </h1>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 uppercase tracking-widest">
                Daemon Active
              </span>
            </div>
            <p className="text-xs text-[#777] mt-1 font-mono">
              Smart escrow settlement daemon executing non-custodial releases on the Bitcoin SV ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono">
          <button
            onClick={() => setIsWorkerRunning(!isWorkerRunning)}
            className={`px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
              isWorkerRunning
                ? 'bg-[#141414] text-[#00FF41] border border-[#00FF41]/50'
                : 'bg-[#141414] text-[#777] hover:text-white border border-[#222]'
            }`}
          >
            {isWorkerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isWorkerRunning ? 'Pause Worker' : 'Resume Worker'}</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN GRID: WORKER TERMINAL & ON-CHAIN SCRIPTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIVE SETTLEMENT STREAM & RECENT TXS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Worker Console Terminal */}
          <div className="rounded-sm bg-[#050505] border border-[#333] shadow-2xl overflow-hidden font-mono">
            <div className="p-3.5 bg-[#0A0A0A] border-b border-[#222] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41]"></span>
                <span className="text-white font-bold ml-2 uppercase text-[10px] tracking-widest">daemon: settlementWorker.ts</span>
              </div>
              <span className="text-[#666] text-[10px]">Port: 5000 / RPC 8332</span>
            </div>

            <div className="p-4 text-xs text-[#AAA] space-y-2 max-h-60 overflow-y-auto leading-relaxed">
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

          {/* On-Chain Settled Transactions Table */}
          <div className="rounded-sm bg-[#0A0A0A] border border-[#222] p-6 shadow-xl space-y-4 font-mono">
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#00FF41]" />
                <span>On-Chain Settlement Logbook</span>
              </h3>
              <span className="text-[10px] text-[#666] uppercase font-bold">BSV Ledger</span>
            </div>

            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-sm bg-[#111] border border-[#222] hover:border-[#444] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-[#00FF41] font-black text-sm">
                        {formatBsv(log.amountSats / 100000000)} BSV
                      </span>
                      <span className="text-[#444]">•</span>
                      <span className="text-[#888] font-bold">{log.scriptType}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-[#666] mt-1">
                      <span className="truncate max-w-[200px] text-white">{log.txid}</span>
                      <button
                        onClick={() => copyToClipboard(log.txid, log.id)}
                        className="text-[#666] hover:text-white"
                        title="Copy TxID"
                      >
                        {copiedTxid === log.id ? <Check className="w-3 h-3 text-[#00FF41]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 font-mono">
                    <span className="px-2 py-0.5 rounded-sm bg-[#141414] border border-[#333] text-[10px] text-[#888] font-bold">
                      Block #{log.blockHeight}
                    </span>
                    <button
                      onClick={() => setExplorerModalLog(log)}
                      className="px-2.5 py-1 rounded-sm bg-[#00FF41]/10 hover:bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-1"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SMART CONTRACT & MULTI-SIG BUILDER (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Multi-Sig 2-of-2 Escrow Script Generator */}
          <div className="rounded-sm bg-[#0A0A0A] border border-[#222] p-6 shadow-xl space-y-4 font-mono">
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#00FF41]" />
                <span>2-of-2 Smart Escrow Builder</span>
              </h3>

              <button
                onClick={handleGenerateSampleKeypairs}
                className="text-[10px] font-bold uppercase tracking-wider text-[#00FF41] hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Sample Keys</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#777] uppercase text-[10px] font-bold block mb-1">Maker Compressed PubKey (Secp256k1):</label>
                <input
                  type="text"
                  value={makerKeyInput}
                  onChange={(e) => { setMakerKeyInput(e.target.value); handleBuildScript(); }}
                  className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-sm font-mono text-[11px] text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="text-[#777] uppercase text-[10px] font-bold block mb-1">Taker Compressed PubKey (Secp256k1):</label>
                <input
                  type="text"
                  value={takerKeyInput}
                  onChange={(e) => { setTakerKeyInput(e.target.value); handleBuildScript(); }}
                  className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-sm font-mono text-[11px] text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              {generatedScript && (
                <div className="p-4 rounded-sm bg-[#111] border border-[#222] font-mono text-xs space-y-2.5">
                  <div>
                    <span className="text-[10px] text-[#666] uppercase font-bold block">ScriptPubKey (ASM):</span>
                    <p className="text-[#00FF41] text-[11px] break-all leading-tight">
                      {generatedScript.scriptAsm}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#666] uppercase font-bold block">ScriptHash (20 Bytes):</span>
                    <p className="text-white text-[11px] break-all">
                      {generatedScript.scriptHash}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#666] uppercase font-bold block">P2SH Escrow Address:</span>
                    <p className="text-white font-bold text-xs break-all">
                      {generatedScript.escrowAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Raw BSV Transaction Decoder */}
          <div className="rounded-sm bg-[#0A0A0A] border border-[#222] p-6 shadow-xl space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center space-x-2">
              <Code className="w-4 h-4 text-[#00FF41]" />
              <span>BSV Raw Transaction Hex</span>
            </h3>

            <div className="p-3.5 rounded-sm bg-[#111] border border-[#222] max-h-36 overflow-y-auto text-[11px] text-[#888] break-all leading-relaxed">
              {selectedTxHex}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-sm bg-[#111] border border-[#222]">
                <span className="text-[#666] uppercase text-[10px] font-bold block">Version:</span>
                <span className="font-bold text-white">01000000 (v1)</span>
              </div>
              <div className="p-2.5 rounded-sm bg-[#111] border border-[#222]">
                <span className="text-[#666] uppercase text-[10px] font-bold block">Miner Fee:</span>
                <span className="font-bold text-[#00FF41]">450 sats (0.0000045 BSV)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* WHATONCHAIN BLOCK EXPLORER MODAL */}
      {explorerModalLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in font-mono">
          <div className="w-full max-w-2xl rounded-sm bg-[#0A0A0A] border border-[#333] p-6 sm:p-8 shadow-2xl space-y-4 text-[#E0E0E0] text-xs">
            
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm bg-[#141414] border border-[#333] text-[#00FF41] flex items-center justify-center font-bold">
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
              <div className="p-3.5 rounded-sm bg-[#111] border border-[#222] space-y-1">
                <span className="text-[10px] text-[#666] uppercase tracking-wider block font-bold">Transaction ID (TxID)</span>
                <div className="text-[#00FF41] font-bold break-all text-xs">
                  {explorerModalLog.txid}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-sm bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">Total Output</span>
                  <span className="font-bold text-white">{formatBsv(explorerModalLog.amountSats / 100000000)} BSV</span>
                </div>

                <div className="p-2.5 rounded-sm bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">Fee (Sats)</span>
                  <span className="font-bold text-[#00FF41]">{explorerModalLog.feeSats} sats</span>
                </div>

                <div className="p-2.5 rounded-sm bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">Confirmations</span>
                  <span className="font-bold text-[#00FF41]">6+ Confs</span>
                </div>

                <div className="p-2.5 rounded-sm bg-[#111] border border-[#222]">
                  <span className="text-[10px] text-[#666] uppercase font-bold block">Status</span>
                  <span className="font-bold text-[#00FF41] uppercase">On-Chain</span>
                </div>
              </div>

              <div className="p-3.5 rounded-sm bg-[#111] border border-[#222] space-y-1">
                <span className="text-[10px] text-[#666] uppercase tracking-wider block font-bold">Script Specification</span>
                <div className="text-[#AAA] text-[11px]">
                  {explorerModalLog.scriptType} • 1 Input • 1 Output • Standard Non-SegWit (BSV Genesis rules)
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExplorerModalLog(null)}
                className="px-5 py-2 rounded-sm bg-white hover:bg-[#DDD] text-black font-black uppercase text-xs tracking-wider"
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
