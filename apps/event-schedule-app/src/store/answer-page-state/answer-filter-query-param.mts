import {
  Arr,
  ISet,
  Num,
  Optional,
  Result,
  expectType,
  isSafeUint,
  pipe,
  tp,
  type SafeUint,
} from 'ts-data-forge';
import { YearMonthDate } from 'ts-fortress-types';
import type { StrictPick } from 'ts-type-forge';
import { answerTableQuery, routes } from '../../constants/index.mjs';
import type {
  AnswerFilterState,
  AnswerFilterStateAction,
} from '../../functions/index.mjs';
import {
  isAnswerRank,
  isAnswersScore,
  type AnswerRank,
  type AnswersScore,
} from '../../types/index.mjs';
import type { AppRouter } from '../router-store.mjs';

export type AnswerFilterQueryParamDeps = Readonly<{
  router: StrictPick<AppRouter, 'at' | 'setSearch'>;
}>;

/**
 * The answer table's sort and filters, written to and read from the answer
 * page's query string (declared on `routes.event.answer`), so that a link opens
 * the table as it was. Each write replaces the history entry. The edit page is
 * below the answer page and matches too; outside both, nothing is read or
 * written.
 */
export const createAnswerFilterQueryParam = (
  deps: AnswerFilterQueryParamDeps,
): AnswerFilterQueryParam => {
  const saveSortStateToQueryParams = ([sortKey, sortOrder]: readonly [
    'date' | 'score',
    'asc' | 'desc',
  ]): void => {
    deps.router.setSearch(
      routes.event.answer,
      (prev) => ({ ...prev, 'sort-by': sortKey, 'sort-order': sortOrder }),
      { replace: true },
    );
  };

  const saveFilterStateToQueryParams = ({
    iconState,
    scoreRange,
    dateRange,
    filledDateOnly,
    dayOfWeek,
    rank,
    ..._rest
  }: AnswerFilterState): void => {
    expectType<keyof typeof _rest, 'iconOfSpecifiedRespondent' | 'respondent'>(
      '=',
    );

    deps.router.setSearch(
      routes.event.answer,
      (prev) => ({
        ...prev,
        date:
          dateRange.enabled &&
          dateRange.value.start !== undefined &&
          dateRange.value.end !== undefined
            ? range2str(
                ymd2str(dateRange.value.start),
                ymd2str(dateRange.value.end),
              )
            : undefined,
        day: dayOfWeek.enabled ? dayOfWeekToStr(dayOfWeek.value) : undefined,
        'filled-date-only': filledDateOnly,
        rank: rank.enabled ? num2str(rank.value) : undefined,
        score: scoreRange.enabled
          ? range2str(
              num2str(scoreRange.value.min),
              num2str(scoreRange.value.max),
            )
          : undefined,
        good: iconRangeToStr(iconState.good),
        fair: iconRangeToStr(iconState.fair),
        poor: iconRangeToStr(iconState.poor),
        'good-fair': iconRangeToStr(iconState.goodPlusFair),
        'fair-poor': iconRangeToStr(iconState.fairPlusPoor),
      }),
      { replace: true },
    );
  };

  const restoreFromQueryParams = (
    setSortOrderAndKey: (
      v: readonly ['date' | 'score', 'asc' | 'desc'],
    ) => void,
    filterStateDispatch: (action: AnswerFilterStateAction) => void,
  ): void => {
    const values = deps.router.at(routes.event.answer).getSnapshot().value;

    if (Optional.isNone(values)) {
      return;
    }

    const query = values.value.search;

    setSortOrderAndKey([query['sort-by'], query['sort-order']]);

    const parseRank = (s: string): AnswerRank | undefined =>
      pipe(s)
        .map(Num.from)
        .map((a) => (isAnswerRank(a) ? a : undefined)).value;

    const parseScore = (s: string): AnswersScore | undefined =>
      pipe(s)
        .map(Num.from)
        .map((a) => (isAnswersScore(a) ? a : undefined)).value;

    filterStateDispatch({
      type: 'setFromUrlQueryParams',
      values: {
        dateRange: pipe(query.date)
          .mapNullable(rangeFromStr)
          .mapNullable((range) => ({
            start: ymdFromStr(range.a),
            end: ymdFromStr(range.b),
          })).value ?? { start: undefined, end: undefined },

        dayOfWeek: pipe(query.day).mapNullable(dayOfWeekFromStr).value,

        rank: pipe(query.rank).mapNullable(parseRank).value,

        scoreRange: pipe(query.score)
          .mapNullable(rangeFromStr)
          .mapNullable((range) => ({
            min: parseScore(range.a),
            max: parseScore(range.b),
          })).value ?? { min: undefined, max: undefined },

        filledDateOnly: query['filled-date-only'],

        iconState: {
          good: iconRangeFromStr(query.good),
          fair: iconRangeFromStr(query.fair),
          poor: iconRangeFromStr(query.poor),
          goodPlusFair: iconRangeFromStr(query['good-fair']),
          fairPlusPoor: iconRangeFromStr(query['fair-poor']),
        },
      },
    });
  };

  return {
    saveSortStateToQueryParams,
    saveFilterStateToQueryParams,
    restoreFromQueryParams,
  };
};

export type AnswerFilterQueryParam = Readonly<{
  saveSortStateToQueryParams: (
    sortKeyAndOrder: readonly ['date' | 'score', 'asc' | 'desc'],
  ) => void;
  saveFilterStateToQueryParams: (filterState: AnswerFilterState) => void;
  /** Hands what the URL says to the two setters. */
  restoreFromQueryParams: (
    setSortOrderAndKey: (
      v: readonly ['date' | 'score', 'asc' | 'desc'],
    ) => void,
    filterStateDispatch: (action: AnswerFilterStateAction) => void,
  ) => void;
}>;

const num2str = (n: number): string => Num.roundAt(n, 2).toString(10);

// for query params
const ymd2str = ({ year, month, date }: YearMonthDate): string =>
  `${year}-${month}-${date}` as const;

const ymdFromStr = (ymdStr: string): YearMonthDate | undefined => {
  const res = ymdStr.split('-');

  if (!Arr.isFixedLengthTuple(3, res)) {
    return undefined;
  }

  const ret = {
    year: Num.from(res[0]),
    month: Num.from(res[1]),
    date: Num.from(res[2]),
  } as const;

  return YearMonthDate.is(ret) ? ret : undefined;
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
  }>,
): string =>
  (['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'] as const)
    .map((key) => tp(answerTableQuery.dayAbbr[key], value[key]))
    .filter(([_key, checked]) => checked)
    .map(([key]) => key)
    .join(answerTableQuery.dayElementDelim);

const dayOfWeekFromStr = (
  str: string,
): Readonly<{
  Sun: boolean;
  Mon: boolean;
  Tue: boolean;
  Wed: boolean;
  Thr: boolean;
  Fri: boolean;
  Sat: boolean;
}> => {
  const set = ISet.create(str.split(answerTableQuery.dayElementDelim));

  return {
    Sun: set.has(answerTableQuery.dayAbbr.Sun),
    Mon: set.has(answerTableQuery.dayAbbr.Mon),
    Tue: set.has(answerTableQuery.dayAbbr.Tue),
    Wed: set.has(answerTableQuery.dayAbbr.Wed),
    Thr: set.has(answerTableQuery.dayAbbr.Thr),
    Fri: set.has(answerTableQuery.dayAbbr.Fri),
    Sat: set.has(answerTableQuery.dayAbbr.Sat),
  };
};

const range2str = (a: string, b: string): string =>
  `${a}${answerTableQuery.rangeDelim}${b}` as const;

const rangeFromStr = (
  rangeStr: string,
): Readonly<{ a: string; b: string }> | undefined => {
  const res = rangeStr.split(answerTableQuery.rangeDelim);

  return Arr.isFixedLengthTuple(2, res) ? { a: res[0], b: res[1] } : undefined;
};

const iconRangeToStr = (
  range: Readonly<{ enabled: boolean; min: number; max: number }>,
): string | undefined =>
  range.enabled ? range2str(num2str(range.min), num2str(range.max)) : undefined;

// `asSafeUint` throws on anything that is not a non-negative safe integer,
// `NaN` included, so it cannot be the inner call: a query parameter someone
// typed by hand would take the whole page down rather than be ignored. Guard
// first, cast second.
const parseSafeUint = (s: string): SafeUint | undefined => {
  const parsed = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);

  return isSafeUint(parsed) ? parsed : undefined;
};

const iconRangeFromStr = (
  value: string | undefined,
): Readonly<{ min: SafeUint | undefined; max: SafeUint | undefined }> =>
  pipe(value)
    .mapNullable(rangeFromStr)
    .mapNullable((range) => ({
      min: parseSafeUint(range.a),
      max: parseSafeUint(range.b),
    })).value ?? { min: undefined, max: undefined };
