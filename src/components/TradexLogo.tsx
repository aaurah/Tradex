import React, { useState, useEffect, useRef } from 'react';
import { apiHealthService, ApiHealthState } from '../services/apiHealthService';
import { Activity, Server, RefreshCw, AlertTriangle, CheckCircle2, Shield, Zap, X } from 'lucide-react';

interface TradexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showDomainBadge?: boolean;
  interactivePopover?: boolean;
  className?: string;
  onClick?: () => void;
}

export const TradexLogo: React.FC<TradexLogoProps> = ({
  size = 'md',
  showDomainBadge = true,
  interactivePopover = true,
  className = '',
  onClick
}) => {
  const [health, setHealth] = useState<ApiHealthState>(() => apiHealthService.getState());
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = apiHealthService.subscribe((state) => {
      setHealth(state);
    });
    return unsubscribe;
  }, []);

  const allWorking = health.allHealthy;

  // Determine size classes
  const textSizeClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl sm:text-2xl';
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const haloSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  const handleManualCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    apiHealthService.checkAllServers();
  };

  const handleToggleOutage = (e: React.MouseEvent) => {
    e.stopPropagation();
    apiHealthService.toggleSimulatedOutage();
  };

  return (
    <div className={`relative inline-flex items-center select-none ${className}`} ref={containerRef}>
      <div
        className="flex items-center space-x-2.5 cursor-pointer group"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Logo Text with Live Radar Pulse next to 'DEX' */}
        <div className="flex items-center font-black tracking-tight text-white leading-none">
          <span className={textSizeClass}>Orah</span>
          <span className={`${textSizeClass} text-[#00FF41] group-hover:text-[#33FF66] transition-colors`}>
            DEX
          </span>

          {/* Live API Radar Pulse Indicator next to DEX */}
          <span
            onClick={(e) => {
              if (interactivePopover) {
                e.stopPropagation();
                setShowStatusModal(!showStatusModal);
              }
            }}
            title={
              allWorking
                ? `All API servers operational (${health.onlineCount}/${health.totalCount} online • ${health.avgLatencyMs}ms)`
                : `API Server Alert: ${health.totalCount - health.onlineCount} service(s) degraded/down`
            }
            className="relative inline-flex items-center justify-center ml-1.5 cursor-pointer group/pulse"
          >
            {/* Outer Ping Radar Wave */}
            <span
              className={`absolute w-3.5 h-3.5 rounded-full opacity-75 animate-ping ${
                allWorking ? 'bg-[#00FF41]' : 'bg-[#FF3344]'
              }`}
            />
            {/* Radiant Core Glow Dot */}
            <span
              className={`relative inline-flex ${dotSize} rounded-full transition-transform group-hover/pulse:scale-125 ${
                allWorking
                  ? 'bg-[#00FF41] shadow-[0_0_8px_#00FF41]'
                  : 'bg-[#FF3344] shadow-[0_0_10px_#FF3344] animate-pulse'
              }`}
            />
          </span>
        </div>

        {/* Live Domain and Health Badge */}
        {showDomainBadge && (
          <div
            onClick={(e) => {
              if (interactivePopover) {
                e.stopPropagation();
                setShowStatusModal(!showStatusModal);
              }
            }}
            className={`hidden sm:inline-flex items-center space-x-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold transition-all cursor-pointer ${
              allWorking
                ? 'text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/30 hover:bg-[#00FF41]/20'
                : 'text-[#FF3344] bg-[#FF3344]/15 border-[#FF3344]/40 hover:bg-[#FF3344]/25 animate-pulse'
            }`}
          >
            {/* Status dot in badge */}
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                allWorking ? 'bg-[#00FF41] animate-pulse' : 'bg-[#FF3344]'
              }`}
            />
            <span>tradex.com</span>
            <span className="text-[8px] opacity-70">
              {allWorking ? `${health.avgLatencyMs}ms` : 'ERR'}
            </span>
          </div>
        )}
      </div>

      {/* ================= MODAL / POPOVER: DETAILED API SERVERS HEALTH ================= */}
      {showStatusModal && interactivePopover && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowStatusModal(false)}
          />
          <div
            className="fixed top-16 sm:top-20 left-4 sm:left-6 z-50 w-[calc(100vw-32px)] max-w-md bg-[#0D0D0D] border border-[#262626] rounded-2xl shadow-2xl p-5 text-left font-sans animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    allWorking
                      ? 'bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41]'
                      : 'bg-[#FF3344]/10 border border-[#FF3344]/30 text-[#FF3344]'
                  }`}
                >
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-black text-white">Tradex API Server Mesh</h4>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                        allWorking
                          ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30'
                          : 'bg-[#FF3344]/20 text-[#FF3344] border border-[#FF3344]/30'
                      }`}
                    >
                      {allWorking ? 'All Systems Online' : 'Degraded / Down'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#777] font-mono">
                    Real-time multi-chain nodes & liquidity routing
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-[#777] hover:text-white p-1 rounded-lg hover:bg-[#1A1A1A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview Banner */}
            <div
              className={`my-3 p-3 rounded-xl border flex items-center justify-between ${
                allWorking
                  ? 'bg-[#00FF41]/5 border-[#00FF41]/20 text-white'
                  : 'bg-[#FF3344]/10 border-[#FF3344]/30 text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="relative flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      allWorking ? 'bg-[#00FF41]' : 'bg-[#FF3344]'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      allWorking ? 'bg-[#00FF41]' : 'bg-[#FF3344]'
                    }`}
                  />
                </span>
                <div>
                  <div className="text-xs font-bold font-mono">
                    {allWorking
                      ? `5/5 API Gateways Operational`
                      : `⚠️ ${health.totalCount - health.onlineCount} Server(s) Unreachable`}
                  </div>
                  <div className="text-[10px] text-[#888] font-mono">
                    Average latency: {health.avgLatencyMs}ms • Auto-sync active
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualCheck}
                disabled={health.isChecking}
                className="p-1.5 bg-[#1A1A1A] hover:bg-[#262626] rounded-lg text-[#AAA] hover:text-white border border-[#333] transition-colors"
                title="Ping all servers"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${health.isChecking ? 'animate-spin text-[#00FF41]' : ''}`} />
              </button>
            </div>

            {/* Server List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {health.servers.map((srv) => {
                const isHealthy = srv.status === 'healthy';
                return (
                  <div
                    key={srv.id}
                    className="p-2.5 rounded-xl bg-[#121212] border border-[#1F1F1F] flex items-center justify-between hover:border-[#333] transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isHealthy ? 'bg-[#00FF41] shadow-[0_0_6px_#00FF41]' : 'bg-[#FF3344] animate-pulse'
                          }`}
                        />
                        <span className="text-xs font-bold text-white">{srv.name}</span>
                      </div>
                      <p className="text-[10px] text-[#666] font-mono line-clamp-1">{srv.description}</p>
                    </div>

                    <div className="text-right pl-3 shrink-0">
                      <div
                        className={`text-[10px] font-mono font-bold ${
                          isHealthy ? 'text-[#00FF41]' : 'text-[#FF3344]'
                        }`}
                      >
                        {isHealthy ? `${srv.latencyMs}ms` : 'OFFLINE'}
                      </div>
                      <div className="text-[9px] text-[#555] font-mono uppercase tracking-wider">
                        {srv.category}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer status summary & Close */}
            <div className="mt-4 pt-3 border-t border-[#1E1E1E] flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-[#00FF41] flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00FF41] inline-block"></span>
                <span>All Core Nodes Operational</span>
              </span>

              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white rounded-lg font-mono text-[11px]"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
