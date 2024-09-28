import { useCallback, useEffect, useState } from 'react'

let timeout: NodeJS.Timeout | undefined = undefined
export function useTimeoutClearingError(
  error?: string,
  time = 3000,
  callback?: (error: Error | null) => void
): [boolean, () => void] {
  const [showError, setShowError] = useState(!!error)
  useEffect(() => {
    if (!error) return setShowError(false)

    setShowError(true)
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }
    // Only set timeout on error == true
    timeout = setTimeout(() => {
      setShowError(false)
      callback?.(null)
    }, time)

    return () => {
      timeout && clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, time])

  const resetError = useCallback(() => {
    if (timeout) clearTimeout(timeout)
    setShowError(false)
    callback?.(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [showError, resetError]
}
