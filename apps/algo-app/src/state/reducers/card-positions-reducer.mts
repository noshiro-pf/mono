import { produce } from 'immer';
import {
  type FixedLengthTuple,
  type ReadonlyRecord,
  type Reducer,
} from 'ts-type-forge';
import { type Rect } from 'ts-utils-additional';
import { type CardColor, type CardNumber } from '../../types/index.mjs';

const defaultPosition = (): Rect =>
  ({ top: 0, left: 0, width: 0, height: 0 }) as const;

const initialState = (): ReadonlyRecord<
  CardColor,
  FixedLengthTuple<12, Rect>
> =>
  ({
    black: [
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
    ],
    white: [
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
      defaultPosition(),
    ],
  }) as const;

export const cardPositionsReducer: Reducer<
  ReadonlyRecord<CardColor, FixedLengthTuple<12, Rect>> | undefined,
  readonly [CardColor, CardNumber, Rect]
> = (state, [color, number, rect]) =>
  produce(state ?? initialState(), (draft) => {
    draft[color][number] = rect;
  });
