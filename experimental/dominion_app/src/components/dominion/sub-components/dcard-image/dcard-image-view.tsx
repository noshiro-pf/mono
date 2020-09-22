import React, { memo } from 'react'
import { EmptyCard } from './empty-card'
import { DCardImageSub } from './dcard-image-sub'

const noop = () => 0

export const DCardImageView = memo(
  ({
    empty,
    isButton,
    imgUrl,
    width,
    height,
    borderWidth,
    description,
    onClick
  }: {
    empty: boolean
    isButton: boolean
    imgUrl: string
    width: number
    height: number
    borderWidth: number
    description: string
    onClick: () => void
  }) =>
    !imgUrl || empty ? (
      <EmptyCard
        description={description}
        width={width}
        height={height}
        borderWidth={borderWidth}
      />
    ) : (
      <DCardImageSub
        imgUrl={imgUrl}
        description={description}
        width={width}
        height={height}
        borderWidth={borderWidth}
        isButton={isButton}
        onClick={isButton ? onClick : noop}
      />
    )
)

DCardImageView.displayName = 'DCardImageView'
