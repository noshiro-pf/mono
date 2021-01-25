import * as I from 'immutable'
import { TGameResult } from '~/types/game-result'
import { IPlayerGameResult } from './player-game-result-type'

export const allPlayerGameResults = (
  gameResultsFiltered: I.List<TGameResult>
): I.List<IPlayerGameResult> => {
  // get all player names
  const userNames = new Set<string>()
  gameResultsFiltered.forEach((gr) =>
    gr.players.forEach((player) => {
      userNames.add(player.name)
    })
  )

  // initialize
  const rankScoreSumObj: {
    [key: string]: { numEachRank: number[]; scoreSum: number }
  } = {}

  userNames.forEach((name) => {
    rankScoreSumObj[name] = {
      numEachRank: [0, 0, 0, 0, 0, 0, 0],
      scoreSum: 0.0,
    }
  })

  // sum up rank & score of each player
  gameResultsFiltered.forEach((gr) =>
    gr.players.forEach((player) => {
      rankScoreSumObj[player.name].numEachRank[player.rank]++
      rankScoreSumObj[player.name].scoreSum += player.score
    })
  )

  // calculate numEachRank and score average
  const GRofEachPlayer: I.List<IPlayerGameResult> = I.List(userNames).map(
    (uname) => {
      const pl = rankScoreSumObj[uname]
      const count = pl.numEachRank.reduce((a, b) => a + b, 0)
      return {
        name: uname,
        count: count,
        numEachRank: I.List(pl.numEachRank),
        scoreSum: pl.scoreSum,
        scoreAverage: pl.scoreSum / count,
      }
    }
  )

  return GRofEachPlayer.sort((a, b) => a.scoreAverage - b.scoreAverage)
}
