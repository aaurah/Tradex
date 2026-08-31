import React, { useState, useEffect } from 'react';
import { P2POrder, P2POrderType } from '../types/dex';
import { apiService } from '../services/apiService';
import { useWallet } from '../context/WalletContext';
import { formatBsv, formatSats } from '../services/bsvCrypto';
import { P2PTradeModal } from './P2PTradeModal';
import { 
  Users, 
  PlusCircle, 
  Filter, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Search, 
  Zap, 
  DollarSign, 
  CreditCard,
  Building2,
  Globe,
  SlidersHorizontal,
  Layers,
  ChevronRight
} from 'lucide-react';

export const P2PExchange: React.FC = () => {
  const { account, isConnected, openWalletModal } = useWallet();

  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [activeTab, setActiveTab] = useState<'orderbook' | 'my_trades' | 'create_offer'>('orderbook');
  const [tradeTypeFilter, setTradeTypeFilter] = useState<P2POrderType>('SELL_BSV'); // "BUY BSV" from seller offers
  const [fiatFilter, setFiatFilter] = useState<string>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [searchAmount, setSearchAmount] = useState<string>('');

  const [selectedTradeOrder, setSelectedTradeOrder] = useState<P2POrder | null>(null);
  const [tradeAmountInput, setTradeAmountInput] = useState<string>('');
  const [isTradeConfirmOpen, setIsTradeConfirmOpen] = useState<boolean>(false);
  const [activeTradeModalOrder, setActiveTradeModalOrder] = useState<P2POrder | null>(null);

  // Form state for creating a new offer
  const [newOrderType, setNewOrderType] = useState<P2POrderType>('SELL_BSV');
  const [newAmountBsv, setNewAmountBsv] = useState<string>('10.0');
  const [newPricePerBsv, setNewPricePerBsv] = useState<string>('49.50');
  const [newFiatCurrency, setNewFiatCurrency] = useState<string>('USD');
  const [newMinLimit, setNewMinLimit] = useState<string>('50');
  const [newMaxLimit, setNewMaxLimit] = useState<string>('495');
  const [newPaymentMethods, setNewPaymentMethods] = useState<string[]>(['HandCash Pay', 'Bank Transfer (ACH)']);
  const [newInstructions, setNewInstructions] = useState<string>(
    'Instant release once payment is confirmed. Please provide your exact transfer reference in the trade chat.'
  );

  const spotBsvPrice = 48.60;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setOrders(apiService.getP2POrders());
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      openWalletModal();
      return;
    }

    const bsvAmt = parseFloat(newAmountBsv);
    const price = parseFloat(newPricePerBsv);
    const minL = parseFloat(newMinLimit);
    const maxL = parseFloat(newMaxLimit);

    if (isNaN(bsvAmt) || bsvAmt <= 0 || isNaN(price) || price <= 0) {
      alert('Please enter valid numeric amounts');
      return;
    }

    if (newPaymentMethods.length === 0) {
      alert('Please select at least one payment method');
      return;
    }

    try {
      const created = await apiService.createP2POrder({
        type: newOrderType,
        makerAddress: account.address,
        makerHandle: account.handle,
        amountBsv: bsvAmt,
        pricePerBsv: price,
        fiatCurrency: newFiatCurrency,
        minLimitFiat: minL,
        maxLimitFiat: maxL,
        paymentMethods: newPaymentMethods,
        paymentInstructions: newInstructions
      });

      loadOrders();
      setActiveTab('orderbook');
      alert('Your P2P Offer #' + created.id + ' has been published to the orderbook!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleInitiateTrade = (order: P2POrder) => {
    if (!account) {
      openWalletModal();
      return;
    }
    setSelectedTradeOrder(order);
    setTradeAmountInput(order.amountBsv.toString());
    setIsTradeConfirmOpen(true);
  };

  const handleConfirmMatch = async () => {
    if (!selectedTradeOrder || !account) return;
    const tradeAmt = parseFloat(tradeAmountInput);
    if (isNaN(tradeAmt) || tradeAmt <= 0 || tradeAmt > selectedTradeOrder.remainingBsv) {
      alert('Invalid trade amount');
      return;
    }

    try {
      const matched = await apiService.matchP2POrder({
        orderId: selectedTradeOrder.id,
        takerAddress: account.address,
        takerHandle: account.handle,
        tradeAmountBsv: tradeAmt
      });

      loadOrders();
      setIsTradeConfirmOpen(false);
      setSelectedTradeOrder(null);
      setActiveTradeModalOrder(matched);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const togglePaymentMethod = (method: string) => {
    if (newPaymentMethods.includes(method)) {
      setNewPaymentMethods(newPaymentMethods.filter(m => m !== method));
    } else {
      setNewPaymentMethods([...newPaymentMethods, method]);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (o.status !== 'OPEN') return false;
    if (o.type !== tradeTypeFilter) return false;
    if (fiatFilter !== 'ALL' && o.fiatCurrency !== fiatFilter) return false;
    if (paymentMethodFilter !== 'ALL' && !o.paymentMethods.includes(paymentMethodFilter)) return false;
    if (searchAmount) {
      const amt = parseFloat(searchAmount);
      if (!isNaN(amt) && (amt < o.minLimitFiat || amt > o.maxLimitFiat)) return false;
    }
    return true;
  });

  const myTrades = orders.filter((o) => 
    (account && (o.makerAddress === account.address || o.takerAddress === account.address)) ||
    ['MATCHED', 'ESCROW_LOCKED', 'PAYMENT_SENT', 'COMPLETED', 'DISPUTED'].includes(o.status)
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-sm bg-[#0A0A0A] border border-[#222] shadow-2xl">
        <div>
          <div className="flex items-center space-x-2 text-[#00FF41] text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Decentralized On-Chain Escrow Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-white leading-none">
            P2P Escrow Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#777] mt-2 max-w-2xl font-mono">
            Direct peer settlement powered by non-custodial 2-of-2 multisig script contracts. Satoshis released on verified fiat transfer.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 font-mono">
          <button
            onClick={() => setActiveTab('orderbook')}
            className={`px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'orderbook'
                ? 'bg-white text-black font-black shadow-sm'
                : 'bg-[#141414] text-[#AAA] hover:text-white border border-[#222]'
            }`}
          >
            Orderbook
          </button>

          <button
            onClick={() => setActiveTab('my_trades')}
            className={`px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === 'my_trades'
                ? 'bg-white text-black font-black shadow-sm'
                : 'bg-[#141414] text-[#AAA] hover:text-white border border-[#222]'
            }`}
          >
            <span>My Trades</span>
            {myTrades.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-sm bg-[#00FF41] text-black text-[10px] font-black">
                {myTrades.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (!account) {
                openWalletModal();
              } else {
                setActiveTab('create_offer');
              }
            }}
            className={`px-4 py-2.5 rounded-sm text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              activeTab === 'create_offer'
                ? 'bg-white text-black'
                : 'bg-[#00FF41] hover:bg-[#00D436] text-black shadow-[0_0_15px_rgba(0,255,65,0.2)]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Offer</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ORDERBOOK VIEW */}
      {activeTab === 'orderbook' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222] space-y-3 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Buy / Sell Toggle */}
              <div className="flex p-1 bg-[#111] rounded-sm border border-[#222]">
                <button
                  id="filter-buy-bsv"
                  onClick={() => setTradeTypeFilter('SELL_BSV')}
                  className={`px-4 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                    tradeTypeFilter === 'SELL_BSV'
                      ? 'bg-[#00FF41] text-black font-black'
                      : 'text-[#777] hover:text-white'
                  }`}
                >
                  Buy BSV
                </button>
                <button
                  id="filter-sell-bsv"
                  onClick={() => setTradeTypeFilter('BUY_BSV')}
                  className={`px-4 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                    tradeTypeFilter === 'BUY_BSV'
                      ? 'bg-white text-black font-black'
                      : 'text-[#777] hover:text-white'
                  }`}
                >
                  Sell BSV
                </button>
              </div>

              {/* Fiat Currency Selector */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-[#666] uppercase text-[10px] font-bold">Fiat:</span>
                <select
                  value={fiatFilter}
                  onChange={(e) => setFiatFilter(e.target.value)}
                  className="bg-[#111] border border-[#333] text-white px-3 py-1.5 rounded-sm text-xs font-mono focus:outline-none focus:border-[#00FF41]"
                >
                  <option value="ALL">All Currencies</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>

              {/* Payment Method Selector */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-[#666] uppercase text-[10px] font-bold">Rail:</span>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="bg-[#111] border border-[#333] text-white px-3 py-1.5 rounded-sm text-xs font-medium focus:outline-none focus:border-[#00FF41]"
                >
                  <option value="ALL">All Rails</option>
                  <option value="HandCash Pay">HandCash Pay</option>
                  <option value="Bank Transfer (ACH)">Bank Transfer (ACH)</option>
                  <option value="SEPA Instant">SEPA Instant</option>
                  <option value="Revolut">Revolut</option>
                  <option value="PayPal (Friends & Family)">PayPal</option>
                  <option value="Zelle">Zelle</option>
                  <option value="USDC (Solana)">USDC</option>
                </select>
              </div>

              {/* Amount Filter Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#555] absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={searchAmount}
                  onChange={(e) => setSearchAmount(e.target.value)}
                  placeholder="Filter amount..."
                  className="pl-8 pr-3 py-1.5 bg-[#111] border border-[#333] rounded-sm text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#00FF41] font-mono w-40"
                />
              </div>

            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#0A0A0A] border border-[#222] rounded-sm space-y-2 font-mono">
              <Users className="w-8 h-8 text-[#444] mx-auto" />
              <h3 className="text-base font-black uppercase text-white">No active offers match filters</h3>
              <p className="text-xs text-[#666]">Try adjusting filter settings or publish a new P2P trade offer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isBuyAction = tradeTypeFilter === 'SELL_BSV';
                const priceDiff = ((order.pricePerBsv - spotBsvPrice) / spotBsvPrice * 100).toFixed(1);
                const isAboveSpot = order.pricePerBsv >= spotBsvPrice;

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-sm bg-[#0A0A0A] border border-[#222] hover:border-[#444] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    
                    {/* Left: Maker Info & Badges */}
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-sm bg-[#141414] border border-[#333] flex items-center justify-center font-mono font-bold text-[#00FF41] text-xs">
                        {order.makerHandle.slice(1, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-white text-sm">{order.makerHandle}</span>
                          <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20 font-bold">
                            {order.makerScore}% • {order.makerTradesCount} trades
                          </span>
                        </div>
                        <div className="text-xs text-[#777] mt-1.5 flex flex-wrap gap-1.5 font-mono">
                          {order.paymentMethods.map((pm) => (
                            <span key={pm} className="px-2 py-0.5 rounded-sm bg-[#111] border border-[#222] text-[#AAA] text-[10px] font-bold uppercase">
                              {pm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Limits & Price */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs border-t lg:border-t-0 pt-3 lg:pt-0 border-[#222]">
                      <div>
                        <span className="text-[10px] text-[#666] uppercase tracking-wider block font-bold">Unit Price</span>
                        <span className="text-lg font-black text-white">
                          {order.fiatCurrency} {order.pricePerBsv.toFixed(2)}
                        </span>
                        <span className={`text-[10px] block font-bold ${isAboveSpot ? 'text-amber-400' : 'text-[#00FF41]'}`}>
                          {isAboveSpot ? `+${priceDiff}%` : `${priceDiff}%`} spot
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#666] uppercase tracking-wider block font-bold">Available</span>
                        <span className="text-sm font-bold text-[#00FF41]">
                          {formatBsv(order.remainingBsv)} BSV
                        </span>
                        <span className="text-[10px] text-[#666] block">
                          {formatSats(order.remainingBsv * 100000000)}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-[#666] uppercase tracking-wider block font-bold">Order Limits</span>
                        <span className="text-xs font-bold text-[#DDD]">
                          {order.fiatCurrency} {order.minLimitFiat.toLocaleString()} - {order.maxLimitFiat.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#666] block flex items-center space-x-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-[#666]" />
                          <span>15m window</span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="shrink-0 flex items-center justify-end">
                      <button
                        onClick={() => handleInitiateTrade(order)}
                        className={`px-5 py-2.5 rounded-sm font-black uppercase tracking-wider text-xs transition-all flex items-center space-x-2 ${
                          isBuyAction
                            ? 'bg-[#00FF41] hover:bg-[#00D436] text-black shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                            : 'bg-white hover:bg-[#DDD] text-black shadow-sm'
                        }`}
                      >
                        <span>{isBuyAction ? 'Buy BSV' : 'Sell BSV'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MY ACTIVE TRADES */}
      {activeTab === 'my_trades' && (
        <div className="space-y-4">
          <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222]">
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-white">Active Escrow Deals</h3>
            <p className="text-xs text-[#777] font-mono mt-0.5">Access live multi-sig trade rooms to verify fiat payment and release BSV satoshis on-chain.</p>
          </div>

          {myTrades.length === 0 ? (
            <div className="p-12 text-center bg-[#0A0A0A] border border-[#222] rounded-sm space-y-2 font-mono">
              <Clock className="w-8 h-8 text-[#444] mx-auto" />
              <h4 className="text-base font-black uppercase text-white">No active trades right now</h4>
              <p className="text-xs text-[#666]">Take an order from the orderbook or create a new offer to start trading.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTrades.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTradeModalOrder(t)}
                  className="p-5 rounded-sm bg-[#0A0A0A] border border-[#222] hover:border-[#00FF41] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">
                        {t.type === 'SELL_BSV' ? 'Selling' : 'Buying'} {formatBsv(t.matchedAmountBsv || t.amountBsv)} BSV
                      </span>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'COMPLETED' ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40' :
                        t.status === 'ESCROW_LOCKED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-[#777] mt-1">
                      Order: {t.id} • {t.fiatCurrency} {((t.matchedAmountBsv || t.amountBsv) * t.pricePerBsv).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase text-[#00FF41]">Open Escrow Room</span>
                    <ChevronRight className="w-4 h-4 text-[#00FF41]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREATE P2P OFFER FORM */}
      {activeTab === 'create_offer' && (
        <div className="max-w-2xl mx-auto rounded-sm bg-[#0A0A0A] border border-[#222] p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center space-x-3 pb-4 border-b border-[#222] mb-6">
            <div>
              <div className="text-[10px] font-mono text-[#00FF41] uppercase tracking-widest font-bold">New Listing</div>
              <h2 className="text-2xl font-black tracking-tight uppercase text-white mt-0.5">Create Escrow Offer</h2>
            </div>
          </div>

          <form onSubmit={handleCreateOffer} className="space-y-4 font-mono">
            
            {/* Offer Side */}
            <div>
              <label className="text-xs uppercase text-[#777] font-bold block mb-1.5">Action</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewOrderType('SELL_BSV')}
                  className={`py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all ${
                    newOrderType === 'SELL_BSV'
                      ? 'bg-white text-black font-black border-white'
                      : 'bg-[#111] border-[#222] text-[#777] hover:text-white'
                  }`}
                >
                  Sell BSV (Receive Fiat)
                </button>

                <button
                  type="button"
                  onClick={() => setNewOrderType('BUY_BSV')}
                  className={`py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all ${
                    newOrderType === 'BUY_BSV'
                      ? 'bg-[#00FF41] text-black font-black border-[#00FF41]'
                      : 'bg-[#111] border-[#222] text-[#777] hover:text-white'
                  }`}
                >
                  Buy BSV (Send Fiat)
                </button>
              </div>
            </div>

            {/* Total BSV & Price Per BSV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase text-[#777] font-bold block mb-1">Total BSV Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={newAmountBsv}
                    onChange={(e) => setNewAmountBsv(e.target.value)}
                    step="any"
                    placeholder="10.0"
                    className="w-full px-3.5 py-2.5 bg-[#111] border border-[#333] rounded-sm text-sm font-mono text-white focus:outline-none focus:border-[#00FF41]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-[#00FF41] font-bold">BSV</span>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase text-[#777] font-bold block mb-1">Price per BSV</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={newPricePerBsv}
                    onChange={(e) => setNewPricePerBsv(e.target.value)}
                    step="any"
                    placeholder="49.50"
                    className="w-full px-3.5 py-2.5 bg-[#111] border border-[#333] rounded-sm text-sm font-mono text-white focus:outline-none focus:border-[#00FF41]"
                  />
                  <select
                    value={newFiatCurrency}
                    onChange={(e) => setNewFiatCurrency(e.target.value)}
                    className="bg-[#111] border border-[#333] rounded-sm px-3 text-xs font-bold text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AUD">AUD</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase text-[#777] font-bold block mb-1">Min Limit ({newFiatCurrency})</label>
                <input
                  type="number"
                  value={newMinLimit}
                  onChange={(e) => setNewMinLimit(e.target.value)}
                  placeholder="50"
                  className="w-full px-3.5 py-2.5 bg-[#111] border border-[#333] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="text-xs uppercase text-[#777] font-bold block mb-1">Max Limit ({newFiatCurrency})</label>
                <input
                  type="number"
                  value={newMaxLimit}
                  onChange={(e) => setNewMaxLimit(e.target.value)}
                  placeholder="500"
                  className="w-full px-3.5 py-2.5 bg-[#111] border border-[#333] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>
            </div>

            {/* Payment Methods Checkboxes */}
            <div>
              <label className="text-xs uppercase text-[#777] font-bold block mb-1.5">Accepted Payment Methods</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'HandCash Pay',
                  'Bank Transfer (ACH)',
                  'SEPA Instant',
                  'Revolut',
                  'PayPal (Friends & Family)',
                  'Zelle',
                  'Wise',
                  'USDC (Solana)'
                ].map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => togglePaymentMethod(pm)}
                    className={`px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-left border transition-all flex items-center justify-between ${
                      newPaymentMethods.includes(pm)
                        ? 'bg-[#111] border-[#00FF41] text-[#00FF41]'
                        : 'bg-[#111] border-[#222] text-[#777] hover:text-white'
                    }`}
                  >
                    <span className="truncate">{pm}</span>
                    {newPaymentMethods.includes(pm) && <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF41] shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms / Instructions */}
            <div>
              <label className="text-xs uppercase text-[#777] font-bold block mb-1">Trade Instructions & Auto-Reply</label>
              <textarea
                rows={3}
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                placeholder="Specify your payment details or expectations..."
                className="w-full p-3 bg-[#111] border border-[#333] rounded-sm text-xs text-white focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('orderbook')}
                className="px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider text-[#777] hover:text-white"
              >
                Cancel
              </button>

              <button
                id="publish-p2p-offer-btn"
                type="submit"
                className="px-6 py-2.5 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-widest shadow-[0_0_15px_rgba(0,255,65,0.2)] active:scale-95 transition-all"
              >
                Publish Offer
              </button>
            </div>

          </form>
        </div>
      )}

      {/* MATCH CONFIRMATION MODAL */}
      {isTradeConfirmOpen && selectedTradeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#333] rounded-sm p-6 shadow-2xl space-y-4 text-[#E0E0E0] font-mono">
            <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#00FF41]" />
              <span>Initiate P2P Escrow Trade</span>
            </h3>

            <div className="p-3.5 rounded-sm bg-[#111] border border-[#222] space-y-2 text-xs">
              <div className="flex justify-between text-[#777]">
                <span className="uppercase text-[10px] font-bold">Counterparty:</span>
                <span className="font-bold text-white">{selectedTradeOrder.makerHandle}</span>
              </div>
              <div className="flex justify-between text-[#777]">
                <span className="uppercase text-[10px] font-bold">Price per BSV:</span>
                <span className="text-[#00FF41] font-bold">
                  {selectedTradeOrder.fiatCurrency} {selectedTradeOrder.pricePerBsv.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#777]">
                <span className="uppercase text-[10px] font-bold">Payment Methods:</span>
                <span className="text-white">{selectedTradeOrder.paymentMethods.join(', ')}</span>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase text-[#777] font-bold block mb-1">Amount of BSV to Trade:</label>
              <div className="relative">
                <input
                  type="number"
                  value={tradeAmountInput}
                  onChange={(e) => setTradeAmountInput(e.target.value)}
                  step="any"
                  max={selectedTradeOrder.remainingBsv}
                  className="w-full px-3.5 py-2.5 bg-[#111] border border-[#333] rounded-sm text-base font-mono font-bold text-white focus:outline-none focus:border-[#00FF41]"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-[#00FF41] font-bold">BSV</span>
              </div>
              <div className="text-[11px] text-[#777] mt-1.5 flex justify-between font-mono">
                <span>Total Fiat: {selectedTradeOrder.fiatCurrency} {((parseFloat(tradeAmountInput) || 0) * selectedTradeOrder.pricePerBsv).toFixed(2)}</span>
                <span>Max: {selectedTradeOrder.remainingBsv} BSV</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsTradeConfirmOpen(false)}
                className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-[#777] hover:text-white"
              >
                Cancel
              </button>
              <button
                id="confirm-match-p2p-btn"
                onClick={handleConfirmMatch}
                className="px-5 py-2 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-wider transition-all"
              >
                Enter Escrow Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE TRADE ROOM MODAL */}
      {activeTradeModalOrder && (
        <P2PTradeModal
          order={activeTradeModalOrder}
          onClose={() => {
            setActiveTradeModalOrder(null);
            loadOrders();
          }}
          onOrderUpdated={(updated) => {
            setActiveTradeModalOrder(updated);
            loadOrders();
          }}
        />
      )}

    </div>
  );
};
