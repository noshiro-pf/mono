import * as I from 'immutable'
import { withDefaultMix } from 'typescript-utils/functions/with-default'

interface ISelectedCards {
  timestamp: number
  Prosperity: boolean
  DarkAges: boolean
  KingdomCards10: I.List<number>
  BaneCard: I.List<number>
  EventCards: I.List<number>
  LandmarkCards: I.List<number>
  ProjectCards: I.List<number>
  Obelisk: I.List<number>
  BlackMarketPile: I.List<number>
}

export interface ISelectedCardsJS {
  timestamp: number
  Prosperity: boolean
  DarkAges: boolean
  KingdomCards10: number[]
  BaneCard: number[]
  EventCards: number[]
  LandmarkCards: number[]
  ProjectCards: number[]
  Obelisk: number[]
  BlackMarketPile: number[]
}

export type TSelectedCards = I.Record<ISelectedCards> & Readonly<ISelectedCards>

export type TSelectedCardsKeys =
  | 'KingdomCards10'
  | 'BaneCard'
  | 'EventCards'
  | 'LandmarkCards'
  | 'ProjectCards'
  | 'Obelisk'
  | 'BlackMarketPile'

const SelectedCardsRecordFactory = I.Record<ISelectedCards>({
  timestamp: Date.now(),
  Prosperity: false,
  DarkAges: false,
  KingdomCards10: I.List<number>(),
  BaneCard: I.List<number>(),
  EventCards: I.List<number>(),
  LandmarkCards: I.List<number>(),
  ProjectCards: I.List<number>(),
  Obelisk: I.List<number>(),
  BlackMarketPile: I.List<number>(),
})

export const SelectedCards = (sc?: Partial<ISelectedCards>): TSelectedCards =>
  SelectedCardsRecordFactory(sc)

export const SelectedCardsFromJS = (
  sc?: Partial<ISelectedCardsJS>
): TSelectedCards => {
  if (sc === undefined) return SelectedCards()
  const wd = withDefaultMix(sc, SelectedCards())
  return SelectedCards({
    timestamp: wd('timestamp'),
    Prosperity: wd('Prosperity'),
    DarkAges: wd('DarkAges'),
    KingdomCards10: I.List(wd('KingdomCards10')),
    BaneCard: I.List(wd('BaneCard')),
    EventCards: I.List(wd('EventCards')),
    LandmarkCards: I.List(wd('LandmarkCards')),
    ProjectCards: I.List(wd('ProjectCards')),
    Obelisk: I.List(wd('Obelisk')),
    BlackMarketPile: I.List(wd('BlackMarketPile')),
  })
}

export const SelectedCardsToJS = (sc: TSelectedCards): ISelectedCardsJS => ({
  timestamp: sc.timestamp,
  Prosperity: sc.Prosperity,
  DarkAges: sc.DarkAges,
  KingdomCards10: sc.KingdomCards10.toArray(),
  BaneCard: sc.BaneCard.toArray(),
  EventCards: sc.EventCards.toArray(),
  LandmarkCards: sc.LandmarkCards.toArray(),
  ProjectCards: sc.ProjectCards.toArray(),
  Obelisk: sc.Obelisk.toArray(),
  BlackMarketPile: sc.BlackMarketPile.toArray(),
})

// methods

export const getAllCards = (sc: ISelectedCards): I.List<number> =>
  I.List<number>().concat(
    sc.KingdomCards10,
    sc.BaneCard,
    sc.EventCards,
    sc.LandmarkCards,
    sc.ProjectCards,
    sc.Obelisk,
    sc.BlackMarketPile
  )

export const isEmpty = (sc: ISelectedCards): boolean =>
  sc.KingdomCards10.isEmpty()
