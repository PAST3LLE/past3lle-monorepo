import METAMASK_ICON from '../../assets/png/metamask.png'
import { ledgerHid, ledgerLive, web3Auth, Web3AuthParameters } from '@past3lle/wagmi-connectors'
import { ASSETS_MAP } from 'assets'
import GOOGLE_APPLE_LOGO from 'assets/png/google-apple.png'
import { skillforgeTheme } from 'theme/skillforge'
import { ProviderNotFoundError } from 'wagmi'
import { injected } from 'wagmi/connectors'

const IS_SERVER = typeof globalThis?.window === 'undefined'

function _getWhitelistTheme(): Web3AuthParameters['uiConfig'] {
  if (!JSON.parse(process.env.REACT_APP_WEB3AUTH_WHITELIST_ENABLED || 'false')) return

  return {
    theme: {
      primary: skillforgeTheme.modes.DEFAULT.mainBgDarker
    },
    mode: 'dark',
    logoDark: ASSETS_MAP.logos.forge[512],
    logoLight: ASSETS_MAP.logos.forge[512]
  }
}

const connectors = {
  connectors: [
    ledgerHid({ shimDisconnect: true }),
    injected({
      shimDisconnect: true,
      target() {
        if (IS_SERVER) throw new ProviderNotFoundError()
        return {
          name: 'MetaMask',
          id: 'metamask',
          icon: METAMASK_ICON,
          provider() {
            try {
              if (IS_SERVER) throw new ProviderNotFoundError()
              const provider = window?.ethereum?.isMetaMask
                ? window.ethereum
                : window?.ethereum?.providers?.find((provider: any) => provider?.isMetaMask)
              if (!provider) throw new ProviderNotFoundError()
              return provider
            } catch (error) {
              console.error(error)
              throw error
            }
          }
        }
      }
    }),
    web3Auth({
      network: process.env.REACT_APP_WEB3_AUTH_NETWORK as Web3AuthParameters['network'],
      projectId: process.env.REACT_APP_WEB3AUTH_ID as string,
      storageKey: 'session',
      mfaLevel: 'none',
      uxMode: 'popup',
      uiConfig: _getWhitelistTheme()
    })
  ],
  overrides: {
    web3auth: {
      isRecommended: true,
      logo: GOOGLE_APPLE_LOGO,
      customName: 'Google & more',
      rank: 1000
    },
    metamask: {
      logo: METAMASK_ICON,
      customName: 'MetaMask',
      rank: 900
    },
    walletconnect: {
      logo: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Gradient/Logo.png',
      customName: 'WalletConnect',
      rank: 100,
      modalNodeId: 'wcm-modal'
    },
    'ledger-hid': {
      customName: 'Ledger USB',
      logo: 'https://crypto-central.io/library/uploads/Ledger-Logo-3.png',
      rank: 0
    }
  }
}
const frameConnectors = [ledgerLive()]
export { connectors, frameConnectors }
