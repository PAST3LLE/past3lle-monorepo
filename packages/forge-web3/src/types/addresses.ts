import { Address } from 'viem'

import { ForgeChainsMinimum } from './appConfig'

export type ForgeContractAddressMap<forgeChains extends ForgeChainsMinimum> = Partial<{
  [id in forgeChains[number]['id']]: {
    collectionsManager: Address
    mergeManager: Address
  }
}>
