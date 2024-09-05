import { useEffect } from 'react'
import { UseConnectParameters, UseConnectReturnType, UseDisconnectParameters, UseDisconnectReturnType } from 'wagmi'

export function useConnectDisconnectEffects({
  connect,
  disconnect
}: {
  connect: { returnData: UseConnectReturnType; mutation: UseConnectParameters['mutation'] }
  disconnect: { returnData: UseDisconnectReturnType; mutation: UseDisconnectParameters['mutation'] }
}) {
  const { data: cData, error: cError, context: cContext, variables: cVariables, status: cStatus } = connect.returnData
  const {
    data: dData,
    error: dError,
    context: dContext,
    variables: dVariables,
    status: dStatus
  } = disconnect.returnData
  // On connection status updates
  useEffect(() => {
    if (connect.mutation?.onSuccess && cStatus === 'success' && cData && cContext && cVariables) {
      connect.mutation.onSuccess(cData, cVariables, cContext)
    } else if (connect.mutation?.onError && cStatus === 'error' && cError && cVariables) {
      connect.mutation.onError(cError, cVariables, cContext)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cStatus, cError, cData, cContext, cVariables, connect.mutation?.onSuccess, connect.mutation?.onError])

  // On disconnect status updates
  useEffect(() => {
    if (disconnect.mutation?.onSuccess && dStatus === 'success' && dContext && dVariables) {
      disconnect.mutation.onSuccess(dData, dVariables, dContext)
    } else if (disconnect.mutation?.onError && dStatus === 'error' && dError && dVariables) {
      disconnect.mutation.onError(dError, dVariables, dContext)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dStatus, dError, dData, dContext, dVariables, disconnect.mutation?.onSuccess, disconnect.mutation?.onError])
}
