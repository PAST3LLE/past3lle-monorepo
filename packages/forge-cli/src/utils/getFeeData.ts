import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'

import { SupportedNetworks } from '../types/networks'
import { getGasStationUri } from './getGasStationUri'

interface FeeInfoDetailed {
  maxFee: number
  maxPriorityFee: number
}

const FALLBACK_GWEI = 40000000000
const RETRY_MULTIPLIER = 12
const RETRY_BASE = 10
const MAX_PRIORITY_FEE = 12

export async function getFeeData(network: SupportedNetworks, tryHigherValues = false) {
  const [multiplier, base] = tryHigherValues ? [RETRY_MULTIPLIER, RETRY_BASE] : [1, 1]
  // get max fees from gas station
  let maxFeePerGas = BigNumber.from(FALLBACK_GWEI) // fallback to 40 gwei
  let maxPriorityFeePerGas = parseUnits(MAX_PRIORITY_FEE.toString(), 'gwei') // fallback to 40 gwei
  let gasPrice = maxFeePerGas
  try {
    const gasStationUri = getGasStationUri(network)
    console.log('[Forge-CLI] Gas Station URI:', gasStationUri)
    const res = await (await fetch(gasStationUri)).json()
    const data: number | FeeInfoDetailed = res?.fast ?? res?.data?.fast
    console.log('[Forge-CLI] Gas Station response:', data, typeof data)
    if (!(data as FeeInfoDetailed)?.maxFee && !data) throw new Error('Missing fee data. Check URI')

    if (typeof data === 'number') {
      maxFeePerGas = BigNumber.from(data)
    } else if ('maxFee' in data || 'maxPriorityFee' in data) {
      // object returns (polygon) return units in human readable format, we need to set to gwei
      // string returns are already in gwei
      maxFeePerGas = data?.maxFee ? parseUnits(data.maxFee.toString(), 'gwei') : maxFeePerGas
      maxPriorityFeePerGas = parseUnits(
        data?.maxPriorityFee ? data.maxPriorityFee.toString() : MAX_PRIORITY_FEE.toString(),
        'gwei'
      )
    } else throw new Error('Fee info missing. Check URI')

    // set gas price to a percentage higher right away
    gasPrice = maxFeePerGas.mul(multiplier).div(base)
    // manually set the maxFee double the recommended to ensure accepted transaction
    // this is useful for testnets like sepolia that have a lot of variable gas prices
    maxFeePerGas = gasPrice.mul(2)
    // sometimes this logic can lead to priority fee being greater than the fee per gas
    // this changes the priority fee to be half the gas price
    if (maxPriorityFeePerGas.gte(maxFeePerGas)) {
      maxPriorityFeePerGas = gasPrice.div(2)
    }
  } catch (error) {
    console.error('Error getting fee data!', error)
  }

  const feeData = {
    maxFeePerGas,
    maxPriorityFeePerGas
  }
  console.log(`
    Fee Data:
    ---------
    Current gas price:        ${gasPrice.toString()}
    Max Fee Per Gas:          ${feeData.maxFeePerGas.toString()}
    Max Priority Fee Per Gas: ${feeData.maxPriorityFeePerGas.toString()}
  `)
  return feeData
}
