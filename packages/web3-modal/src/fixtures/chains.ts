import { polygon, sepolia } from 'viem/chains'
import { defineChain } from 'viem/utils'

// TODO: remove when viem adds amoy polygon
export const amoy = defineChain({
  id: 80002,
  name: 'Amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'Matic',
    symbol: 'MATIC'
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology/'],
      webSocket: ['wss://rpc-amoy.polygon.technology/']
    }
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://amoy.polygonscan.com/' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3127388
    }
  }
})

export type CosmosSupportedChainIds = 1 | 11155111 | 137 | 80002
export const chains = [sepolia, polygon, amoy] as const
