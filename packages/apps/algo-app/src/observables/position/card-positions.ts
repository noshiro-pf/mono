import type { Rect } from '@noshiro/ts-utils-additional';
import { cardPositionsReducer } from '../../state';
import type { CardColor, CardNumber } from '../../types';

const cardPositionsAction$ = source<readonly [CardColor, CardNumber, Rect]>();

export const cardPositionsDispatcher = (
  action: readonly [CardColor, CardNumber, Rect]
): void => {
  cardPositionsAction$.next(action);
};

export const cardPositions$: InitializedObservable<
  ReadonlyRecord<CardColor, ArrayOfLength<12, Rect>> | undefined
> = cardPositionsAction$.chain(scan(cardPositionsReducer, undefined));