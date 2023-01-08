import type { TagProps } from '@blueprintjs/core';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { AnswerFilterState } from '../../functions';
import type { AnswersScore, DetailedFilterIcon } from '../../types';
import { answers$, eventSchedule$ } from '../fetching-state';
import { AnswerFilterQueryParam } from './answer-filter-query-param';

export namespace AnswerFilterAndSortStore {
  const {
    state$: _sortKeyAndOrder$,
    setState: setSortOrderAndKey,
    resetState: _resetSortOrderAndKey,
  } = createState<readonly ['date' | 'score', 'asc' | 'desc']>(['date', 'asc']);

  export const sortKeyAndOrder$ = _sortKeyAndOrder$;

  const [_filterState$, filterStateDispatch] = createReducer(
    AnswerFilterState.reducer,
    AnswerFilterState.initialState
  );
  export const filterState$ = _filterState$;

  const resetSortOrderAndKey = (): void => {
    AnswerFilterQueryParam.saveSortStateToQueryParams(_resetSortOrderAndKey());
  };

  const resetState = (): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({ type: 'reset' })
    );
  };

  export const onDatetimeSortOrderChange = (state: 'asc' | 'desc'): void => {
    AnswerFilterQueryParam.saveSortStateToQueryParams(
      setSortOrderAndKey(['date', state])
    );
  };

  export const onScoreSortOrderChange = (state: 'asc' | 'desc'): void => {
    AnswerFilterQueryParam.saveSortStateToQueryParams(
      setSortOrderAndKey(['score', state])
    );
  };

  export const disableFilteringByIcon = (iconId: DetailedFilterIcon): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'icon',
        action: {
          type: 'disableFiltering',
          iconId,
        },
      })
    );
  };

  export const enableFilteringByIcon = (iconId: DetailedFilterIcon): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'icon',
        action: {
          type: 'enableFiltering',
          iconId,
        },
      })
    );
  };

  export const setMinCountOfIcon = (
    iconId: DetailedFilterIcon,
    value: number
  ): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'icon',
        action: {
          type: 'setMin',
          iconId,
          value,
        },
      })
    );
  };

  export const setMaxCountOfIcon = (
    iconId: DetailedFilterIcon,
    value: number
  ): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'icon',
        action: {
          type: 'setMax',
          iconId,
          value,
        },
      })
    );
  };

  export const setMinCountOfGoodIcon = (value: number): void => {
    setMinCountOfIcon('good', value);
  };
  export const setMinCountOfFairIcon = (value: number): void => {
    setMinCountOfIcon('fair', value);
  };
  export const setMinCountOfPoorIcon = (value: number): void => {
    setMinCountOfIcon('poor', value);
  };
  export const setGoodPlusFairMin = (value: number): void => {
    setMinCountOfIcon('goodPlusFair', value);
  };
  export const setFairPlusPoorMin = (value: number): void => {
    setMinCountOfIcon('fairPlusPoor', value);
  };

  export const setMaxCountOfGoodIcon = (value: number): void => {
    setMaxCountOfIcon('good', value);
  };
  export const setMaxCountOfFairIcon = (value: number): void => {
    setMaxCountOfIcon('fair', value);
  };
  export const setMaxCountOfPoorIcon = (value: number): void => {
    setMaxCountOfIcon('poor', value);
  };
  export const setGoodPlusFairMax = (value: number): void => {
    setMaxCountOfIcon('goodPlusFair', value);
  };
  export const setFairPlusPoorMax = (value: number): void => {
    setMaxCountOfIcon('fairPlusPoor', value);
  };

  export const setEnabledFilteringByGoodIcon = (value: boolean): void => {
    if (value) {
      enableFilteringByIcon('good');
    } else {
      disableFilteringByIcon('good');
    }
  };
  export const setEnabledFilteringByFairIcon = (value: boolean): void => {
    if (value) {
      enableFilteringByIcon('fair');
    } else {
      disableFilteringByIcon('fair');
    }
  };
  export const setEnabledFilteringByPoorIcon = (value: boolean): void => {
    if (value) {
      enableFilteringByIcon('poor');
    } else {
      disableFilteringByIcon('poor');
    }
  };
  export const setEnabledFilteringByGoodPlusFair = (value: boolean): void => {
    if (value) {
      enableFilteringByIcon('goodPlusFair');
    } else {
      disableFilteringByIcon('goodPlusFair');
    }
  };
  export const setEnabledFilteringByFairPlusPoor = (value: boolean): void => {
    if (value) {
      enableFilteringByIcon('fairPlusPoor');
    } else {
      disableFilteringByIcon('fairPlusPoor');
    }
  };

  export const iconOfSpecifiedRespondentCheckState$: InitializedObservable<
    | DeepReadonly<
        {
          key: string;
          username: string;
          checkState: Record<
            AnswerIconIdWithNone,
            {
              checked: boolean;
              onCheck: (value: boolean) => void;
            }
          >;
        }[]
      >
    | undefined
  > = combineLatestI([answers$, filterState$]).chain(
    mapI(([answers, filterState]) =>
      answers === undefined
        ? undefined
        : answers.map((ans) => ({
            key: ans.id,
            username: ans.user.name,
            checkState: {
              good: {
                checked: !filterState.iconOfSpecifiedRespondent.falseKeys.has([
                  ans.user.name,
                  'good',
                ]),
                onCheck: (value: boolean) => {
                  setIconOfSpecifiedRespondentCheckState(
                    ans.user.name,
                    'good',
                    value
                  );
                },
              },
              fair: {
                checked: !filterState.iconOfSpecifiedRespondent.falseKeys.has([
                  ans.user.name,
                  'fair',
                ]),
                onCheck: (value: boolean) => {
                  setIconOfSpecifiedRespondentCheckState(
                    ans.user.name,
                    'fair',
                    value
                  );
                },
              },
              poor: {
                checked: !filterState.iconOfSpecifiedRespondent.falseKeys.has([
                  ans.user.name,
                  'poor',
                ]),
                onCheck: (value: boolean) => {
                  setIconOfSpecifiedRespondentCheckState(
                    ans.user.name,
                    'poor',
                    value
                  );
                },
              },
              none: {
                checked: !filterState.iconOfSpecifiedRespondent.falseKeys.has([
                  ans.user.name,
                  'none',
                ]),
                onCheck: (value: boolean) => {
                  setIconOfSpecifiedRespondentCheckState(
                    ans.user.name,
                    'none',
                    value
                  );
                },
              },
            },
          }))
    )
  );

  export const setOnlyFilledDate = (checked: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({ type: 'set-filledDateOnly', checked })
    );
  };

  export const setEnabledFilteringByScoreRange = (value: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-enabled-filtering-by-scoreRange',
        value,
      })
    );
  };

  export const setScoreRange = (
    range: Readonly<{ min: AnswersScore; max: AnswersScore }>
  ): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({ type: 'set-scoreRange', range })
    );
  };

  export const setDateRangeDefaultValue = (
    range: Readonly<{ start: YearMonthDate; end: YearMonthDate }>
  ): void => {
    // don't call AnswerFilterQueryParam.saveFilterStateToQueryParams
    filterStateDispatch({ type: 'set-dateRangeDefaultValue', range });
  };

  export const setEnabledFilteringByDayOfWeek = (value: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({ type: 'set-enabled-filtering-by-dayOfWeek', value })
    );
  };

  export const setSundayCheck = (checked: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-dayOfWeek',
        value: { checked, key: 'Sun' },
      })
    );
  };
  export const setMondayCheck = (checked: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-dayOfWeek',
        value: { checked, key: 'Mon' },
      })
    );
  };
  export const setTuesdayCheck = (checked: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-dayOfWeek',
        value: { checked, key: 'Tue' },
      })
    );
  };
  export const setWednesdayCheck = (checked: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-dayOfWeek',
        value: { checked, key: 'Wed' },
      })
    );
  };
  export const setThursdayCheck = (checked: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-dayOfWeek',
        value: { checked, key: 'Thr' },
      })
    );
  };
  export const setFridayCheck = (checked: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-dayOfWeek',
        value: { checked, key: 'Fri' },
      })
    );
  };
  export const setSaturdayCheck = (checked: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-dayOfWeek',
        value: { checked, key: 'Sat' },
      })
    );
  };

  export const setEnabledFilteringByDateRange = (value: boolean): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({ type: 'set-enabled-filtering-by-dateRange', value })
    );
  };

  export const setDateRange = (
    range: Readonly<{
      start: YearMonthDate | undefined;
      end: YearMonthDate | undefined;
    }>
  ): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({ type: 'set-dateRange', range })
    );
  };

  export const setEnabledFilteringByIconOfSpecifiedRespondent = (
    value: boolean
  ): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-enabled-filtering-by-iconOfSpecifiedRespondent',
        value,
      })
    );
  };

  const setIconOfSpecifiedRespondentCheckState = (
    username: UserName,
    iconId: AnswerIconIdWithNone,
    value: boolean
  ): void => {
    AnswerFilterQueryParam.saveFilterStateToQueryParams(
      filterStateDispatch({
        type: 'set-iconOfSpecifiedRespondent',
        value,
        username,
        iconId,
      })
    );
  };

  export const restoreFromQueryParams = (): void => {
    AnswerFilterQueryParam.restoreFromQueryParams(
      setSortOrderAndKey,
      filterStateDispatch
    );
  };

  /* tags */

  const dc = dict.answerPage.answers.tagInput;

  const tags$: InitializedObservable<
    DeepReadonly<{ value: string; props: TagProps }[]>
  > = combineLatestI([sortKeyAndOrder$, filterState$]).chain(
    mapI(
      ([
        sortKeyAndOrder,
        {
          iconState,
          filledDateOnly,
          scoreRange,
          dateRange,
          dayOfWeek,
          iconOfSpecifiedRespondent,
        },
      ]) =>
        [
          {
            value: dc.sort(...sortKeyAndOrder),
            props: {
              intent: 'success' as const,
              onRemove: resetSortOrderAndKey,
            },
          },

          dateRange.enabled &&
          isNotUndefined(dateRange.value.start) &&
          isNotUndefined(dateRange.value.end)
            ? {
                value: dc.dateRange(dateRange.value.start, dateRange.value.end),
                props: {
                  intent: 'primary' as const,
                  onRemove: () => {
                    setEnabledFilteringByDateRange(false);
                  },
                },
              }
            : undefined,

          dayOfWeek.enabled
            ? {
                value: dc.dayOfWeek(dayOfWeek.value),
                props: {
                  intent: 'primary' as const,
                  onRemove: () => {
                    setEnabledFilteringByDayOfWeek(false);
                  },
                },
              }
            : undefined,

          scoreRange.enabled
            ? {
                value: dc.scoreRange(scoreRange.value),
                props: {
                  intent: 'primary' as const,
                  onRemove: () => {
                    setEnabledFilteringByScoreRange(false);
                  },
                },
              }
            : undefined,

          iconState.good.enabled
            ? {
                value: dc.good(iconState.good.min, iconState.good.max),
                props: {
                  intent: 'primary' as const,
                  onRemove: () => {
                    disableFilteringByIcon('good');
                  },
                },
              }
            : undefined,
          iconState.fair.enabled
            ? {
                value: dc.fair(iconState.fair.min, iconState.fair.max),
                props: {
                  intent: 'primary' as const,
                  onRemove: () => {
                    disableFilteringByIcon('fair');
                  },
                },
              }
            : undefined,
          iconState.poor.enabled
            ? {
                value: dc.poor(iconState.poor.min, iconState.poor.max),
                props: {
                  intent: 'primary' as const,
                  onRemove: () => {
                    disableFilteringByIcon('poor');
                  },
                },
              }
            : undefined,
          iconState.goodPlusFair.enabled
            ? {
                value: dc.goodPlusFair(
                  iconState.goodPlusFair.min,
                  iconState.goodPlusFair.max
                ),
                props: {
                  intent: 'primary' as const,
                  onRemove: () => {
                    disableFilteringByIcon('goodPlusFair');
                  },
                },
              }
            : undefined,
          iconState.fairPlusPoor.enabled
            ? {
                value: dc.fairPlusPoor(
                  iconState.fairPlusPoor.min,
                  iconState.fairPlusPoor.max
                ),
                props: {
                  intent: 'primary' as const,
                  onRemove: () => {
                    disableFilteringByIcon('fairPlusPoor');
                  },
                },
              }
            : undefined,

          filledDateOnly
            ? {
                value:
                  dict.answerPage.detailedFilter.filterItems.filledDateOnly,
                props: {
                  intent: 'none' as const,
                  onRemove: () => {
                    setOnlyFilledDate(false);
                  },
                },
              }
            : undefined,

          iconOfSpecifiedRespondent.enabled
            ? {
                value: dc.iconOfSpecifiedRespondent,
                props: {
                  intent: 'none' as const,
                  onRemove: () => {
                    setEnabledFilteringByIconOfSpecifiedRespondent(false);
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
    resetState();
  };

  /* subscriptions */

  answers$
    .chain(filter(isNotUndefined))
    .chain(map((answers) => answers.length))
    .chain(distinctUntilChanged())
    .subscribe((numAnswers) => {
      filterStateDispatch({
        type: 'icon',
        action: {
          type: 'setUpperLimit',
          upperLimit: numAnswers,
        },
      });
    });

  eventSchedule$
    .chain(filter(isNotUndefined))
    .chain(
      map((eventSchedule) => ({
        start: Arr.first(eventSchedule.datetimeRangeList).ymd,
        end: Arr.last(eventSchedule.datetimeRangeList).ymd,
      }))
    )
    .chain(distinctUntilChanged(deepEqual))
    .subscribe((range) => {
      setDateRangeDefaultValue(range);
    });
}
