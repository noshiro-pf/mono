import { DateUtils, expectType } from '@noshiro/ts-utils';
import {
  ANSWER_KEY_CREATED_AT,
  fillAnswerSelection,
  type AnswerSelection,
  type PartialAnswerSelection,
} from '../../../v4/index.mjs';
import { type AnswerId, type Weight } from '../named-primitive-types.mjs';
import {
  fillUser,
  userDefaultValue,
  type PartialUser,
  type User,
} from './base/index.mjs';

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

expectType<keyof Answer, keyof PartialAnswer>('=');
expectType<Answer, PartialAnswer>('<=');

export const answerDefaultValue = {
  id: '',
  user: userDefaultValue,
  comment: '',
  selection: [],
  [ANSWER_KEY_CREATED_AT]: DateUtils.now(),
  weight: 1,
  isRequiredParticipants: false,
} as const satisfies Answer;

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
