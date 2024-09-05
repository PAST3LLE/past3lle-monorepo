import { CheckCircle, RowStart } from '@past3lle/components'
import React from 'react'
import styled from 'styled-components'

export const RecommendedLabelWrapper = styled(RowStart)`
  position: absolute;
  top: 1em;
  right: 1em;

  gap: 0.4em;

  font-size: 0.4em;
`

export function RecommendedLabel() {
  return (
    <RecommendedLabelWrapper>
      Recommended <CheckCircle size={8} />
    </RecommendedLabelWrapper>
  )
}
