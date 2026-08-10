import { expectType } from '@noshiro/ts-utils';
import { type AnswerIconId } from '../enum/index.mjs';
import {
  answerIconSettingsDefaultValue,
  fillAnswerIconSettings,
  isAnswerIconSettings,
  type AnswerIconSettings,
} from './answer-icon-settings.mjs';
import { type AnswerIconSetting } from './base/index.mjs';

describe('AnswerIconSettings', () => {
  expectType<AnswerIconSettings, Record<AnswerIconId, AnswerIconSetting>>('=');

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
        answerIconSettingsDefaultValue,
      );
    });
  });
});
