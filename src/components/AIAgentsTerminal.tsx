import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { perpService, PERP_MARKETS } from '../services/perpService';
import { AIAgent, AIAgentType } from '../types/dex';
import confetti from 'canvas-confetti';
import {
  Bot,
  Zap,
  Play,
  Pause,
  Sliders,
  Terminal,
  Activity,
  ShieldCheck,
  TrendingUp,
  Plus,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Flame,
  Radio
} from 'lucide-react';

export const AIAgentsTerminal: React.FC = () => {
  const { isConnected, openWalletModal } = useWallet();

  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isSimulatingCycle, setIsSimulatingCycle] = useState<boolean>(false);

  // New Agent Form State
  const [newAgentName, setNewAgentName] = useState<string>('OraDex Alpha Scalper');
  const [newAgentType, setNewAgentType] = useState<AIAgentType>('momentum_breakout');
  const [newAgentMarket, setNewAgentMarket] = useState<string>('BSV-PERP');
  const [newAgentCapital, setNewAgentCapital] = useState<string>('1500');
  const [newAgentLeverage, setNewAgentLeverage] = useState<number>(15);
  const [newAgentRisk, setNewAgentRisk] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');

  useEffect(() => {
    const list = perpService.getAIAgents();
    setAgents([...list]);
    if (list.length > 0 && !selectedAgent) {
      setSelectedAgent(list[0]);
    }
  }, []);

  const handleToggleStatus = (agentId: string) => {
    const updated = perpService.toggleAgentStatus(agentId);
    if (updated) {
      setAgents([...perpService.getAIAgents()]);
      if (selectedAgent?.id === agentId) {
        setSelectedAgent({ ...updated });
      }
    }
  };

  const handleTriggerCycle = (agentId: string) => {
    setIsSimulatingCycle(true);
    setTimeout(() => {
      const updated = perpService.triggerAgentCycle(agentId);
      if (updated) {
        setAgents([...perpService.getAIAgents()]);
        if (selectedAgent?.id === agentId) {
          setSelectedAgent({ ...updated });
        }
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
      setIsSimulatingCycle(false);
    }, 600);
  };

  const handleDeployAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      openWalletModal();
      return;
    }

    const capital = parseFloat(newAgentCapital) || 500;
    const newAgent = perpService.deployAIAgent({
      name: newAgentName,
      type: newAgentType,
      market: newAgentMarket,
      capitalUsd: capital,
      leverage: newAgentLeverage,
      riskTolerance: newAgentRisk
    });

    setAgents([...perpService.getAIAgents()]);
    setSelectedAgent(newAgent);
    setIsDeployModalOpen(false);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  // Aggregate Stats
  const totalCapital = agents.reduce((acc, a) => acc + a.allocatedCapitalUsd, 0);
  const totalPnl = agents.reduce((acc, a) => acc + a.totalPnlUsd, 0);
  const totalTrades = agents.reduce((acc, a) => acc + a.tradesCount, 0);
  const avgWinRate = agents.length > 0 
    ? (agents.reduce((acc, a) => acc + a.winRate, 0) / agents.length).toFixed(1)
    : '0';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-mono text-[#E0E0E0]">
      
      {/* Banner / Header */}
      <div className="mb-6 p-6 rounded-sm bg-[#0A0A0A] border border-[#222] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#00FF41] text-xs font-bold uppercase tracking-widest">
            <Bot className="w-4 h-4" />
            <span>Tradex (tradex.com) AURA AI Trading Engine • Autonomous Non-Custodial Agents</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase mt-1">
            AI Agent Trading Terminal
          </h1>
          <p className="text-xs text-[#777] max-w-2xl mt-1">
            Deploy autonomous 24/7 AI trading agents to execute high-frequency momentum, delta-neutral arbitrage, and whale-flow strategies on Bitcoin SV, Solana, and Ronin perpetuals.
          </p>
        </div>

        <button
          id="deploy-new-ai-agent-btn"
          onClick={() => setIsDeployModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,255,65,0.25)] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy AI Agent</span>
        </button>
      </div>

      {/* Aggregate AI Fleet Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider">Active AI Capital</div>
          <div className="text-xl font-black text-white mt-1">${totalCapital.toLocaleString()} USD</div>
          <div className="text-[10px] text-[#00FF41] mt-0.5">{agents.length} Bots Deployed</div>
        </div>

        <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider">Fleet Net Realized PnL</div>
          <div className="text-xl font-black text-[#00FF41] mt-1">+${totalPnl.toFixed(2)} USD</div>
          <div className="text-[10px] text-[#00FF41] mt-0.5">+{(totalCapital > 0 ? (totalPnl / totalCapital) * 100 : 0).toFixed(2)}% ROI</div>
        </div>

        <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider">Average Win Rate</div>
          <div className="text-xl font-black text-white mt-1">{avgWinRate}%</div>
          <div className="text-[10px] text-[#777] mt-0.5">Across {totalTrades} Executions</div>
        </div>

        <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider">Avg Latency & Finality</div>
          <div className="text-xl font-black text-[#00FF41] mt-1">&lt; 420 ms</div>
          <div className="text-[10px] text-[#777] mt-0.5">BSV & Solana Direct RPC</div>
        </div>
      </div>

      {/* Main Grid: Agent Cards & Live Telemetry Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE AGENTS LIST (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#AAA]">Deployed AI Fleet</h2>
            <span className="text-[10px] text-[#555]">Select an agent to inspect</span>
          </div>

          <div className="space-y-3">
            {agents.map((agent) => {
              const isSelected = selectedAgent?.id === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-sm bg-[#0A0A0A] border cursor-pointer transition-all ${
                    isSelected ? 'border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.1)]' : 'border-[#222] hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-[#00FF41] animate-pulse' : 'bg-amber-500'}`}></span>
                        <h3 className="font-black text-white text-sm tracking-tight">{agent.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-[#777] mt-1">
                        <span className="bg-[#151515] px-1.5 py-0.5 rounded border border-[#252525] text-white font-bold">{agent.market}</span>
                        <span>{agent.leverage}x Leverage</span>
                        <span className="text-[#555]">•</span>
                        <span className="text-[#00FF41]">{agent.aiModel}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-[#00FF41]">
                        +${agent.totalPnlUsd.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#00FF41]">
                        (+{agent.totalPnlPercent}%)
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#777] mt-2 line-clamp-2">
                    {agent.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#181818] flex items-center justify-between text-[10px] text-[#666]">
                    <div>Win Rate: <span className="text-white font-bold">{agent.winRate}%</span> ({agent.tradesCount} trades)</div>
                    <div>Capital: <span className="text-white font-bold">${agent.allocatedCapitalUsd}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: AGENT INSPECTION & TELEMETRY TERMINAL (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedAgent ? (
            <div className="rounded-sm bg-[#0A0A0A] border border-[#222] p-5 sm:p-6 shadow-2xl space-y-5">
              
              {/* Agent Header & Status Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#222]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-sm bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 text-[10px] font-bold uppercase">
                      {selectedAgent.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#777] font-mono">ID: {selectedAgent.id}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                    {selectedAgent.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(selectedAgent.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase transition-all border ${
                      selectedAgent.status === 'active'
                        ? 'bg-[#151515] hover:bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#00FF41] border-[#00FF41]/40'
                    }`}
                  >
                    {selectedAgent.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{selectedAgent.status === 'active' ? 'Pause Bot' : 'Resume Bot'}</span>
                  </button>

                  <button
                    id="trigger-ai-cycle-btn"
                    onClick={() => handleTriggerCycle(selectedAgent.id)}
                    disabled={isSimulatingCycle || selectedAgent.status !== 'active'}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-wider transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingCycle ? 'animate-spin' : ''}`} />
                    <span>{isSimulatingCycle ? 'Inferencing...' : 'Run Cycle'}</span>
                  </button>
                </div>
              </div>

              {/* Agent Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-sm bg-[#111] border border-[#222] text-xs">
                <div>
                  <div className="text-[10px] text-[#666] uppercase font-bold">Allocated Capital</div>
                  <div className="text-white font-bold mt-0.5">${selectedAgent.allocatedCapitalUsd} USD</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#666] uppercase font-bold">Max Leverage</div>
                  <div className="text-[#00FF41] font-bold mt-0.5">{selectedAgent.leverage}x Max</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#666] uppercase font-bold">Risk Guard</div>
                  <div className="text-white font-bold uppercase mt-0.5">{selectedAgent.riskTolerance}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#666] uppercase font-bold">Max Drawdown</div>
                  <div className="text-amber-400 font-bold mt-0.5">{selectedAgent.maxDrawdown}%</div>
                </div>
              </div>

              {/* Latest AI Strategy Action */}
              <div className="p-3.5 rounded-sm bg-[#050505] border border-[#222]">
                <div className="flex items-center space-x-2 text-[10px] text-[#777] uppercase font-bold mb-1">
                  <Activity className="w-3.5 h-3.5 text-[#00FF41]" />
                  <span>Latest Autonomous Action</span>
                  <span className="text-[#555]">• {new Date(selectedAgent.lastDecisionTime).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs text-white font-mono">
                  {selectedAgent.lastAction}
                </div>
              </div>

              {/* Telemetry Stream Box */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase text-white">
                    <Terminal className="w-4 h-4 text-[#00FF41]" />
                    <span>Real-time Inference Log Feed</span>
                  </div>
                  <span className="text-[10px] text-[#555]">Zero-Latency Protocol Stream</span>
                </div>

                <div className="bg-[#050505] border border-[#222] rounded-sm p-3.5 font-mono text-xs max-h-64 overflow-y-auto space-y-2">
                  {selectedAgent.logs.map((log) => (
                    <div key={log.id} className="p-2 rounded-sm bg-[#0E0E0E] border border-[#1A1A1A] space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-bold uppercase ${
                          log.level === 'trade' ? 'text-[#00FF41]' :
                          log.level === 'signal' ? 'text-cyan-400' :
                          log.level === 'risk_alert' ? 'text-rose-400' : 'text-[#777]'
                        }`}>
                          [{log.level}] • {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        {log.metrics && (
                          <div className="flex items-center space-x-2 text-[#666]">
                            {log.metrics.rsi && <span>RSI: {log.metrics.rsi}</span>}
                            {log.metrics.sentimentScore && <span>Sentiment: {log.metrics.sentimentScore}%</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-white text-[11px] leading-relaxed">
                        {log.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#555] rounded-sm bg-[#0A0A0A] border border-[#222]">
              Select an AI Agent from the fleet to view real-time telemetry.
            </div>
          )}
        </div>

      </div>

      {/* DEPLOY AI AGENT MODAL */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-sm bg-[#0A0A0A] border border-[#333] p-6 sm:p-8 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <div>
                <span className="text-[10px] text-[#00FF41] uppercase font-bold tracking-widest">OraDex Strategy Studio</span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Deploy Autonomous Agent</h3>
              </div>
              <button onClick={() => setIsDeployModalOpen(false)} className="text-[#777] hover:text-white font-mono">✕</button>
            </div>

            <form onSubmit={handleDeployAgent} className="space-y-4 text-xs font-mono">
              
              <div>
                <label className="block text-[#777] uppercase text-[10px] font-bold mb-1">Agent Name</label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#777] uppercase text-[10px] font-bold mb-1">Strategy Archetype</label>
                  <select
                    value={newAgentType}
                    onChange={(e) => setNewAgentType(e.target.value as AIAgentType)}
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  >
                    <option value="momentum_breakout">Momentum Breakout</option>
                    <option value="grid_market_maker">Grid Market Maker</option>
                    <option value="sentiment_scalper">Sentiment Scalper</option>
                    <option value="cross_arb_sentinel">Cross-Chain Arb</option>
                    <option value="whale_flow_tracker">Whale Flow Tracker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#777] uppercase text-[10px] font-bold mb-1">Target Market</label>
                  <select
                    value={newAgentMarket}
                    onChange={(e) => setNewAgentMarket(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  >
                    {PERP_MARKETS.map((m, idx) => (
                      <option key={`agent_mkt_${m.symbol}_${idx}`} value={m.symbol}>{m.symbol}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#777] uppercase text-[10px] font-bold mb-1">Allocated Capital ($)</label>
                  <input
                    type="number"
                    value={newAgentCapital}
                    onChange={(e) => setNewAgentCapital(e.target.value)}
                    min="50"
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#777] uppercase text-[10px] font-bold mb-1">Max Leverage ({newAgentLeverage}x)</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={newAgentLeverage}
                    onChange={(e) => setNewAgentLeverage(parseInt(e.target.value))}
                    className="w-full accent-[#00FF41] mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#777] uppercase text-[10px] font-bold mb-1">Risk Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['conservative', 'balanced', 'aggressive'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewAgentRisk(r)}
                      className={`py-2 rounded-sm border uppercase text-[10px] font-bold transition-colors ${
                        newAgentRisk === r ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'bg-[#111] text-[#777] border-[#333]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-widest shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <Bot className="w-4 h-4 fill-current" />
                  <span>Launch 24/7 Autonomous Agent</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
