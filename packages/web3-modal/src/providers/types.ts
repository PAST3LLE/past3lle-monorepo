import { Chain } from 'viem'
import { Config, CreateConfigParameters, CreateConnectorFn, WagmiProviderProps } from 'wagmi'
import { walletConnect } from 'wagmi/connectors'

import { PstlWeb3ConnectionModalProps } from '../components/modals/ConnectionModal'
import { UserOptionsTransactionsCallbacks } from '../controllers/types'
import { ConnectorEnhanced, ConnectorOverrides } from '../types'
import { AppType } from '../utils/connectors'

export interface ConfigCtrlState {
  projectId: string
  defaultChain?: Chain
  mobileWallets?: string[]
  desktopWallets?: string[]
  walletImages?: Record<string, string>
  chainImages?: Record<string, string>
  tokenImages?: Record<string, string>
  tokenContracts?: Record<number, string>
  enableNetworkView?: boolean
  enableAccountView?: boolean
  enableExplorer?: boolean
  explorerRecommendedWalletIds?: string[] | 'NONE'
  explorerExcludedWalletIds?: string[] | 'ALL'
  termsOfServiceUrl?: string
  privacyPolicyUrl?: string
}

export type Web3ModalThemeVariables = {
  '--w3m-color-bg-1'?: string
  '--w3m-color-bg-2'?: string
  '--w3m-color-fg-1'?: string
} & Record<string, string>

export type ReadonlyChains = WagmiProviderProps['config']['chains']

type WalletConnectConnectorConfig = Required<Parameters<typeof walletConnect>[0]>
type WalletConnectEnhancedThemeVariables = Required<
  WalletConnectConnectorConfig['qrModalOptions']
>['themeVariables'] & {
  '--wcm-color-fg-1'?: string
  '--wcm-color-fg-2'?: string
  '--wcm-color-fg-3'?: string
  '--wcm-color-bg-1'?: string
  '--wcm-color-bg-2'?: string
  '--wcm-color-bg-3'?: string
}
type WalletConnectQrModalOptions = WalletConnectConnectorConfig['qrModalOptions'] & {
  themeVariables?: WalletConnectEnhancedThemeVariables
}

export type WalletConnectConfig<chains extends ReadonlyChains = ReadonlyChains> = Omit<
  WalletConnectQrModalOptions,
  'projectId' | 'enableStandaloneMode' | 'walletConnectVersion'
> & {
  chains?: chains
  projectId: string
  zIndex?: number
}

export type PstlWeb3ModalCallbacks = {
  /**
   * @name switchChainCallback
   * @description Custom chain switching callback. E.g cookies or from URL -> changes network automatically
   */
  switchChain?: (chains: ReadonlyChains, ...params: any[]) => Promise<ReadonlyChains[number] | undefined>
  /**
   * @name filterChains
   * @description Custom callback for filtering available chains e.g production domain vs develop etc
   * @param chains List of available chains
   * @param params Any params
   * @note this will REMOVE compatibility for chains filtered out. If you just want COSMETIC filtering, see softLimitChains. Will be DEPRECATED next minor release.
   * @alias hardLimitChains
   * @returns Filtered list of available chains
   */
  filterChains?: (chains: ReadonlyChains, ...params: any[]) => ReadonlyChains
  /**
   * @name hardLimitChains
   * @description Custom callback for filtering available chains e.g production domain vs develop etc
   * @param chains List of available chains
   * @param params Any params
   * @note this will REMOVE compatibility for chains filtered out. If you just want COSMETIC filtering, see softLimitChains
   * @alias filterChains
   * @returns Filtered list of available chains
   */
  hardLimitChains?: (chains: ReadonlyChains, ...params: any[]) => ReadonlyChains
  /**
   * @name softLimitChains
   * @description Custom callback for softly (cosmetically) filtering available chains e.g production domain vs develop etc
   * @param chains List of available chains
   * @param params Any params
   * @note this will REMOVE compatibility for chains filtered out. If you just want COSMETIC filtering, see hardLimitChains
   * @returns Cosmetically filtered list of available chains
   */
  softLimitChains?: (chains: ReadonlyChains, ...params: any[]) => ReadonlyChains
  /**
   * @name transactions
   * @description Optional. Transaction related options. E.g callbacks on certain states
   * @tip Useful when you want finer control over what happens on transaction approvals/reversions etc.
   */
  transactions?: UserOptionsTransactionsCallbacks
}

export type WagmiClientConfigEnhanced<chains extends ReadonlyChains = ReadonlyChains> = Omit<
  CreateConfigParameters<chains>,
  'client' | 'connectors' | 'chains'
> & {
  connectors?: (() => ConnectorEnhanced[]) | ConnectorEnhanced[]
}

export type WagmiClientOptions<chains extends ReadonlyChains = ReadonlyChains> = WagmiClientConfigEnhanced<chains> & {
  /**
   * @name walletConnect
   * @description walletConnect connector config
   * see {@link WalletConnectConfig}
   */
  walletConnect: WalletConnectConfig
}

export type PstlWeb3ModalOptions<chains extends ReadonlyChains = ReadonlyChains> = WagmiClientOptions<chains> & {
  /**
   * @name autoConnect
   * @description Boolean. Whether or not to attempt re-connect to last connected connector.
   * @default false
   */
  autoConnect?: boolean
  /**
   * @name escapeHatches
   * @description Collection of escape hatch override flags/properties
   */
  escapeHatches?: {
    /**
     * @name appType
     * @description appType is detected and set automtically elsewhere. Escape hatch
     */
    appType?: AppType
  }
  /**
   * @name closeModalOnKeys
   * @description List of string key names to listen for and close modal
   */
  closeModalOnKeys?: string[]
  /**
   * @name expiremental
   * @description Map of experimental feature flags
   */
  /**
   * @name customSafeUrl
   * @description Custom Safe URL. Useful for testing.
   */
  customSafeUrl?: string
  experimental?: {
    /**
     * @name hidDeviceOptions
     * @description HID-specific device options
     */
    hidDeviceOptions?: {
      /**
       * @name enableConfigurationModal
       * @description enable the HID device configuration modal - i.e choose derivation path
       */
      enableConfigurationModal?: boolean
    }
  }
}

export type RootModalProps = Omit<
  PstlWeb3ConnectionModalProps,
  'overrides' | 'isOpen' | 'onDismiss' | 'chainIdFromUrl' | 'error'
>
export type ConnectorConfigWithOverrides = {
  connectors?: CreateConnectorFn[]
  overrides?: ConnectorOverrides
}
type GenericModalConnectorOptions = ConnectorConfigWithOverrides | CreateConnectorFn[]
export type PstlWagmiClientOptions<chains extends ReadonlyChains, client extends Config = Config> = {
  client?: client
  /**
   * @name options
   * @deprecated Will be deprecated in next major version. Use {@link PstlWeb3ModalProps.options} instead.
   */
  options?: WagmiClientConfigEnhanced<chains>
}
export interface Web3ModalProps<chains extends ReadonlyChains = ReadonlyChains> {
  appName: string
  /**
   * @name chains
   * @description Wagmi chains to allow.
   * @example 
    import { mainnet, goerli, polygon } from 'viem/chains'
    ...
    return (
      <PstlW3Providers
        config={{
          chains: [mainnet, goerli, polygon],
          ...
        }}
        ...
      />
    )
   */
  /**
   * @name blockExplorerUris
   * @description Optional. Explorer uri map by chain. Keys must match {@link chains}
   * @example
   * blockExplorerUris: {
   *     [ChainId.mainnet]: "https://etherscan.io",
   *     [ChainId.goerli]: "https://goerli.etherscan.io",
   *     [ChainId.matic]: "https://polygonscan.com",
   *     [ChainId.mumbai]: "https://mumbai.polygonscan.com"
   * }
   */
  blockExplorerUris?: chains[number]['blockExplorers']
  /**
   * @name chains
   * @descriptions Required. Chains to support.
   * @example
   * import { mainnet, goerli, matic, polygon } from 'viem/chains'
   * ...
   * chains: [mainnet, goerli, matic, polygon]
   */
  chains: chains
  /**
   * @name connectors
   * @description Optional. Custom wagmi connectors. Loaded in normal, non-iframe dapps (e.g skills.pastelle.shop). For iFrame connectors, see {@link frameConnectors}
   * @example
      import { InjectedConnector } from 'wagmi/connectors/MetaMask'
      import { addConnector } from '@past3lle/web3-modal'

      addConnector(InjectedConnector, {
        name: 'MetaMask',
        shimDisconnect: true,
        getProvider() {
          try {
            // Add a declarations.d.ts in root /src/ with ethereum object 
            // OR use (window as any)?.ethereum
            const provider = window?.ethereum?.providers?.find((provider) => provider?.isMetaMask)
            if (!provider) devWarn('Connector', this.name || 'unknown', 'not found!')
            return provider
          } catch (error) {
            return undefined
          }
        }
      })
   */
  connectors?: GenericModalConnectorOptions
  /**
   * @name frameConnectors
   * @description iFrame connectors. ONLY loaded in iFrame Dapp browsers (e.g LedgerLive Discovery)
   */
  frameConnectors?: CreateConnectorFn[]
  /**
   * @name PstlW3Provider.modals
   * @description Modal props: root [{@link RootModalProps}], walletConnect [{@link Web3ModalConfig<ID>}]. See each for more info.
   */
  modals: {
    /**
     * @description Root modal props. Mostly UI/UX
     * {@link RootModalProps}
     * @example 
     interface PstlWeb3ModalProps.modals.root {
        // Optional. Modal title, appears at top.
        title?: string
        // Optional. Theme config. Set modal theme.
        themeConfig?: ThemeConfigProps
        // Optional. Loader props when async loading wallet modals.
        loaderProps?: LoadingScreenProps
        // Optional. Modal button style props.
        buttonProps?: ButtonProps
        // Optional. Detect connect and auto-close modal.
        closeModalOnConnect?: boolean
        // Optional. Hide detected injected wallet from root modal. 
        // Useful when passing own injected connectors in config.
        hideInjectedFromRoot?: boolean
        // Optional. Set root modal wallets view: 'grid' or 'list'.
        // Default: 'list'. Mobile is ALWAYS in 'list' view.
        walletsView?: 'grid' | 'list'
        // Optional. Key/Value pair overriding connector info. Displays in root modal.
        // Default: undefined
        connectorDisplayOverrides?: ConnectorOverrides
        // Optional. Root modal z-index.
        zIndex?: number
    }
     */
    root?: RootModalProps
    /**
     * @name walletConnect
     * @description WalletConnect (Web3Modal) props
     */
    walletConnect: Omit<WalletConnectConfig<any>, 'chains'>
  }
  /**
   * @name clients
   * @description Optional. Manage wagmi [{@link PstlWagmiClientOptions}] & ethereum [{@link EthereumClient}] clients.
   */
  clients?: {
    /**
     * @description Optional. Wagmi client configuration. See {@link PstlWagmiClientOptions}
     */
    wagmi?: PstlWagmiClientOptions<chains>
    /**
     * @description Optional. Ethereum client configuration. See {@link EthereumClient}
     */
    // ethereum?: EthereumClient
  }
  /**
   * Various modal options
   */
  options?: Omit<PstlWeb3ModalOptions<chains>, 'walletConnect'>
  /**
   * Various modal logic callbacks
   * @description Optional. See {@link PstlWeb3ModalCallbacks}
   */
  callbacks?: PstlWeb3ModalCallbacks
}

export type PstlWeb3ModalProps<chains extends ReadonlyChains = ReadonlyChains> = Web3ModalProps<chains>
export type PstlWeb3ProviderProps<chains extends ReadonlyChains = ReadonlyChains> = PstlWeb3ModalProps<chains>

export type WithChainIdFromUrl = {
  chainIdFromUrl: number | undefined
}
export type WithCloseModalOnKeys = Pick<PstlWeb3ModalOptions, 'closeModalOnKeys'>
