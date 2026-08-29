import { expectType } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type AnswerIconId } from '../enum/index.mjs';
import { AnswerIconSettings } from './answer-icon-settings.mjs';
import { type AnswerIconSetting } from './base/index.mjs';

describe('AnswerIconSettings', () => {
  expectType<
    AnswerIconSettings,
    ReadonlyRecord<AnswerIconId, AnswerIconSetting>
  >('=');

  test('defaultValue', () => {
    const defaultValue: AnswerIconSettings = {
      good: { description: '', point: 10 },
      fair: { description: '', point: 6 },
      poor: { description: '', point: 0 },
    } as const;

    assert.deepStrictEqual(AnswerIconSettings.defaultValue, defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(AnswerIconSettings.is(AnswerIconSettings.defaultValue));
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      assert.deepStrictEqual(
        AnswerIconSettings.fill({}),
        AnswerIconSettings.defaultValue,
      );
    });
  });
});
