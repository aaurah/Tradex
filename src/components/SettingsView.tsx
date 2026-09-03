import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useTheme, AppTheme } from '../context/ThemeContext';
import { copyToClipboard } from '../utils/clipboard';
import { LegalDocsModal, DocType } from './LegalDocsModal';
import { 
  Wallet,
  Shield,
  ChevronRight,
  LogOut,
  Percent,
  Zap,
  DollarSign,
  Palette,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Bell,
  Volume2,
  Key,
  Headphones,
  MessageSquare,
  Mail,
  HelpCircle,
  Info,
  Activity,
  FileText,
  Lock,
  Check,
  X,
  ExternalLink,
  Copy
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { account, isConnected, openWalletModal, disconnectWallet } = useWallet();
  const { theme, setTheme } = useTheme();

  // Settings State
  const [slippage, setSlippage] = useState('0.5%');
  const [leverage, setLeverage] = useState('10x');
  const [quoteCurrency, setQuoteCurrency] = useState('USDT');
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [legalDocType, setLegalDocType] = useState<DocType | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Simulated API Key
  const [apiKey, setApiKey] = useState('tradex_live_9f82a1c0d3e5b741098aa964682');
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleCopyKey = async () => {
    await copyToClipboard(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
    showToast('API Key copied to clipboard!');
  };

  const openLegalDoc = (type: DocType) => {
    setLegalDocType(type);
  };

  const openLiveChat = () => {
    window.dispatchEvent(new CustomEvent('open-ora-chat'));
    showToast('Opening 24/7 Live Support Chat...');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8 space-y-6 font-sans select-none text-[#E0E0E0] pb-24">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#00FF41] text-black text-xs font-mono font-bold shadow-[0_0_20px_rgba(0,255,65,0.4)] animate-in fade-in slide-in-from-bottom-2">
          {toastMsg}
        </div>
      )}

      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Settings</h1>

      {/* ================= 1. WALLET ================= */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-bold tracking-wider text-[#666] uppercase px-1">WALLET</h2>
        <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] divide-y divide-[#181818] overflow-hidden">
          
          {/* Connected Wallet */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#3A2E12]/50 border border-[#C69A2C]/30 flex items-center justify-center text-[#E5B53A]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Connected Wallet</div>
                <div className="text-xs text-[#888] font-mono">
                  {isConnected 
                    ? `WalletConnect · ${account?.address ? `${account.address.slice(0, 10)}...` : '0x67c7f23e...'}`
                    : 'Not connected'}
                </div>
              </div>
            </div>
            {!isConnected && (
              <button
                onClick={openWalletModal}
                className="px-3 py-1 rounded-lg bg-[#00FF41] text-black text-xs font-bold"
              >
                Connect
              </button>
            )}
          </div>

          {/* Network */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#3A2E12]/50 border border-[#C69A2C]/30 flex items-center justify-center text-[#E5B53A]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Network</div>
                <div className="text-xs text-[#888]">
                  {account?.chainType === 'bsv' ? 'Bitcoin SV Mainnet' : account?.chainType === 'solana' ? 'Solana Mainnet' : 'EVM (Ethereum)'}
                </div>
              </div>
            </div>
          </div>

          {/* Open wallet */}
          <button 
            onClick={openWalletModal}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#112F1C]/70 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-[#00FF41] transition-colors">Open wallet</div>
                <div className="text-xs text-[#888]">All chains, send / receive, swap, history</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </button>

          {/* Disconnect Wallet */}
          <button 
            onClick={() => {
              if (isConnected) {
                disconnectWallet();
                showToast('Wallet disconnected.');
              } else {
                openWalletModal();
              }
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-[#1A1111] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#2E1212]/70 border border-red-500/30 flex items-center justify-center text-red-500">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-red-500">Disconnect Wallet</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-500/60 group-hover:text-red-400 transition-colors" />
          </button>

        </div>
      </div>

      {/* ================= 2. TRADING ================= */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-bold tracking-wider text-[#666] uppercase px-1">TRADING</h2>
        <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] divide-y divide-[#181818] overflow-hidden">
          
          {/* Default Slippage */}
          <button 
            onClick={() => setActiveModal('slippage')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-white">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Default Slippage</div>
                <div className="text-xs text-[#888]">{slippage} · used on market orders</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </button>

          {/* Default Leverage */}
          <button 
            onClick={() => setActiveModal('leverage')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-white">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Default Leverage</div>
                <div className="text-xs text-[#888]">{leverage} · pre-fills Futures & Prediction</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </button>

          {/* Quote Currency */}
          <button 
            onClick={() => setActiveModal('currency')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-white">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Quote Currency</div>
                <div className="text-xs text-[#888]">{quoteCurrency}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </button>

        </div>
      </div>

      {/* ================= 3. PREFERENCES ================= */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-bold tracking-wider text-[#666] uppercase px-1">PREFERENCES</h2>
        <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] divide-y divide-[#181818] overflow-hidden">
          
          {/* Appearance */}
          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888]">
                <Palette className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-white">Appearance</div>
            </div>

            {/* 4 Cards: Dark, Light, Amoled (Active), System */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'amoled', label: 'Amoled', icon: Smartphone },
                { id: 'system', label: 'System', icon: Monitor }
              ].map(themeItem => {
                const IconComp = themeItem.icon;
                const isSelected = theme === themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    onClick={() => {
                      setTheme(themeItem.id as AppTheme);
                      showToast(`Theme switched to ${themeItem.label} mode!`);
                    }}
                    className={`relative p-3 rounded-xl flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      isSelected
                        ? 'bg-[#151515] border-2 border-[#00FF41] text-white shadow-[0_0_15px_rgba(0,255,65,0.15)]'
                        : 'bg-[#121212] border border-[#222] text-[#777] hover:text-white hover:bg-[#181818]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00FF41]"></span>
                    )}
                    <IconComp className={`w-5 h-5 ${isSelected ? 'text-[#00FF41]' : ''}`} />
                    <span className="text-xs font-semibold">{themeItem.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Alerts */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Price Alerts</div>
                <div className="text-xs text-[#888]">Tap to set a target price</div>
              </div>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={() => setPriceAlerts(!priceAlerts)}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 relative ${
                priceAlerts ? 'bg-[#00FF41]' : 'bg-[#2A2A2A]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  priceAlerts ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notification Sound */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888]">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Notification Sound</div>
              </div>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={() => setNotificationSound(!notificationSound)}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 relative ${
                notificationSound ? 'bg-[#00FF41]' : 'bg-[#2A2A2A]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  notificationSound ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* ================= 4. API ACCESS ================= */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-bold tracking-wider text-[#666] uppercase px-1">API ACCESS</h2>
        <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] divide-y divide-[#181818] overflow-hidden">
          
          <button 
            onClick={() => setActiveModal('api')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-white">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">API Keys</div>
                <div className="text-xs text-[#888]">Generate keys for bots & integrations</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </button>

        </div>
      </div>

      {/* ================= 5. SUPPORT ================= */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-bold tracking-wider text-[#666] uppercase px-1">SUPPORT</h2>
        <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] divide-y divide-[#181818] overflow-hidden">
          
          {/* Help Centre */}
          <button 
            onClick={() => setActiveModal('help')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-white">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Help Centre</div>
                <div className="text-xs text-[#888]">FAQs, guides & contact form</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </button>

          {/* Live Chat */}
          <button 
            onClick={openLiveChat}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-[#00FF41]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Live Chat & Support</div>
                <div className="text-xs text-[#888]">Chat directly with Tradex & Pulse support desk</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] font-mono text-[10px] font-bold border border-[#00FF41]/20">
              24/7 LIVE
            </span>
          </button>

          {/* Email Support */}
          <a 
            href="mailto:support@tradex.com?subject=Tradex%20Support%20Inquiry"
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-white">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Email Support Desk</div>
                <div className="text-xs text-[#888]">support@tradex.com</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </a>

          {/* FAQ */}
          <button 
            onClick={() => openLegalDoc('faq')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-[#00FF41]">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">FAQ & Help Knowledgebase</div>
                <div className="text-xs text-[#888]">Browse common questions, escrow guides & trading</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </button>

        </div>
      </div>

      {/* ================= 6. ABOUT & LEGAL ================= */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-bold tracking-wider text-[#666] uppercase px-1">ABOUT & LEGAL</h2>
        <div className="rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] divide-y divide-[#181818] overflow-hidden">
          
          {/* Version */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888]">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Version</div>
                <div className="text-xs text-[#888]">Tradex & Pulse Sovereign Core</div>
              </div>
            </div>
            <div className="text-xs text-[#00FF41] font-mono font-bold">v8.4.2</div>
          </div>

          {/* System Status */}
          <button 
            onClick={() => openLegalDoc('status')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-white">
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-white">System Status</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></span>
              <span className="text-xs text-[#888]">All systems operational</span>
              <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
            </div>
          </button>

          {/* White Paper */}
          <button 
            onClick={() => openLegalDoc('whitepaper')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-[#00FF41]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">White Paper (v2.4)</div>
                <div className="text-xs text-[#888]">Tradex & Pulse protocol specification, tokenomics & perps engine</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] font-mono text-[10px] font-bold">
              VIEW DOC
            </span>
          </button>

          {/* Terms of Service */}
          <button 
            onClick={() => openLegalDoc('terms')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-[#00FF41]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Terms of Service</div>
                <div className="text-xs text-[#888]">Non-custodial user agreements & risk disclosure</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </button>

          {/* Privacy Policy */}
          <button 
            onClick={() => openLegalDoc('privacy')}
            className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888] group-hover:text-[#00FF41]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Privacy Policy</div>
                <div className="text-xs text-[#888]">Zero PII collection & cryptographic public key terms</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
          </button>

        </div>
      </div>

      {/* ================= 7. FOOTER ================= */}
      <div className="pt-8 pb-4 text-center space-y-1.5 border-t border-[#141414]">
        <div className="flex items-center justify-center space-x-1.5 font-black text-xl tracking-tight">
          <span className="text-white">Tradex</span>
          <span className="text-[#00FF41]">& Pulse</span>
        </div>
        <div className="text-xs font-black tracking-widest text-[#00FF41]">
          AUTONOMOUS AI PERPETUAL DEX & ESCROW NETWORK
        </div>
        <div className="text-[11px] text-[#666]">
          Non-custodial · On-chain settlement · BSV • Base • Solana
        </div>
      </div>

      {/* Legal Documents Comprehensive Reader Modal */}
      {legalDocType && (
        <LegalDocsModal
          isOpen={true}
          docType={legalDocType}
          onClose={() => setLegalDocType(null)}
          onSelectDocType={(t) => setLegalDocType(t)}
        />
      )}

      {/* ================= MODALS ================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#111111] border border-[#262626] p-5 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#222]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {activeModal === 'slippage' && 'Default Slippage'}
                {activeModal === 'leverage' && 'Default Leverage'}
                {activeModal === 'currency' && 'Quote Currency'}
                {activeModal === 'api' && 'API Keys'}
                {activeModal === 'help' && 'Help Centre'}
                {activeModal === 'live_chat' && 'Ora AI Support'}
                {activeModal === 'faq' && 'Frequently Asked Questions'}
                {activeModal === 'status' && 'System Status'}
                {activeModal === 'whitepaper' && 'OrahDEX White Paper'}
                {activeModal === 'terms' && 'Terms of Service'}
                {activeModal === 'privacy' && 'Privacy Policy'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-lg bg-[#1C1C1C] text-[#888] hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Slippage Modal */}
            {activeModal === 'slippage' && (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {['0.1%', '0.5%', '1.0%', '2.0%'].map(val => (
                    <button
                      key={val}
                      onClick={() => {
                        setSlippage(val);
                        setActiveModal(null);
                        showToast(`Default slippage set to ${val}`);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                        slippage === val
                          ? 'bg-[#00FF41] text-black'
                          : 'bg-[#181818] border border-[#282828] text-white hover:border-[#00FF41]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#777]">Slippage is the maximum price variance permitted on market order fills before on-chain revert.</p>
              </div>
            )}

            {/* Leverage Modal */}
            {activeModal === 'leverage' && (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {['2x', '5x', '10x', '25x', '50x'].map(val => (
                    <button
                      key={val}
                      onClick={() => {
                        setLeverage(val);
                        setActiveModal(null);
                        showToast(`Default leverage set to ${val}`);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                        leverage === val
                          ? 'bg-[#00FF41] text-black'
                          : 'bg-[#181818] border border-[#282828] text-white hover:border-[#00FF41]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#777]">Default leverage automatically pre-fills position sizes on perpetual futures & prediction markets.</p>
              </div>
            )}

            {/* Currency Modal */}
            {activeModal === 'currency' && (
              <div className="space-y-2">
                {['USDT', 'USD', 'EUR', 'BTC', 'BSV'].map(val => (
                  <button
                    key={val}
                    onClick={() => {
                      setQuoteCurrency(val);
                      setActiveModal(null);
                      showToast(`Quote currency set to ${val}`);
                    }}
                    className={`w-full p-3 rounded-xl text-xs font-bold font-mono flex items-center justify-between transition-all ${
                      quoteCurrency === val
                        ? 'bg-[#00FF41]/10 border border-[#00FF41] text-[#00FF41]'
                        : 'bg-[#181818] border border-[#242424] text-white hover:border-[#444]'
                    }`}
                  >
                    <span>{val}</span>
                    {quoteCurrency === val && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}

            {/* API Modal */}
            {activeModal === 'api' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#888]">Use your Sovereign API Key to connect trading bots, quantitative scripts, and terminal extensions.</p>
                <div className="p-3 bg-[#161616] rounded-xl border border-[#262626] font-mono text-[11px] flex items-center justify-between">
                  <span className="text-white truncate">{apiKey}</span>
                  <button onClick={handleCopyKey} className="ml-2 text-[#888] hover:text-white">
                    {apiKeyCopied ? <Check className="w-4 h-4 text-[#00FF41]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    const newKey = `odx_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
                    setApiKey(newKey);
                    showToast('Generated new API Key!');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#00FF41] text-black font-bold"
                >
                  Generate New API Key
                </button>
              </div>
            )}

            {/* Help / FAQ / Whitepaper / Status */}
            {(activeModal === 'help' || activeModal === 'faq' || activeModal === 'live_chat' || activeModal === 'status' || activeModal === 'whitepaper' || activeModal === 'terms' || activeModal === 'privacy') && (
              <div className="space-y-3 text-xs text-[#AAA] leading-relaxed">
                {activeModal === 'help' && (
                  <div>
                    <p>OrahDEX is a sovereign non-custodial decentralized exchange. Funds remain in your crypto wallet until atomic settlement across Bitcoin SV, Base, and Solana.</p>
                    <p className="mt-2 text-white font-bold">24/7 Support Desk: support@orahdex.org</p>
                  </div>
                )}
                {activeModal === 'live_chat' && (
                  <div>
                    <p>Ora AI is ready to help with orders, market routing, wallet integration, and on-chain verification.</p>
                    <button 
                      onClick={() => setActiveModal(null)}
                      className="mt-3 w-full py-2.5 rounded-xl bg-[#00FF41] text-black font-bold"
                    >
                      Open Live Chat Drawer
                    </button>
                  </div>
                )}
                {activeModal === 'status' && (
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between py-1 border-b border-[#222]">
                      <span className="text-white">BSV Settlement Engine:</span>
                      <span className="text-[#00FF41]">99.99% Online (8ms)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#222]">
                      <span className="text-white">Base / EVM Relayers:</span>
                      <span className="text-[#00FF41]">Operational (14ms)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#222]">
                      <span className="text-white">Orderbook Matching Engine:</span>
                      <span className="text-[#00FF41]">Active (Sub-millisecond)</span>
                    </div>
                  </div>
                )}
                {activeModal === 'whitepaper' && (
                  <div>
                    <p className="font-bold text-white">OrahDEX Architecture & Consensus</p>
                    <p className="mt-1">High-throughput on-chain atomic swap settlement with near-zero network fees, utilizing zero-knowledge state channels and deterministic Bitcoin SV UTXO state trees.</p>
                  </div>
                )}
                {(activeModal === 'terms' || activeModal === 'privacy') && (
                  <div>
                    <p>OrahDEX is completely non-custodial and open protocol. No personal identifying information is tracked, collected, or stored.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
