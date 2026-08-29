import { answerDefaultValue, fillAnswer, isAnswer } from './answer.mjs';

describe('isAnswer', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isAnswer(answerDefaultValue));
  });
});

describe('fillAnswer', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(fillAnswer({}), answerDefaultValue);
  });
});
