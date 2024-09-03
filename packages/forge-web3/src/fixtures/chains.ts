import { polygonAmoy, sepolia } from 'viem/chains'

import { ForgeChainsMinimum } from '..'

export const chains = [sepolia, polygonAmoy] as const satisfies ForgeChainsMinimum
