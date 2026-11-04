import { Timestamp } from 'firebase/firestore';
import { toShuffleDef, type PlayerWithId } from '../types/index.mjs';
import { getShuffledPlayers } from './get-shuffled-players.mjs';

describe(getShuffledPlayers, () => {
  test('seats the n-th player of the shuffle definition at n', () => {
    const host = player('host');

    const g1 = player('g1');

    const g2 = player('g2');

    const g3 = player('g3');

    assert.deepStrictEqual(
      getShuffledPlayers([host, g1, g2, g3], toShuffleDef('3102')),
      [g3, g1, host, g2],
    );
  });

  test('leaves a seat nobody has joined for empty', () => {
    const host = player('host');

    assert.deepStrictEqual(getShuffledPlayers([host], toShuffleDef('1023')), [
      undefined,
      host,
      undefined,
      undefined,
    ]);
  });
});

const player = (id: string): PlayerWithId =>
  ({
    id,
    name: id,
    online: true,
    createdAt: Timestamp.fromMillis(0),
  }) as const;
