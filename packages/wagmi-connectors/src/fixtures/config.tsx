import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { ReactNode } from 'react'
import { http } from 'viem'
import { WagmiProvider, createConfig } from 'wagmi'

import { ledgerHid } from '../ledgerHid'
import { chains } from './chains'
import { wagmiConnectors } from './connectorsAndPlugins'

const queryClient = new QueryClient()

interface WagmiProviderProps {
  children: ReactNode
}
if (!process.env.REACT_APP_WEB3AUTH_DEVNET_CLIENT_ID) {
  throw new Error('MISSING process.env.REACT_APP_WEB3AUTH_DEVNET_CLIENT_ID')
}
const WAGMI_CLIENT = createConfig({
  chains,
  connectors: [
    ledgerHid({ shimDisconnect: true }),
    wagmiConnectors.ledgerLive({}),
    wagmiConnectors.iframe({}),
    wagmiConnectors.web3auth({
      projectId: process.env.REACT_APP_WEB3AUTH_DEVNET_CLIENT_ID as string,
      network: 'sapphire_devnet',
      uiConfig: {
        appName: 'SKILLFORGE TEST',
        logoLight: '',
        logoDark: ''
      },
      uxMode: 'popup',
      preset: 'DISALLOW_EXTERNAL_WALLETS'
    })
  ],
  transports: {
    1: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY as string}`),
    11155111: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY as string}`),
    137: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY as string}`),
    80002: http(`https://polygon-amoy.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY as string}`)
  }
})
const CosmosWagmiProvider = ({ children }: WagmiProviderProps) => {
  return (
    <WagmiProvider config={WAGMI_CLIENT}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export { CosmosWagmiProvider }
