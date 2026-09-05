import { scan, source, type InitializedObservable } from 'synstate';
import { type FixedLengthTuple, type ReadonlyRecord } from 'ts-type-forge';
import { type Rect } from 'ts-utils-additional';
import { cardPositionsReducer } from '../../state/index.mjs';
import { type CardColor, type CardNumber } from '../../types/index.mjs';

const cardPositionsAction$ = source<readonly [CardColor, CardNumber, Rect]>();

export const cardPositionsDispatcher = (
  action: readonly [CardColor, CardNumber, Rect],
): void => {
  cardPositionsAction$.next(action);
};

export const cardPositions$: InitializedObservable<
  ReadonlyRecord<CardColor, FixedLengthTuple<12, Rect>> | undefined
> = cardPositionsAction$.pipe(scan(cardPositionsReducer, undefined));
