import { proxy, subscribe as valtioSub } from 'valtio'
import { Hash } from 'viem'

import { TransactionsCtrlState } from '../types'
import { CoreUtil } from '../utils/CoreUtil'
import { AnyTransactionReceipt, AnyTransactionReceiptPayload } from './types'

interface BaseParams {
  chainId: number
}

interface UpdateTransactionsViaCallback extends BaseParams {
  updateFn: (state: AnyTransactionReceipt[]) => TransactionsCtrlState[number]
}

interface BatchTransactionParams extends BaseParams, Pick<AnyTransactionReceipt, 'nonce' | 'walletType'> {
  batch: Hash[]
}

interface ConfirmTransactionsParams<S extends keyof AnyTransactionReceipt, T extends keyof AnyTransactionReceipt>
  extends BaseParams {
  searchKey: S
  searchValue: AnyTransactionReceipt[S]
  updateKey: T
  updateValue?: AnyTransactionReceipt[T]
}

interface ConfirmTransactionsBatchParams<S extends keyof AnyTransactionReceipt, T extends keyof AnyTransactionReceipt>
  extends BaseParams {
  searchKey: S
  searchValueBatch: AnyTransactionReceipt[S][]
  updateKey: T
  updateValue: AnyTransactionReceipt[T]
}

export const DEFAULT_TX: Partial<AnyTransactionReceipt> = {
  blockHash: undefined,
  blockNumber: undefined,
  contractAddress: undefined,
  cumulativeGasUsed: undefined,
  effectiveGasPrice: undefined,
  from: undefined,
  gasUsed: undefined,
  logs: undefined,
  logsBloom: undefined,
  to: undefined,
  transactionIndex: undefined,
  type: 'eip1559'
}

// -- initial state ------------------------------------------------ //
const state = proxy<TransactionsCtrlState>(CoreUtil.getStateFromStorage('transactions', {}))

// -- controller --------------------------------------------------- //
export const TransactionCtrl = {
  state,
  subscribe(callback: (newState: TransactionsCtrlState) => void) {
    return valtioSub(state, () => {
      CoreUtil.setStateToStorage('transactions', state)
      callback(state)
    })
  },
  addTransaction({ chainId, transaction }: BaseParams & { transaction: AnyTransactionReceiptPayload }) {
    if (!Array.isArray(state?.[chainId])) state[chainId] = []
    const txWithDate = {
      ...transaction,
      chainId,
      dateAdded: Date.now()
    }
    state[chainId] = [...(state?.[chainId] || []), txWithDate]
  },
  addBatchPendingTransactions({ chainId, batch, nonce, walletType }: BatchTransactionParams) {
    const currState = state[chainId]
    const dateAdded = Date.now()
    state[chainId] = (currState || [])
      .map((cTx, idx) => {
        const iTx = batch[idx]
        if (!!nonce && cTx.nonce === nonce) {
          // mutate original batch array: remove indices that were added to the replaceHashes list
          // batch.splice(idx, 1)
          return {
            ...cTx,
            replacementTransactionHashes: [...(cTx?.replacementTransactionHashes || []), iTx]
          }
        }
        return cTx
      })
      .concat(
        batch.map(
          (hash) =>
          ({
            ...DEFAULT_TX,
            chainId,
            walletType,
            transactionHash: walletType === 'EOA' ? hash : undefined,
            safeTxHash: walletType === 'EOA' ? undefined : hash,
            status: 'pending',
            nonce,
            dateAdded
          } as AnyTransactionReceipt)
        )
      )
  },
  confirmTransactionsByValue<
    S extends keyof AnyTransactionReceiptPayload,
    T extends keyof AnyTransactionReceiptPayload
  >({ chainId, searchKey, searchValue }: ConfirmTransactionsParams<S, T>) {
    const stateAtChain = state[chainId]
    state[chainId] = _setPendingTxStatusByKeyValue(stateAtChain || [], searchKey, searchValue)
  },
  updateTransactionsByValue<S extends keyof AnyTransactionReceipt, T extends keyof AnyTransactionReceipt>({
    chainId,
    searchKey,
    searchValue,
    updateKey,
    updateValue
  }: ConfirmTransactionsParams<S, T>) {
    const stateAtChain = state[chainId]
    state[chainId] = _updateTransactionsByKeyValue(stateAtChain || [], (tx) => {
      const isTx = tx[searchKey] === searchValue
      return isTx ? { ...tx, [updateKey]: updateValue } : tx
    })
  },
  updateTransactionsBatchByValue<S extends keyof AnyTransactionReceipt, T extends keyof AnyTransactionReceipt>({
    chainId,
    searchKey,
    searchValueBatch,
    updateKey,
    updateValue
  }: ConfirmTransactionsBatchParams<S, T>) {
    const stateAtChain = state[chainId]
    state[chainId] = stateAtChain?.map((tx) => {
      const isTx = searchValueBatch.includes(tx[searchKey])
      return isTx ? _updateItemByKeyValue(tx, searchKey, tx[searchKey], updateKey, updateValue) : tx
    })
  },
  updateTransactionsViaCallback({ chainId, updateFn }: UpdateTransactionsViaCallback) {
    const stateAtChain = state[chainId] || []
    state[chainId] = updateFn(stateAtChain)
  }
}

function _updateItemByKeyValue<S extends keyof AnyTransactionReceipt, U extends keyof AnyTransactionReceipt>(
  tx: AnyTransactionReceipt,
  searchKey: Omit<ConfirmTransactionsParams<S, U>, 'chainId'>['searchKey'],
  searchValue: AnyTransactionReceipt[S],
  updateKey: Omit<ConfirmTransactionsParams<S, U>, 'chainId'>['updateKey'],
  updateValue: AnyTransactionReceipt[U]
) {
  const isTx = tx[searchKey] === searchValue
  return isTx
    ? {
      ...tx,
      [updateKey]: updateValue
    }
    : tx
}

function _setPendingTxStatusByKeyValue<S extends keyof AnyTransactionReceipt, T extends keyof AnyTransactionReceipt>(
  txListAtChain: AnyTransactionReceipt[],
  searchKey: Omit<ConfirmTransactionsParams<S, T>, 'chainId'>['searchKey'],
  searchValue: AnyTransactionReceipt[S]
): AnyTransactionReceipt[] {
  return _updateTransactionsByKeyValue(txListAtChain, (tx) =>
    _updateItemByKeyValue(
      tx,
      searchKey,
      searchValue,
      'status',
      tx.status === 'replaced-pending' ? 'replaced-success' : 'success'
    )
  )
}

function _updateTransactionsByKeyValue<T extends AnyTransactionReceipt>(
  list: T[],
  callback: (tx: T, i: number, arr: T[]) => T
): T[] {
  return list.map(callback)
}
