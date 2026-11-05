import { map, type InitializedObservable } from 'synstate';
import type { AnswerFilterState } from '../../../functions/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';

/** A part of the answer page's filters, drawn as it changes. */
export const filterView = <A,>(
  pick: (state: AnswerFilterState) => A,
): InitializedObservable<A> =>
  AnswerFilterAndSortStore.filterState$.pipe(map(pick));
