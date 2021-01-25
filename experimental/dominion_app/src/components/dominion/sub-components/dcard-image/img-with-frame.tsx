import React, { memo } from 'react'
import { ImgWithLoader } from '~/utils/components/img-with-loader'
import { Loading } from './loading'

export const ImgWithFrame = memo(
  ({
    imgUrl,
    width,
    height,
    borderWidth,
    onClick,
  }: {
    imgUrl: string
    width: number
    height: number
    borderWidth: number
    onClick: () => void
  }) => (
    <div onClick={onClick}>
      {imgUrl === '' ? (
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        />
      ) : (
        <ImgWithLoader
          Loading={<Loading width={width} height={height} />}
          img={{
            alt: '',
            style: {
              display: 'block' /* img要素の余白削除 */,
              backgroundColor: 'black',
              borderWidth: `${borderWidth}px`,
              borderRadius: `${borderWidth}px`,
              borderStyle: 'solid',
              borderColor: 'black',
            },
            src: imgUrl,
            width: width,
            height: height,
          }}
        />
      )}
    </div>
  )
)

ImgWithFrame.displayName = 'ImgWithFrame'
