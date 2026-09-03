import React, { useState } from 'react';
import { 
  TRADEX_ESCROW_CONTRACT_ADDRESS, 
  escrowTradingService, 
  SmartContractMethodCall 
} from '../../services/escrowTradingService';
import { copyToClipboard } from '../../utils/clipboard';
import { 
  Code, 
  Play, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Cpu, 
  Flame, 
  Radio, 
  Terminal,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

export const EscrowContractAbiCaller: React.FC = () => {
  const metadata = escrowTradingService.getContractMetadata();

  const [selectedMethod, setSelectedMethod] = useState<string>('deposit');
  const [escrowIdInput, setEscrowIdInput] = useState<string>('escrow-bsv-whale-902');
  const [counterpartyInput, setCounterpartyInput] = useState<string>('0xfe9e8709d3215310075d67e3ed32a380ccf451c8');
  const [amountInput, setAmountInput] = useState<string>('50000');
  const [timelockInput, setTimelockInput] = useState<string>('144');
  const [reasonInput, setReasonInput] = useState<string>('Milestone specification discrepancy');
  const [milestoneIdxInput, setMilestoneIdxInput] = useState<string>('1');

  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callHistory, setCallHistory] = useState<SmartContractMethodCall[]>([
    {
      method: 'deposit',
      args: { escrowId: 'escrow-bsv-whale-902', amount: '100000 USDT' },
      txHash: '0x7e59b2ec4b80b7e289f33c3064c519bfdffdb2368ec2b64d1f56b3e9a7e6717a',
      blockNumber: 890412,
      gasUsed: 54200,
      status: 'SUCCESS',
      timestamp: Date.now() - 1000 * 60 * 35,
      resultMessage: `Executed deposit() successfully on Escrow Contract ${TRADEX_ESCROW_CONTRACT_ADDRESS}. Confirmed in Block #890412.`
    },
    {
      method: 'createEscrow',
      args: { counterparty: '0xfe9e8709d3215310075d67e3ed32a380ccf451c8', amount: '250000 A8', timelock: 288 },
      txHash: '0x991823ab817ef819230914871239871029381029381029381029381029381029',
      blockNumber: 890408,
      gasUsed: 72150,
      status: 'SUCCESS',
      timestamp: Date.now() - 1000 * 60 * 110,
      resultMessage: `Executed createEscrow() successfully on Escrow Contract ${TRADEX_ESCROW_CONTRACT_ADDRESS}. Confirmed in Block #890408.`
    }
  ]);

  const [copiedAddr, setCopiedAddr] = useState(false);

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleExecuteAbiMethod = async () => {
    setIsCalling(true);
    try {
      let args: Record<string, any> = {};

      if (selectedMethod === 'createEscrow') {
        args = {
          counterparty: counterpartyInput,
          amount: amountInput,
          timelockBlocks: timelockInput
        };
      } else if (selectedMethod === 'deposit') {
        args = { escrowId: escrowIdInput };
      } else if (selectedMethod === 'releaseEscrow') {
        args = { escrowId: escrowIdInput };
      } else if (selectedMethod === 'releaseMilestone') {
        args = { escrowId: escrowIdInput, milestoneIndex: milestoneIdxInput };
      } else if (selectedMethod === 'refundEscrow') {
        args = { escrowId: escrowIdInput };
      } else if (selectedMethod === 'raiseDispute') {
        args = { escrowId: escrowIdInput, evidenceUri: reasonInput };
      } else if (selectedMethod === 'getEscrowState') {
        args = { escrowId: escrowIdInput };
      }

      const record = await escrowTradingService.callSmartContractMethod(selectedMethod, args);
      setCallHistory([record, ...callHistory]);
    } catch (err: any) {
      alert(err.message || 'Call failed');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      
      {/* Contract Verification Banner */}
      <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-sm shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Smart Contract</span>
              </span>
              <span className="text-xs text-[#888]">
                {metadata.compilerVersion}
              </span>
              <span className="text-[#444]">•</span>
              <span className="text-xs text-[#AAA]">
                {metadata.contractName}
              </span>
            </div>

            <div className="flex items-center space-x-2.5">
              <span className="text-sm sm:text-lg font-black text-white tracking-wider break-all">
                {TRADEX_ESCROW_CONTRACT_ADDRESS}
              </span>
              <button
                onClick={() => handleCopy(TRADEX_ESCROW_CONTRACT_ADDRESS)}
                className="p-1.5 bg-[#141414] hover:bg-[#1E1E1E] text-[#888] hover:text-[#00FF41] border border-[#2A2A2A] rounded-sm transition-colors shrink-0"
                title="Copy Smart Contract Address"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {metadata.networks.map(n => (
              <a
                key={n.name}
                href={n.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-sm bg-[#121212] hover:bg-[#1A1A1A] border border-[#262626] text-[10px] text-[#AAA] hover:text-white flex items-center space-x-1 transition-colors"
              >
                <span>{n.name}</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#666]" />
              </a>
            ))}
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1C1C1C]">
          <div className="p-3 bg-[#111] rounded-sm border border-[#1E1E1E]">
            <div className="text-[10px] text-[#777] uppercase font-bold">Total Value Locked</div>
            <div className="text-base font-black text-[#00FF41] mt-0.5">
              ${(metadata.tvlUsd).toLocaleString()} USD
            </div>
          </div>
          <div className="p-3 bg-[#111] rounded-sm border border-[#1E1E1E]">
            <div className="text-[10px] text-[#777] uppercase font-bold">Volume Processed</div>
            <div className="text-base font-black text-white mt-0.5">
              ${(metadata.totalVolumeProcessedUsd).toLocaleString()} USD
            </div>
          </div>
          <div className="p-3 bg-[#111] rounded-sm border border-[#1E1E1E]">
            <div className="text-[10px] text-[#777] uppercase font-bold">Contracts Settled</div>
            <div className="text-base font-black text-white mt-0.5">
              {metadata.totalContractsExecuted.toLocaleString()} Escrows
            </div>
          </div>
          <div className="p-3 bg-[#111] rounded-sm border border-[#1E1E1E]">
            <div className="text-[10px] text-[#777] uppercase font-bold">Security Audits</div>
            <div className="text-xs font-bold text-cyan-400 mt-1">
              CertiK & OpenZeppelin
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: ABI Invoker & Live Transaction Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Contract Caller (6 cols) */}
        <div className="lg:col-span-6 space-y-4 bg-[#0A0A0A] p-5 rounded-sm border border-[#222] shadow-xl">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h3 className="text-xs font-bold uppercase text-white flex items-center space-x-2 tracking-widest">
              <Code className="w-4 h-4 text-[#00FF41]" />
              <span>Smart Contract ABI Invoker</span>
            </h3>
            <span className="text-[10px] text-[#777]">Direct On-Chain Call</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#888] uppercase text-[10px] font-bold block mb-1">
                Select ABI Function:
              </label>
              <select
                value={selectedMethod}
                onChange={e => setSelectedMethod(e.target.value)}
                className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#00FF41]"
              >
                {metadata.abiFunctions.map(f => (
                  <option key={f.name} value={f.name}>
                    {f.name}() [{f.type.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Arguments Based on Selection */}
            {selectedMethod === 'createEscrow' && (
              <>
                <div>
                  <label className="text-[#666] text-[10px] block mb-1">counterparty (address):</label>
                  <input
                    type="text"
                    value={counterpartyInput}
                    onChange={e => setCounterpartyInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-sm text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-[10px] block mb-1">amount (uint256):</label>
                  <input
                    type="text"
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-sm text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-[10px] block mb-1">timelockBlocks (uint256):</label>
                  <input
                    type="text"
                    value={timelockInput}
                    onChange={e => setTimelockInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-sm text-white text-[11px]"
                  />
                </div>
              </>
            )}

            {(selectedMethod === 'deposit' || selectedMethod === 'releaseEscrow' || selectedMethod === 'refundEscrow' || selectedMethod === 'getEscrowState') && (
              <div>
                <label className="text-[#666] text-[10px] block mb-1">escrowId (bytes32 / string):</label>
                <input
                  type="text"
                  value={escrowIdInput}
                  onChange={e => setEscrowIdInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-sm text-white text-[11px]"
                />
              </div>
            )}

            {selectedMethod === 'releaseMilestone' && (
              <>
                <div>
                  <label className="text-[#666] text-[10px] block mb-1">escrowId (bytes32):</label>
                  <input
                    type="text"
                    value={escrowIdInput}
                    onChange={e => setEscrowIdInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-sm text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-[10px] block mb-1">milestoneIndex (uint8):</label>
                  <input
                    type="number"
                    value={milestoneIdxInput}
                    onChange={e => setMilestoneIdxInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-sm text-white text-[11px]"
                  />
                </div>
              </>
            )}

            {selectedMethod === 'raiseDispute' && (
              <>
                <div>
                  <label className="text-[#666] text-[10px] block mb-1">escrowId (bytes32):</label>
                  <input
                    type="text"
                    value={escrowIdInput}
                    onChange={e => setEscrowIdInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-sm text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-[10px] block mb-1">evidenceUri / reason (string):</label>
                  <input
                    type="text"
                    value={reasonInput}
                    onChange={e => setReasonInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-sm text-white text-[11px]"
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                onClick={handleExecuteAbiMethod}
                disabled={isCalling}
                className="w-full py-2.5 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black uppercase tracking-wider rounded-sm text-xs transition-all flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50"
              >
                {isCalling ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Broadcasting to Escrow Contract...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Execute {selectedMethod}() On-Chain</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Execution Receipts & Telemetry (6 cols) */}
        <div className="lg:col-span-6 space-y-4 bg-[#0A0A0A] p-5 rounded-sm border border-[#222] shadow-xl">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h3 className="text-xs font-bold uppercase text-white flex items-center space-x-2 tracking-widest">
              <Terminal className="w-4 h-4 text-[#00FF41]" />
              <span>Contract Execution Receipts</span>
            </h3>
            <span className="text-[10px] text-[#00FF41] font-bold">Mempool Synced</span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {callHistory.map((call, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-[#111] border border-[#222] hover:border-[#333] rounded-sm space-y-2 text-xs transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00FF41] font-black">{call.method}()</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00FF41]/20 text-[#00FF41]">
                      {call.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#666]">
                    Block #{call.blockNumber}
                  </span>
                </div>

                <div className="text-[11px] text-[#AAA] font-mono leading-relaxed">
                  {call.resultMessage}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#666] pt-1 border-t border-[#1C1C1C]">
                  <span className="truncate max-w-[220px]">
                    Tx: {call.txHash}
                  </span>
                  <span>Gas: {call.gasUsed.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
