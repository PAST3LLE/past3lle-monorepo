import {
  Address,
  Chain,
  ChainDisconnectedError,
  ChainNotFoundError,
  ProviderConnectInfo,
  SwitchChainError,
  numberToHex
} from 'viem'
import {
  ChainNotConfiguredError as ChainNotConfiguredForConnectorError,
  ConnectorNotFoundError,
  ProviderNotFoundError,
  createConnector,
  normalizeChainId
} from 'wagmi'

import { ERROR_MESSAGES, ErrorCodes } from './errorCodes'
import { checkError, isHIDSupported } from './helpers'
import { LedgerHQProvider } from './provider'
import { ConnectorUpdate } from './types'

export { isHIDSupported, checkError }
type Options = { callback?: (...args: any[]) => void; path?: string; reset?: boolean }

export type LedgerHidParameters = {
  shimDisconnect?: boolean
  name?: string
  icon?: string
  onDeviceConnect?: () => Promise<void>
  onDeviceDisconnect?: () => Promise<void>
}

type Config = Parameters<Parameters<typeof createConnector>[0]>[0]

ledgerHid.type = 'hid' as const
export function ledgerHid(parameters?: LedgerHidParameters) {
  const providerByChainMap: Map<number, LedgerHQProvider | undefined> = new Map()

  let chainId: number | undefined = undefined
  let provider: LedgerHQProvider | undefined = undefined
  let url = ''

  // Create a new provider instance @ chain ID
  async function getProviderInstance(_chainId: number, config: Config): Promise<LedgerHQProvider> {
    const { LedgerHQProvider } = await import('./provider')
    const derivedId = _chainId ?? chainId
    // getProviderInstance queried without a chain _chainId
    if (!derivedId) {
      // No provider and no _chainId? throw error
      throw new Error('[Ledger HID] Cannot re-instantiate provider without a ID!')
    }

    const url = config.chains.find((chain) => chain.id === derivedId)?.rpcUrls?.default?.http?.[0]
    if (!url) throw new Error('[Ledger HID] Missing chain URL. Please check chain configuration options.')

    const newProvider = new LedgerHQProvider(url, derivedId)

    // set the newProvider mapping with our new newProvider instance
    providerByChainMap.set(derivedId, newProvider)
    provider = newProvider

    return newProvider
  }

  function isChainUnsupported(_chainId: number | undefined, config: Config) {
    return !config.chains.some((chain) => chain.id === _chainId)
  }

  type Properties = {
    connect(
      { chainId }: { chainId?: number },
      options?: Options
    ): Promise<{
      accounts: readonly Address[]
      chainId: number
    }>
    activate(id?: number, options?: Options): Promise<ConnectorUpdate<LedgerHQProvider>>
    deactivate(): Promise<void>
    getAccounts(path?: string): Promise<Address[]>
    setAccount(path?: string): Promise<void>
    // getSignerPath(): string | undefined
    onConnect(params: { chainId: string; accounts: readonly Address[] }): Promise<void>
    onLedgerAccountsChanged(params: { accounts: Address[] }): Promise<void>
    onLedgerChainChanged(params: ProviderConnectInfo): Promise<void>
    provider?: LedgerHQProvider
    chainId?: number
  }
  type StorageItem = {
    [_ in 'ledger-hid.connected' | `${string}.disconnected`]: true
  }

  return createConnector<LedgerHQProvider, Properties, StorageItem>((config) => ({
    // provider/chain info
    id: 'ledger-hid',
    name: parameters?.name || 'Ledger HID',
    icon: parameters?.icon,
    get url() {
      return url
    },
    get type() {
      return ledgerHid.type
    },
    get chainId() {
      return chainId
    },
    get provider() {
      return provider
    },
    async setup() {
      chainId = config.chains[0].id
      // Only start listening for DEVICE (not UI) events
      if (provider) {
        provider.once('connect', this.onConnect.bind(this))
        provider.once('disconnect', this.onDisconnect.bind(this))
      }
    },
    // ACTIVATE/DEACTIVATE device
    async activate(_chainId: number | undefined, options): Promise<ConnectorUpdate<LedgerHQProvider>> {
      try {
        // set the device chain id, throw if no id passed.
        chainId = _chainId ?? chainId
        if (!chainId) throw new ChainDisconnectedError(new Error('Missing chain id parameter'))

        // if we don't have a provider[@chainId] create and set a new one @ chain
        const noProviderAtChainId = !providerByChainMap.get(chainId)
        if (options?.reset || noProviderAtChainId || !provider) {
          provider = await getProviderInstance(chainId, config)
        }

        if (!provider) throw new ProviderNotFoundError()

        // signal that provider is ready
        provider.once('connect', this.onConnect.bind(this))
        // signal that provider has disconnected
        provider.once('disconnect', this.onDisconnect.bind(this))

        // try enabling the provider, throw otherwise
        await provider.enable(options?.callback, options?.path, options?.reset)

        // return array of "accounts", this is for new wagmi api and it just returns an array of 1 account
        const accounts = (await Promise.all([provider?.getConnectedAddress()])) as Address[]

        return { provider, accounts }
      } catch (error) {
        return checkError(error)
      }
    },
    async deactivate() {
      if (!provider) throw new ProviderNotFoundError()

      // deactivate all providers in chainId map
      providerByChainMap.forEach((iProvider) => iProvider?.removeAllListeners())
    },
    // connect
    async connect({ chainId: _chainId }: { chainId?: number } = {}, options?: Options) {
      try {
        // try activating the hid device
        const { accounts } = await this.activate(_chainId, options)

        // we haven't found a provider, throw.
        if (!provider) throw new ConnectorNotFoundError()

        // Switch to chain if provided
        let unsupported = !!chainId && isChainUnsupported(chainId, config)
        if (_chainId && _chainId !== chainId) {
          const newChain = await this.switchChain?.({ chainId: _chainId })
          chainId = newChain?.id as number
          unsupported = isChainUnsupported(chainId, config)
        }

        if (unsupported || !chainId) throw new ChainNotConfiguredForConnectorError()

        // Add shim to storage signalling wallet is connected
        // Remove disconnected shim if it exists
        if (parameters?.shimDisconnect) await config.storage?.removeItem(`${this.id}.disconnected`)

        return { accounts, chainId }
      } catch (error) {
        const statusCode: ErrorCodes | undefined = (error as any)?.statusCode
        switch (statusCode) {
          case 27906:
          case 28160:
            throw new Error(ERROR_MESSAGES[statusCode])
          default:
            throw error
        }
      }
    },
    // Wagmi disconnect
    async disconnect() {
      if (!provider) throw new ProviderNotFoundError()

      // disable pdrovider and signer/transport
      await provider.disable()

      // Add shim signalling connector is disconnected
      if (parameters?.shimDisconnect) await config.storage?.setItem(`${this.id}.disconnected`, true)
    },
    async isAuthorized() {
      try {
        const isDisconnected =
          !provider?.signer ||
          (parameters?.shimDisconnect &&
            // If shim exists in storage, connector is disconnected
            (await config.storage?.getItem(`${this.id}.disconnected`)))
        if (isDisconnected) return false

        if (!provider) throw new ConnectorNotFoundError()
        const account = [provider.getConnectedAddress()]
        return !!account?.length
      } catch {
        return false
      }
    },
    async switchChain({ chainId: _chainId, options }: { chainId: number; options?: Options }) {
      const providerAtChain = providerByChainMap.get(_chainId)

      provider = !providerAtChain ? (await this.activate(chainId, options)).provider : providerAtChain
      if (!provider) throw new ConnectorNotFoundError()

      const hexChainId = numberToHex(_chainId)
      const chainInfo = config.chains.find((x) => x.id === _chainId)
      try {
        const derivedChain = chainInfo ?? {
          id: _chainId,
          name: `Chain ${hexChainId}`,
          network: `${hexChainId}`,
          nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
          rpcUrls: { default: { http: [''] }, public: { http: [''] } }
        }

        chainId = derivedChain.id
        url = derivedChain.rpcUrls.default.http[0]

        if (!chainId) throw new ChainDisconnectedError(new Error('ChainId is not defined: switchChain'))

        this.onChainChanged(chainId.toString())

        return derivedChain as Chain
      } catch (error) {
        if (!chainInfo) throw new ChainNotConfiguredForConnectorError()

        // Indicates chain is not added to provider
        throw new SwitchChainError(error as Error)
      }
    },
    async getProvider(params?: { chainId?: number | undefined } | undefined): Promise<LedgerHQProvider> {
      const currChainId = params?.chainId || chainId
      if (!currChainId) throw new ChainNotFoundError()
      return provider || getProviderInstance(currChainId, config)
    },
    async getChainId() {
      if (!provider) throw new ProviderNotFoundError()

      if (chainId !== provider._network.chainId) {
        chainId = provider._network.chainId
      }

      return chainId
    },

    /**
     *
     * @param path - derivation path (default: m/44'/60')
     * @returns address/account as string
     */
    async getAccounts(path?: string): Promise<Address[]> {
      if (!provider) throw new ProviderNotFoundError()
      try {
        const acct = (await provider.getAddress(path)) || provider?.getConnectedAddress()
        const accounts = (await Promise.all([acct])) as Address[]

        return accounts
      } catch (error: any) {
        throw new Error(
          'Error getting address! Check that HID device is properly activated. Error details:',
          error || 'None available.'
        )
      }
    },
    /**
     *
     * @param path - derivation path (default: m/44'/60')
     * @returns void
     */
    async setAccount(path?: string): Promise<void> {
      if (!provider) throw new ProviderNotFoundError()
      try {
        await provider.setAddress(path)
        const accounts = await this.getAccounts(path)
        this.onAccountsChanged(accounts)
      } catch (error: any) {
        throw new Error('Error setting address. Check that HID device is properly activated. Error:', error)
      }
    },
    // ====================
    // ==== EVENT HANDLERS
    // ====================
    async onConnect(params): Promise<void> {
      const nChainId = normalizeChainId(chainId)

      if (!provider) throw new ProviderNotFoundError()

      let derivedAccounts: readonly Address[]
      if ('accounts' in params) {
        derivedAccounts = params.accounts
      } else {
        const connectedAccount = provider.getConnectedAddress()
        derivedAccounts = (connectedAccount ? [connectedAccount] : await this.getAccounts()) as Address[]
      }
      config.emitter.emit('connect', { accounts: derivedAccounts, chainId: nChainId })
      // user param callback
      parameters?.onDeviceConnect?.()

      provider.removeListener('connect', this.onConnect.bind(this))
      provider.on('accountsChanged', this.onLedgerAccountsChanged.bind(this))
      provider.on('chainChanged', this.onLedgerChainChanged.bind(this))
    },
    async onDisconnect() {
      config.emitter.emit('disconnect')

      this.deactivate()

      // user param callback
      parameters?.onDeviceDisconnect?.()

      // Remove shim signalling wallet is disconnected
      if (parameters?.shimDisconnect) config.storage?.removeItem('recentConnectorId')
    },
    async onAccountsChanged(accounts: Address[]) {
      if (accounts.length === 0) provider?.emit('disconnect')
      // Regular change event
      else {
        config.emitter.emit('change', {
          accounts
        })
      }
    },
    async onChainChanged(chainId: number | string) {
      const id = normalizeChainId(chainId)
      const unsupported = isChainUnsupported(id, config)

      if (unsupported) throw new ChainNotConfiguredForConnectorError()
      if (!provider) throw new ProviderNotFoundError()

      const connectedAccount = provider.getConnectedAddress()
      const accounts = (connectedAccount ? [connectedAccount] : await this.getAccounts()) as Address[]
      config.emitter.emit('change', { chainId: id, accounts })
    },
    // Wrappers over onAccountsChanged for ledger provider signature mapping
    async onLedgerAccountsChanged(params) {
      return this.onAccountsChanged(params.accounts)
    },
    async onLedgerChainChanged(params) {
      return this.onChainChanged(params.chainId)
    },
    // ====================
    // ==== UTILS
    // ====================
    isSupported(): boolean {
      return isHIDSupported()
    }
  }))
}
