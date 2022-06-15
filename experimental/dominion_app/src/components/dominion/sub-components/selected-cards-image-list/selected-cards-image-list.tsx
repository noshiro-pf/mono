import * as I from 'immutable'
import { memo } from 'react'
import { TDCardProperty } from '~/types/dcard-property'
import { TSelectedCardsId } from '~/types/selected-cards-id'
import { DCardImageList } from '../dcard-image-list/dcard-image-list'

export const SelectedCardsImageList = memo(
  ({
    cardIdToDCardProperty,
    selectedCardsId,
  }: Readonly<{
    cardIdToDCardProperty: I.Map<string, TDCardProperty>
    selectedCardsId: TSelectedCardsId
  }>) => (
    <div>
      <DCardImageList
        cardIds={selectedCardsId.KingdomCards10}
        cardIdToDCardProperty={cardIdToDCardProperty}
      />
      {!selectedCardsId.BaneCard.isEmpty() && (
        <DCardImageList
          title='災いカード'
          cardIds={selectedCardsId.BaneCard}
          cardIdToDCardProperty={cardIdToDCardProperty}
        />
      )}
      {!selectedCardsId.BlackMarketPile.isEmpty() && (
        <DCardImageList
          title='闇市場カード'
          cardIds={selectedCardsId.BlackMarketPile}
          cardIdToDCardProperty={cardIdToDCardProperty}
        />
      )}
      {!selectedCardsId.EventCards.isEmpty() && (
        <DCardImageList
          title='イベントカード'
          cardIds={selectedCardsId.EventCards}
          cardIdToDCardProperty={cardIdToDCardProperty}
        />
      )}
      {!selectedCardsId.LandmarkCards.isEmpty() && (
        <DCardImageList
          title='ランドマークカード'
          cardIds={selectedCardsId.LandmarkCards}
          cardIdToDCardProperty={cardIdToDCardProperty}
        />
      )}
      {!selectedCardsId.ProjectCards.isEmpty() && (
        <DCardImageList
          title='プロジェクトカード'
          cardIds={selectedCardsId.ProjectCards}
          cardIdToDCardProperty={cardIdToDCardProperty}
        />
      )}
    </div>
  )
)

SelectedCardsImageList.displayName = 'SelectedCardsImageList'
