import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Shield, Zap, UserCheck, CheckCircle2 } from 'lucide-react';
import { liveChatService, ChatMessage, ChatSession } from '../services/liveChatService';
import { useWallet } from '../context/WalletContext';

export const LiveSupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [session, setSession] = useState<ChatSession>(() => liveChatService.getActiveSession());
  const [chatMode, setChatMode] = useState<'ai' | 'admin'>('ai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { account } = useWallet();

  useEffect(() => {
    const unsub = liveChatService.subscribe(() => {
      setSession(liveChatService.getActiveSession());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-ora-chat', handleOpenChat);
    return () => window.removeEventListener('open-ora-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal('');

    // Send to liveChatService so admin panel receives it immediately!
    liveChatService.sendUserMessage(userText, account || undefined);

    // If chat mode is AI or user asks general question, provide instant AI assistant answers as well
    if (chatMode === 'ai') {
      setTimeout(() => {
        let reply = 'Tradex & Pulse DEX operates non-custodial smart contracts across Bitcoin SV (Teranode), Base (EVM), and Solana. All trades settle with near-zero gas and sub-second finality.';
        const lower = userText.toLowerCase();

        if (lower.includes('admin') || lower.includes('human') || lower.includes('agent') || lower.includes('help')) {
          reply = 'I have notified our Live Support Admin Desk. An on-duty administrator can view your message in the Admin Panel Support Inbox and reply directly!';
          setChatMode('admin');
        } else if (lower.includes('fee') || lower.includes('cost')) {
          reply = 'Tradex & Pulse fee schedule: 0.01% maker, 0.03% taker with 0.5 sat/byte settlement on BSV. Stakers holding $ORAH or $PULSE get up to 50% discount.';
        } else if (lower.includes('escrow') || lower.includes('contract')) {
          reply = 'Smart escrow contracts are non-custodial and timelocked. Counterparties lock funds on-chain; release occurs automatically upon cryptographic proof or mutual signature.';
        } else if (lower.includes('wallet') || lower.includes('connect')) {
          reply = 'You can connect EVM Web3 wallets (MetaMask, Rabby), Solana wallets (Phantom), Sensilet for BSV, or Biometric Passkeys in the top right Navbar!';
        } else if (lower.includes('swap') || lower.includes('exchange')) {
          reply = 'You can swap coins directly on the Exchange tab using the "⇄ Swap Coins" button, or browse 22M+ markets with zero slippage.';
        }

        liveChatService.sendAIMessage(session.id, reply);
      }, 700);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-[#0D0D0D] border border-[#222222] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[460px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-[#141414] border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00FF41]/20 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41]">
                {chatMode === 'admin' ? <UserCheck className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center space-x-1.5">
                  <span>Tradex & Pulse Live Support</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#00FF41]/10 text-[#00FF41] text-[9px] font-mono font-bold">24/7 LIVE</span>
                </div>
                <div className="text-[10px] text-[#00FF41] flex items-center space-x-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
                  <span>{chatMode === 'admin' ? 'Connected to Admin Desk' : 'Ora AI + Admin Desk Connected'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#777] hover:text-white hover:bg-[#202020] transition-colors"
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Banner */}
          <div className="px-3 py-1.5 bg-[#101010] border-b border-[#1C1C1C] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#888]">Channel:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setChatMode('ai')}
                className={`px-2 py-0.5 rounded ${chatMode === 'ai' ? 'bg-[#00FF41]/20 text-[#00FF41] font-bold' : 'text-[#666] hover:text-white'}`}
              >
                Ora AI
              </button>
              <span className="text-[#444]">|</span>
              <button
                onClick={() => setChatMode('admin')}
                className={`px-2 py-0.5 rounded ${chatMode === 'admin' ? 'bg-[#00FF41]/20 text-[#00FF41] font-bold' : 'text-[#666] hover:text-white'}`}
              >
                Human Admin
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {session.messages.map((m) => {
              const isUser = m.sender === 'user';
              const isAdmin = m.sender === 'admin';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[9px] text-[#666] px-1 mb-0.5 font-mono">
                    {isAdmin ? '🛡️ Admin Support Desk' : isUser ? 'You' : '🤖 Ora AI'} • {m.timestamp}
                  </div>
                  <div
                    className={`max-w-[85%] p-2.5 rounded-xl leading-relaxed ${
                      isUser
                        ? 'bg-[#00FF41] text-black font-semibold'
                        : isAdmin
                        ? 'bg-[#18281C] text-[#33FF66] border border-[#00FF41]/40'
                        : 'bg-[#181818] text-[#E0E0E0] border border-[#262626]'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-[#111111] border-t border-[#1F1F1F] flex items-center space-x-1.5">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={chatMode === 'admin' ? "Message Tradex admin desk directly..." : "Ask about markets, swaps, escrow, or type 'admin'..."}
              className="flex-1 px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-white text-xs focus:outline-none focus:border-[#00FF41]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black transition-colors"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Action Button with unread indicator */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 rounded-full bg-[#00FF41] hover:bg-[#00D436] text-black shadow-[0_0_25px_rgba(0,255,65,0.4)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        title="Tradex & Pulse Live Support Desk"
      >
        <MessageSquare className="w-6 h-6 stroke-[2.2]" />
        {session.messages.some(m => m.sender === 'admin' && !isOpen) && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-black animate-pulse" />
        )}
      </button>

    </div>
  );
};
