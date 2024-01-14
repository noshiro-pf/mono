import * as t from '@noshiro/io-ts';
import { answerIdTypeDef, weightTypeDef } from '../named-primitive-types.mjs';
import { answerSelectionTypeDef } from './answer-selection.mjs';
import { userTypeDef } from './base/index.mjs';

export const ANSWER_KEY_CREATED_AT = 'createdAt';

export const answerTypeDef = t.record({
  id: answerIdTypeDef,
  user: userTypeDef,
  comment: t.string(''),
  selection: t.array(answerSelectionTypeDef),
  [ANSWER_KEY_CREATED_AT]: t.number(0),
  weight: weightTypeDef,
  isRequiredParticipants: t.boolean(false),
});

export type Answer = t.TypeOf<typeof answerTypeDef>;

export const answerDefaultValue = answerTypeDef.defaultValue;

export const isAnswer = answerTypeDef.is;

export const fillAnswer = answerTypeDef.fill;
