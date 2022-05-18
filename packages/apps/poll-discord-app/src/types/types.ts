import type { Client as _PsqlClient } from 'pg';
import type { psqlRowType } from '../constants';
import type { Database } from './database';

export type PollId = string;
export const createPollId = (id: string): PollId => id;
export const isPollId = isString;

export type DateOptionId = string;
export const createDateOptionId = (id: string): DateOptionId => id;
export const isDateOptionId = isString;

export type CommandMessageId = string;
export const createCommandMessageId = (id: string): CommandMessageId => id;
export const isCommandMessageId = isString;

export type TitleMessageId = string;
export const createTitleMessageId = (id: string): TitleMessageId => id;
export const isTitleMessageId = isString;

export type UserId = string;
export const createUserId = (id: string): UserId => id;
export const isUserId = isString;

export type Timestamp = number;
export const createTimestamp = (id: number): Timestamp => id;
export const isTimestamp = isNumber;

export type AnswerType = 'fair' | 'good' | 'poor';

export const isAnswerType = (a: unknown): a is AnswerType =>
  a === 'fair' || a === 'poor' || a === 'good';

export type DatabaseRef = Readonly<{ db: Database }>;
export type DatabaseMutRef = { db: Database };

export type PsqlRow = {
  [psqlRowType.id]: string;
  [psqlRowType.data]: JSONType;
  [psqlRowType.updated_at]: string;
};

export type PsqlClient = DeepReadonly<_PsqlClient>;
