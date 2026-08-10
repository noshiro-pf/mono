import { DateUtils } from '@noshiro/ts-utils';
import {
  createAnswerId,
  createUserName,
  createWeight,
  type AnswerId,
  type UserName,
  type Weight,
} from '../phantom.mjs';
import {
  fillAnswerSelection,
  type AnswerSelection,
  type PartialAnswerSelection,
} from './answer-selection.mjs';

export const ANSWER_KEY_CREATED_AT = 'createdAt';

export type Answer = Readonly<{
  id: AnswerId;
  userName: UserName;
  comment: string;
  selection: readonly AnswerSelection[];
  [ANSWER_KEY_CREATED_AT]: number;
  useWeight: boolean;
  weight: Weight;
  isRequiredParticipants: boolean;
}>;

export type PartialAnswer = Partial<
  MergeIntersection<
    Pick<
      Answer,
      | 'comment'
      | 'id'
      | 'isRequiredParticipants'
      | 'userName'
      | 'useWeight'
      | 'weight'
    > &
      Readonly<{
        selection: readonly PartialAnswerSelection[];
        [ANSWER_KEY_CREATED_AT]: Answer[typeof ANSWER_KEY_CREATED_AT];
      }>
  >
>;

export const defaultAnswer = {
  id: createAnswerId(''),
  userName: createUserName(''),
  comment: '',
  selection: [],
  [ANSWER_KEY_CREATED_AT]: DateUtils.now(),
  useWeight: false,
  weight: createWeight(1),
  isRequiredParticipants: false,
} as const satisfies Answer;

const d = defaultAnswer;
export const fillAnswer = (p?: PartialAnswer): Answer => ({
  id: p?.id ?? d.id,
  userName: p?.userName ?? d.userName,
  comment: p?.comment ?? d.comment,
  selection: (p?.selection ?? d.selection).map(fillAnswerSelection),
  [ANSWER_KEY_CREATED_AT]:
    (p === undefined ? undefined : p[ANSWER_KEY_CREATED_AT]) ??
    d[ANSWER_KEY_CREATED_AT],
  useWeight: p?.useWeight ?? d.useWeight,
  weight: p?.weight ?? d.weight,
  isRequiredParticipants: p?.isRequiredParticipants ?? d.isRequiredParticipants,
});
