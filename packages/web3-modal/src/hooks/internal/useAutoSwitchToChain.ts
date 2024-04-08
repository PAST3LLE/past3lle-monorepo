import { devError } from '@past3lle/utils'
import { useEffect, useState } from 'react'
import { Chain } from 'viem'

import { PstlWeb3ModalProps } from '../../providers/types'
import { getAppType } from '../../utils/connectors'

export function useAutoSwitchToChain(chains: PstlWeb3ModalProps['chains'], config?: PstlWeb3ModalProps) {
  const [derivedChainId, setDerivedChainId] = useState<Chain | undefined>(undefined)

  useEffect(() => {
    _getChainFromUrl(chains, config).then(setDerivedChainId).catch(devError)
  }, [config, chains])

  return derivedChainId
}

async function _getChainFromUrl(
  chains: PstlWeb3ModalProps['chains'],
  config?: PstlWeb3ModalProps
): Promise<Chain | undefined> {
  const status = getAppType(config?.options?.escapeHatches?.appType, config?.options?.escapeHatches?.customSafeUrl)

  switch (status) {
    case 'TEST_FRAMEWORK_IFRAME':
    case 'SAFE_APP':
    case 'LEDGER_LIVE':
    case 'IFRAME':
      return undefined
    case 'DAPP': {
      return config?.callbacks?.switchChain?.(chains)
    }
  }
}
