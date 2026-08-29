import {
  answerSelectionDefaultValue,
  fillAnswerSelection,
  isAnswerSelection,
} from './answer-selection.mjs';

describe('isAnswerSelection', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isAnswerSelection(answerSelectionDefaultValue));
  });
});

describe('fillAnswerSelection', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(
      fillAnswerSelection({}),
      answerSelectionDefaultValue,
    );
  });
});
