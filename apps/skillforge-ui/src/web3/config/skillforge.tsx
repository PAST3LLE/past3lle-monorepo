import { connectors, frameConnectors } from '../connectors'
import { SUPPORTED_CHAINS_DEV, SUPPORTED_CHAINS_PROD } from './chains'
import { WCM_THEME_VARIABLES } from './walletConnect'
import { ForgeChainsMinimum, Web3ModalConfigWeb3Props } from '@past3lle/forge-web3'
import { pstlModalTheme as PSTL_MODAL_THEME } from 'theme/pstlModal'
import { http } from 'viem'

const IS_SERVER = typeof globalThis?.window == 'undefined'

if (
  !process.env.REACT_APP_WEB3MODAL_ID ||
  !process.env.REACT_APP_WEB3AUTH_ID ||
  !process.env.REACT_APP_WEB3_AUTH_NETWORK
) {
  throw new Error('Missing W3A and/or W3M projectID env variables!')
}

export const SKILLFORGE_APP_NAME = 'SKILLFORGE'
export const WEB3_PROPS_BASE = {
  clients: {
    wagmi: {
      options: {
        // SEPOLIA KEY - steal it idgaf
        transports: {
          11155111: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY as string}`),
          137: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY as string}`),
          80002: http(`https://polygon-amoy.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY as string}`)
        }
      }
    }
  },
  connectors,
  frameConnectors,
  callbacks: {
    switchChain: async (chains) => {
      if (IS_SERVER) return undefined
      const searchParams = new URLSearchParams(window.location.search)
      const dirtyParams = searchParams.get('forge-network')

      const decodedSearchParam = dirtyParams ? decodeURI(dirtyParams) : undefined
      return decodedSearchParam ? chains.find((chain) => chain.name === decodedSearchParam.toLowerCase()) : undefined
    }
  },
  options: {
    pollingInterval: 10_000,
    autoConnect: false,
    closeModalOnKeys: ['Escape', 'Esc']
  },
  modals: {
    walletConnect: {
      projectId: process.env.REACT_APP_WEB3MODAL_ID as string,
      themeMode: 'dark',
      themeVariables: WCM_THEME_VARIABLES
    },
    root: {
      chainImages: {
        [1]: 'https://cryptologos.cc/logos/versions/ethereum-eth-logo-colored.svg',
        [11155111]: 'https://cryptologos.cc/logos/versions/ethereum-eth-logo-colored.svg',
        [137]:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Polygon_Blockchain_Matic_Logo.svg/1200px-Polygon_Blockchain_Matic_Logo.svg.png',
        [80002]:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Polygon_Blockchain_Matic_Logo.svg/1200px-Polygon_Blockchain_Matic_Logo.svg.png'
      },
      title: SKILLFORGE_APP_NAME + ' LOGIN',
      themeConfig: { theme: PSTL_MODAL_THEME },
      walletsView: 'list',
      maxHeight: '650px',
      maxWidth: '360px',
      margin: 'auto',
      closeModalOnConnect: true,
      hideInjectedFromRoot: true,
      loaderProps: {
        spinnerProps: { size: 85 },
        loadingText: 'GETTING LOGIN...'
      }
    }
  }
} as const satisfies Omit<Web3ModalConfigWeb3Props<ForgeChainsMinimum>, 'chains'>

export const WEB3_PROPS_PRODUCTION = {
  ...WEB3_PROPS_BASE,
  chains: SUPPORTED_CHAINS_PROD
} as const satisfies Web3ModalConfigWeb3Props<typeof SUPPORTED_CHAINS_PROD>

export const WEB3_PROPS_DEVELOP = {
  ...WEB3_PROPS_BASE,
  chains: SUPPORTED_CHAINS_DEV
} as const
