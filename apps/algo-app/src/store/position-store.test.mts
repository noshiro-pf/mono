import type { Rect } from 'ts-utils-additional';
import { createPositionStore } from './position-store.mjs';

describe(createPositionStore, () => {
  test('knows no position until one is measured', () => {
    const store = createPositionStore();

    assert.isUndefined(store.cardPositions.getSnapshot().value);

    assert.isUndefined(store.playerNamePositions.getSnapshot().value);
  });

  test('keeps the position measured for each card', () => {
    const store = createPositionStore();

    store.cardPositionsDispatcher(['black', 3, rectA]);

    store.cardPositionsDispatcher(['white', 11, rectB]);

    const positions = store.cardPositions.getSnapshot().value;

    assert.isDefined(positions);

    assert.deepStrictEqual(positions.black[3], rectA);

    assert.deepStrictEqual(positions.white[11], rectB);
  });

  test('keeps the position measured for each player name', () => {
    const store = createPositionStore();

    store.playerNamePositionsDispatcher(['N', rectA]);

    store.playerNamePositionsDispatcher(['N', rectB]);

    assert.deepStrictEqual(
      store.playerNamePositions.getSnapshot().value?.N,
      rectB,
    );
  });

  test('two stores do not share their positions', () => {
    const first = createPositionStore();

    const second = createPositionStore();

    first.playerNamePositionsDispatcher(['S', rectA]);

    assert.isUndefined(second.playerNamePositions.getSnapshot().value);
  });
});

const rectA: Rect = { left: 1, top: 2, width: 3, height: 4 } as const;

const rectB: Rect = { left: 5, top: 6, width: 7, height: 8 } as const;
