import type { AnswerId, UserName, Weight } from '../phantom';
import { createAnswerId, createUserName, createWeight } from '../phantom';
import type {
  AnswerSelection,
  PartialAnswerSelection,
} from './answer-selection';
import { fillAnswerSelection } from './answer-selection';

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
  Readonly<{
    id: Answer['id'];
    userName: Answer['userName'];
    comment: Answer['comment'];
    selection: readonly PartialAnswerSelection[];
    [ANSWER_KEY_CREATED_AT]: Answer[typeof ANSWER_KEY_CREATED_AT];
    useWeight: Answer['useWeight'];
    weight: Answer['weight'];
    isRequiredParticipants: Answer['isRequiredParticipants'];
  }>
>;

export const defaultAnswer: Answer = {
  id: createAnswerId(''),
  userName: createUserName(''),
  comment: '',
  selection: [],
  [ANSWER_KEY_CREATED_AT]: Date.now(),
  useWeight: false,
  weight: createWeight(1),
  isRequiredParticipants: false,
} as const;

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
