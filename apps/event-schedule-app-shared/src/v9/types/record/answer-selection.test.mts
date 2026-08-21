import { DatetimeRange } from 'io-ts-types';
import { expectType } from 'ts-data-forge';
import {
  type AnswerIconIdWithNone,
  type AnswerIconPoint,
} from '../enum/index.mjs';
import { AnswerSelection } from './answer-selection.mjs';

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
      datetimeRange: DatetimeRange.defaultValue,
      iconId: 'none',
      point: 0,
      comment: '',
    } as const;

    assert.deepStrictEqual(AnswerSelection.defaultValue, defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(AnswerSelection.is(AnswerSelection.defaultValue));
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      assert.deepStrictEqual(
        AnswerSelection.fill({}),
        AnswerSelection.defaultValue,
      );
    });
  });
});
