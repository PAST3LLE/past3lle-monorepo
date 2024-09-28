import { devWarn } from '@past3lle/utils'
import { iframeEthereum, ledgerLive, web3Auth } from '@past3lle/wagmi-connectors'
import { ledgerHid } from '@past3lle/wagmi-connectors/ledgerHid'
import { CreateConnectorFn } from 'wagmi'
import { injected } from 'wagmi/connectors'

import { FORGE_LOGO } from './config'

const IS_SERVER = typeof globalThis?.window === 'undefined'

if (!process.env.REACT_APP_WEB3AUTH_DEVNET_CLIENT_ID) {
  throw new Error('Missing REACT_APP_WEB3AUTH_DEVNET_CLIENT_ID variable. Check .env')
}

export const wagmiConnectors: Record<string, CreateConnectorFn> = {
  ledgerLiveModal: ledgerLive({}),
  ledgerHID: ledgerHid({ shimDisconnect: true }),
  ledgerIFrame: iframeEthereum({}),
  web3auth: web3Auth({
    projectId: process.env.REACT_APP_WEB3AUTH_DEVNET_CLIENT_ID,
    network: 'sapphire_devnet',
    uiConfig: {
      appName: 'SKILLFORGE TEST',
      logoLight: FORGE_LOGO,
      logoDark: FORGE_LOGO
    },
    uxMode: 'popup',
    preset: 'DISALLOW_EXTERNAL_WALLETS',
    enableLogging: true
  })
}

export const INJECTED_CONNECTORS = [
  injected({
    target() {
      if (IS_SERVER) return undefined
      return {
        name: 'MetaMask',
        id: 'metamask-injected',
        provider() {
          if (IS_SERVER) return undefined
          try {
            const provider =
              window?.ethereum?.providers?.find((provider: any) => provider?.isMetaMask) ||
              (window.ethereum?.isMetaMask && window.ethereum)
            if (!provider) devWarn('MetaMask connector not found!')
            return provider
          } catch (error) {
            return undefined
          }
        }
      }
    }
  }),
  injected({
    target() {
      return {
        name: 'Taho',
        id: 'taho-injected',
        provider() {
          if (IS_SERVER) return undefined
          try {
            const provider = window?.tally
            if (!provider) devWarn('Connector', 'Taho', 'not found!')
            return provider
          } catch (error) {
            return undefined
          }
        }
      }
    }
  }),
  injected({
    target() {
      return {
        name: 'Coinbase Wallet',
        id: 'coinbase-wallet-injected',
        provider() {
          if (IS_SERVER) return undefined
          try {
            const provider = (window?.ethereum?.isCoinbaseWallet && window.ethereum) || window?.coinbaseWalletExtension
            if (!provider) devWarn('Coinbase Wallet not found!')
            return provider
          } catch (error) {
            return undefined
          }
        }
      }
    }
  })
]
