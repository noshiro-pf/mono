import { produce } from 'immer';
import { type ReadonlyRecord, type Reducer } from 'ts-type-forge';
import { type Rect } from 'ts-utils-additional';
import { type NWES } from '../../types/index.mjs';

const initialState = (): ReadonlyRecord<NWES, Rect> =>
  ({
    S: { top: 0, left: 0, width: 0, height: 0 },
    W: { top: 0, left: 0, width: 0, height: 0 },
    N: { top: 0, left: 0, width: 0, height: 0 },
    E: { top: 0, left: 0, width: 0, height: 0 },
  }) as const;

export const playerNamePositionsReducer: Reducer<
  ReadonlyRecord<NWES, Rect> | undefined,
  readonly [NWES, Rect]
> = (state, [direction, rect]) =>
  produce(state ?? initialState(), (draft) => {
    draft[direction] = rect;
  });
