import type { Rect } from '@noshiro/ts-utils-additional';
import { produce } from 'immer';
import type { NWES } from '../../types';

const initialState = (): Record<NWES, Rect> => ({
  S: { top: 0, left: 0, width: 0, height: 0 },
  W: { top: 0, left: 0, width: 0, height: 0 },
  N: { top: 0, left: 0, width: 0, height: 0 },
  E: { top: 0, left: 0, width: 0, height: 0 },
});

export const playerNamePositionsReducer: ReducerType<
  Record<NWES, Rect> | undefined,
  readonly [NWES, Rect]
> = (state, [direction, rect]) =>
  produce(state ?? initialState(), (draft) => {
    draft[direction] = rect;
  });
