import {
  answerIconSettingDefaultValue,
  fillAnswerIconSetting,
  isAnswerIconSetting,
} from './answer-icon-setting.mjs';

describe('isAnswerIconSetting', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isAnswerIconSetting(answerIconSettingDefaultValue));
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
