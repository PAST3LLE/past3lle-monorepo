import { PstlWeb3ModalProps } from '../providers'
import { ReadonlyChains } from '../providers/types'
import { PstlWeb3Modal } from './modals'

interface ConnectedConnectionModalProps<chains extends ReadonlyChains = ReadonlyChains> {
  modalOptions: any
  web3Options: PstlWeb3ModalProps<chains>
}

export { PstlWeb3Modal, type ConnectedConnectionModalProps }
