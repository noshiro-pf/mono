import { assertType } from '@noshiro/ts-utils';
import { type AnswerIconIdWithNone, type AnswerIconPoint } from '../enum';
import {
  answerSelectionDefaultValue,
  fillAnswerSelection,
  isAnswerSelection,
  type AnswerSelection,
} from './answer-selection';
import {
  datetimeRangeDefaultValue,
  type DatetimeRange,
} from './datetime-range';

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
