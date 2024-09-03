// Web3Auth Libraries
import { CHAIN_NAMESPACES, IBaseProvider } from '@web3auth/base'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal'
import { OpenloginAdapter, OpenloginLoginParams } from '@web3auth/openlogin-adapter'
import { WalletServicesPlugin } from '@web3auth/wallet-services-plugin'
import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector'
import { createConnector } from 'wagmi'

/**
     * @description Web3Auth modal connector
     * @param options - options / config object:
     * @example 
     interface Options {
        themeInfo?: {
          mode?: WhiteLabelData['mode']
          customTheme?: WhiteLabelData['theme']
        }
        chains: readonly [Chain, ...Chain[]]
        zIndex?: number
        network: Web3AuthOptions['web3AuthNetwork']
        storageKey?: Web3AuthOptions['storageKey']
        preset?: 'DISALLOW_EXTERNAL_WALLETS' | 'ALLOW_EXTERNAL_WALLETS'
        projectId: string
        appName: string
        url?: string
        appLogoLight?: string
        appLogoDark?: string
        listingName?: string
        listingLogo?: string
        listingDetails?: string
        loginMethodsOrder?: string[]
        mfaLevel?: OpenloginLoginParams['mfaLevel']
        uxMode?: 'popup' | 'redirect'
        plugins?: IPlugin[] | undefined
     }
    */

export interface PstlWeb3AuthParameters
  extends Omit<Web3AuthOptions, 'privateKeyProvider' | 'clientId' | 'adapter' | 'web3AuthInstance'> {
  network: Web3AuthOptions['web3AuthNetwork']
  storageKey?: Web3AuthOptions['storageKey']
  /**
   * @param preset - optional - prebuilt presets for setting up config
   * @deprecated - will be removed in coming minor releases
   */
  preset?: 'DISALLOW_EXTERNAL_WALLETS' | 'ALLOW_EXTERNAL_WALLETS'
  projectId: string
  uiConfig?: Web3AuthOptions['uiConfig'] & {
    walletButtonPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  }
  mfaLevel?: OpenloginLoginParams['mfaLevel']
  uxMode?: 'popup' | 'redirect'
  enableLogging?: boolean
  privateKeyProvider?: IBaseProvider<string>;
}

export function web3Auth(options: PstlWeb3AuthParameters) {
  return createConnector((config) => {
    const chainConfig = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: '0x' + (config.chains[0].id as number).toString(16),
      rpcTarget: config.chains[0].rpcUrls.default.http[0], // This is the public RPC we have added, please pass on your own endpoint while creating an app
      blockExplorer: config.chains[0].blockExplorers?.default?.url || '',
      displayName: config.chains[0].name,
      tickerName: config.chains[0].nativeCurrency?.name,
      ticker: config.chains[0].nativeCurrency?.symbol
    }

    const privateKeyProvider = options?.privateKeyProvider || new EthereumPrivateKeyProvider({
      config: {
        chainConfig
      }
    })

    const web3AuthInstance = new Web3Auth({
      clientId: options.projectId,
      web3AuthNetwork: options.network,
      chainConfig,
      privateKeyProvider,
      uiConfig: options.uiConfig,
      enableLogging: options.enableLogging
    })

    // setup adapters
    const openLoginAdapter = new OpenloginAdapter({
      privateKeyProvider,
      adapterSettings: {
        network: options.network,
        uxMode: options.uxMode,
        storageKey: options.storageKey,
        whiteLabel: options.uiConfig
      },
      loginSettings: {
        mfaLevel: options.mfaLevel
      }
    })
    // setup openlogin
    web3AuthInstance.configureAdapter(openLoginAdapter)

    const walletServicesPlugin = new WalletServicesPlugin({
      wsEmbedOpts: {
        web3AuthClientId: options.projectId,
        web3AuthNetwork: options.network
      },
      walletInitOptions: {
        confirmationStrategy: 'modal',
        whiteLabel: { ...options.uiConfig, buttonPosition: options.uiConfig?.walletButtonPosition }
      }
    })
    // setup plugins
    web3AuthInstance.addPlugin(walletServicesPlugin)

    return Web3AuthConnector({
      ...options,
      web3AuthInstance
    })(config)
  })
}
