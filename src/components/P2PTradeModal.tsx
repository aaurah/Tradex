import React, { useState, useEffect, useRef } from 'react';
import { P2POrder, P2PChatMessage } from '../types/dex';
import { useWallet } from '../context/WalletContext';
import { apiService } from '../services/apiService';
import { formatBsv, formatSats } from '../services/bsvCrypto';
import { TRADEX_ESCROW_CONTRACT_ADDRESS } from '../services/escrowTradingService';
import confetti from '../utils/confetti';
import { 
  X, 
  Lock, 
  Unlock, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileText, 
  Sparkles,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface P2PTradeModalProps {
  order: P2POrder;
  onClose: () => void;
  onOrderUpdated: (updated: P2POrder) => void;
}

export const P2PTradeModal: React.FC<P2PTradeModalProps> = ({
  order,
  onClose,
  onOrderUpdated
}) => {
  const { account, updateBalance } = useWallet();
  const [currentOrder, setCurrentOrder] = useState<P2POrder>(order);
  const [chatInput, setChatInput] = useState<string>('');
  const [paymentRefInput, setPaymentRefInput] = useState<string>('REV-948271');
  const [copiedTx, setCopiedTx] = useState<boolean>(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState<boolean>(false);
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const isMaker = account?.address === currentOrder.makerAddress;
  const isSeller = currentOrder.type === 'SELL_BSV' ? isMaker : !isMaker;
  const isBuyer = !isSeller;

  const tradeBsvAmount = currentOrder.matchedAmountBsv || currentOrder.amountBsv;
  const tradeFiatAmount = currentOrder.matchedFiatAmount || (tradeBsvAmount * currentOrder.pricePerBsv);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentOrder.chatMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const senderRole = isMaker ? 'maker' : 'taker';
      await apiService.addChatMessage(currentOrder.id, {
        sender: senderRole,
        senderAddress: account?.address || 'user',
        text: chatInput.trim()
      });
      setChatInput('');
      const orders = apiService.getP2POrders();
      const updated = orders.find(o => o.id === currentOrder.id);
      if (updated) {
        setCurrentOrder(updated);
        onOrderUpdated(updated);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 1. Seller Locks Escrow on-chain
  const handleLockEscrow = async () => {
    setIsProcessing(true);
    try {
      const updated = await apiService.fundP2PEscrow(currentOrder.id);
      setCurrentOrder({ ...updated });
      onOrderUpdated(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Buyer Marks Payment as Sent
  const handleMarkPaymentSent = async () => {
    setIsProcessing(true);
    try {
      const updated = await apiService.confirmP2PPayment(currentOrder.id, paymentRefInput);
      setCurrentOrder({ ...updated });
      onOrderUpdated(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Seller Releases Escrow via On-Chain Worker
  const handleReleaseEscrow = async () => {
    setIsProcessing(true);
    try {
      const updated = await apiService.releaseP2PEscrow(currentOrder.id);
      setCurrentOrder({ ...updated });
      onOrderUpdated(updated);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Update wallet balance for buyer if connected
      if (isBuyer) {
        updateBalance(tradeBsvAmount);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // File Dispute
  const handleFileDispute = async () => {
    if (!disputeReason.trim()) return;
    setIsProcessing(true);
    try {
      const updated = await apiService.disputeP2POrder(currentOrder.id, disputeReason);
      setCurrentOrder({ ...updated });
      onOrderUpdated(updated);
      setDisputeModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] rounded-sm bg-[#0A0A0A] border border-[#333] shadow-2xl flex flex-col text-[#E0E0E0] overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#222] bg-[#050505]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-sm bg-[#141414] border border-[#333] flex items-center justify-center text-[#00FF41] font-bold">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  Escrow Trade Room
                </h2>
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                  currentOrder.status === 'COMPLETED' ? 'bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40' :
                  currentOrder.status === 'ESCROW_LOCKED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                  currentOrder.status === 'PAYMENT_SENT' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                  currentOrder.status === 'DISPUTED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  'bg-white/10 text-white border-white/20'
                }`}>
                  {currentOrder.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-[#777]">
                Order: #{currentOrder.id} • Trading with {isMaker ? (currentOrder.takerHandle || currentOrder.takerAddress?.slice(0, 10)) : currentOrder.makerHandle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-sm text-[#777] hover:text-white hover:bg-[#141414] transition-colors font-mono"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: 2 COLUMNS (TRADE WORKFLOW & ESCROW DETAILS + CHAT) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto">
          
          {/* LEFT: WORKFLOW & ESCROW STATUS (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#222] space-y-4">
            
            {/* TRADE SUMMARY PILL */}
            <div className="p-4 rounded-sm bg-[#111] border border-[#222] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#666] uppercase tracking-wider block font-bold">BSV Amount</span>
                <span className="text-2xl font-black text-[#00FF41]">
                  {formatBsv(tradeBsvAmount)} BSV
                </span>
                <span className="text-[10px] text-[#666] block">
                  {formatSats(currentOrder.escrowAmountSats || tradeBsvAmount * 100000000)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#666] uppercase tracking-wider block font-bold">Fiat Settle</span>
                <span className="text-2xl font-black text-white">
                  {currentOrder.fiatCurrency} {tradeFiatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-[#666] block">
                  @ {currentOrder.pricePerBsv} {currentOrder.fiatCurrency} / BSV
                </span>
              </div>
            </div>

            {/* INTERACTIVE ESCROW STEPPER */}
            <div className="p-4 rounded-sm bg-[#111] border border-[#222] space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00FF41]" />
                <span>On-Chain Multisig Escrow</span>
              </h4>

              {/* Steps */}
              <div className="space-y-2 text-xs">
                
                {/* Step 1 */}
                <div className={`p-3 rounded-sm border flex items-start space-x-3 transition-colors ${
                  ['ESCROW_LOCKED', 'PAYMENT_SENT', 'COMPLETED'].includes(currentOrder.status)
                    ? 'bg-[#00FF41]/10 border-[#00FF41]/30 text-white'
                    : currentOrder.status === 'MATCHED'
                    ? 'bg-white/10 border-white text-white animate-pulse'
                    : 'bg-[#0A0A0A] border-[#222] text-[#666]'
                }`}>
                  <div className="mt-0.5">
                    {['ESCROW_LOCKED', 'PAYMENT_SENT', 'COMPLETED'].includes(currentOrder.status) ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                    ) : (
                      <Lock className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-black uppercase text-xs">Step 1: Lock BSV in On-Chain Escrow</div>
                    <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed font-sans">
                      Seller signs 2-of-2 multisig script depositing {tradeBsvAmount} BSV into decentralized escrow address.
                    </p>
                    <div className="mt-1 flex items-center space-x-2 text-[10px] font-mono text-[#AAA]">
                      <span>Contract:</span>
                      <span className="text-[#00FF41]">{TRADEX_ESCROW_CONTRACT_ADDRESS.slice(0, 8)}...{TRADEX_ESCROW_CONTRACT_ADDRESS.slice(-6)}</span>
                    </div>
                    {currentOrder.escrowTxId && (
                      <div className="mt-1 font-mono text-[10px] text-[#00FF41] flex items-center space-x-1">
                        <span>TxID: {currentOrder.escrowTxId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`p-3 rounded-sm border flex items-start space-x-3 transition-colors ${
                  ['PAYMENT_SENT', 'COMPLETED'].includes(currentOrder.status)
                    ? 'bg-[#00FF41]/10 border-[#00FF41]/30 text-white'
                    : currentOrder.status === 'ESCROW_LOCKED'
                    ? 'bg-white/10 border-white text-white animate-pulse'
                    : 'bg-[#0A0A0A] border-[#222] text-[#666]'
                }`}>
                  <div className="mt-0.5">
                    {['PAYMENT_SENT', 'COMPLETED'].includes(currentOrder.status) ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-[#666]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-black uppercase text-xs">Step 2: Buyer Transfers Fiat Payment</div>
                    <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed font-sans">
                      Buyer transfers {currentOrder.fiatCurrency} {tradeFiatAmount.toFixed(2)} via {currentOrder.paymentMethods.join(', ')} and marks as sent.
                    </p>
                    {currentOrder.paymentReference && (
                      <div className="mt-1 font-mono text-[10px] text-[#00FF41]">
                        Ref: {currentOrder.paymentReference}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`p-3 rounded-sm border flex items-start space-x-3 transition-colors ${
                  currentOrder.status === 'COMPLETED'
                    ? 'bg-[#00FF41]/10 border-[#00FF41]/30 text-white'
                    : currentOrder.status === 'PAYMENT_SENT'
                    ? 'bg-white/10 border-white text-white animate-pulse'
                    : 'bg-[#0A0A0A] border-[#222] text-[#666]'
                }`}>
                  <div className="mt-0.5">
                    {currentOrder.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                    ) : (
                      <Unlock className="w-4 h-4 text-[#666]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-black uppercase text-xs">Step 3: Verification & On-Chain Release</div>
                    <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed font-sans">
                      Seller confirms payment receipt, triggering the BSV Settlement Worker to broadcast release transaction.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* ACTION BUTTON CONTROLS */}
            <div className="p-4 rounded-sm bg-[#111] border border-[#222] space-y-3">
              <div className="text-xs font-bold uppercase text-[#777]">
                Action Control:
              </div>

              {/* If status is MATCHED: Seller needs to lock escrow */}
              {currentOrder.status === 'MATCHED' && (
                <div>
                  <button
                    id="lock-escrow-action-btn"
                    onClick={handleLockEscrow}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(0,255,65,0.2)] active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4 fill-current" />
                    <span>Lock {tradeBsvAmount} BSV into Smart Escrow</span>
                  </button>
                  <p className="text-[11px] text-[#666] text-center mt-1.5">
                    BSV satoshis will be held securely in a 2-of-2 multisig script until payment is verified.
                  </p>
                </div>
              )}

              {/* If status is ESCROW_LOCKED: Buyer needs to pay & mark sent */}
              {currentOrder.status === 'ESCROW_LOCKED' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={paymentRefInput}
                      onChange={(e) => setPaymentRefInput(e.target.value)}
                      placeholder="Bank / Payment Reference Number"
                      className="flex-1 px-3.5 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                  <button
                    id="mark-paid-action-btn"
                    onClick={handleMarkPaymentSent}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(0,255,65,0.2)] active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current" />
                    <span>I Have Transferred {currentOrder.fiatCurrency} {tradeFiatAmount.toFixed(2)}</span>
                  </button>
                </div>
              )}

              {/* If status is PAYMENT_SENT: Seller confirms and releases */}
              {currentOrder.status === 'PAYMENT_SENT' && (
                <div className="space-y-2">
                  <button
                    id="release-escrow-action-btn"
                    onClick={handleReleaseEscrow}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-sm bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase text-xs tracking-widest shadow-[0_0_15px_rgba(0,255,65,0.3)] active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <Unlock className="w-4 h-4 fill-current" />
                    <span>Confirm Receipt & Release BSV Escrow</span>
                  </button>
                  <p className="text-[11px] text-[#777] text-center">
                    This broadcasts the on-chain settlement transaction directly to {currentOrder.takerAddress || 'buyer address'}.
                  </p>
                </div>
              )}

              {/* Completed State */}
              {currentOrder.status === 'COMPLETED' && (
                <div className="p-3 rounded-sm bg-[#00FF41]/15 border border-[#00FF41]/40 text-[#00FF41] text-xs text-center font-bold uppercase tracking-wider">
                  🎉 On-chain settlement completed! Funds settled into wallet.
                </div>
              )}

              {/* Dispute Button */}
              {currentOrder.status !== 'COMPLETED' && currentOrder.status !== 'CANCELLED' && currentOrder.status !== 'DISPUTED' && (
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-[#666]">Encountered an issue?</span>
                  <button
                    onClick={() => setDisputeModalOpen(true)}
                    className="text-rose-400 hover:text-rose-300 font-bold uppercase text-[10px] tracking-wider underline flex items-center space-x-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>File Escrow Dispute</span>
                  </button>
                </div>
              )}

            </div>

            {/* PAYMENT INSTRUCTIONS */}
            <div className="p-3.5 rounded-sm bg-[#111] border border-[#222] text-xs">
              <div className="font-bold uppercase text-[#777] text-[10px] mb-1">Seller Payment Terms:</div>
              <p className="text-[#AAA] text-[11px] leading-relaxed font-sans">
                {currentOrder.paymentInstructions}
              </p>
            </div>

          </div>

          {/* RIGHT: LIVE TRADE CHAT & SYSTEM EVENT LOGS (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-[#050505] border-t lg:border-t-0 border-[#222]">
            
            <div className="p-3 sm:p-4 border-b border-[#222] bg-[#0A0A0A] flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5 uppercase text-[10px] tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></span>
                <span>P2P Trade Chat</span>
              </span>
              <span className="text-[#666] font-mono text-[10px]">End-to-End Encrypted</span>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[260px] max-h-[360px] lg:max-h-none font-mono text-xs">
              {currentOrder.chatMessages.map((msg) => {
                const isSystem = msg.sender === 'system';
                const isMe = (msg.sender === 'maker' && isMaker) || (msg.sender === 'taker' && !isMaker);

                if (isSystem) {
                  return (
                    <div key={msg.id} className="p-2.5 rounded-sm bg-[#111] border border-[#222] text-[11px] text-[#00FF41] leading-relaxed">
                      <div className="font-bold text-[#00FF41] text-[10px] uppercase flex items-center space-x-1 mb-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>System Protocol</span>
                      </div>
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] text-[#666] mb-0.5">
                      {isMe ? 'You' : (msg.sender === 'maker' ? currentOrder.makerHandle : currentOrder.takerHandle || 'Taker')}
                    </div>
                    <div className={`px-3 py-2 rounded-sm max-w-[85%] text-xs ${
                      isMe 
                        ? 'bg-[#141414] text-[#00FF41] border border-[#00FF41]/40' 
                        : 'bg-[#111] text-white border border-[#222]'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-[#555] mt-0.5">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#222] bg-[#0A0A0A] flex items-center space-x-2">
              <input
                id="p2p-chat-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message..."
                className="flex-1 px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-xs text-white focus:outline-none focus:border-[#00FF41]"
              />
              <button
                type="submit"
                className="p-2 rounded-sm bg-[#00FF41] text-black font-black hover:bg-[#00D436] active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* DISPUTE MODAL */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm font-mono">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#333] rounded-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-black uppercase text-white">File Escrow Dispute</h3>
            </div>
            <p className="text-xs text-[#777]">
              Disputing freezes the 2-of-2 on-chain escrow script and alerts automated arbiter mediation.
            </p>
            <textarea
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Explain the dispute issue..."
              className="w-full p-3 bg-[#111] border border-[#333] rounded-sm text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="px-4 py-2 rounded-sm text-xs font-bold uppercase text-[#777] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleFileDispute}
                disabled={!disputeReason.trim() || isProcessing}
                className="px-4 py-2 rounded-sm bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase text-xs transition-colors"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
