import {
  fillPlayerIndex,
  type PlayerIndex,
  type PlayerWithId,
  type ShuffleDef,
} from '../types';

/**
 * Players: [host?, g1?, g2?, g3?] shuffleDef: { 0-> 3, 1 -> 1, 2 -> 0, 3 -> 2 }
 *
 * | v
 *
 * PlayersShuffled (expected) : [g3, 31, host, g2] playersShuffled[N] =
 * players[shuffleDef[N]]
 *
 * TurnPlayerIndexBeforeShuffling = shuffleDef[turnPlayerIndex]
 */
const getShuffleDefMap = (
  shuffleDef: ShuffleDef,
): ArrayOfLength<4, PlayerIndex> => [
  fillPlayerIndex(Num.from(shuffleDef.at(0))),
  fillPlayerIndex(Num.from(shuffleDef.at(1))),
  fillPlayerIndex(Num.from(shuffleDef.at(2))),
  fillPlayerIndex(Num.from(shuffleDef.at(3))),
];

export const getShuffledPlayers = (
  players: readonly PlayerWithId[],
  shuffleDef: ShuffleDef,
): ArrayOfLength<4, PlayerWithId | undefined> => {
  const shuffleDefMap: ArrayOfLength<4, PlayerIndex> =
    getShuffleDefMap(shuffleDef);

  return [
    players[shuffleDefMap[0]],
    players[shuffleDefMap[1]],
    players[shuffleDefMap[2]],
    players[shuffleDefMap[3]],
  ];
};

export const getTurnPlayerIndexBeforeShuffling = (
  turnPlayerIndex: PlayerIndex,
  shuffleDef: ShuffleDef,
): PlayerIndex => getShuffleDefMap(shuffleDef)[turnPlayerIndex];
