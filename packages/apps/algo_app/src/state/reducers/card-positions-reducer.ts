import type {
  ArrayOfLength,
  ReadonlyRecord,
  Rect,
  ReducerType,
} from '@noshiro/ts-utils';
import { produce } from 'immer';
import type { CardColor, CardNumber } from '../../types';

const defaultPosition = (): Rect => ({ top: 0, left: 0, width: 0, height: 0 });

const initialState = (): Record<CardColor, ArrayOfLength<12, Rect>> => ({
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
});

export const cardPositionsReducer: ReducerType<
  ReadonlyRecord<CardColor, ArrayOfLength<12, Rect>> | undefined,
  readonly [CardColor, CardNumber, Rect]
> = (state, [color, number, rect]) =>
  produce(state === undefined ? initialState() : state, (draft) => {
    draft[color][number] = rect;
  });
