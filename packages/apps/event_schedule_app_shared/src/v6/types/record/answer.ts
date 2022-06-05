import {
  IDate,
  IList,
  IRecord,
  isBoolean,
  isNumber,
  isRecord,
  isString,
} from '@noshiro/ts-utils';
import type { AnswerId, Weight } from '../named-primitive-types';
import { isAnswerId, isWeight } from '../named-primitive-types';
import type { AnswerSelection } from './answer-selection';
import { fillAnswerSelection, isAnswerSelection } from './answer-selection';
import type { User } from './base';
import { fillUser, isUser, userDefaultValue } from './base';

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

export const answerDefaultValue: Answer = {
  id: '',
  user: userDefaultValue,
  comment: '',
  selection: [],
  [ANSWER_KEY_CREATED_AT]: IDate.now(),
  weight: 1,
  isRequiredParticipants: false,
} as const;

export const isAnswer = (a: unknown): a is Answer =>
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'id', isAnswerId) &&
  IRecord.hasKeyValue(a, 'user', isUser) &&
  IRecord.hasKeyValue(a, 'comment', isString) &&
  IRecord.hasKeyValue(
    a,
    'selection',
    (e: unknown): e is AnswerSelection[] =>
      IList.isArray(e) && e.every(isAnswerSelection)
  ) &&
  IRecord.hasKeyValue(a, ANSWER_KEY_CREATED_AT, isNumber) &&
  IRecord.hasKeyValue(a, 'weight', isWeight) &&
  IRecord.hasKeyValue(a, 'isRequiredParticipants', isBoolean);

const d = answerDefaultValue;

export const fillAnswer = (a?: unknown): Answer =>
  a === undefined || !isRecord(a)
    ? d
    : {
        id: IRecord.hasKeyValue(a, 'id', isAnswerId) ? a.id : d.id,

        user: IRecord.hasKey(a, 'user') ? fillUser(a.user) : d.user,

        comment: IRecord.hasKeyValue(a, 'comment', isString)
          ? a.comment
          : d.comment,

        selection: IRecord.hasKey(a, 'selection')
          ? IList.isArray(a.selection)
            ? a.selection.map(fillAnswerSelection)
            : d.selection
          : d.selection,

        [ANSWER_KEY_CREATED_AT]: IRecord.hasKeyValue(
          a,
          ANSWER_KEY_CREATED_AT,
          isNumber
        )
          ? a[ANSWER_KEY_CREATED_AT]
          : d[ANSWER_KEY_CREATED_AT],

        weight: IRecord.hasKeyValue(a, 'weight', isWeight)
          ? a.weight
          : d.weight,

        isRequiredParticipants: IRecord.hasKeyValue(
          a,
          'isRequiredParticipants',
          isBoolean
        )
          ? a.isRequiredParticipants
          : d.isRequiredParticipants,
      };
