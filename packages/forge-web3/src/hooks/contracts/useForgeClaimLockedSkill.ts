import { MergeManager__factory } from '@past3lle/skilltree-contracts'
import { devDebug, devError } from '@past3lle/utils'
import { useAddPendingTransaction } from '@past3lle/web3-modal'
import { useCallback } from 'react'
import { Address, Hash } from 'viem'
import { useSimulateContract, useWriteContract } from 'wagmi'

import { SkillMetadata } from '../../types'
import { formatSkillMetadataToArgs } from '../../utils'
import { useForgeSkillMetadataToArg } from './base'
import { useForgeApproveAllTokensForClaimable, useForgeGetAllUnapprovedTokensForClaimable } from './useForgeApprove'
import { useForgeContractAddressesByChain } from './useForgeContractAddress'

export function useForgeClaimLockedSkill(skill: SkillMetadata | null) {
  const mergeManager = useForgeContractAddressesByChain(undefined, false)?.mergeManager
  const arg = useForgeSkillMetadataToArg(skill)
  const unapprovedList = useForgeGetAllUnapprovedTokensForClaimable(skill)
  const addPending = useAddPendingTransaction()

  const { data, error } = useSimulateContract({
    // enabled if unapproved list is empty (all approved)
    query: { enabled: !!(unapprovedList?.length && arg) },
    address: mergeManager,
    abi: MergeManager__factory.abi,
    functionName: 'claimLockedSkill',
    // TODO: check this stupid type error
    args: (arg ? [arg] : undefined) as any
  })

  if (error) {
    devError('useForgeClaimLockedSkill prepare contract for write error!', error)
  }
  const res = useWriteContract()
  return {
    ...res,
    writeAsync: async () => {
      if (!data?.request || error) throw error
      return res.writeContractAsync(data.request).then((res) => {
        addPending(res, {
          metadata: {
            forgeSkillId: skill?.properties?.id,
            forgeTransactionType: 'claim'
          }
        })
        return res
      })
    }
  }
}

export function useForgeClaimLockedSkillCallback() {
  const mergeManager = useForgeContractAddressesByChain(undefined, false)?.mergeManager
  const addPending = useAddPendingTransaction()

  const { writeContractAsync } = useWriteContract()

  return useCallback(
    async (skill: SkillMetadata | null) => {
      const formattedArgs = formatSkillMetadataToArgs(skill)
      if (!mergeManager)
        throw new Error('[useForgeClaimLockedSkillCallback] Missing MergeManager address! Check configuration!')
      if (!formattedArgs) throw new Error('[useForgeClaimLockedSkillCallback] Incorrect arguments!')
      return writeContractAsync({
        address: mergeManager,
        abi: MergeManager__factory.abi,
        functionName: 'claimLockedSkill',
        args: [formattedArgs as never]
      }).then((hash) => {
        addPending(hash as Hash, { metadata: { forgeSkillId: skill?.properties.id, forgeTransactionType: 'claim' } })
        return hash
      })
    },
    [addPending, writeContractAsync, mergeManager]
  )
}

interface ClaimLockedSkillOpts {
  onApproveSend: (hash: Address | undefined, approvalsRequired: number) => void
  onClaimSend: (hash: Address | undefined) => void
}
export function useForgeApproveAndClaimLockedSkillCallback(
  skill: SkillMetadata | null,
  opts?: ClaimLockedSkillOpts
): [Omit<ReturnType<typeof useForgeClaimLockedSkill>, 'writeAsync'>, () => Promise<void | undefined>] {
  const approveAllTokensCallbacks = useForgeApproveAllTokensForClaimable(skill)
  const { writeAsync: claimLockedSkill, ...claimLockedSkillApi } = useForgeClaimLockedSkill(skill)

  const approveAndClaimCallback = useCallback(async () => {
    devDebug(`
[useForgeApproveAndClaimLockedSkillCallback] --> STATE!
  Needs approval?     ${!!approveAllTokensCallbacks}
  --
  Has claim callback? ${!!claimLockedSkill}
`)
    try {
      // Step 1: check & approve merge manager to burn / claiming tokens
      if (approveAllTokensCallbacks?.length) {
        // fire all approve callbacks
        await Promise.all(
          approveAllTokensCallbacks.map((callback) =>
            callback().then((res) => opts?.onApproveSend(res, approveAllTokensCallbacks?.length || 0))
          )
        )
      }

      // Step 2:
      return claimLockedSkill?.().then((res) => opts?.onClaimSend(res))
    } catch (error) {
      devError('[@past3lle/forge-web3] --> useForgeApproveAndClaimLockedSkillCallback --> Error!', error)
      throw error
    }
  }, [approveAllTokensCallbacks, claimLockedSkill, opts])

  return [claimLockedSkillApi, approveAndClaimCallback]
}
