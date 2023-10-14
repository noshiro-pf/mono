import * as I from 'immutable'
import { DCardProperty, TDCardProperty } from '~/types/dcard-property'
import { TSelectedCards, getAllCards } from '~/types/selected-cards'

export const usePotion = (
  selectedCards: TSelectedCards,
  dcardlist: I.List<TDCardProperty>,
) =>
  getAllCards(selectedCards).some(
    (i) => dcardlist.get(i, DCardProperty()).effects.cost.potion > 0,
  )
