import {
  ForgeChainsMinimum,
  ForgeContractAddressMap,
  ForgeMetadataUriMap,
  ForgeW3CoreProvidersProps,
  createWeb3ModalTheme
} from '@past3lle/forge-web3'
import { devDebug } from '@past3lle/utils'
import { ledgerHid } from '@past3lle/wagmi-connectors'
import { polygon, sepolia } from 'viem/chains'
import { defineChain } from 'viem/utils'
import { ConnectorNotFoundError, ProviderNotFoundError, fallback, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

// TODO: remove when viem adds amoy polygon
export const amoy = defineChain({
  id: 80002,
  name: 'Amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'Matic',
    symbol: 'MATIC'
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology/'],
      webSocket: ['wss://rpc-amoy.polygon.technology/']
    }
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://amoy.polygonscan.com/' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3127388
    }
  }
})

const IS_SERVER = typeof globalThis?.window === 'undefined'
const MODAL_THEME = createWeb3ModalTheme({
  DEFAULT: {
    modals: {
      base: {
        input: {
          font: {
            color: 'black'
          }
        },
        title: {
          font: {
            color: 'navajowhite'
          }
        },
        background: {
          main: 'rgba(0,0,0,0.6)'
        }
      },
      connection: {
        button: {
          main: {
            font: { color: 'black' },
            background: {
              default: 'navajowhite'
            }
          }
        }
      },
      transactions: {
        baseFontSize: 20
      },
      account: {
        text: {
          main: {
            color: 'black',
            weight: 500
          },
          header: { color: 'black' },
          subHeader: {
            color: 'black'
          }
        },
        container: {
          main: {
            background: 'navajowhite'
          },
          alternate: {
            background: 'navajowhite'
          }
        },
        button: {
          main: {
            font: {
              color: 'ghostwhite'
            },
            background: {
              default: 'rgba(0,0,0,0.5)'
            }
          },
          alternate: {
            background: {
              default: 'indianred'
            }
          }
        }
      }
    }
  }
})
// TESTING ID - DONT USE IN PROD
const WALLETCONNECT_TEST_ID = 'a01e2f3b7c64ff495f9cb28e4e2d4b49'
const SUPPORTED_CHAINS = [sepolia, polygon, amoy] as const satisfies ForgeChainsMinimum
const WEB3_PROPS: ForgeW3CoreProvidersProps<typeof SUPPORTED_CHAINS>['config']['web3'] = {
  chains: SUPPORTED_CHAINS,
  connectors: {
    connectors: [
      ledgerHid(),
      injected({
        target() {
          if (IS_SERVER) throw new ProviderNotFoundError()
          return {
            name: 'MetaMask',
            id: 'metamask',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
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
      })
    ],
    overrides: {
      'ledger-hid': {
        customName: 'Ledger HID Device',
        async customConnect({ modalsStore, connector, wagmiConnect }) {
          if (!connector) throw new ConnectorNotFoundError()
          await wagmiConnect(connector)
          modalsStore.open({ route: 'HidDeviceOptions' })
        }
      }
    }
  },
  callbacks: {
    transactions: {
      onEoaTransactionConfirmed(tx) {
        devDebug('[@past3lle/skillforge-widget] EOA transaction confirmed!', tx)
        return tx
      },
      onEoaTransactionUnknown(tx) {
        devDebug('[@past3lle/skillforge-widget] EOA transaction Unknown!', tx)
        return tx
      }
    }
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
  modals: {
    root: {
      themeConfig: {
        theme: MODAL_THEME
      }
    },
    walletConnect: {
      projectId: WALLETCONNECT_TEST_ID,
      walletImages: {
        web3auth: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
        safe: 'https://user-images.githubusercontent.com/3975770/212338977-5968eae5-bb1b-4e71-8f82-af5282564c66.png'
      }
    }
  }
} as const satisfies ForgeW3CoreProvidersProps<typeof SUPPORTED_CHAINS>['config']['web3']

const METADATA_URIS_AND_CONTRACTS_PROPS = {
  metadataUris: {
    [11155111]: { collectionsManager: 'https://pstlcollections.s3.eu-south-2.amazonaws.com/collections/' },
    [137]: { collectionsManager: 'https://pstlcollections.s3.eu-south-2.amazonaws.com/collections/' }
  },
  contractAddresses: {
    [11155111]: {
      collectionsManager: '0x0824dcc3b0969c5B60F579907e26a8B50eA74f7A',
      mergeManager: '0x03b5d78E489b2bdF57Be8b1e2c0A5fFF369b030F'
    },
    [137]: {
      collectionsManager: '0x237B80e076cDfa4Dc4cC324B1a2f04F8E0513336',
      mergeManager: '0x0B397B88C96E22E63D6D9b802df62fe40bB1B544'
    }
  }
} as const satisfies {
  metadataUris: ForgeMetadataUriMap<typeof SUPPORTED_CHAINS>
  contractAddresses: ForgeContractAddressMap<typeof SUPPORTED_CHAINS>
}

export { SUPPORTED_CHAINS, WEB3_PROPS, METADATA_URIS_AND_CONTRACTS_PROPS }
