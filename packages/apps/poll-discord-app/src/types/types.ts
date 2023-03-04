import * as t from '@noshiro/io-ts';
import { DateUtils } from '@noshiro/ts-utils';
import { type Client as _PsqlClient } from 'pg';
import { type psqlRowType } from '../constants';
import { type Database } from './database';

export const pollIdType = t.string('');
export type PollId = t.TypeOf<typeof pollIdType>;
export const toPollId = (id: string): PollId => id;

export const dateOptionIdType = t.string('');
export type DateOptionId = t.TypeOf<typeof dateOptionIdType>;
export const toDateOptionId = (id: string): DateOptionId => id;

export const commandMessageIdType = t.string('');
export type CommandMessageId = t.TypeOf<typeof commandMessageIdType>;
export const toCommandMessageId = (id: string): CommandMessageId => id;

export const titleMessageIdType = t.string('');
export type TitleMessageId = t.TypeOf<typeof titleMessageIdType>;
export const toTitleMessageId = (id: string): TitleMessageId => id;

export const userIdType = t.string('');
export type UserId = t.TypeOf<typeof userIdType>;
export const toUserId = (id: string): UserId => id;

export const timestampType = t.number(DateUtils.now());
export type Timestamp = t.TypeOf<typeof timestampType>;
export const toTimestamp = (id: number): Timestamp => id;

export type AnswerType = 'fair' | 'good' | 'poor';

export type DatabaseRef = Readonly<{ db: Database }>;
export type DatabaseMutRef = { db: Database };

export type PsqlRow = {
  [psqlRowType.id]: string;
  [psqlRowType.data]: JSONType;
  [psqlRowType.updated_at]: string;
};

export type PsqlClient = DeepReadonly<_PsqlClient>;
