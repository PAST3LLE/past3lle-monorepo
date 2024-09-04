import COLLECTIONS_MANAGER_ADDRESSES from '../../forge-networks.json'
import CONTRACTS_NETWORKS from '@past3lle/skilltree-contracts/networks.json'
import { Address } from 'viem'

export type ContractAddresses = typeof CONTRACT_ADDRESSES_MAP
export const CONTRACT_ADDRESSES_MAP = {
  [11155111]: {
    collectionsManager: COLLECTIONS_MANAGER_ADDRESSES[11155111].CollectionsManager.address as Address,
    mergeManager: CONTRACTS_NETWORKS[11155111].MergeManager.address as Address
  },
  [137]: {
    collectionsManager: COLLECTIONS_MANAGER_ADDRESSES[137].CollectionsManager.address as Address,
    mergeManager: CONTRACTS_NETWORKS[137].MergeManager.address as Address
  },
  [80002]: {
    collectionsManager: COLLECTIONS_MANAGER_ADDRESSES[80002].CollectionsManager.address as Address,
    mergeManager: CONTRACTS_NETWORKS[80002].MergeManager.address as Address
  }
} as const
