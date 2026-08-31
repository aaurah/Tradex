import React, { useState } from 'react';
import { WalletProvider } from './context/WalletContext';
import { Navbar, NavTabType } from './components/Navbar';
import { OrahDexLanding } from './components/OrahDexLanding';
import { OrahTradeTerminal } from './components/OrahTradeTerminal';
import { PerpTerminal } from './components/PerpTerminal';
import { PredictTerminal } from './components/PredictTerminal';
import { AIAgentsTerminal } from './components/AIAgentsTerminal';
import { CopyVaults } from './components/CopyVaults';
import { InstantSwap } from './components/InstantSwap';
import { OrahStaking } from './components/OrahStaking';
import { P2PExchange } from './components/P2PExchange';
import { EscrowSettlementTerminal } from './components/EscrowSettlementTerminal';
import { MarketsDashboard } from './components/MarketsDashboard';
import { WalletModal } from './components/WalletModal';
import { Footer } from './components/Footer';
import { LiveSupportWidget } from './components/LiveSupportWidget';
import { AdminPanel } from './components/AdminPanel';
import { Coin } from './types/dex';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('exchange');
  const [selectedSwapCoin, setSelectedSwapCoin] = useState<Coin | null>(null);
  const [selectedTradePairSymbol, setSelectedTradePairSymbol] = useState<string | null>(null);

  const handleSelectCoinForSwap = (coin: Coin) => {
    setSelectedSwapCoin(coin);
    setActiveTab('swap');
  };

  const handleSelectPairForTrade = (pairSymbol: string) => {
    setSelectedTradePairSymbol(pairSymbol);
    setActiveTab('trade');
  };

  // If in dedicated admin mode, show the full Admin suite
  if (activeTab === 'admin') {
    return (
      <WalletProvider>
        <AdminPanel 
          onClose={() => setActiveTab('exchange')} 
          onBackToExchange={() => setActiveTab('exchange')} 
        />
      </WalletProvider>
    );
  }

  return (
    <WalletProvider>
      <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex flex-col selection:bg-[#00FF41] selection:text-black">
        
        {/* Navigation Header */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content View Switcher */}
        <main className="flex-1">
          {activeTab === 'exchange' && (
            <OrahDexLanding 
              onEnterExchange={() => setActiveTab('trade')} 
              onViewMarkets={() => setActiveTab('stats')}
              onSelectPair={(symbol) => {
                setSelectedTradePairSymbol(symbol);
                setActiveTab('trade');
              }}
            />
          )}

          {activeTab === 'swap' && (
            <InstantSwap 
              initialFromCoin={selectedSwapCoin}
            />
          )}
          
          {activeTab === 'trade' && (
            <OrahTradeTerminal 
              initialPairSymbol={selectedTradePairSymbol}
            />
          )}
          
          {activeTab === 'perps' && <PerpTerminal />}
          {activeTab === 'predict' && <PredictTerminal />}
          {activeTab === 'ai_agents' && <AIAgentsTerminal />}
          {activeTab === 'copy_vaults' && <CopyVaults />}
          {activeTab === 'staking' && <OrahStaking onGoToSwap={() => setActiveTab('swap')} />}
          {activeTab === 'p2p' && <P2PExchange />}
          {activeTab === 'settlement' && <EscrowSettlementTerminal />}
          {activeTab === 'stats' && (
            <MarketsDashboard 
              onSelectCoinForSwap={handleSelectCoinForSwap}
              onSelectPairForTrade={handleSelectPairForTrade}
            />
          )}
        </main>

        {/* Floating Green Support & AI Assistant Bubble (from screenshots) */}
        <LiveSupportWidget />

        {/* Web3 Multi-Chain Connect Wallet Modal (IMG_0272 & IMG_0273) */}
        <WalletModal />

        {/* Protocol Footer */}
        <Footer />

      </div>
    </WalletProvider>
  );
}
