import { expectType } from 'ts-data-forge';
import { AnswerId, Weight } from '../named-primitive-types.mjs';
import { type AnswerSelection } from './answer-selection.mjs';
import { ANSWER_KEY_CREATED_AT, Answer } from './answer.mjs';
import { User } from './base/index.mjs';

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
      id: AnswerId.cast(''),
      user: User.defaultValue,
      comment: '',
      selection: [],
      [ANSWER_KEY_CREATED_AT]: 0,
      weight: Weight.cast(1),
      isRequiredParticipants: false,
    } as const;

    assert.deepStrictEqual(Answer.defaultValue, defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(Answer.is(Answer.defaultValue));
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      assert.deepStrictEqual(Answer.fill({}), Answer.defaultValue);
    });
  });
});
