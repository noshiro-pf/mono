import { Optional } from 'ts-data-forge';
import type { Rect } from 'ts-utils-additional';
import { createPositionStore } from './position-store.mjs';

describe(createPositionStore, () => {
  test('knows no position until one is measured', () => {
    const store = createPositionStore();

    assert.isUndefined(Optional.unwrap(store.cardPositions.getSnapshot()));

    assert.isUndefined(
      Optional.unwrap(store.playerNamePositions.getSnapshot()),
    );
  });

  test('keeps the position measured for each card', () => {
    const store = createPositionStore();

    store.cardPositionsDispatcher(['black', 3, rectA]);

    store.cardPositionsDispatcher(['white', 11, rectB]);

    const positions = Optional.unwrap(store.cardPositions.getSnapshot());

    assert.isDefined(positions);

    assert.deepStrictEqual(positions.black[3], rectA);

    assert.deepStrictEqual(positions.white[11], rectB);
  });

  test('keeps the position measured for each player name', () => {
    const store = createPositionStore();

    store.playerNamePositionsDispatcher(['N', rectA]);

    store.playerNamePositionsDispatcher(['N', rectB]);

    assert.deepStrictEqual(
      Optional.unwrap(store.playerNamePositions.getSnapshot())?.N,
      rectB,
    );
  });

  test('two stores do not share their positions', () => {
    const first = createPositionStore();

    const second = createPositionStore();

    first.playerNamePositionsDispatcher(['S', rectA]);

    assert.isUndefined(
      Optional.unwrap(second.playerNamePositions.getSnapshot()),
    );
  });
});

const rectA: Rect = { left: 1, top: 2, width: 3, height: 4 } as const;

const rectB: Rect = { left: 5, top: 6, width: 7, height: 8 } as const;
