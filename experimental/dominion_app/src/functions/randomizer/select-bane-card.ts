import * as I from 'immutable'
import { DCardProperty, TDCardProperty } from '~/types/dcard-property'

export const selectBaneCard = (
  KingdomCards10: I.List<number>,
  dcardlist: I.List<TDCardProperty>,
  shuffledDcardsGen: IterableIterator<
    { index: number; dcardprop: TDCardProperty } | undefined
  >
): I.List<number> | 'error' => {
  if (
    // prettier-ignore
    KingdomCards10
      .map(e => dcardlist.get(e, DCardProperty()).nameJp)
      .includes('魔女娘')
  ) {
    while (true) {
      const dcard = shuffledDcardsGen.next().value
      if (dcard === undefined) return 'error'
      const { dcardprop, index } = dcard
      if (
        dcardprop.effects.cost.debt <= 0 &&
        dcardprop.effects.cost.potion <= 0 &&
        dcardprop.effects.cost.coin >= 2 &&
        dcardprop.effects.cost.coin <= 3
      ) {
        return I.List([index])
      }
    }
  } else {
    return I.List([])
  }
}
