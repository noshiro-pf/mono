/**
 * Where the cards and the player names are drawn, as the components measure
 * them; the balloons are placed against these.
 */

import { scan, source, type InitializedObservable } from 'synstate';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import type { Rect } from 'ts-utils-additional';
import {
  cardPositionsReducer,
  playerNamePositionsReducer,
} from '../state/index.mjs';
import type { CardColor, CardNumber, NWES } from '../types/index.mjs';

export type PositionStore = Readonly<{
  cardPositions: InitializedObservable<
    ReadonlyRecord<CardColor, FixedLengthTuple<12, Rect>> | undefined
  >;
  cardPositionsDispatcher: (
    action: readonly [CardColor, CardNumber, Rect],
  ) => void;
  playerNamePositions: InitializedObservable<
    ReadonlyRecord<NWES, Rect> | undefined
  >;
  playerNamePositionsDispatcher: (action: readonly [NWES, Rect]) => void;
}>;

export const createPositionStore = (): PositionStore => {
  const cardPositionsAction = source<readonly [CardColor, CardNumber, Rect]>();

  const cardPositions = cardPositionsAction.pipe(
    scan(cardPositionsReducer, undefined),
  );

  const playerNamePositionsAction = source<readonly [NWES, Rect]>();

  const playerNamePositions = playerNamePositionsAction.pipe(
    scan(playerNamePositionsReducer, undefined),
  );

  return {
    cardPositions,
    cardPositionsDispatcher: (action) => {
      cardPositionsAction.next(action);
    },
    playerNamePositions,
    playerNamePositionsDispatcher: (action) => {
      playerNamePositionsAction.next(action);
    },
  };
};
