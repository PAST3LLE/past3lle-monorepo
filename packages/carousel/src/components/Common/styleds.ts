import { AxisDirection } from '@past3lle/carousel-hooks'
import { Row } from '@past3lle/components'
import { BLACK, OFF_WHITE } from '@past3lle/theme'
import { animated } from '@react-spring/web'
import { transparentize } from 'polished'
import styled, { css } from 'styled-components'

import { TouchAction } from '../../types'

const BaseCarouselStep = styled(Row)<{
  $width: number
  $height?: string
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ $width }) => $width}px;
  ${({ $height }) => $height && `height: ${$height};`}
  overflow: hidden;
  // TODO: BE SURE THIS ISNT SHITTY
  align-items: flex-start;

  img {
    max-width: 100%;
  }
`

export const CarouselItemContainer = styled(BaseCarouselStep)<{
  $transformAmount: number
}>`
  transform: ${({ $transformAmount }) => `translateX(${$transformAmount}px)`};
  transition: ${({ $transformAmount }) =>
    $transformAmount > 0 ? 'transform 1s ease-in-out;' : 'transform 0.7s ease-out'};

  z-index: ${({ $transformAmount }) => ($transformAmount > 0 ? 1 : 0)};
`

export const AnimatedDivContainer = styled(animated.div)<{
  $axis: AxisDirection
  $fillContainer?: boolean
  $withBoxShadow?: boolean
  $maxWidth?: string
  $maxHeight?: string
  $borderRadius?: string
  $touchAction: TouchAction
}>`
  touch-action: ${({ $touchAction }) => (typeof $touchAction === 'string' ? $touchAction : $touchAction?.join(' '))};
  will-change: transform;
  position: absolute;
  cursor: pointer;
  border-radius: ${({ $borderRadius = '0.9rem' }) => $borderRadius};
  overflow: hidden;

  width: 100%;
  height: 100%;
  max-width: ${({ $maxWidth = 'none' }) => $maxWidth};
  max-height: ${({ $maxHeight = 'none' }) => $maxHeight};

  ${({ $axis, $fillContainer }) =>
    $fillContainer
      ? `
    width: 100%;
    height: 100%;
    `
      : $axis === 'y'
      ? 'width: 100%;'
      : 'height: 100%;'}

  ${({ $withBoxShadow = true, theme }) =>
    $withBoxShadow && `box-shadow: 0px 0.1rem 2rem 0.9rem ${transparentize(0.5, theme.black)};`}

  &:hover {
    box-shadow: ${({ theme, $withBoxShadow = true }) =>
      $withBoxShadow &&
      `0px 0px 3rem 1rem ${theme.mode === 'DARK' ? theme.blackOpaqueMore : theme.offwhiteOpaqueMost}`};
  }

  transition: box-shadow 0.2s ease-in-out;
`

export const ScrollerContainer = styled.div<{ $touchAction: TouchAction; $isVerticalScroll: boolean }>`
  touch-action: ${({ $touchAction }) => (typeof $touchAction === 'string' ? $touchAction : $touchAction.join(' '))};
  ${({ $isVerticalScroll }) => ($isVerticalScroll ? 'height: 100%;' : 'width: 100%;')}
  position: relative;
  overflow: hidden;
  transition: transform 350ms ease-in-out;
`

export const CarouselContainer = styled(ScrollerContainer).attrs({ $isVerticalScroll: false })<{
  $fixedHeight?: number
  $fixedWidth?: number
}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
  z-index: 1;
  ${({ $fixedHeight }) => $fixedHeight && `height: ${$fixedHeight}px;`}
  ${({ $fixedWidth }) => $fixedWidth && `width: ${$fixedWidth}px;`}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    > ${CarouselItemContainer} {
        max-width: 100%;
        height: auto;
      }
  `}
`

export const CarouselButton = styled.div<{ buttonColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 10%;
  background-color: ${({ buttonColor }) => transparentize(1, buttonColor)};

  cursor: pointer;

  &:hover {
    background-color: ${({ buttonColor }) => transparentize(0.7, buttonColor)};
  }

  transition: background-color 0.2s ease-in-out;
`

export const CarouselButtonContainer = styled.div`
  position: absolute;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  cursor: pointer;
`

export const CarouselIndicator = styled.div<{ isCurrent: boolean; color?: string; indicatorWidth: number }>`
  color: ${({ isCurrent }) => (isCurrent ? BLACK : OFF_WHITE)};
  border-radius: 0;
  flex: 0 1 ${(props) => props.indicatorWidth}%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 400;

  background: #f8f8ff30;
  &.active-indicator {
    background: ${(props) => props.color};
  }
`

export type AbsolutePosition = 'bottom' | 'top' | 'left' | 'right'

export function getAbsolutePosition(position: AbsolutePosition, axis: AxisDirection) {
  if (axis === 'x') {
    switch (position) {
      case 'bottom':
        return css`
          bottom: 0;
        `
      case 'top':
        return css`
          top: 0;
        `
      default:
        return css`
          top: 0;
        `
    }
  } else {
    switch (position) {
      case 'right':
        return css`
          right: 0;
        `
      case 'left':
        return css`
          left: 0;
        `
      default:
        return css`
          right: 0;
        `
    }
  }
}

export const CarouselIndicatorWrapper = styled(Row)<{
  axis: AxisDirection
  position: AbsolutePosition
  css?: string
}>`
  position: absolute;

  margin: 0;
  padding: 0;
  width: 100%;
  justify-content: stretch;
  align-items: stretch;

  &:hover {
    opacity: 1;
  }

  transition: opacity 0.3 ease-in-out, background 0.3 ease-in-out;

  ${({ axis, position }) =>
    axis === 'x'
      ? `
      flex-flow: row nowrap;
      ${getAbsolutePosition(position, 'x')}
      `
      : `
        flex-flow: column nowrap;
        width: 10px;
        height: 100% !important;
        ${getAbsolutePosition(position, 'y')}
      `}

  ${(props) => props?.css && props.css}
`
