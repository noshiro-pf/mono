import * as I from 'immutable'

import { withDefaultMix } from 'typescript-utils/functions/with-default'

import {
  TSelectedCardsId,
  ISelectedCardsIdJS,
  SelectedCardsId,
  SelectedCardsIdFromJS,
  SelectedCardsIdToJS
} from './selected-cards-id'
import {
  IPlayerResultRankedJS,
  TPlayerResultRanked,
  PlayerResultRankedToJS,
  PlayerResultRanked,
  PlayerResultRankedFromJS
} from './player-result-ranked'

interface IGameResult {
  key: string
  date: string
  place: string
  players: I.List<TPlayerResultRanked>
  memo: string
  selectedExpansions: I.List<string>
  selectedCardsId: TSelectedCardsId
  lastTurnPlayer: string
}

export interface IGameResultJS {
  key: string // key of this game-result in fire-database
  date: string
  place: string
  players: IPlayerResultRankedJS[]
  memo: string
  selectedExpansions: string[]
  selectedCardsId: ISelectedCardsIdJS
  lastTurnPlayer: string
}

export type TGameResult = I.Record<IGameResult> & Readonly<IGameResult>

const GameResultRecordFactory = I.Record<IGameResult>({
  key: '',
  date: new Date().toLocaleString(),
  place: '',
  players: I.List<TPlayerResultRanked>(),
  memo: '',
  selectedExpansions: I.List<string>(),
  selectedCardsId: SelectedCardsId(),
  lastTurnPlayer: ''
})

export const GameResult = (gr?: Partial<IGameResult>): TGameResult =>
  GameResultRecordFactory(gr)

export const GameResultFromJS = (gr?: Partial<IGameResultJS>): TGameResult => {
  if (gr === undefined) return GameResult()
  const wd = withDefaultMix(gr, GameResult())
  return GameResult({
    key: wd('key'),
    date: wd('date'),
    place: wd('place'),
    players: I.List(wd('players')).map(PlayerResultRankedFromJS),
    memo: wd('memo'),
    selectedExpansions: I.List(wd('selectedExpansions')),
    selectedCardsId: SelectedCardsIdFromJS(gr.selectedCardsId),
    lastTurnPlayer: wd('lastTurnPlayer')
  })
}

export const GameResultToJS = (gr: TGameResult): IGameResultJS => ({
  key: gr.key,
  date: gr.date,
  place: gr.place,
  memo: gr.memo,
  selectedExpansions: gr.selectedExpansions.toArray(),
  lastTurnPlayer: gr.lastTurnPlayer,
  players: gr.players.map(p => PlayerResultRankedToJS(p)).toArray(),
  selectedCardsId: SelectedCardsIdToJS(gr.selectedCardsId)
})

// methods

const isHigher = (
  playerA: TPlayerResultRanked,
  playerB: TPlayerResultRanked,
  lastTurnOrder: number
): boolean => {
  if (playerA.VP > playerB.VP) return true
  if (playerA.VP < playerB.VP) return false
  // 同点だがBの方がAよりターン数が多いとき
  if (playerB.turnOrder <= lastTurnOrder && lastTurnOrder < playerA.turnOrder)
    return true
  // lastTurnPlayer記録の無いデータ用
  if (lastTurnOrder < 0 && playerB.turnOrder < playerA.turnOrder) return true
  return false
}

const getRanked = (
  lastTurnPlayer: string,
  players: I.List<TPlayerResultRanked>
): I.List<TPlayerResultRanked> => {
  const rankTemp: number[] = players.map(() => 1).toArray()

  const lastTurnPlayerResult =
    players.find(e => e.name === lastTurnPlayer) || PlayerResultRanked()
  const lastTurnOrder = lastTurnPlayerResult
    ? lastTurnPlayerResult.turnOrder
    : -1

  for (const player_i of players) {
    for (const [j, player_j] of players.entries()) {
      // 自分よりも高順位になる要素があるごとにrank++. 等しいときは何もしない.
      if (isHigher(player_i, player_j, lastTurnOrder)) rankTemp[j]++
    }
  }

  return players.map((p, i) =>
    PlayerResultRanked({
      VP: p.VP,
      name: p.name,
      numVictoryCards: p.numVictoryCards,
      rank: rankTemp[i],
      score: p.score,
      turnOrder: p.turnOrder
    })
  )
  // .map((p, i) => [i, p] as [number, TPlayerResultRanked])
  // .sort((a, b) => a.rank - b.rank);
  // .sort(([i, _pi], [j, _pj]) => (rankTemp[i] - rankTemp[j]))
  // .map(([_, x]) => x);
}

/**
 * 同着が複数人いるときのスコアを平均値にしたものを返す
 * (example)
 *   [input] scoreList = I.List([-1, 6, 3, 1, 0, -1, -1])
 *           rankList = I.List([1, 2, 2, 4])
 *   [output] I.List([-1, 6, 2, 1, 0, -1, -1])
 *
 * rank 1, 2, 2, 4の4人に対してスコアはそれぞれ6, 2, 2, 0となる
 */
const averagedScore = (
  scoreList: I.List<number>, // ex.) I.List([-1, 6, 3, 1, 0, -1, -1])
  rankList: I.List<number> // ex.) I.List([1, 2, 2, 4])
): I.List<number> => {
  const scoreListTemp = scoreList.toArray() // [-1, 6, 3, 1, 0, -1, -1]
  const rankListTemp = rankList
    .sort()
    .push(10000)
    .toArray() // 番兵付きrankList [1, 2, 2, 4, 10000]
  const tieRange = { begin: 0, end: 1 }
  while (tieRange.end < rankListTemp.length) {
    if (rankListTemp[tieRange.begin] === rankListTemp[tieRange.end]) {
      // update range
      tieRange.end = tieRange.end + 1
    } else {
      const currentRank = rankListTemp[tieRange.begin]
      const count = tieRange.end - tieRange.begin
      const sum = scoreList
        .slice(1 + tieRange.begin, 1 + tieRange.end)
        .reduce((a, b) => a + b, 0)
      scoreListTemp[currentRank] = Math.round((sum * 1000) / count) / 1000
      // update range
      tieRange.begin = tieRange.end
      tieRange.end = tieRange.end + 1
    }
  }

  return I.List(scoreListTemp) // ex.) [-1, 6, 2, 1, 0, -1, -1]
}

export const getScored = (
  scoreTable: I.List<I.List<number>>,
  players: I.List<TPlayerResultRanked>,
  lastTurnPlayer: string
): I.List<TPlayerResultRanked> => {
  const playersRanked = getRanked(lastTurnPlayer, players)
  const scoreList = averagedScore(
    scoreTable.get(players.size, I.List([0, 0, 0, 0, 0, 0, 0])),
    playersRanked.map(e => e.rank)
  )

  return playersRanked.map(e => e.set('score', scoreList.get(e.rank, 0)))
}

// test

console.assert(
  averagedScore(I.List([-1, 6, 3, 1, 0, -1, -1]), I.List([1, 2, 3, 4])).equals(
    I.List([-1, 6, 3, 1, 0, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 6, 3, 1, 0, -1, -1]), I.List([1, 1, 3, 4])).equals(
    I.List([-1, 4.5, 3, 1, 0, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 6, 3, 1, 0, -1, -1]), I.List([1, 2, 2, 4])).equals(
    I.List([-1, 6, 2, 1, 0, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 6, 3, 1, 0, -1, -1]), I.List([1, 2, 3, 3])).equals(
    I.List([-1, 6, 3, 0.5, 0, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 6, 3, 1, 0, -1, -1]), I.List([1, 1, 3, 3])).equals(
    I.List([-1, 4.5, 3, 0.5, 0, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 6, 3, 1, 0, -1, -1]), I.List([1, 1, 1, 4])).equals(
    I.List([-1, 3.333, 3, 1, 0, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 6, 3, 1, 0, -1, -1]), I.List([1, 2, 2, 2])).equals(
    I.List([-1, 6, 1.333, 1, 0, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 6, 3, 1, 0, -1, -1]), I.List([1, 1, 1, 1])).equals(
    I.List([-1, 2.5, 3, 1, 0, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 5, 2.5, 0, -1, -1, -1]), I.List([1, 2, 3])).equals(
    I.List([-1, 5, 2.5, 0, -1, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 5, 2.5, 0, -1, -1, -1]), I.List([1, 1, 3])).equals(
    I.List([-1, 3.75, 2.5, 0, -1, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 5, 2.5, 0, -1, -1, -1]), I.List([1, 2, 2])).equals(
    I.List([-1, 5, 1.25, 0, -1, -1, -1])
  )
)

console.assert(
  averagedScore(I.List([-1, 5, 2.5, 0, -1, -1, -1]), I.List([1, 1, 1])).equals(
    I.List([-1, 2.5, 2.5, 0, -1, -1, -1])
  )
)
