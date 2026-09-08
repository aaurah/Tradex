import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { apiService, BASE_LETSEXCHANGE_COINS } from '../services/apiService';
import { Coin, SwapOrder, CoinCategory } from '../types/dex';
import { formatBsv, formatSats } from '../services/bsvCrypto';
import { CoinLogo } from './CoinLogo';
import { copyToClipboard } from '../utils/clipboard';
import confetti from 'canvas-confetti';
import { 
  ArrowDownUp, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  ChevronDown, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Search,
  Sparkles,
  Globe,
  Radio,
  Wallet
} from 'lucide-react';

interface InstantSwapProps {
  initialFromCoin?: Coin | null;
  initialToCoin?: Coin | null;
}

export const InstantSwap: React.FC<InstantSwapProps> = ({
  initialFromCoin,
  initialToCoin
}) => {
  const { account, isConnected, openWalletModal, updateBalance } = useWallet();

  const [coinsList, setCoinsList] = useState<Coin[]>(BASE_LETSEXCHANGE_COINS);
  const [apiSyncStatus, setApiSyncStatus] = useState({
    coinsCount: BASE_LETSEXCHANGE_COINS.length,
    lastSync: Date.now(),
    isSyncing: false,
    source: 'live_letsexchange_api'
  });

  const [fromCoin, setFromCoin] = useState<Coin>(() => initialFromCoin || BASE_LETSEXCHANGE_COINS[1]); // RON (Ronin)
  const [toCoin, setToCoin] = useState<Coin>(() => initialToCoin || BASE_LETSEXCHANGE_COINS[0]); // BSV

  useEffect(() => {
    if (initialFromCoin) setFromCoin(initialFromCoin);
    if (initialToCoin) setToCoin(initialToCoin);
  }, [initialFromCoin, initialToCoin]);
  const [amountFrom, setAmountFrom] = useState<string>('50');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [loadingRate, setLoadingRate] = useState<boolean>(false);
  const [rateData, setRateData] = useState<{
    amountTo: number;
    rate: number;
    minerFeeSats: number;
    networkFeeUsd: number;
    exchangeFeePercent: number;
    estimatedMinutes: number;
  } | null>(null);

  const [isFromCoinModalOpen, setIsFromCoinModalOpen] = useState<boolean>(false);
  const [isToCoinModalOpen, setIsToCoinModalOpen] = useState<boolean>(false);
  const [coinSearchQuery, setCoinSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [activeSwap, setActiveSwap] = useState<SwapOrder | null>(null);
  const [copiedDeposit, setCopiedDeposit] = useState<boolean>(false);
  const [recentSwaps, setRecentSwaps] = useState<SwapOrder[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSyncingLiveApi, setIsSyncingLiveApi] = useState<boolean>(false);

  // Sync coins from LetsExchange API on mount
  useEffect(() => {
    handleSyncLetsExchangeApi(false);
  }, []);

  const handleSyncLetsExchangeApi = async (force = true) => {
    setIsSyncingLiveApi(true);
    try {
      const res = await apiService.fetchLetsExchangeCoins(force);
      setCoinsList(res.coins);
      setApiSyncStatus({
        coinsCount: res.totalCount,
        lastSync: res.timestamp,
        isSyncing: false,
        source: res.source
      });
    } catch (e) {
      console.warn('LetsExchange sync error:', e);
    } finally {
      setIsSyncingLiveApi(false);
    }
  };

  // Sync recipient address based on destination coin network
  useEffect(() => {
    if (!account?.address) return;

    if (toCoin.symbol === 'BSV' && account.chainType === 'bsv') {
      setRecipientAddress(account.address);
    } else if ((toCoin.isRonin || toCoin.symbol === 'RON') && account.roninAddress) {
      setRecipientAddress(account.roninAddress);
    } else if (toCoin.isEVM && account.chainType === 'evm') {
      setRecipientAddress(account.address);
    } else if (toCoin.symbol === 'BSV') {
      setRecipientAddress(account.address);
    }
  }, [account, toCoin]);

  // Load stored swaps
  useEffect(() => {
    setRecentSwaps(apiService.getStoredSwaps());
  }, []);

  // Fetch Rate whenever pair or amount changes
  useEffect(() => {
    let isCancelled = false;
    const fetchRate = async () => {
      const parsed = parseFloat(amountFrom);
      if (isNaN(parsed) || parsed <= 0) {
        setRateData(null);
        return;
      }
      setLoadingRate(true);
      try {
        const res = await apiService.getRate(fromCoin.symbol, toCoin.symbol, parsed);
        if (!isCancelled) {
          setRateData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setLoadingRate(false);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 15000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [fromCoin, toCoin, amountFrom, coinsList]);

  // Flip from and to coins
  const handleFlipCoins = () => {
    const temp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(temp);
  };

  // Handle Initiating Swap
  const handleCreateSwap = async () => {
    const parsed = parseFloat(amountFrom);
    if (isNaN(parsed) || parsed <= 0) return;

    if (!recipientAddress.trim()) {
      if (toCoin.symbol === 'BSV' && account?.address) {
        setRecipientAddress(account.address);
      } else {
        alert('Please enter a valid recipient address for ' + toCoin.symbol);
        return;
      }
    }

    try {
      const order = await apiService.createSwap(
        fromCoin.symbol,
        toCoin.symbol,
        parsed,
        recipientAddress.trim() || account?.address || '1Hw5L7Ksm8vTq4vY2hK3xW6vYpX8sQ9aB1'
      );
      setActiveSwap(order);
      setRecentSwaps(apiService.getStoredSwaps());
    } catch (err: any) {
      alert(err.message || 'Error creating swap');
    }
  };

  // Progress Active Swap in Simulation
  const handleSimulateAdvance = async () => {
    if (!activeSwap) return;
    const updated = await apiService.advanceSwapStage(activeSwap.id);
    if (updated) {
      setActiveSwap({ ...updated });
      setRecentSwaps(apiService.getStoredSwaps());
      if (updated.status === 'completed') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (updated.toCoin.symbol === 'BSV') {
          updateBalance(updated.amountTo);
        }
      }
    }
  };

  const copyDepositAddress = async () => {
    if (!activeSwap?.depositAddress) return;
    await copyToClipboard(activeSwap.depositAddress);
    setCopiedDeposit(true);
    setTimeout(() => setCopiedDeposit(false), 2000);
  };

  const [customTokenSymbol, setCustomTokenSymbol] = useState('');
  const [customTokenName, setCustomTokenName] = useState('');
  const [customTokenContract, setCustomTokenContract] = useState('');
  const [customTokenNetwork, setCustomTokenNetwork] = useState('Ethereum (ERC-20)');
  const [isImportTabOpen, setIsImportTabOpen] = useState(false);

  const filteredCoins = coinsList.filter(c => {
    const matchQuery = 
      c.symbol.toLowerCase().includes(coinSearchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(coinSearchQuery.toLowerCase()) ||
      c.network.toLowerCase().includes(coinSearchQuery.toLowerCase()) ||
      (c.contractAddress && c.contractAddress.toLowerCase().includes(coinSearchQuery.toLowerCase()));
    
    if (!matchQuery) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'top100') return c.popular || (c.rank && c.rank <= 100);
    if (selectedCategory === 'gaming') return c.category === 'gaming' || c.isRonin || ['APE', 'A8', 'AXS', 'SLP', 'PIXEL', 'GALA', 'SAND', 'MANA', 'BEAM', 'IMX', 'SUPER', 'YGG', 'PRIME', 'NOT', 'HMSTR', 'CATI'].includes(c.symbol.toUpperCase());
    if (selectedCategory === 'solana') return c.isSolana || c.category === 'solana' || c.network.toLowerCase().includes('solana');
    if (selectedCategory === 'ronin') return c.isRonin || c.category === 'ronin' || c.network.toLowerCase().includes('ronin') || ['A8', 'AXS', 'SLP', 'PIXEL', 'RON', 'WRON', 'BANANA', 'BERRY'].includes(c.symbol.toUpperCase());
    if (selectedCategory === 'evm') return c.isEVM || c.category === 'evm' || c.network.toLowerCase().includes('erc-20') || c.network.toLowerCase().includes('bep-20') || c.network.toLowerCase().includes('base') || c.network.toLowerCase().includes('arbitrum');
    if ((selectedCategory as string) === 'bsv') return !!c.isBSV || c.symbol === 'BSV' || (c.category as string) === 'bsv';
    if (selectedCategory === 'layer1') return c.category === 'layer1';
    if (selectedCategory === 'stable') return c.category === 'stable' || c.symbol.startsWith('USD');
    if (selectedCategory === 'ai') return c.category === 'ai' || c.category === 'depin';
    if (selectedCategory === 'meme') return c.category === 'meme';
    if (selectedCategory === 'defi') return c.category === 'defi';
    if (selectedCategory === 'privacy') return c.category === 'privacy';
    if (selectedCategory === 'rwa') return c.category === 'rwa';
    return true;
  });

  const handleAddCustomToken = (targetModal: 'from' | 'to') => {
    if (!customTokenSymbol.trim() || !customTokenName.trim()) return;
    const newToken = apiService.addCustomToken({
      symbol: customTokenSymbol.trim().toUpperCase(),
      name: customTokenName.trim(),
      contractAddress: customTokenContract.trim(),
      network: customTokenNetwork,
      networkCode: customTokenNetwork.toLowerCase().includes('solana') ? 'sol' : 'eth',
      isEVM: !customTokenNetwork.toLowerCase().includes('solana')
    });
    setCoinsList(prev => [newToken, ...prev.filter(c => c.symbol !== newToken.symbol)]);
    if (targetModal === 'from') {
      setFromCoin(newToken);
      setIsFromCoinModalOpen(false);
    } else {
      setToCoin(newToken);
      setIsToCoinModalOpen(false);
    }
    setCustomTokenSymbol('');
    setCustomTokenName('');
    setCustomTokenContract('');
    setIsImportTabOpen(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 font-mono">
      
      {/* LetsExchange Live API Sync & 22M+ Markets Ribbon */}
      <div className="mb-3 p-3 rounded-sm bg-[#111] border border-[#222] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF41] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF41]"></span>
          </div>
          <div>
            <div className="text-white text-xs font-bold flex items-center space-x-1.5">
              <span>LetsExchange 22M+ Omni-Market Engine</span>
              <span className="bg-[#00FF41]/20 text-[#00FF41] text-[10px] px-1.5 py-0.2 rounded border border-[#00FF41]/40 font-mono">
                22,094,700 Pairs
              </span>
            </div>
            <div className="text-[#777] text-[10px] font-mono mt-0.5">
              {coinsList.length} Native/Cross-Chain Assets Loaded • 50+ Blockchains Synced
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleSyncLetsExchangeApi(true)}
            disabled={isSyncingLiveApi}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-sm bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-[10px] text-white font-bold uppercase transition-all"
            title="Re-fetch coin catalogue from LetsExchange API"
          >
            <RefreshCw className={`w-3 h-3 text-[#00FF41] ${isSyncingLiveApi ? 'animate-spin' : ''}`} />
            <span>{isSyncingLiveApi ? 'Importing 22M+...' : 'Sync Catalog'}</span>
          </button>
        </div>
      </div>

      {/* Swap Card */}
      <div className="relative rounded-sm bg-[#0A0A0A] border border-[#222] shadow-2xl p-6 sm:p-8 text-[#E0E0E0]">
        
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#222] mb-6">
          <div>
            <div className="text-[10px] font-mono text-[#00FF41] uppercase tracking-[0.25em] font-bold flex items-center space-x-2">
              <span>LetsExchange.io API • On-Chain Settlement</span>
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 tracking-normal text-[9px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
                <span>24/7 ACTIVE</span>
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-white mt-1">
              Cross-Chain Swap
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#222] text-[#CCC] border border-[#333] transition-colors font-mono"
            >
              History ({recentSwaps.length})
            </button>
          </div>
        </div>

        {/* Swap Form */}
        <div className="space-y-4">
          
          {/* YOU SEND BOX */}
          <div className="p-4 sm:p-5 rounded-sm bg-[#111] border border-[#222] hover:border-[#333] transition-colors">
            <div className="flex justify-between items-center text-xs text-[#777] font-mono uppercase tracking-wider mb-2">
              <span className="font-bold">You Send ({fromCoin.network})</span>
              <span className="text-[#AAA]">1 {fromCoin.symbol} ≈ ${(fromCoin.priceUsd).toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="swap-amount-from-input"
                type="number"
                value={amountFrom}
                onChange={(e) => setAmountFrom(e.target.value)}
                placeholder="0.0"
                min="0"
                step="any"
                className="w-full bg-transparent text-3xl sm:text-4xl font-black font-mono text-white focus:outline-none placeholder-[#333]"
              />

              <button
                type="button"
                onClick={() => { setCoinSearchQuery(''); setSelectedCategory('all'); setIsFromCoinModalOpen(true); }}
                className="flex items-center space-x-2.5 px-3.5 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#242424] border border-[#333] text-white font-bold text-sm transition-colors shrink-0"
              >
                <CoinLogo symbol={fromCoin.symbol} name={fromCoin.name} icon={fromCoin.icon} logoUrl={fromCoin.logoUrl} size="md" />
                <div className="text-left">
                  <div className="font-black tracking-tight leading-none">{fromCoin.symbol}</div>
                  <div className="text-[9px] text-[#666] font-normal uppercase leading-tight truncate max-w-[80px]">
                    {fromCoin.networkCode || fromCoin.network}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#666] ml-1" />
              </button>
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#1a1a1a] text-[11px] text-[#666] font-mono">
              <span>≈ ${((parseFloat(amountFrom) || 0) * fromCoin.priceUsd).toFixed(2)} USD</span>
              <span>Min: {fromCoin.minAmount} {fromCoin.symbol}</span>
            </div>
          </div>

          {/* FLIP BUTTON */}
          <div className="relative flex justify-center -my-2 z-10">
            <button
              id="swap-flip-coins-btn"
              type="button"
              onClick={handleFlipCoins}
              className="p-2.5 rounded-sm bg-[#050505] hover:bg-[#111] border border-[#333] hover:border-[#00FF41] text-white hover:text-[#00FF41] shadow-lg active:scale-95 transition-all"
              title="Switch Pairs"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>

          {/* YOU RECEIVE BOX */}
          <div className="p-4 sm:p-5 rounded-sm bg-[#111] border border-[#222] hover:border-[#333] transition-colors">
            <div className="flex justify-between items-center text-xs text-[#777] font-mono uppercase tracking-wider mb-2">
              <span className="font-bold">You Receive ({toCoin.network})</span>
              {loadingRate ? (
                <span className="flex items-center space-x-1 text-[#00FF41] text-[11px] font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Updating rate...</span>
                </span>
              ) : (
                <span className="text-[#AAA]">1 {toCoin.symbol} ≈ ${(toCoin.priceUsd).toLocaleString()}</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="swap-amount-to-input"
                type="text"
                readOnly
                value={rateData ? rateData.amountTo : '0.00'}
                placeholder="0.0"
                className="w-full bg-transparent text-3xl sm:text-4xl font-black font-mono text-[#00FF41] focus:outline-none placeholder-[#333]"
              />

              <button
                type="button"
                onClick={() => { setCoinSearchQuery(''); setSelectedCategory('all'); setIsToCoinModalOpen(true); }}
                className="flex items-center space-x-2.5 px-3.5 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#242424] border border-[#333] text-white font-bold text-sm transition-colors shrink-0"
              >
                <CoinLogo symbol={toCoin.symbol} name={toCoin.name} icon={toCoin.icon} logoUrl={toCoin.logoUrl} size="md" />
                <div className="text-left">
                  <div className="font-black tracking-tight leading-none">{toCoin.symbol}</div>
                  <div className="text-[9px] text-[#666] font-normal uppercase leading-tight truncate max-w-[80px]">
                    {toCoin.networkCode || toCoin.network}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#666] ml-1" />
              </button>
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#1a1a1a] text-[11px] text-[#666] font-mono">
              <span>≈ ${((rateData?.amountTo || 0) * toCoin.priceUsd).toFixed(2)} USD</span>
              <span>Rate: 1 {fromCoin.symbol} = {rateData?.rate || '...'} {toCoin.symbol}</span>
            </div>
          </div>

          {/* RECIPIENT ADDRESS INPUT WITH MULTI-CHAIN WALLET HELPER */}
          <div className="p-4 rounded-sm bg-[#111] border border-[#222]">
            <div className="flex justify-between items-center text-xs text-[#777] font-mono uppercase tracking-wider mb-2">
              <span>Recipient {toCoin.symbol} Address</span>
              
              {account && (
                <div className="flex items-center space-x-2">
                  {toCoin.symbol === 'BSV' && (
                    <button
                      onClick={() => setRecipientAddress(account.address)}
                      className="text-[#00FF41] text-[10px] font-bold uppercase tracking-wider hover:underline"
                    >
                      Use Connected BSV Address
                    </button>
                  )}

                  {(toCoin.isRonin || toCoin.symbol === 'RON' || toCoin.symbol === 'AXS' || toCoin.symbol === 'SLP') && account.roninAddress && (
                    <button
                      onClick={() => setRecipientAddress(account.roninAddress || 'ronin:d9f8c47b59e381048f72c695a28cb20d43a19bc8')}
                      className="text-[#00FF41] text-[10px] font-bold uppercase tracking-wider hover:underline"
                    >
                      Use Ronin Connect Address
                    </button>
                  )}

                  {toCoin.isEVM && account.chainType === 'evm' && (
                    <button
                      onClick={() => setRecipientAddress(account.address)}
                      className="text-[#00FF41] text-[10px] font-bold uppercase tracking-wider hover:underline"
                    >
                      Use EVM Connect Address
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <input
              id="swap-recipient-address-input"
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder={
                toCoin.isRonin || toCoin.symbol === 'RON' 
                  ? 'ronin:...' 
                  : toCoin.isEVM 
                  ? '0x...' 
                  : `Enter destination ${toCoin.symbol} address`
              }
              className="w-full px-3.5 py-2.5 bg-[#050505] border border-[#333] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#00FF41] transition-colors"
            />
          </div>

          {/* RATE & FEE ACCORDION */}
          {rateData && (
            <div className="p-4 rounded-sm bg-[#0E0E0E] border border-[#222] text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[#777]">
                <span className="uppercase text-[10px] tracking-wider font-bold">Exchange Fee (LetsExchange)</span>
                <span className="text-white font-bold">{rateData.exchangeFeePercent}%</span>
              </div>
              <div className="flex justify-between text-[#777]">
                <span className="uppercase text-[10px] tracking-wider font-bold">On-Chain Network Fee</span>
                <span className="text-[#00FF41] font-bold">
                  {toCoin.symbol === 'BSV' 
                    ? `${formatSats(rateData.minerFeeSats)} (~$0.0001)` 
                    : `$${rateData.networkFeeUsd.toFixed(4)} USD`}
                </span>
              </div>
              <div className="flex justify-between text-[#777]">
                <span className="uppercase text-[10px] tracking-wider font-bold">Est. Settlement</span>
                <span className="text-white font-bold flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-[#00FF41]" />
                  <span>~{rateData.estimatedMinutes} mins</span>
                </span>
              </div>
            </div>
          )}

          {/* ACTION BUTTON */}
          <div className="pt-2">
            <button
              id="execute-instant-swap-btn"
              onClick={handleCreateSwap}
              disabled={loadingRate || !rateData || rateData.amountTo <= 0}
              className="w-full py-4 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_25px_rgba(0,255,65,0.4)] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Execute Swap: {fromCoin.symbol} → {toCoin.symbol}</span>
            </button>
          </div>

        </div>

      </div>

      {/* RECENT SWAPS DRAWER */}
      {isHistoryOpen && (
        <div className="mt-4 rounded-sm bg-[#0A0A0A] border border-[#222] p-5 animate-in fade-in">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#222]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white font-mono">Recent Activity</h3>
            <button 
              onClick={() => setIsHistoryOpen(false)}
              className="text-xs font-mono text-[#777] hover:text-white uppercase"
            >
              [Close]
            </button>
          </div>

          {recentSwaps.length === 0 ? (
            <p className="text-xs text-[#555] py-4 text-center font-mono">No swaps executed yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {recentSwaps.map((sw) => (
                <div 
                  key={sw.id}
                  onClick={() => setActiveSwap(sw)}
                  className="p-3 rounded-sm bg-[#111] border border-[#222] hover:border-[#00FF41] cursor-pointer transition-all flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <CoinLogo symbol={sw.fromCoin.symbol} name={sw.fromCoin.name} icon={sw.fromCoin.icon} logoUrl={sw.fromCoin.logoUrl} size="xs" />
                      <span>{sw.amountFrom} {sw.fromCoin.symbol}</span>
                      <span className="text-[#00FF41]">→</span>
                      <CoinLogo symbol={sw.toCoin.symbol} name={sw.toCoin.name} icon={sw.toCoin.icon} logoUrl={sw.toCoin.logoUrl} size="xs" />
                      <span>{sw.amountTo} {sw.toCoin.symbol}</span>
                    </div>
                    <div className="text-[10px] text-[#555] mt-0.5">
                      ID: {sw.id} • {new Date(sw.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider ${
                    sw.status === 'completed' ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40' :
                    sw.status === 'awaiting_deposit' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {sw.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE SWAP TRACKER MODAL / OVERLAY */}
      {activeSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-sm bg-[#0A0A0A] border border-[#333] shadow-2xl p-6 sm:p-8 text-[#E0E0E0]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#222]">
              <div>
                <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-widest font-bold">On-Chain Swap Monitor</span>
                <h3 className="text-xl font-black uppercase text-white tracking-tight mt-0.5">Settlement In Progress</h3>
                <p className="text-[11px] font-mono text-[#666]">Order: {activeSwap.id}</p>
              </div>

              <button
                onClick={() => setActiveSwap(null)}
                className="text-xs font-mono uppercase px-3 py-1.5 rounded-sm bg-[#141414] hover:bg-[#222] text-[#AAA] border border-[#333]"
              >
                Close
              </button>
            </div>

            {/* Stages Progress Indicator */}
            <div className="mt-5 p-3 rounded-sm bg-[#111] border border-[#222]">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider">
                
                <div className={`p-2 rounded-sm border ${
                  activeSwap.status === 'awaiting_deposit' 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                    : 'bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41]'
                }`}>
                  1. Deposit
                </div>

                <div className={`p-2 rounded-sm border ${
                  activeSwap.status === 'confirming'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                    : ['exchanging', 'broadcasting_tx', 'completed'].includes(activeSwap.status)
                    ? 'bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41]'
                    : 'bg-[#050505] border-[#222] text-[#555]'
                }`}>
                  2. Confirm
                </div>

                <div className={`p-2 rounded-sm border ${
                  activeSwap.status === 'exchanging'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                    : ['broadcasting_tx', 'completed'].includes(activeSwap.status)
                    ? 'bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41]'
                    : 'bg-[#050505] border-[#222] text-[#555]'
                }`}>
                  3. Exchange
                </div>

                <div className={`p-2 rounded-sm border ${
                  activeSwap.status === 'completed'
                    ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]'
                    : activeSwap.status === 'broadcasting_tx'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                    : 'bg-[#050505] border-[#222] text-[#555]'
                }`}>
                  4. Settle
                </div>

              </div>
            </div>

            {/* Deposit Box */}
            {activeSwap.status === 'awaiting_deposit' && (
              <div className="mt-5 space-y-4">
                <div className="p-3.5 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono">
                  <div className="font-bold flex items-center space-x-1.5 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Send exactly {activeSwap.amountFrom} {activeSwap.fromCoin.symbol}</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80">
                    Send to the dedicated pool address below. Automatic exchange to {activeSwap.toCoin.symbol} with native on-chain BSV broadcast.
                  </p>
                </div>

                {/* Address + QR representation */}
                <div className="p-4 rounded-sm bg-[#111] border border-[#222] text-center">
                  <div className="w-28 h-28 mx-auto bg-white rounded-sm p-2 flex items-center justify-center shadow-md mb-3">
                    <div className="w-full h-full border border-dashed border-black flex flex-col items-center justify-center text-black font-mono text-[9px]">
                      <QrCode className="w-14 h-14 text-black" />
                      <span className="font-bold">{activeSwap.fromCoin.symbol} QR</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#777] uppercase tracking-wider mb-1">
                    Deposit Address ({activeSwap.fromCoin.network}):
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs text-[#00FF41] bg-[#050505] p-2.5 rounded-sm border border-[#333]">
                    <span className="truncate mr-2 text-[11px]">{activeSwap.depositAddress}</span>
                    <button
                      onClick={copyDepositAddress}
                      className="p-1.5 bg-[#1a1a1a] hover:bg-[#222] text-white rounded-sm transition-colors shrink-0"
                    >
                      {copiedDeposit ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Completed Screen */}
            {activeSwap.status === 'completed' && (
              <div className="mt-5 text-center p-5 rounded-sm bg-[#00FF41]/10 border border-[#00FF41]/30 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#00FF41]/20 text-[#00FF41] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase text-white tracking-tight">Swap Settled On-Chain!</h4>
                  <p className="text-xs text-[#AAA] mt-1 font-mono">
                    Sent <span className="text-white font-bold">{activeSwap.amountTo} {activeSwap.toCoin.symbol}</span> to {activeSwap.recipientAddress.slice(0, 10)}...
                  </p>
                </div>

                {activeSwap.bsvTxId && (
                  <div className="p-2.5 rounded-sm bg-[#050505] border border-[#222] font-mono text-[11px] text-[#AAA] flex items-center justify-between">
                    <span className="text-[#666]">BSV TxID:</span>
                    <span className="truncate mx-2 text-[#00FF41]">{activeSwap.bsvTxId}</span>
                    <span className="text-[#00FF41] font-bold">1 Conf</span>
                  </div>
                )}

                {activeSwap.roninTxHash && (
                  <div className="p-2.5 rounded-sm bg-[#050505] border border-[#222] font-mono text-[11px] text-[#AAA] flex items-center justify-between">
                    <span className="text-[#666]">Ronin Hash:</span>
                    <span className="truncate mx-2 text-[#00FF41]">{activeSwap.roninTxHash}</span>
                    <span className="text-[#00FF41] font-bold">Success</span>
                  </div>
                )}
              </div>
            )}

            {/* Simulation Controller Action */}
            <div className="mt-6 pt-4 border-t border-[#222] flex items-center justify-between font-mono">
              <div className="text-[11px] text-[#777]">
                Status: <span className="text-[#00FF41] font-bold uppercase">{activeSwap.status}</span>
              </div>

              {activeSwap.status !== 'completed' && (
                <button
                  id="simulate-swap-step-btn"
                  onClick={handleSimulateAdvance}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-wider transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Advance Step</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* COIN SELECTOR MODAL (FROM) */}
      {isFromCoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-sm bg-[#0A0A0A] border border-[#333] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#222]">
              <div>
                <h3 className="font-black uppercase tracking-tight text-base text-white">Select Asset to Send</h3>
                <p className="text-[10px] text-[#777]">LetsExchange 22M+ Markets Catalog ({coinsList.length} Coins Loaded)</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsImportTabOpen(!isImportTabOpen)}
                  className={`text-[10px] uppercase font-mono px-2 py-1 rounded-sm border ${
                    isImportTabOpen ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'bg-[#151515] text-[#AAA] border-[#333] hover:text-white'
                  }`}
                >
                  + Import Token
                </button>
                <button onClick={() => { setIsFromCoinModalOpen(false); setIsImportTabOpen(false); }} className="text-[#777] hover:text-white font-mono">✕</button>
              </div>
            </div>
            
            {isImportTabOpen ? (
              <div className="p-4 bg-[#111] border border-[#222] rounded-sm space-y-3 font-mono text-xs mb-3">
                <div className="text-[11px] text-[#00FF41] font-bold uppercase">Import Custom Contract / Token</div>
                <div>
                  <label className="text-[10px] text-[#777] uppercase block mb-1">Token Symbol</label>
                  <input
                    type="text"
                    value={customTokenSymbol}
                    onChange={(e) => setCustomTokenSymbol(e.target.value)}
                    placeholder="e.g. PEPE2, MYTOKEN"
                    className="w-full px-3 py-1.5 bg-[#050505] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#777] uppercase block mb-1">Token Name</label>
                  <input
                    type="text"
                    value={customTokenName}
                    onChange={(e) => setCustomTokenName(e.target.value)}
                    placeholder="e.g. Pepe Version 2"
                    className="w-full px-3 py-1.5 bg-[#050505] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#777] uppercase block mb-1">Contract Address / Mint</label>
                  <input
                    type="text"
                    value={customTokenContract}
                    onChange={(e) => setCustomTokenContract(e.target.value)}
                    placeholder="0x... or Solana Mint Address"
                    className="w-full px-3 py-1.5 bg-[#050505] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#777] uppercase block mb-1">Network</label>
                  <select
                    value={customTokenNetwork}
                    onChange={(e) => setCustomTokenNetwork(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#050505] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  >
                    <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
                    <option value="BNB Smart Chain (BEP-20)">BNB Smart Chain (BEP-20)</option>
                    <option value="Base Network">Base Network</option>
                    <option value="Solana SPL">Solana SPL</option>
                    <option value="Polygon PoS">Polygon PoS</option>
                    <option value="Arbitrum One">Arbitrum One</option>
                    <option value="Ronin Chain">Ronin Chain</option>
                  </select>
                </div>
                <button
                  onClick={() => handleAddCustomToken('from')}
                  className="w-full py-2 bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs rounded-sm transition-colors mt-2"
                >
                  Add & Select For Swap
                </button>
              </div>
            ) : (
              <>
                {/* Category Filter Pills */}
                <div className="flex items-center space-x-1 overflow-x-auto py-1 mb-3 scrollbar-none text-[10px] font-bold uppercase">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'top100', label: '🏆 Top 100' },
                    { id: 'gaming', label: '🎮 Gaming/NFT' },
                    { id: 'solana', label: '☀️ Solana' },
                    { id: 'ronin', label: '⚔️ Ronin' },
                    { id: 'evm', label: '⟠ EVM' },
                    { id: 'bsv', label: '⚡ BSV' },
                    { id: 'layer1', label: 'Layer 1' },
                    { id: 'stable', label: '💵 Stables' },
                    { id: 'ai', label: '🤖 AI' },
                    { id: 'meme', label: '🐶 Meme' },
                    { id: 'defi', label: '🦄 DeFi' },
                    { id: 'privacy', label: '🔒 Privacy' },
                    { id: 'rwa', label: '🏛️ RWA' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-sm whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-white text-black font-black'
                          : 'bg-[#151515] text-[#888] hover:text-white border border-[#222]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-[#555] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={coinSearchQuery}
                    onChange={(e) => setCoinSearchQuery(e.target.value)}
                    placeholder="Search 4,700+ coins by symbol, name, or network..."
                    className="w-full pl-9 pr-3 py-2 bg-[#111] border border-[#222] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 pr-1 font-mono">
                  {filteredCoins.map((coin, idx) => (
                    <button
                      key={`from_${coin.symbol}_${coin.networkCode || coin.network || idx}_${idx}`}
                      onClick={() => {
                        setFromCoin(coin);
                        setIsFromCoinModalOpen(false);
                      }}
                      className={`w-full p-3 rounded-sm flex items-center justify-between text-left hover:bg-[#141414] transition-colors border border-transparent ${
                        fromCoin.symbol === coin.symbol ? 'bg-[#111] border-[#00FF41]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <CoinLogo symbol={coin.symbol} name={coin.name} icon={coin.icon} logoUrl={coin.logoUrl} size="md" />
                        <div>
                          <div className="font-bold text-sm text-white flex items-center space-x-1.5">
                            <span>{coin.symbol}</span>
                            {coin.rank && (
                              <span className="text-[9px] text-[#777] font-normal">#{coin.rank}</span>
                            )}
                            {coin.isRonin && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded border border-blue-500/30">Ronin</span>
                            )}
                            {coin.isSolana && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/30">Solana</span>
                            )}
                            {coin.isEVM && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1 py-0.2 rounded border border-purple-500/30">EVM</span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#666] uppercase">{coin.name} • {coin.network}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs text-[#AAA]">
                        <div>${coin.priceUsd.toLocaleString()}</div>
                        {coin.change24h != null && (
                          <div className={`text-[10px] ${coin.change24h >= 0 ? 'text-[#00FF41]' : 'text-rose-400'}`}>
                            {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* COIN SELECTOR MODAL (TO) */}
      {isToCoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-sm bg-[#0A0A0A] border border-[#333] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#222]">
              <div>
                <h3 className="font-black uppercase tracking-tight text-base text-white">Select Asset to Receive</h3>
                <p className="text-[10px] text-[#777]">LetsExchange 22M+ Markets Catalog ({coinsList.length} Coins Loaded)</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsImportTabOpen(!isImportTabOpen)}
                  className={`text-[10px] uppercase font-mono px-2 py-1 rounded-sm border ${
                    isImportTabOpen ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'bg-[#151515] text-[#AAA] border-[#333] hover:text-white'
                  }`}
                >
                  + Import Token
                </button>
                <button onClick={() => { setIsToCoinModalOpen(false); setIsImportTabOpen(false); }} className="text-[#777] hover:text-white font-mono">✕</button>
              </div>
            </div>
            
            {isImportTabOpen ? (
              <div className="p-4 bg-[#111] border border-[#222] rounded-sm space-y-3 font-mono text-xs mb-3">
                <div className="text-[11px] text-[#00FF41] font-bold uppercase">Import Custom Contract / Token</div>
                <div>
                  <label className="text-[10px] text-[#777] uppercase block mb-1">Token Symbol</label>
                  <input
                    type="text"
                    value={customTokenSymbol}
                    onChange={(e) => setCustomTokenSymbol(e.target.value)}
                    placeholder="e.g. PEPE2, MYTOKEN"
                    className="w-full px-3 py-1.5 bg-[#050505] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#777] uppercase block mb-1">Token Name</label>
                  <input
                    type="text"
                    value={customTokenName}
                    onChange={(e) => setCustomTokenName(e.target.value)}
                    placeholder="e.g. Pepe Version 2"
                    className="w-full px-3 py-1.5 bg-[#050505] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#777] uppercase block mb-1">Contract Address / Mint</label>
                  <input
                    type="text"
                    value={customTokenContract}
                    onChange={(e) => setCustomTokenContract(e.target.value)}
                    placeholder="0x... or Solana Mint Address"
                    className="w-full px-3 py-1.5 bg-[#050505] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#777] uppercase block mb-1">Network</label>
                  <select
                    value={customTokenNetwork}
                    onChange={(e) => setCustomTokenNetwork(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#050505] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                  >
                    <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
                    <option value="BNB Smart Chain (BEP-20)">BNB Smart Chain (BEP-20)</option>
                    <option value="Base Network">Base Network</option>
                    <option value="Solana SPL">Solana SPL</option>
                    <option value="Polygon PoS">Polygon PoS</option>
                    <option value="Arbitrum One">Arbitrum One</option>
                    <option value="Ronin Chain">Ronin Chain</option>
                  </select>
                </div>
                <button
                  onClick={() => handleAddCustomToken('to')}
                  className="w-full py-2 bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs rounded-sm transition-colors mt-2"
                >
                  Add & Select For Swap
                </button>
              </div>
            ) : (
              <>
                {/* Category Filter Pills */}
                <div className="flex items-center space-x-1 overflow-x-auto py-1 mb-3 scrollbar-none text-[10px] font-bold uppercase">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'top100', label: '🏆 Top 100' },
                    { id: 'gaming', label: '🎮 Gaming/NFT' },
                    { id: 'solana', label: '☀️ Solana' },
                    { id: 'ronin', label: '⚔️ Ronin' },
                    { id: 'evm', label: '⟠ EVM' },
                    { id: 'bsv', label: '⚡ BSV' },
                    { id: 'layer1', label: 'Layer 1' },
                    { id: 'stable', label: '💵 Stables' },
                    { id: 'ai', label: '🤖 AI' },
                    { id: 'meme', label: '🐶 Meme' },
                    { id: 'defi', label: '🦄 DeFi' },
                    { id: 'privacy', label: '🔒 Privacy' },
                    { id: 'rwa', label: '🏛️ RWA' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-sm whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-white text-black font-black'
                          : 'bg-[#151515] text-[#888] hover:text-white border border-[#222]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-[#555] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={coinSearchQuery}
                    onChange={(e) => setCoinSearchQuery(e.target.value)}
                    placeholder="Search 4,700+ coins by symbol, name, or network..."
                    className="w-full pl-9 pr-3 py-2 bg-[#111] border border-[#222] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 pr-1 font-mono">
                  {filteredCoins.map((coin, idx) => (
                    <button
                      key={`to_${coin.symbol}_${coin.networkCode || coin.network || idx}_${idx}`}
                      onClick={() => {
                        setToCoin(coin);
                        setIsToCoinModalOpen(false);
                      }}
                      className={`w-full p-3 rounded-sm flex items-center justify-between text-left hover:bg-[#141414] transition-colors border border-transparent ${
                        toCoin.symbol === coin.symbol ? 'bg-[#111] border-[#00FF41]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <CoinLogo symbol={coin.symbol} name={coin.name} icon={coin.icon} logoUrl={coin.logoUrl} size="md" />
                        <div>
                          <div className="font-bold text-sm text-white flex items-center space-x-1.5">
                            <span>{coin.symbol}</span>
                            {coin.rank && (
                              <span className="text-[9px] text-[#777] font-normal">#{coin.rank}</span>
                            )}
                            {coin.isRonin && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded border border-blue-500/30">Ronin</span>
                            )}
                            {coin.isSolana && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/30">Solana</span>
                            )}
                            {coin.isEVM && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1 py-0.2 rounded border border-purple-500/30">EVM</span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#666] uppercase">{coin.name} • {coin.network}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs text-[#AAA]">
                        <div>${coin.priceUsd.toLocaleString()}</div>
                        {coin.change24h != null && (
                          <div className={`text-[10px] ${coin.change24h >= 0 ? 'text-[#00FF41]' : 'text-rose-400'}`}>
                            {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
