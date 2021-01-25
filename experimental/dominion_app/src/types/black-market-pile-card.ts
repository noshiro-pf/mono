import * as I from 'immutable'

interface IBlackMarketPileCard {
  cardIndex: number
  faceUp: boolean
}

export type IBlackMarketPileCardJS = IBlackMarketPileCard

export type TBlackMarketPileCard = I.Record<IBlackMarketPileCard> &
  Readonly<IBlackMarketPileCard>

export const BlackMarketPileCard = (
  bm?: Partial<IBlackMarketPileCard>
): TBlackMarketPileCard =>
  I.Record<IBlackMarketPileCard>({
    cardIndex: 0,
    faceUp: false,
  })(bm)

export const BlackMarketPileCardFromJS = (
  bm?: Partial<IBlackMarketPileCardJS>
): TBlackMarketPileCard => BlackMarketPileCard(bm)

export const BlackMarketPileCardToJS = (
  bm: TBlackMarketPileCard
): IBlackMarketPileCardJS => ({
  cardIndex: bm.cardIndex,
  faceUp: bm.faceUp,
})
