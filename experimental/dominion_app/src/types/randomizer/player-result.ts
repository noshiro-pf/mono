import * as I from 'immutable'
import { withDefaultMix } from 'typescript-utils/functions/with-default'
import {
  INumVictoryCardsJS,
  NumVictoryCards,
  NumVictoryCardsFromJS,
  NumVictoryCardsToJS,
  TNumVictoryCards,
} from '~/types/number-of-victory-cards'

interface IPlayerResult {
  uid: string // databaseKey of users
  name: string
  nameYomi: string
  selected: boolean
  VP: number
  turnOrder: number
  numVictoryCards: TNumVictoryCards
}

export interface IPlayerResultJS {
  uid: string // databaseKey of users
  name: string
  nameYomi: string
  selected: boolean
  VP: number
  turnOrder: number
  numVictoryCards: INumVictoryCardsJS
}

export type TPlayerResult = I.Record<IPlayerResult> & Readonly<IPlayerResult>

const PlayerResultRecordFactory = I.Record<IPlayerResult>({
  uid: '',
  name: '',
  nameYomi: '',
  selected: false,
  VP: 0,
  turnOrder: 0,
  numVictoryCards: NumVictoryCards(),
})

export const PlayerResult = (pr?: Partial<IPlayerResult>): TPlayerResult =>
  PlayerResultRecordFactory(pr)

export const PlayerResultFromJS = (
  pr?: Partial<IPlayerResultJS>
): TPlayerResult => {
  if (pr === undefined) return PlayerResult()
  const wd = withDefaultMix(pr, PlayerResult())
  return PlayerResult({
    uid: wd('uid'),
    name: wd('name'),
    nameYomi: wd('nameYomi'),
    selected: wd('selected'),
    VP: wd('VP'),
    turnOrder: wd('turnOrder'),
    numVictoryCards: NumVictoryCardsFromJS(wd('numVictoryCards')),
  })
}

export const PlayerResultToJS = (pr: TPlayerResult): IPlayerResultJS => ({
  uid: pr.uid,
  name: pr.name,
  nameYomi: pr.nameYomi,
  selected: pr.selected,
  VP: pr.VP,
  turnOrder: pr.turnOrder,
  numVictoryCards: NumVictoryCardsToJS(pr.numVictoryCards),
})
