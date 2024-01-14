import { answerDefaultValue, fillAnswer, isAnswer } from './answer.mjs';

describe('isAnswer', () => {
  test('defaultValue should be true', () => {
    expect(isAnswer(answerDefaultValue)).toBe(true);
  });
});

describe('fillAnswer', () => {
  test('defaultValue should be true', () => {
    expect(fillAnswer({})).toStrictEqual(answerDefaultValue);
  });
});
