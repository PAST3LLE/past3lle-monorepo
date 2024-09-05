import { CheckCircle, RowStart } from '@past3lle/components'
import React from 'react'
import styled from 'styled-components'

export const StyledConnectedCheckMark = styled(RowStart)`
  position: absolute;
  top: 3em;
  right: 1em;

  gap: 0.4em;

  font-size: 0.4em;
`

export function ConnectedCheckMark() {
  return (
    <StyledConnectedCheckMark>
      Connected <CheckCircle size={8} />
    </StyledConnectedCheckMark>
  )
}
