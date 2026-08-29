import {
  answerIconSettingsDefaultValue,
  fillAnswerIconSettings,
  isAnswerIconSettings,
} from './answer-icon-settings.mjs';

describe('isAnswerIconSettings', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isAnswerIconSettings(answerIconSettingsDefaultValue));
  });
});

describe('fillAnswerIconSettings', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(
      fillAnswerIconSettings({}),
      answerIconSettingsDefaultValue,
    );
  });
});
