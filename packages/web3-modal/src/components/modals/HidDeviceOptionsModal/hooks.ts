import { useDebounce } from '@past3lle/hooks'
import { devError } from '@past3lle/utils'
import { ledgerHid } from '@past3lle/wagmi-connectors'
import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { Address, formatEther } from 'viem'
import { useChainId } from 'wagmi'

import { KEYS } from '../../../constants/localstorage'
import { usePstlWeb3Modal, usePstlWeb3ModalStore } from '../../../hooks'

export type LedgerHidConnector = ReturnType<ReturnType<typeof ledgerHid>>
type Params = {
  chainId: number | undefined
  connector: LedgerHidConnector | undefined
  path: string | null | undefined
  paginationAmount: number
}

const DEFAULT_ACCOUNT_INDEX = parseFloat(localStorage.getItem(KEYS.HID_ACCOUNT_INDEX) || '0')

export function useHidModalStore({ chainId, connector, path, paginationAmount }: Params) {
  const { close } = usePstlWeb3Modal()
  const {
    callbacks: {
      error: { set: setError, reset: resetError }
    }
  } = usePstlWeb3ModalStore()
  const [selectedAccountIdx, setSelectedAccountIdx] = useState<number>(() => DEFAULT_ACCOUNT_INDEX)
  const [accountsAndBalances, setAccountsAndBalances] = useState<{ address: string; balance: string | undefined }[]>([])

  const [loading, setLoading] = useState(false)
  const [paginationIdx, setPaginationIdx] = useState(paginationAmount)
  const [loadedSavedConfig, setLoadedSavedConfig] = useState(false)

  return useMemo(() => {
    const setHidError = (error: unknown) => {
      if (!error) return resetError()

      devError(error)
      setError(
        error instanceof Error
          ? error
          : typeof error === 'string'
          ? new Error(error)
          : new Error('Unknown error occured!')
      )
    }

    return {
      selectedAccountIdx,
      accountsAndBalances,
      loading,
      paginationIdx,
      loadedSavedConfig,
      setLoadedSavedConfig,
      setSelectedAccountIdx,
      setHidError,
      handleSelectAccount: async (sPath: string | undefined, idx: number) => {
        const hid = connector
        try {
          _isValidPathOrThrow(sPath)
          _isConnectedOrThrow(hid)

          setSelectedAccountIdx(idx)

          await Promise.all([hid?.setAccount(sPath), close()])
        } catch (error) {
          setHidError(error)
        }
      },
      resetAndConnectProvider: async (fullPath?: string) => {
        const hid = connector
        try {
          _isConnectedOrThrow(hid)
          if (fullPath) {
            setPaginationIdx(paginationAmount)
            setAccountsAndBalances([])

            // Disconnect hid connector and reconnect via new path and reset flag
            // reset flag sets a new signer at path address
            // await hid?.disconnect()
            await hid?.connect({ chainId }, { path: fullPath, reset: true })
          }
        } catch (error) {
          setHidError(error)
        }
      },
      getAccount: async (acctIdx: string | number = '0') => {
        const hid = connector

        try {
          _isValidPathOrThrow(path)
          _isConnectedOrThrow(hid)
          // Here we can assume there is both a valid path AND hid connector
          const replacedPath = path?.replace(/\*/g, acctIdx.toString())

          // Set our device address to replaced path
          return hid?.setAccount(replacedPath)
        } catch (error) {
          setHidError(error)
        }
      },
      getAccounts: async () => {
        const hid = connector

        try {
          _isValidPathOrThrow(path)
          _isConnectedOrThrow(hid)
          setLoading(true)
          const provider = await hid?.getProvider?.()

          const accountsAndBalances: { address: Address; balance: string | undefined }[] = []
          for (let i = paginationIdx - paginationAmount; i < paginationIdx; i++) {
            // Replace the set path catch-all token with user's passed index
            const replacedPath = path?.replace(/\*/g, i.toString())
            const [acct] = (await hid?.getAccounts(replacedPath)) || []
            // We throw if no path found at derived address
            if (!acct) throw new Error('No valid account found at path: ' + replacedPath)
            const bal = await provider?.getBalance(acct)
            accountsAndBalances.push({ address: acct, balance: bal ? formatEther(BigInt(bal.toString())) : '0' })
            continue
          }

          setAccountsAndBalances((state) => [...state, ...accountsAndBalances])
          setPaginationIdx((state) => state + paginationAmount)
        } catch (error) {
          setHidError(error)
          setAccountsAndBalances([])
        } finally {
          return setLoading(false)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loadedSavedConfig,
    accountsAndBalances,
    chainId,
    connector,
    loading,
    paginationAmount,
    paginationIdx,
    path,
    selectedAccountIdx,
    setError,
    close
  ])
}

function _isConnectedOrThrow(hid: Params['connector'] | undefined): void {
  if (!hid)
    throw new Error(
      'No HID connector detected. Please check that device is plugged in, unlocked, and that the Ethereum app is open.'
    )
}

function _isValidPathOrThrow(path?: string | null): void {
  if (!path) {
    throw new Error(
      'No valid derivation path detected. Please check that you are connected to your HID device and that you have either selected a preset derivation path or set your own.'
    )
  }
}

export function useHidModalPath(defaultPath: string) {
  const [path, setPath] = useState<string | null>(defaultPath)
  const dbPath = useDebounce(path, 500)
  const [isCustomPath, setIsCustomPath] = useState(false)

  return {
    path,
    dbPath,
    isCustomPath,
    setPath,
    setIsCustomPath
  }
}

type HidUpdaterParams = Pick<
  ReturnType<typeof useHidModalStore>,
  | 'resetAndConnectProvider'
  | 'selectedAccountIdx'
  | 'setHidError'
  | 'setSelectedAccountIdx'
  | 'getAccount'
  | 'loadedSavedConfig'
  | 'setLoadedSavedConfig'
> &
  Pick<ReturnType<typeof useHidModalPath>, 'setIsCustomPath' | 'isCustomPath' | 'dbPath' | 'setPath'> & {
    chainId: number | undefined
    derivationPaths: readonly string[]
    setSelection: React.Dispatch<React.SetStateAction<string | undefined>>
  }

/**
 * @name useHidUpdater
 * @description - runs update logic on detected changes to chainId, debounced path and/or selected account index
 * @param store - variables/state and callbacks
 */
export function useHidUpdater({
  derivationPaths,
  dbPath,
  selectedAccountIdx,
  setIsCustomPath,
  setPath,
  setSelection,
  setSelectedAccountIdx,
  resetAndConnectProvider,
  getAccount,
  setLoadedSavedConfig,
  setHidError
}: HidUpdaterParams) {
  const chainId = useChainId()
  useEffect(() => {
    async function updateHidConfig() {
      try {
        if (!dbPath || !chainId) {
          if (!chainId) throw new Error('No chain id detected. Verify that you are connected.')
          else return
        }
        if (!derivationPaths.some((path) => path === dbPath)) {
          setIsCustomPath(true)
        }
        // set the local path/selection/idx states
        setPath(dbPath)
        setSelection(dbPath ?? undefined)
        setSelectedAccountIdx(selectedAccountIdx)
        const realAccountIndex = selectedAccountIdx.toString()

        // reset connection
        await resetAndConnectProvider(dbPath?.replace(/\*/g, realAccountIndex))
        // Query the last address based on the path and index
        await getAccount(realAccountIndex)
        return
      } catch (error) {
        setHidError(error)
      } finally {
        setLoadedSavedConfig(true)
      }
    }

    updateHidConfig()

    return () => {
      localStorage?.setItem(KEYS.HID_DERIVATION_PATH, dbPath ?? '')
      localStorage?.setItem(KEYS.HID_ACCOUNT_INDEX, selectedAccountIdx.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbPath, chainId, selectedAccountIdx])
}
