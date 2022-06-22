import { assertType } from '@noshiro/ts-utils';
import type { AnswerIconIdWithNone, AnswerIconPoint } from '../enum';
import type { AnswerSelection } from './answer-selection';
import {
  answerSelectionDefaultValue,
  fillAnswerSelection,
  isAnswerSelection,
} from './answer-selection';
import type { DatetimeRange } from './datetime-range';
import { datetimeRangeDefaultValue } from './datetime-range';

describe('AnswerSelection', () => {
  assertType<
    TypeEq<
      AnswerSelection,
      Readonly<{
        datetimeRange: DatetimeRange;
        iconId: AnswerIconIdWithNone;
        point: AnswerIconPoint;
        comment: string;
      }>
    >
  >();

  test('defaultValue', () => {
    const defaultValue: AnswerSelection = {
      datetimeRange: datetimeRangeDefaultValue,
      iconId: 'none',
      point: 0,
      comment: '',
    };
    expect(answerSelectionDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isAnswerSelection', () => {
    test('defaultValue should be true', () => {
      expect(isAnswerSelection(answerSelectionDefaultValue)).toBe(true);
    });
  });

  describe('fillAnswerSelection', () => {
    test('defaultValue should be true', () => {
      expect(fillAnswerSelection({})).toStrictEqual(
        answerSelectionDefaultValue
      );
    });
  });
});
