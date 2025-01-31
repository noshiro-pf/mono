import * as t from '@noshiro/io-ts';
import { AnswerId, Weight } from '../named-primitive-types.mjs';
import { AnswerSelection } from './answer-selection.mjs';
import { User } from './base/index.mjs';

export const Answer = t.record({
  id: AnswerId,
  user: User,
  comment: t.string(''),
  selection: t.array(AnswerSelection),
  weight: Weight,
  isRequiredParticipants: t.boolean(false),
  /** Unix time (milliseconds) */
  createdAt: t.number(0),
  /** Unix time (milliseconds) */
  updatedAt: t.number(0),
});

export type Answer = t.TypeOf<typeof Answer>;
