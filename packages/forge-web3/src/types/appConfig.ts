import { UseWindowSizeOptions } from '@past3lle/hooks'
import { PstlWeb3ModalProps } from '@past3lle/web3-modal'

import { FORGE_SUPPORTED_CHAINS } from '../constants/chains'
import { UserConfigState } from '../state'
import { MetadataFetchOptions as ForgeMetadataFetchOptions } from '../state/Metadata/updaters/MetadataUpdater'
import { ForgeContractAddressMap } from './addresses'
import { ForgeMetadataUriMap } from './metadata'

export { type ForgeMetadataFetchOptions }
export interface ForgeW3AppConfigSkillOptions {
  metadataFetchOptions?: ForgeMetadataFetchOptions
}
export type ForgeChainsMinimum = readonly [
  (typeof FORGE_SUPPORTED_CHAINS)[number],
  ...(typeof FORGE_SUPPORTED_CHAINS)[number][]
]
export type Web3ModalConfigWeb3Props<forgeChains extends ForgeChainsMinimum> = Omit<
  PstlWeb3ModalProps<forgeChains>,
  'appName'
> & {
  standalone?: boolean
}
interface Options {
  windowSizeOptions: UseWindowSizeOptions
}
export interface ForgeW3AppConfig<forgeChains extends ForgeChainsMinimum> {
  name: string
  /**
   * @name boardOptions - properties:
   * @param minimumColumns default: 3
   * @param minimumBoardHeight default: 500
   * @param minimumBoardWidth default: 580
   * @param emptyCollectionRowAmount default: 6
   */
  boardOptions?: Partial<UserConfigState['board']>
  contactInfo: UserConfigState['user']['contactInfo']
  contentUrls?: UserConfigState['contentUrls']
  web3: Web3ModalConfigWeb3Props<forgeChains>
  /**
   * @name contractAddresses - mapping of network IDs to deployed CollectionsManager.sol addresses
   * @example
   * contractAddresses: {
   *  [SupportedForgeChainIds.SEPOLIA]: {
   *    CollectionsManager: "0x123123123123123123_SepoliaAddress"
   *  },
   * [SupportedForgeChainIds.POLYGON]: {
   *    CollectionsManager: "0x123123123123123123_PolyAddress"
   *  },
   *  [SupportedForgeChainIds.POLYGON]: "https://some.polygon.metadata.uri"
   * }
   */
  contractAddresses: ForgeContractAddressMap<forgeChains>
  /**
   * @name metadataUris - mapping of network IDs to CollectionsManager.sol metadata
   * @example
   * metadataUris: {
   *  [SupportedForgeChainIds.SEPOLIA]: "https://some.metadata.uri",
   *  [SupportedForgeChainIds.POLYGON]: "https://some.polygon.metadata.uri"
   * }
   */
  metadataUris: ForgeMetadataUriMap<forgeChains>
  skillOptions?: ForgeW3AppConfigSkillOptions
  options?: Options
}
