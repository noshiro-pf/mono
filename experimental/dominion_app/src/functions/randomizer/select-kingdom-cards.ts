import * as I from 'immutable'
import { TDCardProperty } from '~/types/dcard-property'

export const selectKingdomCards = (
  shuffledDcardsGen: IterableIterator<
    { index: number; dcardprop: TDCardProperty } | undefined
  >
) => {
  const KingdomCards10temp: number[] = []
  const EventCardsTemp: number[] = []
  const LandmarkCardsTemp: number[] = []

  // 10 Supply KingdomCards10 and Event, LandmarkCards
  while (KingdomCards10temp.length < 10) {
    const dcard = shuffledDcardsGen.next().value
    if (dcard === undefined) return 'error'
    const { dcardprop, index } = dcard
    if (dcardprop.category === '王国') {
      KingdomCards10temp.push(index)
    }
    if (EventCardsTemp.length + LandmarkCardsTemp.length < 2) {
      if (dcardprop.cardTypes.includes('EventCards')) {
        EventCardsTemp.push(index)
      }
      if (dcardprop.cardTypes.includes('LandmarkCards')) {
        LandmarkCardsTemp.push(index)
      }
    }
  }

  return {
    KingdomCards10: I.List(KingdomCards10temp),
    EventCards: I.List(EventCardsTemp),
    LandmarkCards: I.List(LandmarkCardsTemp),
  }
}
