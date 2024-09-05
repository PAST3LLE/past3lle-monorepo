import { ErrorBoundary } from '@past3lle/components'
import { ThemeProvider } from '@past3lle/theme'
import { devWarn } from '@past3lle/utils'
import React, { Suspense, lazy, memo, useEffect, useMemo } from 'react'
import { useSnapshot } from 'valtio'

import { RouterCtrl } from '../../controllers'
import { FlattenedUserConfigCtrlState } from '../../controllers/types'
import { useMergeThemes, usePstlWeb3Modal, usePstlWeb3ModalStore } from '../../hooks'
import { LoadingScreen, LoadingScreenProps } from '../LoadingScreen'
import { ConnectionApproval } from './ConnectionApproval'
import { BaseModal } from './common'
import { BaseModalProps, ModalId, StatelessBaseModalProps } from './common/types'

const AccountModal = lazy(() => import(/* webpackPrefetch: true,  webpackChunkName: "AccountModal" */ './AccountModal'))
const ConnectionModal = lazy(
  () => import(/* webpackPrefetch: true,  webpackChunkName: "ConnectionModal" */ './ConnectionModal')
)
const ErrorModal = lazy(() => import(/* webpackPrefetch: true,  webpackChunkName: "ErrorModal" */ './ErrorModal'))
const NetworkModal = lazy(() => import(/* webpackPrefetch: true,  webpackChunkName: "NetworkModal" */ './NetworkModal'))
const HidDeviceOptionsModal = lazy(
  () => import(/* webpackPrefetch: true,  webpackChunkName: "HidDeviceOptionsModal" */ './HidDeviceOptionsModal')
)
const ConfigTypeModal = lazy(
  () => import(/* webpackPrefetch: true,  webpackChunkName: "ConfigTypeModal" */ './ConfigTypeModal')
)
const TransactionsModal = lazy(
  () => import(/* webpackPrefetch: true,  webpackChunkName: "TransactionsModal" */ './TransactionsModal')
)

type Modals = {
  Modal: ((props: FlattenedUserConfigCtrlState & Pick<BaseModalProps, 'errorOptions'>) => React.ReactNode) | null
  modalProps: StatelessBaseModalProps | undefined
  userConfigProps: FlattenedUserConfigCtrlState | undefined
}

const MODAL_SIZES = {
  LIST_WIDTH: '55vh',
  LIST_MAX_WIDTH: '400px',
  LIST_MAX_HEIGHT: '600px',
  GRID_WIDTH: '650px',
  GRID_MAX_WIDTH: '100%',
  GRID_MAX_HEIGHT: '550px'
}

export function ModalWithoutThemeProvider(baseProps: Omit<StatelessBaseModalProps, 'modal'>) {
  const modalState = usePstlWeb3Modal()
  const {
    callbacks: {
      error: { reset: resetError }
    },
    state: {
      modal: { error },
      userOptions
    }
  } = usePstlWeb3ModalStore()
  const view = useSnapshot(RouterCtrl.state).view

  // Reset all error state on view change
  useEffect(resetError, [resetError, view])

  const flattenedUserConfigState = useMemo(
    () => ({
      ...userOptions.connectors,
      ...userOptions.ui,
      ...userOptions.ux
    }),
    [userOptions.connectors, userOptions.ui, userOptions.ux]
  )

  const { Modal, modalProps } = useMemo((): Omit<Modals, 'userConfigProps'> => {
    switch (view) {
      case 'Account': {
        const modalProps: StatelessBaseModalProps = {
          ...baseProps,
          title: baseProps?.headers?.account || 'ACCOUNT',
          width: MODAL_SIZES.GRID_WIDTH,
          maxWidth: 'unset',
          maxHeight: 'unset',
          height: 'auto',
          id: ModalId.ACCOUNT,
          modal: 'account'
        }

        return { Modal: AccountModal, modalProps }
      }

      case 'SwitchNetwork':
      case 'SelectNetwork': {
        const modalProps: StatelessBaseModalProps = {
          ...baseProps,
          title: baseProps?.headers?.networks || 'NETWORK',
          width: MODAL_SIZES.GRID_WIDTH,
          maxWidth: '80vw',
          minHeight: '350px',
          maxHeight: '80vh',
          height: 'auto',
          id: ModalId.NETWORK,
          modal: 'connection'
        }

        return { Modal: NetworkModal, modalProps }
      }

      case 'HidDeviceOptions': {
        const modalProps: StatelessBaseModalProps = {
          ...baseProps,
          title: 'HID DEVICE OPTIONS',
          width: MODAL_SIZES.GRID_WIDTH,
          maxWidth: '80vw',
          maxHeight: '80vh',
          height: 'auto',
          id: ModalId.HID_DEVICE_OPTIONS,
          modal: 'hidDevice'
        }

        return { Modal: HidDeviceOptionsModal, modalProps }
      }

      case 'ConnectorConfigType': {
        const modalProps: StatelessBaseModalProps = {
          ...baseProps,
          title: 'Select configuration type',
          width: MODAL_SIZES.GRID_WIDTH,
          maxWidth: '80vw',
          // minHeight: '350px',
          maxHeight: '80vh',
          height: 'auto',
          id: ModalId.NETWORK,
          modal: 'connection'
        }

        return { Modal: ConfigTypeModal, modalProps }
      }

      case 'ConnectionApproval': {
        return {
          Modal: ConnectionApproval,
          modalProps: {
            ...baseProps,
            title: 'APPROVE CONNECTION',
            width:
              baseProps.width || flattenedUserConfigState?.walletsView === 'grid'
                ? MODAL_SIZES.GRID_WIDTH
                : MODAL_SIZES.LIST_WIDTH,
            maxWidth:
              baseProps.maxWidth || flattenedUserConfigState?.walletsView === 'grid'
                ? MODAL_SIZES.GRID_MAX_WIDTH
                : MODAL_SIZES.LIST_MAX_WIDTH,
            maxHeight:
              baseProps.maxHeight || flattenedUserConfigState?.walletsView === 'grid'
                ? MODAL_SIZES.GRID_MAX_HEIGHT
                : MODAL_SIZES.LIST_MAX_HEIGHT,
            id: ModalId.NETWORK,
            modal: 'connection'
          }
        }
      }

      case 'Transactions': {
        const modalProps: StatelessBaseModalProps = {
          ...baseProps,
          title: 'TRANSACTIONS',
          width: MODAL_SIZES.GRID_WIDTH,
          maxWidth: '95vw',
          minHeight: '70%',
          id: ModalId.TRANSACTIONS,
          modal: 'transactions'
        }

        return {
          modalProps,
          Modal: TransactionsModal
        }
      }

      case 'ConnectWallet':
      default: {
        const modalProps: StatelessBaseModalProps = {
          ...baseProps,
          title: baseProps?.headers?.wallets || baseProps?.title || 'CONNECT',
          width:
            baseProps.width || flattenedUserConfigState?.walletsView === 'grid'
              ? MODAL_SIZES.GRID_WIDTH
              : MODAL_SIZES.LIST_WIDTH,
          maxWidth:
            baseProps.maxWidth || flattenedUserConfigState?.walletsView === 'grid'
              ? MODAL_SIZES.GRID_MAX_WIDTH
              : MODAL_SIZES.LIST_MAX_WIDTH,
          maxHeight:
            baseProps.maxHeight || flattenedUserConfigState?.walletsView === 'grid'
              ? MODAL_SIZES.GRID_MAX_HEIGHT
              : MODAL_SIZES.LIST_MAX_HEIGHT,
          minHeight: 'unset',
          id: ModalId.WALLETS,
          modal: 'connection'
        }

        return {
          Modal: (props) => <ConnectionModal {...props} chainIdFromUrl={baseProps.chainIdFromUrl} />,
          modalProps
        }
      }
    }
  }, [baseProps, flattenedUserConfigState?.walletsView, view])

  if (!modalProps || !Modal) return null

  return (
    <BaseModal {...baseProps} {...modalProps} isOpen={modalState.isOpen} onDismiss={modalState.close}>
      <Suspense fallback={<Fallback {...baseProps.loaderProps} />}>
        <ErrorBoundary fallback={<ErrorModal />}>
          {<Modal {...flattenedUserConfigState} errorOptions={{ error: error ?? null }} />}
        </ErrorBoundary>
      </Suspense>
    </BaseModal>
  )
}

const Fallback = (props: Omit<LoadingScreenProps, 'loadingText'>) => (
  <LoadingScreen {...props} loadingText="LOADING. . ." />
)

function ModalWithThemeProvider({ themeConfig, ...modalProps }: Omit<StatelessBaseModalProps, 'modal'>) {
  const builtTheme = useMergeThemes(themeConfig?.theme)

  if (!builtTheme) {
    devWarn('[@past3lle/web3-modal::ConnectionModal] No theme detected!')
    return null
  }

  return (
    <ThemeProvider theme={builtTheme} mode={themeConfig?.mode}>
      <ModalWithoutThemeProvider {...modalProps} />
    </ThemeProvider>
  )
}

const PstlWeb3Modal = memo(ModalWithThemeProvider)

export { PstlWeb3Modal }
