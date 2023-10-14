import * as I from 'immutable'
import { getRandomElement } from 'typescript-utils/functions/list'
import { DCardProperty, TDCardProperty } from '~/types/dcard-property'

export const selectObelisk = (
  KingdomCards10: I.List<number>,
  BaneCard: I.List<number>,
  LandmarkCards: I.List<number>,
  dcardlist: I.List<TDCardProperty>,
): I.List<number> => {
  if (
    // prettier-ignore
    LandmarkCards
      .map(e => dcardlist.get(e, DCardProperty()).nameEng)
      .includes('Obelisk')
  ) {
    const KingdomCards = KingdomCards10.concat(BaneCard)
    const LooterExists: boolean = KingdomCards.some((k) =>
      dcardlist.get(k, DCardProperty()).cardTypes.includes('Looter'),
    )
    const ruinsIndex: number = dcardlist.findIndex((e) => e.nameJp === '廃墟')
    const actionCards: I.List<number> = KingdomCards.filter((k) =>
      dcardlist.get(k, DCardProperty()).cardTypes.includes('Action'),
    ).concat(LooterExists ? [ruinsIndex] : [])

    return I.List([getRandomElement(actionCards)])
  } else {
    return I.List([])
  }
}
