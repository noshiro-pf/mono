import * as I from 'immutable'
import { withDefaultMix } from 'typescript-utils/functions/with-default'

interface ISelectedCardsCheckbox {
  KingdomCards10: I.List<boolean>
  BaneCard: I.List<boolean>
  EventCards: I.List<boolean>
  LandmarkCards: I.List<boolean>
  ProjectCards: I.List<boolean>
  Obelisk: I.List<boolean>
  BlackMarketPile: I.List<boolean>
}

export interface ISelectedCardsCheckboxJS {
  KingdomCards10: boolean[]
  BaneCard: boolean[]
  EventCards: boolean[]
  LandmarkCards: boolean[]
  ProjectCards: boolean[]
  Obelisk: boolean[]
  BlackMarketPile: boolean[]
}

export type TSelectedCardsCheckbox = I.Record<ISelectedCardsCheckbox> &
  Readonly<ISelectedCardsCheckbox>

const SelectedCardsCheckboxRecordFactory = I.Record<ISelectedCardsCheckbox>({
  KingdomCards10: I.Repeat(false, 10).toList(),
  BaneCard: I.Repeat(false, 1).toList(),
  EventCards: I.Repeat(false, 2).toList(),
  LandmarkCards: I.Repeat(false, 2).toList(),
  ProjectCards: I.Repeat(false, 2).toList(),
  Obelisk: I.Repeat(false, 1).toList(),
  BlackMarketPile: I.Repeat(false, 15).toList(),
})

export const SelectedCardsCheckbox = (
  scchk?: Partial<TSelectedCardsCheckbox>
): TSelectedCardsCheckbox => SelectedCardsCheckboxRecordFactory(scchk)

export const SelectedCardsCheckboxFromJS = (
  scchk?: Partial<ISelectedCardsCheckboxJS>
): TSelectedCardsCheckbox => {
  if (scchk === undefined) return SelectedCardsCheckbox()
  const wd = withDefaultMix(scchk, SelectedCardsCheckbox())
  return SelectedCardsCheckbox({
    KingdomCards10: I.List(wd('KingdomCards10')),
    BaneCard: I.List(wd('BaneCard')),
    EventCards: I.List(wd('EventCards')),
    LandmarkCards: I.List(wd('LandmarkCards')),
    ProjectCards: I.List(wd('ProjectCards')),
    Obelisk: I.List(wd('Obelisk')),
    BlackMarketPile: I.List(wd('BlackMarketPile')),
  })
}

export const SelectedCardsCheckboxToJS = (
  scchk: TSelectedCardsCheckbox
): ISelectedCardsCheckboxJS => ({
  KingdomCards10: scchk.KingdomCards10.toArray(),
  BaneCard: scchk.BaneCard.toArray(),
  EventCards: scchk.EventCards.toArray(),
  LandmarkCards: scchk.LandmarkCards.toArray(),
  ProjectCards: scchk.ProjectCards.toArray(),
  Obelisk: scchk.Obelisk.toArray(),
  BlackMarketPile: scchk.BlackMarketPile.toArray(),
})
