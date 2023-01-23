import { assertType } from '@noshiro/ts-utils';
import { type AnswerId, type Weight } from '../named-primitive-types';
import {
  answerDefaultValue,
  ANSWER_KEY_CREATED_AT,
  fillAnswer,
  isAnswer,
  type Answer,
} from './answer';
import { type AnswerSelection } from './answer-selection';
import { userDefaultValue, type User } from './base';

describe('Answer', () => {
  assertType<
    TypeEq<
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
    >
  >();

  test('defaultValue', () => {
    const defaultValue: Answer = {
      id: '',
      user: userDefaultValue,
      comment: '',
      selection: [],
      [ANSWER_KEY_CREATED_AT]: 0,
      weight: 1,
      isRequiredParticipants: false,
    };
    expect(answerDefaultValue).toStrictEqual(defaultValue);
  });

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
});
