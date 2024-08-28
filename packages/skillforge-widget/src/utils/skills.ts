import { SkillMetadata, SupportedForgeChainIds, ipfsToImageUri } from '@past3lle/forge-web3'
import { MediaWidths, urlToSimpleGenericImageSrcSet } from '@past3lle/theme'
import { GenericImageSrcSet } from '@past3lle/types'

import { SHOP_URL } from '../constants'

type MetadataExplorerUris = 'opensea'

export function buildSkillMetadataExplorerUri(
  uri: MetadataExplorerUris,
  skill: SkillMetadata | undefined,
  chainId: SupportedForgeChainIds | undefined
) {
  if (!skill || !chainId) return ''
  switch (uri) {
    case 'opensea': {
      const networkName = chainIdToOpenseaNetworkName(chainId)
      return `https://opensea.io/assets/${networkName}/${skill.properties.id.split('-')[0]}`
    }
    default:
      return ''
  }
}

function chainIdToOpenseaNetworkName(chainId: SupportedForgeChainIds) {
  switch (chainId) {
    case 11155111:
      return 'sepolia'
    case 137:
      return 'matic'
    case 80002:
      return 'mumbai'
    default:
      return ''
  }
}

// TODO: this fn should be local to the project using SkillForge Widget
const STORE_URL = process.env.NODE_ENV === 'production' ? SHOP_URL : SHOP_URL || 'http://localhost:8080'
const REFERALL_PARAM = 'referral=FORGE'
export function getSkillShopUri(activeSkill: SkillMetadata): { url: string; type: 'PRODUCT' | 'COLLECTION' } | null {
  const isCollectionSkill =
    !!activeSkill?.properties?.isCollection || activeSkill?.properties?.id?.split('-')[1] === '0000'
  // skill has incorrect metadata, return null
  if (!isCollectionSkill && !activeSkill?.properties?.shopifyId) return null
  // skill is a collection, return collection view page
  else if (isCollectionSkill)
    return { url: `${STORE_URL}?${REFERALL_PARAM}&id=${activeSkill.properties.shopifyId}`, type: 'COLLECTION' }
  // skill is a collection skillpoint, return skill product view page
  return {
    url: `${STORE_URL}/skills/${(
      activeSkill?.attributes?.handle || activeSkill.name
    ).toLowerCase()}?${REFERALL_PARAM}&id=${activeSkill.properties.shopifyId}`,
    type: 'PRODUCT'
  }
}

export function getBestAvailableSkillImage(
  skill: SkillMetadata,
  preferredSize: 'full' | 250 | 500 | 750 | 'ipfs',
  options: {
    skipIpfs: true
    gatewayUris?: string[]
  }
): string
export function getBestAvailableSkillImage(
  skill: SkillMetadata,
  preferredSize: 'full' | 250 | 500 | 750 | 'ipfs',
  options?: {
    skipIpfs?: boolean
    gatewayUris?: string[]
  }
): string | GenericImageSrcSet<MediaWidths> | undefined {
  switch (preferredSize) {
    case 'full':
      return (
        skill?.image ||
        (!options?.skipIpfs && _ipfsUriToImageUri(skill?.imageIpfs, options?.gatewayUris)) ||
        skill?.image750 ||
        skill?.image500 ||
        skill?.image250
      )
    case 'ipfs':
      return (
        (!options?.skipIpfs && _ipfsUriToImageUri(skill?.imageIpfs, options?.gatewayUris)) ||
        skill?.image ||
        skill?.image750 ||
        skill?.image500 ||
        skill?.image250
      )
    case 750:
      return (
        skill?.image750 ||
        skill?.image ||
        (!options?.skipIpfs && _ipfsUriToImageUri(skill?.imageIpfs, options?.gatewayUris)) ||
        skill?.image500 ||
        skill?.image250
      )
    case 500:
      return (
        skill?.image500 ||
        skill?.image750 ||
        skill?.image ||
        (!options?.skipIpfs && _ipfsUriToImageUri(skill?.imageIpfs, options?.gatewayUris)) ||
        skill?.image250
      )
    case 250:
      return (
        skill?.image250 ||
        skill?.image500 ||
        skill?.image750 ||
        skill?.image ||
        (!options?.skipIpfs ? _ipfsUriToImageUri(skill?.imageIpfs, options?.gatewayUris) : undefined)
      )
    default:
      return undefined
  }
}

function _ipfsUriToImageUri(ipfsUri: string | undefined, gatewayUris: string[] = []) {
  if (!ipfsUri) return undefined
  return urlToSimpleGenericImageSrcSet(ipfsToImageUri(ipfsUri, ...gatewayUris.slice(1)))
}
