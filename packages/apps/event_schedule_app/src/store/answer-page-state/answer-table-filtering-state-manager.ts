import type { TagProps } from '@blueprintjs/core';
import { queryParamKey as queryParamKeys } from '../../constants';
import type { AnswerTableFilteringState } from '../../types';
import { answers$ } from '../fetched-values-state';
import { router } from '../router';
import { AnswerTableFilteringStateReducer } from './answer-table-filtering-state-reducer';

export namespace AnswerTableFilteringAndSortingManager {
  const {
    state$: _sortKeyAndOrder$,
    setState: setSortOrderAndKey,
    resetState: _resetSortOrderAndKey,
  } = createState<readonly ['date' | 'score', 'asc' | 'desc']>(['date', 'asc']);

  export const sortKeyAndOrder$ = _sortKeyAndOrder$;

  const [_answerTableFilteringState$, answerTableFilteringStateDispatch] =
    createReducer(
      AnswerTableFilteringStateReducer.reducer,
      AnswerTableFilteringStateReducer.initialState
    );

  export const answerTableFilteringState$ = _answerTableFilteringState$;

  const saveSortingStateToQueryParams = ([sortKey, sortOrder]: readonly [
    'date' | 'score',
    'asc' | 'desc'
  ]): void => {
    const keyDef = queryParamKeys.answerTableState;

    router.updateQueryParams((urlSearchParams) => {
      if (sortKey === 'date') {
        urlSearchParams.delete(keyDef.sortBy);
      } else {
        urlSearchParams.set(keyDef.sortBy, sortKey);
      }
      if (sortOrder === 'asc') {
        urlSearchParams.delete(keyDef.sortOrder);
      } else {
        urlSearchParams.set(keyDef.sortOrder, sortOrder);
      }
    }, false);
  };

  const saveFilteringStateToQueryParams = (
    state: AnswerTableFilteringState
  ): void => {
    const keyDef = queryParamKeys.answerTableState;

    router.updateQueryParams((urlSearchParams) => {
      if (state.good.filteringEnabled) {
        urlSearchParams.set(keyDef.goodMin, Num.toString(10)(state.good.min));
        urlSearchParams.set(keyDef.goodMax, Num.toString(10)(state.good.max));
      } else {
        urlSearchParams.delete(keyDef.goodMin);
        urlSearchParams.delete(keyDef.goodMax);
      }

      if (state.fair.filteringEnabled) {
        urlSearchParams.set(keyDef.fairMin, Num.toString(10)(state.fair.min));
        urlSearchParams.set(keyDef.fairMax, Num.toString(10)(state.fair.max));
      } else {
        urlSearchParams.delete(keyDef.fairMin);
        urlSearchParams.delete(keyDef.fairMax);
      }

      if (state.poor.filteringEnabled) {
        urlSearchParams.set(keyDef.poorMin, Num.toString(10)(state.poor.min));
        urlSearchParams.set(keyDef.poorMax, Num.toString(10)(state.poor.max));
      } else {
        urlSearchParams.delete(keyDef.poorMin);
        urlSearchParams.delete(keyDef.poorMax);
      }
    }, false);
  };

  const resetSortOrderAndKey = (): void => {
    _resetSortOrderAndKey();

    saveSortingStateToQueryParams(tp('date', 'asc'));
  };

  export const onDatetimeSortChange = (state: 'asc' | 'desc'): void => {
    setSortOrderAndKey(['date', state]);

    saveSortingStateToQueryParams(tp('date', state));
  };

  export const onScoreSortChange = (state: 'asc' | 'desc'): void => {
    setSortOrderAndKey(['score', state]);

    saveSortingStateToQueryParams(tp('score', state));
  };

  export const disableFilteringAnswerTableOfIcon = (
    iconId: AnswerIconId
  ): void => {
    const state = answerTableFilteringStateDispatch({
      type: 'disableFiltering',
      iconId,
    });

    saveFilteringStateToQueryParams(state);
  };

  export const enableFilteringAnswerTableOfIcon = (
    iconId: AnswerIconId
  ): void => {
    const state = answerTableFilteringStateDispatch({
      type: 'enableFiltering',
      iconId,
    });

    saveFilteringStateToQueryParams(state);
  };

  export const setMinCountOfIconAnswerTable = (
    iconId: AnswerIconId,
    value: number
  ): void => {
    const state = answerTableFilteringStateDispatch({
      type: 'setMin',
      iconId,
      value,
    });

    saveFilteringStateToQueryParams(state);
  };

  export const setStateAnswerTableFilteringIconMax = (
    iconId: AnswerIconId,
    value: number
  ): void => {
    const state = answerTableFilteringStateDispatch({
      type: 'setMax',
      iconId,
      value,
    });

    saveFilteringStateToQueryParams(state);
  };

  /* tags */

  const dc = dict.answerPage.answers.tagInput;

  const tags$: InitializedObservable<
    DeepReadonly<{ value: string; props: TagProps }[]>
  > = combineLatestI([sortKeyAndOrder$, answerTableFilteringState$]).chain(
    mapI(([sortKeyAndOrder, filteringState]) =>
      [
        sortKeyAndOrder[0] === 'date' && sortKeyAndOrder[1] === 'asc'
          ? undefined
          : {
              value: dc.sort(...sortKeyAndOrder),
              props: {
                intent: 'success' as const,
                onRemove: resetSortOrderAndKey,
              },
            },
        filteringState.good.filteringEnabled
          ? {
              value: dc.good(filteringState.good.min, filteringState.good.max),
              props: {
                intent: 'primary' as const,
                onRemove: () => {
                  disableFilteringAnswerTableOfIcon('good');
                },
              },
            }
          : undefined,
        filteringState.fair.filteringEnabled
          ? {
              value: dc.fair(filteringState.fair.min, filteringState.fair.max),
              props: {
                intent: 'primary' as const,
                onRemove: () => {
                  disableFilteringAnswerTableOfIcon('fair');
                },
              },
            }
          : undefined,
        filteringState.poor.filteringEnabled
          ? {
              value: dc.poor(filteringState.poor.min, filteringState.poor.max),
              props: {
                intent: 'primary' as const,
                onRemove: () => {
                  disableFilteringAnswerTableOfIcon('poor');
                },
              },
            }
          : undefined,
      ].filter(isNotUndefined)
    )
  );

  export const tagValues$: InitializedObservable<readonly string[]> =
    tags$.chain(mapI((tags) => tags.map((t) => t.value)));

  export const tagProps$: InitializedObservable<
    (value: DeepReadonly<ReactNode>, index: number) => DeepReadonly<TagProps>
  > = tags$.chain(
    mapI(
      (tags) =>
        (value: DeepReadonly<ReactNode>): DeepReadonly<TagProps> =>
          tags.find((t) => t.value === value)?.props ?? {
            intent: 'none' as const,
          }
    )
  );

  export const clearTags = (): void => {
    resetSortOrderAndKey();

    const state = answerTableFilteringStateDispatch({
      type: 'reset',
    });

    saveFilteringStateToQueryParams(state);
  };

  /* subscriptions */

  const mut_subscribedValues: {
    queryParams: IMap<string, string> | undefined;
  } = {
    queryParams: undefined,
  };

  router.queryParams$.subscribe((v) => {
    mut_subscribedValues.queryParams = v;
  });

  answers$.chain(skip(0)).subscribe((answers) => {
    if (answers !== undefined) {
      const state = answerTableFilteringStateDispatch({
        type: 'setUpperLimit',
        upperLimit: answers.length,
      });

      saveFilteringStateToQueryParams(state);
    }
  });

  export const initializeAnswerTableFilteringStateUpperLimit = (): void => {
    if (
      Maybe.isSome(answers$.currentValue) &&
      answers$.currentValue.value !== undefined
    ) {
      answerTableFilteringStateDispatch({
        type: 'setUpperLimit',
        upperLimit: answers$.currentValue.value.length,
      });

      // don't emit
    }
  };

  export const restoreAnswerTableFilteringStateFromQueryParams = (): void => {
    const queryParams = mut_subscribedValues.queryParams;

    if (queryParams === undefined) return;

    const keyDef = queryParamKeys.answerTableState;

    const sortKey =
      queryParams.get(keyDef.sortBy) === 'score' ? 'score' : 'date';

    const sortOrder =
      queryParams.get(keyDef.sortOrder) === 'desc' ? 'desc' : 'asc';

    setSortOrderAndKey([sortKey, sortOrder]);

    answerTableFilteringStateDispatch({
      type: 'setFromUrlQueryParams',
      values: {
        good: {
          min: mapNullable(queryParams.get(keyDef.goodMin), Num.parseInt),
          max: mapNullable(queryParams.get(keyDef.goodMax), Num.parseInt),
        },
        fair: {
          min: mapNullable(queryParams.get(keyDef.fairMin), Num.parseInt),
          max: mapNullable(queryParams.get(keyDef.fairMax), Num.parseInt),
        },
        poor: {
          min: mapNullable(queryParams.get(keyDef.poorMin), Num.parseInt),
          max: mapNullable(queryParams.get(keyDef.poorMax), Num.parseInt),
        },
      },
    });
  };
}
