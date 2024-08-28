import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { Address, Chain } from 'viem'
import { sepolia } from 'viem/chains'

import { STATE_STORAGE_KEYS } from '../../constants/state-storage-keys'
import { ForgeChainsMinimum, ForgeContractAddressMap, ForgeMetadataUriMap, PartialForgeChains } from '../../types'
import { CustomIpfsGatewayConfig } from '../../utils'

const MINIMUM_COLLECTION_BOARD_SIZE = 3
const EMPTY_COLLECTION_ROWS_SIZE = 6
const MINIMUM_BOARD_WIDTH = 580
const MINIMUM_BOARD_HEIGHT = 500

export interface UserConfigState {
  chains: PartialForgeChains
  readonlyChain: Readonly<Chain> | undefined
  user: {
    account: Address | undefined
    chainId: number | undefined
    contactInfo: {
      email: string | undefined
      phone?: string
      discord?: string
      telegram?: string
      other?: string
    }
  }
  board: {
    /**
     * Minimum amounts of columns to show
     * @param minimumColumns 3
     */
    minimumColumns: number
    /**
     * Minimum board height in px
     * @param minimumBoardHeight 500
     */
    minimumBoardHeight: number
    /**
     * Minimum board width in px. Ignored if derived size is bigger based on skills amount
     * @param minimumBoardWidth 580
     */
    minimumBoardWidth: number
    /**
     * Column size in rows when board empty
     * @param emptyCollectionRowAmount 6
     */
    emptyCollectionRowAmount: number
  }
  contentUrls?: {
    FAQ?: string
    claiming?: string
  }
  ipfs: {
    gatewayUris: CustomIpfsGatewayConfig[]
    gatewayApiUris: CustomIpfsGatewayConfig[]
  }
  metadataUriMap: ForgeMetadataUriMap<ForgeChainsMinimum>
  contractAddressMap: ForgeContractAddressMap<ForgeChainsMinimum>
}
export const userConfigAtom = atomWithStorage<UserConfigState>(STATE_STORAGE_KEYS.FORGE_USER_CONFIG_STATE, {
  chains: [sepolia],
  get readonlyChain() {
    return this.chains?.[0]
  },
  user: {
    account: undefined,
    chainId: undefined,
    contactInfo: {
      email: undefined
    }
  },
  board: {
    minimumColumns: MINIMUM_COLLECTION_BOARD_SIZE,
    minimumBoardHeight: MINIMUM_BOARD_HEIGHT,
    minimumBoardWidth: MINIMUM_BOARD_WIDTH,
    emptyCollectionRowAmount: EMPTY_COLLECTION_ROWS_SIZE
  },
  ipfs: {
    gatewayUris: [],
    gatewayApiUris: []
  },
  metadataUriMap: {},
  contractAddressMap: {}
})
userConfigAtom.debugLabel = 'USER CONFIG ATOM'

const readonlyChainAtom = atom(
  (get) => get(userConfigAtom).readonlyChain,
  (get, set, update: UserConfigState['readonlyChain']) => {
    const state = get(userConfigAtom)
    return set(userConfigAtom, {
      ...state,
      readonlyChain: update
    })
  }
)
export const supportedChainsSetter = atom(null, (get, set, update: UserConfigState['chains']) => {
  const state = get(userConfigAtom)
  return set(userConfigAtom, { ...state, chains: update })
})
export const ipfsGatewaysSetter = atom(null, (get, set, update: UserConfigState['ipfs']) => {
  const state = get(userConfigAtom)
  return set(userConfigAtom, {
    ...state,
    ipfs: update
  })
})

export const mmetadataUrisReadAtom = atom<UserConfigState['metadataUriMap']>(
  (get) => get(userConfigAtom).metadataUriMap
)
export const metadataUriMapAtom = atom(
  (get) => get(userConfigAtom).metadataUriMap,
  (get, set, update: UserConfigState['metadataUriMap']) => {
    const state = get(userConfigAtom)
    return set(userConfigAtom, {
      ...state,
      metadataUriMap: update
    })
  }
)

export const contractAddressesReadAtom = atom<UserConfigState['contractAddressMap']>(
  (get) => get(userConfigAtom).contractAddressMap
)
export const contractAddressMapAtom = atom(
  (get) => get(userConfigAtom).contractAddressMap,
  (get, set, update: UserConfigState['contractAddressMap']) => {
    const state = get(userConfigAtom)
    return set(userConfigAtom, {
      ...state,
      contractAddressMap: update
    })
  }
)

export const ipfsGatewaysGetter = atom((get) => get(userConfigAtom).ipfs)
export const ipfsGatewaysUriGetter = atom((get) =>
  get(userConfigAtom).ipfs.gatewayUris.map((gatewayConfig) => gatewayConfig.gateway)
)

export const useForgeSetIpfsAtom = () => useAtom(ipfsGatewaysSetter)
export const useForgeGetIpfsAtom = () => useAtom(ipfsGatewaysGetter)
export const useForgeIpfsGatewayUrisAtom = () => useAtom(ipfsGatewaysUriGetter)

export const userChainsGetter = atom((get) => get(userConfigAtom).chains)

export const useForgeGetUserConfigChainsAtom = () => useAtom(userChainsGetter)
export const useForgeSetUserConfigChainsAtom = () => useAtom(supportedChainsSetter)

export const useForgeUserConfigAtom = () => useAtom(userConfigAtom)
export const useForgeCurrentChain = () => {
  const [
    {
      chains,
      user: { chainId }
    }
  ] = useForgeUserConfigAtom()
  return useMemo(() => !!chainId && chains?.find((chain) => chain.id === chainId), [chainId, chains])
}

export const useForgeMetadataUriMapReadAtom = () => useAtom(mmetadataUrisReadAtom)
export const useForgeMetadataUriMapAtom = () => useAtom(metadataUriMapAtom)

export const useForgeContractAddressMapReadAtom = () => useAtom(contractAddressesReadAtom)
export const useForgeContractAddressMapAtom = () => useAtom(contractAddressMapAtom)

export const useForgeReadonlyChainAtom = () => useAtom(readonlyChainAtom)
export const useForgeSetUrlToReadonlyChain = (
  chainParam: string | null | undefined
): [Chain | undefined, (chain: Chain) => void] => {
  const [{ chains }, setUserConfig] = useForgeUserConfigAtom()
  const isParamNetwork = isNaN(Number(chainParam))

  const chain = chains.find((userChain) => userChain[isParamNetwork ? 'name' : 'id'] == chainParam)

  return [
    chain,
    useCallback((chain: Chain) => setUserConfig((state) => ({ ...state, readonlyChain: chain })), [setUserConfig])
  ]
}
