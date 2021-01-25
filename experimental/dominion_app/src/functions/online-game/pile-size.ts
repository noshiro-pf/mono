import * as I from 'immutable'
import { DCardProperty, TDCardProperty } from '~/types/dcard-property'

export const pileSize = (
  cardPropertyList: I.List<TDCardProperty>,
  cardIndex: number,
  numPlayer: number,
  DarkAges: boolean
): number => {
  switch (cardPropertyList.get(cardIndex, DCardProperty()).cardId) {
    case 'Copper':
      return 60
    case 'Silver':
      return 40
    case 'Gold':
      return 30
    case 'Platinum':
      return 12
    case 'Potion':
      return 16
    case 'Curse':
      return (numPlayer - 1) * 10
    default:
      break
  }
  if (cardPropertyList.get(cardIndex, DCardProperty()).cardId === 'Estate') {
    if (DarkAges) return numPlayer > 2 ? 12 : 8
    return numPlayer * 3 + (numPlayer > 2 ? 12 : 8)
  }
  if (
    cardPropertyList
      .get(cardIndex, DCardProperty())
      .cardTypes.includes('Victory')
  ) {
    return numPlayer > 2 ? 12 : 8
  }
  if (
    cardPropertyList.get(cardIndex, DCardProperty()).cardTypes.includes('Prize')
  )
    return 1
  return 10 /* KingdomCard default */
}
