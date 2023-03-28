import { Button, CloseIcon, ColumnCenter } from '@past3lle/components'
import { setBestTextColour } from '@past3lle/theme'
import styled from 'styled-components'

import { getPosition } from '../../utils'

export const ModalButton = styled(Button)<{ connected: boolean }>`
  width: 100%;
  justify-content: flex-start;
  background: ${({ theme }) => theme.modals?.connection?.button?.background || 'rgba(0,0,0,0.9)'};

  border: ${({ theme }) => theme.modals?.connection?.button?.border?.border || '1px solid black'};
  border-color: ${({ theme }) => theme.modals?.connection?.button?.border?.color};

  font-style: ${({ theme }) => theme.modals?.connection?.button?.fontStyle || 'inherit'};
  font-weight: ${({ theme }) => theme.modals?.connection?.button?.fontWeight || 300};
  color: ${({ theme }) =>
    theme.modals?.connection?.button?.color ||
    setBestTextColour(theme.modals?.connection?.button?.background || 'ghostwhite')};

  letter-spacing: ${({ theme }) => theme.modals?.connection?.button?.letterSpacing || '0px'};
  ${({ theme }) =>
    theme.modals?.connection?.button?.textShadow && `text-shadow: ${theme.modals?.connection?.button?.textShadow};`}

  ${({ theme }) =>
    theme.modals?.connection?.button?.fontSize && `font-size: ${theme.modals?.connection?.button?.fontSize};`}
    
    ${({ theme }) => `text-transform: ${theme.modals?.connection?.button?.textTransform || 'none'};`}
    
    gap: 1em;

  transition: transform 0.3s ease-in-out;
  &:hover {
    ${({ theme }) =>
      !!theme.modals?.connection?.button?.hoverAnimations &&
      `
    transform: scale(1.05);
    filter: saturate(2);
  `}
  }

  ${({ connected, theme }) =>
    connected &&
    `
      background: ${theme.modals?.connection?.button?.connectedBackgroundColor || 'transparent'};
      transform: scale(1.05);
      filter: saturate(2);
  `}
`

export const InnerContainer = styled(ColumnCenter)`
  position: relative;
  font-size: ${({ theme }) => theme.modals?.connection?.baseFontSize || 16}px;
  font-style: italic;
  font-weight: 200;
  font-family: 'Roboto', system-ui;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;

  background: ${({ theme }) => theme.modals?.connection?.background || 'rgb(201 172 172)'};
  padding: ${({ theme: { modals } }) => modals?.connection?.padding || '1em'};

  overflow-y: auto;

  > ${CloseIcon} {
    color: ${({ theme }) => theme.modals?.connection?.closeIcon?.color || 'ghostwhite'};
    ${({ theme }) => getPosition(theme.modals?.connection?.closeIcon?.position)};
    width: ${({ theme }) => theme.modals?.connection?.closeIcon?.size || '1em'};
  }

  > h1 {
    color: ${({ theme }) => theme.modals?.connection?.title?.color || 'ghostwhite'};
    font-size: ${({ theme }) => theme.modals?.connection?.title?.fontSize || '2em'};
    font-weight: ${({ theme }) => theme.modals?.connection?.title?.fontWeight || 200};
    letter-spacing: ${({ theme }) => theme.modals?.connection?.title?.letterSpacing || '0px'};
    line-height: ${({ theme }) => theme.modals?.connection?.title?.lineHeight || 1};
    margin-bottom: 0.1em;
  }

  border-radius: ${({ theme: { modals } }) => modals?.connection?.button?.border?.radius || '1em'};
`
