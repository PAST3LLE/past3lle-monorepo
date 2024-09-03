import { IframeEthereumParameters, iframeEthereum } from './iframeEthereum'
import { LedgerHidParameters, checkError as checkLedgerHidError, isHIDSupported, ledgerHid } from './ledgerHid'
import { LedgerLiveParameters, ledgerLive } from './ledgerLive'
import { isIframe } from './utils'
import { PstlWeb3AuthParameters as Web3AuthParameters, web3Auth } from './web3Auth'

export {
  iframeEthereum,
  type IframeEthereumParameters,
  ledgerHid,
  type LedgerHidParameters,
  ledgerLive,
  type LedgerLiveParameters,
  web3Auth,
  type Web3AuthParameters,
  // Utils
  isIframe,
  checkLedgerHidError,
  isHIDSupported
}
