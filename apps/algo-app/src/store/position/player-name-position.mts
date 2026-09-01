import { scan, source, type InitializedObservable } from 'synstate';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type Rect } from 'ts-utils-additional';
import { playerNamePositionsReducer } from '../../state/index.mjs';
import { type NWES } from '../../types/index.mjs';

const playerNamePositionsAction$ = source<readonly [NWES, Rect]>();

export const playerNamePositionsDispatcher = (
  action: readonly [NWES, Rect],
): void => {
  playerNamePositionsAction$.next(action);
};

export const playerNamePositions$: InitializedObservable<
  ReadonlyRecord<NWES, Rect> | undefined
> = playerNamePositionsAction$.pipe(
  scan(playerNamePositionsReducer, undefined),
);
