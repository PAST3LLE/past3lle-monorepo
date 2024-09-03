import { polygon, sepolia, polygonAmoy as amoy } from 'viem/chains'

// Sepolia, Polygon, Amoy Polygon (test)
export type SupportedChainsDevelop = 11155111 | 137 | 80002
export type SupportedChainsProduction = 137
export type SupportedChains = SupportedChainsDevelop | SupportedChainsProduction
export const SUPPORTED_CHAINS_PROD = [sepolia, polygon, amoy] as const
export const SUPPORTED_CHAINS_DEV = [sepolia, polygon, amoy] as const
