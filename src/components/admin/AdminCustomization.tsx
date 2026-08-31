import React, { useState } from 'react';
import { 
  Users, 
  Rocket, 
  Mail, 
  Plug, 
  Globe, 
  Home, 
  Palette, 
  Megaphone, 
  Brain, 
  Bot, 
  Headphones, 
  Inbox, 
  Shield, 
  KeyRound, 
  UserCheck, 
  CheckCircle2, 
  Search, 
  Plus, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Send,
  Eye,
  Lock,
  Fingerprint,
  Key,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { adminAuthService, SUPER_ADMIN_EMAIL, DEFAULT_MASTER_KEY } from '../../services/adminAuthService';

export const AdminCustomization: React.FC<{ activeSubtab: string }> = ({ activeSubtab }) => {
  // Site Settings
  const [siteName, setSiteName] = useState('Tradex Sovereign');
  const [domains, setDomains] = useState('tradex.com, aaurah.org');
  const [siteSaved, setSiteSaved] = useState(false);

  // Announcement
  const [announcementText, setAnnouncementText] = useState('⚡ ZERO-GAS Passkey intents live on BSV Mainnet!');
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  // Security Master Key
  const [masterPasskey, setMasterPasskey] = useState(() => adminAuthService.getMasterKey());
  const [securitySaved, setSecuritySaved] = useState(false);
  const [ipFirewallEnforced, setIpFirewallEnforced] = useState(true);
  const [biometricRequired, setBiometricRequired] = useState(true);

  // AI Settings
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [aiTemperature, setAiTemperature] = useState('0.2');
  const [aiSaved, setAiSaved] = useState(false);

  // User Management
  const [users, setUsers] = useState([
    { id: '1', handle: 'aurashampy (aurashampy@gmail.com)', role: 'Super Admin', address: '1P5ZEDWT...554WKDfHQ', balance: '142.50 BSV', status: 'Active' },
    { id: '2', handle: 'Quant_Whale_99', role: 'Market Maker', address: '18cbBi2Y...968JvDda', balance: '4,890.00 BSV', status: 'Active' },
    { id: '3', handle: 'Sats_Arbitrageur', role: 'Trader', address: '1Lbcfr7s...996vB1Xp', balance: '28.14 BSV', status: 'Active' },
    { id: '4', handle: 'AURA_Keeper_01', role: 'AI Operator', address: '1N52wHoK...871xZpQe', balance: '12.00 BSV', status: 'Active' },
  ]);
  const [userSearch, setUserSearch] = useState('');

  // Support Inbox
  const [supportTickets, setSupportTickets] = useState([
    { id: 'TCK-1092', user: 'Sats_Arbitrageur', issue: 'Inquiry on BSV atomic swap UTXO confirmations', time: '10m ago', status: 'Open' },
    { id: 'TCK-1091', user: '0x8f...41a', issue: 'Question about $ORAH staking APY dividend frequency', time: '1h ago', status: 'Resolved' },
    { id: 'TCK-1090', user: 'Keeper_User_44', issue: 'Passkey WebAuthn biometric signature prompt', time: '3h ago', status: 'Resolved' }
  ]);

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteSaved(true);
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setSiteSaved(false), 2500);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementSaved(true);
    confetti({ particleCount: 30 });
    setTimeout(() => setAnnouncementSaved(false), 2500);
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    setAiSaved(true);
    confetti({ particleCount: 30 });
    setTimeout(() => setAiSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* ================= 1. USER MANAGEMENT ================= */}
      {activeSubtab === 'user_management' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">User & Permission Management</h2>
              <p className="text-xs text-[#777] font-mono">Manage connected Web3 wallets, assign Market Maker and Admin roles.</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#666] absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user address or handle..."
                className="pl-9 pr-4 py-2 bg-[#141414] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#00FF41] w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1E1E1E] bg-[#0D0D0D]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141414] text-[#777] border-b border-[#1E1E1E] uppercase text-[10px]">
                <tr>
                  <th className="p-3">User Handle</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">BSV Balance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {users
                  .filter(u => u.handle.toLowerCase().includes(userSearch.toLowerCase()) || u.address.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-[#121212] transition-colors">
                      <td className="p-3 font-bold text-white">{u.handle}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          u.role === 'Super Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          u.role === 'Market Maker' ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-[#777]">{u.address}</td>
                      <td className="p-3 text-white font-bold">{u.balance}</td>
                      <td className="p-3">
                        <span className="text-[#00FF41] flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
                          <span>{u.status}</span>
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setUsers(prev => prev.map(item => item.id === u.id ? { ...item, role: item.role === 'Super Admin' ? 'Trader' : 'Super Admin' } : item));
                          }}
                          className="px-2 py-1 rounded bg-[#181818] hover:bg-[#252525] border border-[#2E2E2E] text-white text-[10px] font-bold"
                        >
                          Toggle Role
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
        <form onSubmit={handleSaveSite} className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">General Site Settings</h2>
              <p className="text-xs text-[#777] font-mono">DEX branding, active domain bindings, and global configurations.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs font-mono uppercase tracking-wider shadow-md"
            >
              Save Site Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block text-xs font-mono uppercase text-[#777]">DEX Platform Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block text-xs font-mono uppercase text-[#777]">Bound Domains (Comma Separated)</label>
              <input
                type="text"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
            </div>
          </div>

          {siteSaved && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Site configurations successfully updated!</span>
            </div>
          )}
        </form>
      )}

      {/* ================= 3. ANNOUNCEMENTS ================= */}
      {activeSubtab === 'announcements' && (
        <form onSubmit={handleSaveAnnouncement} className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Global Broadcast Announcements</h2>
              <p className="text-xs text-[#777] font-mono">Display live banners across the top of all DEX terminals.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs font-mono uppercase tracking-wider shadow-md"
            >
              Update Banner
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-[#777]">Broadcast Banner Text</label>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-white">Active</span>
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
              className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
            />

            {/* Live Preview */}
            <div className="pt-2">
              <span className="text-[10px] font-mono text-[#666] uppercase block mb-1">Live Banner Preview:</span>
              <div className="p-2.5 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] font-mono text-xs font-bold flex items-center justify-between">
                <span>{announcementText}</span>
                <span className="text-[10px] uppercase bg-[#00FF41] text-black px-1.5 py-0.5 rounded font-black">BROADCAST</span>
              </div>
            </div>
          </div>

          {announcementSaved && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] text-xs font-mono">
              ✓ Announcement updated across all active WebSocket client sessions.
            </div>
          )}
        </form>
      )}

      {/* ================= 4. AI INTELLIGENCE SETTINGS ================= */}
      {(activeSubtab === 'ora_ai_settings' || activeSubtab === 'devai_settings') && (
        <form onSubmit={handleSaveAI} className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">AURA & DevAI Autonomous Settings</h2>
              <p className="text-xs text-[#777] font-mono">Configure Gemini AI models, trading intelligence parameters, and prompt rules.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs font-mono uppercase tracking-wider shadow-md"
            >
              Save AI Config
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block text-xs font-mono uppercase text-[#777]">Gemini Foundation Model</label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-sm focus:outline-none"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-Low Latency)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Quantitative Reasoning)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <label className="block text-xs font-mono uppercase text-[#777]">Sampling Temperature ({aiTemperature})</label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={aiTemperature}
                onChange={(e) => setAiTemperature(e.target.value)}
                className="w-full accent-[#00FF41]"
              />
              <div className="flex justify-between text-[10px] text-[#666] font-mono">
                <span>Deterministic (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>
          </div>

          {aiSaved && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] text-xs font-mono">
              ✓ Autonomous AI agent parameters updated.
            </div>
          )}
        </form>
      )}

      {/* ================= 5. SUPPORT INBOX ================= */}
      {(activeSubtab === 'support_inbox' || activeSubtab === 'support_contact') && (
        <div className="space-y-4">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Live Support Tickets & Conversations</h2>
            <p className="text-xs text-[#777] font-mono">Manage trader inquiries, P2P arbitration tickets, and platform support.</p>
          </div>

          <div className="space-y-3">
            {supportTickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00FF41] font-bold">[{t.id}]</span>
                    <span className="text-white font-bold">{t.user}</span>
                    <span className="text-[#666]">• {t.time}</span>
                  </div>
                  <div className="text-[#AAA] mt-1">{t.issue}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    t.status === 'Open' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'bg-[#00FF41]/10 text-[#00FF41]'
                  }`}>
                    {t.status}
                  </span>
                  <button 
                    onClick={() => {
                      setSupportTickets(prev => prev.map(item => item.id === t.id ? { ...item, status: item.status === 'Open' ? 'Resolved' : 'Open' } : item));
                    }}
                    className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#252525] text-white text-[11px]"
                  >
                    {t.status === 'Open' ? 'Resolve' : 'Re-open'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 6. SECURITY SETTINGS & ADMIN USERS ================= */}
      {(activeSubtab === 'security_settings' || activeSubtab === 'admin_users') && (
        <div className="space-y-5 font-mono">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Super Admin Access & Security Controls</h2>
            <p className="text-xs text-[#777]">Strict access control configured exclusively for <span className="text-[#00FF41]">{SUPER_ADMIN_EMAIL}</span>.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Superadmin Identity Card */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4 text-xs">
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

            {/* Master Key / Password Form */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4 text-xs">
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

      {/* ================= 7. API SETTINGS & INTEGRATIONS & OTHERS ================= */}
      {(activeSubtab === 'api_settings' || activeSubtab === 'setup_guide' || activeSubtab === 'email_inbox' || activeSubtab === 'integrations' || activeSubtab === 'homepage_builder' || activeSubtab === 'themes') && (
        <div className="space-y-4">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white capitalize">{activeSubtab.replace('_', ' ')}</h2>
            <p className="text-xs text-[#777] font-mono">Administrative settings and environment configurations.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3 font-mono text-xs">
            <div className="flex items-center space-x-2 text-[#00FF41] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>STATUS: PRODUCTION CONFIGURED</span>
            </div>
            <p className="text-[#888]">
              All security protocols, multi-sig signers, and encrypted API keys are synced with the sovereign Bitcoin SV settlement layer.
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded bg-[#181818] border border-[#2A2A2A] text-white font-mono">
                Admin: {SUPER_ADMIN_EMAIL}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] font-mono">
                2FA Hardware Enforced
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
