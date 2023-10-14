import * as I from 'immutable'
import { TDCardProperty } from '~/types/dcard-property'

export const toListIndex = (
  dcardlist: I.List<TDCardProperty>,
  cardId: string,
) => dcardlist.findIndex((e) => e.cardId === cardId)
