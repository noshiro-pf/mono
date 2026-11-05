import { UserName } from 'event-schedule-app-shared';
import { asSafeUint } from 'ts-data-forge';
import type { NonEmptyTuple, RelaxedExtract } from 'ts-type-forge';
import {
  AnswerFilterState,
  type AnswerFilterStateAction,
} from './answer-filter-state.mjs';

describe(AnswerFilterState.reducer, () => {
  test.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ] as const)(
    'sets filledDateOnly from %j to %j and keeps repeated assignments stable',
    (initial, checked) => {
      const state = {
        ...AnswerFilterState.initialState,
        filledDateOnly: initial,
      } as const;

      const action = { type: 'set-filledDateOnly', checked } as const;

      const next = AnswerFilterState.reducer(state, action);

      const repeated = AnswerFilterState.reducer(next, action);

      assert.deepStrictEqual(next, { ...state, filledDateOnly: checked });

      assert.deepStrictEqual(repeated, next);

      assert.strictEqual(state.filledDateOnly, initial);
    },
  );

  // Every action sets a value rather than toggling one, so dispatching it a
  // second time changes nothing. A case that ignores its payload and flips the
  // current value instead fails here. A new top-level action type fails to
  // compile until it has a sample; a new `icon` sub-action does not, since it
  // belongs to AnswerIconFilterState.
  test.each(
    Object.values(actionSamples).flatMap((actions) =>
      actions.map((action, i) => [`${action.type} #${i}`, action] as const),
    ),
  )('%s is idempotent', (_label, action) => {
    for (const state of [AnswerFilterState.initialState, filtersOn]) {
      const next = AnswerFilterState.reducer(state, action);

      assert.deepStrictEqual(AnswerFilterState.reducer(next, action), next);
    }
  });

  // Two payloads of one action type lead to two different states. A case that
  // drops its payload, or a field of it that some pair of samples differs in
  // alone, and writes the same value whatever it is given fails here.
  test.each(
    Object.entries(actionSamples).filter(([, actions]) => actions.length > 1),
  )('%s: each payload gives its own state', (_type, actions) => {
    const results = actions.map((action) =>
      AnswerFilterState.reducer(filtersOn, action),
    );

    for (const [i, a] of results.entries()) {
      for (const b of results.slice(i + 1)) {
        assert.notDeepEqual(a, b);
      }
    }
  });
});

type ActionOf<T extends AnswerFilterStateAction['type']> = RelaxedExtract<
  AnswerFilterStateAction,
  Readonly<{ type: T }>
>;

/**
 * The calendar date itself. A `"YYYY-MM-DD"` read through `Date` would be UTC
 * midnight, the day before in local time west of UTC (#3076).
 */
const ymd = (
  year: number,
  month: YearMonthDate['month'],
  date: YearMonthDate['date'],
): YearMonthDate => ({ year: asSafeUint(year), month, date }) as const;

const userName = UserName.cast('alice');

const otherUserName = UserName.cast('bob');

const actionSamples: Readonly<{
  [T in AnswerFilterStateAction['type']]: NonEmptyTuple<ActionOf<T>>;
}> = {
  icon: [
    { type: 'icon', action: { type: 'enableFiltering', iconId: 'good' } },
    { type: 'icon', action: { type: 'disableFiltering', iconId: 'good' } },
    {
      type: 'icon',
      action: { type: 'setMin', iconId: 'fair', value: asSafeUint(2) },
    },
    {
      type: 'icon',
      action: { type: 'setMax', iconId: 'poor', value: asSafeUint(1) },
    },
    {
      type: 'icon',
      action: { type: 'setUpperLimit', upperLimit: asSafeUint(5) },
    },
    { type: 'icon', action: { type: 'reset' } },
  ],
  reset: [{ type: 'reset' }],
  'set-dateRange': [
    {
      type: 'set-dateRange',
      range: { start: ymd(2026, 11, 5), end: ymd(2026, 11, 3) },
    },
    {
      type: 'set-dateRange',
      range: { start: ymd(2026, 11, 10), end: ymd(2026, 11, 12) },
    },
    {
      type: 'set-dateRange',
      range: { start: ymd(2026, 11, 10), end: ymd(2026, 11, 20) },
    },
  ],
  'set-dateRangeDefaultValue': [
    {
      type: 'set-dateRangeDefaultValue',
      range: { start: ymd(2026, 11, 1), end: ymd(2026, 11, 30) },
    },
    {
      type: 'set-dateRangeDefaultValue',
      range: { start: ymd(2026, 12, 1), end: ymd(2026, 12, 31) },
    },
  ],
  'set-dayOfWeek': [
    { type: 'set-dayOfWeek', value: { key: 'Mon', checked: false } },
    { type: 'set-dayOfWeek', value: { key: 'Mon', checked: true } },
    { type: 'set-dayOfWeek', value: { key: 'Sat', checked: false } },
  ],
  'set-enabled-filtering-by-dateRange': [
    { type: 'set-enabled-filtering-by-dateRange', value: false },
    { type: 'set-enabled-filtering-by-dateRange', value: true },
  ],
  'set-enabled-filtering-by-dayOfWeek': [
    { type: 'set-enabled-filtering-by-dayOfWeek', value: false },
    { type: 'set-enabled-filtering-by-dayOfWeek', value: true },
  ],
  'set-enabled-filtering-by-iconOfSpecifiedRespondent': [
    {
      type: 'set-enabled-filtering-by-iconOfSpecifiedRespondent',
      value: false,
    },
    { type: 'set-enabled-filtering-by-iconOfSpecifiedRespondent', value: true },
  ],
  'set-enabled-filtering-by-rank': [
    { type: 'set-enabled-filtering-by-rank', value: false },
    { type: 'set-enabled-filtering-by-rank', value: true },
  ],
  'set-enabled-filtering-by-respondent': [
    { type: 'set-enabled-filtering-by-respondent', value: false },
    { type: 'set-enabled-filtering-by-respondent', value: true },
  ],
  'set-enabled-filtering-by-scoreRange': [
    { type: 'set-enabled-filtering-by-scoreRange', value: false },
    { type: 'set-enabled-filtering-by-scoreRange', value: true },
  ],
  'set-filledDateOnly': [
    { type: 'set-filledDateOnly', checked: false },
    { type: 'set-filledDateOnly', checked: true },
  ],
  'set-iconOfSpecifiedRespondent': [
    {
      type: 'set-iconOfSpecifiedRespondent',
      username: userName,
      iconId: 'good',
      value: false,
    },
    {
      type: 'set-iconOfSpecifiedRespondent',
      username: userName,
      iconId: 'good',
      value: true,
    },
    {
      type: 'set-iconOfSpecifiedRespondent',
      username: userName,
      iconId: 'fair',
      value: false,
    },
    {
      type: 'set-iconOfSpecifiedRespondent',
      username: otherUserName,
      iconId: 'good',
      value: false,
    },
  ],
  'set-rank': [
    { type: 'set-rank', rank: 5 },
    { type: 'set-rank', rank: 7 },
  ],
  'set-respondent': [
    { type: 'set-respondent', username: userName, value: false },
    { type: 'set-respondent', username: userName, value: true },
    { type: 'set-respondent', username: otherUserName, value: false },
  ],
  'set-scoreRange-max': [
    { type: 'set-scoreRange-max', max: 0.4 },
    { type: 'set-scoreRange-max', max: 0.8 },
  ],
  'set-scoreRange-min': [
    { type: 'set-scoreRange-min', min: 0.6 },
    { type: 'set-scoreRange-min', min: 0.2 },
  ],
  'set-scoreRange': [
    { type: 'set-scoreRange', range: { min: 0.7, max: 0.2 } },
    { type: 'set-scoreRange', range: { min: 0.1, max: 0.5 } },
    { type: 'set-scoreRange', range: { min: 0.1, max: 0.9 } },
  ],
  setFromUrlQueryParams: [
    {
      type: 'setFromUrlQueryParams',
      values: {
        iconState: {
          good: { min: asSafeUint(1), max: undefined },
          fair: { min: undefined, max: asSafeUint(3) },
          poor: { min: undefined, max: undefined },
          goodPlusFair: { min: undefined, max: undefined },
          fairPlusPoor: { min: undefined, max: undefined },
        },
        filledDateOnly: true,
        rank: 4,
        scoreRange: { min: 0.3, max: undefined },
        dateRange: { start: ymd(2026, 11, 3), end: undefined },
        dayOfWeek: undefined,
      },
    },
    {
      type: 'setFromUrlQueryParams',
      values: {
        iconState: {
          good: { min: undefined, max: undefined },
          fair: { min: undefined, max: undefined },
          poor: { min: undefined, max: undefined },
          goodPlusFair: { min: undefined, max: undefined },
          fairPlusPoor: { min: undefined, max: undefined },
        },
        filledDateOnly: false,
        rank: undefined,
        scoreRange: { min: undefined, max: undefined },
        dateRange: { start: undefined, end: undefined },
        dayOfWeek: undefined,
      },
    },
    {
      type: 'setFromUrlQueryParams',
      values: {
        iconState: {
          good: { min: undefined, max: undefined },
          fair: { min: undefined, max: undefined },
          poor: { min: undefined, max: undefined },
          goodPlusFair: { min: undefined, max: undefined },
          fairPlusPoor: { min: undefined, max: undefined },
        },
        filledDateOnly: true,
        rank: undefined,
        scoreRange: { min: undefined, max: undefined },
        dateRange: { start: undefined, end: undefined },
        dayOfWeek: undefined,
      },
    },
  ],
} as const;

/**
 * Every filter switched on, two icon filters among them, so that switching one
 * off, a reset, and each payload of one action reach a state of their own.
 */
const filtersOn: AnswerFilterState = (
  [
    { type: 'set-enabled-filtering-by-dateRange', value: true },
    { type: 'set-enabled-filtering-by-dayOfWeek', value: true },
    { type: 'set-enabled-filtering-by-iconOfSpecifiedRespondent', value: true },
    { type: 'set-enabled-filtering-by-rank', value: true },
    { type: 'set-enabled-filtering-by-respondent', value: true },
    { type: 'set-enabled-filtering-by-scoreRange', value: true },
    { type: 'set-filledDateOnly', checked: true },
    { type: 'icon', action: { type: 'enableFiltering', iconId: 'good' } },
    { type: 'icon', action: { type: 'enableFiltering', iconId: 'fair' } },
  ] as const satisfies readonly AnswerFilterStateAction[]
).reduce<AnswerFilterState>(
  AnswerFilterState.reducer,
  AnswerFilterState.initialState,
);
