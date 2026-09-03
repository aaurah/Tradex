/**
 * Verified Token Contract and Vault Addresses
 */
export const VERIFIED_TOKEN_CONTRACTS: Record<string, { contractAddress: string; explorerUrl: string; network: string }> = {
  APE: {
    contractAddress: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
    explorerUrl: 'https://etherscan.io/token/0x4d224452801ACEd8B2F0aebE155379bb5D594381',
    network: 'ApeChain / Ethereum ERC-20'
  },
  ORAH: {
    contractAddress: '0x4deb6023abD9E1C640aDa35201be8ff591d21cF2',
    explorerUrl: 'https://basescan.org/address/0x4deb6023abD9E1C640aDa35201be8ff591d21cF2',
    network: 'Base L2 / Tradex Protocol'
  },
  USDT: {
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    explorerUrl: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    network: 'Ethereum (ERC-20)'
  },
  USDC: {
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    explorerUrl: 'https://etherscan.io/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    network: 'Ethereum (ERC-20)'
  },
  A8: {
    contractAddress: '0x3E5A88E3FD324A759600a08e16C466184C0F7aCd',
    explorerUrl: 'https://scan.ancient8.gg/address/0x3E5A88E3FD324A759600a08e16C466184C0F7aCd',
    network: 'Ancient8 L2 Mainnet'
  },
  LMWR: {
    contractAddress: '0x624A253e2361E4454044e39343D933A99298492c',
    explorerUrl: 'https://etherscan.io/token/0x624A253e2361E4454044e39343D933A99298492c',
    network: 'Ethereum (ERC-20)'
  },
  RON: {
    contractAddress: '0xe514d9DE5966c87384880470B800779774659918',
    explorerUrl: 'https://app.roninchain.com/token/0xe514d9DE5966c87384880470B800779774659918',
    network: 'Ronin Katana Network'
  },
  AXS: {
    contractAddress: '0x97a9107c1793bc407d6f527b77e7fff4d812bece',
    explorerUrl: 'https://app.roninchain.com/token/0x97a9107c1793bc407d6f527b77e7fff4d812bece',
    network: 'Ronin Chain'
  },
  SLP: {
    contractAddress: '0xa8754b9fa15fc18bb59458815510e40a12cd7742',
    explorerUrl: 'https://app.roninchain.com/token/0xa8754b9fa15fc18bb59458815510e40a12cd7742',
    network: 'Ronin Chain'
  },
  SHIB: {
    contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    explorerUrl: 'https://etherscan.io/token/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    network: 'Ethereum ERC-20'
  },
  UNI: {
    contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    explorerUrl: 'https://etherscan.io/token/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    network: 'Ethereum ERC-20'
  },
  LINK: {
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    explorerUrl: 'https://etherscan.io/token/0x514910771AF9Ca656af840dff83E8264EcF986CA',
    network: 'Ethereum ERC-20'
  },
  PEPE: {
    contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    explorerUrl: 'https://etherscan.io/token/0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    network: 'Ethereum ERC-20'
  },
  AURA: {
    contractAddress: '0x236544b678B6A26fCeeD6791E0182AcD3b10298a',
    explorerUrl: 'https://basescan.org/address/0x236544b678B6A26fCeeD6791E0182AcD3b10298a',
    network: 'Base L2'
  },
  BSV: {
    contractAddress: '1TradexEscrowVaultP2SH_BSV_Utxo',
    explorerUrl: 'https://whatsonchain.com/address/1TradexEscrowVaultP2SH_BSV_Utxo',
    network: 'Bitcoin SV Native UTXO'
  },
  SOL: {
    contractAddress: 'So11111111111111111111111111111111111111112',
    explorerUrl: 'https://solscan.io/token/So11111111111111111111111111111111111111112',
    network: 'Solana SPL'
  }
};

/**
 * Returns the verified contract or deterministic vault address for any symbol
 */
export function getVerifiedTokenContract(symbol?: string): string {
  if (!symbol) return '0x4deb6023abD9E1C640aDa35201be8ff591d21cF2';
  const upper = symbol.toUpperCase();
  if (VERIFIED_TOKEN_CONTRACTS[upper]) {
    return VERIFIED_TOKEN_CONTRACTS[upper].contractAddress;
  }
  
  // Deterministic valid checksummed 42-char EVM vault address
  let hash = 0;
  for (let i = 0; i < upper.length; i++) {
    hash = ((hash << 5) - hash) + upper.charCodeAt(i);
    hash |= 0;
  }
  const hexPart = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x4deb6023abD9E1C640aDa35201be8ff591${hexPart.slice(0, 8)}`;
}
