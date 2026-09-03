import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Rocket, 
  Mail, 
  Plug, 
  Globe, 
  Home, 
  Palette, 
  Megaphone, 
  Sliders, 
  ArrowLeftRight, 
  BarChart3, 
  DollarSign, 
  Cpu, 
  Copy, 
  Zap, 
  TrendingUp, 
  Link2, 
  Brain, 
  Bot, 
  Headphones, 
  Inbox, 
  Activity, 
  HeartPulse, 
  Wrench, 
  Server, 
  BarChart2, 
  LineChart, 
  Network, 
  Terminal, 
  Shield, 
  KeyRound, 
  UserCheck, 
  Layers, 
  BookOpen, 
  ArrowDownToLine, 
  Landmark, 
  Flame, 
  WalletCards, 
  BarChart4, 
  Database, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  Coins,
  RefreshCw,
  Sparkles,
  Menu
} from 'lucide-react';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminPlatform } from './admin/AdminPlatform';
import { AdminSystem } from './admin/AdminSystem';
import { AdminFinance } from './admin/AdminFinance';
import { AdminCustomization } from './admin/AdminCustomization';
import { AdminLoginModal } from './admin/AdminLoginModal';
import { adminAuthService, SUPER_ADMIN_EMAIL } from '../services/adminAuthService';

interface AdminPanelProps {
  onClose: () => void;
  onBackToExchange: () => void;
}

interface MenuCategory {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    category: 'overview' | 'customization' | 'platform' | 'ai' | 'support' | 'system' | 'security' | 'finance';
  }[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onBackToExchange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => adminAuthService.isAuthenticated());
  const [activeSubtab, setActiveSubtab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Accordion open/close state for menu categories
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    OVERVIEW: true,
    CUSTOMIZATION: true,
    PLATFORM: true,
    'AI INTELLIGENCE': true,
    SUPPORT: true,
    SYSTEM: true,
    SECURITY: true,
    FINANCE: true
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleLogout = () => {
    adminAuthService.logout();
    setIsAuthenticated(false);
  };

  // If not authenticated, render high-security login gate
  if (!isAuthenticated) {
    return (
      <AdminLoginModal
        onSuccess={() => setIsAuthenticated(true)}
        onCancel={onClose}
      />
    );
  }

  // Full menu structure matching the 3 screenshots
  const menuCategories: MenuCategory[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, category: 'overview' },
        { id: 'user_management', label: 'User Management', icon: <Users className="w-4 h-4" />, category: 'overview' },
        { id: 'setup_guide', label: 'Setup Guide', icon: <Rocket className="w-4 h-4" />, category: 'overview' },
        { id: 'email_inbox', label: 'Email Inbox', icon: <Mail className="w-4 h-4" />, category: 'overview' },
        { id: 'integrations', label: 'Integrations', icon: <Plug className="w-4 h-4" />, category: 'overview' },
      ]
    },
    {
      title: 'CUSTOMIZATION',
      items: [
        { id: 'site_settings', label: 'Site Settings', icon: <Globe className="w-4 h-4" />, category: 'customization' },
        { id: 'homepage_builder', label: 'Homepage Builder', icon: <Home className="w-4 h-4" />, category: 'customization' },
        { id: 'themes', label: 'Themes', icon: <Palette className="w-4 h-4" />, category: 'customization' },
        { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-4 h-4" />, category: 'customization' },
      ]
    },
    {
      title: 'PLATFORM',
      items: [
        { id: 'feature_flags', label: 'Feature Flags', icon: <Sliders className="w-4 h-4" />, category: 'platform' },
        { id: 'trade_pairs', label: 'Trade Pairs', icon: <ArrowLeftRight className="w-4 h-4" />, category: 'platform' },
        { id: 'trade_analytics', label: 'Trade Analytics', icon: <BarChart3 className="w-4 h-4" />, category: 'platform' },
        { id: 'fee_config', label: 'Fee Config', icon: <DollarSign className="w-4 h-4" />, category: 'platform' },
        { id: 'contracts_coins', label: 'Contracts & Coins', icon: <Cpu className="w-4 h-4" />, category: 'platform' },
        { id: 'copy_vault', label: 'CopyVault', icon: <Copy className="w-4 h-4" />, category: 'platform' },
        { id: 'prediction', label: 'Prediction', icon: <Zap className="w-4 h-4" />, category: 'platform' },
        { id: 'tradingview_feed', label: 'TradingView Feed', icon: <TrendingUp className="w-4 h-4" />, category: 'platform' },
        { id: 'cex_connections', label: 'CEX Connections', icon: <Link2 className="w-4 h-4" />, category: 'platform' },
      ]
    },
    {
      title: 'AI INTELLIGENCE',
      items: [
        { id: 'ora_ai_settings', label: 'Ora AI Settings', icon: <Brain className="w-4 h-4" />, category: 'ai' },
        { id: 'devai_settings', label: 'DevAI Settings', icon: <Bot className="w-4 h-4" />, category: 'ai' },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { id: 'support_contact', label: 'Support & Contact', icon: <Headphones className="w-4 h-4" />, category: 'support' },
        { id: 'support_inbox', label: 'Support Inbox', icon: <Inbox className="w-4 h-4" />, category: 'support' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'service_status', label: 'Service Status', icon: <Activity className="w-4 h-4" />, category: 'system' },
        { id: 'system_health', label: 'System Health', icon: <HeartPulse className="w-4 h-4" />, category: 'system' },
        { id: 'diagnostics', label: 'Diagnostics', icon: <Wrench className="w-4 h-4" />, category: 'system' },
        { id: 'server_control', label: 'Server Control', icon: <Server className="w-4 h-4" />, badge: 'NEW', category: 'system' },
        { id: 'api_monitor', label: 'API Monitor', icon: <BarChart2 className="w-4 h-4" />, category: 'system' },
        { id: 'liquidity_bot', label: 'Liquidity Bot', icon: <LineChart className="w-4 h-4" />, category: 'system' },
        { id: 'bsv_intents', label: 'BSV Intents', icon: <Network className="w-4 h-4" />, category: 'system' },
        { id: 'system_logs', label: 'System Logs', icon: <Terminal className="w-4 h-4" />, category: 'system' },
      ]
    },
    {
      title: 'SECURITY',
      items: [
        { id: 'security_settings', label: 'Security Settings', icon: <Shield className="w-4 h-4" />, category: 'security' },
        { id: 'api_settings', label: 'API Settings', icon: <KeyRound className="w-4 h-4" />, category: 'security' },
        { id: 'admin_users', label: 'Admin Users', icon: <UserCheck className="w-4 h-4" />, category: 'security' },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'all_profits', label: 'All Profits', icon: <TrendingUp className="w-4 h-4" />, category: 'finance' },
        { id: 'on_chain_txns', label: 'On-Chain Txns', icon: <Layers className="w-4 h-4" />, category: 'finance' },
        { id: 'ledger_manager', label: 'Ledger Manager', icon: <BookOpen className="w-4 h-4" />, category: 'finance' },
        { id: 'withdrawals', label: 'Withdrawals', icon: <ArrowDownToLine className="w-4 h-4" />, category: 'finance' },
        { id: 'treasury', label: 'Treasury', icon: <Landmark className="w-4 h-4" />, category: 'finance' },
        { id: 'mint_burn', label: 'Mint & Burn', icon: <Flame className="w-4 h-4" />, category: 'finance' },
        { id: 'fee_wallet', label: 'Fee Wallet', icon: <WalletCards className="w-4 h-4" />, category: 'finance' },
        { id: 'bot_profit', label: 'Bot Profit', icon: <BarChart4 className="w-4 h-4" />, category: 'finance' },
        { id: 'arb_bot', label: 'Arb Bot', icon: <Zap className="w-4 h-4" />, category: 'finance' },
        { id: 'seeded_pool', label: 'Seeded Pool', icon: <Database className="w-4 h-4" />, category: 'finance' },
        { id: 'db_sync', label: 'DB Sync', icon: <ShieldCheck className="w-4 h-4" />, category: 'finance' },
        { id: 'swap_income', label: 'Swap Income', icon: <DollarSign className="w-4 h-4" />, category: 'finance' },
      ]
    }
  ];

  // Render the appropriate main content panel
  const renderMainContent = () => {
    if (activeSubtab === 'dashboard') {
      return <AdminDashboard onNavigate={(tab) => setActiveSubtab(tab)} />;
    }

    const currentItem = menuCategories.flatMap(c => c.items).find(i => i.id === activeSubtab);
    const category = currentItem?.category || 'overview';

    if (category === 'platform') {
      return <AdminPlatform activeSubtab={activeSubtab} />;
    }

    if (category === 'system') {
      return <AdminSystem activeSubtab={activeSubtab} />;
    }

    if (category === 'finance') {
      return <AdminFinance activeSubtab={activeSubtab} />;
    }

    return <AdminCustomization activeSubtab={activeSubtab} />;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans select-none">
      
      {/* Main Admin Wrapper */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================= SIDEBAR (Matching screenshots 1, 2, 3) ================= */}
        <aside 
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B0B0B] border-r border-[#1C1C1C] flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          
          {/* Sidebar Top: Logo + Badge + Close */}
          <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* O Logo Badge */}
              <div className="w-9 h-9 rounded-xl bg-[#00FF41] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,65,0.3)]">
                <span className="text-black font-black text-xl">O</span>
              </div>
              <div>
                <div className="font-black text-base text-white tracking-tight leading-none">
                  Orah<span className="text-[#00FF41]">DEX</span>
                </div>
                <span className="inline-block mt-1 text-[9px] font-mono font-black uppercase text-[#00FF41] bg-[#00FF41]/10 px-2 py-0.2 rounded border border-[#00FF41]/20">
                  ADMIN
                </span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#242424] text-[#888] hover:text-white transition-colors"
              title="Close Admin Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar matching screenshot */}
          <div className="p-3 border-b border-[#161616]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search... (⌘K)"
                className="w-full pl-8 pr-3 py-1.5 bg-[#121212] border border-[#222222] rounded-lg text-white font-mono text-xs placeholder-[#555] focus:outline-none focus:border-[#00FF41]"
              />
            </div>
          </div>

          {/* Navigation Accordion List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar font-mono text-xs">
            {menuCategories.map((cat) => {
              const filteredItems = cat.items.filter(item => 
                item.label.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (searchQuery && filteredItems.length === 0) return null;

              return (
                <div key={cat.title} className="space-y-1">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(cat.title)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-[#666] uppercase tracking-wider hover:text-[#999] transition-colors"
                  >
                    <span>{cat.title}</span>
                    {expandedCategories[cat.title] ? (
                      <ChevronDown className="w-3 h-3 text-[#555]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-[#555]" />
                    )}
                  </button>

                  {/* Category Items */}
                  {expandedCategories[cat.title] && (
                    <div className="space-y-0.5 pl-1">
                      {filteredItems.map((item) => {
                        const isActive = activeSubtab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveSubtab(item.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                              isActive
                                ? 'bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] font-bold shadow-sm'
                                : 'text-[#888] hover:text-white hover:bg-[#141414]'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <span className={isActive ? 'text-[#00FF41]' : 'text-[#666]'}>
                                {item.icon}
                              </span>
                              <span className="truncate">{item.label}</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30">
                                  {item.badge}
                                </span>
                              )}
                              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#00FF41]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Admin Profile Card (Matching Screenshot 3 bottom section) */}
          <div className="p-3 border-t border-[#1C1C1C] bg-[#080808] space-y-2.5">
            {/* User Profile */}
            <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="w-8 h-8 rounded-full bg-[#00FF41] text-black font-black flex items-center justify-center text-xs">
                A
              </div>
              <div className="flex-1 min-w-0 font-mono">
                <div className="text-white font-bold text-xs truncate flex items-center space-x-1.5">
                  <span>SUPER ADMIN</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
                </div>
                <div className="text-[10px] text-[#00FF41] font-bold truncate">aurashampy@gmail.com</div>
              </div>
            </div>

            {/* Back to Exchange & Sign out actions */}
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <button
                onClick={onBackToExchange}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-white flex items-center justify-center space-x-1 font-bold transition-colors"
              >
                <span>⇄</span>
                <span>Exchange</span>
              </button>

              <button
                onClick={handleLogout}
                className="py-1.5 px-2.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 flex items-center justify-center space-x-1 transition-colors"
                title="Lock Terminal & Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">Lock</span>
              </button>
            </div>
          </div>

        </aside>

        {/* Backdrop for mobile sidebar */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* ================= MAIN CONTENT VIEWPORT ================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#050505] overflow-y-auto">
          
          {/* Top Bar for Mobile Menu Toggle */}
          <div className="lg:hidden p-3 border-b border-[#1A1A1A] bg-[#0A0A0A] flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-[#141414] border border-[#242424] text-[#00FF41] flex items-center space-x-2 text-xs font-mono font-bold"
            >
              <Menu className="w-4 h-4" />
              <span>Admin Menu</span>
            </button>

            <div className="font-bold text-xs font-mono text-white">
              Orah<span className="text-[#00FF41]">DEX</span> Admin
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#141414] border border-[#242424] text-[#888] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Render Active Module */}
          <div className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            {renderMainContent()}
          </div>

        </main>

      </div>

    </div>
  );
};
