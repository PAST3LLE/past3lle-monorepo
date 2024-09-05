import { Chain, polygon, polygonAmoy, sepolia } from 'viem/chains'

export const FORGE_SUPPORTED_CHAINS = [sepolia, polygon, polygonAmoy] as const satisfies readonly [Chain, ...Chain[]]
