import { memo, useCallback, useMemo } from 'react'
import { TDCardProperty, isWideCard } from '~/types/dcard-property'
import { DCardImageView } from './dcard-image-view'

export const DCardImage = memo(
  ({
    dcard,
    faceUp: faceUpInput,
    isButton: isButtonInput,
    empty: emptyInput,
    width: widthInput,
    height: heightInput,
    description: descriptionInput,
    returnValue,
    onClick: onClickInput,
  }: Readonly<{
    dcard: TDCardProperty
    faceUp?: boolean
    isButton?: boolean
    empty?: boolean
    width?: number
    height?: number
    description?: string
    returnValue?: any
    onClick?: (returnValue: any) => any
  }>) => {
    const empty = emptyInput === true || dcard.nameEng === ''

    const isButton = isButtonInput === true
    const faceUp = faceUpInput === undefined ? true : !!faceUpInput

    const isWide = isWideCard(dcard)

    const [height, width] = useMemo(
      () =>
        isWide
          ? heightInput === undefined
            ? widthInput === undefined
              ? [150, 230]
              : [widthInput * (15 / 23), widthInput]
            : [heightInput, heightInput * (23 / 15)]
          : heightInput === undefined
          ? widthInput === undefined
            ? [230, 150]
            : [widthInput * (23 / 15), widthInput]
          : [heightInput, heightInput * (15 / 23)],
      [isWide, heightInput, widthInput],
    )

    const description = descriptionInput || ''

    const borderWidth = useMemo(
      () => (18 / 250) * Math.min(width, height),
      [width, height],
    )

    const imgUrl = faceUp ? dcard.imgUrl.front : dcard.imgUrl.back

    const onClick = useCallback(() => {
      if (!!onClickInput) {
        onClickInput(returnValue)
      }
    }, [onClickInput, returnValue])

    return (
      <DCardImageView
        empty={empty}
        isButton={isButton}
        imgUrl={imgUrl}
        width={width}
        height={height}
        borderWidth={borderWidth}
        description={description}
        onClick={onClick}
      />
    )
  },
)

DCardImage.displayName = 'DCardImage'
