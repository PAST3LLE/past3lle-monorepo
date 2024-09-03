import { ArrowLeft, CloseIcon, Row } from '@past3lle/components'
import { useOnKeyPress } from '@past3lle/hooks'
import React from 'react'

import { Z_INDICES } from '../../../constants'
import { RouterCtrl } from '../../../controllers'
import { usePstlWeb3ModalStore } from '../../../hooks'
import { useTimeoutClearingError } from '../../../hooks/misc/useTimeout'
import { ErrorMessage } from './ErrorMessage'
import { PoweredByLabel } from './PoweredByLabel'
import { InnerContainer, ModalTitle, StyledConnectionModal } from './styled'
import { BaseModalProps, ModalId } from './types'

export function BaseModal({
  title = 'PSTL MODAL',
  width,
  maxWidth,
  maxHeight,
  zIndex = Z_INDICES.PSTL,
  isOpen,
  onDismiss,
  modal,
  children,
  ...restModalProps
}: BaseModalProps) {
  const { state } = usePstlWeb3ModalStore()
  const [showError, hideError] = useTimeoutClearingError(state.modal?.error?.message, 7000)

  // Close modal on key press
  useOnKeyPress(restModalProps.closeModalOnKeys || [], onDismiss)

  return (
    <StyledConnectionModal
      id={ModalId.BASE}
      modal={modal}
      className={restModalProps.className}
      isOpen={isOpen}
      onDismiss={onDismiss}
      width={width}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      overflowY="auto"
      tabIndex={undefined}
      // to prevent locking of focus on modal (with web3auth this blocks using their modal e.g)
      bypassConfig={{ scroll: !!state.userOptions.ux?.bypassScrollLock, focus: true }}
      styleProps={{
        zIndex,
        ...restModalProps.styleProps
      }}
      {...restModalProps}
    >
      <InnerContainer
        modal={modal}
        node="main"
        justifyContent="flex-start"
        gap="0.75rem"
        isError={!!state?.modal.error?.message}
      >
        <Row width="100%" marginBottom="0.5em">
          {RouterCtrl.state.history.length > 1 && <ArrowLeft id="back-arrow" size={25} onClick={RouterCtrl.goBack} />}
          <ModalTitle>{title}</ModalTitle>
          <CloseIcon height={30} width={100} onClick={onDismiss} />
        </Row>
        {children}
        <ErrorMessage message={state?.modal.error?.message} hide={!showError} onClick={hideError} />
        <PoweredByLabel />
      </InnerContainer>
    </StyledConnectionModal>
  )
}
