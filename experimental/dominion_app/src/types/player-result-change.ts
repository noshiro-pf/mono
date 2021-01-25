import * as I from 'immutable'
import { TPlayerResultRanked } from './player-result-ranked'

interface IPlayerResultChange {
  playerIndex: number
  key: keyof TPlayerResultRanked
  value: string | number
}

export type TPlayerResultChange = I.Record<IPlayerResultChange> &
  Readonly<IPlayerResultChange>

export const PlayerResultChange = I.Record<IPlayerResultChange>({
  playerIndex: -1,
  key: 'VP',
  value: -1,
})
