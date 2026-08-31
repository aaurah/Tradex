import React from 'react';
import { TradexLogo } from './TradexLogo';
import { Zap, ShieldCheck, Github, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#222] bg-[#050505] text-[#888] py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <TradexLogo size="sm" showDomainBadge={true} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[#777]">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></span>
            <span className="font-mono text-white">Base • Solana • BSV Engine</span>
          </span>
          <span className="text-[#333]">•</span>
          <span className="font-mono text-[#00FF41]">0.01% Low Fee</span>
          <span className="text-[#333]">•</span>
          <span className="uppercase text-[10px] tracking-wider text-[#888]">Non-Custodial Multi-Chain Escrow</span>
        </div>

        <div className="text-[#666] text-[10px] font-mono text-center sm:text-right uppercase tracking-wider">
          Tradex.com • Phantom • MetaMask • Sensilet • LetsExchange API
        </div>

      </div>
    </footer>
  );
};

