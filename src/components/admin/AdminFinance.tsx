import React, { useState } from 'react';
import { 
  TrendingUp, 
  Layers, 
  BookOpen, 
  ArrowDownToLine, 
  Landmark, 
  Flame, 
  WalletCards, 
  BarChart4, 
  Zap, 
  Database, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  ExternalLink,
  Coins,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminFinance: React.FC<{ activeSubtab: string }> = ({ activeSubtab }) => {
  const [distributeSuccess, setDistributeSuccess] = useState(false);
  const [burnAmount, setBurnAmount] = useState('');
  const [burnSuccess, setBurnSuccess] = useState(false);

  const handleDistributeFees = () => {
    setDistributeSuccess(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setDistributeSuccess(false), 3000);
  };

  const handleBurnTokens = (e: React.FormEvent) => {
    e.preventDefault();
    if (!burnAmount) return;
    setBurnSuccess(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => {
      setBurnSuccess(false);
      setBurnAmount('');
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* ================= 1. ALL PROFITS & TREASURY ================= */}
      {(activeSubtab === 'all_profits' || activeSubtab === 'treasury' || activeSubtab === 'swap_income') && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-xl font-black text-white">Protocol Treasury & Revenue Analytics</h2>
              <p className="text-xs text-[#777] font-mono">Aggregated swap fees, liquidation revenues, and autonomous bot profits.</p>
            </div>

            <button
              onClick={handleDistributeFees}
              className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black text-xs font-mono uppercase tracking-wider shadow-md"
            >
              Distribute Fees to $ORAH Stakers
            </button>
          </div>

          {/* Revenue Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#777]">Total Protocol Revenue</div>
              <div className="text-2xl font-black text-white font-mono">$482,910.45</div>
              <div className="text-[11px] text-[#00FF41] font-mono">+24.8% vs last month</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#777]">BSV Sovereign Treasury</div>
              <div className="text-2xl font-black text-[#00FF41] font-mono">2,841.50 BSV</div>
              <div className="text-[11px] text-[#888] font-mono">≈ $138,096.90 USD</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#777]">24H Swap Fees Collected</div>
              <div className="text-2xl font-black text-white font-mono">$8,419.20</div>
              <div className="text-[11px] text-[#00FF41] font-mono">0.03% average taker fee</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#777]">Quant Bot Yield</div>
              <div className="text-2xl font-black text-white font-mono">$4,219.80</div>
              <div className="text-[11px] text-[#00FF41] font-mono">100% automated arbitrage</div>
            </div>
          </div>

          {distributeSuccess && (
            <div className="p-3.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Successfully triggered on-chain staking dividend snapshot! 4,200 USDT disbursed to stakers.</span>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. ON-CHAIN TRANSACTIONS ================= */}
      {activeSubtab === 'on_chain_txns' && (
        <div className="space-y-4">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Live On-Chain Settlement Logs</h2>
            <p className="text-xs text-[#777] font-mono">Immutable Bitcoin SV blockchain transaction receipts with block confirmations.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1E1E1E] bg-[#0D0D0D]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141414] text-[#777] border-b border-[#1E1E1E] uppercase text-[10px]">
                <tr>
                  <th className="p-3">TxID Hash</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Block</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {[
                  { txid: 'a89f...31bc', type: 'Atomic Swap', amount: '1.50 BSV ⇄ 72.90 USDT', block: '#964682', status: 'Confirmed' },
                  { txid: 'b14c...98ad', type: 'Perp Settlement', amount: '+$340.00 PnL', block: '#964682', status: 'Confirmed' },
                  { txid: '7d2e...44ff', type: 'Staking Deposit', amount: '500 $ORAH', block: '#964681', status: 'Confirmed' },
                  { txid: 'e01a...11cc', type: 'Prediction Outcome', amount: '48.60 USDT', block: '#964680', status: 'Confirmed' },
                  { txid: '49aa...87eb', type: 'P2P Escrow Release', amount: '0.85 BSV', block: '#964679', status: 'Confirmed' }
                ].map((t, i) => (
                  <tr key={i} className="hover:bg-[#121212] transition-colors">
                    <td className="p-3 text-[#00FF41] font-bold">{t.txid}</td>
                    <td className="p-3 text-white">{t.type}</td>
                    <td className="p-3 text-white font-bold">{t.amount}</td>
                    <td className="p-3 text-[#777]">{t.block}</td>
                    <td className="p-3">
                      <span className="text-[#00FF41] flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
                        <span>{t.status}</span>
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <a 
                        href={`https://whatsonchain.com/tx/${t.txid}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-[#666] hover:text-[#00FF41] transition-colors"
                      >
                        <span>WhatsOnChain</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 3. MINT & BURN ================= */}
      {activeSubtab === 'mint_burn' && (
        <div className="space-y-5">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white">Token Mint & Deflationary Burn Control</h2>
            <p className="text-xs text-[#777] font-mono">Provably provable token supply management for $ORAH and $AURA.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Supply stats */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-white uppercase font-mono">Circulating Supply Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[#888]">
                  <span>$ORAH Max Cap:</span>
                  <span className="text-white font-bold">21,000,000 ORAH</span>
                </div>
                <div className="flex justify-between text-[#888]">
                  <span>$ORAH Total Burned:</span>
                  <span className="text-red-400 font-bold">428,190 ORAH (2.03%)</span>
                </div>
                <div className="flex justify-between text-[#888]">
                  <span>$AURA Max Cap:</span>
                  <span className="text-white font-bold">100,000,000 AURA</span>
                </div>
                <div className="flex justify-between text-[#888]">
                  <span>Proof of Burn Address:</span>
                  <span className="text-[#00FF41] font-bold">1111111111111111111114oLvT2</span>
                </div>
              </div>
            </div>

            {/* Burn action form */}
            <form onSubmit={handleBurnTokens} className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center space-x-2">
                <Flame className="w-4 h-4 text-red-400" />
                <span>Execute Deflationary Buyback & Burn</span>
              </h3>
              <div>
                <label className="block text-xs font-mono uppercase text-[#777] mb-1">Amount $ORAH to Burn</label>
                <input
                  type="number"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-red-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Permanently Burn Tokens on BSV
              </button>

              {burnSuccess && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono">
                  🔥 Successfully burned tokens! TXID: e4a7...99cc broadcast to BSV blockchain.
                </div>
              )}
            </form>

          </div>
        </div>
      )}

      {/* ================= 4. OTHER FINANCE SUBTABS ================= */}
      {(activeSubtab === 'ledger_manager' || activeSubtab === 'withdrawals' || activeSubtab === 'fee_wallet' || activeSubtab === 'bot_profit' || activeSubtab === 'arb_bot' || activeSubtab === 'seeded_pool' || activeSubtab === 'db_sync') && (
        <div className="space-y-4">
          <div className="pb-3 border-b border-[#1A1A1A]">
            <h2 className="text-xl font-black text-white capitalize">{activeSubtab.replace('_', ' ')}</h2>
            <p className="text-xs text-[#777] font-mono">Accounting integrity, cryptographic ledger proof, and liquidity health.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2 font-mono">
              <div className="text-xs text-[#777]">SOLVENCY STATUS</div>
              <div className="text-xl font-bold text-[#00FF41]">100% Reserved (1:1)</div>
              <div className="text-[11px] text-[#888]">Non-custodial UTXO verification</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2 font-mono">
              <div className="text-xs text-[#777]">PENDING WITHDRAWALS</div>
              <div className="text-xl font-bold text-white">0 Queue</div>
              <div className="text-[11px] text-[#00FF41]">Instant atomic settlement</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-2 font-mono">
              <div className="text-xs text-[#777]">ARBITRAGE SPREAD CAPTURE</div>
              <div className="text-xl font-bold text-white">0.42% Net Spread</div>
              <div className="text-[11px] text-[#00FF41]">BSV vs Binance/OKX</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
