import type { ReadonlyRecord, Rect, ReducerType } from '@noshiro/ts-utils';
import { produce } from 'immer';
import type { Direction } from '../../types';

const initialState = (): Record<Direction, Rect> => ({
  S: { top: 0, left: 0, width: 0, height: 0 },
  W: { top: 0, left: 0, width: 0, height: 0 },
  N: { top: 0, left: 0, width: 0, height: 0 },
  E: { top: 0, left: 0, width: 0, height: 0 },
});

export const playerNamePositionsReducer: ReducerType<
  ReadonlyRecord<Direction, Rect> | undefined,
  readonly [Direction, Rect]
> = (state, [direction, rect]) =>
  produce(state ?? initialState(), (draft) => {
    draft[direction] = rect;
  });
