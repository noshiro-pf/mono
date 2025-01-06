import { DatetimeRange } from '@noshiro/io-ts-types';
import { expectType } from '@noshiro/ts-utils';
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
    };
    expect(AnswerSelection.defaultValue).toStrictEqual(defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      expect(AnswerSelection.is(AnswerSelection.defaultValue)).toBe(true);
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      expect(AnswerSelection.fill({})).toStrictEqual(
        AnswerSelection.defaultValue,
      );
    });
  });
});
