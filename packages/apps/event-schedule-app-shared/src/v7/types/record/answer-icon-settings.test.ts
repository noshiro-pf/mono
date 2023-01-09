import { assertType } from '@noshiro/ts-utils';
import type { AnswerIconId } from '../enum';
import type { AnswerIconSettings } from './answer-icon-settings';
import {
  answerIconSettingsDefaultValue,
  fillAnswerIconSettings,
  isAnswerIconSettings,
} from './answer-icon-settings';
import type { AnswerIconSetting } from './base';

describe('AnswerIconSettings', () => {
  assertType<
    TypeEq<AnswerIconSettings, Record<AnswerIconId, AnswerIconSetting>>
  >();

  test('defaultValue', () => {
    const defaultValue: AnswerIconSettings = {
      good: { description: '', point: 10 },
      fair: { description: '', point: 6 },
      poor: { description: '', point: 0 },
    };
    expect(answerIconSettingsDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isAnswerIconSettings', () => {
    test('defaultValue should be true', () => {
      expect(isAnswerIconSettings(answerIconSettingsDefaultValue)).toBe(true);
    });
  });

  describe('fillAnswerIconSettings', () => {
    test('defaultValue should be true', () => {
      expect(fillAnswerIconSettings({})).toStrictEqual(
        answerIconSettingsDefaultValue
      );
    });
  });
});
