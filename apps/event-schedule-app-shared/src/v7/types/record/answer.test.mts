import { expectType } from 'ts-data-forge';
import {
  toAnswerId,
  toWeight,
  type AnswerId,
  type Weight,
} from '../named-primitive-types.mjs';
import { type AnswerSelection } from './answer-selection.mjs';
import {
  ANSWER_KEY_CREATED_AT,
  answerDefaultValue,
  fillAnswer,
  isAnswer,
  type Answer,
} from './answer.mjs';
import { userDefaultValue, type User } from './base/index.mjs';

describe('Answer', () => {
  expectType<
    Answer,
    Readonly<{
      id: AnswerId;
      user: User;
      comment: string;
      selection: readonly AnswerSelection[];
      [ANSWER_KEY_CREATED_AT]: number;
      weight: Weight;
      isRequiredParticipants: boolean;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: Answer = {
      id: toAnswerId(''),
      user: userDefaultValue,
      comment: '',
      selection: [],
      [ANSWER_KEY_CREATED_AT]: 0,
      weight: toWeight(1),
      isRequiredParticipants: false,
    } as const;

    assert.deepStrictEqual(answerDefaultValue, defaultValue);
  });

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
});
