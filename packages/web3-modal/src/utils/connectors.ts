import { devDebug, isFunction } from '@past3lle/utils'
import { iframeEthereum, ledgerLive } from '@past3lle/wagmi-connectors'
import { isIframe } from '@past3lle/wagmi-connectors/utils'
import { Transport } from 'viem'
import { Config, Connector, CreateConnectorFn } from 'wagmi'
import { safe } from 'wagmi/connectors'

import { usePstlWeb3ModalStore } from '../hooks'
import { PstlWeb3ModalProps, ReadonlyChains, Web3ModalProps } from '../providers/types'
import { ConnectorOverrides } from '../types'
import { isLedgerDappBrowserProvider } from './iframe'
import { connectorOverridePropSelector } from './misc'

export type AppType = 'IFRAME' | 'SAFE_APP' | 'LEDGER_LIVE' | 'DAPP' | 'TEST_FRAMEWORK_IFRAME'
export function getAppType(forcedAppType?: AppType, customSafeUrl?: string) {
  if (!!forcedAppType) return forcedAppType
  else if (process.env.IS_COSMOS) {
    devDebug('[@past3lle/web3-modal::getAppType] TEST_FRAMEWORK_IFRAME detected, returning connectors unaffected')
    return 'TEST_FRAMEWORK_IFRAME'
  } else if (isIframe() || isLedgerDappBrowserProvider()) {
    const isLedgerLive = isLedgerDappBrowserProvider()
    const isSafe = ['app.safe.global', customSafeUrl].some((url) =>
      url ? window?.location.ancestorOrigins.item(0)?.includes(url) : false
    )
    return isSafe ? 'SAFE_APP' : isLedgerLive ? 'LEDGER_LIVE' : 'IFRAME'
  } else {
    return 'DAPP'
  }
}

export function useDeriveAppType() {
  const {
    state: {
      userOptions: {
        ux: { appType }
      }
    }
  } = usePstlWeb3ModalStore()

  return getAppType(appType)
}

export function hardFilterChains({ callbacks, chains }: Pick<PstlWeb3ModalProps, 'chains' | 'callbacks'>) {
  const limitChainsFn = callbacks?.filterChains || callbacks?.hardLimitChains
  if (!limitChainsFn) return chains

  return limitChainsFn(chains)
}

export function softFilterChains(config: PstlWeb3ModalProps): PstlWeb3ModalProps {
  if (!config.callbacks?.softLimitChains) return config
  const limitChainsFn = config.callbacks.softLimitChains

  const filteredChains = limitChainsFn(config.chains)
  return {
    ...config,
    chains: filteredChains
  }
}

export function filterOutConnectorsTypes(arr: readonly Connector[], ...typesToIgnore: Connector['type'][]) {
  return arr.filter((cc) => !typesToIgnore.includes(cc?.id))
}

export function getConnectorsArrayFromConfig(connectorsConfig: PstlWeb3ModalProps['connectors']) {
  if (!connectorsConfig || Array.isArray(connectorsConfig)) return connectorsConfig
  else {
    return connectorsConfig.connectors
  }
}

export function getConfigFromAppType(
  configProps: Omit<PstlWeb3ModalProps, 'modals' | 'connectors' | 'frameConnectors'> & {
    connectors: readonly Connector[]
  }
): { chains: typeof configProps.chains; connectors: (CreateConnectorFn | Connector)[] } {
  const chains = hardFilterChains({ callbacks: configProps.callbacks, chains: configProps.chains })
  const status = getAppType(configProps.options?.escapeHatches?.appType, configProps.options?.customSafeUrl)
  switch (status) {
    case 'SAFE_APP': {
      devDebug('[@past3lle/web3-modal] App type detected: SAFE APP')

      const connectors = [configProps.connectors?.find((pr) => pr.type === 'safe') || safe()]
      return { chains, connectors }
    }
    case 'LEDGER_LIVE': {
      devDebug('[@past3lle/web3-modal] App type detected: LEDGER LIVE')

      const connectors: CreateConnectorFn[] = [ledgerLive()]
      return { chains, connectors }
    }
    case 'IFRAME': {
      devDebug('[@past3lle/web3-modal] App type detected: IFRAME APP')

      const connectors = [configProps.connectors?.find((pr) => pr.type === 'iframe-ethereum') || iframeEthereum()]
      return { chains: configProps.chains, connectors }
    }
    case 'TEST_FRAMEWORK_IFRAME':
    case 'DAPP': {
      devDebug('[@past3lle/web3-modal] App type detected: NORMAL DAPP', configProps?.connectors)
      const connectors = configProps.connectors as Connector[]
      return { chains: configProps.chains, connectors }
    }
  }
}

export function setupConnectorFns<chains extends ReadonlyChains>(
  derivedConnectors: readonly (Connector | CreateConnectorFn)[],
  client: Config<chains, Record<chains[number]['id'], Transport>>
): Connector[] {
  const setupConnectors: Connector[] = []
  derivedConnectors.forEach((conn) => {
    const isFn = isFunction(conn)
    if (isFn) {
      const setupConn = client._internal.connectors.setup(conn)
      setupConnectors.push(setupConn)
    } else {
      setupConnectors.push(conn)
    }
  })

  return setupConnectors
}

export function overrideConnectors<chains extends ReadonlyChains>(
  connectors: readonly Connector[] | undefined,
  overrides_: ConnectorOverrides | undefined,
  client: Config<chains, Record<chains[number]['id'], Transport>>
) {
  if (connectors && overrides_) {
    const overrides = overrides_ || {}
    client._internal.connectors.setState((connectors) =>
      connectors.map((sConn) => ({
        ...sConn,
        ...connectorOverridePropSelector(overrides, [sConn.id, sConn.name, sConn.type])
      }))
    )
  }
}

export function getOverridesFromConnectorConfig<C extends Web3ModalProps['connectors']>(
  connectors?: C
): ConnectorOverrides | undefined {
  if (connectors && 'overrides' in connectors) return connectors.overrides
  return undefined
}
