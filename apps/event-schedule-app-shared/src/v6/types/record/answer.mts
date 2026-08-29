import {
  Arr,
  hasKey,
  isBoolean,
  isNumber,
  isRecord,
  isString,
} from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import { hasKeyValue } from '../../../utils/index.mjs';
import {
  isAnswerId,
  isWeight,
  type AnswerId,
  type Weight,
} from '../named-primitive-types.mjs';
import {
  fillAnswerSelection,
  isAnswerSelection,
  type AnswerSelection,
} from './answer-selection.mjs';
import {
  fillUser,
  isUser,
  userDefaultValue,
  type User,
} from './base/index.mjs';

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
  hasKeyValue(a, 'id', isAnswerId) &&
  hasKeyValue(a, 'user', isUser) &&
  hasKeyValue(a, 'comment', isString) &&
  hasKeyValue(
    a,
    'selection',
    (e: unknown): e is readonly AnswerSelection[] =>
      Arr.isArray(e) && e.every(isAnswerSelection),
  ) &&
  hasKeyValue(a, ANSWER_KEY_CREATED_AT, isNumber) &&
  hasKeyValue(a, 'weight', isWeight) &&
  hasKeyValue(a, 'isRequiredParticipants', isBoolean);

const d = answerDefaultValue;

export const fillAnswer = (a?: unknown): Answer =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        id: hasKeyValue(a, 'id', isAnswerId) ? a.id : d.id,

        user: hasKey(a, 'user') ? fillUser(a.user) : d.user,

        comment: hasKeyValue(a, 'comment', isString) ? a.comment : d.comment,

        selection:
          hasKey(a, 'selection') && Arr.isArray(a.selection)
            ? a.selection.map(fillAnswerSelection)
            : d.selection,

        [ANSWER_KEY_CREATED_AT]: hasKeyValue(a, ANSWER_KEY_CREATED_AT, isNumber)
          ? a[ANSWER_KEY_CREATED_AT]
          : d[ANSWER_KEY_CREATED_AT],

        weight: hasKeyValue(a, 'weight', isWeight) ? a.weight : d.weight,

        isRequiredParticipants: hasKeyValue(
          a,
          'isRequiredParticipants',
          isBoolean,
        )
          ? a.isRequiredParticipants
          : d.isRequiredParticipants,
      } as const);
