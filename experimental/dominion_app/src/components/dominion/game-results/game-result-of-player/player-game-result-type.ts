import * as I from 'immutable'

export interface IPlayerGameResult {
  name: string
  count: number
  numEachRank: I.List<number>
  scoreSum: number
  scoreAverage: number
}
