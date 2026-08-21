import { expectType } from 'ts-data-forge';
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
    } as const;

    assert.deepStrictEqual(AnswerIconSetting.defaultValue, defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(
        AnswerIconSetting.is({
          description: '',
          point: 0,
        }),
      );
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      assert.deepStrictEqual(
        AnswerIconSetting.fill({}),
        AnswerIconSetting.defaultValue,
      );
    });
  });
});
