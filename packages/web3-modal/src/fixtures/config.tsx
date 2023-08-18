import React from 'react'

import { PstlWeb3ModalProps } from '../providers'
import { createTheme } from '../theme'
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

const BASE_BUTTON_BACKGROUND = {
  background: '#301d4ea1',
  connected: '#37b9927d'
}
export const pstlModalTheme = createTheme({
  DARK: {
    modals: {
      base: {
        title: {
          font: {
            color: 'black',
            weight: 900
          }
        }
      },
      connection: {
        filter: 'invert(1) brightness(0.65) contrast(1.8) hue-rotate(247deg) saturate(2)',
        background: {
          backgroundImg: 'unset',
          background: 'indianred'
        },
        button: {
          background: {
            background: 'rgba(0,0,0,0.75)',
            connected: 'green'
          },
          font: {
            color: 'indianred',
            weight: 500
          }
        }
      }
    }
  },
  LIGHT: {
    modals: {
      base: {
        title: {
          font: {
            color: 'pink',
            weight: 900
          }
        }
      },
      connection: {
        background: {
          backgroundImg: 'unset',
          background: '#818ccaf2'
        },
        button: {
          background: {
            backgroundImg: 'unset',
            background: '#fec0cb7d',
            connected: 'green'
          },
          font: {
            color: 'ghostwhite',
            weight: 500
          }
        }
      }
    }
  },
  DEFAULT: {
    modals: {
      base: {
        font: {
          family: "'Roboto Flex', 'Inter', sans-serif, system-ui",
          letterSpacing: '0px'
        },
        title: {
          font: {
            color: '#cbb9ee',
            style: 'italic',
            weight: 700,
            letterSpacing: '-1.4px',
            lineHeight: 0.82
          }
        }
      },
      connection: {
        baseFontSize: 20,
        helpers: { show: true },
        background: {
          backgroundImg: BG_LOGO
        },
        button: {
          background: BASE_BUTTON_BACKGROUND,
          icons: {
            maxHeight: '65%'
          },
          border: { border: 'none', radius: '1em' },
          font: {
            color: 'ghostwhite',
            size: '0.75em',
            style: 'normal',
            weight: 200,
            letterSpacing: '-1px',
            textShadow: '2px 2px 3px #0000005c',
            textTransform: 'uppercase'
          },
          hoverAnimations: true
        }
      },
      account: {
        text: {
          address: {},
          balance: {},
          main: {}
        },
        button: {
          explorer: {
            background: {
              ...BASE_BUTTON_BACKGROUND,
              background: '#5a3e85a1'
            }
          },
          copy: {
            background: {
              ...BASE_BUTTON_BACKGROUND,
              background: '#5a3e85a1'
            }
          },
          switchNetwork: {
            background: {
              ...BASE_BUTTON_BACKGROUND,
              background: '#5a3e85a1'
            }
          }
        }
      }
    }
  }
})

export const COMMON_CONNECTOR_OVERRIDES = {
  general: {
    infoText: {
      title: 'What is this?',
      content: (
        <strong>
          This is some helper filler text to describe wtf is going on in this connection modal. It is useful to learn
          these things while browsing apps as users can get confused when having to exit apps to read info somewhere
          else that isn't the current screent they are on.
        </strong>
      )
    }
  },
  walletconnect: {
    logo: WALLETCONNECT_LOGO,
    infoText: {
      title: 'What is WalletConnect?',
      content: (
        <strong>
          Web3Modal/WalletConnect is a simple blockchain wallet aggregator modal that facilitates the choice of
          selecting preferred blockchain wallet(s) for connecting to dApps (decentralised apps). This generally requires
          more blockchain knowledge.
        </strong>
      )
    }
  },
  web3auth: {
    isRecommended: true,
    logo: WEB3AUTH_LOGO,
    infoText: {
      title: 'How does this login work?',
      content: (
        <strong>
          Social login is done via Web3Auth - a non-custodial social login protocol (i.e they never actually know, or
          hold your data) - which facilitates logging into dApps (decentralised apps) via familiar social login choices
        </strong>
      )
    }
  },
  ledger: {
    customName: 'LEDGER LIVE',
    logo: 'https://crypto-central.io/library/uploads/Ledger-Logo-3.png',
    modalNodeId: 'ModalWrapper',
    rank: 0,
    isRecommended: true,
    infoText: {
      title: 'What is Ledger?',
      content: <strong>Ledger wallet is a cold storage hardware wallet.</strong>
    }
  },
  'ledger-hid': {
    customName: 'LEDGER HID',
    logo: 'https://crypto-central.io/library/uploads/Ledger-Logo-3.png',
    rank: 10,
    isRecommended: true,
    infoText: {
      title: 'What is Ledger HID?',
      content: <strong>Ledger wallet is a cold storage hardware wallet.</strong>
    }
  },
  coinbasewallet: {
    customName: 'Coinbase Wallet',
    logo: 'https://companieslogo.com/img/orig/COIN-a63dbab3.png?t=1648737284',
    rank: 12,
    downloadUrl: 'https://www.coinbase.com/wallet/downloads',
    isRecommended: true
  },
  taho: {
    logo: 'https://user-images.githubusercontent.com/95715502/221033622-fb606b37-93f1-485b-9ce5-59b92f756033.png',
    rank: 11,
    downloadUrl: 'https://taho.xyz/',
    isRecommended: false
  },
  metamask: {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png',
    rank: 10,
    downloadUrl: 'https://metamask.io/downloads',
    isRecommended: true
  }
}

const DEFAULT_PROPS: PstlWeb3ModalProps = {
  appName: 'COSMOS APP',
  chains,
  options: {
    pollingInterval: 10_000,
    escapeHatches: {
      appType: 'DAPP'
    }
  },
  modals: {
    root: {
      title: 'PAST3LLE W3M',
      themeConfig: { theme: pstlModalTheme },
      closeModalOnConnect: false,
      hideInjectedFromRoot: true,
      connectorDisplayOverrides: COMMON_CONNECTOR_OVERRIDES,
      loaderProps: {
        spinnerProps: {
          size: 80
        }
      }
    },
    walletConnect: {
      projectId: WALLETCONNECT_TEST_ID,
      walletImages: {
        web3auth: 'https://web3auth.io/images/web3auth-L-Favicon-1.svg',
        safe: 'https://user-images.githubusercontent.com/3975770/212338977-5968eae5-bb1b-4e71-8f82-af5282564c66.png'
      }
    }
  }
}

const DEFAULT_PROPS_WEB3AUTH: PstlWeb3ModalProps = {
  ...DEFAULT_PROPS,
  modals: {
    ...DEFAULT_PROPS.modals,
    root: {
      ...DEFAULT_PROPS.modals.root,
      connectorDisplayOverrides: {
        ...DEFAULT_PROPS.modals.root?.connectorDisplayOverrides,
        web3auth: {
          isRecommended: true,
          logo: WEB3AUTH_LOGO,
          infoText: {
            title: 'How does this login work?',
            content: (
              <strong>
                Social login is done via Web3Auth - a non-custodial social login protocol (i.e they never actually know,
                or hold your data) - which facilitates logging into dApps (decentralised apps) via familiar social login
                choices
              </strong>
            )
          }
        }
      }
    }
  }
} as const

export { WALLETCONNECT_TEST_ID as WALLETCONNECT_ID, DEFAULT_PROPS, DEFAULT_PROPS_WEB3AUTH }
