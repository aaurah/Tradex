/**
 * Supported Blockchains & Sepolia Testnet Matrix for Tradex & Pulse
 * Universal Unified Contract: 0x4deb6023abD9E1C640aDa35201be8ff591d21cF2
 */

export interface NetworkConfig {
  id: string;
  name: string;
  shortName: string;
  chainId: number;
  chainIdHex: string;
  isTestnet: boolean;
  type: 'evm' | 'bsv' | 'solana';
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  faucetUrl?: string;
  contractAddress: string;
  logo: string;
  icon?: string;
  color: string;
}

export const UNIFIED_TRADEX_CONTRACT = '0x4deb6023abD9E1C640aDa35201be8ff591d21cF2';

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  // ================= SEPOLIA TESTNETS =================
  {
    id: 'base-sepolia',
    name: 'Base Sepolia Testnet',
    shortName: 'Base Sepolia',
    chainId: 84532,
    chainIdHex: '0x14a34',
    isTestnet: true,
    type: 'evm',
    nativeCurrency: {
      name: 'Base Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.base.org', 'https://base-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
    faucetUrl: 'https://www.alchemy.com/faucets/base-sepolia',
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🔵',
    color: '#0052FF'
  },
  {
    id: 'eth-sepolia',
    name: 'Ethereum Sepolia Testnet',
    shortName: 'Eth Sepolia',
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    isTestnet: true,
    type: 'evm',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org', 'https://ethereum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    faucetUrl: 'https://sepoliafaucet.com',
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🔷',
    color: '#627EEA'
  },
  {
    id: 'arbitrum-sepolia',
    name: 'Arbitrum Sepolia Testnet',
    shortName: 'Arb Sepolia',
    chainId: 421614,
    chainIdHex: '0x66eee',
    isTestnet: true,
    type: 'evm',
    nativeCurrency: {
      name: 'Arbitrum Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io'],
    faucetUrl: 'https://www.alchemy.com/faucets/arbitrum-sepolia',
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🟦',
    color: '#28A0F0'
  },
  {
    id: 'op-sepolia',
    name: 'Optimism Sepolia Testnet',
    shortName: 'OP Sepolia',
    chainId: 11155420,
    chainIdHex: '0xaa37dc',
    isTestnet: true,
    type: 'evm',
    nativeCurrency: {
      name: 'OP Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.optimism.io'],
    blockExplorerUrls: ['https://sepolia-optimism.etherscan.io'],
    faucetUrl: 'https://www.alchemy.com/faucets/optimism-sepolia',
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🔴',
    color: '#FF0420'
  },
  {
    id: 'polygon-amoy',
    name: 'Polygon Amoy (Sepolia Anchor)',
    shortName: 'Polygon Amoy',
    chainId: 80002,
    chainIdHex: '0x13882',
    isTestnet: true,
    type: 'evm',
    nativeCurrency: {
      name: 'POL Testnet',
      symbol: 'POL',
      decimals: 18
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
    faucetUrl: 'https://faucet.polygon.technology',
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🟣',
    color: '#8247E5'
  },
  {
    id: 'scroll-sepolia',
    name: 'Scroll Sepolia zkEVM Testnet',
    shortName: 'Scroll Sepolia',
    chainId: 534351,
    chainIdHex: '0x8274f',
    isTestnet: true,
    type: 'evm',
    nativeCurrency: {
      name: 'Scroll Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia-rpc.scroll.io'],
    blockExplorerUrls: ['https://sepolia.scrollscan.com'],
    faucetUrl: 'https://scroll.io/faucet',
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '📜',
    color: '#FFE7B9'
  },
  {
    id: 'bsv-testnet',
    name: 'Bitcoin SV STN Testnet',
    shortName: 'BSV Testnet',
    chainId: 99999,
    chainIdHex: '0x1869f',
    isTestnet: true,
    type: 'bsv',
    nativeCurrency: {
      name: 'Testnet Bitcoin SV',
      symbol: 'tBSV',
      decimals: 8
    },
    rpcUrls: ['https://api.whatsonchain.com/v1/bsv/test'],
    blockExplorerUrls: ['https://test.whatsonchain.com'],
    faucetUrl: 'https://test.whatsonchain.com/faucet',
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🟡',
    color: '#EAB308'
  },
  {
    id: 'solana-devnet',
    name: 'Solana Devnet Testnet',
    shortName: 'Solana Devnet',
    chainId: 101,
    chainIdHex: '0x65',
    isTestnet: true,
    type: 'solana',
    nativeCurrency: {
      name: 'Solana Devnet SOL',
      symbol: 'SOL',
      decimals: 9
    },
    rpcUrls: ['https://api.devnet.solana.com'],
    blockExplorerUrls: ['https://solscan.io/?cluster=devnet'],
    faucetUrl: 'https://faucet.solana.com',
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🟢',
    color: '#14F195'
  },

  // ================= MAINNETS =================
  {
    id: 'base-mainnet',
    name: 'Base Mainnet',
    shortName: 'Base',
    chainId: 8453,
    chainIdHex: '0x2105',
    isTestnet: false,
    type: 'evm',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🔵',
    color: '#0052FF'
  },
  {
    id: 'eth-mainnet',
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    chainId: 1,
    chainIdHex: '0x1',
    isTestnet: false,
    type: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://cloudflare-eth.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🔷',
    color: '#627EEA'
  },
  {
    id: 'arbitrum-one',
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    chainId: 42161,
    chainIdHex: '0xa4b1',
    isTestnet: false,
    type: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🟦',
    color: '#28A0F0'
  },
  {
    id: 'bsv-mainnet',
    name: 'Bitcoin SV Mainnet',
    shortName: 'Bitcoin SV',
    chainId: 100000,
    chainIdHex: '0x186a0',
    isTestnet: false,
    type: 'bsv',
    nativeCurrency: {
      name: 'Bitcoin SV',
      symbol: 'BSV',
      decimals: 8
    },
    rpcUrls: ['https://api.whatsonchain.com/v1/bsv/main'],
    blockExplorerUrls: ['https://whatsonchain.com'],
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🟡',
    color: '#EAB308'
  },
  {
    id: 'solana-mainnet',
    name: 'Solana Mainnet-Beta',
    shortName: 'Solana',
    chainId: 102,
    chainIdHex: '0x66',
    isTestnet: false,
    type: 'solana',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9
    },
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    blockExplorerUrls: ['https://solscan.io'],
    contractAddress: UNIFIED_TRADEX_CONTRACT,
    logo: '🟢',
    color: '#14F195'
  }
];

export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  return SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
}

export function getNetworkById(id: string): NetworkConfig | undefined {
  return SUPPORTED_NETWORKS.find(n => n.id === id);
}

export function getExplorerUrlForAddress(address: string, networkId?: string): string {
  const net = (networkId && getNetworkById(networkId)) || SUPPORTED_NETWORKS[0];
  const baseUrl = net.blockExplorerUrls[0];
  if (net.type === 'bsv') return `${baseUrl}/address/${address}`;
  if (net.type === 'solana') return `${baseUrl}/account/${address}`;
  return `${baseUrl}/address/${address}`;
}

export function getExplorerUrlForTx(txHash: string, networkId?: string): string {
  const net = (networkId && getNetworkById(networkId)) || SUPPORTED_NETWORKS[0];
  const baseUrl = net.blockExplorerUrls[0];
  if (net.type === 'bsv') return `${baseUrl}/tx/${txHash}`;
  if (net.type === 'solana') return `${baseUrl}/tx/${txHash}`;
  return `${baseUrl}/tx/${txHash}`;
}

export function getUnifiedContractExplorerUrl(networkId?: string): string {
  return getExplorerUrlForAddress(UNIFIED_TRADEX_CONTRACT, networkId);
}
