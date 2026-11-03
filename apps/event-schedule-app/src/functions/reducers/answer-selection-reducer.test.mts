import { IMapMapped, ISetMapped, Optional } from 'ts-data-forge';
import { DatetimeRange } from 'ts-fortress-types';
import { defaultIconPoint } from '../../constants/index.mjs';
import type { AnswerSelectionValue } from '../../types/index.mjs';
import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../map-key/index.mjs';
import {
  answerSelectionReducer,
  type AnswerSelectionReducerState,
} from './answer-selection-reducer.mjs';

describe('answerSelectionReducer on a datetime range not yet selected', () => {
  test.each([0, 3, 10] as const)('cell-point %d changes nothing', (point) => {
    const next = answerSelectionReducer(stateWith(undefined), {
      type: 'cell-point',
      datetimeRange: range,
      point,
    });

    expect(selectionOf(next)).toBeUndefined();
  });

  test.each(['good', 'fair', 'poor'] as const)(
    'cell-icon %s stores its default point',
    (icon) => {
      const next = answerSelectionReducer(stateWith(undefined), {
        type: 'cell-icon',
        datetimeRange: range,
        icon,
      });

      expect(selectionOf(next)).toStrictEqual({
        iconId: icon,
        point: defaultIconPoint[icon],
        comment: '',
      });
    },
  );

  test('cell-comment stores no icon with the comment', () => {
    const next = answerSelectionReducer(stateWith(undefined), {
      type: 'cell-comment',
      datetimeRange: range,
      comment: 'late',
    });

    expect(selectionOf(next)).toStrictEqual({
      iconId: 'none',
      point: defaultIconPoint.none,
      comment: 'late',
    });
  });

  test('header stores the icon with its default point', () => {
    const next = answerSelectionReducer(stateWith(undefined), {
      type: 'header',
      icon: 'good',
      datetimeRangeList: [range],
    });

    expect(selectionOf(next)).toStrictEqual({
      iconId: 'good',
      point: defaultIconPoint.good,
      comment: '',
    });
  });

  test.each(['good', 'poor', 'none'] as const)(
    'batch-input %s stores its default point, not the one it is given',
    (selectedIconId) => {
      const next = answerSelectionReducer(stateWith(undefined), {
        type: 'batch-input',
        comment: 'maybe',
        selectedIconId,
        point: 3,
        checkboxState: ISetMapped.create<DatetimeRange, DatetimeRangeMapKey>(
          [range],
          datetimeRangeToMapKey,
          datetimeRangeFromMapKey,
        ),
      });

      expect(selectionOf(next)).toStrictEqual({
        iconId: selectedIconId,
        point: defaultIconPoint[selectedIconId],
        comment: 'maybe',
      });
    },
  );

  test('batch-input stores the fair point it is given', () => {
    const next = answerSelectionReducer(stateWith(undefined), {
      type: 'batch-input',
      comment: 'maybe',
      selectedIconId: 'fair',
      point: 3,
      checkboxState: ISetMapped.create<DatetimeRange, DatetimeRangeMapKey>(
        [range],
        datetimeRangeToMapKey,
        datetimeRangeFromMapKey,
      ),
    });

    expect(selectionOf(next)).toStrictEqual({
      iconId: 'fair',
      point: 3,
      comment: 'maybe',
    });
  });
});

describe('answerSelectionReducer on a datetime range already selected', () => {
  test('cell-point sets the point of a fair answer', () => {
    const next = answerSelectionReducer(
      stateWith({ iconId: 'fair', point: 6, comment: 'maybe' }),
      { type: 'cell-point', datetimeRange: range, point: 3 },
    );

    expect(selectionOf(next)).toStrictEqual({
      iconId: 'fair',
      point: 3,
      comment: 'maybe',
    });
  });

  test.each(['good', 'poor', 'none'] as const)(
    'cell-point leaves a %s answer as it is',
    (iconId) => {
      const prev = {
        iconId,
        point: defaultIconPoint[iconId],
        comment: 'x',
      } as const;

      const next = answerSelectionReducer(stateWith(prev), {
        type: 'cell-point',
        datetimeRange: range,
        point: 3,
      });

      expect(selectionOf(next)).toStrictEqual(prev);
    },
  );

  test('cell-icon with the same icon clears it and keeps the comment', () => {
    const next = answerSelectionReducer(
      stateWith({ iconId: 'good', point: 10, comment: 'x' }),
      { type: 'cell-icon', datetimeRange: range, icon: 'good' },
    );

    expect(selectionOf(next)).toStrictEqual({
      iconId: 'none',
      point: defaultIconPoint.none,
      comment: 'x',
    });
  });

  test('header on a column all of that icon clears it and keeps the comment', () => {
    const next = answerSelectionReducer(
      stateWith({ iconId: 'poor', point: 0, comment: 'x' }),
      { type: 'header', icon: 'poor', datetimeRangeList: [range] },
    );

    expect(selectionOf(next)).toStrictEqual({
      iconId: 'none',
      point: defaultIconPoint.none,
      comment: 'x',
    });
  });

  test('cell-icon with another icon takes its default point and keeps the comment', () => {
    const next = answerSelectionReducer(
      stateWith({ iconId: 'fair', point: 3, comment: 'x' }),
      { type: 'cell-icon', datetimeRange: range, icon: 'good' },
    );

    expect(selectionOf(next)).toStrictEqual({
      iconId: 'good',
      point: defaultIconPoint.good,
      comment: 'x',
    });
  });
});

const range = DatetimeRange.fill({
  ymd: { year: 2026, month: 11, date: 3 },
  timeRange: {
    start: { hours: 10, minutes: 0 },
    end: { hours: 12, minutes: 0 },
  },
});

const stateWith = (
  value: AnswerSelectionValue | undefined,
): AnswerSelectionReducerState =>
  IMapMapped.create<DatetimeRange, AnswerSelectionValue, DatetimeRangeMapKey>(
    value === undefined ? [] : [[range, value]],
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey,
  );

const selectionOf = (
  state: AnswerSelectionReducerState,
): AnswerSelectionValue | undefined => Optional.toNullable(state.get(range));
