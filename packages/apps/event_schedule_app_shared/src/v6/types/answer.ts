import { assertType, IDate } from '@noshiro/ts-utils';
import type { AnswerId, PartialUser, User, Weight } from '../../v5';
import { ANSWER_KEY_CREATED_AT, fillUser, userDefaultValue } from '../../v5';
import type {
  AnswerSelection,
  PartialAnswerSelection,
} from './answer-selection';
import { fillAnswerSelection } from './answer-selection';

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
  [ANSWER_KEY_CREATED_AT]: IDate.now(),
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
