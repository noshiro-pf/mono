import * as I from 'immutable'
import { DCardProperty, TDCardProperty } from '~/types/dcard-property'

export const selectBlackMarketPile = (
  KingdomCards10: I.List<number>,
  BaneCard: I.List<number>,
  dcardlist: I.List<TDCardProperty>,
  shuffledDcardsGen: IterableIterator<
    { index: number; dcardprop: TDCardProperty } | undefined
  >
): I.List<number> | 'error' => {
  if (
    KingdomCards10.concat(BaneCard)
      .map((e) => dcardlist.get(e, DCardProperty().nameJp))
      .includes('闇市場')
  ) {
    const BlackMarketPileTemp: number[] = []

    while (BlackMarketPileTemp.length < 15) {
      const dcard = shuffledDcardsGen.next().value
      if (dcard === undefined) return 'error'
      const { dcardprop, index } = dcard
      if (dcardprop.category === '王国') {
        BlackMarketPileTemp.push(index)
      }
    }
    return I.List(BlackMarketPileTemp)
  } else {
    return I.List([])
  }
}
