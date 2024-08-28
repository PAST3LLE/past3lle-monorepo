// WC STUFF
import { PstlWeb3ModalProps } from '@past3lle/web3-modal'
import { sepolia, mainnet } from 'viem/chains'

import { CONNECTORS_CONFIG } from './config/connectors'
import { CONNECTOR_DISPLAY_OVERRIDES, ROOT_CONFIG } from './config/root'
import { WALLETCONNECT_CONFIG } from './config/walletconnect'

export type SupportedChainIds = 1 | 11155111
const availableChains = [mainnet, sepolia] as const

export const pstlModalConfig: PstlWeb3ModalProps<typeof availableChains> = {
  appName: 'CHORUS MODAL TEST',
  chains: availableChains,
  connectors: { connectors: CONNECTORS_CONFIG, overrides: CONNECTOR_DISPLAY_OVERRIDES },
  modals: {
    root: ROOT_CONFIG,
    walletConnect: WALLETCONNECT_CONFIG
  }
}
