import { isYearMonthDate } from '@noshiro/event-schedule-app-shared';
import { Routes } from '../../constants';
import {
  type AnswerFilterState,
  type AnswerFilterStateAction,
} from '../../functions';
import { isAnswersScore, type AnswersScore } from '../../types';
import { router } from '../router';

const keyDef = Routes.queryParamKey.answerTableState;

const saveSortStateToQueryParams = ([sortKey, sortOrder]: readonly [
  'date' | 'score',
  'asc' | 'desc'
]): void => {
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

const num2str = (n: number): string => Num.roundAt(n, 2).toString(10);

// for query params
const ymd2str = ({ year, month, date }: YearMonthDate): string =>
  `${year}-${month}-${date}`;

const ymdFromStr = (ymdStr: string): YearMonthDate | undefined => {
  const res = ymdStr.split('-');

  if (!Arr.isArrayOfLength3(res)) return undefined;

  const ret = {
    year: Num.from(res[0]),
    month: Num.from(res[1]),
    date: Num.from(res[2]),
  };

  return isYearMonthDate(ret) ? ret : undefined;
};

const dayOfWeekToStr = (
  value: Readonly<{
    Sun: boolean;
    Mon: boolean;
    Tue: boolean;
    Wed: boolean;
    Thr: boolean;
    Fri: boolean;
    Sat: boolean;
  }>
): string =>
  (['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'] as const)
    .map((key) => tp(Routes.queryParamValue.dayAbbrDef[key], value[key]))
    .filter(([_key, checked]) => checked)
    .map(([key]) => key)
    .join(Routes.queryParamValue.dayElementDelim);

const dayOfWeekFromStr = (
  str: string
): Readonly<{
  Sun: boolean;
  Mon: boolean;
  Tue: boolean;
  Wed: boolean;
  Thr: boolean;
  Fri: boolean;
  Sat: boolean;
}> => {
  const set = ISet.new(str.split(Routes.queryParamValue.dayElementDelim));

  return {
    Sun: set.has(Routes.queryParamValue.dayAbbrDef.Sun),
    Mon: set.has(Routes.queryParamValue.dayAbbrDef.Mon),
    Tue: set.has(Routes.queryParamValue.dayAbbrDef.Tue),
    Wed: set.has(Routes.queryParamValue.dayAbbrDef.Wed),
    Thr: set.has(Routes.queryParamValue.dayAbbrDef.Thr),
    Fri: set.has(Routes.queryParamValue.dayAbbrDef.Fri),
    Sat: set.has(Routes.queryParamValue.dayAbbrDef.Sat),
  };
};

const range2str = (a: string, b: string): string =>
  `${a}${Routes.queryParamValue.rangeDelim}${b}`;

const rangeFromStr = (
  rangeStr: string
): Readonly<{ a: string; b: string }> | undefined => {
  const res = rangeStr.split(Routes.queryParamValue.rangeDelim);
  return Arr.isArrayOfLength2(res) ? { a: res[0], b: res[1] } : undefined;
};

const filledDateOnlyToStr = (value: boolean): string =>
  value ? Routes.queryParamValue.filledDateOnlyEnabled : '';

const filledDateOnlyFromStr = (value: string): boolean =>
  value === Routes.queryParamValue.filledDateOnlyEnabled;

const saveFilterStateToQueryParams = ({
  iconState,
  scoreRange,
  dateRange,
  filledDateOnly,
  dayOfWeek,
}: AnswerFilterState): void => {
  router.updateQueryParams((urlSearchParams) => {
    if (
      dateRange.enabled &&
      isNotUndefined(dateRange.value.start) &&
      isNotUndefined(dateRange.value.end)
    ) {
      urlSearchParams.set(
        keyDef.date,
        range2str(ymd2str(dateRange.value.start), ymd2str(dateRange.value.end))
      );
    } else {
      urlSearchParams.delete(keyDef.date);
    }

    if (dayOfWeek.enabled) {
      urlSearchParams.set(keyDef.dayOfWeek, dayOfWeekToStr(dayOfWeek.value));
    } else {
      urlSearchParams.delete(keyDef.dayOfWeek);
    }

    if (filledDateOnly) {
      urlSearchParams.set(
        keyDef.filledDateOnly,
        filledDateOnlyToStr(filledDateOnly)
      );
    } else {
      urlSearchParams.delete(keyDef.filledDateOnly);
    }

    if (scoreRange.enabled) {
      urlSearchParams.set(
        keyDef.score,
        range2str(num2str(scoreRange.value.min), num2str(scoreRange.value.max))
      );
    } else {
      urlSearchParams.delete(keyDef.score);
    }

    if (iconState.good.enabled) {
      urlSearchParams.set(
        keyDef.good,
        range2str(num2str(iconState.good.min), num2str(iconState.good.max))
      );
    } else {
      urlSearchParams.delete(keyDef.good);
    }

    if (iconState.fair.enabled) {
      urlSearchParams.set(
        keyDef.fair,
        range2str(num2str(iconState.fair.min), num2str(iconState.fair.max))
      );
    } else {
      urlSearchParams.delete(keyDef.fair);
    }

    if (iconState.poor.enabled) {
      urlSearchParams.set(
        keyDef.poor,
        range2str(num2str(iconState.poor.min), num2str(iconState.poor.max))
      );
    } else {
      urlSearchParams.delete(keyDef.poor);
    }

    if (iconState.goodPlusFair.enabled) {
      urlSearchParams.set(
        keyDef.goodPlusFair,
        range2str(
          num2str(iconState.goodPlusFair.min),
          num2str(iconState.goodPlusFair.max)
        )
      );
    } else {
      urlSearchParams.delete(keyDef.goodPlusFair);
    }

    if (iconState.fairPlusPoor.enabled) {
      urlSearchParams.set(
        keyDef.fairPlusPoor,
        range2str(
          num2str(iconState.fairPlusPoor.min),
          num2str(iconState.fairPlusPoor.max)
        )
      );
    } else {
      urlSearchParams.delete(keyDef.fairPlusPoor);
    }
  }, false);
};

const restoreFromQueryParams = (
  setSortOrderAndKey: (v: readonly ['date' | 'score', 'asc' | 'desc']) => void,
  filterStateDispatch: (action: AnswerFilterStateAction) => void
): void => {
  const queryParams = mut_subscribedValues.queryParams;

  if (queryParams === undefined) return;

  const sortKey =
    queryParams.get(keyDef.sortBy) === Routes.queryParamValue.sortBy.score
      ? 'score'
      : 'date';

  const sortOrder =
    queryParams.get(keyDef.sortOrder) === Routes.queryParamValue.sortOrder.desc
      ? 'desc'
      : 'asc';

  setSortOrderAndKey([sortKey, sortOrder]);

  const parseScore = (s: string): AnswersScore | undefined =>
    pipe(s)
      .chain(Num.from)
      .chain((a) => (isAnswersScore(a) ? a : undefined)).value;

  filterStateDispatch({
    type: 'setFromUrlQueryParams',
    values: {
      dateRange: pipe(queryParams.get(keyDef.date))
        .chainOptional(rangeFromStr)
        .chainOptional((range) => ({
          start: ymdFromStr(range.a),
          end: ymdFromStr(range.b),
        })).value ?? {
        start: undefined,
        end: undefined,
      },

      dayOfWeek: pipe(queryParams.get(keyDef.dayOfWeek)).chainOptional(
        dayOfWeekFromStr
      ).value,

      scoreRange: pipe(queryParams.get(keyDef.score))
        .chainOptional(rangeFromStr)
        .chainOptional((range) => ({
          min: parseScore(range.a),
          max: parseScore(range.b),
        })).value ?? {
        min: undefined,
        max: undefined,
      },

      filledDateOnly: pipe(
        queryParams.get(keyDef.filledDateOnly)
      ).chainOptional(filledDateOnlyFromStr).value,

      iconState: {
        good: pipe(queryParams.get(keyDef.good))
          .chainOptional(rangeFromStr)
          .chainOptional((range) => ({
            min: Num.mapNaN2Undefined(Number.parseInt(range.a, 10)),
            max: Num.mapNaN2Undefined(Number.parseInt(range.b, 10)),
          })).value ?? {
          min: undefined,
          max: undefined,
        },
        fair: pipe(queryParams.get(keyDef.fair))
          .chainOptional(rangeFromStr)
          .chainOptional((range) => ({
            min: Num.mapNaN2Undefined(Number.parseInt(range.a, 10)),
            max: Num.mapNaN2Undefined(Number.parseInt(range.b, 10)),
          })).value ?? {
          min: undefined,
          max: undefined,
        },
        poor: pipe(queryParams.get(keyDef.poor))
          .chainOptional(rangeFromStr)
          .chainOptional((range) => ({
            min: Num.mapNaN2Undefined(Number.parseInt(range.a, 10)),
            max: Num.mapNaN2Undefined(Number.parseInt(range.b, 10)),
          })).value ?? {
          min: undefined,
          max: undefined,
        },
        goodPlusFair: pipe(queryParams.get(keyDef.goodPlusFair))
          .chainOptional(rangeFromStr)
          .chainOptional((range) => ({
            min: Num.mapNaN2Undefined(Number.parseInt(range.a, 10)),
            max: Num.mapNaN2Undefined(Number.parseInt(range.b, 10)),
          })).value ?? {
          min: undefined,
          max: undefined,
        },
        fairPlusPoor: pipe(queryParams.get(keyDef.fairPlusPoor))
          .chainOptional(rangeFromStr)
          .chainOptional((range) => ({
            min: Num.mapNaN2Undefined(Number.parseInt(range.a, 10)),
            max: Num.mapNaN2Undefined(Number.parseInt(range.b, 10)),
          })).value ?? {
          min: undefined,
          max: undefined,
        },
      },
    },
  });
};

const mut_subscribedValues: {
  queryParams: IMap<string, string> | undefined;
} = {
  queryParams: undefined,
};

router.queryParams$.subscribe((v) => {
  mut_subscribedValues.queryParams = v;
});

export const AnswerFilterQueryParam = {
  saveSortStateToQueryParams,
  saveFilterStateToQueryParams,
  restoreFromQueryParams,
} as const;
