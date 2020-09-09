import * as I from 'immutable'

import { withDefaultMix } from 'typescript-utils/functions/with-default'

import {
  TNumVictoryCards,
  INumVictoryCardsJS,
  NumVictoryCardsToJS,
  NumVictoryCardsFromJS,
  NumVictoryCards
} from './number-of-victory-cards'

interface IPlayerResultRanked {
  name: string
  turnOrder: number
  rank: number
  score: number
  VP: number
  numVictoryCards: TNumVictoryCards
}

export interface IPlayerResultRankedJS {
  name: string
  turnOrder: number
  rank: number // <- calculated locally
  score: number // <- calculated locally
  VP: number // <- calculated locally
  numVictoryCards: INumVictoryCardsJS
}

export type TPlayerResultRanked = I.Record<IPlayerResultRanked> &
  Readonly<IPlayerResultRanked>

const PlayerResultRankedRecordFactory = I.Record<IPlayerResultRanked>({
  name: '',
  turnOrder: 0,
  rank: 0,
  score: 0,
  VP: 0,
  numVictoryCards: NumVictoryCards()
})

export const PlayerResultRanked = (
  pr?: Partial<IPlayerResultRanked>
): TPlayerResultRanked => PlayerResultRankedRecordFactory(pr)

export const PlayerResultRankedFromJS = (
  pr?: Partial<IPlayerResultRankedJS>
): TPlayerResultRanked => {
  if (pr === undefined) return PlayerResultRanked()
  const wd = withDefaultMix(pr, PlayerResultRanked())
  return PlayerResultRanked({
    name: wd('name'),
    turnOrder: wd('turnOrder'),
    rank: wd('rank'),
    score: wd('score'),
    VP: wd('VP'),
    numVictoryCards: NumVictoryCardsFromJS(pr.numVictoryCards)
  })
}

export const PlayerResultRankedToJS = (
  pr: TPlayerResultRanked
): IPlayerResultRankedJS => ({
  name: pr.name,
  turnOrder: pr.turnOrder,
  rank: pr.rank,
  score: pr.score,
  VP: pr.VP,
  numVictoryCards: NumVictoryCardsToJS(pr.numVictoryCards)
})
