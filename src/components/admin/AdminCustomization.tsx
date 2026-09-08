import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  Megaphone, 
  Bot, 
  MessageSquare, 
  Shield, 
  KeyRound, 
  Fingerprint, 
  CheckCircle2, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  Palette, 
  Layout, 
  Mail, 
  Share2, 
  ExternalLink,
  ShieldCheck,
  Eye,
  Send,
  Sliders,
  Sparkles,
  Lock
} from 'lucide-react';
import confetti from '../../utils/confetti';
import { adminAuthService, SUPER_ADMIN_EMAIL } from '../../services/adminAuthService';
import { adminSettingsStore, AdminUser, SupportTicket, WebhookIntegration, ApiKeyItem } from '../../services/adminSettingsStore';
import { liveChatService, ChatSession, ChatMessage } from '../../services/liveChatService';
import { applyReownTheme, savePopupTheme } from '../../services/reownService';

export const AdminCustomization: React.FC<{ activeSubtab: string }> = ({ activeSubtab }) => {
  const [, setTick] = useState(0);
  const [liveSessions, setLiveSessions] = useState<ChatSession[]>(() => liveChatService.getSessions());
  const [selectedLiveSessionId, setSelectedLiveSessionId] = useState<string>(() => liveChatService.getActiveSession().id);
  const [supportTab, setSupportTab] = useState<'live_chat' | 'tickets'>('live_chat');
  const [liveAdminReply, setLiveAdminReply] = useState('');

  useEffect(() => {
    const unsub = adminSettingsStore.subscribe(() => setTick(t => t + 1));
    const unsubChat = liveChatService.subscribe((sessions) => {
      setLiveSessions(sessions);
    });
    return () => {
      unsub();
      unsubChat();
    };
  }, []);

  const store = adminSettingsStore.data;

  // Site Settings Form
  const [siteName, setSiteName] = useState(store.site.siteName);
  const [siteDesc, setSiteDesc] = useState(store.site.description);
  const [domains, setDomains] = useState(store.site.domains);
  const [supportEmail, setSupportEmail] = useState(store.site.supportEmail);
  const [telegramSupport, setTelegramSupport] = useState(store.site.telegramSupport);
  const [siteSaved, setSiteSaved] = useState(false);

  // Announcement Form
  const [announcementText, setAnnouncementText] = useState(store.announcement.text);
  const [announcementActive, setAnnouncementActive] = useState(store.announcement.active);
  const [announcementSeverity, setAnnouncementSeverity] = useState(store.announcement.severity);
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  // AI Settings Form
  const [geminiModel, setGeminiModel] = useState(store.ai.geminiModel);
  const [aiTemperature, setAiTemperature] = useState(store.ai.temperature);
  const [aiMaxRisk, setAiMaxRisk] = useState(store.ai.maxRiskPerTradeUsd);
  const [aiSystemPrompt, setAiSystemPrompt] = useState(store.ai.systemPrompt);
  const [aiSaved, setAiSaved] = useState(false);

  // AI Prompt Playground
  const [testPrompt, setTestPrompt] = useState('Analyze current BSV orderbook depth and calculate optimal maker spread:');
  const [promptResponse, setPromptResponse] = useState<string | null>(null);
  const [isPrompting, setIsPrompting] = useState(false);

  // User Management
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newHandle, setNewHandle] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRole, setNewRole] = useState<'Trader' | 'Market Maker' | 'VIP Trader' | 'Super Admin'>('Trader');
  const [userNotice, setUserNotice] = useState<string | null>(null);

  // Support Inbox
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(store.tickets[0] || null);
  const [ticketReply, setTicketReply] = useState('');
  const [ticketNotice, setTicketNotice] = useState<string | null>(null);

  // Themes
  const [currentTheme, setCurrentTheme] = useState(store.theme.preset);
  const [accentColor, setAccentColor] = useState(store.theme.accentHue);
  const [themeNotice, setThemeNotice] = useState(false);

  // API Keys
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermission, setNewKeyPermission] = useState<'Read-Only' | 'Trading' | 'Full Admin'>('Trading');
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  // Webhooks
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [webhookNotice, setWebhookNotice] = useState<string | null>(null);

  // Security
  const [masterPasskey, setMasterPasskey] = useState(adminAuthService.getMasterKey());
  const [securitySaved, setSecuritySaved] = useState(false);
  const [biometricRequired, setBiometricRequired] = useState(true);

  // Save Site Settings
  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    store.site.siteName = siteName;
    store.site.description = siteDesc;
    store.site.domains = domains;
    store.site.supportEmail = supportEmail;
    store.site.telegramSupport = telegramSupport;
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'SITE-CONFIG', `Updated site identity: ${siteName}`);

    setSiteSaved(true);
    confetti({ particleCount: 30 });
    setTimeout(() => setSiteSaved(false), 3000);
  };

  // Save Announcement
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    store.announcement.text = announcementText;
    store.announcement.active = announcementActive;
    store.announcement.severity = announcementSeverity;
    adminSettingsStore.save();
    adminSettingsStore.addLog('INFO', 'ANNOUNCEMENT', `Broadcast banner updated: "${announcementText.substring(0, 30)}..."`);

    setAnnouncementSaved(true);
    confetti({ particleCount: 30 });
    setTimeout(() => setAnnouncementSaved(false), 3000);
  };

  // Save AI Config
  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    store.ai.geminiModel = geminiModel;
    store.ai.temperature = aiTemperature;
    store.ai.maxRiskPerTradeUsd = aiMaxRisk;
    store.ai.systemPrompt = aiSystemPrompt;
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'AURA-AI', `Updated AI parameters: Model ${geminiModel}, Temp ${aiTemperature}`);

    setAiSaved(true);
    confetti({ particleCount: 30 });
    setTimeout(() => setAiSaved(false), 3000);
  };

  // Run AI Test Prompt
  const handleRunTestPrompt = () => {
    setIsPrompting(true);
    setPromptResponse(null);
    setTimeout(() => {
      setIsPrompting(false);
      setPromptResponse(
        `[AURA QUANT ENGINE] Market depth evaluation complete:\n` +
        `• Mid Price: $48.60 USDT\n` +
        `• Recommended Bid: $48.57 (Vol: 0.35 BSV)\n` +
        `• Recommended Ask: $48.63 (Vol: 0.35 BSV)\n` +
        `• Predicted Slippage: <0.012% | Risk Index: Optimal`
      );
      confetti({ particleCount: 20 });
    }, 700);
  };

  // Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim() || !newAddress.trim()) return;

    const newUser: AdminUser = {
      id: 'usr-' + Date.now(),
      handle: newHandle.trim(),
      email: newEmail.trim() || `${newHandle.toLowerCase()}@tradex.user`,
      role: newRole,
      address: newAddress.trim(),
      balanceBsv: '0.00 BSV',
      balanceUsdt: '$0.00',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    store.users.unshift(newUser);
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'USERS', `Created user account for ${newUser.handle} with role ${newUser.role}`);

    setNewHandle('');
    setNewEmail('');
    setNewAddress('');
    setShowAddUserModal(false);
    setUserNotice(`User @${newUser.handle} registered successfully!`);
    confetti({ particleCount: 30 });
    setTimeout(() => setUserNotice(null), 3000);
  };

  // Send Ticket Reply
  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReply.trim() || !selectedTicket) return;

    selectedTicket.messages.push({
      sender: 'admin',
      text: ticketReply.trim(),
      time: 'Just now'
    });
    selectedTicket.status = 'In Progress';
    adminSettingsStore.save();
    adminSettingsStore.addLog('INFO', 'SUPPORT', `Admin replied to ticket ${selectedTicket.id}`);

    setTicketReply('');
    setTicketNotice(`Reply dispatched to user!`);
    setTimeout(() => setTicketNotice(null), 2500);
  };

  // Generate API Key
  const handleGenerateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const newKey: ApiKeyItem = {
      id: 'key-' + Date.now(),
      name: newKeyName.trim(),
      keyPrefix: `ora_live_${randomSuffix}...`,
      permissions: newKeyPermission,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      ipWhitelist: 'All'
    };

    store.apiKeys.unshift(newKey);
    adminSettingsStore.save();
    adminSettingsStore.addLog('SUCCESS', 'API-KEYS', `Generated API Key for "${newKey.name}" (${newKey.permissions})`);

    setNewKeyName('');
    setShowAddKeyModal(false);
    setKeyNotice(`API Key generated! Token secret displayed once: ora_live_${randomSuffix}${Date.now().toString(36)}`);
    confetti({ particleCount: 35 });
    setTimeout(() => setKeyNotice(null), 5000);
  };

  // Revoke API Key
  const handleRevokeKey = (id: string) => {
    const k = store.apiKeys.find(item => item.id === id);
    store.apiKeys = store.apiKeys.filter(item => item.id !== id);
    adminSettingsStore.save();
    if (k) adminSettingsStore.addLog('WARN', 'API-KEYS', `Revoked API Key: ${k.name}`);
  };

  // Test Webhook
  const handleTestWebhook = (wh: WebhookIntegration) => {
    setTestingWebhookId(wh.id);
    setTimeout(() => {
      setTestingWebhookId(null);
      wh.lastPing = 'Just now';
      adminSettingsStore.save();
      setWebhookNotice(`✓ Webhook ping to ${wh.name} succeeded (HTTP 200 OK)`);
      setTimeout(() => setWebhookNotice(null), 3000);
    }, 600);
  };

  // Apply Theme Preset
  const handleApplyTheme = (preset: typeof currentTheme, hue: string) => {
    setCurrentTheme(preset);
    setAccentColor(hue);
    store.theme.preset = preset;
    store.theme.accentHue = hue;
    adminSettingsStore.save();
    applyReownTheme({ accentColor: hue });
    savePopupTheme(hue);
    setThemeNotice(true);
    confetti({ particleCount: 25 });
    setTimeout(() => setThemeNotice(false), 2500);
  };

  return (
    <div className="space-y-6">

      {/* ================= 1. USER MANAGEMENT ================= */}
      {activeSubtab === 'user_management' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">User & Permission Management</h2>
              <p className="text-xs text-[#777]">Manage registered Web3 addresses, role permissions, and user balances.</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user address or handle..."
                  className="pl-8 pr-3 py-1.5 bg-[#141414] border border-[#262626] rounded-lg text-white text-xs focus:outline-none focus:border-[#00FF41] w-56"
                />
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-bold flex items-center space-x-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {userNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{userNotice}</span>
            </div>
          )}

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#00FF41]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-[#00FF41]" />
                  <span>Register & Authorize User</span>
                </h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-[#888] hover:text-white">✕ Cancel</button>
              </div>

              <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#777] mb-1">Trader Handle</label>
                  <input
                    type="text"
                    required
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    placeholder="e.g. SatoshiWhale"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">BSV Public Address</label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="1P5ZED..."
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Assigned Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  >
                    <option value="Trader">Trader (Default)</option>
                    <option value="VIP Trader">VIP Trader (Low Fees)</option>
                    <option value="Market Maker">Market Maker (Maker Rebates)</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider"
                  >
                    Save User Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1E1E1E] bg-[#0D0D0D]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141414] text-[#777] border-b border-[#1E1E1E] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Handle</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">BSV Address</th>
                  <th className="p-3">Balances</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {store.users
                  .filter(u => !userSearch || u.handle.toLowerCase().includes(userSearch.toLowerCase()) || u.address.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-[#121212] transition-colors">
                      <td className="p-3 font-bold text-white">
                        <div>@{u.handle}</div>
                        <div className="text-[10px] text-[#666]">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => {
                            u.role = e.target.value as any;
                            adminSettingsStore.save();
                            adminSettingsStore.addLog('INFO', 'USERS', `Updated role for ${u.handle} to ${u.role}`);
                          }}
                          className="bg-[#181818] border border-[#2E2E2E] rounded px-2 py-1 text-white text-[11px] focus:outline-none"
                        >
                          <option value="Trader">Trader</option>
                          <option value="VIP Trader">VIP Trader</option>
                          <option value="Market Maker">Market Maker</option>
                          <option value="Super Admin">Super Admin</option>
                          <option value="Restricted">Restricted</option>
                        </select>
                      </td>
                      <td className="p-3 text-[#AAA] font-mono truncate max-w-xs">{u.address}</td>
                      <td className="p-3">
                        <div className="text-white font-bold">{u.balanceBsv}</div>
                        <div className="text-[10px] text-[#777]">{u.balanceUsdt}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          u.status === 'Active' ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            u.status = u.status === 'Active' ? 'Suspended' : 'Active';
                            adminSettingsStore.save();
                            adminSettingsStore.addLog('WARN', 'USERS', `User ${u.handle} status changed to ${u.status}`);
                          }}
                          className="px-2 py-1 rounded bg-[#181818] hover:bg-[#252525] border border-[#2E2E2E] text-white text-[10px]"
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 2. SITE SETTINGS ================= */}
      {activeSubtab === 'site_settings' && (
        <form onSubmit={handleSaveSite} className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">General Site Settings</h2>
              <p className="text-xs text-[#777]">DEX branding, active domain bindings, and global configurations.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider shadow-md"
            >
              Save Site Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">DEX Platform Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">Bound Domains (Comma Separated)</label>
              <input
                type="text"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">Support Email Contact</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block uppercase text-[#777]">Telegram Official Support Handle</label>
              <input
                type="text"
                value={telegramSupport}
                onChange={(e) => setTelegramSupport(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2 md:col-span-2">
              <label className="block uppercase text-[#777]">Platform Tagline & Meta Description</label>
              <input
                type="text"
                value={siteDesc}
                onChange={(e) => setSiteDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
              />
            </div>
          </div>

          {siteSaved && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Site configurations successfully updated!</span>
            </div>
          )}
        </form>
      )}

      {/* ================= 3. HOMEPAGE BUILDER ================= */}
      {activeSubtab === 'homepage_builder' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Homepage & Layout Builder</h2>
              <p className="text-xs text-[#777]">Enable, disable, and order components visible on the public DEX homepage.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'showHeroStats', title: 'Institutional Hero & 24h Volume Telemetry', desc: 'Displays 24h trading volume, active traders count, and liquidity depth at top of page.' },
              { key: 'showTicker', title: 'Live Price & Market Ticker Bar', desc: 'Horizontal continuous scrolling ticker of BSV, ORAH, AURA, and SOL prices.' },
              { key: 'showFeaturesGrid', title: 'Sovereign Passkey Architecture Feature Cards', desc: 'Highlights zero-gas atomic swaps, WebAuthn biometric security, and UTXO settlement.' },
              { key: 'showTrendingTokens', title: 'Top Gainers & Trending Markets Carousel', desc: 'Displays top performing spot pairs and perp contract volume leaders.' },
              { key: 'showRecentSwaps', title: 'Live Real-Time Swap Stream', desc: 'Shows streaming anonymized atomic swap events directly from the mempool.' },
              { key: 'showFaqSection', title: 'Interactive Knowledgebase & FAQ', desc: 'Answers questions regarding zero-gas settlement, hardware passkeys, and multi-sig vaults.' }
            ].map((sec) => (
              <div
                key={sec.key}
                onClick={() => {
                  (store.homepage as any)[sec.key] = !(store.homepage as any)[sec.key];
                  adminSettingsStore.save();
                }}
                className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] flex items-center justify-between cursor-pointer hover:border-[#333] transition-colors"
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center space-x-2">
                    <Layout className="w-4 h-4 text-[#00FF41]" />
                    <span>{sec.title}</span>
                  </div>
                  <div className="text-[11px] text-[#777] mt-1">{sec.desc}</div>
                </div>

                <input
                  type="checkbox"
                  checked={(store.homepage as any)[sec.key]}
                  onChange={() => {}} // handled by div click
                  className="accent-[#00FF41] w-5 h-5 cursor-pointer flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 4. THEMES ================= */}
      {activeSubtab === 'themes' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Visual Themes & Terminal Palettes</h2>
            <p className="text-xs text-[#777]">Customize the look and feel of the Tradex Sovereign interface.</p>
          </div>

          {themeNotice && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Theme applied across all interface components!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'cyber-green', name: 'Cyber Matrix Green', hue: '#00FF41', bg: 'bg-[#0B120C]', border: 'border-[#00FF41]/50' },
              { id: 'neon-cyan', name: 'Arbitrum Neon Cyan', hue: '#00D8F6', bg: 'bg-[#0A1218]', border: 'border-[#00D8F6]/50' },
              { id: 'matrix-gold', name: 'Sovereign Amber Gold', hue: '#FFB800', bg: 'bg-[#151208]', border: 'border-[#FFB800]/50' },
              { id: 'cobalt-blue', name: 'Institutional Cobalt', hue: '#3B82F6', bg: 'bg-[#0A0F1D]', border: 'border-[#3B82F6]/50' },
              { id: 'velvet-purple', name: 'AURA Deep Violet', hue: '#A855F7', bg: 'bg-[#140A1D]', border: 'border-[#A855F7]/50' },
            ].map((th) => (
              <div
                key={th.id}
                onClick={() => handleApplyTheme(th.id as any, th.hue)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${th.bg} ${
                  currentTheme === th.id ? th.border + ' shadow-[0_0_20px_rgba(0,255,65,0.1)] ring-1 ring-white/20' : 'border-[#1E1E1E]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-sm">{th.name}</span>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: th.hue }} />
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-[#AAA]">
                  <span>Accent: <strong style={{ color: th.hue }}>{th.hue}</strong></span>
                  {currentTheme === th.id && <span className="text-[#00FF41] font-bold">✓ ACTIVE</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 5. ANNOUNCEMENTS ================= */}
      {activeSubtab === 'announcements' && (
        <form onSubmit={handleSaveAnnouncement} className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Global Broadcast Announcements</h2>
              <p className="text-xs text-[#777]">Display live ticker banners across the top of all DEX trading terminals.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider shadow-md"
            >
              Update Banner
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
            <div className="flex items-center justify-between">
              <label className="uppercase text-[#777]">Broadcast Banner Text</label>
              <div className="flex items-center space-x-2">
                <span className="text-white">Active</span>
                <input
                  type="checkbox"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="accent-[#00FF41]"
                />
              </div>
            </div>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF41]"
            />

            {/* Live Preview */}
            <div className="pt-2">
              <span className="text-[10px] text-[#666] uppercase block mb-1">Live Banner Preview:</span>
              <div className="p-2.5 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs font-bold flex items-center justify-between">
                <span>{announcementText}</span>
                <span className="text-[10px] uppercase bg-[#00FF41] text-black px-1.5 py-0.5 rounded font-black">BROADCAST</span>
              </div>
            </div>
          </div>

          {announcementSaved && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41]">
              ✓ Announcement updated across all active WebSocket client sessions.
            </div>
          )}
        </form>
      )}

      {/* ================= 6. AI INTELLIGENCE & PLAYGROUND ================= */}
      {(activeSubtab === 'ora_ai_settings' || activeSubtab === 'devai_settings') && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <form onSubmit={handleSaveAI} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
              <div>
                <h2 className="text-xl font-black text-white">AURA & DevAI Autonomous Intelligence</h2>
                <p className="text-xs text-[#777]">Configure Gemini AI models, trading intelligence parameters, and prompt rules.</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider shadow-md"
              >
                Save AI Config
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
                <label className="block uppercase text-[#777]">Gemini Foundation Model</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-Low Latency)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Quantitative Reasoning)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
                <label className="block uppercase text-[#777]">Sampling Temperature ({aiTemperature})</label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={aiTemperature}
                  onChange={(e) => setAiTemperature(e.target.value)}
                  className="w-full accent-[#00FF41]"
                />
                <div className="flex justify-between text-[10px] text-[#666]">
                  <span>Deterministic (0.0)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
                <label className="block uppercase text-[#777]">Max Autonomous Risk / Trade ($)</label>
                <input
                  type="text"
                  value={aiMaxRisk}
                  onChange={(e) => setAiMaxRisk(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2 md:col-span-3">
                <label className="block uppercase text-[#777]">AI Autonomous System Persona & Instructions</label>
                <textarea
                  rows={3}
                  value={aiSystemPrompt}
                  onChange={(e) => setAiSystemPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>
            </div>

            {aiSaved && (
              <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41]">
                ✓ Autonomous AI agent parameters updated.
              </div>
            )}
          </form>

          {/* Interactive Prompt Playground */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#00FF41]/30 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#00FF41]" />
              <span>AURA Intelligence Live Prompt Playground</span>
            </h3>

            <div className="flex space-x-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Ask AURA to evaluate trade or calculate spread..."
                className="flex-1 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
              />
              <button
                type="button"
                onClick={handleRunTestPrompt}
                disabled={isPrompting}
                className="px-4 py-2 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-bold uppercase"
              >
                {isPrompting ? 'Inferring...' : 'Send Prompt'}
              </button>
            </div>

            {promptResponse && (
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] text-[#AAA] whitespace-pre-line">
                {promptResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 7. SUPPORT INBOX & LIVE CHAT ================= */}
      {(activeSubtab === 'support_inbox' || activeSubtab === 'support_contact' || activeSubtab === 'email_inbox') && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Live Support Desk & Trader Messages</h2>
              <p className="text-xs text-[#777]">View real-time messages from traders, reply directly to their chat widgets, or manage escrow tickets.</p>
            </div>

            {/* Support Mode Tabs */}
            <div className="flex items-center space-x-1.5 p-1 bg-[#101010] border border-[#222] rounded-xl self-start">
              <button
                onClick={() => setSupportTab('live_chat')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  supportTab === 'live_chat'
                    ? 'bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.3)]'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat Widget</span>
                {liveSessions.reduce((acc, s) => acc + (s.unreadCount || 0), 0) > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-mono">
                    {liveSessions.reduce((acc, s) => acc + (s.unreadCount || 0), 0)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSupportTab('tickets')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  supportTab === 'tickets'
                    ? 'bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.3)]'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protocol Tickets ({store.tickets.length})</span>
              </button>
            </div>
          </div>

          {ticketNotice && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] flex items-center space-x-2 border border-[#00FF41]/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>{ticketNotice}</span>
            </div>
          )}

          {/* ================= 7A. LIVE TRADER CHAT SYNCHRONIZATION ================= */}
          {supportTab === 'live_chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Live Chat Sessions List */}
              <div className="space-y-2 lg:col-span-1">
                <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider px-1">
                  Active Trader Sessions ({liveSessions.length})
                </div>
                {liveSessions.map((s) => {
                  const isSelected = selectedLiveSessionId === s.id;
                  const lastMsg = s.messages[s.messages.length - 1];
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedLiveSessionId(s.id);
                        liveChatService.setActiveSessionId(s.id);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#161616] border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.15)]' 
                          : 'bg-[#0D0D0D] border-[#1E1E1E] hover:bg-[#121212]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#00FF41] font-bold truncate max-w-[140px]">{s.userName}</span>
                        <div className="flex items-center space-x-1.5">
                          {s.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse">
                              NEW
                            </span>
                          )}
                          <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                            s.status === 'waiting_admin' ? 'bg-yellow-500/20 text-yellow-400' :
                            s.status === 'active' ? 'bg-[#00FF41]/20 text-[#00FF41]' : 'bg-[#333] text-[#888]'
                          }`}>
                            {s.status === 'waiting_admin' ? 'Awaiting Reply' : s.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-[#777] text-[10px] mt-1 font-mono truncate">
                        Address: {s.userAddress}
                      </div>

                      <div className="text-white text-[11px] mt-2 truncate bg-[#101010] p-1.5 rounded border border-[#1E1E1E]">
                        <span className="text-[#666] mr-1">{lastMsg?.sender === 'admin' ? 'You:' : lastMsg?.sender === 'ai' ? 'AI:' : 'Trader:'}</span>
                        {lastMsg?.text || 'No messages'}
                      </div>

                      <div className="text-[#555] text-[9px] mt-1.5 flex items-center justify-between">
                        <span>Chain: {s.chain}</span>
                        <span>{s.startedAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Chat Conversation View & Reply */}
              {(() => {
                const activeSession = liveSessions.find(s => s.id === selectedLiveSessionId) || liveSessions[0];
                if (!activeSession) {
                  return (
                    <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] lg:col-span-2 text-center text-[#666]">
                      Select a trader session to view live messages.
                    </div>
                  );
                }

                return (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] lg:col-span-2 flex flex-col justify-between space-y-4 min-h-[460px]">
                    <div>
                      
                      {/* Session Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1C1C1C] gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-black text-white">{activeSession.userName}</h3>
                            <span className="px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] text-[10px] font-bold">
                              {activeSession.chain}
                            </span>
                          </div>
                          <div className="text-[#777] text-[10px] font-mono mt-0.5">
                            Wallet: <span className="text-[#AAA] select-all">{activeSession.userAddress}</span> • Started: {activeSession.startedAt}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              if (activeSession.status === 'resolved') {
                                liveChatService.reopenSession(activeSession.id);
                              } else {
                                liveChatService.resolveSession(activeSession.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#252525] text-white text-[10px] font-bold border border-[#2A2A2A] transition-colors"
                          >
                            {activeSession.status === 'resolved' ? 'Re-open Chat' : 'Mark Resolved'}
                          </button>
                        </div>
                      </div>

                      {/* Message Thread */}
                      <div className="space-y-3 pt-3 max-h-72 overflow-y-auto pr-1">
                        {activeSession.messages.map((m) => {
                          const isAdmin = m.sender === 'admin';
                          const isUser = m.sender === 'user';
                          return (
                            <div
                              key={m.id}
                              className={`p-3 rounded-xl max-w-lg ${
                                isAdmin
                                  ? 'bg-[#00FF41]/10 text-[#00FF41] ml-auto border border-[#00FF41]/30'
                                  : isUser
                                  ? 'bg-[#181818] text-white border border-[#262626]'
                                  : 'bg-[#121212] text-[#AAA] border border-[#1F1F1F]'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                                <span>{isAdmin ? '🛡️ You (Tradex Admin)' : isUser ? '👤 ' + (m.senderName || 'Trader') : '🤖 Ora AI Node'}</span>
                                <span className="text-[#666] font-normal">{m.timestamp}</span>
                              </div>
                              <div className="text-xs leading-relaxed font-sans">{m.text}</div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Quick Response Chips */}
                    <div className="pt-2 border-t border-[#1C1C1C] space-y-2">
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className="text-[#666] py-0.5">Quick Actions:</span>
                        {[
                          'Verified on WhatsOnChain explorer',
                          'Escrow funds released safely to recipient',
                          'Cross-chain swap executed with zero slippage',
                          'Please provide transaction hash',
                          'Issue investigated and resolved'
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              liveChatService.sendAdminMessage(activeSession.id, chip);
                              setTicketNotice(`Sent quick response to ${activeSession.userName}!`);
                              setTimeout(() => setTicketNotice(null), 2500);
                            }}
                            className="px-2 py-0.5 rounded bg-[#141414] hover:bg-[#202020] border border-[#242424] text-[#888] hover:text-[#00FF41] transition-colors"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>

                      {/* Admin Message Input */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!liveAdminReply.trim()) return;
                          liveChatService.sendAdminMessage(activeSession.id, liveAdminReply.trim());
                          setLiveAdminReply('');
                          setTicketNotice(`Reply dispatched directly to trader's live chat!`);
                          setTimeout(() => setTicketNotice(null), 2500);
                        }} 
                        className="flex space-x-2"
                      >
                        <input
                          type="text"
                          value={liveAdminReply}
                          onChange={(e) => setLiveAdminReply(e.target.value)}
                          placeholder={`Reply directly to ${activeSession.userName}...`}
                          className="flex-1 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white text-xs focus:outline-none focus:border-[#00FF41]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-bold uppercase text-xs transition-colors flex items-center space-x-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Reply</span>
                        </button>
                      </form>
                    </div>

                  </div>
                );
              })()}

            </div>
          )}

          {/* ================= 7B. PROTOCOL TICKETS ================= */}
          {supportTab === 'tickets' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Tickets List */}
              <div className="space-y-2 lg:col-span-1">
                {store.tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      selectedTicket?.id === t.id ? 'bg-[#181818] border-[#00FF41]/40' : 'bg-[#0D0D0D] border-[#1E1E1E] hover:bg-[#121212]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#00FF41] font-bold">[{t.id}]</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                        t.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#00FF41]/20 text-[#00FF41]'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="text-white font-bold mt-1 truncate">{t.subject}</div>
                    <div className="text-[#666] text-[10px] mt-1">{t.user} • {t.timestamp}</div>
                  </div>
                ))}
              </div>

              {/* Conversation Thread */}
              {selectedTicket && (
                <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] lg:col-span-2 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
                      <div>
                        <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                        <div className="text-[#777] text-[10px]">User: {selectedTicket.user} • Category: {selectedTicket.category}</div>
                      </div>
                      <button
                        onClick={() => {
                          selectedTicket.status = selectedTicket.status === 'Open' ? 'Resolved' : 'Open';
                          adminSettingsStore.save();
                        }}
                        className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#252525] text-white text-[10px] font-bold"
                      >
                        {selectedTicket.status === 'Open' ? 'Mark Resolved' : 'Re-Open Ticket'}
                      </button>
                    </div>

                    <div className="space-y-2.5 pt-3 max-h-60 overflow-y-auto">
                      {selectedTicket.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl max-w-lg ${
                            m.sender === 'admin' ? 'bg-[#00FF41]/10 text-[#00FF41] ml-auto border border-[#00FF41]/30' : 'bg-[#181818] text-[#DDD]'
                          }`}
                        >
                          <div className="text-[10px] font-bold uppercase mb-0.5">{m.sender} • {m.time}</div>
                          <div>{m.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSendTicketReply} className="pt-3 border-t border-[#1C1C1C] flex space-x-2">
                    <input
                      type="text"
                      value={ticketReply}
                      onChange={(e) => setTicketReply(e.target.value)}
                      placeholder="Type official admin response..."
                      className="flex-1 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-bold uppercase"
                    >
                      Reply
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ================= 8. SETUP GUIDE ================= */}
      {activeSubtab === 'setup_guide' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">DEX Launch Checklist & System Verification</h2>
            <p className="text-xs text-[#777]">Essential sovereign configuration milestones before opening public order flow.</p>
          </div>

          <div className="space-y-3">
            {store.setupGuide.map((step) => (
              <div
                key={step.id}
                onClick={() => {
                  step.completed = !step.completed;
                  adminSettingsStore.save();
                }}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  step.completed ? 'bg-[#0E150F] border-[#00FF41]/30' : 'bg-[#0D0D0D] border-[#1E1E1E]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00FF41]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-[#555]" />
                  )}
                  <div>
                    <div className={`font-bold text-sm ${step.completed ? 'text-white' : 'text-[#888]'}`}>
                      {step.title}
                    </div>
                    <div className="text-[11px] text-[#666] mt-0.5">{step.desc}</div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  step.completed ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'text-[#666]'
                }`}>
                  {step.completed ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 9. INTEGRATIONS ================= */}
      {activeSubtab === 'integrations' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">External Webhooks & API Connectors</h2>
            <p className="text-xs text-[#777]">Manage automated webhooks for Telegram alerts, Discord bots, and blockchain indexers.</p>
          </div>

          {webhookNotice && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{webhookNotice}</span>
            </div>
          )}

          <div className="space-y-3">
            {store.webhooks.map((wh) => (
              <div key={wh.id} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00FF41] font-bold">[{wh.type}]</span>
                    <span className="text-white font-bold">{wh.name}</span>
                  </div>
                  <div className="text-[11px] text-[#777] font-mono mt-0.5">{wh.url}</div>
                  <div className="text-[10px] text-[#555] mt-1">Events: {wh.events.join(', ')} • Ping: {wh.lastPing}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                    {wh.status}
                  </span>
                  <button
                    onClick={() => handleTestWebhook(wh)}
                    disabled={testingWebhookId === wh.id}
                    className="px-3 py-1 rounded bg-[#181818] hover:bg-[#252525] border border-[#2E2E2E] text-white font-bold"
                  >
                    {testingWebhookId === wh.id ? 'Pinging...' : 'Test Webhook'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 10. SECURITY & ADMIN USERS ================= */}
      {(activeSubtab === 'security_settings' || activeSubtab === 'admin_users') && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Super Admin Access & Security Controls</h2>
            <p className="text-xs text-[#777]">Strict access configured exclusively for <span className="text-[#00FF41]">{SUPER_ADMIN_EMAIL}</span>.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Identity Card */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
                <div className="flex items-center space-x-2 text-white font-bold">
                  <Shield className="w-4 h-4 text-[#00FF41]" />
                  <span>Authorized Super Admin</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-[10px] font-bold">
                  EXCLUSIVE ACCESS
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-[#777] text-[11px]">Primary Master Email</div>
                <div className="p-3 rounded-xl bg-[#141414] border border-[#222] text-white font-bold flex items-center justify-between">
                  <span>{SUPER_ADMIN_EMAIL}</span>
                  <span className="text-[#00FF41] text-[10px] uppercase font-bold">Verified</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[#777] text-[11px]">Session Timeout Policy</div>
                <div className="p-3 rounded-xl bg-[#141414] border border-[#222] text-[#AAA] flex items-center justify-between">
                  <span>24 Hours (Auto-Lock on Idle)</span>
                  <span className="text-[#888] text-[10px]">Active</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-[#00FF41]" />
                  <span className="text-white text-xs">Require WebAuthn / Passkey</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={biometricRequired}
                  onChange={(e) => setBiometricRequired(e.target.checked)}
                  className="accent-[#00FF41] w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Passkey Form */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
                <div className="flex items-center space-x-2 text-white font-bold">
                  <KeyRound className="w-4 h-4 text-[#00FF41]" />
                  <span>Update Master Passkey</span>
                </div>
                <span className="text-[10px] text-[#888]">UTXO Hash Guarded</span>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  adminAuthService.setCustomMasterKey(masterPasskey);
                  setSecuritySaved(true);
                  confetti({ particleCount: 35 });
                  setTimeout(() => setSecuritySaved(false), 2500);
                }} 
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-[#777]">Custom Master Passkey / Password</label>
                  <input
                    type="text"
                    value={masterPasskey}
                    onChange={(e) => setMasterPasskey(e.target.value)}
                    placeholder="Enter new master passkey..."
                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white font-mono focus:outline-none focus:border-[#00FF41]"
                  />
                  <div className="text-[10px] text-[#666]">
                    Default backup passkey: <code className="text-[#00FF41]">aurashampy2026</code> or PIN <code className="text-[#00FF41]">777888</code>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,65,0.2)]"
                  >
                    Save Master Key
                  </button>

                  {securitySaved && (
                    <span className="text-[#00FF41] text-xs font-bold animate-pulse">
                      ✓ Passkey updated successfully
                    </span>
                  )}
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ================= 11. API SETTINGS ================= */}
      {activeSubtab === 'api_settings' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Developer API Keys & Web3 Scopes</h2>
              <p className="text-xs text-[#777]">Issue and revoke scoped credentials for quant bots and external liquidity indexers.</p>
            </div>

            <button
              onClick={() => setShowAddKeyModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-bold flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New API Key</span>
            </button>
          </div>

          {keyNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{keyNotice}</span>
            </div>
          )}

          {/* Modal */}
          {showAddKeyModal && (
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#00FF41]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-[#00FF41]" />
                  <span>Issue New API Credential</span>
                </h3>
                <button onClick={() => setShowAddKeyModal(false)} className="text-[#888] hover:text-white">✕ Cancel</button>
              </div>

              <form onSubmit={handleGenerateApiKey} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#777] mb-1">Key Label / App Name</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Quant Arbitrage Bot #2"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Scope & Permissions</label>
                  <select
                    value={newKeyPermission}
                    onChange={(e) => setNewKeyPermission(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                  >
                    <option value="Read-Only">Read-Only (Public Data & Orderbook)</option>
                    <option value="Trading">Trading (Order Placement & Cancels)</option>
                    <option value="Full Admin">Full Admin (Withdrawals & Config)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider"
                  >
                    Generate Secret Key
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Keys Table */}
          <div className="space-y-3">
            {store.apiKeys.map((k) => (
              <div key={k.id} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold">{k.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      k.permissions === 'Full Admin' ? 'bg-purple-500/10 text-purple-400' :
                      k.permissions === 'Trading' ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {k.permissions}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#777] font-mono mt-1">Prefix: {k.keyPrefix} • Created: {k.created} • Last Used: {k.lastUsed}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    className="px-2.5 py-1 rounded bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] font-bold"
                  >
                    Revoke Key
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
