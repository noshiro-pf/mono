import { expectType } from 'ts-data-forge';
import { type AnswerIconPoint } from '../../enum/index.mjs';
import {
  answerIconSettingDefaultValue,
  fillAnswerIconSetting,
  isAnswerIconSetting,
  type AnswerIconSetting,
} from './answer-icon-setting.mjs';

describe('AnswerIconSetting', () => {
  expectType<
    AnswerIconSetting,
    Readonly<{
      description: string;
      point: AnswerIconPoint;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: AnswerIconSetting = {
      description: '',
      point: 0,
    } as const;

    assert.deepStrictEqual(answerIconSettingDefaultValue, defaultValue);
  });

  describe('isAnswerIconSetting', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(
        isAnswerIconSetting({
          description: '',
          point: 0,
        }),
      );
    });
  });

  describe('fillAnswerIconSetting', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(
        fillAnswerIconSetting({}),
        answerIconSettingDefaultValue,
      );
    });
  });
});
