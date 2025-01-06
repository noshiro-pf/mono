import { expectType } from '@noshiro/ts-utils';
import { type AnswerIconPoint } from '../../enum/index.mjs';
import { AnswerIconSetting } from './answer-icon-setting.mjs';

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
    expect(AnswerIconSetting.defaultValue).toStrictEqual(defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      expect(
        AnswerIconSetting.is({
          description: '',
          point: 0,
        }),
      ).toBe(true);
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      expect(AnswerIconSetting.fill({})).toStrictEqual(
        AnswerIconSetting.defaultValue,
      );
    });
  });
});
