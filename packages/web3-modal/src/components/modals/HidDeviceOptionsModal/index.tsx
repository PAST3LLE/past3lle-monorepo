import { Column, InfoCircle, MouseoverTooltip, Row, SpinnerCircle, useSelect } from '@past3lle/components'
import { useIsExtraSmallMediaWidth } from '@past3lle/hooks'
import { BLACK_TRANSPARENT, OFF_WHITE, setBestTextColour, transparentize } from '@past3lle/theme'
import { truncateAddress } from '@past3lle/utils'
import React, { memo, useCallback, useState } from 'react'
import { useTheme } from 'styled-components'
import { useSwitchChain } from 'wagmi'

import { KEYS } from '../../../constants/localstorage'
import { useGetChainIconCallback, usePstlWeb3Modal, useUserConnectionInfo } from '../../../hooks'
import { LoadingScreen } from '../../LoadingScreen'
import { MissingChainIcon } from '../../MissingChainIcon'
import { AccountText, FooterActionButtonsRow } from '../AccountModal/styled'
import { ConnectorOption } from '../ConnectionModal/ConnectorOption'
import { ModalButton } from '../common/styled'
import { BaseModalProps, ModalId } from '../common/types'
import { LedgerHidConnector, useHidModalPath, useHidModalStore, useHidUpdater } from './hooks'
import {
  HidDeviceContainer,
  HidModalAddressPlaceholder,
  HidModalAddresseRow,
  HidModalAddressesList,
  HidModalContainer,
  HidModalHeaderRow,
  HidModalTextInput,
  HidModalWalletsWrapper,
  HighlightedModalText,
  ModalHeaderText,
  ModalSubHeaderText,
  PathSelectAndInputContainer,
  UnderlinedModalTextCTA
} from './styleds'

const SUPPORTED_BIP_DERIVATION_PATHS = [
  // Ledger Live
  "m/44'/60'/*'/0/0",
  // Ledger Legacy
  "m/44'/60'/*'/0",
  // BIP44 Standard
  "m/44'/60'/0'/0/*"
] as const

type PstlHidDeviceModalProps = Pick<BaseModalProps, 'errorOptions'>

const PAGINATION_AMT = 5
const CHAIN_IMAGE_STYLES = { width: 20, height: 20, marginLeft: 7, borderRadius: '30%' }

const DEFAULT_PATH = localStorage.getItem(KEYS.HID_DERIVATION_PATH) ?? SUPPORTED_BIP_DERIVATION_PATHS[0]
const DISABLED_SELECTOR_COLOR = 'darkgrey'

function HidDeviceOptionsContent({ errorOptions }: PstlHidDeviceModalProps) {
  const { close } = usePstlWeb3Modal()

  const { address, chain, chainId, supportedChains } = useUserConnectionInfo()

  const getChainLogo = useGetChainIconCallback()
  const currChainLogo = getChainLogo(chainId)

  const { switchChainAsync } = useSwitchChain()
  const [networkSwitchLocked, setNetworkSwitchLocked] = useState(false)
  const handleSwitchChain = useCallback(
    async (chainId: number) => {
      setNetworkSwitchLocked(true)
      switchChainAsync(
        { chainId },
        {
          onSettled: () => {
            setNetworkSwitchLocked(false)
          }
        }
      )
    },
    [switchChainAsync]
  )

  const { connector: hidConnector } = useUserConnectionInfo()
  const { dbPath, path, isCustomPath, ...pathCallbacks } = useHidModalPath(DEFAULT_PATH)

  const { accountsAndBalances, loading, loadedSavedConfig, paginationIdx, selectedAccountIdx, ...storeCallbacks } =
    useHidModalStore({
      path: dbPath,
      chainId,
      paginationAmount: PAGINATION_AMT,
      connector: hidConnector as LedgerHidConnector | undefined
    })

  const {
    Component: Selector,
    store: [selection, setSelection]
  } = useSelect<string | undefined>({
    options: isCustomPath ? [{ value: undefined, label: 'Custom path' }, ...SELECTOR_OPTIONS] : SELECTOR_OPTIONS,
    defaultValue: SELECTOR_OPTIONS[0].value,
    name: 'HID Derivation Paths',
    callback: (selection) => {
      pathCallbacks.setIsCustomPath(false)
      pathCallbacks.setPath(selection ?? null)
      storeCallbacks.resetAndConnectProvider(selection?.replace(/\*/g, selectedAccountIdx.toString()))
    }
  })

  // Update state on changes
  useHidUpdater({
    ...storeCallbacks,
    ...pathCallbacks,
    setSelection,
    chainId,
    dbPath,
    isCustomPath,
    loadedSavedConfig,
    selectedAccountIdx,
    derivationPaths: SUPPORTED_BIP_DERIVATION_PATHS
  })

  const { modals: theme } = useTheme()
  const isExtraSmallWidth = useIsExtraSmallMediaWidth()

  if (!loadedSavedConfig) return <LoadingScreen loadingText="Loading user HID device config..." />

  return (
    <HidDeviceContainer width="100%" layout="Other" overflowY="auto">
      <HidModalContainer>
        <Column flex="0 1 auto" width="100%">
          {hidConnector && (
            <Column maxHeight={115} height="auto">
              <AccountText node="main">
                Network:{' '}
                <ModalSubHeaderText
                  node="subHeader"
                  display="inline-flex"
                  justifyContent={'center'}
                  alignItems="center"
                  fontSize="1em"
                >
                  {chain?.name || chain?.id || 'disconnected'}{' '}
                  {currChainLogo ? (
                    <img src={currChainLogo} style={CHAIN_IMAGE_STYLES} />
                  ) : (
                    <MissingChainIcon style={CHAIN_IMAGE_STYLES} />
                  )}
                </ModalSubHeaderText>
              </AccountText>
              <HidModalWalletsWrapper modal="connection" node="main" view="grid" width="auto">
                {supportedChains.map((sChain) => {
                  if (!switchChainAsync || chain?.id === sChain.id) return null
                  const chainLogo = getChainLogo(sChain.id)
                  return (
                    <ConnectorOption
                      disabled={networkSwitchLocked}
                      // keys & ids
                      optionType="chain"
                      optionValue={sChain.id}
                      key={sChain.id}
                      // data props
                      callback={() => handleSwitchChain(sChain.id)}
                      modalView={'grid'}
                      connected={false}
                      label={sChain.name}
                      icon={chainLogo ? <img src={chainLogo} /> : <MissingChainIcon />}
                    />
                  )
                })}
              </HidModalWalletsWrapper>
            </Column>
          )}
          <Row justifyContent="flex-start" gap="10px" style={{ zIndex: 1 }} title="derivation-path">
            <ModalHeaderText id={`${ModalId.HID_DEVICE_OPTIONS}__derivation-path-header`} node="header">
              Select a derivation path
            </ModalHeaderText>
          </Row>
          <Row id={`${ModalId.ACCOUNT}__balance-text`}>
            <ModalSubHeaderText node="subHeader">{!isExtraSmallWidth ? 'Current' : ''} Path:</ModalSubHeaderText>
            <HighlightedModalText
              color={setBestTextColour(theme?.hidDevice?.container?.alternate?.background || '#000', 4)}
            >
              {selection}
            </HighlightedModalText>
            <HighlightedModalText backgroundColor={isCustomPath ? '#8ac8d4' : 'lightgray'} color="#000">
              {isCustomPath ? 'CUSTOM' : 'PRESET'}
            </HighlightedModalText>
          </Row>
        </Column>
        {/* PATH SELECTOR / INPUT */}
        <PathSelectAndInputContainer
          flexWrap="wrap"
          gap="1rem"
          fontWeight={isCustomPath ? 100 : 300}
          marginTop={'1rem'}
          width="100%"
          css={
            isCustomPath
              ? `
                select {
                  color: ${transparentize(0.82, theme?.base?.font?.color || 'white')};
                }
              `
              : ''
          }
        >
          {/* PRESET */}
          <Column
            flex={`1 1 ${!isCustomPath ? 220 : 139}px`}
            padding="0.5rem"
            borderRadius={theme?.base?.input?.border?.radius}
            backgroundColor={!isCustomPath ? theme?.base?.background?.main : ''}
          >
            <ModalSubHeaderText
              fontSize="0.8em"
              marginBottom="0.25rem"
              node="subHeader"
              css={`
                white-space: nowrap;
              `}
            >
              PRESET PATH (recommended)
            </ModalSubHeaderText>
            <Selector arrowStrokeColor={isCustomPath ? DISABLED_SELECTOR_COLOR : 'ghostwhite'} arrowSize={30} />
          </Column>
          {/* CUSTOM */}
          <Row
            flex={`1 1 ${isCustomPath ? 350 : 146}px`}
            backgroundColor={isCustomPath ? theme?.base?.background?.main : ''}
            width="auto"
            minWidth={!isCustomPath ? '186px' : 'unset'}
            padding="0.5rem"
            borderRadius={theme?.base?.input?.border?.radius}
          >
            <Column width="100%">
              <ModalSubHeaderText fontSize="0.8em" marginBottom="0.25rem" node="subHeader">
                OR CUSTOM ETH PATH{' '}
                <MouseoverTooltip
                  text={
                    "Set your own ETH derivation path starting with m/44'/60'/ and add * indicating the index of user accounts. e.g m/44'/60'/*'/0/0"
                  }
                  placement="top"
                  styles={{
                    fontFamily: 'monospace, arial, system-ui',
                    fontSize: '0.75em',
                    color: theme?.base?.font?.color || OFF_WHITE,
                    border: 'none',
                    backgroundColor: theme?.base?.background?.main || BLACK_TRANSPARENT
                  }}
                >
                  <InfoCircle label="?" size={15} color="black" marginLeft="3px" />
                </MouseoverTooltip>
              </ModalSubHeaderText>
              <HidModalTextInput
                value={isCustomPath ? path ?? '' : ''}
                placeholder={"m/44'/60'/*'/0/0"}
                minWidth={isCustomPath ? '300px' : 'min-content'}
                fontWeight={isCustomPath ? 300 : 100}
                onChange={(e) => {
                  pathCallbacks.setIsCustomPath(true)
                  pathCallbacks.setPath(e.target.value)
                }}
              />
            </Column>
          </Row>
        </PathSelectAndInputContainer>
        {/* ADDRESSES TABLE / LIST */}
        <Column margin="1rem 0 0" width="100%">
          <Row justifyContent="flex-start" gap="10px" style={{ zIndex: 1 }} title="derivation-path">
            <ModalHeaderText id={`${ModalId.HID_DEVICE_OPTIONS}__select-account-header`} node="header">
              {isExtraSmallWidth ? 'Scan accounts' : 'Scan and select an account'}
            </ModalHeaderText>
          </Row>
          <Row id={`${ModalId.ACCOUNT}__balance-text`} flexWrap="wrap" gap="0 5px">
            <ModalSubHeaderText node="subHeader">Current Account:</ModalSubHeaderText>
            <HighlightedModalText
              fontWeight={500}
              backgroundColor={address ? undefined : theme?.base?.background?.error}
              color={setBestTextColour(
                (address ? theme?.hidDevice?.container?.main?.background : theme?.base?.background?.error) || '#000',
                4
              )}
            >
              {address ? truncateAddress(address) : 'DISCONNECTED'}
            </HighlightedModalText>
          </Row>
        </Column>
        <HidModalAddressesList width="100%" gap="0" margin="1rem 0" zIndex={errorOptions?.show ? 0 : 1}>
          <HidModalHeaderRow padding="0rem 0.25rem" marginBottom="0.25rem">
            <ModalSubHeaderText node="subHeader" as="strong">
              Address
            </ModalSubHeaderText>
            <ModalSubHeaderText node="subHeader" as="strong">
              Path
            </ModalSubHeaderText>
            <ModalSubHeaderText node="subHeader" as="strong">
              Balance
            </ModalSubHeaderText>
          </HidModalHeaderRow>
          {accountsAndBalances?.length ? (
            accountsAndBalances.map(({ address: acct, balance }, idx) => {
              const sPath = dbPath?.replace(/\*/g, idx.toString())
              return (
                <HidModalAddresseRow
                  key={idx + '_' + acct}
                  onClick={() => storeCallbacks.handleSelectAccount(sPath, idx)}
                  padding="0.15rem 0.25rem"
                >
                  <strong>{acct}</strong>
                  <strong>{sPath}</strong>
                  <strong>{balance || 0}</strong>
                </HidModalAddresseRow>
              )
            })
          ) : (
            <HidModalAddressPlaceholder padding="0.15rem 0.25rem">
              Click below to query accounts for this path
            </HidModalAddressPlaceholder>
          )}
        </HidModalAddressesList>
        {/* SHOW ACCOUNTS CTA */}
        <FooterActionButtonsRow
          marginTop={'1rem'}
          justifyContent={'space-evenly'}
          gap="2rem"
          style={{ zIndex: errorOptions?.show ? 0 : 1 }}
        >
          <ModalButton
            id={`${ModalId.HID_DEVICE_OPTIONS}__scan-button`}
            modal="account"
            node="main"
            justifyContent="center"
            height="auto"
            connected={false}
            padding="0.6rem"
            onClick={storeCallbacks.getAccounts}
            disabled={loading}
            minWidth="max-content"
          >
            {loading ? (
              <>
                Scanning... <SpinnerCircle />
              </>
            ) : paginationIdx === PAGINATION_AMT ? (
              'Scan Accounts'
            ) : (
              'Load more'
            )}
          </ModalButton>
          {address && (
            <UnderlinedModalTextCTA onClick={close}>
              or skip and use current:&nbsp;
              <span style={{ fontVariationSettings: "'wght' 500" }}>{truncateAddress(address)}</span>
            </UnderlinedModalTextCTA>
          )}
        </FooterActionButtonsRow>
      </HidModalContainer>
    </HidDeviceContainer>
  )
}

const SELECTOR_OPTIONS = [
  { value: SUPPORTED_BIP_DERIVATION_PATHS[0], label: 'Ledger Live - ' + SUPPORTED_BIP_DERIVATION_PATHS[0] },
  {
    value: SUPPORTED_BIP_DERIVATION_PATHS[1],
    label: 'Ledger Legacy - ' + SUPPORTED_BIP_DERIVATION_PATHS[1]
  },
  {
    value: SUPPORTED_BIP_DERIVATION_PATHS[2],
    label: 'BIP44 Standard - ' + SUPPORTED_BIP_DERIVATION_PATHS[2]
  }
]

// Exported as default for lazy import inside /components/modals/index.tsx
export default memo(HidDeviceOptionsContent)
