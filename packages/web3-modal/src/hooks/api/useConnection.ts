import { useIsSmallMediaWidth } from '@past3lle/hooks'
// import { useWeb3Modal as useWeb3ModalBase } from '@web3modal/react'
import { useCallback } from 'react'
import { Address, Chain } from 'viem'
import {
  Connector,
  UseConnectParameters,
  UseConnectReturnType,
  UseConnectorsReturnType,
  UseDisconnectParameters,
  UseDisconnectReturnType,
  useAccount,
  useBalance,
  useConfig,
  useConnect as useConnectWagmi,
  useDisconnect as useDisconnectWagmi
} from 'wagmi'

import { useConnectDisconnectEffects } from '../internal/useConnectDisconnectEffects'
// import { OpenOptions } from '../../controllers'
import { useAllWeb3Modals } from './useAllWeb3Modals'
import { usePstlWeb3Modal } from './usePstlWeb3Modal'
import { usePstlWeb3ModalStore } from './usePstlWeb3ModalStore'

type Callbacks = Pick<ReturnType<typeof useDisconnectWagmi>, 'disconnect'> & {
  // openWalletConnectModal: ReturnType<typeof useWeb3Modal>['open']
  // closeWalletConnectModal: ReturnType<typeof useWeb3Modal>['close']
  openRootModal: ReturnType<typeof usePstlWeb3Modal>['open']
  closeRootModal: ReturnType<typeof usePstlWeb3Modal>['close']
  onNetworkClick: () => Promise<void>
  onAccountClick: () => Promise<void>
  connect: UseConnectorsReturnType[0]['connect']
}

type ConnectConfig = UseConnectParameters
type DisconnectConfig = UseDisconnectParameters

type UseConnectDisconnectProps = {
  connect?: ConnectConfig
  disconnect?: DisconnectConfig
}
export function useConnectDisconnect(props?: UseConnectDisconnectProps): {
  connect: UseConnectReturnType
  disconnect: UseDisconnectReturnType
} {
  const connectReturn = useConnectWagmi(props?.connect)
  const disconnectReturn = useDisconnectWagmi(props?.disconnect)

  useConnectDisconnectEffects({
    connect: { returnData: connectReturn, mutation: props?.connect?.mutation },
    disconnect: { returnData: disconnectReturn, mutation: props?.disconnect?.mutation }
  })

  return {
    connect: connectReturn,
    disconnect: disconnectReturn
  }
}

export function useUserConnectionInfo() {
  const { chains } = useConfig()
  const { address, chain, chainId, connector, isConnected, isConnecting, isDisconnected, isReconnecting } = useAccount()
  const {
    state: {
      userOptions: { ui }
    }
  } = usePstlWeb3ModalStore()
  const balance = useBalance({
    address,
    chainId,
    query: {
      // TODO: fix when wagmi decides what to do about this structural sharing bug
      // * involving BigInt serialisation errors and structural sharing
      // * see https://github.com/wevm/wagmi/issues/4233
      structuralSharing: false
    }
  })
  const { connectors } = useConnectWagmi()

  return {
    address,
    connector,
    connectors,
    isConnected,
    isConnecting,
    isDisconnected,
    isReconnecting,
    chain,
    chainId,
    supportedChains: ui.softLimitedChains || chains,
    balance
  }
}

// export function useWeb3Modal(): ReturnType<typeof useWeb3ModalBase> {
//   const baseApi = useWeb3ModalBase()
//   const modalStore = usePstlWeb3ModalStore()

//   return useMemo(() => {
//     return {
//       isOpen: baseApi.isOpen,
//       setDefaultChain: baseApi.setDefaultChain,
//       close: () => {
//         // Re-enable root modal's trap scroll locking
//         modalStore.callbacks.userOptions.set({
//           ux: {
//             bypassScrollLock: false
//           }
//         })
//         return baseApi.close()
//       },
//       open: (options?: OpenOptions) => {
//         // Disable root modal's scroll lock
//         // And allow walletconnect to scroll internally
//         modalStore.callbacks.userOptions.set({
//           ux: {
//             bypassScrollLock: true
//           }
//         })
//         return baseApi.open(options)
//       }
//     }
//   }, [baseApi, modalStore])
// }

export function useAccountNetworkActions() {
  const { address, chain } = useUserConnectionInfo()
  const { root } = useAllWeb3Modals()

  const isMobileWidth = useIsSmallMediaWidth()

  const onNetworkClick = useCallback(async () => {
    return root.open({
      route: (chain?.id && address) || !isMobileWidth ? 'SelectNetwork' : 'ConnectWallet'
    })
  }, [chain?.id, root, isMobileWidth])

  const onAccountClick = useCallback(async () => {
    return root.open({ route: chain?.id && address ? 'Account' : 'ConnectWallet' })
  }, [chain?.id, root])

  return {
    onAccountClick,
    onNetworkClick
  }
}

export function useModalActions() {
  const { root } = useAllWeb3Modals()
  const { chain } = useUserConnectionInfo()

  const onTransactionsClick = useCallback(async () => {
    return root.open({ route: chain?.id ? 'Transactions' : 'ConnectWallet' })
  }, [chain?.id, root])

  const onConnectClick = useCallback(async () => {
    return root.open({ route: 'ConnectWallet' })
  }, [root])

  const onHidConfigClick = useCallback(async () => {
    return root.open({ route: 'HidDeviceOptions' })
  }, [root])

  const { onAccountClick, onNetworkClick } = useAccountNetworkActions()

  return {
    onAccountClick,
    onConnectClick,
    onHidConfigClick,
    onNetworkClick,
    onTransactionsClick
  }
}

export type PstlW3mConnectionHook = [
  readonly Connector[],
  Callbacks,
  {
    address?: Address
    balanceInfo: ReturnType<typeof useBalance>
    chain?: Chain
    currentConnector: Connector | undefined
    error: Error | null
    isError: boolean
    isIdle: boolean
    isLoading: boolean
    isSuccess: boolean
    isConnected: boolean
    isConnecting: boolean
    isDisconnected: boolean
    isReconnecting: boolean
    // isWalletConnectOpen: ReturnType<typeof useWeb3Modal>['isOpen']
    isRootModalOpen: ReturnType<typeof usePstlWeb3Modal>['isOpen']
  }
]
/**
 * Connect/disconnect Forge apps
 * @example returns: [
      connectors, 
      {
        openWalletConnectModal: ReturnType<typeof useWeb3Modal>['open']
        closeWalletConnectModal: ReturnType<typeof useWeb3Modal>['close']
        openRootModal: ReturnType<typeof usePstlWeb3Modal>['open']
        closeRootModal: ReturnType<typeof usePstlWeb3Modal>['close']
        onNetworkClick: () => Promise<void>
        onAccountClick: () => Promise<void>
        connect: ReturnType<typeof useConnect>['connectAsync']
      }, 
      { 
        address?: Address
        balanceInfo: ReturnType<typeof useBalance>
        chain?: Chain
        currentConnector: ReturnType<typeof useAccount>['connector']
        error: Error | null
        isError: boolean
        isIdle: boolean
        isLoading: boolean
        isSuccess: boolean
        isConnected: boolean
        isConnecting: boolean
        isDisconnected: boolean
        isReconnecting: boolean
        pendingConnector: Connector | undefined
        isWalletConnectOpen: ReturnType<typeof useWeb3Modal>['isOpen']
        isRootModalOpen: ReturnType<typeof usePstlWeb3Modal>['isOpen'] 
      }
    ]
 */
type UseConnectionProps = {
  connect: UseConnectDisconnectProps['connect']
  disconnect: UseConnectDisconnectProps['disconnect']
}
export function useConnection(props?: UseConnectionProps): PstlW3mConnectionHook {
  const { root } = useAllWeb3Modals()

  const {
    connect: { connectAsync: connect, connectors, error, isPending: isLoading, isError, isIdle, isSuccess },
    disconnect: { disconnect }
  } = useConnectDisconnect(props)

  const {
    address,
    chain,
    balance: balanceInfo,
    connector,
    isConnected,
    isConnecting,
    isDisconnected,
    isReconnecting
  } = useUserConnectionInfo()

  const { onAccountClick, onNetworkClick } = useAccountNetworkActions()

  return [
    connectors,
    {
      connect,
      disconnect,
      // openWalletConnectModal: walletConnect.open,
      // closeWalletConnectModal: walletConnect.close,
      openRootModal: root.open,
      closeRootModal: root.close,
      onNetworkClick,
      onAccountClick
    },
    {
      address,
      balanceInfo,
      chain,
      currentConnector: connector,
      error,
      isError,
      isIdle,
      isLoading,
      isSuccess,
      // isWalletConnectOpen: walletConnect.isOpen,
      isRootModalOpen: root.isOpen,
      isConnected,
      isConnecting,
      isDisconnected,
      isReconnecting
    }
  ] as const
}
