import { assertType } from '@noshiro/ts-utils';
import { type AnswerIconPoint } from '../../enum';
import {
  answerIconSettingDefaultValue,
  fillAnswerIconSetting,
  isAnswerIconSetting,
  type AnswerIconSetting,
} from './answer-icon-setting';

describe('AnswerIconSetting', () => {
  assertType<
    TypeEq<
      AnswerIconSetting,
      Readonly<{
        description: string;
        point: AnswerIconPoint;
      }>
    >
  >();

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
        })
      ).toBe(true);
    });
  });

  describe('fillAnswerIconSetting', () => {
    test('defaultValue should be true', () => {
      expect(fillAnswerIconSetting({})).toStrictEqual(
        answerIconSettingDefaultValue
      );
    });
  });
});
