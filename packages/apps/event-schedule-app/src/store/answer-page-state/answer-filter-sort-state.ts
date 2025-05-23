import { type TagProps } from '@blueprintjs/core';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { AnswerFilterState } from '../../functions';
import {
  type AnswerRank,
  type AnswersScore,
  type DetailedFilterIcon,
} from '../../types';
import { AnswersStore, eventSchedule$ } from '../fetching-state';
import { AnswerFilterQueryParam } from './answer-filter-query-param';

const {
  state: sortKeyAndOrder$,
  setState: setSortOrderAndKey,
  resetState: resetSortOrderAndKey_,
} = createState<readonly ['date' | 'score', 'asc' | 'desc']>(['date', 'asc']);

const {
  useCurrentValue: useFilterState,
  state: filterState$,
  dispatch: filterStateDispatch,
} = createReducer(AnswerFilterState.reducer, AnswerFilterState.initialState);

const resetSortOrderAndKey = (): void => {
  AnswerFilterQueryParam.saveSortStateToQueryParams(resetSortOrderAndKey_());
};

const resetState = (): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({ type: 'reset' }),
  );
};

const onDatetimeSortOrderChange = (state: 'asc' | 'desc'): void => {
  AnswerFilterQueryParam.saveSortStateToQueryParams(
    setSortOrderAndKey(['date', state]),
  );
};

const onScoreSortOrderChange = (state: 'asc' | 'desc'): void => {
  AnswerFilterQueryParam.saveSortStateToQueryParams(
    setSortOrderAndKey(['score', state]),
  );
};

const disableFilteringByIcon = (iconId: DetailedFilterIcon): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'icon',
      action: {
        type: 'disableFiltering',
        iconId,
      },
    }),
  );
};

const enableFilteringByIcon = (iconId: DetailedFilterIcon): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'icon',
      action: {
        type: 'enableFiltering',
        iconId,
      },
    }),
  );
};

const setMinCountOfIcon = (
  iconId: DetailedFilterIcon,
  value: SafeUint,
): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'icon',
      action: {
        type: 'setMin',
        iconId,
        value,
      },
    }),
  );
};

const setMaxCountOfIcon = (
  iconId: DetailedFilterIcon,
  value: SafeUint,
): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'icon',
      action: {
        type: 'setMax',
        iconId,
        value,
      },
    }),
  );
};

const setMinCountOfGoodIcon = (value: SafeUint): void => {
  setMinCountOfIcon('good', value);
};
const setMinCountOfFairIcon = (value: SafeUint): void => {
  setMinCountOfIcon('fair', value);
};
const setMinCountOfPoorIcon = (value: SafeUint): void => {
  setMinCountOfIcon('poor', value);
};
const setGoodPlusFairMin = (value: SafeUint): void => {
  setMinCountOfIcon('goodPlusFair', value);
};
const setFairPlusPoorMin = (value: SafeUint): void => {
  setMinCountOfIcon('fairPlusPoor', value);
};

const setMaxCountOfGoodIcon = (value: SafeUint): void => {
  setMaxCountOfIcon('good', value);
};
const setMaxCountOfFairIcon = (value: SafeUint): void => {
  setMaxCountOfIcon('fair', value);
};
const setMaxCountOfPoorIcon = (value: SafeUint): void => {
  setMaxCountOfIcon('poor', value);
};
const setGoodPlusFairMax = (value: SafeUint): void => {
  setMaxCountOfIcon('goodPlusFair', value);
};
const setFairPlusPoorMax = (value: SafeUint): void => {
  setMaxCountOfIcon('fairPlusPoor', value);
};

const setEnabledFilteringByGoodIcon = (value: boolean): void => {
  if (value) {
    enableFilteringByIcon('good');
  } else {
    disableFilteringByIcon('good');
  }
};
const setEnabledFilteringByFairIcon = (value: boolean): void => {
  if (value) {
    enableFilteringByIcon('fair');
  } else {
    disableFilteringByIcon('fair');
  }
};
const setEnabledFilteringByPoorIcon = (value: boolean): void => {
  if (value) {
    enableFilteringByIcon('poor');
  } else {
    disableFilteringByIcon('poor');
  }
};
const setEnabledFilteringByGoodPlusFair = (value: boolean): void => {
  if (value) {
    enableFilteringByIcon('goodPlusFair');
  } else {
    disableFilteringByIcon('goodPlusFair');
  }
};
const setEnabledFilteringByFairPlusPoor = (value: boolean): void => {
  if (value) {
    enableFilteringByIcon('fairPlusPoor');
  } else {
    disableFilteringByIcon('fairPlusPoor');
  }
};

const displayOnlyCandidateDatesWithZeroPoorIcon = (): void => {
  setMaxCountOfPoorIcon(toSafeUint(0));
  setEnabledFilteringByPoorIcon(true);
};

const displayOnlyCandidateDatesOfRank1to3 = (): void => {
  setRank(3);
  setEnabledFilteringByRank(true);
};

const iconOfSpecifiedRespondentCheckState$: InitializedObservable<
  DeepReadonly<
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
> = combine([AnswersStore.answers$, filterState$]).chain(
  map(
    ([answers, filterState]) =>
      answers?.map((ans) => ({
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
                value,
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
                value,
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
                value,
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
                value,
              );
            },
          },
        },
      })) ?? [],
  ),
);

const respondentCheckState$: InitializedObservable<
  DeepReadonly<
    {
      key: string;
      username: string;
      checkState: {
        checked: boolean;
        onCheck: (value: boolean) => void;
      };
    }[]
  >
> = combine([AnswersStore.answers$, filterState$]).chain(
  map(
    ([answers, filterState]) =>
      answers?.map((ans) => ({
        key: ans.id,
        username: ans.user.name,
        checkState: {
          checked: !filterState.respondent.falseKeys.has(ans.user.name),
          onCheck: (value: boolean) => {
            setRespondentCheckState(ans.user.name, value);
          },
        },
      })) ?? [],
  ),
);

const setOnlyFilledDate = (checked: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({ type: 'set-filledDateOnly', checked }),
  );
};

const setEnabledFilteringByRank = (value: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-enabled-filtering-by-rank',
      value,
    }),
  );
};

const setRank = (rank: AnswerRank): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({ type: 'set-rank', rank }),
  );
};

const setEnabledFilteringByScoreRange = (value: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-enabled-filtering-by-scoreRange',
      value,
    }),
  );
};

const setScoreRange = (
  range: Readonly<{ min: AnswersScore; max: AnswersScore }>,
): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({ type: 'set-scoreRange', range }),
  );
};

const setScoreRangeMin = (min: AnswersScore): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({ type: 'set-scoreRange-min', min }),
  );
};

const setScoreRangeMax = (max: AnswersScore): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({ type: 'set-scoreRange-max', max }),
  );
};

const setDateRangeDefaultValue = (
  range: Readonly<{ start: YearMonthDate; end: YearMonthDate }>,
): void => {
  // don't call AnswerFilterQueryParam.saveFilterStateToQueryParams
  filterStateDispatch({ type: 'set-dateRangeDefaultValue', range });
};

const setEnabledFilteringByDayOfWeek = (value: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({ type: 'set-enabled-filtering-by-dayOfWeek', value }),
  );
};

const setSundayCheck = (checked: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-dayOfWeek',
      value: { checked, key: 'Sun' },
    }),
  );
};
const setMondayCheck = (checked: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-dayOfWeek',
      value: { checked, key: 'Mon' },
    }),
  );
};
const setTuesdayCheck = (checked: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-dayOfWeek',
      value: { checked, key: 'Tue' },
    }),
  );
};
const setWednesdayCheck = (checked: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-dayOfWeek',
      value: { checked, key: 'Wed' },
    }),
  );
};
const setThursdayCheck = (checked: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-dayOfWeek',
      value: { checked, key: 'Thr' },
    }),
  );
};
const setFridayCheck = (checked: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-dayOfWeek',
      value: { checked, key: 'Fri' },
    }),
  );
};
const setSaturdayCheck = (checked: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-dayOfWeek',
      value: { checked, key: 'Sat' },
    }),
  );
};

const setEnabledFilteringByDateRange = (value: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({ type: 'set-enabled-filtering-by-dateRange', value }),
  );
};

const setDateRange = (
  range: Readonly<{
    start: YearMonthDate | undefined;
    end: YearMonthDate | undefined;
  }>,
): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({ type: 'set-dateRange', range }),
  );
};

const setEnabledFilteringByIconOfSpecifiedRespondent = (
  value: boolean,
): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-enabled-filtering-by-iconOfSpecifiedRespondent',
      value,
    }),
  );
};

const setEnabledFilteringByRespondent = (value: boolean): void => {
  AnswerFilterQueryParam.saveFilterStateToQueryParams(
    filterStateDispatch({
      type: 'set-enabled-filtering-by-respondent',
      value,
    }),
  );
};

const setIconOfSpecifiedRespondentCheckState = (
  username: UserName,
  iconId: AnswerIconIdWithNone,
  value: boolean,
): void => {
  // don't call AnswerFilterQueryParam.saveFilterStateToQueryParams
  filterStateDispatch({
    type: 'set-iconOfSpecifiedRespondent',
    value,
    username,
    iconId,
  });
};

const setRespondentCheckState = (username: UserName, value: boolean): void => {
  // don't call AnswerFilterQueryParam.saveFilterStateToQueryParams
  filterStateDispatch({
    type: 'set-respondent',
    value,
    username,
  });
};

const restoreFromQueryParams = (): void => {
  AnswerFilterQueryParam.restoreFromQueryParams(
    setSortOrderAndKey,
    filterStateDispatch,
  );
};

/* tags */

const dc = dict.answerPage.answers.tagInput;

const tags$: InitializedObservable<
  DeepReadonly<{ value: string; props: TagProps }[]>
> = combine([sortKeyAndOrder$, filterState$]).chain(
  map(
    ([
      sortKeyAndOrder,
      {
        iconState,
        filledDateOnly,
        rank,
        scoreRange,
        dateRange,
        dayOfWeek,
        iconOfSpecifiedRespondent,
        respondent,
        ..._rest
      },
    ]) => {
      expectType<keyof typeof _rest, never>('=');

      return [
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

        rank.enabled
          ? {
              value: dc.rank(rank.value),
              props: {
                intent: 'primary' as const,
                onRemove: () => {
                  setEnabledFilteringByRank(false);
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
                iconState.goodPlusFair.max,
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
                iconState.fairPlusPoor.max,
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
              value: dict.answerPage.detailedFilter.filterItems.filledDateOnly,
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

        respondent.enabled
          ? {
              value: dc.respondent,
              props: {
                intent: 'none' as const,
                onRemove: () => {
                  setEnabledFilteringByRespondent(false);
                },
              },
            }
          : undefined,
      ].filter(isNotUndefined);
    },
  ),
);

const tagValues$: InitializedObservable<readonly string[]> = tags$.chain(
  map((tags) => tags.map((t) => t.value)),
);

const tagProps$: InitializedObservable<
  (
    value: DeepReadonly<React.ReactNode>,
    index: number,
  ) => DeepReadonly<TagProps>
> = tags$.chain(
  map(
    (tags) =>
      (value: DeepReadonly<React.ReactNode>): DeepReadonly<TagProps> =>
        tags.find((t) => t.value === value)?.props ?? {
          intent: 'none' as const,
        },
  ),
);

const clearTags = (): void => {
  resetSortOrderAndKey();
  resetState();
};

/* subscriptions */

export const answersFiltered$ = combine([
  AnswersStore.answers$,
  filterState$,
]).chain(
  map(([answers, filterState]) =>
    answers?.filter((a) => !filterState.respondent.falseKeys.has(a.user.name)),
  ),
);

answersFiltered$
  .chain(filter(isNotUndefined))
  .chain(map((answers) => answers.length))
  .chain(skipIfNoChange())
  .subscribe((numAnswers) => {
    filterStateDispatch({
      type: 'icon',
      action: {
        type: 'setUpperLimit',
        upperLimit: toSafeUint(numAnswers),
      },
    });
  });

eventSchedule$
  .chain(filter(isNotUndefined))
  .chain(
    map((eventSchedule) => ({
      start: Arr.first(eventSchedule.datetimeRangeList).ymd,
      end: Arr.last(eventSchedule.datetimeRangeList).ymd,
    })),
  )
  .chain(skipIfNoChange(deepEqual))
  .subscribe((range) => {
    setDateRangeDefaultValue(range);
  });

export const AnswerFilterAndSortStore = {
  sortKeyAndOrder$,
  filterState$,
  useFilterState,
  iconOfSpecifiedRespondentCheckState$,
  respondentCheckState$,
  tagValues$,
  tagProps$,
  onDatetimeSortOrderChange,
  onScoreSortOrderChange,
  disableFilteringByIcon,
  enableFilteringByIcon,
  setMinCountOfIcon,
  setMaxCountOfIcon,
  setMinCountOfGoodIcon,
  setMinCountOfFairIcon,
  setMinCountOfPoorIcon,
  setGoodPlusFairMin,
  setFairPlusPoorMin,
  setMaxCountOfGoodIcon,
  setMaxCountOfFairIcon,
  setMaxCountOfPoorIcon,
  setGoodPlusFairMax,
  setFairPlusPoorMax,
  setEnabledFilteringByGoodIcon,
  setEnabledFilteringByFairIcon,
  setEnabledFilteringByPoorIcon,
  setEnabledFilteringByGoodPlusFair,
  setEnabledFilteringByFairPlusPoor,
  setOnlyFilledDate,
  setEnabledFilteringByRank,
  setRank,
  setEnabledFilteringByScoreRange,
  setScoreRange,
  setScoreRangeMin,
  setScoreRangeMax,
  setDateRangeDefaultValue,
  setEnabledFilteringByDayOfWeek,
  setSundayCheck,
  setMondayCheck,
  setTuesdayCheck,
  setWednesdayCheck,
  setThursdayCheck,
  setFridayCheck,
  setSaturdayCheck,
  setEnabledFilteringByDateRange,
  setDateRange,
  setEnabledFilteringByIconOfSpecifiedRespondent,
  setEnabledFilteringByRespondent,
  restoreFromQueryParams,
  clearTags,
  displayOnlyCandidateDatesWithZeroPoorIcon,
  displayOnlyCandidateDatesOfRank1to3,
} as const;
