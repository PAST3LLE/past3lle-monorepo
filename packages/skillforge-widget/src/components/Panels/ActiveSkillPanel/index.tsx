import { AutoRow, Row, RowCenter, StyledLink, Text } from '@past3lle/components'
import {
  SkillLockStatus,
  useDeriveSkillState,
  useForgeBalancesReadAtom,
  useForgeMetadataMapReadAtom,
  useForgeUserConfigAtom,
  useSupportedOrDefaultChainId
} from '@past3lle/forge-web3'
import { useIsSmallMediaWidth } from '@past3lle/hooks'
import { BLACK, OFF_WHITE } from '@past3lle/theme'
import { darken } from 'polished'
import React, { useMemo, useRef } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components'

import { useQueryImageBlob } from '../../.../../../hooks/useQueryImageBlob'
import { SKILLPOINTS_CONTAINER_ID } from '../../../constants/skills'
import { useGetActiveSkill } from '../../../hooks/skills'
import { baseTheme } from '../../../theme/base'
import { buildSkillMetadataExplorerUri } from '../../../utils/skills'
import { BlackHeader, MonospaceText } from '../../Common/Text'
import { Skillpoint } from '../../Skillpoint'
import { SidePanel } from '../BaseSidePanel'
import { MAIN_COLOR } from '../BaseSidePanel/styleds'
import { SkillsRow } from '../common'
import { SkillActionButton } from './SkillActionButton'
import { ActiveSkillPanelContainer, RequiredDepsContainer, SkillRarityLabel, SkillStatusLabel } from './styleds'
import { getLockStatusColour, getSkillDescription } from './utils'

const SkillPanelSkillpoint = styled(Skillpoint)<{ disabled?: boolean }>`
  box-shadow: unset;
  > ${RowCenter} {
    width: 100%;
    height: 100%;
    > img {
      border-radius: 10px;
      max-height: 100%;
      max-width: none;
    }
  }
`

export function ActiveSkillPanel() {
  const chainId = useSupportedOrDefaultChainId()
  const [userConfig] = useForgeUserConfigAtom()

  const [metadataMap] = useForgeMetadataMapReadAtom(chainId)
  const activeSkillState = useGetActiveSkill(chainId)
  const [balances] = useForgeBalancesReadAtom()

  const activeSkill = activeSkillState?.[0]
  const setSkillState = activeSkillState?.[1]

  const lockStatus = useDeriveSkillState(activeSkill)
  const isLocked = lockStatus === SkillLockStatus.LOCKED || lockStatus === SkillLockStatus.UNLOCKABLE_IN_TRADE
  const isOwned = lockStatus === SkillLockStatus.OWNED

  const description = useMemo(() => getSkillDescription(activeSkill, lockStatus), [activeSkill, lockStatus])

  const { assetsMap, ...customTheme } = useTheme()

  const { rarity, deps, cardColour, metadataExplorerUri } = useMemo(
    () => ({
      metadataExplorerUri: buildSkillMetadataExplorerUri('opensea', activeSkill, chainId),
      rarity: activeSkill?.properties?.rarity || 'common',
      deps: activeSkill?.properties?.dependencies || [],
      get cardColour() {
        return isLocked
          ? baseTheme.gradients.lockedSkill || BLACK
          : this.rarity
          ? baseTheme.gradients.unlockedSkill + `${customTheme.rarity[this.rarity].backgroundColor})`
          : null
      }
    }),
    [activeSkill, chainId, customTheme.rarity, isLocked]
  )

  const skillContainerRef = useRef<HTMLElement>(
    typeof globalThis?.window?.document !== 'undefined' ? document.getElementById(SKILLPOINTS_CONTAINER_ID) : null
  )

  const isSmallMediaWidth = useIsSmallMediaWidth()
  const { data: bgImageUri } = useQueryImageBlob(
    isSmallMediaWidth
      ? activeSkill?.attributes?.forge?.activePanelBgUriMobile
      : activeSkill?.attributes?.forge?.activePanelBgUriWeb
  )
  const sidePanelOptions = useMemo(
    () => ({
      onClickOutsideConditionalCb: (targetNode: Node) => !!skillContainerRef?.current?.contains(targetNode),
      backgroundImageOptions: {
        smartImg: bgImageUri
          ? {
              uri: bgImageUri,
              options: { filter: activeSkill?.attributes?.forge?.activePanelBgFilter }
            }
          : undefined
      }
    }),
    [activeSkill?.attributes?.forge?.activePanelBgFilter, bgImageUri]
  )

  if (!metadataExplorerUri || !activeSkill || !rarity || !deps || !cardColour || !setSkillState) return null

  return (
    <SidePanel
      header={activeSkill?.name || 'Unknown'}
      styledProps={{
        background: 'black',
        padding: '2.5rem 0 4rem 0'
      }}
      options={sidePanelOptions}
      onDismiss={() => setSkillState((state) => ({ ...state, active: [] }))}
      onBack={() => setSkillState((state) => ({ ...state, active: state.active.slice(1) }))}
    >
      <ActiveSkillPanelContainer gap="1rem">
        <Row justifyContent={'center'} margin="0">
          <Text.SubHeader fontSize={'2.5rem'} fontWeight={200} color={MAIN_COLOR}>
            {description}
          </Text.SubHeader>
        </Row>
        <Row
          id="skill-image-and-store-button"
          justifyContent={'space-around'}
          marginBottom="12%"
          flexWrap={'wrap'}
          gap="3.5rem 4rem"
        >
          <SkillPanelSkillpoint
            className={isLocked ? 'disabled' : ''}
            forceRarity="empty"
            metadata={activeSkill}
            hasSkill={!isLocked}
            skillpointStyles={{
              height: '250px',
              width: '250px',
              flex: '0 1 250px',
              padding: '0',
              backgroundColor: 'transparent',
              justifyContent: 'center',
              disabled: !!isLocked
            }}
          />
          <SkillActionButton skill={activeSkill} lockStatus={lockStatus} metadataExplorerUri={metadataExplorerUri} />
        </Row>
        <Row alignSelf="flex-start" width="100%" justifyContent={'center'} gap="1rem">
          <SkillStatusLabel
            bgColour={getLockStatusColour(lockStatus, customTheme as DefaultTheme)}
            fgColour={lockStatus !== SkillLockStatus.OWNED ? BLACK : 'white'}
            fontWeight={800}
            borderRadius="0.3rem"
            letterSpacing={-2.2}
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            textShadow={lockStatus !== SkillLockStatus.OWNED ? '1px 1px 1px #000000ba' : '-1px 2px 1px #f13d7d7d'}
          >
            {lockStatus === SkillLockStatus.UNLOCKABLE_IN_STORE || lockStatus === SkillLockStatus.UNLOCKABLE_IN_TRADE
              ? 'UNLOCKABLE'
              : lockStatus + '!'}
          </SkillStatusLabel>
          <SkillRarityLabel
            backgroundColor={darken(0.02, customTheme.rarity[rarity].backgroundColor)}
            color={OFF_WHITE}
            fontWeight={100}
            borderRadius="0.3rem"
            flex={1}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            style={{ gap: '0.3rem' }}
            height="100%"
            textShadow={`1px 1px 1px ${darken(0.3, customTheme.rarity[rarity].backgroundColor)}`}
          >
            <img src={assetsMap.icons.rarity[rarity]} style={{ maxWidth: '3rem' }} />
            <strong>{rarity?.toLocaleUpperCase()}</strong>
          </SkillRarityLabel>
        </Row>
        {!isOwned && deps.length > 0 && (
          <RequiredDepsContainer
            overflow={'visible'}
            marginBottom={'2rem'}
            background="linear-gradient(90deg, black, transparent 80%)"
          >
            <BlackHeader
              color={MAIN_COLOR}
              fontSize={'2.5rem'}
              fontWeight={300}
              margin="0"
              padding="1rem 1rem 0.25rem 1rem"
            >
              REQUIRED TO UNLOCK
            </BlackHeader>
            <SkillsRow balances={balances} deps={deps} metadataMap={metadataMap} />
          </RequiredDepsContainer>
        )}
        {((!isLocked && !deps.length) || isOwned) && chainId && (
          <AutoRow>
            <MonospaceText color={MAIN_COLOR}>
              View on{' '}
              <StyledLink href={metadataExplorerUri}>
                {' '}
                <strong style={{ color: baseTheme.mainBg }}>OpenSea</strong>{' '}
              </StyledLink>{' '}
            </MonospaceText>
          </AutoRow>
        )}
        {userConfig?.contentUrls?.claiming && (
          <Row marginTop={'4rem'}>
            <MonospaceText>
              Checkout this{' '}
              <StyledLink href={userConfig.contentUrls.claiming}>
                {' '}
                <strong style={{ color: baseTheme.mainBg }}>tutorial</strong>{' '}
              </StyledLink>{' '}
              to understand how to claim skills!
            </MonospaceText>
          </Row>
        )}
      </ActiveSkillPanelContainer>
    </SidePanel>
  )
}
