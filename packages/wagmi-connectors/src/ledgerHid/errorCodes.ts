export type ErrorCodes = 27906 | 28160

type ErrorMessages = {
  [code in ErrorCodes]: string
}

export const ERROR_MESSAGES: ErrorMessages = {
  [27906]: 'Ledger locked! Please unlock and make sure your Ethereum app is open.',
  [28160]: 'Ledger device: CLA_NOT_SUPPORTED (0x6e00). Make sure the Ethereum app is open on the device.'
}
