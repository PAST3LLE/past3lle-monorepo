import { RobotoVariableFontProvider } from '@past3lle/theme'
import React from 'react'
import { http } from 'viem'

import { SkillForge, SkillForgeConnectedHeader } from '../components'
import { createTheme } from '../theme/utils'
import { METADATA_URIS_AND_CONTRACTS_PROPS, SUPPORTED_CHAINS, WEB3_PROPS } from './config'

/* 
    interface Web3ModalProps {
        appName: string
        web3Modal: Web3ModalConfig
        wagmiClient?: SkillForgeW3WagmiClientOptions
        ethereumClient?: EthereumClient
    }
*/

const skillforgeTheme = createTheme({
  ALT: {
    mainBgAlt: '#1A1A1A',
    assetsMap: {
      logos: {
        company: {
          full: '	https://pastelle.shop/static/media/pastelle-ivory-outlined.06d3dadfc9e4e7c2c8904b880bf4067c.svg'
        },
        forge: { '512': 'FORGE_512' }
      }
    }
  },
  DEFAULT: {
    mainFg: '#ebd7d7',
    assetsMap: {
      logos: {
        company: {
          full: '	https://pastelle.shop/static/media/pastelle-ivory-outlined.06d3dadfc9e4e7c2c8904b880bf4067c.svg'
        },
        forge: { '512': 'FORGE_512' }
      },
      images: {
        background: {
          app: 'https://ik.imagekit.io/pastelle/SKILLFORGE/forge-background.png',
          header: {
            background:
              'https://e7.pngegg.com/pngimages/977/1011/png-clipart-blue-banner-design-page-header-web-banner-header-miscellaneous-blue.png',
            account: 'ACCOUNT_BACKGROUND'
          }
        },
        skills: {
          skillpoint: {
            highlight:
              'https://deploy-preview-34--skills-pastelle.netlify.app/static/media/spray.e645b496a43cad017c9d.png',
            empty: 'https://skills.pastelle.shop/static/media/empty-skill.bfaa369a745e8dde888d.png'
          }
        }
      },
      icons: {
        locked: 'LOCK_ICON',
        connection: 'CONNECTION_ICON',
        inventory:
          'data:image/png;base64,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',
        shop: 'SHOP_ICON',
        transactions:
          'data:image/png;base64,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',
        chains: {
          disconnected: 'CONNECTION_ICON',
          11155111: 'ETHEREUM_LOGO',
          137: 'MATIC_LOGO',
          80002: 'POLYGON_LOGO'
        },
        rarity: {
          empty: '',
          common: 'COMMON_RARITY_ICON',
          rare: 'RARE_RARITY_ICON',
          legendary: 'LEGENDARY_RARITY_ICON',
          epic: 'EPIC_RARITY_ICON'
        }
      }
    }
  }
})

function App() {
  return (
    <SkillForge
      dimensions={{
        mobile: {
          width: {
            max: '100%'
          }
        },
        desktop: {
          width: {
            max: '100%'
          },
          height: {
            max: '100%'
          }
        }
      }}
      config={{
        ...METADATA_URIS_AND_CONTRACTS_PROPS,
        name: 'Skillforge Widget Fixture',
        boardOptions: {
          minimumColumns: 3,
          minimumBoardWidth: 0
        },
        theme: skillforgeTheme,
        contactInfo: {
          email: 'fixture@fuxtire.gmail.com'
        },
        contentUrls: {
          FAQ: 'faq.thing.io'
        },
        web3: {
          ...WEB3_PROPS,
          chains: SUPPORTED_CHAINS,
          clients: {
            wagmi: {
              options: {
                transports: {
                  11155111: http(
                    `https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_SEPOLIA_API_KEY as string}`
                  ),
                  137: http(
                    `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MATIC_API_KEY as string}`
                  ),
                  80002: http(
                    `https://polygon-amoy.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MUMBAI_API_KEY as string}`
                  )
                }
              }
            }
          },
          callbacks: {
            transactions: {
              onEoaTransactionConfirmed(tx) {
                console.debug('[SKILLFORGE-WIDGET --> onEoaConfirmed] Callback called!')
                return tx
              }
            }
          },
          options: {
            pollingInterval: 15_000,
            escapeHatches: {
              appType: 'DAPP'
            }
          },
          modals: WEB3_PROPS.modals
        },
        options: {
          windowSizeOptions: {
            throttleMs: 1500
          }
        }
      }}
      render={() => <SkillForgeConnectedHeader />}
    />
  )
}

export default {
  default: (
    <>
      <RobotoVariableFontProvider />
      <App />
    </>
  )
}
