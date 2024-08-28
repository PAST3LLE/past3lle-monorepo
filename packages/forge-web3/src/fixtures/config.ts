import { createTheme } from '@past3lle/web3-modal'

import { ForgeContractAddressMap, ForgeMetadataUriMap } from '../types'
import { ForgeWeb3ModalProps } from '../types/web3modal'
import { chains } from './chains'

const THEME = createTheme({
  DEFAULT: {
    modals: {
      base: {
        font: {
          color: 'black',
          weight: 700
        }
      },
      connection: {
        button: {
          main: {
            font: {
              color: 'ghostwhite'
            }
          }
        }
      }
    }
  }
})

// TESTING ID - DONT USE IN PROD
const WALLETCONNECT_TEST_ID = 'a01e2f3b7c64ff495f9cb28e4e2d4b49'
// TESTING KEY DO NOT USE IN PROD
const DEFAULT_PROPS: ForgeWeb3ModalProps = {
  appName: 'COSMOS APP',
  chains,
  modals: {
    root: { themeConfig: { theme: THEME } },
    walletConnect: {
      projectId: WALLETCONNECT_TEST_ID,
      explorerRecommendedWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
      ],
      themeVariables: {
        '--wcm-z-index': '999',
        '--wcm-color-bg-1': 'black',
        '--wcm-background-color': 'pink',
        '--wcm-accent-color': 'lightskyblue',
        '--wcm-accent-fill-color': 'black'
      },
      walletImages: {
        web3auth: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
        safe: 'https://user-images.githubusercontent.com/3975770/212338977-5968eae5-bb1b-4e71-8f82-af5282564c66.png'
      }
    }
  }
}
const DEFAULT_CONFIG_PROPS: {
  metadataUris: ForgeMetadataUriMap<typeof chains>
  contractAddresses: ForgeContractAddressMap<typeof chains>
} = {
  metadataUris: {
    [11155111]: { collectionsManager: 'https://pstlcollections.s3.eu-south-2.amazonaws.com/collections/' }
  },
  contractAddresses: {
    [11155111]: {
      collectionsManager: '0x00ad95f9D3E5Af8707700520FF3c45964Ef20423',
      mergeManager: '0x03b5d78E489b2bdF57Be8b1e2c0A5fFF369b030F'
    }
  }
}

export { THEME, WALLETCONNECT_TEST_ID as wcId, DEFAULT_PROPS as commonProps, DEFAULT_CONFIG_PROPS as contractProps }
