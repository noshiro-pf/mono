import { memo } from 'react'
import { ImgWithFrame } from './img-with-frame'

export const DCardImageSub = memo(
  ({
    imgUrl,
    description,
    width,
    height,
    borderWidth,
    isButton,
    onClick,
  }: {
    imgUrl: string
    description: string
    width: number
    height: number
    borderWidth: number
    isButton: boolean
    onClick: () => void
  }) => (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        cursor: isButton ? 'pointer' : 'auto',
      }}
    >
      <ImgWithFrame
        imgUrl={imgUrl}
        width={width}
        height={height}
        borderWidth={borderWidth}
        onClick={onClick}
      />
      {!!description && (
        <div
          style={{
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {description}
        </div>
      )}
    </div>
  ),
)

DCardImageSub.displayName = 'DCardImageSub'
