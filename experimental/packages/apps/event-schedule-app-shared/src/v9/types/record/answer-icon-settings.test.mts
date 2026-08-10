import { expectType } from '@noshiro/ts-utils';
import { type AnswerIconId } from '../enum/index.mjs';
import { AnswerIconSettings } from './answer-icon-settings.mjs';
import { type AnswerIconSetting } from './base/index.mjs';

describe('AnswerIconSettings', () => {
  expectType<AnswerIconSettings, Record<AnswerIconId, AnswerIconSetting>>('=');

  test('defaultValue', () => {
    const defaultValue: AnswerIconSettings = {
      good: { description: '', point: 10 },
      fair: { description: '', point: 6 },
      poor: { description: '', point: 0 },
    };
    expect(AnswerIconSettings.defaultValue).toStrictEqual(defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      expect(AnswerIconSettings.is(AnswerIconSettings.defaultValue)).toBe(true);
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      expect(AnswerIconSettings.fill({})).toStrictEqual(
        AnswerIconSettings.defaultValue,
      );
    });
  });
});
