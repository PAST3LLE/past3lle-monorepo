import styled from 'styled-components'
import { LayoutText, rotateKeyframe } from '../../theme'
import { Row } from '../Layout'

export interface CTAOverlayProps {
  $width?: string
  $height?: string
  $zIndex: number
  bgColor?: string
}
export const VideoPlayCTAOverlay = styled(Row).attrs((props) => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  ...props,
}))<CTAOverlayProps>`
  position: absolute;
  cursor: pointer;
  background: ${({ theme, bgColor }) =>
    `radial-gradient(76.02% 105.41% at 31.84% 0%,${bgColor} 0%,${theme.blackOpaque1} 100%)`};
  ${({ $width }) => $width && `width: ${$width};`}
  ${({ $height }) => $height && `height: ${$height};`}
    z-index: ${({ $zIndex }) => $zIndex};

  > img {
    width: 20%;
    margin: auto 20% auto auto;

    animation: ${rotateKeyframe} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  }
`

export const VideoHeader = styled(LayoutText.header)``
export const VideoContainer = styled(Row)`
  position: relative;

  > ${VideoHeader} {
    position: absolute;
    right: 15%;
    letter-spacing: -8px;
    font-size: 7.6rem;
  }
`
