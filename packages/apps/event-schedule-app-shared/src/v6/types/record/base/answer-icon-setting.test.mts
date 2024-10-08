import {
  answerIconSettingDefaultValue,
  fillAnswerIconSetting,
  isAnswerIconSetting,
} from './answer-icon-setting.mjs';

describe('isAnswerIconSetting', () => {
  test('defaultValue should be true', () => {
    expect(isAnswerIconSetting(answerIconSettingDefaultValue)).toBe(true);
  });
});

describe('fillAnswerIconSetting', () => {
  test('defaultValue should be true', () => {
    expect(fillAnswerIconSetting({})).toStrictEqual(
      answerIconSettingDefaultValue,
    );
  });
});
