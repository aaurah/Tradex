import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Shield, Zap } from 'lucide-react';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const LiveSupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Welcome to Tradex (tradex.com). I am the Tradex Sovereign AI Assistant. How can I assist your trading session today?',
      time: 'Just now'
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const newMsg: ChatMessage = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    setTimeout(() => {
      let reply = 'Tradex operates non-custodial smart contracts across Base, Solana, and Bitcoin SV. All trades settle with near-zero gas and sub-second finality.';
      if (userText.toLowerCase().includes('fee') || userText.toLowerCase().includes('cost')) {
        reply = 'Tradex fee structure: 0.01% maker, 0.03% taker with 0.5 sat/byte settlement. $ORAH stakers get up to 50% discount.';
      } else if (userText.toLowerCase().includes('wallet') || userText.toLowerCase().includes('connect')) {
        reply = 'You can connect using any EVM wallet (MetaMask, Rainbow), Solana (Phantom), Bitcoin SV (HandCash, Sensilet), or create a Tradex Passkey in 1 click!';
      } else if (userText.toLowerCase().includes('bsv') || userText.toLowerCase().includes('token')) {
        reply = 'BSV/USDT, $ORAH, and $AURA spot & 50x futures are live on Tradex. Real-time depth is on-chain verifiably settled.';
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-[#0D0D0D] border border-[#222222] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[420px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-[#141414] border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#00FF41]/20 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">AURA Support AI</div>
                <div className="text-[10px] text-[#00FF41] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
                  <span>Tradex 24/7 Live Node</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[#777] hover:text-white hover:bg-[#202020] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#00FF41] text-black font-medium'
                      : 'bg-[#181818] text-[#E0E0E0] border border-[#262626]'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-[#555] mt-0.5 px-1 font-mono">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-[#111111] border-t border-[#1F1F1F] flex items-center space-x-1.5">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about markets, fees, or routing..."
              className="flex-1 px-3 py-2 bg-[#181818] border border-[#282828] rounded-xl text-white text-xs focus:outline-none focus:border-[#00FF41]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black transition-colors"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Action Button (Exact green chat circle from screenshot) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#00FF41] hover:bg-[#00D436] text-black shadow-[0_0_25px_rgba(0,255,65,0.4)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        title="Tradex AI Assistant"
      >
        <MessageSquare className="w-6 h-6 stroke-[2.2]" />
      </button>

    </div>
  );
};
