import { tp } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import type { PlayerIndex, PlayerWithId, ShuffleDef } from '../types/index.mjs';

/**
 * The players in the seats the room's `shuffleDef` puts them in:
 * `shuffled[n] = players[shuffleDef[n]]`, `undefined` for a seat nobody has
 * joined for yet.
 *
 * ```txt
 * players:    [host, g1, g2, g3]  (in the order they joined)
 * shuffleDef: '3102'
 * shuffled:   [g3, g1, host, g2]
 * ```
 */
export const getShuffledPlayers = <P extends PlayerWithId>(
  players: readonly P[],
  shuffleDef: ShuffleDef,
): FixedLengthTuple<4, P | undefined> => {
  const seats = seatsOf(shuffleDef);

  return tp(
    players[seats[0]],
    players[seats[1]],
    players[seats[2]],
    players[seats[3]],
  );
};

/** A digit of a `ShuffleDef`, each of which is one of `0`–`3`. */
const digitOf = (digit: string | undefined): PlayerIndex => {
  switch (digit) {
    case '1':
      return 1;
    case '2':
      return 2;
    case '3':
      return 3;
    case '0':
    case undefined:
      return 0;
    default:
      return 0;
  }
};

const seatsOf = (shuffleDef: ShuffleDef): FixedLengthTuple<4, PlayerIndex> =>
  tp(
    digitOf(shuffleDef.at(0)),
    digitOf(shuffleDef.at(1)),
    digitOf(shuffleDef.at(2)),
    digitOf(shuffleDef.at(3)),
  );
