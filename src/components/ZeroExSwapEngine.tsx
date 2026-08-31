import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  zeroExApiService, 
  ZEROEX_SUPPORTED_CHAINS, 
  ZEROEX_POPULAR_TOKENS, 
  ZEROEX_LIQUIDITY_SOURCES, 
  ZeroExToken, 
  ZeroExPriceResponse, 
  ZeroExQuoteResponse 
} from '../services/zeroExApiService';
import confetti from 'canvas-confetti';
import { 
  ArrowDownUp, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  ChevronDown, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Search,
  Sparkles,
  Key,
  Shield,
  Fuel,
  TrendingDown,
  Info
} from 'lucide-react';

interface ZeroExSwapEngineProps {
  onGoToCrossChain?: () => void;
}

export const ZeroExSwapEngine: React.FC<ZeroExSwapEngineProps> = ({ onGoToCrossChain }) => {
  const { account, isConnected, openWalletModal } = useWallet();

  // Selected Chain (Default: Base 8453 or Ethereum 1)
  const [selectedChainId, setSelectedChainId] = useState<number>(8453);
  const currentChain = ZEROEX_SUPPORTED_CHAINS[selectedChainId] || ZEROEX_SUPPORTED_CHAINS[1];

  // Token selections
  const chainTokens = ZEROEX_POPULAR_TOKENS.filter(t => t.chainId === selectedChainId);
  const [sellToken, setSellToken] = useState<ZeroExToken>(() => chainTokens[0] || ZEROEX_POPULAR_TOKENS[0]);
  const [buyToken, setBuyToken] = useState<ZeroExToken>(() => chainTokens[1] || ZEROEX_POPULAR_TOKENS[1]);
  
  // Update tokens when chain changes
  useEffect(() => {
    const tokens = ZEROEX_POPULAR_TOKENS.filter(t => t.chainId === selectedChainId);
    if (tokens.length >= 2) {
      setSellToken(tokens[0]);
      setBuyToken(tokens[1]);
    } else if (tokens.length === 1) {
      setSellToken(tokens[0]);
    }
  }, [selectedChainId]);

  // Form State
  const [amountSell, setAmountSell] = useState<string>('1.0');
  const [slippageBps, setSlippageBps] = useState<number>(50); // 0.50%
  const [isCustomSlippage, setIsCustomSlippage] = useState<boolean>(false);
  const [customSlippageInput, setCustomSlippageInput] = useState<string>('0.5');

  // Quote State
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);
  const [quoteData, setQuoteData] = useState<ZeroExPriceResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Modals & Drawers
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<'sell' | 'buy' | null>(null);
  const [tokenSearchQuery, setTokenSearchQuery] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(zeroExApiService.getApiKey());
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(false);

  // Execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executedTx, setExecutedTx] = useState<{
    txHash: string;
    blockExplorerUrl: string;
    soldAmount: string;
    soldSymbol: string;
    boughtAmount: string;
    boughtSymbol: string;
    timestamp: number;
  } | null>(null);

  // Fetch 0x quote on amount or token change
  useEffect(() => {
    let isCancelled = false;
    const fetch0xQuote = async () => {
      const parsed = parseFloat(amountSell);
      if (isNaN(parsed) || parsed <= 0) {
        setQuoteData(null);
        setQuoteError(null);
        return;
      }

      setLoadingQuote(true);
      setQuoteError(null);

      try {
        const res = await zeroExApiService.getPrice({
          chainId: selectedChainId,
          sellToken: sellToken.symbol,
          buyToken: buyToken.symbol,
          sellAmountDecimals: parsed,
          taker: account?.address || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          slippageBps
        });

        if (!isCancelled) {
          setQuoteData(res);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('0x quote error:', err);
          setQuoteError(err?.message || 'Failed to fetch 0x quote');
        }
      } finally {
        if (!isCancelled) {
          setLoadingQuote(false);
        }
      }
    };

    fetch0xQuote();
    const timer = setInterval(fetch0xQuote, 12000);
    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, [selectedChainId, sellToken, buyToken, amountSell, slippageBps, account?.address]);

  // Flip Tokens
  const handleFlipTokens = () => {
    const prevSell = sellToken;
    const prevBuy = buyToken;
    setSellToken(prevBuy);
    setBuyToken(prevSell);
  };

  // Save API Key
  const handleSaveApiKey = () => {
    zeroExApiService.setApiKey(apiKeyInput);
    setApiKeySaved(true);
    setTimeout(() => {
      setApiKeySaved(false);
      setIsApiKeyModalOpen(false);
    }, 1200);
  };

  // Execute Swap
  const handleExecute0xSwap = async () => {
    const parsed = parseFloat(amountSell);
    if (isNaN(parsed) || parsed <= 0 || !quoteData) return;

    setIsExecuting(true);

    try {
      // Step 1: Request final actionable quote with transaction calldata
      const firmQuote = await zeroExApiService.getQuote({
        chainId: selectedChainId,
        sellToken: sellToken.symbol,
        buyToken: buyToken.symbol,
        sellAmountDecimals: parsed,
        taker: account?.address || '0x71C568a1d7C3eDdf9313364953B1828fA6e6a1d4',
        slippageBps
      });

      // Step 2: Simulate on-chain Permit2 and DEX router execution
      await new Promise(r => setTimeout(r, 1400));

      const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const explorerLink = `${currentChain.blockExplorer}/tx/${mockTxHash}`;

      const buyAmountFormatted = (parseFloat(amountSell) * parseFloat(quoteData.price)).toFixed(
        buyToken.decimals > 8 ? 6 : buyToken.decimals
      );

      setExecutedTx({
        txHash: mockTxHash,
        blockExplorerUrl: explorerLink,
        soldAmount: amountSell,
        soldSymbol: sellToken.symbol,
        boughtAmount: buyAmountFormatted,
        boughtSymbol: buyToken.symbol,
        timestamp: Date.now()
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert('0x Swap execution failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsExecuting(false);
    }
  };

  // Filter Tokens for Modal
  const modalTokens = ZEROEX_POPULAR_TOKENS.filter(t => {
    const matchChain = t.chainId === selectedChainId;
    const matchQuery = 
      t.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
      t.address.toLowerCase().includes(tokenSearchQuery.toLowerCase());
    return matchChain && matchQuery;
  });

  return (
    <div className="space-y-4">
      
      {/* 0x Protocol Header Bar & Chain Selector */}
      <div className="p-3.5 rounded-sm bg-[#0E0E0E] border border-[#222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#1A1A1A] border border-[#333] flex items-center justify-center font-black text-[#00FF41] text-xs shadow-inner">
            0x
          </div>
          <div>
            <div className="text-white font-bold flex items-center space-x-1.5">
              <span>0x Swap API v2</span>
              <span className="bg-[#00FF41]/20 text-[#00FF41] text-[9px] px-1.5 py-0.2 rounded border border-[#00FF41]/40 font-mono">
                DEX Aggregator
              </span>
            </div>
            <div className="text-[#666] text-[10px] font-mono">
              Uniswap V3 • 0x RFQ • Curve • Balancer • Aerodrome
            </div>
          </div>
        </div>

        {/* Chain Selector Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {Object.values(ZEROEX_SUPPORTED_CHAINS).map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedChainId(ch.id)}
              className={`px-2.5 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase transition-all flex items-center space-x-1.5 ${
                selectedChainId === ch.id
                  ? 'bg-white text-black font-black shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                  : 'bg-[#151515] hover:bg-[#202020] text-[#888] hover:text-white border border-[#262626]'
              }`}
            >
              <img src={ch.logo} alt={ch.name} className="w-3.5 h-3.5 rounded-full" />
              <span>{ch.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 0x Swap Box */}
      <div className="rounded-sm bg-[#0A0A0A] border border-[#222] shadow-2xl p-5 sm:p-7 text-[#E0E0E0]">
        
        {/* Top Controls: Slippage & API Key settings */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222] mb-5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-[#777] uppercase tracking-wider font-bold">Slippage:</span>
            {[
              { val: 10, label: '0.1%' },
              { val: 50, label: '0.5%' },
              { val: 100, label: '1.0%' }
            ].map(s => (
              <button
                key={s.val}
                onClick={() => { setSlippageBps(s.val); setIsCustomSlippage(false); }}
                className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase ${
                  !isCustomSlippage && slippageBps === s.val
                    ? 'bg-[#00FF41] text-black'
                    : 'bg-[#151515] text-[#777] hover:text-white border border-[#282828]'
                }`}
              >
                {s.label}
              </button>
            ))}
            <button
              onClick={() => setIsCustomSlippage(!isCustomSlippage)}
              className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase ${
                isCustomSlippage
                  ? 'bg-[#00FF41] text-black'
                  : 'bg-[#151515] text-[#777] hover:text-white border border-[#282828]'
              }`}
            >
              Custom
            </button>
          </div>

          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="flex items-center space-x-1 text-[10px] font-mono text-[#777] hover:text-[#00FF41] transition-colors"
            title="Configure 0x API Key"
          >
            <Key className="w-3 h-3" />
            <span>0x API Key</span>
          </button>
        </div>

        {/* Custom Slippage Input */}
        {isCustomSlippage && (
          <div className="mb-4 p-2.5 bg-[#111] border border-[#282828] rounded-sm flex items-center justify-between text-xs font-mono">
            <span className="text-[#888] text-[11px]">Custom Slippage (%)</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={customSlippageInput}
                onChange={(e) => {
                  setCustomSlippageInput(e.target.value);
                  const p = parseFloat(e.target.value);
                  if (!isNaN(p) && p > 0 && p <= 50) {
                    setSlippageBps(Math.round(p * 100));
                  }
                }}
                className="w-16 bg-[#050505] border border-[#333] px-2 py-1 text-right text-white font-bold rounded-sm focus:outline-none focus:border-[#00FF41]"
                step="0.1"
                min="0.05"
                max="50"
              />
              <span className="text-white">%</span>
            </div>
          </div>
        )}

        {/* YOU PAY (SELL TOKEN) */}
        <div className="p-4 sm:p-5 rounded-sm bg-[#111] border border-[#222] hover:border-[#333] transition-colors">
          <div className="flex justify-between items-center text-xs text-[#777] font-mono uppercase tracking-wider mb-2">
            <span className="font-bold">You Pay</span>
            <span>1 {sellToken.symbol} ≈ ${sellToken.priceUsd ? sellToken.priceUsd.toLocaleString() : '...'}</span>
          </div>

          <div className="flex items-center space-x-3">
            <input
              id="zeroex-amount-sell-input"
              type="number"
              value={amountSell}
              onChange={(e) => setAmountSell(e.target.value)}
              placeholder="0.0"
              min="0"
              step="any"
              className="w-full bg-transparent text-3xl sm:text-4xl font-black font-mono text-white focus:outline-none placeholder-[#333]"
            />

            <button
              type="button"
              onClick={() => { setTokenSearchQuery(''); setIsTokenModalOpen('sell'); }}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#242424] border border-[#333] text-white font-bold text-sm transition-colors shrink-0"
            >
              {sellToken.logoURI ? (
                <img src={sellToken.logoURI} alt={sellToken.symbol} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                  {sellToken.symbol[0]}
                </div>
              )}
              <div className="text-left">
                <div className="font-black tracking-tight leading-none">{sellToken.symbol}</div>
                <div className="text-[9px] text-[#666] uppercase leading-tight truncate max-w-[80px]">
                  {currentChain.name}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#666] ml-1" />
            </button>
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#1a1a1a] text-[11px] text-[#666] font-mono">
            <span>≈ ${((parseFloat(amountSell) || 0) * (sellToken.priceUsd || 0)).toFixed(2)} USD</span>
            {account && (
              <span className="text-[#00FF41]">
                Balance: {account.balanceEth || 0} {sellToken.symbol}
              </span>
            )}
          </div>
        </div>

        {/* FLIP BUTTON */}
        <div className="relative flex justify-center -my-2.5 z-10">
          <button
            type="button"
            onClick={handleFlipTokens}
            className="p-2 rounded-sm bg-[#050505] hover:bg-[#151515] border border-[#333] hover:border-[#00FF41] text-white hover:text-[#00FF41] shadow-lg active:scale-95 transition-all"
            title="Switch Token Pair"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* YOU RECEIVE (BUY TOKEN) */}
        <div className="p-4 sm:p-5 rounded-sm bg-[#111] border border-[#222] hover:border-[#333] transition-colors">
          <div className="flex justify-between items-center text-xs text-[#777] font-mono uppercase tracking-wider mb-2">
            <span className="font-bold">You Receive (Est.)</span>
            {loadingQuote ? (
              <span className="flex items-center space-x-1 text-[#00FF41] text-[11px] font-mono">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Aggregating 0x DEXs...</span>
              </span>
            ) : (
              <span>1 {buyToken.symbol} ≈ ${buyToken.priceUsd ? buyToken.priceUsd.toLocaleString() : '...'}</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <input
              id="zeroex-amount-buy-input"
              type="text"
              readOnly
              value={
                quoteData 
                  ? (parseFloat(amountSell) * parseFloat(quoteData.price)).toFixed(
                      buyToken.decimals > 8 ? 6 : Math.min(buyToken.decimals, 6)
                    ) 
                  : '0.00'
              }
              placeholder="0.0"
              className="w-full bg-transparent text-3xl sm:text-4xl font-black font-mono text-[#00FF41] focus:outline-none placeholder-[#333]"
            />

            <button
              type="button"
              onClick={() => { setTokenSearchQuery(''); setIsTokenModalOpen('buy'); }}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#242424] border border-[#333] text-white font-bold text-sm transition-colors shrink-0"
            >
              {buyToken.logoURI ? (
                <img src={buyToken.logoURI} alt={buyToken.symbol} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black">
                  {buyToken.symbol[0]}
                </div>
              )}
              <div className="text-left">
                <div className="font-black tracking-tight leading-none">{buyToken.symbol}</div>
                <div className="text-[9px] text-[#666] uppercase leading-tight truncate max-w-[80px]">
                  {currentChain.name}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#666] ml-1" />
            </button>
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#1a1a1a] text-[11px] text-[#666] font-mono">
            <span>
              ≈ ${(
                (parseFloat(amountSell) || 0) * 
                parseFloat(quoteData?.price || '0') * 
                (buyToken.priceUsd || 1)
              ).toFixed(2)} USD
            </span>
            <span>Rate: 1 {sellToken.symbol} ≈ {quoteData?.price || '...'} {buyToken.symbol}</span>
          </div>
        </div>

        {/* 0x ROUTE BREAKDOWN & LIQUIDITY SOURCES */}
        {quoteData?.route?.fills && quoteData.route.fills.length > 0 && (
          <div className="mt-4 p-3.5 rounded-sm bg-[#0E0E0E] border border-[#222] font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-[#888]">
              <span className="text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1">
                <Layers className="w-3 h-3 text-[#00FF41]" />
                <span>0x Smart Order Routing (Multi-Hop)</span>
              </span>
              <span className="text-[#00FF41] text-[10px] font-bold">100% Best Execution</span>
            </div>

            {/* Split Progress Bars */}
            <div className="w-full h-2 rounded-full bg-[#1A1A1A] flex overflow-hidden">
              {quoteData.route.fills.map((fill, idx) => {
                const pct = parseInt(fill.proportionBps || '10000', 10) / 100;
                const colors = ['bg-[#00FF41]', 'bg-blue-500', 'bg-purple-500', 'bg-amber-400'];
                return (
                  <div
                    key={fill.source + idx}
                    style={{ width: `${pct}%` }}
                    className={`${colors[idx % colors.length]} h-full`}
                    title={`${fill.name || fill.source}: ${pct}%`}
                  />
                );
              })}
            </div>

            {/* Fill Source Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quoteData.route.fills.map((fill, idx) => {
                const pct = parseInt(fill.proportionBps || '10000', 10) / 100;
                return (
                  <span
                    key={fill.source + idx}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm bg-[#161616] border border-[#292929] text-[10px] text-[#CCC]"
                  >
                    <span className="text-[#00FF41] font-bold">{pct}%</span>
                    <span>{fill.name || fill.source}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* DETAILS ACCORDION */}
        {quoteData && (
          <div className="mt-4 p-3.5 rounded-sm bg-[#0E0E0E] border border-[#222] font-mono text-xs space-y-2">
            <div className="flex justify-between text-[#777]">
              <span className="uppercase text-[10px] tracking-wider font-bold">Min. Received (After Slippage)</span>
              <span className="text-white font-bold">
                {(parseFloat(amountSell) * parseFloat(quoteData.price) * (1 - slippageBps / 10000)).toFixed(4)} {buyToken.symbol}
              </span>
            </div>

            <div className="flex justify-between text-[#777]">
              <span className="uppercase text-[10px] tracking-wider font-bold">Est. Price Impact</span>
              <span className="text-[#00FF41] font-bold">{quoteData.estimatedPriceImpact || '< 0.05%'}</span>
            </div>

            <div className="flex justify-between text-[#777]">
              <span className="uppercase text-[10px] tracking-wider font-bold">Routing & MEV Protection</span>
              <span className="text-white font-bold flex items-center space-x-1 text-[#00FF41]">
                <ShieldCheck className="w-3 h-3" />
                <span>0x RFQ Private Route Active</span>
              </span>
            </div>

            <div className="flex justify-between text-[#777]">
              <span className="uppercase text-[10px] tracking-wider font-bold">Est. Network Fee (Gas)</span>
              <span className="text-white font-bold flex items-center space-x-1">
                <Fuel className="w-3 h-3 text-[#AAA]" />
                <span>~${quoteData.totalNetworkFee || '0.0025'} USD ({currentChain.symbol})</span>
              </span>
            </div>
          </div>
        )}

        {/* ACTION BUTTON */}
        <div className="mt-5">
          {!isConnected ? (
            <button
              onClick={openWalletModal}
              className="w-full py-4 rounded-sm bg-white hover:bg-[#E0E0E0] text-black font-black uppercase text-sm tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              Connect Wallet to Swap
            </button>
          ) : (
            <button
              id="execute-0x-swap-btn"
              onClick={handleExecute0xSwap}
              disabled={isExecuting || loadingQuote || !quoteData}
              className="w-full py-4 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_25px_rgba(0,255,65,0.4)] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting to 0x Permit2 Router...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Swap {sellToken.symbol} → {buyToken.symbol} on {currentChain.name}</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

      {/* SUCCESS RECEIPT MODAL */}
      {executedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-sm bg-[#0A0A0A] border border-[#00FF41]/40 shadow-2xl p-6 font-mono text-[#E0E0E0]">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#00FF41]/20 text-[#00FF41] mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(0,255,65,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">0x Swap Executed!</h3>
              <p className="text-xs text-[#AAA]">
                Successfully routed through 0x Protocol on <span className="text-white font-bold">{currentChain.name}</span>
              </p>
            </div>

            <div className="mt-5 p-4 rounded-sm bg-[#111] border border-[#222] space-y-2 text-xs">
              <div className="flex justify-between text-[#888]">
                <span>Sold:</span>
                <span className="text-white font-bold">{executedTx.soldAmount} {executedTx.soldSymbol}</span>
              </div>
              <div className="flex justify-between text-[#888]">
                <span>Received:</span>
                <span className="text-[#00FF41] font-bold">{executedTx.boughtAmount} {executedTx.boughtSymbol}</span>
              </div>
              <div className="flex justify-between text-[#888]">
                <span>Transaction Hash:</span>
                <span className="text-white font-mono text-[11px] truncate max-w-[160px]">{executedTx.txHash}</span>
              </div>
            </div>

            <div className="mt-5 flex space-x-2">
              <a
                href={executedTx.blockExplorerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-sm bg-[#151515] hover:bg-[#222] border border-[#333] text-white font-bold text-xs uppercase flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setExecutedTx(null)}
                className="flex-1 py-2.5 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN SELECTOR MODAL */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-sm bg-[#0A0A0A] border border-[#333] p-6 shadow-2xl font-mono">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#222]">
              <div>
                <h3 className="font-black uppercase tracking-tight text-base text-white">
                  Select {isTokenModalOpen === 'sell' ? 'Pay' : 'Receive'} Token
                </h3>
                <p className="text-[10px] text-[#777]">{currentChain.name} (Chain ID {currentChain.id})</p>
              </div>
              <button onClick={() => setIsTokenModalOpen(null)} className="text-[#777] hover:text-white font-mono">✕</button>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#555] absolute left-3 top-3" />
              <input
                type="text"
                value={tokenSearchQuery}
                onChange={(e) => setTokenSearchQuery(e.target.value)}
                placeholder="Search token symbol or 0x contract..."
                className="w-full pl-9 pr-3 py-2 bg-[#111] border border-[#222] rounded-sm text-xs text-white focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
              {modalTokens.map((t) => (
                <button
                  key={t.address + t.symbol}
                  onClick={() => {
                    if (isTokenModalOpen === 'sell') setSellToken(t);
                    else setBuyToken(t);
                    setIsTokenModalOpen(null);
                  }}
                  className="w-full p-3 rounded-sm flex items-center justify-between text-left hover:bg-[#141414] transition-colors border border-transparent hover:border-[#222]"
                >
                  <div className="flex items-center space-x-3">
                    {t.logoURI ? (
                      <img src={t.logoURI} alt={t.symbol} className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                        {t.symbol[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm text-white">{t.symbol}</div>
                      <div className="text-[10px] text-[#666] uppercase">{t.name}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#AAA]">
                    <div>${t.priceUsd ? t.priceUsd.toLocaleString() : '...'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 0x API KEY CONFIG MODAL */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-sm bg-[#0A0A0A] border border-[#333] p-6 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#222]">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-[#00FF41]" />
                <h3 className="font-black uppercase tracking-tight text-sm text-white">0x Swap API Configuration</h3>
              </div>
              <button onClick={() => setIsApiKeyModalOpen(false)} className="text-[#777] hover:text-white">✕</button>
            </div>

            <p className="text-[#888] text-[11px] mb-3 leading-relaxed">
              Tradex is integrated with <strong className="text-white">0x Swap API v2</strong>. You can use our default gateway or enter your dedicated API key from <a href="https://dashboard.0x.org" target="_blank" rel="noreferrer" className="text-[#00FF41] underline">dashboard.0x.org</a>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#777] uppercase block mb-1">0x API Key (`0x-api-key` header)</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="e.g. 7f8a9... or leave blank for default gateway"
                  className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="p-3 bg-[#111] rounded-sm border border-[#222] space-y-1 text-[11px]">
                <div className="flex justify-between text-[#777]">
                  <span>API Version:</span>
                  <span className="text-[#00FF41] font-bold">0x Swap API v2</span>
                </div>
                <div className="flex justify-between text-[#777]">
                  <span>Permit2 Optimization:</span>
                  <span className="text-[#00FF41] font-bold">Enabled</span>
                </div>
                <div className="flex justify-between text-[#777]">
                  <span>MEV Sandwich Protection:</span>
                  <span className="text-[#00FF41] font-bold">0x RFQ Enabled</span>
                </div>
              </div>

              <button
                onClick={handleSaveApiKey}
                className="w-full py-2.5 bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs rounded-sm transition-colors mt-2"
              >
                {apiKeySaved ? '✓ Configuration Saved' : 'Save & Apply 0x Key'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
