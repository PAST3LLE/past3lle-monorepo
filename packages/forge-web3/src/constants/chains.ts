import { Chain, polygon, polygonMumbai } from 'viem/chains'

export const FORGE_SUPPORTED_CHAINS = [polygon, polygonMumbai] as const satisfies readonly [Chain, ...Chain[]]
