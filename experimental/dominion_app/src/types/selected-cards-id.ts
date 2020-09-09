import * as I from 'immutable'

import { withDefaultMix } from 'typescript-utils/functions/with-default'

interface ISelectedCardsId {
  Prosperity: boolean
  DarkAges: boolean
  KingdomCards10: I.List<string>
  BaneCard: I.List<string>
  EventCards: I.List<string>
  Obelisk: I.List<string>
  LandmarkCards: I.List<string>
  ProjectCards: I.List<string>
  BlackMarketPile: I.List<string>
}

export interface ISelectedCardsIdJS {
  Prosperity: boolean
  DarkAges: boolean
  KingdomCards10: string[]
  BaneCard: string[]
  EventCards: string[]
  Obelisk: string[]
  LandmarkCards: string[]
  ProjectCards: string[]
  BlackMarketPile: string[]
}

export type TSelectedCardsId = I.Record<ISelectedCardsId> &
  Readonly<ISelectedCardsId>

const SelectedCardsIdRecordFactory = I.Record<ISelectedCardsId>({
  Prosperity: false,
  DarkAges: false,
  KingdomCards10: I.List<string>(),
  BaneCard: I.List<string>(),
  EventCards: I.List<string>(),
  Obelisk: I.List<string>(),
  LandmarkCards: I.List<string>(),
  ProjectCards: I.List<string>(),
  BlackMarketPile: I.List<string>()
})

export const SelectedCardsId = (
  sc?: Partial<ISelectedCardsId>
): TSelectedCardsId => SelectedCardsIdRecordFactory(sc)

export const SelectedCardsIdFromJS = (
  sc?: Partial<ISelectedCardsIdJS>
): TSelectedCardsId => {
  if (sc === undefined) return SelectedCardsId()
  const wd = withDefaultMix(sc, SelectedCardsId())
  return SelectedCardsId({
    Prosperity: wd('Prosperity'),
    DarkAges: wd('DarkAges'),
    KingdomCards10: I.List(wd('KingdomCards10')),
    BaneCard: I.List(wd('BaneCard')),
    EventCards: I.List(wd('EventCards')),
    Obelisk: I.List(wd('Obelisk')),
    LandmarkCards: I.List(wd('LandmarkCards')),
    ProjectCards: I.List(wd('ProjectCards')),
    BlackMarketPile: I.List(wd('BlackMarketPile'))
  })
}

export const SelectedCardsIdToJS: (
  scid: TSelectedCardsId
) => ISelectedCardsIdJS = scid => ({
  Prosperity: scid.Prosperity,
  DarkAges: scid.DarkAges,
  KingdomCards10: scid.KingdomCards10.toArray(),
  BaneCard: scid.BaneCard.toArray(),
  EventCards: scid.EventCards.toArray(),
  Obelisk: scid.Obelisk.toArray(),
  LandmarkCards: scid.LandmarkCards.toArray(),
  ProjectCards: scid.ProjectCards.toArray(),
  BlackMarketPile: scid.BlackMarketPile.toArray()
})
