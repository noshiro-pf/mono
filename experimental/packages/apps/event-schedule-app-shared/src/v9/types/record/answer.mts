import * as t from '@noshiro/io-ts';
import { AnswerId, Weight } from '../named-primitive-types.mjs';
import { AnswerSelection } from './answer-selection.mjs';
import { User } from './base/index.mjs';

export const ANSWER_KEY_CREATED_AT = 'createdAt';

export const Answer = t.record({
  id: AnswerId,
  user: User,
  comment: t.string(''),
  selection: t.array(AnswerSelection),
  [ANSWER_KEY_CREATED_AT]: t.number(0),
  weight: Weight,
  isRequiredParticipants: t.boolean(false),
});

export type Answer = t.TypeOf<typeof Answer>;
