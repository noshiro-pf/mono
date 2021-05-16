import type { InitializedObservable } from '@noshiro/syncflow';
import { scan, subject } from '@noshiro/syncflow';
import type { ReadonlyRecord, Rect } from '@noshiro/ts-utils';
import { playerNamePositionsReducer } from '../../../state';
import type { Direction } from '../../../types';

const playerNamePositionsAction$ = subject<readonly [Direction, Rect]>();

export const playerNamePositionsDispatcher = (
  action: readonly [Direction, Rect]
): void => {
  playerNamePositionsAction$.next(action);
};

export const playerNamePositions$: InitializedObservable<
  ReadonlyRecord<Direction, Rect> | undefined
> = playerNamePositionsAction$.chain(
  scan(playerNamePositionsReducer, undefined)
);
