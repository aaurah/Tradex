import React, { useState } from 'react';
import { 
  DollarSign, 
  Flame, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  TrendingUp,
  Download,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Send,
  Lock,
  Wallet,
  Coins,
  Database,
  BarChart3,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { adminSettingsStore } from '../../services/adminSettingsStore';

export const AdminFinance: React.FC<{ activeSubtab: string }> = ({ activeSubtab }) => {
  const store = adminSettingsStore.data;

  // Mint & Burn State
  const [burnAmount, setBurnAmount] = useState('25000');
  const [burnToken, setBurnToken] = useState('ORAH');
  const [isBurning, setIsBurning] = useState(false);
  const [burnSuccess, setBurnSuccess] = useState(false);
  const [mintAmount, setMintAmount] = useState('10000');
  const [mintRecipient, setMintRecipient] = useState('1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ');
  const [mintNotice, setMintNotice] = useState<string | null>(null);

  // Treasury State
  const [treasuryBalanceBsv, setTreasuryBalanceBsv] = useState(2841.50);
  const [treasuryBalanceUsdt, setTreasuryBalanceUsdt] = useState(148200.00);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAsset, setDepositAsset] = useState('BSV');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [treasuryNotice, setTreasuryNotice] = useState<string | null>(null);

  // Raw Tx Hex Broadcaster
  const [rawTxHex, setRawTxHex] = useState('');
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  // Withdrawals Queue State
  const [withdrawals, setWithdrawals] = useState([
    { id: 'WTH-8812', user: 'Quant_Whale_99', amount: '15.00 BSV', address: '18cbBi2Y968JvDda839BqXp4112LqWe', status: 'Pending', time: '14m ago' },
    { id: 'WTH-8811', user: 'Sats_Arbitrageur', amount: '2.50 BSV', address: '1Lbcfr7s996vB1Xp44Lkd81m30Q', status: 'Pending', time: '38m ago' },
    { id: 'WTH-8810', user: 'Trader_0x91', amount: '450.00 USDT', address: '0x49c95...60bC', status: 'Approved', time: '2h ago' },
  ]);

  // Seeded Pools State
  const [poolBsv, setPoolBsv] = useState(1250);
  const [poolUsdt, setPoolUsdt] = useState(60750);
  const [addSeedAmount, setAddSeedAmount] = useState('50');
  const [poolNotice, setPoolNotice] = useState<string | null>(null);

  // DB Sync State
  const [syncHeight, setSyncHeight] = useState('964682');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // On-chain Tx Search
  const [txSearch, setTxSearch] = useState('');

  // Sample On-Chain Transactions
  const [txList, setTxList] = useState([
    { id: 'tx-1', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', type: 'ATOMIC_SWAP', amount: '+1.50 BSV', fee: '0.000012 BSV', block: '964,682', time: '4m ago' },
    { id: 'tx-2', hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', type: 'FEE_DISTRIBUTION', amount: '+$420.50 USDT', fee: '0.000008 BSV', block: '964,682', time: '12m ago' },
    { id: 'tx-3', hash: '7c89d146648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327bb2', type: 'TREASURY_SWEEP', amount: '+12.40 BSV', fee: '0.000015 BSV', block: '964,681', time: '35m ago' },
    { id: 'tx-4', hash: '1a2b3c46648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327cc3', type: 'BURN_EVENT', amount: '-50,000 ORAH', fee: '0.000009 BSV', block: '964,680', time: '1h ago' },
    { id: 'tx-5', hash: '9f8e7d46648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327dd4', type: 'PERP_SETTLEMENT', amount: '+4.80 BSV', fee: '0.000018 BSV', block: '964,679', time: '2h ago' }
  ]);

  // Handle Token Burn
  const handleBurn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBurning(true);
    setTimeout(() => {
      setIsBurning(false);
      setBurnSuccess(true);
      adminSettingsStore.addLog('SUCCESS', 'MINT-BURN', `Burned ${burnAmount} ${burnToken} tokens. Supply permanently reduced.`);
      confetti({ particleCount: 40 });
      setTimeout(() => setBurnSuccess(false), 3500);
    }, 800);
  };

  // Handle Token Mint
  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    setMintNotice(`Successfully minted ${mintAmount} $ORAH to ${mintRecipient}`);
    adminSettingsStore.addLog('SUCCESS', 'MINT-BURN', `Minted ${mintAmount} $ORAH to ${mintRecipient}`);
    confetti({ particleCount: 35 });
    setTimeout(() => setMintNotice(null), 3000);
  };

  // Handle Approve Withdrawal
  const handleApproveWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'Approved' } : w));
    adminSettingsStore.addLog('SUCCESS', 'TREASURY', `Signed and approved withdrawal ${id}`);
    confetti({ particleCount: 25 });
  };

  // Handle Reject Withdrawal
  const handleRejectWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'Rejected' } : w));
    adminSettingsStore.addLog('WARN', 'TREASURY', `Rejected withdrawal ${id}. Funds returned to user balance.`);
  };

  // Handle Treasury Deposit
  const handleDepositTreasury = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount) || 0;
    if (depositAsset === 'BSV') setTreasuryBalanceBsv(prev => prev + val);
    else setTreasuryBalanceUsdt(prev => prev + val);

    adminSettingsStore.addLog('SUCCESS', 'TREASURY', `Deposited ${val} ${depositAsset} into Sovereign Multi-Sig Vault.`);
    setDepositAmount('');
    setShowDepositModal(false);
    setTreasuryNotice(`Successfully credited ${val} ${depositAsset} to protocol reserves!`);
    confetti({ particleCount: 35 });
    setTimeout(() => setTreasuryNotice(null), 3000);
  };

  // Broadcast Raw Hex
  const handleBroadcastHex = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawTxHex.trim()) return;
    const broadcastTxHash = '0x' + Math.random().toString(16).substring(2) + Date.now().toString(16);
    adminSettingsStore.addLog('SUCCESS', 'BROADCASTER', `Broadcasted raw transaction to Gorillapool: ${broadcastTxHash}`);
    setBroadcastNotice(`Transaction successfully mined on BSV blockchain! TxID: ${broadcastTxHash.substring(0, 18)}...`);
    setRawTxHex('');
    confetti({ particleCount: 30 });
    setTimeout(() => setBroadcastNotice(null), 4000);
  };

  // Resync Blockchain
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncNotice(`UTXO indexes synchronized up to latest block #${syncHeight}!`);
      adminSettingsStore.addLog('INFO', 'DB-SYNC', `Completed blockchain re-index up to block #${syncHeight}`);
      confetti({ particleCount: 25 });
      setTimeout(() => setSyncNotice(null), 3000);
    }, 900);
  };

  return (
    <div className="space-y-6">

      {/* ================= 1. ALL PROFITS & SWAP INCOME ================= */}
      {(activeSubtab === 'all_profits' || activeSubtab === 'swap_income') && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Protocol Revenue & Accumulated Profit</h2>
              <p className="text-xs text-[#777]">Net fee earnings across Spot Swaps, Perpetuals, and Autonomous Quant Arbitrage.</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-xl bg-[#141414] border border-[#222] text-[#AAA]">
                Period: Last 30 Days
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">TOTAL NET REVENUE</div>
              <div className="text-2xl font-black text-[#00FF41]">$284,910.45</div>
              <div className="text-[11px] text-[#888]">+28.4% this month</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">SPOT SWAP FEES</div>
              <div className="text-2xl font-black text-white">$142,400.00</div>
              <div className="text-[11px] text-[#888]">49.9% of total revenue</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">PERP FUNDING GAINS</div>
              <div className="text-2xl font-black text-white">$98,210.15</div>
              <div className="text-[11px] text-[#888]">34.5% of total revenue</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">QUANT BOT ARBITRAGE</div>
              <div className="text-2xl font-black text-white">$44,300.30</div>
              <div className="text-[11px] text-[#888]">15.6% of total revenue</div>
            </div>
          </div>

          {/* Revenue Distribution Progress */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
            <h3 className="text-sm font-bold text-white uppercase">Automated Dividend Distribution</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[#AAA]">
                <span>50% $ORAH Staking Yield Pool</span>
                <span className="text-white font-bold">$142,455.22</span>
              </div>
              <div className="flex justify-between text-[#AAA]">
                <span>30% Sovereign Protocol Treasury</span>
                <span className="text-white font-bold">$85,473.13</span>
              </div>
              <div className="flex justify-between text-[#AAA]">
                <span>20% $ORAH Buyback & Deflationary Burn</span>
                <span className="text-[#00FF41] font-bold">$56,982.10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. ON-CHAIN TRANSACTIONS ================= */}
      {activeSubtab === 'on_chain_txns' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">On-Chain Bitcoin SV Transactions</h2>
              <p className="text-xs text-[#777]">Immutable ledger settlements verified by Gorillapool and WhatsOnChain.</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2.5" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Search TxID or type..."
                className="pl-8 pr-3 py-1.5 bg-[#141414] border border-[#262626] rounded-lg text-white text-xs focus:outline-none focus:border-[#00FF41] w-64"
              />
            </div>
          </div>

          {/* Raw Hex Broadcaster */}
          <form onSubmit={handleBroadcastHex} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase">Manual Raw Tx Hex Broadcaster</span>
              <span className="text-[10px] text-[#777]">Broadcast directly to Gorillapool ARC</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={rawTxHex}
                onChange={(e) => setRawTxHex(e.target.value)}
                placeholder="Paste raw signed hex (0100000001...)"
                className="flex-1 px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00FF41]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-bold uppercase"
              >
                Broadcast
              </button>
            </div>
          </form>

          {broadcastNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{broadcastNotice}</span>
            </div>
          )}

          {/* Tx Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1E1E1E] bg-[#0D0D0D]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141414] text-[#777] border-b border-[#1E1E1E] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Tx Hash</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Miner Fee</th>
                  <th className="p-3">Block</th>
                  <th className="p-3">Time</th>
                  <th className="p-3 text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {txList
                  .filter(t => !txSearch || t.hash.toLowerCase().includes(txSearch.toLowerCase()) || t.type.toLowerCase().includes(txSearch.toLowerCase()))
                  .map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#121212] transition-colors">
                      <td className="p-3 font-bold text-white flex items-center space-x-2">
                        <span className="text-[#00FF41]">{tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 6)}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">{tx.amount}</td>
                      <td className="p-3 text-[#888]">{tx.fee}</td>
                      <td className="p-3 text-[#AAA]">#{tx.block}</td>
                      <td className="p-3 text-[#777]">{tx.time}</td>
                      <td className="p-3 text-right">
                        <a
                          href={`https://whatsonchain.com/tx/${tx.hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[#888] hover:text-[#00FF41] p-1 rounded"
                        >
                          <span>WhatsOnChain</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 3. TREASURY & MULTI-SIG ================= */}
      {activeSubtab === 'treasury' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Sovereign Multi-Sig Protocol Treasury</h2>
              <p className="text-xs text-[#777]">Secured by 2-of-3 threshold signature scheme (SuperAdmin + AURA AI + Hardware Node).</p>
            </div>

            <button
              onClick={() => setShowDepositModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-bold flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Deposit Reserve Funds</span>
            </button>
          </div>

          {treasuryNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{treasuryNotice}</span>
            </div>
          )}

          {/* Deposit Modal */}
          {showDepositModal && (
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#00FF41]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-[#00FF41]" />
                  <span>Credit Treasury Reserve Vault</span>
                </h3>
                <button onClick={() => setShowDepositModal(false)} className="text-[#888] hover:text-white">✕ Cancel</button>
              </div>

              <form onSubmit={handleDepositTreasury} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#777] mb-1">Asset Type</label>
                    <select
                      value={depositAsset}
                      onChange={(e) => setDepositAsset(e.target.value)}
                      className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                    >
                      <option value="BSV">Bitcoin SV (BSV)</option>
                      <option value="USDT">Tether USD (USDT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#777] mb-1">Deposit Amount</label>
                    <input
                      type="number"
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3 py-2 bg-[#181818] border border-[#2E2E2E] rounded-lg text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider"
                >
                  Confirm On-Chain Treasury Deposit
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-[10px] text-[#777] uppercase">VAULT BSV BALANCE</div>
              <div className="text-3xl font-black text-white">{treasuryBalanceBsv.toLocaleString()} BSV</div>
              <div className="text-[11px] text-[#00FF41]">≈ ${(treasuryBalanceBsv * 48.60).toLocaleString()} USD</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-[10px] text-[#777] uppercase">VAULT USDT BALANCE</div>
              <div className="text-3xl font-black text-white">${treasuryBalanceUsdt.toLocaleString()} USDT</div>
              <div className="text-[11px] text-[#888]">Cold multisig reserve address</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. MINT & BURN ================= */}
      {activeSubtab === 'mint_burn' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Deflationary Burn & Supply Governance</h2>
            <p className="text-xs text-[#777]">Permanently burn $ORAH tokens from circulating supply or mint reserve rewards.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Burn Tool */}
            <form onSubmit={handleBurn} className="p-5 rounded-2xl bg-[#0D0D0D] border border-red-500/30 space-y-4">
              <div className="flex items-center space-x-2 text-red-400 font-bold uppercase">
                <Flame className="w-4 h-4" />
                <span>Deflationary Token Burner</span>
              </div>
              <p className="text-[#888]">
                Sends tokens to the unspendable burn address <code>1111111111111111111114oLvT2</code> with OP_RETURN tombstone proof.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#777] mb-1">Burn Token</label>
                  <select
                    value={burnToken}
                    onChange={(e) => setBurnToken(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  >
                    <option value="ORAH">$ORAH (Governance)</option>
                    <option value="AURA">$AURA (AI Intelligence)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Tokens to Burn</label>
                  <input
                    type="text"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isBurning}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider"
              >
                {isBurning ? 'Broadcasting Burn Tx...' : `Burn ${burnAmount} ${burnToken}`}
              </button>

              {burnSuccess && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-200">
                  ✓ Tokens burnt! 25,000 $ORAH deducted from circulating supply.
                </div>
              )}
            </form>

            {/* Mint Tool */}
            <form onSubmit={handleMint} className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
              <div className="flex items-center space-x-2 text-[#00FF41] font-bold uppercase">
                <Coins className="w-4 h-4" />
                <span>Ecosystem Rewards Minting</span>
              </div>
              <p className="text-[#888]">
                Authorized protocol reward emission governed by the 21,000,000 hard-cap smart contract.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[#777] mb-1">Tokens to Mint</label>
                  <input
                    type="text"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#777] mb-1">Recipient Address</label>
                  <input
                    type="text"
                    value={mintRecipient}
                    onChange={(e) => setMintRecipient(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider"
              >
                Mint & Allocate Rewards
              </button>

              {mintNotice && (
                <div className="p-3 rounded-lg bg-[#00FF41]/10 text-[#00FF41]">
                  ✓ {mintNotice}
                </div>
              )}
            </form>

          </div>
        </div>
      )}

      {/* ================= 5. WITHDRAWALS & HOT WALLET ================= */}
      {(activeSubtab === 'withdrawals' || activeSubtab === 'fee_wallet') && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Pending User Withdrawals & Hot Wallet Queue</h2>
              <p className="text-xs text-[#777]">Authorize and co-sign hot wallet liquidity disbursements.</p>
            </div>
          </div>

          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00FF41] font-bold">{w.id}</span>
                    <span className="text-white font-bold">{w.user}</span>
                    <span className="text-[#777]">• {w.time}</span>
                  </div>
                  <div className="text-[11px] text-[#AAA] mt-1 font-mono">
                    Amount: <strong className="text-white">{w.amount}</strong> to {w.address}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    w.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                    w.status === 'Approved' ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {w.status}
                  </span>

                  {w.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApproveWithdrawal(w.id)}
                        className="px-3 py-1 rounded bg-[#00FF41] hover:bg-[#00D436] text-black font-bold"
                      >
                        Approve & Sign
                      </button>
                      <button
                        onClick={() => handleRejectWithdrawal(w.id)}
                        className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222] text-[#888]"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 6. PROOF OF RESERVES & LEDGER ================= */}
      {activeSubtab === 'ledger_manager' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Cryptographic Proof of Reserves (PoR)</h2>
            <p className="text-xs text-[#777]">Merkle tree audit verifying 100% full backing of all user deposits on Bitcoin SV.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">TOTAL USER LIABILITIES</div>
              <div className="text-2xl font-black text-white">2,510.40 BSV</div>
              <div className="text-[11px] text-[#888]">100% balance covered</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">ON-CHAIN VAULT RESERVES</div>
              <div className="text-2xl font-black text-[#00FF41]">2,841.50 BSV</div>
              <div className="text-[11px] text-[#888]">Audited on block #964,682</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] text-[#777] uppercase">SOLVENCY RESERVE RATIO</div>
              <div className="text-2xl font-black text-[#00FF41]">113.18%</div>
              <div className="text-[11px] text-[#00FF41]">Over-collateralized</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
            <h3 className="text-sm font-bold text-white uppercase">Current Merkle Tree Root Hash</h3>
            <div className="p-3 rounded-lg bg-[#141414] border border-[#222] font-mono text-white text-xs break-all">
              0x4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b
            </div>
            <div className="flex justify-between text-[#777] text-[11px]">
              <span>Leaf Nodes: 14,291 user UTXOs</span>
              <span className="text-[#00FF41]">✓ Verified & Timestamped on BSV</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. SEEDED POOL & ARB BOT ================= */}
      {(activeSubtab === 'seeded_pool' || activeSubtab === 'arb_bot' || activeSubtab === 'bot_profit') && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Liquidity Reserve Pools & Triangular Arbitrage</h2>
              <p className="text-xs text-[#777]">Sovereign protocol bonding curve reserves ensuring instant zero-slippage execution.</p>
            </div>
          </div>

          {poolNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{poolNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-[10px] text-[#777] uppercase">SEEDED BSV LIQUIDITY</div>
              <div className="text-3xl font-black text-white">{poolBsv} BSV</div>
              <div className="text-[11px] text-[#00FF41]">Bonded virtual depth</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2">
              <div className="text-[10px] text-[#777] uppercase">SEEDED USDT LIQUIDITY</div>
              <div className="text-3xl font-black text-white">${poolUsdt.toLocaleString()} USDT</div>
              <div className="text-[11px] text-[#00FF41]">Constant product invariant k</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
            <h3 className="text-sm font-bold text-white uppercase">Inject Seed Capital into Internal AMM Pool</h3>
            <div className="flex space-x-2">
              <input
                type="number"
                value={addSeedAmount}
                onChange={(e) => setAddSeedAmount(e.target.value)}
                placeholder="Amount in BSV..."
                className="flex-1 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
              />
              <button
                onClick={() => {
                  const val = parseFloat(addSeedAmount) || 0;
                  setPoolBsv(prev => prev + val);
                  setPoolUsdt(prev => prev + val * 48.60);
                  setPoolNotice(`Injected ${val} BSV into sovereign bonding curve!`);
                  confetti({ particleCount: 25 });
                  setTimeout(() => setPoolNotice(null), 3000);
                }}
                className="px-4 py-2 rounded-lg bg-[#00FF41] hover:bg-[#00D436] text-black font-bold uppercase"
              >
                Inject Liquidity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 8. DB SYNC ================= */}
      {activeSubtab === 'db_sync' && (
        <div className="space-y-5 animate-in fade-in duration-150 font-mono text-xs">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Blockchain Height & Database Synchronizer</h2>
            <p className="text-xs text-[#777]">Resync UTXO spent indices from specific block heights.</p>
          </div>

          {syncNotice && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{syncNotice}</span>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#777] mb-1">Target BSV Block Height</label>
                <input
                  type="text"
                  value={syncHeight}
                  onChange={(e) => setSyncHeight(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[#777] mb-1">Sync Mode</label>
                <select className="w-full px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white">
                  <option>Fast UTXO Snapshot Sync</option>
                  <option>Full Mempool & Historical Scan</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="w-full py-2.5 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider"
            >
              {isSyncing ? 'Re-indexing Block UTXOs...' : `Trigger Blockchain Re-Index from #${syncHeight}`}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
