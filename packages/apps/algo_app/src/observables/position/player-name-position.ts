import type { Rect } from '@noshiro/ts-utils-additional';
import { playerNamePositionsReducer } from '../../state';
import type { NWES } from '../../types';

const playerNamePositionsAction$ = source<readonly [NWES, Rect]>();

export const playerNamePositionsDispatcher = (
  action: readonly [NWES, Rect]
): void => {
  playerNamePositionsAction$.next(action);
};

export const playerNamePositions$: InitializedObservable<
  ReadonlyRecord<NWES, Rect> | undefined
> = playerNamePositionsAction$.chain(
  scan(playerNamePositionsReducer, undefined)
);
