import {
  answerIconSettingsDefaultValue,
  fillAnswerIconSettings,
  isAnswerIconSettings,
} from './answer-icon-settings.mjs';

describe('isAnswerIconSettings', () => {
  test('defaultValue should be true', () => {
    expect(isAnswerIconSettings(answerIconSettingsDefaultValue)).toBe(true);
  });
});

describe('fillAnswerIconSettings', () => {
  test('defaultValue should be true', () => {
    expect(fillAnswerIconSettings({})).toStrictEqual(
      answerIconSettingsDefaultValue,
    );
  });
});
