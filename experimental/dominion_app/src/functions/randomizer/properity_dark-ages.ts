import * as I from 'immutable'
import { TDCardProperty } from '~/types/dcard-property'

export const ProperityDarkAges = (
  dcardlist: I.List<TDCardProperty>,
  KingdomCards10: I.List<number>
) => {
  const firstSelectedCard = dcardlist.get(KingdomCards10.get(0, -1))
  const lastSelectedCard = dcardlist.get(KingdomCards10.get(9, -1))
  if (firstSelectedCard === undefined) {
    throw new Error('firstSelectedCard is null')
  }
  if (lastSelectedCard === undefined) {
    throw new Error('lastSelectedCard is null')
  }
  return {
    Prosperity: firstSelectedCard.expansionName.includes('繁栄'),
    DarkAges: lastSelectedCard.expansionName.includes('暗黒時代'),
  }
}
