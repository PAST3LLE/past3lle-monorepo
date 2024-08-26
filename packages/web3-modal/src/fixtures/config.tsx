import { devDebug } from '@past3lle/utils'
import { http } from 'viem'
import { fallback } from 'wagmi'

import { PstlWeb3ModalProps } from '../providers'
import { createTheme } from '../theme'
import { ChainImages, ConnectorOverrides } from '../types'
import { chains } from './chains'

const BG_LOGO = 'https://ik.imagekit.io/pastelle/SKILLFORGE/forge-background.png'
// TESTING ID - DONT USE IN PROD
const WALLETCONNECT_TEST_ID = 'a01e2f3b7c64ff495f9cb28e4e2d4b49'
// TESTING KEY DO NOT USE IN PROD
export const WEB3AUTH_TEST_ID =
  'BHloyoLW113nGn-mIfeeNqj2U0wNCXa4y83xLnR6d3FELPMz_oZ7rbY4ZEO3r0MVjQ_LX92obu1ta0NknOwfvtU'

const WEB3AUTH_LOGO = 'https://www.getopensocial.com/wp-content/uploads/2020/12/social-login-COLOR_2.png'
const WALLETCONNECT_LOGO =
  'https://repository-images.githubusercontent.com/204001588/a5169900-c66c-11e9-8592-33c7334dfd6d'
export const FORGE_LOGO =
  'https://raw.githubusercontent.com/PAST3LLE/monorepo/main/apps/skillforge-ui/public/512_logo.png'

const ACCOUNT_BUTTON = {
  font: {
    textTransform: 'inherit'
  },
  background: {
    default: '#5a3e85a1',
    url: 'none'
  }
}
export const pstlModalTheme = createTheme({
  DEFAULT: {
    modals: {
      base: {
        baseFontSize: 16,
        background: {
          main: 'black',
          success: '#777b48',
          url: BG_LOGO
        },
        button: {
          main: {
            font: {
              color: 'ghostwhite'
            }
          }
        },
        input: {
          font: {
            color: 'violet'
          }
        },
        tooltip: {
          background: '#685985',
          font: {
            color: 'ghostwhite',
            family: 'monospace'
          }
        },
        text: {
          main: {
            color: 'ghostwhite'
          }
        },
        font: {
          family: "'Roboto Flex', 'Inter', sans-serif, system-ui",
          letterSpacing: '0px'
        },
        closeIcon: {
          size: 45,
          color: 'ghostwhite',
          background: 'rgba(255,255,255,0.1)'
        },
        attribution: {
          color: 'green'
        },
        title: {
          font: {
            color: '#cbb9ee',
            size: '2.5em',
            style: 'italic',
            weight: 700,
            letterSpacing: '-1.4px',
            lineHeight: 0.82,
            textAlign: 'center'
          },
          margin: '0px 20px'
        },
        helpers: { show: true },
        error: {
          background: 'rgba(0,0,0, 0.95)'
        }
      },
      connection: {
        button: {
          main: {
            filter: 'invert(1) hue-rotate(65deg)',
            background: { default: '#2d222cbd', url: 'none' },
            height: '80px',
            icons: {
              height: '80%'
            },
            border: { border: 'none', radius: '1em' },
            font: {
              style: 'normal',
              weight: 200,
              letterSpacing: '-1px',
              textShadow: '2px 2px 3px #0000005c',
              textTransform: 'uppercase'
            },
            hoverAnimations: true
          },
          active: {
            filter: 'invert(1) saturate(1.2)',
            background: { default: '#777b48' }
          }
        }
      },
      account: {
        icons: {
          copy: { url: 'https://img.icons8.com/?size=512&id=PoI08DwSsc7G&format=png', invert: false },
          network: { url: 'https://img.icons8.com/?size=512&id=PrryJ8KTxcOv&format=png', invert: false },
          wallet: { url: 'https://img.icons8.com/?size=512&id=O7exVeEFSVr3&format=png', invert: false }
        },
        text: {
          main: {
            weight: 500
          }
        },
        button: {
          main: {
            ...ACCOUNT_BUTTON,
            filter: 'invert(1) hue-rotate(65deg)'
          },
          alternate: {
            filter: 'hue-rotate(-5deg) contrast(1.3)',
            background: { default: 'indianred', url: 'none' }
          }
        },
        container: {
          main: {
            background: '#1113107a',
            border: {
              border: '2px solid',
              color: 'rgba(120,110,40,0.65)'
            }
          },
          alternate: {
            background: '#1113107a',
            border: {
              border: '2px solid',
              color: 'rgba(120,110,40,0.65)'
            }
          }
        }
      },
      transactions: {
        text: {
          subHeader: { color: 'orange' },
          main: { color: 'red' },
          strong: { color: 'red' },
          small: { color: 'red' },
          anchor: { color: 'yellow' }
        },
        card: {
          background: { success: 'indianred', error: 'black' },
          statusPill: {
            statusText: {
              success: 'orange',
              pending: 'navajowhite'
            }
          }
        }
      }
    }
  },
  get DARK(): any {
    return this.DEFAULT
  },
  LIGHT: {
    modals: {
      base: {
        baseFontSize: 5,
        background: {
          main: 'navajowhite',
          url: 'unset'
        }
      }
    }
  }
})

export const COMMON_CONNECTOR_OVERRIDES = {
  walletconnect: {
    icon: WALLETCONNECT_LOGO
  },
  web3auth: {
    isRecommended: true,
    icon: WEB3AUTH_LOGO
  },
  ledger: {
    customName: 'Ledger Live',
    icon: 'https://crypto-central.io/library/uploads/Ledger-Logo-3.png',
    modalNodeId: 'ModalWrapper',
    rank: 0,
    isRecommended: true
  },
  'ledger-hid': {
    customName: 'Ledger HID',
    icon: 'https://crypto-central.io/library/uploads/Ledger-Logo-3.png',
    rank: 10,
    isRecommended: true
  },
  'coinbase-wallet-injected': {
    customName: 'Coinbase Wallet',
    icon: 'https://companieslogo.com/img/orig/COIN-a63dbab3.png?t=1648737284',
    rank: 12,
    downloadUrl: 'https://www.coinbase.com/wallet/downloads',
    isRecommended: true
  },
  'taho-injected': {
    customName: 'Taho',
    icon: 'https://user-images.githubusercontent.com/95715502/221033622-fb606b37-93f1-485b-9ce5-59b92f756033.png',
    rank: 11,
    downloadUrl: 'https://taho.xyz/',
    isRecommended: false
  },
  'metamask-injected': {
    customName: 'MetaMask',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png',
    rank: 10,
    downloadUrl: 'https://metamask.io/downloads',
    isRecommended: true
  }
} as const

const CHAIN_IMAGES: ChainImages = {
  // unknown: 'https://img.freepik.com/premium-vector/unknown-mysterious-logo-sports_67734-82.jpg',
  137: 'https://icons.llamao.fi/icons/chains/rsz_polygon.jpg',
  80002: 'https://icons.llamao.fi/icons/chains/rsz_polygon.jpg'
}

const DEFAULT_PROPS = {
  appName: 'COSMOS APP',
  chains,
  connectors: {
    overrides: COMMON_CONNECTOR_OVERRIDES
  },
  options: {
    transports: {
      11155111: fallback([
        http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_SEPOLIA_API_KEY as string}`)
      ]),
      137: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MATIC_API_KEY as string}`),
      80002: http(`https://polygon-amoy.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MUMBAI_API_KEY as string}`)
    },
    autoConnect: true,
    pollingInterval: 10_000,
    escapeHatches: {
      appType: 'DAPP'
    },
    multiInjectedProviderDiscovery: false
  },
  callbacks: {
    transactions: {
      onEoaTransactionConfirmed(tx) {
        devDebug('[@past3lle/web3-modal --> onEoaConfirmed] EOA transaction confirmed! Transaction:', tx)
        return tx
      },
      onEoaTransactionUnknown(tx) {
        devDebug('[@past3lle/web3-modal --> onEoaUnknown] EOA transaction status unknown!', tx)
        return tx
      }
    }
  },
  modals: {
    root: {
      headers: {
        wallets: 'Select wallet',
        account: 'Your account',
        networks: 'Select network'
      },
      themeConfig: { theme: pstlModalTheme },
      chainImages: CHAIN_IMAGES,
      closeModalOnConnect: false,
      hideInjectedFromRoot: true,
      loaderProps: {
        spinnerProps: {
          size: 80
        },
        fontSize: '3.2em'
      }
    },
    walletConnect: {
      projectId: WALLETCONNECT_TEST_ID,
      themeMode: 'dark',
      // themeVariables: {
      //   '--wcm-background-color': 'slategrey',
      //   '--wcm-z-index': '999'
      // },
      zIndex: 9999
      // walletImages: {
      //   web3auth: 'https://web3auth.io/images/web3auth-L-Favicon-1.svg',
      //   safe: 'https://user-images.githubusercontent.com/3975770/212338977-5968eae5-bb1b-4e71-8f82-af5282564c66.png'
      // }
    }
  }
} as const satisfies PstlWeb3ModalProps<typeof chains>

const DEFAULT_PROPS_WEB3AUTH: PstlWeb3ModalProps = {
  ...DEFAULT_PROPS,
  connectors: {
    ...DEFAULT_PROPS.connectors,
    overrides: {
      ...((DEFAULT_PROPS.connectors as any)?.overrides as ConnectorOverrides),
      web3auth: {
        isRecommended: true,
        logo: WEB3AUTH_LOGO
      }
    }
  },
  modals: {
    ...DEFAULT_PROPS.modals,
    root: {
      ...DEFAULT_PROPS.modals.root
    }
  }
}

export { WALLETCONNECT_TEST_ID as WALLETCONNECT_ID, DEFAULT_PROPS, DEFAULT_PROPS_WEB3AUTH }
