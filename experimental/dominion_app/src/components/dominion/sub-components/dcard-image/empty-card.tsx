import React, { memo } from 'react'
import { DCardImageSub } from './dcard-image-sub'

const noop = () => 0

export const EmptyCard = memo(
  ({
    width,
    height,
    borderWidth,
    description
  }: {
    width: number
    height: number
    borderWidth: number
    description: string
  }) => (
    <DCardImageSub
      imgUrl={''}
      description={description}
      width={width}
      height={height}
      borderWidth={borderWidth}
      isButton={false}
      onClick={noop}
    />
  )
)

EmptyCard.displayName = 'EmptyCard'
