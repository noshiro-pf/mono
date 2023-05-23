import {
  DateUtils,
  isBoolean,
  isNumber,
  isRecord,
  isString,
  Obj,
} from '@noshiro/ts-utils';
import {
  isAnswerId,
  isWeight,
  type AnswerId,
  type Weight,
} from '../named-primitive-types';
import {
  fillAnswerSelection,
  isAnswerSelection,
  type AnswerSelection,
} from './answer-selection';
import { fillUser, isUser, userDefaultValue, type User } from './base';

export const ANSWER_KEY_CREATED_AT = 'createdAt';

export type Answer = Readonly<{
  id: AnswerId;
  user: User;
  comment: string;
  selection: readonly AnswerSelection[];
  [ANSWER_KEY_CREATED_AT]: number;
  weight: Weight;
  isRequiredParticipants: boolean;
}>;

export const answerDefaultValue = {
  id: '',
  user: userDefaultValue,
  comment: '',
  selection: [],
  [ANSWER_KEY_CREATED_AT]: DateUtils.now(),
  weight: 1,
  isRequiredParticipants: false,
} as const satisfies Answer;

export const isAnswer = (a: unknown): a is Answer =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'id', isAnswerId) &&
  Obj.hasKeyValue(a, 'user', isUser) &&
  Obj.hasKeyValue(a, 'comment', isString) &&
  Obj.hasKeyValue(
    a,
    'selection',
    (e: unknown): e is AnswerSelection[] =>
      Array.isArray(e) && e.every(isAnswerSelection)
  ) &&
  Obj.hasKeyValue(a, ANSWER_KEY_CREATED_AT, isNumber) &&
  Obj.hasKeyValue(a, 'weight', isWeight) &&
  Obj.hasKeyValue(a, 'isRequiredParticipants', isBoolean);

const d = answerDefaultValue;

export const fillAnswer = (a?: unknown): Answer =>
  a === undefined || !isRecord(a)
    ? d
    : {
        id: Obj.hasKeyValue(a, 'id', isAnswerId) ? a.id : d.id,

        user: Object.hasOwn(a, 'user') ? fillUser(a.user) : d.user,

        comment: Obj.hasKeyValue(a, 'comment', isString)
          ? a.comment
          : d.comment,

        selection: Object.hasOwn(a, 'selection')
          ? Array.isArray(a.selection)
            ? a.selection.map(fillAnswerSelection)
            : d.selection
          : d.selection,

        [ANSWER_KEY_CREATED_AT]: Obj.hasKeyValue(
          a,
          ANSWER_KEY_CREATED_AT,
          isNumber
        )
          ? a[ANSWER_KEY_CREATED_AT]
          : d[ANSWER_KEY_CREATED_AT],

        weight: Obj.hasKeyValue(a, 'weight', isWeight) ? a.weight : d.weight,

        isRequiredParticipants: Obj.hasKeyValue(
          a,
          'isRequiredParticipants',
          isBoolean
        )
          ? a.isRequiredParticipants
          : d.isRequiredParticipants,
      };
