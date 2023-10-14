import * as I from 'immutable'
import * as str from 'typescript-utils/functions/string'
import { withDefaultMix } from 'typescript-utils/functions/with-default'
import {
  ISelectedCardsJS,
  SelectedCards,
  SelectedCardsToJS,
  TSelectedCards,
} from '~/types/selected-cards'
import {
  ISelectedCardsCheckboxJS,
  SelectedCardsCheckbox,
  SelectedCardsCheckboxToJS,
  TSelectedCardsCheckbox,
} from '~/types/selected-cards-checkbox-values'
import {
  BlackMarketPileCard,
  IBlackMarketPileCardJS,
  TBlackMarketPileCard,
} from '../black-market-pile-card'
import { BlackMarketPhase } from './black-market-phase.enum'
import {
  IPlayerResultJS,
  PlayerResult,
  PlayerResultToJS,
  TPlayerResult,
} from './player-result'

interface IRandomizerGroup {
  key: string // set only when newly created
  createdDate: string // set only when newly created
  name: string // set only when newly created
  password: string // set only when newly created
  selectedExpansions: I.List<string>
  selectedCardsCheckbox: TSelectedCardsCheckbox
  BlackMarketPileShuffled: I.List<TBlackMarketPileCard>
  BlackMarketPhase: number
  selectedCardsHistory: I.List<TSelectedCards>
  selectedIndexInHistory: number
  newGameResultDialogOpened: boolean
  resetVPCalculator: number
  newGameResult: {
    players: I.List<TPlayerResult>
    place: string
    memo: string
    lastTurnPlayerName: string
  }
}

export interface IRandomizerGroupJS {
  key: string // set only when newly created
  createdDate: string // set only when newly created
  name: string // set only when newly created
  password: string // set only when newly created
  selectedExpansions: string[]
  selectedCardsCheckbox: ISelectedCardsCheckboxJS
  BlackMarketPileShuffled: IBlackMarketPileCardJS[]
  BlackMarketPhase: number
  selectedCardsHistory: ISelectedCardsJS[]
  selectedIndexInHistory: number
  newGameResultDialogOpened: boolean
  resetVPCalculator: number
  newGameResult: {
    players: IPlayerResultJS[]
    place: string
    memo: string
    lastTurnPlayerName: string
  }
}

export type TRandomizerGroup = I.Record<IRandomizerGroup> &
  Readonly<IRandomizerGroup>

const RandomizerGroupRecordFactory = I.Record<IRandomizerGroup>({
  key: '',
  createdDate: new Date().toLocaleString(),
  name: '',
  password: '',
  selectedExpansions: I.List(),
  selectedCardsCheckbox: SelectedCardsCheckbox(),
  BlackMarketPileShuffled: I.List(),
  BlackMarketPhase: BlackMarketPhase.init,
  selectedCardsHistory: I.List(),
  selectedIndexInHistory: 0,
  newGameResultDialogOpened: false,
  resetVPCalculator: 0,
  newGameResult: I.Record({
    players: I.List(),
    place: '',
    memo: '',
    lastTurnPlayerName: '',
  })(),
})

export const RandomizerGroup = (
  rmg?: Partial<IRandomizerGroup>,
): TRandomizerGroup => RandomizerGroupRecordFactory(rmg)

export const RandomizerGroupFromJS = (
  rmg?: Partial<IRandomizerGroupJS>,
): TRandomizerGroup => {
  const dfl = RandomizerGroup()
  if (rmg === undefined) return dfl
  const wd = withDefaultMix(rmg, dfl)
  const wdngr = withDefaultMix(wd('newGameResult'), dfl.newGameResult)

  return RandomizerGroupRecordFactory({
    key: wd('key'),
    createdDate: wd('createdDate'),
    name: wd('name'),
    password: wd('password'),
    selectedExpansions: I.List(wd('selectedExpansions')),
    selectedCardsCheckbox: SelectedCardsCheckbox(wd('selectedCardsCheckbox')),
    BlackMarketPileShuffled: I.List(wd('BlackMarketPileShuffled')).map(
      BlackMarketPileCard,
    ),
    BlackMarketPhase: wd('BlackMarketPhase'),
    selectedCardsHistory: I.List(wd('selectedCardsHistory'))
      .map(SelectedCards)
      .sort((a, b) => b.timestamp - a.timestamp),
    selectedIndexInHistory: wd('selectedIndexInHistory'),
    newGameResultDialogOpened: wd('newGameResultDialogOpened'),
    resetVPCalculator: wd('resetVPCalculator'),
    newGameResult: {
      players: I.List(wdngr('players'))
        .map((p) => PlayerResult(p))
        .sort((a, b) => str.cmp(a.nameYomi, b.nameYomi)),
      place: wdngr('place'),
      memo: wdngr('memo'),
      lastTurnPlayerName: wdngr('lastTurnPlayerName'),
    },
  })
}

export const RandomizerGroupToJS = (
  rmg: TRandomizerGroup,
): IRandomizerGroupJS => ({
  key: rmg.key,
  createdDate: rmg.createdDate,
  name: rmg.name,
  password: rmg.password,
  selectedExpansions: rmg.selectedExpansions.toArray(),
  selectedCardsCheckbox: SelectedCardsCheckboxToJS(rmg.selectedCardsCheckbox),
  BlackMarketPileShuffled: rmg.BlackMarketPileShuffled.toArray(),
  BlackMarketPhase: rmg.BlackMarketPhase,
  selectedCardsHistory: rmg.selectedCardsHistory
    .map(SelectedCardsToJS)
    .toArray(),
  selectedIndexInHistory: rmg.selectedIndexInHistory,
  newGameResultDialogOpened: rmg.newGameResultDialogOpened,
  resetVPCalculator: rmg.resetVPCalculator,
  newGameResult: {
    players: rmg.newGameResult.players.map(PlayerResultToJS).toArray(),
    place: rmg.newGameResult.place,
    memo: rmg.newGameResult.memo,
    lastTurnPlayerName: rmg.newGameResult.lastTurnPlayerName,
  },
})
