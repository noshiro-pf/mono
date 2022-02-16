import { assertType } from '@noshiro/ts-utils';
import type { AnswerSelection, PartialAnswerSelection } from '../../../v4';
import { ANSWER_KEY_CREATED_AT, fillAnswerSelection } from '../../../v4';
import type { AnswerId, Weight } from '../named-primitive-types';
import type { PartialUser, User } from './base';
import { fillUser, userDefaultValue } from './base';

export type Answer = Readonly<{
  id: AnswerId;
  user: User;
  comment: string;
  selection: readonly AnswerSelection[];
  [ANSWER_KEY_CREATED_AT]: number;
  weight: Weight;
  isRequiredParticipants: boolean;
}>;

export type PartialAnswer = Partial<
  MergeIntersection<
    Pick<Answer, 'comment' | 'id' | 'isRequiredParticipants' | 'weight'> &
      Readonly<{
        user: PartialUser;
        selection: readonly PartialAnswerSelection[];
        [ANSWER_KEY_CREATED_AT]: Answer[typeof ANSWER_KEY_CREATED_AT];
      }>
  >
>;

assertType<TypeEq<keyof Answer, keyof PartialAnswer>>();
assertType<TypeExtends<Answer, PartialAnswer>>();

export const answerDefaultValue: Answer = {
  id: '',
  user: userDefaultValue,
  comment: '',
  selection: [],
  [ANSWER_KEY_CREATED_AT]: Date.now(),
  weight: 1,
  isRequiredParticipants: false,
} as const;

const d = answerDefaultValue;
export const fillAnswer = (p?: PartialAnswer): Answer => ({
  id: p?.id ?? d.id,
  user: fillUser(p?.user ?? d.user),
  comment: p?.comment ?? d.comment,
  selection: (p?.selection ?? d.selection).map(fillAnswerSelection),
  [ANSWER_KEY_CREATED_AT]:
    (p === undefined ? undefined : p[ANSWER_KEY_CREATED_AT]) ??
    d[ANSWER_KEY_CREATED_AT],
  weight: p?.weight ?? d.weight,
  isRequiredParticipants: p?.isRequiredParticipants ?? d.isRequiredParticipants,
});
