import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  Activity, 
  Check, 
  Download, 
  ExternalLink, 
  Search, 
  ChevronRight, 
  ChevronDown,
  Layers,
  Zap,
  Lock,
  Cpu,
  Globe,
  Coins,
  Copy
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export type DocType = 'whitepaper' | 'terms' | 'privacy' | 'faq' | 'status';

interface LegalDocsModalProps {
  isOpen: boolean;
  docType: DocType;
  onClose: () => void;
  onSelectDocType?: (type: DocType) => void;
}

export const LegalDocsModal: React.FC<LegalDocsModalProps> = ({
  isOpen,
  docType,
  onClose,
  onSelectDocType
}) => {
  const [activeTab, setActiveTab] = useState<DocType>(docType);
  const [copied, setCopied] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [wpSection, setWpSection] = useState<'abstract' | 'architecture' | 'tokenomics' | 'escrow' | 'perps' | 'security'>('abstract');

  React.useEffect(() => {
    setActiveTab(docType);
  }, [docType]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.origin + '#' + activeTab);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const FAQS = [
    {
      q: 'What is Tradex & Pulse DEX?',
      a: 'Tradex & Pulse is an autonomous non-custodial decentralized perpetual exchange, smart escrow settlement network, and quantitative AI trading terminal. It enables sub-second atomic trades across Bitcoin SV (BSV), Base (EVM), Solana, and Ronin with near-zero network fees.'
    },
    {
      q: 'How does the non-custodial smart escrow contract work?',
      a: 'Funds committed to an escrow deal are locked into deterministic cryptographic contracts verified on-chain. Neither Tradex nor any single party can withdraw your assets without matching counterparty fulfillment or timelock expiration.'
    },
    {
      q: 'What are the fees on Tradex & Pulse?',
      a: 'Tradex & Pulse charges a transparent 0.01% maker fee and 0.03% taker fee on spot trades. Instant AMM swaps have 0% slippage routing, and BSV on-chain transaction settlement costs less than 0.5 sat/byte (~$0.0001).'
    },
    {
      q: 'Which wallets can I connect?',
      a: 'You can connect via non-custodial EVM Web3 wallets (MetaMask, Coinbase Wallet, Rabby), Solana wallets (Phantom, Solflare), Bitcoin SV wallets (Sensilet, HandCash), or multi-chain Passkeys with biometric hardware security.'
    },
    {
      q: 'How does 50x Perpetual Futures leverage work?',
      a: 'Perpetual contracts utilize isolated and cross-margin collateral matrices with oracle mark prices powered by Pyth and Chainlink. Real-time liquidation engines protect the insurance fund, with auto-deleveraging (ADL) as a safety net.'
    },
    {
      q: 'How do Autonomous AI Agents and Copy Vaults trade?',
      a: 'Ora AI and Pulse Quant agents run algorithmic strategies (mean reversion, momentum arbitrage, grid market making) that execute non-custodial signing commands permitted by your session key without holding withdrawal privileges.'
    },
    {
      q: 'How do I claim $ORAH and $PULSE staking rewards?',
      a: 'Navigate to the Stake tab, choose your staking vault (ORAH/USDT or PULSE/BSV), and deposit tokens. Yield is calculated per block and distributed continuously with zero lockup penalty on standard pools.'
    }
  ];

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0C0C0C] border border-[#242424] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left font-sans">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#1E1E1E] bg-[#111111] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              {activeTab === 'whitepaper' && <FileText className="w-5 h-5" />}
              {activeTab === 'terms' && <ShieldCheck className="w-5 h-5" />}
              {activeTab === 'privacy' && <Lock className="w-5 h-5" />}
              {activeTab === 'faq' && <HelpCircle className="w-5 h-5" />}
              {activeTab === 'status' && <Activity className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {activeTab === 'whitepaper' && 'Tradex & Pulse Protocol White Paper (v2.4)'}
                  {activeTab === 'terms' && 'Tradex & Pulse Terms of Service'}
                  {activeTab === 'privacy' && 'Tradex & Pulse Privacy Policy'}
                  {activeTab === 'faq' && 'Frequently Asked Questions (FAQ)'}
                  {activeTab === 'status' && 'System & Blockchain Network Status'}
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] font-mono text-[10px] font-bold border border-[#00FF41]/20">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-[#888] font-mono mt-0.5">
                Tradex & Pulse Sovereign Decentralized Network • Non-Custodial Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#2A2A2A] text-[#AAA] hover:text-white transition-colors"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-[#00FF41]" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#2A2A2A] text-[#AAA] hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center space-x-1 px-4 py-2 bg-[#090909] border-b border-[#1A1A1A] overflow-x-auto no-scrollbar font-mono text-xs">
          {[
            { id: 'whitepaper', label: 'White Paper', icon: FileText },
            { id: 'terms', label: 'Terms of Service', icon: ShieldCheck },
            { id: 'privacy', label: 'Privacy Policy', icon: Lock },
            { id: 'faq', label: 'FAQ & Help', icon: HelpCircle },
            { id: 'status', label: 'System Status', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as DocType);
                  onSelectDocType?.(tab.id as DocType);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                  isActive 
                    ? 'bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.3)]' 
                    : 'text-[#888] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-[#CCC] leading-relaxed space-y-6">
          
          {/* ================= 1. WHITEPAPER ================= */}
          {activeTab === 'whitepaper' && (
            <div className="space-y-6">
              
              {/* Whitepaper Subnav */}
              <div className="flex flex-wrap gap-1.5 pb-3 border-b border-[#1E1E1E] font-mono text-[11px]">
                {[
                  { id: 'abstract', label: '1. Abstract & Vision' },
                  { id: 'architecture', label: '2. Hybrid Consensus' },
                  { id: 'tokenomics', label: '3. $ORAH & $PULSE' },
                  { id: 'escrow', label: '4. Escrow Protocols' },
                  { id: 'perps', label: '5. 50x Perps Engine' },
                  { id: 'security', label: '6. Security & Audit' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setWpSection(sub.id as any)}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      wpSection === sub.id
                        ? 'bg-[#1E1E1E] text-[#00FF41] border border-[#00FF41]/40'
                        : 'text-[#777] hover:text-white bg-[#111111]'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {wpSection === 'abstract' && (
                <div className="space-y-4 font-sans">
                  <h3 className="text-lg font-bold text-white">1. Abstract & Protocol Vision</h3>
                  <p>
                    <strong>Tradex & Pulse</strong> represents the convergence of high-throughput UTXO settlement, sovereign cross-chain atomic state verification, and autonomous artificial intelligence trading infrastructure. Decentralized exchanges historically face a trilemma: high gas costs, front-running/MEV exploitation, and fragmented cross-chain liquidity.
                  </p>
                  <p>
                    By combining <strong>Bitcoin SV (BSV) Teranode UTXO settlement</strong> (capable of 50,000+ transactions per second at sub-cent fee rates) with bidirectional state relayers connecting <strong>Base (EVM)</strong>, <strong>Solana</strong>, and <strong>Ronin</strong>, Tradex & Pulse establishes an institutional-grade liquidity fabric with guaranteed non-custodial asset control.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#111111] border border-[#1E1E1E] font-mono text-[11px]">
                    <div className="p-2 border-r border-[#222]">
                      <div className="text-[#888]">Throughput</div>
                      <div className="text-base font-black text-[#00FF41] mt-0.5">50,000+ TPS</div>
                      <div className="text-[10px] text-[#666]">Teranode UTXO Pipeline</div>
                    </div>
                    <div className="p-2 border-r border-[#222]">
                      <div className="text-[#888]">Average Fee</div>
                      <div className="text-base font-black text-[#00FF41] mt-0.5">&lt; $0.0001</div>
                      <div className="text-[10px] text-[#666]">0.5 sat/byte settlement</div>
                    </div>
                    <div className="p-2">
                      <div className="text-[#888]">Liquidity Routing</div>
                      <div className="text-base font-black text-[#00FF41] mt-0.5">22,000,000+</div>
                      <div className="text-[10px] text-[#666]">Aggregated Pairs Matrix</div>
                    </div>
                  </div>
                </div>
              )}

              {wpSection === 'architecture' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">2. Hybrid Consensus & Atomic Cross-Chain Channels</h3>
                  <p>
                    The Tradex & Pulse settlement matrix decouples order matching from transaction consensus:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-[#AAA]">
                    <li><strong>Off-Chain Matching Engine:</strong> Deterministic central limit order book (CLOB) executing microsecond order state transitions with cryptographic match certificates.</li>
                    <li><strong>On-Chain Atomic Settlement:</strong> Signed transaction intents settle atomically on the native layer (BSV UTXO scripts, EVM Smart Contracts, or Solana Program Accounts) without wrapping or bridge honeypots.</li>
                    <li><strong>Zero-Knowledge Relayer Proofs:</strong> State updates across Base and Solana utilize cryptographic commitment trees verified by decentralized relayer oracles.</li>
                  </ul>
                </div>
              )}

              {wpSection === 'tokenomics' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">3. Dual-Token Architecture: $ORAH & $PULSE</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#121212] border border-[#222]">
                      <div className="flex items-center space-x-2 text-[#00FF41] font-bold">
                        <Coins className="w-4 h-4" />
                        <span>$ORAH (Governance & Protocol Yield)</span>
                      </div>
                      <p className="mt-2 text-[#AAA]">
                        Fixed supply governance asset. 40% of all protocol trading fees across spot and perps are autonomously directed to buy back and burn $ORAH or distributed to stakers.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#121212] border border-[#222]">
                      <div className="flex items-center space-x-2 text-[#00FF41] font-bold">
                        <Zap className="w-4 h-4" />
                        <span>$PULSE (Utility & Speed Gas)</span>
                      </div>
                      <p className="mt-2 text-[#AAA]">
                        High-velocity utility token used for fee rebates, priority order execution in peak volatility, and copy-trading vault performance stakes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {wpSection === 'escrow' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">4. Non-Custodial Smart Escrow Protocols</h3>
                  <p>
                    OTC and P2P trades are governed by deterministic timelocked smart escrow contracts. The contract parameters enforce:
                  </p>
                  <div className="p-4 rounded-xl bg-[#111] border border-[#1E1E1E] font-mono text-[11px] space-y-2">
                    <div>1. Buyer & Seller commit cryptographic deposits to the on-chain vault.</div>
                    <div>2. Multi-oracle verification guarantees fiat, crypto, or stablecoin delivery.</div>
                    <div>3. In the event of dispute, decentralized arbitration nodes review cryptographic signature proofs.</div>
                    <div>4. Automatic timelock expiration releases funds safely back to origin address if unfulfilled.</div>
                  </div>
                </div>
              )}

              {wpSection === 'perps' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">5. 50x Perpetual Futures Math & Risk Engine</h3>
                  <p>
                    Tradex & Pulse offers up to 50x leverage on major cryptocurrency indices (BSV, BTC, ETH, SOL, ORAH, PEPE). Funding rates recalculate every 8 hours based on the difference between the perpetual index price and the spot mark price. Liquidation threshold buffers prevent cascade liquidations.
                  </p>
                </div>
              )}

              {wpSection === 'security' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">6. Security, Audits & Formal Verification</h3>
                  <p>
                    All smart contracts undergo rigorous formal verification and continuous fuzz testing. Core escrow logic is immutable, with timelocked upgrades governed exclusively by decentralized on-chain votes.
                  </p>
                  <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41] font-mono text-[11px] flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Audited by OpenZeppelin, Halborn, and Trail of Bits standards. Zero critical vulnerabilities found.</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================= 2. TERMS OF SERVICE ================= */}
          {activeTab === 'terms' && (
            <div className="space-y-4 font-sans">
              <h3 className="text-lg font-bold text-white">Tradex & Pulse Terms of Service</h3>
              <p className="text-[#888] font-mono text-[11px]">Last Updated: September 2026</p>
              
              <div className="space-y-3 divide-y divide-[#1A1A1A]">
                <div className="pt-3">
                  <h4 className="font-bold text-white">1. Non-Custodial Nature</h4>
                  <p className="mt-1">
                    Tradex & Pulse is an open-source decentralized software interface. Tradex & Pulse does not custody, hold, take possession of, or control your cryptographic private keys, digital assets, or funds at any time. All transactions are broadcast directly to public blockchain networks.
                  </p>
                </div>
                <div className="pt-3">
                  <h4 className="font-bold text-white">2. User Responsibility & Risk Disclosure</h4>
                  <p className="mt-1">
                    Cryptocurrency trading, perpetual contracts with leverage, and cross-chain swaps carry substantial financial risk of total loss. You are solely responsible for securing your wallet seed phrase, passkeys, and transaction parameters.
                  </p>
                </div>
                <div className="pt-3">
                  <h4 className="font-bold text-white">3. Compliance with Local Jurisdictions</h4>
                  <p className="mt-1">
                    Users must ensure their usage of decentralized exchange protocols complies with the laws and regulations of their jurisdiction. Access is prohibited from sanctioned territories and jurisdictions where derivatives trading is restricted.
                  </p>
                </div>
                <div className="pt-3">
                  <h4 className="font-bold text-white">4. Smart Contract & Blockchain Risks</h4>
                  <p className="mt-1">
                    You acknowledge that blockchain networks may experience hard forks, network congestion, reorganization events, or validator downtime beyond the interface's control.
                  </p>
                </div>
                <div className="pt-3">
                  <h4 className="font-bold text-white">5. Protocol Fees & Slippage</h4>
                  <p className="mt-1">
                    Trading fees are executed automatically by on-chain contracts according to the published schedule (0.01% maker, 0.03% taker). AMM swaps are executed within your configured slippage tolerance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. PRIVACY POLICY ================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 font-sans">
              <h3 className="text-lg font-bold text-white">Tradex & Pulse Sovereign Privacy Policy</h3>
              <p className="text-[#888] font-mono text-[11px]">Last Updated: September 2026</p>

              <div className="space-y-3 divide-y divide-[#1A1A1A]">
                <div className="pt-3">
                  <h4 className="font-bold text-white">1. Zero Personally Identifiable Information (PII) Collection</h4>
                  <p className="mt-1">
                    Tradex & Pulse does NOT collect, store, sell, or process personal identifying information such as your real name, physical address, passport numbers, email addresses, or phone numbers.
                  </p>
                </div>
                <div className="pt-3">
                  <h4 className="font-bold text-white">2. Cryptographic Public Keys</h4>
                  <p className="mt-1">
                    When you connect a Web3 wallet, your public wallet address is used client-side to query on-chain account balances and construct unbroadcasted transaction payloads. Your private keys never leave your device.
                  </p>
                </div>
                <div className="pt-3">
                  <h4 className="font-bold text-white">3. Client-Side Local Storage</h4>
                  <p className="mt-1">
                    User interface preferences (such as selected theme, chart indicators, favourite trading pairs, and slippage settings) are saved solely on your local device via browser LocalStorage. You may clear this data at any time.
                  </p>
                </div>
                <div className="pt-3">
                  <h4 className="font-bold text-white">4. Decentralized RPC Nodes</h4>
                  <p className="mt-1">
                    Requests to query blockchain data communicate directly with public decentralized RPC nodes on Bitcoin SV, Base, Ethereum, and Solana. Tradex & Pulse does not log your IP address.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. FAQ ================= */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[#777] absolute left-3 top-3" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search FAQ questions..."
                  className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="space-y-2">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#111111] border border-[#1E1E1E] overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#161616] transition-colors"
                      >
                        <span className="font-bold text-white text-xs sm:text-sm">{faq.q}</span>
                        {isOpen ? <ChevronDown className="w-4 h-4 text-[#00FF41] shrink-0" /> : <ChevronRight className="w-4 h-4 text-[#666] shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="p-3.5 pt-0 text-xs text-[#AAA] leading-relaxed border-t border-[#181818]/60 mt-1">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 5. STATUS ================= */}
          {activeTab === 'status' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/20 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41] animate-pulse"></span>
                  <span className="font-bold text-white">All Tradex & Pulse Systems Operational</span>
                </div>
                <span className="text-[#00FF41] font-black text-xs">99.99% UPTIME</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Bitcoin SV Teranode Settlement Engine', status: 'Operational', latency: '6ms', load: '14%' },
                  { name: 'Base / EVM Atomic State Relayer', status: 'Operational', latency: '12ms', load: '28%' },
                  { name: 'Solana Program Verification Cluster', status: 'Operational', latency: '8ms', load: '22%' },
                  { name: 'Ronin Cross-Chain Liquidity Node', status: 'Operational', latency: '15ms', load: '11%' },
                  { name: 'Deterministic Orderbook Matching Engine', status: 'Operational', latency: '0.4ms', load: '42%' },
                  { name: 'Smart Escrow Timelock Settlement Hub', status: 'Operational', latency: '4ms', load: '18%' },
                  { name: 'Pyth / Chainlink Price Oracle Aggregator', status: 'Operational', latency: '18ms', load: '35%' },
                  { name: 'Ora AI Autonomous Trading Service', status: 'Operational', latency: '45ms', load: '19%' }
                ].map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#111] border border-[#1E1E1E] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[10px] text-[#666] mt-0.5">Latency: {s.latency} • Load: {s.load}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#00FF41]/20 text-[#00FF41] text-[10px] font-bold">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-3.5 bg-[#0F0F0F] border-t border-[#1C1C1C] flex items-center justify-between font-mono text-xs">
          <div className="text-[#666] text-[11px]">
            Tradex & Pulse • Autonomous AI Perpetual DEX
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-bold transition-all shadow-[0_0_12px_rgba(0,255,65,0.3)]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
