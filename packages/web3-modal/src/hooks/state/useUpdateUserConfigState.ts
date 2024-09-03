import { useEffect } from 'react'
import { mainnet } from 'viem/chains'

import { CHAIN_IMAGES } from '../../constants'
import { PstlWeb3ModalProps } from '../../providers'
import { ReadonlyChains } from '../../providers/types'
import { ConnectorOverrides } from '../../types'
import { usePstlWeb3ModalStore } from '../api/usePstlWeb3ModalStore'

export function useUpdateUserConfigState<chains extends ReadonlyChains = ReadonlyChains>(
  config: PstlWeb3ModalProps<chains>
) {
  const {
    callbacks: {
      userOptions: { set }
    }
  } = usePstlWeb3ModalStore()
  useEffect(() => {
    const rootConfig = config?.modals?.root
    set({
      ux: {
        appType: config.options?.escapeHatches?.appType,
        bypassScrollLock: true,
        closeModalOnConnect: rootConfig?.closeModalOnConnect
      },
      ui: {
        chainImages: {
          ...CHAIN_IMAGES,
          ...rootConfig?.chainImages
        },
        softLimitedChains: config?.callbacks?.softLimitChains?.(config.chains),
        walletsView: rootConfig?.walletsView
      },
      connectors: {
        hideInjectedFromRoot: rootConfig?.hideInjectedFromRoot,
        overrides: _getConnectorOverrides(config.connectors)
      },
      transactions: config.callbacks?.transactions
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])
}

// TODO: check this logic, should be aligned by index probably since they're 2 arrays
function _getConnectorOverrides(uConnectors: PstlWeb3ModalProps['connectors']) {
  if (!uConnectors || Array.isArray(uConnectors)) return undefined
  else if (Array.isArray(uConnectors?.overrides)) {
    const reducedConnectors = uConnectors.overrides?.reduce((acc, next, i) => {
      const id = uConnectors?.connectors?.[i]?.({ chains: [mainnet], emitter: undefined as any })?.id
      if (!!id && !!uConnectors.overrides?.[id]) {
        acc[id] = next
      }
      return acc
    }, {} as ConnectorOverrides)

    return reducedConnectors
  }

  return uConnectors?.overrides
}
