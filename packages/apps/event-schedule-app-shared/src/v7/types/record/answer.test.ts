import { assertType } from '@noshiro/ts-utils';
import type { AnswerId, Weight } from '../named-primitive-types';
import type { Answer } from './answer';
import {
  answerDefaultValue,
  ANSWER_KEY_CREATED_AT,
  fillAnswer,
  isAnswer,
} from './answer';
import type { AnswerSelection } from './answer-selection';
import type { User } from './base';
import { userDefaultValue } from './base';

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
