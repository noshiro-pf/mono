import { expectType } from '@noshiro/ts-utils';
import { AnswerId, Weight } from '../named-primitive-types.mjs';
import { type AnswerSelection } from './answer-selection.mjs';
import { Answer } from './answer.mjs';
import { User } from './base/index.mjs';

describe('Answer', () => {
  expectType<
    Answer,
    Readonly<{
      id: AnswerId;
      user: User;
      comment: string;
      selection: readonly AnswerSelection[];
      createdAt: number;
      updatedAt: number;
      weight: Weight;
      isRequiredParticipants: boolean;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: Answer = {
      id: AnswerId.cast(''),
      user: User.defaultValue,
      comment: '',
      selection: [],
      createdAt: 0,
      updatedAt: 0,
      weight: Weight.cast(1),
      isRequiredParticipants: false,
    };
    expect(Answer.defaultValue).toStrictEqual(defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      expect(Answer.is(Answer.defaultValue)).toBe(true);
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      expect(Answer.fill({})).toStrictEqual(Answer.defaultValue);
    });
  });
});
