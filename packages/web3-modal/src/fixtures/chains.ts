import { polygon, polygonAmoy, sepolia } from 'viem/chains'

export type CosmosSupportedChainIds = 1 | 11155111 | 137 | 80002
export const chains = [sepolia, polygon, polygonAmoy] as const
