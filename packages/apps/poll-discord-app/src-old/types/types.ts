import * as t from '@noshiro/io-ts';
import type { Client as _PsqlClient } from 'pg';
import type { psqlRowType } from '../constants';
import type { Database } from './database';

export const pollIdTypeDef = t.string('');
export type PollId = t.TypeOf<typeof pollIdTypeDef>;
export const createPollId = pollIdTypeDef.fill;
export const isPollId = pollIdTypeDef.is;

export const dateOptionIdTypeDef = t.string('');
export type DateOptionId = t.TypeOf<typeof dateOptionIdTypeDef>;
export const createDateOptionId = dateOptionIdTypeDef.fill;
export const isDateOptionId = dateOptionIdTypeDef.is;

export const commandMessageIdTypeDef = t.string('');
export type CommandMessageId = t.TypeOf<typeof commandMessageIdTypeDef>;
export const createCommandMessageId = commandMessageIdTypeDef.fill;
export const isCommandMessageId = commandMessageIdTypeDef.is;

export const titleMessageIdTypeDef = t.string('');
export type TitleMessageId = t.TypeOf<typeof titleMessageIdTypeDef>;
export const createTitleMessageId = titleMessageIdTypeDef.fill;
export const isTitleMessageId = titleMessageIdTypeDef.is;

export const userIdTypeDef = t.string('');
export type UserId = t.TypeOf<typeof userIdTypeDef>;
export const createUserId = userIdTypeDef.fill;
export const isUserId = userIdTypeDef.is;

export const timestampTypeDef = t.number(0);
export type Timestamp = t.TypeOf<typeof timestampTypeDef>;
export const createTimestamp = timestampTypeDef.fill;
export const isTimestamp = timestampTypeDef.is;

export const answerTypeTypeDef = t.enumType({
  values: ['fair', 'good', 'poor'],
  defaultValue: 'poor',
});

export type AnswerType = t.TypeOf<typeof answerTypeTypeDef>;

export const isAnswerType = answerTypeTypeDef.is;

export type DatabaseRef = Readonly<{ db: Database }>;
export type DatabaseMutRef = { db: Database };

export type PsqlRow = {
  [psqlRowType.id]: string;
  [psqlRowType.data]: JSONType;
  [psqlRowType.updated_at]: string;
};

export type PsqlClient = DeepReadonly<_PsqlClient>;
