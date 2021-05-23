import type { InitializedObservable } from '@noshiro/syncflow';
import { scan, subject } from '@noshiro/syncflow';
import type { ReadonlyRecord, Rect } from '@noshiro/ts-utils';
import { playerNamePositionsReducer } from '../../state';
import type { NWES } from '../../types';

const playerNamePositionsAction$ = subject<readonly [NWES, Rect]>();

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
