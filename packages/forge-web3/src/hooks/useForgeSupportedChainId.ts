import { usePstlUserConnectionInfo } from '@past3lle/web3-modal'
import { useMemo } from 'react'

import { useForgeGetUserConfigChainsAtom, useForgeReadonlyChainAtom } from '../state/UserConfig'
import { PartialForgeChains, SupportedForgeChainIds } from '../types'

export enum ForgeW3ChainState {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  READONLY = 'READONLY',
  UNSUPPORTED = 'UNSUPPORTED'
}

export function useChainState(): [PartialForgeChains[number] | undefined, ForgeW3ChainState] {
  const [supportedChains = []] = useForgeGetUserConfigChainsAtom()
  const { chain: rawChain } = usePstlUserConnectionInfo()
  const [readonlyChain] = useForgeReadonlyChainAtom()

  return useMemo(() => {
    let chainState: ForgeW3ChainState
    let derivedChain: PartialForgeChains[number] | undefined = undefined
    if (rawChain === undefined) {
      if (readonlyChain?.id) {
        chainState = ForgeW3ChainState.READONLY
      } else {
        chainState = ForgeW3ChainState.DISCONNECTED
      }
    } else if (!supportedChains.map((chain) => chain.id).includes(rawChain.id as SupportedForgeChainIds)) {
      chainState = ForgeW3ChainState.UNSUPPORTED
      derivedChain = undefined
    } else {
      chainState = ForgeW3ChainState.CONNECTED
      derivedChain = rawChain as PartialForgeChains[number]
    }

    return [derivedChain, chainState]
  }, [rawChain, readonlyChain?.id, supportedChains])
}

export function useSupportedChain() {
  const [chain] = useChainState()
  return chain
}

export function useChainId() {
  return useSupportedChain()?.id
}

export function useSupportedChainId(): SupportedForgeChainIds | undefined {
  return useChainId()
}

export function useSupportedOrDefaultChainId(allowDefault = true) {
  const [defaultChain] = useForgeReadonlyChainAtom()
  const supportedChainId = useSupportedChainId()

  return useMemo(
    () =>
      !!supportedChainId ? supportedChainId : allowDefault ? (defaultChain?.id as SupportedForgeChainIds) : undefined,
    [allowDefault, defaultChain?.id, supportedChainId]
  )
}
