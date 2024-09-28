import { setForwardedRef } from '@past3lle/utils'
import React from 'react'
import { ForwardedRef, forwardRef, useMemo, useState } from 'react'

import { useCarouselSetup } from '../hooks'
import { BaseCarouselProps } from '../types'
import { CarouselItem } from './Common'
import { CarouselContainer } from './Common/styleds'

export interface ButtonCarouselProps<D extends any[]> extends BaseCarouselProps<D> {
  showButtons?: boolean
  forwardedRef?: ForwardedRef<HTMLDivElement>
  onCarouselChange?: (index: number) => void
}

export default function ButtonCarousel<D extends any[]>({
  data,
  startIndex,
  dimensions,
  forwardedRef,
  windowSizeOptions,
  onCarouselChange,
  children,
  ...rest
}: ButtonCarouselProps<D>) {
  const [selectedStep, setSelectedStep] = useState(startIndex)
  const {
    parentSizes,
    imageTransformations: defaultImageTransforms,
    setCarouselContainerRef
  } = useCarouselSetup(dimensions, { windowSizeOptions })

  const { isMultipleCarousel, lastStepIndex } = useMemo(
    () => ({
      isMultipleCarousel: data.length > 1,
      lastStepIndex: data.length - 1
    }),
    [data.length]
  )

  return (
    <CarouselContainer
      $touchAction={'auto'}
      id="#carousel-container"
      ref={(node) => {
        setCarouselContainerRef(node)
        node && forwardedRef && setForwardedRef(node, forwardedRef)
      }}
      $fixedHeight={dimensions?.fixedSizes?.height || parentSizes?.height || parentSizes?.width}
    >
      {/* CAROUSEL CONTENT */}
      {data.map((_, index) => {
        if (!parentSizes?.width) return null
        const isCurrentStep = !isMultipleCarousel || index === selectedStep
        // has multiple steps and is on last item
        const isLastStep = isMultipleCarousel && selectedStep === lastStepIndex
        const calculatedWidth = isCurrentStep ? 0 : parentSizes.width

        const onNext = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation()
          let indexToSet = undefined
          if (isLastStep) {
            indexToSet = 0
          } else {
            indexToSet = selectedStep + 1
          }
          // change carousel slide
          setSelectedStep(indexToSet)
          // side effect change item video
          onCarouselChange && onCarouselChange(indexToSet)
        }

        const onPrevious = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation()
          let indexToSet = undefined
          if (selectedStep === 0) {
            indexToSet = lastStepIndex
          } else {
            indexToSet = selectedStep - 1
          }
          // change carousel slide
          setSelectedStep(indexToSet)
          // side effect change item video
          onCarouselChange && onCarouselChange(indexToSet)
        }

        return (
          <CarouselItem
            {...rest}
            key={index}
            index={index}
            colors={{
              background: rest.colors?.background
            }}
            transformAmount={calculatedWidth}
            parentWidth={parentSizes.width}
            isMultipleCarousel={!!data.length}
            onPrev={onPrevious}
            onNext={onNext}
          >
            {children({ index, defaultImageTransforms, isLast: index === data.length - 1 })}
          </CarouselItem>
        )
      })}
    </CarouselContainer>
  )
}

export const ButtonCarouselWithRef = forwardRef(function ButtonCarouselWithRef(props: any, ref) {
  return <ButtonCarousel {...props} forwardedRef={ref} />
})
