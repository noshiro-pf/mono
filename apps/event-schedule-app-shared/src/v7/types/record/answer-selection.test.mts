import { expectType } from 'ts-data-forge';
import {
  type AnswerIconIdWithNone,
  type AnswerIconPoint,
} from '../enum/index.mjs';
import {
  answerSelectionDefaultValue,
  fillAnswerSelection,
  isAnswerSelection,
  type AnswerSelection,
} from './answer-selection.mjs';
import {
  datetimeRangeDefaultValue,
  type DatetimeRange,
} from './datetime-range.mjs';

describe('AnswerSelection', () => {
  expectType<
    AnswerSelection,
    Readonly<{
      datetimeRange: DatetimeRange;
      iconId: AnswerIconIdWithNone;
      point: AnswerIconPoint;
      comment: string;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: AnswerSelection = {
      datetimeRange: datetimeRangeDefaultValue,
      iconId: 'none',
      point: 0,
      comment: '',
    } as const;

    assert.deepStrictEqual(answerSelectionDefaultValue, defaultValue);
  });

  describe('isAnswerSelection', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(isAnswerSelection(answerSelectionDefaultValue));
    });
  });

  describe('fillAnswerSelection', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(
        fillAnswerSelection({}),
        answerSelectionDefaultValue,
      );
    });
  });
});
