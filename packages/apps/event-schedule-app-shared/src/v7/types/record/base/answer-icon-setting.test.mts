import { expectType } from '@noshiro/ts-utils';
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
    };
    expect(answerIconSettingDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isAnswerIconSetting', () => {
    test('defaultValue should be true', () => {
      expect(
        isAnswerIconSetting({
          description: '',
          point: 0,
        }),
      ).toBe(true);
    });
  });

  describe('fillAnswerIconSetting', () => {
    test('defaultValue should be true', () => {
      expect(fillAnswerIconSetting({})).toStrictEqual(
        answerIconSettingDefaultValue,
      );
    });
  });
});
