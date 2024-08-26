import { SupportedNetworks } from '../types/networks'

export const networksToChainId: { [Network in SupportedNetworks]: number } = {
  [SupportedNetworks.MAINNET]: 1,
  [SupportedNetworks.SEPOLIA]: 11155111,
  [SupportedNetworks.MATIC]: 137,
  [SupportedNetworks.POLYGON]: 137,
  [SupportedNetworks.AMOY]: 80002
}
