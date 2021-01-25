import * as I from 'immutable'
import React, { memo } from 'react'
import styled from 'styled-components'
import { DCardProperty, TDCardProperty } from '~/types/dcard-property'
import { DCardImage } from '../dcard-image/dcard-image'

const DCardList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`

const DCard = styled.div`
  padding: 5px;
`

export const DCardImageList = memo(
  ({
    title,
    cardIds,
    cardIdToDCardProperty,
  }: Readonly<{
    title?: string
    cardIds: I.List<string>
    cardIdToDCardProperty: I.Map<string, TDCardProperty>
  }>) => (
    <>
      {title !== undefined && <div>{title}</div>}
      <DCardList>
        {cardIds.map((k) => (
          <DCard key={k}>
            <DCardImage dcard={cardIdToDCardProperty.get(k, DCardProperty())} />
          </DCard>
        ))}
      </DCardList>
    </>
  )
)

DCardImageList.displayName = 'DCardImageList'
